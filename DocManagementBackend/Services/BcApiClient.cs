using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Net;
using DocManagementBackend.Models;

namespace DocManagementBackend.Services
{
    public interface IBcApiClient
    {
        Task<BcApiResponse<BcItemDto>?> GetItemsAsync();
        Task<BcApiResponse<BcGeneralAccountDto>?> GetGeneralAccountsAsync();
        Task<BcApiResponse<BcCustomerDto>?> GetCustomersAsync();
        Task<BcApiResponse<BcVendorDto>?> GetVendorsAsync();
        Task<BcApiResponse<BcLocationDto>?> GetLocationsAsync();
        Task<BcApiResponse<BcResponsibilityCentreDto>?> GetResponsibilityCentresAsync();
        Task<BcApiResponse<BcUnitOfMeasureDto>?> GetUnitOfMeasuresAsync();
        Task<BcApiResponse<BcItemUnitOfMeasureDto>?> GetItemUnitOfMeasuresAsync();
        Task<T?> GetDataAsync<T>(string endpoint) where T : class;
    }

    public class BcApiClient : IBcApiClient
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<BcApiClient> _logger;
        private readonly string _username;
        private readonly string _password;
        private readonly string _domain;
        private readonly string _workstation;

        public BcApiClient(HttpClient httpClient, ILogger<BcApiClient> logger, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _logger = logger;
            
            // Get authentication details from environment variables or configuration
            _username = Environment.GetEnvironmentVariable("USERNAME") ?? 
                       configuration["BcApi:Username"] ?? 
                       throw new InvalidOperationException("USERNAME not found in environment variables or configuration");
            
            _password = Environment.GetEnvironmentVariable("PASSWORD") ?? 
                       configuration["BcApi:Password"] ?? 
                       throw new InvalidOperationException("PASSWORD not found in environment variables or configuration");
            
            _domain = Environment.GetEnvironmentVariable("DOMAIN") ?? 
                     configuration["BcApi:Domain"] ?? 
                     "DESKTOP-8FCE015";
            
            _workstation = Environment.GetEnvironmentVariable("WORKSTATION") ?? 
                          configuration["BcApi:Workstation"] ?? 
                          "localhost";

            ConfigureHttpClient();
        }

        private void ConfigureHttpClient()
        {
            try
            {
                _logger.LogInformation("Configuring HTTP client headers - Username: {Username}, Domain: {Domain}", 
                    _username, _domain);
                
                // NTLM authentication is handled by HttpClientHandler, just set headers
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "DocVerse-ApiSync/1.0");
                _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
                
                _logger.LogInformation("HTTP client configured successfully for NTLM authentication");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error configuring HTTP client");
                throw;
            }
        }

        public async Task<BcApiResponse<BcItemDto>?> GetItemsAsync()
        {
            const string endpoint = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/items";
            return await GetDataAsync<BcApiResponse<BcItemDto>>(endpoint);
        }

        public async Task<BcApiResponse<BcGeneralAccountDto>?> GetGeneralAccountsAsync()
        {
            const string endpoint = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/accounts";
            return await GetDataAsync<BcApiResponse<BcGeneralAccountDto>>(endpoint);
        }

        public async Task<BcApiResponse<BcCustomerDto>?> GetCustomersAsync()
        {
            const string endpoint = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/customers";
            return await GetDataAsync<BcApiResponse<BcCustomerDto>>(endpoint);
        }

        public async Task<BcApiResponse<BcVendorDto>?> GetVendorsAsync()
        {
            const string endpoint = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/vendors";
            return await GetDataAsync<BcApiResponse<BcVendorDto>>(endpoint);
        }

        public async Task<BcApiResponse<BcLocationDto>?> GetLocationsAsync()
        {
            const string endpoint = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/locations";
            return await GetDataAsync<BcApiResponse<BcLocationDto>>(endpoint);
        }

        public async Task<BcApiResponse<BcResponsibilityCentreDto>?> GetResponsibilityCentresAsync()
        {
            const string endpoint = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/responsibilityCenters";
            return await GetDataAsync<BcApiResponse<BcResponsibilityCentreDto>>(endpoint);
        }

        public async Task<BcApiResponse<BcUnitOfMeasureDto>?> GetUnitOfMeasuresAsync()
        {
            const string endpoint = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/UnitofMeasures";
            return await GetDataAsync<BcApiResponse<BcUnitOfMeasureDto>>(endpoint);
        }

        public async Task<BcApiResponse<BcItemUnitOfMeasureDto>?> GetItemUnitOfMeasuresAsync()
        {
            const string endpoint = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/itemnitofMeasures";
            return await GetDataAsync<BcApiResponse<BcItemUnitOfMeasureDto>>(endpoint);
        }

        public async Task<T?> GetDataAsync<T>(string endpoint) where T : class
        {
            try
            {
                _logger.LogInformation("Fetching data from BC API endpoint: {Endpoint} with username: {Username}", 
                    endpoint, _username);

                var response = await _httpClient.GetAsync(endpoint);
                
                _logger.LogInformation("Response status from {Endpoint}: {StatusCode} ({ReasonPhrase})", 
                    endpoint, response.StatusCode, response.ReasonPhrase);
                
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation("Received response from {Endpoint}: {ResponseLength} characters", 
                        endpoint, content.Length);
                    
                    // Log first 200 characters of response for debugging
                    var preview = content.Length > 200 ? content.Substring(0, 200) + "..." : content;
                    _logger.LogDebug("Response preview: {Preview}", preview);

                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                    };

                    var data = JsonSerializer.Deserialize<T>(content, options);
                    _logger.LogInformation("Successfully parsed data from {Endpoint}", endpoint);
                    
                    return data;
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Failed to fetch data from {Endpoint}. Status: {StatusCode} ({ReasonPhrase}), Content: {Content}", 
                        endpoint, response.StatusCode, response.ReasonPhrase, errorContent);
                    
                    return null;
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP request failed for endpoint {Endpoint}. Message: {Message}", 
                    endpoint, ex.Message);
                return null;
            }
            catch (TaskCanceledException ex)
            {
                _logger.LogError(ex, "Request timeout for endpoint {Endpoint}. Timeout was {Timeout} minutes", 
                    endpoint, _httpClient.Timeout.TotalMinutes);
                return null;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "Failed to parse JSON response from endpoint {Endpoint}. Error: {Error}", 
                    endpoint, ex.Message);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error fetching data from endpoint {Endpoint}. Error: {Error}", 
                    endpoint, ex.Message);
                return null;
            }
        }
    }
} 