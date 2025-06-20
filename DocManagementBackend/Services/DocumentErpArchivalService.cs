using DocManagementBackend.Data;
using DocManagementBackend.Models;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;
using System.Net;

namespace DocManagementBackend.Services
{
    public interface IDocumentErpArchivalService
    {
        Task<bool> ArchiveDocumentToErpAsync(int documentId);
        Task<bool> IsDocumentArchived(int documentId);
        Task<bool> CreateDocumentLinesInErpAsync(int documentId);
    }

    public class DocumentErpArchivalService : IDocumentErpArchivalService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DocumentErpArchivalService> _logger;
        private readonly HttpClient _httpClient;
        private readonly string _username;
        private readonly string _password;
        private readonly string _domain;
        private readonly string _workstation;

        private readonly IServiceProvider _serviceProvider;

        public DocumentErpArchivalService(
            ApplicationDbContext context,
            ILogger<DocumentErpArchivalService> logger,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            IServiceProvider serviceProvider)
        {
            _context = context;
            _serviceProvider = serviceProvider;
            _logger = logger;
            
            // Get NTLM credentials from configuration
            _username = configuration["BCApi:Username"] ?? throw new InvalidOperationException("BCApi:Username not configured");
            _password = configuration["BCApi:Password"] ?? throw new InvalidOperationException("BCApi:Password not configured");
            _domain = configuration["BCApi:Domain"] ?? "";
            _workstation = configuration["BCApi:Workstation"] ?? "";

            // Create HttpClient with NTLM authentication
            var handler = new HttpClientHandler()
            {
                Credentials = new NetworkCredential(_username, _password, _domain)
            };
            _httpClient = new HttpClient(handler);
            ConfigureHttpClient();
        }

