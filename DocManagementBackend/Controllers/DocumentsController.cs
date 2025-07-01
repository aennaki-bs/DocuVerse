using Microsoft.AspNetCore.Mvc;
using DocManagementBackend.Models;
using DocManagementBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using DocManagementBackend.Mappings;
using DocManagementBackend.Services;
// using DocManagementBackend.ModelsDtos;
using DocManagementBackend.Utils;
using System.Text;

namespace DocManagementBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly DocumentWorkflowService _workflowService;
        private readonly UserAuthorizationService _authService;
        private readonly IDocumentErpArchivalService _erpArchivalService;
        
        public DocumentsController(ApplicationDbContext context, DocumentWorkflowService workflowService, UserAuthorizationService authService, IDocumentErpArchivalService erpArchivalService) 
        { 
            _context = context;
            _workflowService = workflowService;
            _authService = authService;
            _erpArchivalService = erpArchivalService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetDocuments()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser", "SimpleUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;
            var documents = await _context.Documents
                .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(d => d.UpdatedBy).ThenInclude(u => u.Role)
                .Include(d => d.DocumentType)
                .Include(d => d.SubType)
                .Include(d => d.CurrentStep)
                .Include(d => d.ResponsibilityCentre)
                .Include(d => d.Lignes)
                .Select(DocumentMappings.ToDocumentDto)
                .ToListAsync();

            return Ok(documents);
        }

        [HttpGet("my-documents")]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetMyDocuments()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser", "SimpleUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            // Query builder for documents
            IQueryable<Document> documentsQuery = _context.Documents
                .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(d => d.UpdatedBy).ThenInclude(u => u.Role)
                .Include(d => d.DocumentType)
                .Include(d => d.SubType)
                .Include(d => d.CurrentStep)
                .Include(d => d.ResponsibilityCentre)
                .Include(d => d.Lignes);

            // Filter based on user's responsibility center
            if (user.ResponsibilityCentreId.HasValue)
            {
                // User has a responsibility center - show only documents from that center
                documentsQuery = documentsQuery.Where(d => d.ResponsibilityCentreId == user.ResponsibilityCentreId.Value);
            }
            // If user doesn't have a responsibility center, show all documents (no filter applied)

            var documents = await documentsQuery
                .Select(DocumentMappings.ToDocumentDto)
                .ToListAsync();

            return Ok(documents);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DocumentDto>> GetDocument(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser", "SimpleUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;
            var documentDto = await _context.Documents
                .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(d => d.UpdatedBy).ThenInclude(u => u.Role)
                .Include(d => d.DocumentType)
                .Include(d => d.SubType)
                .Include(d => d.CurrentStep)
                .Include(d => d.ResponsibilityCentre)
                .Include(d => d.Lignes)
                .Where(d => d.Id == id)
                .Select(DocumentMappings.ToDocumentDto)
                .FirstOrDefaultAsync();
            if (documentDto == null) { return NotFound("Document not found!"); }

            return Ok(documentDto);
        }

        [HttpGet("recent")]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetRecentDocuments([FromQuery] int limit = 5)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser", "SimpleUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var thisUser = authResult.User!;

            // Ensure the limit is reasonable
            if (limit <= 0)
                limit = 5;
            if (limit > 50)
                limit = 50; // Set a maximum limit to prevent excessive queries

            // Query builder for documents
            IQueryable<Document> documentsQuery = _context.Documents
                .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(d => d.UpdatedBy).ThenInclude(u => u.Role)
                .Include(d => d.DocumentType)
                .Include(d => d.SubType)
                .Include(d => d.CurrentStep)
                .Include(d => d.ResponsibilityCentre)
                .Include(d => d.Lignes);

            // Filter based on user's responsibility center
            if (thisUser.ResponsibilityCentreId.HasValue)
            {
                // User has a responsibility center - show only documents from that center
                documentsQuery = documentsQuery.Where(d => d.ResponsibilityCentreId == thisUser.ResponsibilityCentreId.Value);
            }
            // If user doesn't have a responsibility center, show all documents (no filter applied)

            var recentDocuments = await documentsQuery
                .OrderByDescending(d => d.CreatedAt) // Sort by creation date, newest first
                .Take(limit) // Take only the specified number of documents
                .Select(DocumentMappings.ToDocumentDto)
                .ToListAsync();

            return Ok(recentDocuments);
        }

        [HttpPost]
        public async Task<ActionResult<DocumentDto>> CreateDocument([FromBody] CreateDocumentRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            // Handle Responsibility Centre logic
            int? responsibilityCentreId = null;
            if (user.ResponsibilityCentreId.HasValue)
            {
                // User has a responsibility centre, use it automatically
                responsibilityCentreId = user.ResponsibilityCentreId.Value;
            }
            else if (request.ResponsibilityCentreId.HasValue)
            {
                // User has no responsibility centre, but one was provided explicitly
                // Validate the provided responsibility centre
                var responsibilityCentre = await _context.ResponsibilityCentres
                    .FirstOrDefaultAsync(rc => rc.Id == request.ResponsibilityCentreId.Value);
                if (responsibilityCentre == null)
                    return BadRequest("Invalid Responsibility Centre.");
                
                responsibilityCentreId = request.ResponsibilityCentreId.Value;
            }
            else
            {
                // Neither user nor request has a responsibility centre - this is allowed for now
                // but should be handled in business logic
                responsibilityCentreId = null;
            }

            var docType = await _context.DocumentTypes.FirstOrDefaultAsync(t => t.Id == request.TypeId);
            if (docType == null)
                return BadRequest("Invalid Document type!");

            // Validate circuit if specified
            if (request.CircuitId.HasValue && request.CircuitId.Value > 0)
            {
                var circuit = await _context.Circuits.FirstOrDefaultAsync(c => c.Id == request.CircuitId.Value);
                if (circuit == null)
                    return BadRequest($"The specified circuit (ID: {request.CircuitId}) does not exist.");
                
                // if (!circuit.IsActive)
                //     return BadRequest($"The specified circuit (ID: {request.CircuitId}) is not active.");
            }

            SubType? subType = null;
            if (request.SubTypeId.HasValue)
            {
                subType = await _context.SubTypes.FirstOrDefaultAsync(s => s.Id == request.SubTypeId.Value);
                if (subType == null)
                    return BadRequest("Invalid SubType!");

                if (subType.DocumentTypeId != request.TypeId)
                    return BadRequest("Selected SubType does not belong to the selected Document Type!");

                var documentDate = (request.DocDate ?? DateTime.UtcNow).Date;
                var subTypeStartDate = subType.StartDate.Date;
                var subTypeEndDate = subType.EndDate.Date;
                
                Console.WriteLine($"[DEBUG] Document creation validation: docDate={documentDate:yyyy-MM-dd}, subTypeStart={subTypeStartDate:yyyy-MM-dd}, subTypeEnd={subTypeEndDate:yyyy-MM-dd}");
                
                if (documentDate < subTypeStartDate || documentDate > subTypeEndDate)
                    return BadRequest($"Document date ({documentDate:d}) must be within the selected SubType date range ({subTypeStartDate:d} to {subTypeEndDate:d})");
            }

            var docDate = request.DocDate ?? DateTime.UtcNow;
            var docAlias = "";

            if (!string.IsNullOrEmpty(request.DocumentAlias))
                docAlias = request.DocumentAlias.ToUpper();

            docType.DocumentCounter++;
            docType.DocCounter++;
            int counterValue = docType.DocCounter;
            string paddedCounter = counterValue.ToString("D4");

            string documentKey;
            if (subType != null)
                documentKey = $"{subType.SubTypeKey}-{docAlias}{paddedCounter}";
            else
                documentKey = $"{docType.TypeKey}-{docAlias}{paddedCounter}";

            var document = new Document
            {
                Title = request.Title,
                DocumentAlias = docAlias,
                Content = request.Content,
                CreatedByUserId = userId,
                CreatedBy = user,
                DocDate = docDate,
                TypeId = request.TypeId,
                DocumentType = docType,
                SubTypeId = request.SubTypeId,
                SubType = subType,
                ResponsibilityCentreId = responsibilityCentreId,
                // Don't set CircuitId here, will be set by workflow service if needed
                CircuitId = null,
                ComptableDate = request.ComptableDate ?? DateTime.UtcNow,
                DocumentExterne = request.DocumentExterne ?? string.Empty,
                Status = 0, // Initially set to 0 (Open/Draft)
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                DocumentKey = documentKey,
                IsCircuitCompleted = false, // Explicitly set to false for new documents
                
                // Customer/Vendor snapshot data
                CustomerVendorCode = request.CustomerVendorCode,
                CustomerVendorName = request.CustomerVendorName,
                CustomerVendorAddress = request.CustomerVendorAddress,
                CustomerVendorCity = request.CustomerVendorCity,
                CustomerVendorCountry = request.CustomerVendorCountry
            };

            _context.Documents.Add(document);
            
            try
            {
                await _context.SaveChangesAsync();

                // Assign to circuit if specified, using the workflow service
                if (request.CircuitId.HasValue && request.CircuitId.Value > 0)
                {
                    try
                    {
                        await _workflowService.AssignDocumentToCircuitAsync(document.Id, request.CircuitId.Value, userId);
                    }
                    catch (Exception circuitEx)
                    {
                        return BadRequest($"Error assigning document to circuit: {circuitEx.Message}");
                    }
                }
                
                // Now fetch the complete document with all related entities
                var createdDocument = await _context.Documents
                    .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
                    .Include(d => d.DocumentType)
                    .Include(d => d.SubType)
                    .Include(d => d.CurrentStep)
                    .Include(d => d.CurrentStatus)
                    .Include(d => d.ResponsibilityCentre)
                    .Where(d => d.Id == document.Id)
                    .Select(DocumentMappings.ToDocumentDto)
                    .FirstOrDefaultAsync();

                var logEntry = new LogHistory
                {
                    UserId = userId,
                    User = user,
                    Timestamp = DateTime.UtcNow,
                    ActionType = 4,
                    Description = $"{user.Username} has created the document {document.DocumentKey}"
                };
                _context.LogHistories.Add(logEntry);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, createdDocument);
            }
            catch (DbUpdateException ex)
            {
                // Roll back counter increment
                docType.DocumentCounter--;
                docType.DocCounter--;
                
                // Check for foreign key constraint violations
                if (ex.InnerException != null && ex.InnerException.Message.Contains("FK_Documents_Circuits_CircuitId"))
                {
                    return BadRequest("The specified circuit does not exist. Please select a valid circuit or leave it empty.");
                }
                
                return StatusCode(500, $"An error occurred while creating the document: {ex.Message}");
            }
            catch (Exception ex)
            {
                // Roll back counter increment
                docType.DocumentCounter--;
                docType.DocCounter--;
                
                return StatusCode(500, $"An unexpected error occurred: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocument(int id, [FromBody] UpdateDocumentRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;
            var document = await _context.Documents.FindAsync(id);
            if (document == null)
                return NotFound("Document not found.");

            // Check if document is archived to ERP
            if (!string.IsNullOrEmpty(document.ERPDocumentCode))
                return BadRequest("This document has been archived to the ERP system and cannot be modified.");

            // Update basic document fields
            document.Content = request.Content ?? document.Content;
            document.Title = request.Title ?? document.Title;
            document.DocDate = request.DocDate ?? document.DocDate;
            
            // Debug logging for ComptableDate
            if (request.ComptableDate.HasValue)
            {
                Console.WriteLine($"Updating ComptableDate from {document.ComptableDate} to {request.ComptableDate}");
                document.ComptableDate = request.ComptableDate.Value;
            }
            
            // Update DocumentExterne if provided
            if (request.DocumentExterne != null)
            {
                document.DocumentExterne = request.DocumentExterne;
            }
            
            // Update Customer/Vendor fields if provided
            if (request.CustomerVendorCode != null)
                document.CustomerVendorCode = request.CustomerVendorCode;
            if (request.CustomerVendorName != null)
                document.CustomerVendorName = request.CustomerVendorName;
            if (request.CustomerVendorAddress != null)
                document.CustomerVendorAddress = request.CustomerVendorAddress;
            if (request.CustomerVendorCity != null)
                document.CustomerVendorCity = request.CustomerVendorCity;
            if (request.CustomerVendorCountry != null)
                document.CustomerVendorCountry = request.CustomerVendorCountry;

            // Handle SubType changes
            if (request.SubTypeId.HasValue && request.SubTypeId != document.SubTypeId)
            {
                var subType = await _context.SubTypes.FindAsync(request.SubTypeId.Value);
                if (subType == null)
                    return BadRequest("Invalid SubType!");

                // If type is also changing, verify SubType belongs to that type
                if (request.TypeId.HasValue && request.TypeId != document.TypeId)
                {
                    if (subType.DocumentTypeId != request.TypeId.Value)
                        return BadRequest("Selected SubType does not belong to the selected Document Type!");
                }
                else
                {
                    // Otherwise check against current document type
                    if (subType.DocumentTypeId != document.TypeId)
                        return BadRequest("Selected SubType does not belong to the document's current type!");
                }

                // Verify DocDate falls within SubType date range
                var docDate = document.DocDate.Date;
                var subTypeStartDate = subType.StartDate.Date;
                var subTypeEndDate = subType.EndDate.Date;
                
                Console.WriteLine($"[DEBUG] Document update validation: docDate={docDate:yyyy-MM-dd}, subTypeStart={subTypeStartDate:yyyy-MM-dd}, subTypeEnd={subTypeEndDate:yyyy-MM-dd}");
                
                if (docDate < subTypeStartDate || docDate > subTypeEndDate)
                    return BadRequest($"Document date ({docDate:d}) must be within the selected SubType date range ({subTypeStartDate:d} to {subTypeEndDate:d})");

                document.SubTypeId = request.SubTypeId;
                document.SubType = subType;

                // Need to update document key
                var docType = await _context.DocumentTypes.FindAsync(document.TypeId);

                // Extract counter from the existing key (assuming format ends with -XXXX)
                string counterStr = document.DocumentKey.Split('-').Last();
                string documentKey = $"{subType.SubTypeKey}-{counterStr}";
                document.DocumentKey = documentKey;
            }
            // Handle removing a subtype
            else if (request.SubTypeId.HasValue && request.SubTypeId.Value == 0 && document.SubTypeId.HasValue)
            {
                document.SubTypeId = null;
                document.SubType = null;

                // Regenerate document key using the document type
                var docType = await _context.DocumentTypes.FindAsync(document.TypeId);
                string counterStr = document.DocumentKey.Split('-').Last();
                string documentKey = $"{docType!.TypeKey}{document.DocumentAlias}-{counterStr}";
                document.DocumentKey = documentKey;
            }

            // Handle type changes as in original method
            if (request.TypeId.HasValue)
            {
                if (request.TypeId != document.TypeId)
                {
                    var docType = await _context.DocumentTypes.FirstOrDefaultAsync(t => t.Id == request.TypeId);
                    if (docType == null)
                        return BadRequest("Invalid type!");
                    var type = await _context.DocumentTypes.FirstOrDefaultAsync(t => t.Id == document.TypeId);
                    if (type == null)
                        return BadRequest("Missing DocumentType");
                    type.DocumentCounter--;

                    // If changing document type, clear the subtype if it doesn't match
                    if (document.SubTypeId.HasValue)
                    {
                        var subType = await _context.SubTypes.FindAsync(document.SubTypeId.Value);
                        if (subType!.DocumentTypeId != request.TypeId)
                        {
                            document.SubTypeId = null;
                            document.SubType = null;
                        }
                    }

                    document.TypeId = request.TypeId ?? document.TypeId;
                    document.DocumentType = docType;
                    docType.DocumentCounter++;
                    int counterValue = docType.DocumentCounter;
                    string paddedCounter = counterValue.ToString("D4");

                    if (document.SubTypeId.HasValue && document.SubType != null)
                        document.DocumentKey = $"{document.SubType.SubTypeKey}-{paddedCounter}";
                    else
                        document.DocumentKey = $"{docType.TypeKey}{document.DocumentAlias.ToUpper()}-{paddedCounter}";
                }
            }

            if (!string.IsNullOrEmpty(request.DocumentAlias))
            {
                document.DocumentAlias = request.DocumentAlias.ToUpper();

                // Only update the document key if we're not using a subtype
                if (!document.SubTypeId.HasValue)
                {
                    var docType = await _context.DocumentTypes.FindAsync(document.TypeId);
                    string counterStr = document.DocumentKey.Split('-').Last();
                    document.DocumentKey = $"{docType!.TypeKey}{request.DocumentAlias.ToUpper()}-{counterStr}";
                }
            }

            // Handle circuit changes
            if (request.CircuitId.HasValue)
            {
                if (request.CircuitId.Value > 0)
                {
                    // Verify the circuit exists
                    var circuit = await _context.Circuits.FirstOrDefaultAsync(c => c.Id == request.CircuitId.Value);
                    if (circuit == null)
                        return BadRequest($"The specified circuit (ID: {request.CircuitId}) does not exist.");
                    
                    document.CircuitId = request.CircuitId;
                    document.Circuit = circuit;
                }
                else
                {
                    // If CircuitId is 0, remove the circuit association
                    document.CircuitId = null;
                    document.Circuit = null;
                }
            }

            document.UpdatedAt = DateTime.UtcNow;
            document.UpdatedByUserId = userId;
            _context.Entry(document).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                var logEntry = new LogHistory
                {
                    UserId = userId,
                    User = user,
                    Timestamp = DateTime.UtcNow,
                    ActionType = 5,
                    Description = $"{user.Username} has updated the document {document.DocumentKey}"
                };
                _context.LogHistories.Add(logEntry);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Documents.Any(d => d.Id == id)) { return NotFound(); }
                else { throw; }
            }
            catch (DbUpdateException ex)
            {
                // Check for foreign key constraint violations
                if (ex.InnerException != null && ex.InnerException.Message.Contains("FK_Documents_Circuits_CircuitId"))
                {
                    return BadRequest("The specified circuit does not exist. Please select a valid circuit or leave it empty.");
                }
                
                return StatusCode(500, $"An error occurred while updating the document: {ex.Message}");
            }
            return Ok("Document updated!");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;
            
            // Check if document is archived to ERP before allowing deletion
            var documentToCheck = await _context.Documents.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id);
            if (documentToCheck != null && !string.IsNullOrEmpty(documentToCheck.ERPDocumentCode))
                return BadRequest("This document has been archived to the ERP system and cannot be deleted.");

            try
            {
                // Get document for logging before deletion
                var document = await _context.Documents.FindAsync(id);
                if (document == null)
                    return NotFound("Document not found!");

                // Log the deletion before actually deleting
                var logEntry = new LogHistory
                {
                    UserId = userId,
                    User = user,
                    Timestamp = DateTime.UtcNow,
                    ActionType = 6,
                    Description = $"{user.Username} has deleted the document {document.DocumentKey}"
                };
                _context.LogHistories.Add(logEntry);
                await _context.SaveChangesAsync();

                // Use the workflow service to delete the document and all related records
                // The workflow service now handles the counter decrement within its transaction
                bool success = await _workflowService.DeleteDocumentAsync(id);
                if (!success)
                    return NotFound("Document not found or could not be deleted");

                return Ok("Document deleted!");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("Types")]
        public async Task<ActionResult> GetTypes()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;
            var types = await _context.DocumentTypes.ToListAsync();
            return Ok(types);
        }

        [HttpGet("Types/{id}")]
        public async Task<ActionResult<DocumentType>> GetDocumentType(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            var documentType = await _context.DocumentTypes.FindAsync(id);

            if (documentType == null)
                return NotFound("Document type not found.");

            return Ok(documentType);
        }

        [HttpPost("valide-typeKey")]
        public async Task<IActionResult> ValideTypeKey([FromBody] DocumentTypeDto request)
        {
            if (await _context.DocumentTypes.AnyAsync(t => t.TypeKey == request.TypeKey))
                return Ok("False");
            return Ok("True");
        }

        [HttpPost("Types")]
        public async Task<ActionResult> CreateTypes([FromBody] DocumentTypeDto request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;
            if (string.IsNullOrEmpty(request.TypeName))
                return BadRequest("Type Name is required!");
            var typeNameExists = await _context.DocumentTypes.AnyAsync(t => t.TypeName == request.TypeName);
            if (typeNameExists)
                return BadRequest("Type Name already exists!");
            var typeCounter = await _context.TypeCounter.FirstOrDefaultAsync();
            if (typeCounter == null)
            {
                typeCounter = new TypeCounter { Counter = 1 };
                _context.TypeCounter.Add(typeCounter);
            }
            string baseKey = (request.TypeName.Length >= 2) ? request.TypeName.Substring(0, 2).ToUpper() : request.TypeName.ToUpper();
            if (!string.IsNullOrEmpty(request.TypeKey))
                baseKey = request.TypeKey;
            bool exists = await _context.DocumentTypes.AnyAsync(t => t.TypeKey == baseKey);
            string finalTypeKey = exists ? $"{baseKey}{typeCounter.Counter++}" : baseKey;
            var type = new DocumentType
            {
                TypeKey = finalTypeKey,
                TypeName = request.TypeName,
                TypeAttr = request.TypeAttr,
                TierType = request.TierType,
                DocumentCounter = 0,
                DocCounter = 0
            };
            _context.DocumentTypes.Add(type);
            await _context.SaveChangesAsync();
            return Ok("Type successfully added!");
        }

        [HttpPost("valide-type")]
        public async Task<IActionResult> ValideType([FromBody] DocumentTypeDto request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;
                
            var typeName = request.TypeName.ToLower();
            var type = await _context.DocumentTypes.AnyAsync(t => t.TypeName.ToLower() == typeName);
            if (type)
                return Ok("True");
            return Ok("False");
        }

        [HttpPut("Types/{id}")]
        public async Task<IActionResult> UpdateType([FromBody] DocumentTypeDto request, int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;
            var ThisType = await _context.DocumentTypes.FindAsync(id);
            if (ThisType == null)
                return NotFound("No type with this id!");
            if (!string.IsNullOrEmpty(request.TypeName))
            {
                var typeName = request.TypeName.ToLower();
                var type = await _context.DocumentTypes.FirstOrDefaultAsync(t => t.TypeName.ToLower() == typeName);
                if (type != null && type.Id != ThisType.Id)
                    return BadRequest("TypeName already exist");
                ThisType.TypeName = request.TypeName;
            }
            if (!string.IsNullOrEmpty(request.TypeAttr))
                ThisType.TypeAttr = request.TypeAttr;
            
            // Update TierType
            ThisType.TierType = request.TierType;
            
            // _context.DocumentTypes.Add(ThisType);
            await _context.SaveChangesAsync();
            return Ok("Type edited successfully");
        }

        [HttpDelete("Types/{id}")]
        public async Task<IActionResult> DeleteType(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;
            
            try
            {
                var type = await _context.DocumentTypes.FindAsync(id);
                if (type == null)
                    return NotFound("No document type found with this ID!");

                // Check if there are documents using this type
                var documentCount = await _context.Documents.CountAsync(d => d.TypeId == id);
                if (documentCount > 0)
                    return BadRequest($"This document type cannot be deleted. There are {documentCount} document(s) using this type.");

                // Check if there are circuits using this document type
                var circuitCount = await _context.Circuits.CountAsync(c => c.DocumentTypeId == id);
                if (circuitCount > 0)
                    return BadRequest($"This document type cannot be deleted. There are {circuitCount} circuit(s) associated with this type.");

                // Get associated subtypes for cascade deletion
                var subTypes = await _context.SubTypes
                    .Where(st => st.DocumentTypeId == id)
                    .ToListAsync();

                // Begin transaction for cascade deletion
                using var transaction = await _context.Database.BeginTransactionAsync();
                
                try
                {
                    // Delete associated subtypes first
                    if (subTypes.Any())
                    {
                        _context.SubTypes.RemoveRange(subTypes);
                        await _context.SaveChangesAsync();
                        
                        // Log subtype deletions
                        var subTypeLogEntry = new LogHistory
                        {
                            UserId = userId,
                            User = user,
                            Timestamp = DateTime.UtcNow,
                            ActionType = 6, // Delete action
                            Description = $"{user.Username} deleted {subTypes.Count} series as part of document type '{type.TypeName}' deletion"
                        };
                        _context.LogHistories.Add(subTypeLogEntry);
                    }

                    // Update the document counter to match actual count (for data consistency)
                    type.DocumentCounter = documentCount;

                    // Delete the document type
                    _context.DocumentTypes.Remove(type);
                    await _context.SaveChangesAsync();

                    // Log document type deletion
                    var typeLogEntry = new LogHistory
                    {
                        UserId = userId,
                        User = user,
                        Timestamp = DateTime.UtcNow,
                        ActionType = 6, // Delete action
                        Description = $"{user.Username} deleted document type '{type.TypeName}' and {subTypes.Count} associated series"
                    };
                    _context.LogHistories.Add(typeLogEntry);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    var message = subTypes.Any() 
                        ? $"Document type deleted successfully! Also removed {subTypes.Count} associated series."
                        : "Document type deleted successfully!";

                    return Ok(message);
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (DbUpdateException ex)
            {
                // Handle any unexpected database constraint violations
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                
                if (innerMessage.Contains("REFERENCE constraint") || innerMessage.Contains("FOREIGN KEY"))
                {
                    return BadRequest("Cannot delete this document type because it is referenced by other records in the system.");
                }
                
                return StatusCode(500, $"Database error occurred while deleting document type: {innerMessage}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An unexpected error occurred while deleting document type: {ex.Message}");
            }
        }

        [HttpPost("bulk-delete")]
        public async Task<IActionResult> BulkDeleteDocuments([FromBody] List<int> documentIds)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            if (documentIds == null || !documentIds.Any())
                return BadRequest("No document IDs provided");

            try
            {
                // Check for ERP-archived documents before attempting deletion
                var documentsToCheck = await _context.Documents
                    .Where(d => documentIds.Contains(d.Id))
                    .Select(d => new { d.Id, d.ERPDocumentCode, d.DocumentKey, d.Status })
                    .ToListAsync();

                var erpArchivedDocs = documentsToCheck
                    .Where(d => !string.IsNullOrEmpty(d.ERPDocumentCode))
                    .ToList();

                // Enhanced debug logging
                Console.WriteLine($"[DEBUG] Bulk delete request for {documentIds.Count} documents");
                foreach (var doc in documentsToCheck)
                {
                    var isErpArchived = !string.IsNullOrEmpty(doc.ERPDocumentCode);
                    Console.WriteLine($"[DEBUG] Document {doc.Id} ({doc.DocumentKey}) - Status: {doc.Status}, ERPCode: '{doc.ERPDocumentCode ?? "NULL"}', IsErpArchived: {isErpArchived}");
                }
                Console.WriteLine($"[DEBUG] Found {erpArchivedDocs.Count} ERP-archived documents out of {documentsToCheck.Count} total");

                // Log the bulk deletion attempt
                var logEntry = new LogHistory
                {
                    UserId = userId,
                    User = user,
                    Timestamp = DateTime.UtcNow,
                    ActionType = 6,
                    Description = $"{user.Username} attempted to delete {documentIds.Count} documents in bulk"
                };
                _context.LogHistories.Add(logEntry);
                await _context.SaveChangesAsync();

                // Use the workflow service's bulk delete method
                var (successCount, failedIds) = await _workflowService.DeleteMultipleDocumentsAsync(documentIds);

                // Categorize failed documents
                var erpArchivedFailedDocs = erpArchivedDocs
                    .Where(d => failedIds.Contains(d.Id))
                    .ToList();

                var otherFailedIds = failedIds
                    .Where(id => !erpArchivedFailedDocs.Any(d => d.Id == id))
                    .ToList();

                // Build detailed message
                var messageBuilder = new StringBuilder();
                if (successCount > 0)
                {
                    messageBuilder.Append($"Successfully deleted {successCount} documents");
                }

                if (erpArchivedFailedDocs.Any())
                {
                    if (messageBuilder.Length > 0) messageBuilder.Append(". ");
                    messageBuilder.Append($"{erpArchivedFailedDocs.Count} documents could not be deleted because they are archived to ERP");
                }

                if (otherFailedIds.Any())
                {
                    if (messageBuilder.Length > 0) messageBuilder.Append(". ");
                    messageBuilder.Append($"{otherFailedIds.Count} documents failed for other reasons");
                }

                // Log the result with detailed information
                var resultLogEntry = new LogHistory
                {
                    UserId = userId,
                    User = user,
                    Timestamp = DateTime.UtcNow,
                    ActionType = 6,
                    Description = $"{user.Username} bulk delete completed: {successCount} successful, {erpArchivedFailedDocs.Count} ERP-archived (protected), {otherFailedIds.Count} other failures"
                };
                _context.LogHistories.Add(resultLogEntry);
                await _context.SaveChangesAsync();

                if (failedIds.Any())
                {
                    return Ok(new 
                    { 
                        message = messageBuilder.ToString(),
                        successCount = successCount,
                        failedIds = failedIds,
                        erpArchivedCount = erpArchivedFailedDocs.Count,
                        erpArchivedDocuments = erpArchivedFailedDocs.Select(d => new { 
                            id = d.Id, 
                            documentKey = d.DocumentKey, 
                            erpCode = d.ERPDocumentCode 
                        }),
                        otherFailedCount = otherFailedIds.Count,
                        totalRequested = documentIds.Count
                    });
                }

                return Ok(new 
                { 
                    message = $"Successfully deleted {successCount} documents",
                    successCount = successCount,
                    totalRequested = documentIds.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred during bulk deletion: {ex.Message}");
            }
        }

        [HttpPost("recalculate-counters")]
        public async Task<IActionResult> RecalculateDocumentCounters()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            try
            {
                // Get all document types
                var documentTypes = await _context.DocumentTypes.ToListAsync();
                var updatedTypes = new List<object>();

                foreach (var docType in documentTypes)
                {
                    // Calculate actual document count for this type
                    var actualCount = await _context.Documents.CountAsync(d => d.TypeId == docType.Id);
                    var oldCounter = docType.DocumentCounter;
                    
                    // Update the counter to match actual count
                    docType.DocumentCounter = actualCount;
                    
                    if (oldCounter != actualCount)
                    {
                        updatedTypes.Add(new 
                        {
                            TypeId = docType.Id,
                            TypeName = docType.TypeName,
                            OldCounter = oldCounter,
                            NewCounter = actualCount,
                            Difference = actualCount - oldCounter
                        });
                    }
                }

                await _context.SaveChangesAsync();

                // Log the recalculation
                var logEntry = new LogHistory
                {
                    UserId = userId,
                    User = user,
                    Timestamp = DateTime.UtcNow,
                    ActionType = 5, // Update action
                    Description = $"{user.Username} recalculated document type counters. Updated {updatedTypes.Count} types."
                };
                _context.LogHistories.Add(logEntry);
                await _context.SaveChangesAsync();

                return Ok(new 
                {
                    message = $"Successfully recalculated counters for {documentTypes.Count} document types",
                    updatedTypes = updatedTypes,
                    totalTypesChecked = documentTypes.Count,
                    typesUpdated = updatedTypes.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while recalculating counters: {ex.Message}");
            }
        }

        [HttpPost("Types/bulk-delete")]
        public async Task<IActionResult> BulkDeleteDocumentTypes([FromBody] List<int> typeIds)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            if (typeIds == null || !typeIds.Any())
                return BadRequest("No document type IDs provided");

            var results = new
            {
                successful = new List<object>(),
                failed = new List<object>()
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                foreach (var typeId in typeIds)
                {
                    try
                    {
                        var type = await _context.DocumentTypes.FindAsync(typeId);
                        if (type == null)
                        {
                            results.failed.Add(new { id = typeId, error = "Document type not found" });
                            continue;
                        }

                        // Check if there are documents using this type
                        var documentCount = await _context.Documents.CountAsync(d => d.TypeId == typeId);
                        if (documentCount > 0)
                        {
                            results.failed.Add(new { 
                                id = typeId, 
                                name = type.TypeName,
                                error = $"Cannot delete - {documentCount} document(s) are using this type" 
                            });
                            continue;
                        }

                        // Check if there are circuits using this document type
                        var circuitCount = await _context.Circuits.CountAsync(c => c.DocumentTypeId == typeId);
                        if (circuitCount > 0)
                        {
                            results.failed.Add(new { 
                                id = typeId, 
                                name = type.TypeName,
                                error = $"Cannot delete - {circuitCount} circuit(s) are associated with this type" 
                            });
                            continue;
                        }

                        // Get associated subtypes for cascade deletion
                        var subTypes = await _context.SubTypes
                            .Where(st => st.DocumentTypeId == typeId)
                            .ToListAsync();

                        // Delete associated subtypes first
                        if (subTypes.Any())
                        {
                            _context.SubTypes.RemoveRange(subTypes);
                        }

                        // Delete the document type
                        _context.DocumentTypes.Remove(type);

                        results.successful.Add(new { 
                            id = typeId, 
                            name = type.TypeName,
                            deletedSeries = subTypes.Count 
                        });
                    }
                    catch (Exception ex)
                    {
                        results.failed.Add(new { 
                            id = typeId, 
                            error = $"Unexpected error: {ex.Message}" 
                        });
                    }
                }

                // Save all changes in the transaction
                await _context.SaveChangesAsync();

                // Log the bulk operation
                var logEntry = new LogHistory
                {
                    UserId = userId,
                    User = user,
                    Timestamp = DateTime.UtcNow,
                    ActionType = 6, // Delete action
                    Description = $"{user.Username} bulk deleted {results.successful.Count} document types, {results.failed.Count} failed"
                };
                _context.LogHistories.Add(logEntry);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                var message = results.failed.Any() 
                    ? $"Partially completed: {results.successful.Count} deleted, {results.failed.Count} failed"
                    : $"Successfully deleted {results.successful.Count} document types";

                return Ok(new 
                {
                    message = message,
                    successful = results.successful,
                    failed = results.failed,
                    totalRequested = typeIds.Count
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred during bulk deletion: {ex.Message}");
            }
        }

        // Test endpoint for manual ERP archival
        [HttpPost("{id}/archive-to-erp")]
        public async Task<IActionResult> ManualErpArchival(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                var document = await _context.Documents.FindAsync(id);
                if (document == null)
                    return NotFound("Document not found");

                // Check if already archived
                if (!string.IsNullOrEmpty(document.ERPDocumentCode))
                    return BadRequest($"Document is already archived to ERP with code: {document.ERPDocumentCode}");

                // Trigger ERP archival
                var success = await _erpArchivalService.ArchiveDocumentToErpAsync(id);
                
                if (success)
                {
                    // Refresh document to get updated ERP code
                    await _context.Entry(document).ReloadAsync();
                    return Ok(new { 
                        message = "Document successfully archived to ERP", 
                        erpDocumentCode = document.ERPDocumentCode 
                    });
                }
                else
                {
                    return StatusCode(500, new { 
                        message = "Failed to archive document to ERP. Check logs for details.",
                        errorType = "ErpArchivalError"
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error during ERP archival: {ex.Message}");
            }
        }

        // Test endpoint for manual ERP line creation
        [HttpPost("{id}/create-lines-in-erp")]
        public async Task<IActionResult> ManualErpLineCreation(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                var document = await _context.Documents
                    .Include(d => d.Lignes)
                    .FirstOrDefaultAsync(d => d.Id == id);
                    
                if (document == null)
                    return NotFound("Document not found");

                // Check if document is archived to ERP
                if (string.IsNullOrEmpty(document.ERPDocumentCode))
                    return BadRequest("Document must be archived to ERP first before creating lines");

                if (!document.Lignes.Any())
                    return BadRequest("Document has no lines to create in ERP");

                // Trigger ERP line creation
                var success = await _erpArchivalService.CreateDocumentLinesInErpAsync(id);
                
                if (success)
                {
                    // Refresh document lines to get updated ERP line codes
                    await _context.Entry(document).ReloadAsync();
                    await _context.Entry(document).Collection(d => d.Lignes).LoadAsync();
                    
                    var lineResults = document.Lignes.Select(l => new {
                        ligneId = l.Id,
                        title = l.Title,
                        erpLineCode = l.ERPLineCode,
                        isCreated = !string.IsNullOrEmpty(l.ERPLineCode)
                    }).ToList();
                    
                    return Ok(new { 
                        message = "Document lines successfully processed in ERP", 
                        erpDocumentCode = document.ERPDocumentCode,
                        totalLines = document.Lignes.Count,
                        createdLines = lineResults.Count(l => l.isCreated),
                        lines = lineResults
                    });
                }
                else
                {
                    return StatusCode(500, new { 
                        message = "Failed to create some or all document lines in ERP. Check logs for details.",
                        errorType = "ErpLineCreationError"
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error during ERP line creation: {ex.Message}");
            }
        }

        // Endpoint to fix archived documents that don't have their lines created in ERP
        [HttpPost("fix-missing-erp-lines")]
        public async Task<IActionResult> FixMissingErpLines()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                // Find documents that are archived to ERP but have lines without ERPLineCode
                var documentsNeedingLineFix = await _context.Documents
                    .Include(d => d.Lignes)
                    .Where(d => !string.IsNullOrEmpty(d.ERPDocumentCode) && 
                               d.Lignes.Any(l => string.IsNullOrEmpty(l.ERPLineCode)))
                    .ToListAsync();

                if (!documentsNeedingLineFix.Any())
                {
                    return Ok(new { 
                        message = "No documents found that need line fixes",
                        documentsProcessed = 0
                    });
                }

                var successCount = 0;
                var errorCount = 0;
                var results = new List<object>();

                foreach (var document in documentsNeedingLineFix)
                {
                    try
                    {
                        var linesNeedingCreation = document.Lignes.Where(l => string.IsNullOrEmpty(l.ERPLineCode)).Count();
                        
                        if (linesNeedingCreation > 0)
                        {
                            var success = await _erpArchivalService.CreateDocumentLinesInErpAsync(document.Id);
                            
                            if (success)
                            {
                                successCount++;
                                
                                // Refresh to get updated line codes
                                await _context.Entry(document).ReloadAsync();
                                await _context.Entry(document).Collection(d => d.Lignes).LoadAsync();
                                
                                var createdLines = document.Lignes.Count(l => !string.IsNullOrEmpty(l.ERPLineCode));
                                
                                results.Add(new {
                                    documentId = document.Id,
                                    documentKey = document.DocumentKey,
                                    erpDocumentCode = document.ERPDocumentCode,
                                    status = "success",
                                    totalLines = document.Lignes.Count,
                                    createdLines = createdLines
                                });
                            }
                            else
                            {
                                errorCount++;
                                results.Add(new {
                                    documentId = document.Id,
                                    documentKey = document.DocumentKey,
                                    erpDocumentCode = document.ERPDocumentCode,
                                    status = "failed",
                                    error = "Failed to create lines in ERP"
                                });
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        errorCount++;
                        results.Add(new {
                            documentId = document.Id,
                            documentKey = document.DocumentKey,
                            erpDocumentCode = document.ERPDocumentCode,
                            status = "error",
                            error = ex.Message
                        });
                    }
                }

                return Ok(new {
                    message = $"Processed {documentsNeedingLineFix.Count} documents with missing ERP lines",
                    documentsProcessed = documentsNeedingLineFix.Count,
                    successCount = successCount,
                    errorCount = errorCount,
                    results = results
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error during bulk ERP line fix: {ex.Message}");
            }
        }

        // Debug endpoint to check ERP archival status
        [HttpPost("check-erp-status")]
        public async Task<IActionResult> CheckErpStatus([FromBody] List<int> documentIds)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                var documents = await _context.Documents
                    .Where(d => documentIds.Contains(d.Id))
                    .Select(d => new { 
                        d.Id, 
                        d.DocumentKey, 
                        d.Status, 
                        d.ERPDocumentCode,
                        IsErpArchived = !string.IsNullOrEmpty(d.ERPDocumentCode),
                        d.IsCircuitCompleted,
                        d.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(new { 
                    message = "ERP archival status check",
                    requestedCount = documentIds.Count,
                    foundCount = documents.Count,
                    documents = documents
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error checking ERP status: {ex.Message}");
            }
        }
    }
}