        private void ConfigureHttpClient()
        {
            try
            {
                _logger.LogInformation("Configuring HTTP client for ERP archival - Username: {Username}, Domain: {Domain}", 
                    _username, _domain);
                
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "DocVerse-ErpArchival/1.0");
                _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
                _httpClient.Timeout = TimeSpan.FromMinutes(5); // 5 minute timeout for ERP calls
                
                _logger.LogInformation("HTTP client configured successfully for NTLM authentication");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error configuring HTTP client for ERP archival");
                throw;
            }
        }

        public async Task<bool> ArchiveDocumentToErpAsync(int documentId)
        {
            // Use a new scope and context to avoid Entity Framework concurrency issues
            using var scope = _serviceProvider.CreateScope();
            using var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            try
            {
                _logger.LogInformation("Starting ERP archival for document ID: {DocumentId}", documentId);

                // Check if document is already archived
                var existingDocument = await context.Documents
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.Id == documentId);
                    
                if (existingDocument != null && !string.IsNullOrEmpty(existingDocument.ERPDocumentCode))
                {
                    _logger.LogWarning("Document {DocumentId} is already archived to ERP", documentId);
                    
                    // Check if lines need to be created
                    await CreateDocumentLinesInErpAsync(documentId);
                    
                    return true; // Return true for idempotency
                }

                // Get document with all necessary relationships
                var document = await context.Documents
                    .Include(d => d.DocumentType)
                    .Include(d => d.ResponsibilityCentre)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                {
                    _logger.LogError("Document {DocumentId} not found for ERP archival", documentId);
                    return false;
                }

                // Build the API request payload
                var payload = await BuildErpPayload(document);
                
                // Make the API call to Business Center
                var erpDocumentCode = await CallBusinessCenterApi(payload);
                
                if (!string.IsNullOrEmpty(erpDocumentCode))
                {
                    // Update document with ERP document code (status already set by workflow)
                    document.ERPDocumentCode = erpDocumentCode;
                    document.UpdatedAt = DateTime.UtcNow;
                    
                    await context.SaveChangesAsync();
                    
                    _logger.LogInformation("Document {DocumentId} successfully archived to ERP with code: {ErpCode}", 
                        documentId, erpDocumentCode);
                    
                    // Now create the document lines in ERP
                    await CreateDocumentLinesInErpAsync(documentId);
                    
                    return true;
                }
                
                _logger.LogError("Failed to archive document {DocumentId} to ERP - no document code returned", documentId);
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error archiving document {DocumentId} to ERP: {Error}", documentId, ex.Message);
                return false;
            }
        }

        public async Task<bool> CreateDocumentLinesInErpAsync(int documentId)
        {
            using var scope = _serviceProvider.CreateScope();
            using var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            try
            {
                _logger.LogInformation("Starting ERP line creation for document ID: {DocumentId}", documentId);

                // Get document with all necessary relationships
                var document = await context.Documents
                    .Include(d => d.DocumentType)
                    .Include(d => d.Lignes)
                        .ThenInclude(l => l.LignesElementType)
                    .Include(d => d.Lignes)
                        .ThenInclude(l => l.Location)
                    .Include(d => d.Lignes)
                        .ThenInclude(l => l.Unit)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                {
                    _logger.LogError("Document {DocumentId} not found for ERP line creation", documentId);
                    return false;
                }

                if (string.IsNullOrEmpty(document.ERPDocumentCode))
                {
                    _logger.LogError("Document {DocumentId} is not archived to ERP (missing ERPDocumentCode)", documentId);
                    return false;
                }

                if (!document.Lignes.Any())
                {
                    _logger.LogInformation("Document {DocumentId} has no lines to create in ERP", documentId);
                    return true; // No lines to create is considered success
                }

                var successCount = 0;
                var errorCount = 0;

                // Process each line
                foreach (var ligne in document.Lignes)
                {
                    try
                    {
                        // Skip if line is already in ERP
                        if (!string.IsNullOrEmpty(ligne.ERPLineCode))
                        {
                            _logger.LogInformation("Line {LigneId} already exists in ERP with code: {ErpLineCode}", 
                                ligne.Id, ligne.ERPLineCode);
                            successCount++;
                            continue;
                        }

                        // Load element data for the ligne
                        await ligne.LoadElementAsync(context);

                        // Build the line payload
                        var linePayload = await BuildErpLinePayload(document, ligne);
                        
                        // Make the API call to create the line
                        var erpLineCode = await CallBusinessCenterLineApi(linePayload);
                        
                        if (!string.IsNullOrEmpty(erpLineCode))
                        {
                            // Update ligne with ERP line code
                            ligne.ERPLineCode = erpLineCode;
                            ligne.UpdatedAt = DateTime.UtcNow;
                            successCount++;
                            
                            _logger.LogInformation("Line {LigneId} successfully created in ERP with code: {ErpLineCode}", 
                                ligne.Id, erpLineCode);
                        }
                        else
                        {
                            errorCount++;
                            _logger.LogError("Failed to create line {LigneId} in ERP - no line code returned", ligne.Id);
                        }
                    }
                    catch (Exception ex)
                    {
                        errorCount++;
                        _logger.LogError(ex, "Error creating line {LigneId} in ERP: {Error}", ligne.Id, ex.Message);
                    }
                }

                // Save all changes
                await context.SaveChangesAsync();

                _logger.LogInformation("ERP line creation completed for document {DocumentId}: {SuccessCount} successful, {ErrorCount} errors", 
                    documentId, successCount, errorCount);

                return errorCount == 0; // Return true only if all lines were created successfully
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating lines for document {DocumentId} in ERP: {Error}", documentId, ex.Message);
                return false;
            }
        }

        public async Task<bool> IsDocumentArchived(int documentId)
        {
            using var scope = _serviceProvider.CreateScope();
            using var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            var document = await context.Documents
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == documentId);
                
            return !string.IsNullOrEmpty(document?.ERPDocumentCode);
        }

        private async Task<object> BuildErpPayload(Document document)
        {
            // Determine tierType based on DocumentType.TierType
            int tierType = document.DocumentType?.TierType switch
            {
                TierType.None => 0,
                TierType.Customer => 1,
                TierType.Vendor => 2,
                _ => 0
            };

            // Get customer/vendor code from snapshot fields (more reliable than navigation properties)
            string custVendoNo = document.CustomerVendorCode ?? "";

            // Get responsibility centre code
            string responsabilityCentre = document.ResponsibilityCentre?.Code ?? "";

            // Format dates for API (ISO format)
            string documentDate = document.DocDate.ToString("yyyy-MM-dd");
            string postingDate = document.ComptableDate.ToString("yyyy-MM-dd");

            var payload = new
            {
                tierTYpe = tierType,
                type = document.DocumentType?.TypeNumber ?? 0,
                custVendoNo = custVendoNo,
                documentDate = documentDate,
                postingDate = postingDate,
                responsabilityCentre = responsabilityCentre,
                externalDocNo = document.DocumentExterne ?? ""
            };

            _logger.LogInformation("Built ERP payload for document {DocumentId}: TierType={TierType}, CustVendoNo={CustVendoNo}, Type={Type}", 
                document.Id, tierType, custVendoNo, document.DocumentType?.TypeNumber ?? 0);
            _logger.LogDebug("Full payload: {Payload}", JsonSerializer.Serialize(payload));

            return payload;
        }

        private async Task<object> BuildErpLinePayload(Document document, Ligne ligne)
        {
            // Determine tierType based on DocumentType.TierType
            int tierType = document.DocumentType?.TierType switch
            {
                TierType.None => 0,
                TierType.Customer => 1,
                TierType.Vendor => 2,
                _ => 0
            };

            // Determine line type: 1 = General Account, 2 = Item
            int type = ligne.LignesElementType?.TypeElement switch
            {
                ElementType.GeneralAccounts => 1,
                ElementType.Item => 2,
                _ => 1 // Default to General Account
            };

            // Get the code from the linked element (Item code or Account code)
            string codeLine = ligne.ElementId ?? "";

            // Get unit of measure code (only for Item types, fallback to item's default unit)
            string uniteOfMeasure = "";
            if (type == 2) // Item type
            {
                uniteOfMeasure = ligne.UnitCode ?? ligne.Item?.Unite ?? "";
            }

            var payload = new
            {
                tierTYpe = tierType,
                docType = document.DocumentType?.TypeNumber ?? 0,
                docNo = document.ERPDocumentCode ?? "",
                type = type,
                codeLine = codeLine,
                descriptionLine = ligne.Title ?? "",
                qty = ligne.Quantity,
                uniteOfMeasure = uniteOfMeasure,
                unitpriceCOst = ligne.PriceHT,
                discountAmt = ligne.DiscountAmount
            };

            _logger.LogInformation("Built ERP line payload for ligne {LigneId}: Type={Type}, CodeLine={CodeLine}, Qty={Qty}", 
                ligne.Id, type, codeLine, ligne.Quantity);
            _logger.LogDebug("Full line payload: {Payload}", JsonSerializer.Serialize(payload));

            return payload;
        }

        private async Task<string?> CallBusinessCenterApi(object payload)
        {
            const string apiEndpoint = "http://localhost:25048/BC250/ODataV4/APICreateDocVerse_CreateDoc?company=CRONUS%20France%20S.A.";
            
            try
            {
                var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _logger.LogInformation("Making POST request to BC API: {Endpoint}", apiEndpoint);
                _logger.LogDebug("Request payload: {Payload}", json);

                var response = await _httpClient.PostAsync(apiEndpoint, content);

                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("BC API call successful. Response: {Response}", responseContent);
                    
                    // The response should contain the document number
                    // Parse the response to extract the document code
                    if (!string.IsNullOrWhiteSpace(responseContent))
                    {
                        // If response is JSON, try to parse it
                        try
                        {
                            var responseObj = JsonSerializer.Deserialize<JsonElement>(responseContent);
                            if (responseObj.TryGetProperty("value", out var valueElement))
                            {
                                return valueElement.GetString();
                            }
                            // If it's just a string value, return it directly
                            return responseContent.Trim('"');
                        }
                        catch
                        {
                            // If not JSON, return the content as-is (cleaned)
                            return responseContent.Trim().Trim('"');
                        }
                    }
                    
                    return responseContent;
                }
                else
                {
                    _logger.LogError("BC API call failed with status {StatusCode}. Response: {Response}", 
                        response.StatusCode, responseContent);
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception calling BC API: {Error}", ex.Message);
                return null;
            }
        }

        private async Task<string?> CallBusinessCenterLineApi(object payload)
        {
            const string apiEndpoint = "http://localhost:25048/BC250/ODataV4/APICreateDocVerse_CreateDocLine?company=CRONUS%20France%20S.A.";
            
            try
            {
                var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _logger.LogInformation("Making POST request to BC Line API: {Endpoint}", apiEndpoint);
                _logger.LogDebug("Request line payload: {Payload}", json);

                var response = await _httpClient.PostAsync(apiEndpoint, content);

                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("BC Line API call successful. Response: {Response}", responseContent);
                    
                    // The response should contain the line number
                    // Parse the response to extract the line code
                    if (!string.IsNullOrWhiteSpace(responseContent))
                    {
                        // If response is JSON, try to parse it
                        try
                        {
                            var responseObj = JsonSerializer.Deserialize<JsonElement>(responseContent);
                            if (responseObj.TryGetProperty("value", out var valueElement))
                            {
                                return valueElement.GetString();
                            }
                            // If it's just a string value, return it directly
                            return responseContent.Trim('"');
                        }
                        catch
                        {
                            // If not JSON, return the content as-is (cleaned)
                            return responseContent.Trim().Trim('"');
                        }
                    }
                    
                    return responseContent;
                }
                else
                {
                    _logger.LogError("BC Line API call failed with status {StatusCode}. Response: {Response}", 
                        response.StatusCode, responseContent);
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception calling BC Line API: {Error}", ex.Message);
                return null;
            }
        }

        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
} 