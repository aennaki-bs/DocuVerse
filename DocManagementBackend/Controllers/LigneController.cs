using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using DocManagementBackend.Mappings;
using DocManagementBackend.Services;
using DocManagementBackend.Utils;
using System.Security.Claims;
using System.Linq;
using System.Text.RegularExpressions;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Net.Http;
using System.Text;

namespace DocManagementBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LignesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public LignesController(
            ApplicationDbContext context,
            UserAuthorizationService authService) 
        { 
            _context = context;
            _authService = authService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LigneDto>>> GetLignes()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var lignes = await _context.Lignes
                .Include(l => l.Document!).ThenInclude(d => d.DocumentType)
                .Include(l => l.Document!).ThenInclude(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(l => l.LignesElementType).ThenInclude(let => let!.Item).ThenInclude(i => i!.UniteCodeNavigation)
                .Include(l => l.LignesElementType).ThenInclude(let => let!.GeneralAccount)
                .Include(l => l.Location)
                .Include(l => l.Unit)
                .ToListAsync();

            // Load selected elements dynamically for each ligne
            var lignesDtos = new List<LigneDto>();
            foreach (var ligne in lignes)
            {
                await ligne.LoadElementAsync(_context);
                
                // Create DTO - amounts are calculated and stored by frontend
                var ligneDto = LigneMappings.ToLigneDto.Compile()(ligne);
                lignesDtos.Add(ligneDto);
            }
            
            return Ok(lignesDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LigneDto>> GetLigne(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var ligne = await _context.Lignes
                .Include(l => l.Document!).ThenInclude(d => d.DocumentType)
                .Include(l => l.Document!).ThenInclude(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(l => l.LignesElementType).ThenInclude(let => let!.Item).ThenInclude(i => i!.UniteCodeNavigation)
                .Include(l => l.LignesElementType).ThenInclude(let => let!.GeneralAccount)
                .Include(l => l.Location)
                .Include(l => l.Unit)
                .FirstOrDefaultAsync(l => l.Id == id);
                
            if (ligne == null)
                return NotFound("Ligne not found.");

            // Load selected element dynamically
            await ligne.LoadElementAsync(_context);

            // Create DTO - amounts are calculated and stored by frontend
            var ligneDto = LigneMappings.ToLigneDto.Compile()(ligne);
            return Ok(ligneDto);
        }

        [HttpGet("by-document/{documentId}")]
        public async Task<ActionResult<IEnumerable<LigneDto>>> GetLignesByDocumentId(int documentId)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var lignes = await _context.Lignes
                .Where(l => l.DocumentId == documentId)
                .Include(l => l.Document!).ThenInclude(d => d.DocumentType)
                .Include(l => l.Document!).ThenInclude(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(l => l.LignesElementType).ThenInclude(let => let!.Item).ThenInclude(i => i!.UniteCodeNavigation)
                .Include(l => l.LignesElementType).ThenInclude(let => let!.GeneralAccount)
                .Include(l => l.Location)
                .Include(l => l.Unit)
                .ToListAsync();

            // Load selected elements dynamically for each ligne
            var lignesDtos = new List<LigneDto>();
            foreach (var ligne in lignes)
            {
                await ligne.LoadElementAsync(_context);
                
                // Create DTO - amounts are calculated and stored by frontend
                var ligneDto = LigneMappings.ToLigneDto.Compile()(ligne);
                lignesDtos.Add(ligneDto);
            }
            
            return Ok(lignesDtos);
        }

        /// <summary>
        /// Creates a new ligne with automatic unit conversion for Item types.
        /// When a non-default unit is selected for an Item, the price is automatically
        /// adjusted by multiplying it with the QtyPerUnitOfMeasure from ItemUnitOfMeasure table.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<LigneDto>> CreateLigne([FromBody] CreateLigneRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Validate required fields
            if (string.IsNullOrWhiteSpace(request.Title))
                return BadRequest("Title is required.");

            if (string.IsNullOrWhiteSpace(request.Article))
                return BadRequest("Article is required.");

            if (request.Quantity <= 0)
                return BadRequest("Quantity must be greater than 0.");

            if (request.PriceHT < 0)
                return BadRequest("Price HT cannot be negative.");

            // Validate document exists
            var document = await _context.Documents
                .Include(d => d.SubType)
                .Include(d => d.Lignes)
                .FirstOrDefaultAsync(d => d.Id == request.DocumentId);
            if (document == null)
                return BadRequest("Invalid DocumentId. Document not found.");

            // Validate LignesElementType if provided
            if (request.LignesElementTypeId.HasValue)
            {
                var elementType = await _context.LignesElementTypes
                    .Include(let => let.Item)
                    .Include(let => let.GeneralAccount)
                    .FirstOrDefaultAsync(let => let.Id == request.LignesElementTypeId.Value);
                
                if (elementType == null)
                    return BadRequest("Invalid LignesElementTypeId. Element type not found.");

                // Validate that the element type is properly configured
                if (!elementType.IsValid())
                    return BadRequest("The specified element type is not properly configured.");
                
                // Validate location is only provided for Item types
                if (!string.IsNullOrEmpty(request.LocationCode))
                {
                    if (elementType.TypeElement != ElementType.Item)
                        return BadRequest("Location can only be specified for Item element types.");
                    
                    // Validate that the location exists
                    var locationExists = await _context.Locations.AnyAsync(l => l.LocationCode == request.LocationCode);
                    if (!locationExists)
                        return BadRequest("Invalid LocationCode. Location not found.");
                }
            }
            else if (!string.IsNullOrEmpty(request.LocationCode))
            {
                return BadRequest("Location can only be specified when LignesElementTypeId is provided and is an Item type.");
            }

            // Create the ligne entity with values calculated by frontend
            var ligne = new Ligne
            {
                DocumentId = request.DocumentId,
                LigneKey = string.IsNullOrWhiteSpace(request.LigneKey) 
                    ? await GenerateUniqueLigneKeyAsync(document)
                    : request.LigneKey,
                Title = request.Title.Trim(),
                Article = request.Article.Trim(),
                LignesElementTypeId = request.LignesElementTypeId,
                ElementId = request.SelectedElementCode,
                LocationCode = request.LocationCode, // Set location for Item types
                UnitCode = request.UnitCode, // Set unit for Item types
                Quantity = request.Quantity,
                PriceHT = request.PriceHT, // Adjusted price (calculated by frontend)
                OriginalPriceHT = request.OriginalPriceHT, // Original price for reference
                DiscountPercentage = request.DiscountPercentage,
                DiscountAmount = request.DiscountAmount, // Calculated by frontend
                VatPercentage = request.VatPercentage,
                Prix = (float)request.PriceHT, // Legacy field
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Validate the ligne
            if (!ligne.IsValid())
                return BadRequest("Invalid ligne data. Please check quantity, prices, and percentages.");

            _context.Lignes.Add(ligne);

            try
            {
                // If the ligne has a LignesElementType that references a GeneralAccount, increment the count
                if (request.LignesElementTypeId.HasValue)
                {
                    var elementType = await _context.LignesElementTypes
                        .Include(let => let.GeneralAccount)
                        .FirstOrDefaultAsync(let => let.Id == request.LignesElementTypeId.Value);
                    
                    if (elementType?.GeneralAccount != null && elementType.TypeElement == ElementType.GeneralAccounts)
                    {
                        elementType.GeneralAccount.LinesCount++;
                    }
                }

                // Update document to track that a ligne was added
                document.UpdatedAt = DateTime.UtcNow;
                document.UpdatedByUserId = authResult.UserId; // Track who added the ligne

                await _context.SaveChangesAsync();

                // Return the created ligne with all includes
                var createdLigne = await _context.Lignes
                    .Include(l => l.Document!).ThenInclude(d => d.DocumentType)
                    .Include(l => l.Document!).ThenInclude(d => d.CreatedBy).ThenInclude(u => u.Role)
                    .Include(l => l.LignesElementType).ThenInclude(let => let!.Item).ThenInclude(i => i!.UniteCodeNavigation)
                    .Include(l => l.LignesElementType).ThenInclude(let => let!.GeneralAccount)
                    .Include(l => l.Location)
                    .Include(l => l.Unit)
                    .FirstOrDefaultAsync(l => l.Id == ligne.Id);

                if (createdLigne != null)
                {
                    // Load selected element dynamically
                    await createdLigne.LoadElementAsync(_context);
                }

                LigneDto? ligneDto = null;
                if (createdLigne != null)
                {
                    // Calculate amounts using centralized service for the returned DTO
                    var returnCalculationResult = await LigneCalculations.CalculateAmountsForLigneAsync(_context, createdLigne);
                    
                    // Create DTO and set calculated amounts
                    ligneDto = LigneMappings.ToLigneDto.Compile()(createdLigne);
                    ligneDto.AmountHT = returnCalculationResult.AmountHT;
                    ligneDto.AmountVAT = returnCalculationResult.AmountVAT;
                    ligneDto.AmountTTC = returnCalculationResult.AmountTTC;
                }
                
                return CreatedAtAction(nameof(GetLigne), new { id = ligne.Id }, ligneDto);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while creating the ligne: {ex.Message}");
            }
        }

        /// <summary>
        /// Updates an existing ligne with automatic unit conversion for Item types.
        /// When price or unit is updated, the system applies unit conversion logic
        /// based on the Item's default unit and ItemUnitOfMeasure conversion factors.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLigne(int id, [FromBody] UpdateLigneRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var ligne = await _context.Lignes
                .Include(l => l.LignesElementType)
                    .ThenInclude(let => let!.GeneralAccount)
                .FirstOrDefaultAsync(l => l.Id == id);
                
            if (ligne == null)
                return NotFound("Ligne not found.");

            // Check if line is archived to ERP
            if (!string.IsNullOrEmpty(ligne.ERPLineCode))
                return BadRequest("This line has been archived to the ERP system and cannot be modified.");

            // Track the old GeneralAccount for count management
            GeneralAccounts? oldGeneralAccount = null;
            if (ligne.LignesElementType?.TypeElement == ElementType.GeneralAccounts)
            {
                oldGeneralAccount = ligne.LignesElementType.GeneralAccount;
            }

            // Update fields if provided
            if (!string.IsNullOrWhiteSpace(request.LigneKey))
                ligne.LigneKey = request.LigneKey.Trim();

            if (!string.IsNullOrWhiteSpace(request.Title))
                ligne.Title = request.Title.Trim();

            if (!string.IsNullOrWhiteSpace(request.Article))
                ligne.Article = request.Article.Trim();

            // Update element type and references
            GeneralAccounts? newGeneralAccount = null;
            if (request.LignesElementTypeId.HasValue)
            {
                var elementType = await _context.LignesElementTypes
                    .Include(let => let.Item)
                    .Include(let => let.GeneralAccount)
                    .FirstOrDefaultAsync(let => let.Id == request.LignesElementTypeId.Value);
                
                if (elementType == null)
                    return BadRequest("Invalid LignesElementTypeId. Element type not found.");

                ligne.LignesElementTypeId = request.LignesElementTypeId.Value;
                
                // Track the new GeneralAccount
                if (elementType.TypeElement == ElementType.GeneralAccounts)
                {
                    newGeneralAccount = elementType.GeneralAccount;
                }
                
                // Validate location is only provided for Item types
                if (request.LocationCode != null) // Check for null to allow clearing location
                {
                    if (!string.IsNullOrEmpty(request.LocationCode))
                    {
                        if (elementType.TypeElement != ElementType.Item)
                            return BadRequest("Location can only be specified for Item element types.");
                        
                        // Validate that the location exists
                        var locationExists = await _context.Locations.AnyAsync(l => l.LocationCode == request.LocationCode);
                        if (!locationExists)
                            return BadRequest("Invalid LocationCode. Location not found.");
                    }
                    
                    ligne.LocationCode = request.LocationCode; // Set or clear location
                }
            }
            else if (request.LocationCode != null)
            {
                // If no element type is being updated but location is provided
                if (!string.IsNullOrEmpty(request.LocationCode))
                {
                    // Check current element type
                    if (ligne.LignesElementType?.TypeElement != ElementType.Item)
                        return BadRequest("Location can only be specified for Item element types.");
                    
                    // Validate that the location exists
                    var locationExists = await _context.Locations.AnyAsync(l => l.LocationCode == request.LocationCode);
                    if (!locationExists)
                        return BadRequest("Invalid LocationCode. Location not found.");
                }
                
                ligne.LocationCode = request.LocationCode; // Set or clear location
            }

            // Handle UnitCode updates (only for Item types)
            bool unitChanged = false;
            if (request.UnitCode != null) // Check for null to allow clearing unit
            {
                if (!string.IsNullOrEmpty(request.UnitCode))
                {
                    // Determine the element type (from current or being updated)
                    var elementTypeToCheck = ligne.LignesElementType;
                    if (request.LignesElementTypeId.HasValue)
                    {
                        elementTypeToCheck = await _context.LignesElementTypes
                            .FirstOrDefaultAsync(let => let.Id == request.LignesElementTypeId.Value);
                    }
                    
                    if (elementTypeToCheck?.TypeElement != ElementType.Item)
                        return BadRequest("Unit can only be specified for Item element types.");
                    
                    // Validate that the unit exists
                    var unitExists = await _context.UnitOfMeasures.AnyAsync(u => u.Code == request.UnitCode);
                    if (!unitExists)
                        return BadRequest("Invalid UnitCode. Unit of measure not found.");
                }
                
                // Check if unit is actually changing
                unitChanged = ligne.UnitCode != request.UnitCode;
                ligne.UnitCode = request.UnitCode; // Set or clear unit
            }

            // Update selected element code
            if (!string.IsNullOrWhiteSpace(request.SelectedElementCode))
            {
                ligne.ElementId = request.SelectedElementCode.Trim();
            }

            // Update pricing fields
            if (request.Quantity.HasValue)
            {
                if (request.Quantity.Value <= 0)
                    return BadRequest("Quantity must be greater than 0.");
                ligne.Quantity = request.Quantity.Value;
            }

            if (request.PriceHT.HasValue)
            {
                if (request.PriceHT.Value < 0)
                    return BadRequest("Price HT cannot be negative.");
                
                ligne.PriceHT = request.PriceHT.Value; // Adjusted price calculated by frontend
                ligne.Prix = (float)request.PriceHT.Value; // Update legacy field
            }
            
            if (request.OriginalPriceHT.HasValue)
            {
                ligne.OriginalPriceHT = request.OriginalPriceHT.Value; // Original price for reference
            }

            if (request.DiscountPercentage.HasValue)
            {
                if (request.DiscountPercentage.Value < 0 || request.DiscountPercentage.Value > 1)
                    return BadRequest("Discount percentage must be between 0 and 1.");
                ligne.DiscountPercentage = request.DiscountPercentage.Value;
            }

            if (request.DiscountAmount.HasValue)
            {
                if (request.DiscountAmount.Value < 0)
                    return BadRequest("Discount amount cannot be negative.");
                ligne.DiscountAmount = request.DiscountAmount.Value; // Calculated by frontend
            }

            if (request.VatPercentage.HasValue)
            {
                if (request.VatPercentage.Value < 0 || request.VatPercentage.Value > 1)
                    return BadRequest("VAT percentage must be between 0 and 1.");
                ligne.VatPercentage = request.VatPercentage.Value;
            }

            // Note: Unit conversion and price adjustments are handled by frontend
            // Backend simply stores the values as received

            // Validate the updated ligne
            if (!ligne.IsValid())
                return BadRequest("Invalid ligne data. Please check quantity, prices, and percentages.");

            ligne.UpdatedAt = DateTime.UtcNow;

            try
            {
                // Manage GeneralAccount counts if there's a change
                if (oldGeneralAccount != newGeneralAccount)
                {
                    // Decrement old account count
                    if (oldGeneralAccount != null)
                    {
                        oldGeneralAccount.LinesCount = Math.Max(0, oldGeneralAccount.LinesCount - 1);
                    }
                    
                    // Increment new account count
                    if (newGeneralAccount != null)
                    {
                        newGeneralAccount.LinesCount++;
                    }
                }

                // Update document to track that a ligne was modified
                var document = await _context.Documents.FindAsync(ligne.DocumentId);
                if (document != null)
                {
                    document.UpdatedAt = DateTime.UtcNow;
                    document.UpdatedByUserId = authResult.UserId; // Track who modified the ligne
                }

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while updating the ligne: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLigne(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var ligne = await _context.Lignes
                .Include(l => l.SousLignes)
                .Include(l => l.LignesElementType)
                    .ThenInclude(let => let!.GeneralAccount)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (ligne == null)
                return NotFound("Ligne not found.");

            // Check if line is archived to ERP
            if (!string.IsNullOrEmpty(ligne.ERPLineCode))
                return BadRequest("This line has been archived to the ERP system and cannot be deleted.");

            // Check if there are sous-lignes associated
            if (ligne.SousLignes.Any())
                return BadRequest("Cannot delete ligne. There are sous-lignes associated with it.");

            _context.Lignes.Remove(ligne);

            try
            {
                // If the ligne has a LignesElementType that references a GeneralAccount, decrement the count
                if (ligne.LignesElementType?.TypeElement == ElementType.GeneralAccounts && ligne.LignesElementType.GeneralAccount != null)
                {
                    ligne.LignesElementType.GeneralAccount.LinesCount = Math.Max(0, ligne.LignesElementType.GeneralAccount.LinesCount - 1);
                }

                // Update document to track that a ligne was deleted
                var document = await _context.Documents.FindAsync(ligne.DocumentId);
                if (document != null)
                {
                    document.UpdatedAt = DateTime.UtcNow;
                    document.UpdatedByUserId = authResult.UserId; // Track who deleted the ligne
                }

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while deleting the ligne: {ex.Message}");
            }
        }

        private async Task<string> GenerateUniqueLigneKeyAsync(Document document)
        {
            // Use the document's specific key but remove zero padding from numeric parts
            var documentKey = document.DocumentKey;
            
            // Remove zero padding from document key (e.g., AV2506-0004 becomes AV2506-4)
            var cleanDocumentKey = RemoveZeroPadding(documentKey);
            
            var keyPrefix = $"{cleanDocumentKey}-L";
            
            // Find all existing ligne keys for this document that follow the pattern
            var existingKeys = await _context.Lignes
                .Where(l => l.DocumentId == document.Id && l.LigneKey.StartsWith(keyPrefix))
                .Select(l => l.LigneKey)
                .ToListAsync();
            
            // Extract sequence numbers from existing keys
            var existingSequences = new HashSet<int>();
            foreach (var key in existingKeys)
            {
                var sequencePart = key.Substring(keyPrefix.Length);
                if (int.TryParse(sequencePart, out int sequence))
                {
                    existingSequences.Add(sequence);
                }
            }
            
            // Find the next available sequence number starting from 1
            int nextSequence = 1;
            while (existingSequences.Contains(nextSequence))
            {
                nextSequence++;
            }
            
            // Return the unique ligne key without zero padding (e.g., AV2506-4-L1)
            return $"{keyPrefix}{nextSequence}";
        }

        private static string RemoveZeroPadding(string documentKey)
        {
            // Remove leading zeros but keep at least one digit
            return Regex.Replace(documentKey, @"^0+(?=\d)", "");
        }

        // Add a specific line to ERP
        [HttpPost("{id}/add-to-erp")]
        public async Task<IActionResult> AddLineToErp(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                // Get the line with all necessary relationships
                var ligne = await _context.Lignes
                    .Include(l => l.Document)
                        .ThenInclude(d => d!.DocumentType)
                    .Include(l => l.LignesElementType)
                    .Include(l => l.Location)
                    .Include(l => l.Unit)
                    .FirstOrDefaultAsync(l => l.Id == id);

                if (ligne == null)
                    return NotFound("Line not found");

                // Check if document is archived to ERP
                if (string.IsNullOrEmpty(ligne.Document?.ERPDocumentCode))
                    return BadRequest(new { 
                        message = "Document must be archived to ERP first before adding lines",
                        canAddToErp = false,
                        reason = "document_not_archived"
                    });

                // Check if line is already in ERP
                if (!string.IsNullOrEmpty(ligne.ERPLineCode))
                    return BadRequest(new { 
                        message = "Line is already added to ERP",
                        canAddToErp = false,
                        reason = "line_already_in_erp",
                        erpLineCode = ligne.ERPLineCode
                    });

                // Check if line has necessary data
                if (string.IsNullOrEmpty(ligne.ElementId))
                    return BadRequest(new { 
                        message = "Line must have a valid element (Item or Account) before adding to ERP",
                        canAddToErp = false,
                        reason = "missing_element"
                    });

                // Load element data for the ligne
                await ligne.LoadElementAsync(_context);

                // Validate element data after loading
                if (ligne.LignesElementType?.TypeElement == ElementType.Item && ligne.Item == null)
                {
                    ConsoleColorHelper.WriteError($"[ERP] Item with code '{ligne.ElementId}' not found in database for ligne {ligne.Id}");
                    return BadRequest(new { 
                        message = $"Item with code '{ligne.ElementId}' not found",
                        canAddToErp = false,
                        reason = "item_not_found"
                    });
                }

                if (ligne.LignesElementType?.TypeElement == ElementType.GeneralAccounts && ligne.GeneralAccount == null)
                {
                    ConsoleColorHelper.WriteError($"[ERP] General Account with code '{ligne.ElementId}' not found in database for ligne {ligne.Id}");
                    return BadRequest(new { 
                        message = $"General Account with code '{ligne.ElementId}' not found",
                        canAddToErp = false,
                        reason = "account_not_found"
                    });
                }

                // Build the line payload for BC API
                var linePayload = BuildErpLinePayload(ligne);
                
                // Call the ERP line creation service
                ConsoleColorHelper.WriteInfo($"[ERP] Starting ERP line creation for ligne {ligne.Id}");
                var erpLineResult = await CallBusinessCenterLineApi(linePayload);
                
                if (erpLineResult.IsSuccess)
                {
                    // Check if another line in the SAME DOCUMENT already has this ERP line code
                    var existingLineWithCode = await _context.Lignes
                        .FirstOrDefaultAsync(l => l.ERPLineCode == erpLineResult.Value && 
                                                 l.DocumentId == ligne.DocumentId && 
                                                 l.Id != ligne.Id);
                    
                    if (existingLineWithCode != null)
                    {
                        ConsoleColorHelper.WriteWarning($"[ERP] ERP line code {erpLineResult.Value} already exists for ligne {existingLineWithCode.Id} in the same document");
                        return BadRequest(new { 
                            message = $"ERP line code {erpLineResult.Value} already exists for another line (ID: {existingLineWithCode.Id}) in the same document. This indicates a synchronization issue with Business Central.",
                            success = false,
                            duplicateLineId = existingLineWithCode.Id,
                            erpLineCode = erpLineResult.Value
                        });
                    }
                    
                    // Update ligne with ERP line code
                    ligne.ERPLineCode = erpLineResult.Value;
                    ligne.UpdatedAt = DateTime.UtcNow;
                    
                    await _context.SaveChangesAsync();
                    
                    ConsoleColorHelper.WriteSuccess($"[ERP] Line {ligne.Id} successfully added to ERP with code: {erpLineResult.Value}");
                    
                    return Ok(new { 
                        message = "Line successfully added to ERP",
                        ligneId = ligne.Id,
                        erpLineCode = erpLineResult.Value,
                        success = true
                    });
                }
                else
                {
                    ConsoleColorHelper.WriteError($"[ERP] Failed to add line {ligne.Id} to ERP - Error: {erpLineResult.ErrorMessage}");
                    return StatusCode(500, new { 
                        message = erpLineResult.ErrorMessage ?? "Failed to add line to ERP",
                        errorDetails = erpLineResult.ErrorDetails,
                        errorType = erpLineResult.ErrorType,
                        statusCode = erpLineResult.StatusCode,
                        success = false
                    });
                }
            }
            catch (Exception ex)
            {
                ConsoleColorHelper.WriteException($"[ERP] Exception occurred while adding line {id} to ERP", ex);
                return StatusCode(500, new { 
                    message = $"Error adding line to ERP: {ex.Message}",
                    success = false,
                    exceptionType = ex.GetType().Name
                });
            }
        }

        // Diagnostic endpoint to test ERP connection
        [HttpGet("test-erp-connection")]
        public async Task<IActionResult> TestErpConnection()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                const string apiEndpoint = "http://localhost:25048/BC250/ODataV4/APICreateDocVerse_CreateDocLine?company=CRONUS%20France%20S.A.";
                
                var configuration = HttpContext.RequestServices.GetRequiredService<IConfiguration>();
                var username = configuration["BcApi:Username"];
                var password = configuration["BcApi:Password"];
                var domain = configuration["BcApi:Domain"];

                ConsoleColorHelper.WriteInfo($"Testing ERP connection to: {apiEndpoint}");
                ConsoleColorHelper.WriteInfo($"Using credentials - Username: {username}, Domain: {domain}");

                if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
                {
                    ConsoleColorHelper.WriteError("BC API credentials not configured");
                    return BadRequest(new { 
                        message = "BC API credentials not configured",
                        endpoint = apiEndpoint,
                        hasUsername = !string.IsNullOrEmpty(username),
                        hasPassword = !string.IsNullOrEmpty(password),
                        hasDomain = !string.IsNullOrEmpty(domain)
                    });
                }

                using var handler = new HttpClientHandler()
                {
                    Credentials = new System.Net.NetworkCredential(username, password, domain)
                };
                
                using var httpClient = new HttpClient(handler);
                httpClient.DefaultRequestHeaders.Add("User-Agent", "DocVerse-ConnectionTest/1.0");
                httpClient.DefaultRequestHeaders.Add("Accept", "application/json");

                // Test with a simple GET request first
                try
                {
                    var response = await httpClient.GetAsync(apiEndpoint.Replace("APICreateDocVerse_CreateDocLine", ""));
                    var responseContent = await response.Content.ReadAsStringAsync();
                    
                    ConsoleColorHelper.WriteSuccess($"Connection test response: {response.StatusCode}");
                    
                    return Ok(new {
                        message = "ERP connection test completed",
                        endpoint = apiEndpoint,
                        statusCode = (int)response.StatusCode,
                        isSuccess = response.IsSuccessStatusCode,
                        responseLength = responseContent?.Length ?? 0,
                        username = username,
                        domain = domain
                    });
                }
                catch (Exception ex)
                {
                    ConsoleColorHelper.WriteException("ERP connection test failed", ex);
                    return StatusCode(500, new {
                        message = "ERP connection test failed",
                        error = ex.Message,
                        type = ex.GetType().Name,
                        endpoint = apiEndpoint
                    });
                }
            }
            catch (Exception ex)
            {
                ConsoleColorHelper.WriteException("Error during ERP connection test", ex);
                return StatusCode(500, $"Error during connection test: {ex.Message}");
            }
        }

        // Check if a line can be added to ERP
        [HttpGet("{id}/can-add-to-erp")]
        public async Task<IActionResult> CanAddLineToErp(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                var ligne = await _context.Lignes
                    .Include(l => l.Document)
                    .FirstOrDefaultAsync(l => l.Id == id);

                if (ligne == null)
                    return NotFound("Line not found");

                var canAdd = true;
                var reason = "";
                var message = "";

                // Check if document is archived to ERP
                if (string.IsNullOrEmpty(ligne.Document?.ERPDocumentCode))
                {
                    canAdd = false;
                    reason = "document_not_archived";
                    message = "Document must be archived to ERP first";
                }
                // Check if line is already in ERP
                else if (!string.IsNullOrEmpty(ligne.ERPLineCode))
                {
                    canAdd = false;
                    reason = "line_already_in_erp";
                    message = "Line is already in ERP";
                }
                // Check if line has necessary data
                else if (string.IsNullOrEmpty(ligne.ElementId))
                {
                    canAdd = false;
                    reason = "missing_element";
                    message = "Line must have a valid element (Item or Account)";
                }

                return Ok(new {
                    ligneId = ligne.Id,
                    canAddToErp = canAdd,
                    reason = reason,
                    message = message,
                    documentErpCode = ligne.Document?.ERPDocumentCode,
                    lineErpCode = ligne.ERPLineCode,
                    hasElement = !string.IsNullOrEmpty(ligne.ElementId)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error checking line ERP status: {ex.Message}");
            }
        }

        private object BuildErpLinePayload(Ligne ligne)
        {
            if (ligne.Document == null)
                throw new InvalidOperationException("Line document is not loaded");

            // Determine tierType based on DocumentType.TierType
            int tierType = ligne.Document.DocumentType?.TierType switch
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

            // Get location code (only for Item types)
            string locationCode = "";
            if (type == 2) // Item type
            {
                locationCode = ligne.LocationCode ?? "";
            }

            var payload = new
            {
                tierTYpe = tierType,
                docType = ligne.Document.DocumentType?.TypeNumber ?? 0,
                docNo = ligne.Document.ERPDocumentCode ?? "",
                type = type,
                codeLine = codeLine,
                descriptionLine = ligne.Title ?? "",
                locationCOde = locationCode, // Note: Capital O as required by BC API
                qty = ligne.Quantity,
                uniteOfMeasure = uniteOfMeasure,
                unitpriceCOst = ligne.PriceHT,
                discountAmt = ligne.DiscountAmount
            };

            // Log payload creation with colored output
            ConsoleColorHelper.WriteDebug($"[ERP] Building payload for ligne {ligne.Id}:");
            ConsoleColorHelper.WriteDebug($"[ERP] - TierType: {tierType} (from {ligne.Document.DocumentType?.TierType})");
            ConsoleColorHelper.WriteDebug($"[ERP] - DocType: {ligne.Document.DocumentType?.TypeNumber ?? 0}");
            ConsoleColorHelper.WriteDebug($"[ERP] - DocNo: {ligne.Document.ERPDocumentCode}");
            ConsoleColorHelper.WriteDebug($"[ERP] - Type: {type} (from {ligne.LignesElementType?.TypeElement})");
            ConsoleColorHelper.WriteDebug($"[ERP] - CodeLine: {codeLine}");
            ConsoleColorHelper.WriteDebug($"[ERP] - Description: {ligne.Title}");
            ConsoleColorHelper.WriteDebug($"[ERP] - LocationCode: {locationCode} (sent as locationCOde)");
            ConsoleColorHelper.WriteDebug($"[ERP] - Qty: {ligne.Quantity}");
            ConsoleColorHelper.WriteDebug($"[ERP] - UniteOfMeasure: {uniteOfMeasure}");
            ConsoleColorHelper.WriteDebug($"[ERP] - UnitPrice: {ligne.PriceHT}");
            ConsoleColorHelper.WriteDebug($"[ERP] - DiscountAmt: {ligne.DiscountAmount}");

            return payload;
        }

        private async Task<ErpOperationResult> CallBusinessCenterLineApi(object payload)
        {
            const string apiEndpoint = "http://localhost:25048/BC250/ODataV4/APICreateDocVerse_CreateDocLine?company=CRONUS%20France%20S.A.";
            
            // Get NTLM credentials from configuration
            var configuration = HttpContext.RequestServices.GetRequiredService<IConfiguration>();
            var username = configuration["BcApi:Username"] ?? throw new InvalidOperationException("BcApi:Username not configured");
            var password = configuration["BcApi:Password"] ?? throw new InvalidOperationException("BcApi:Password not configured");
            var domain = configuration["BcApi:Domain"] ?? "";

            using var handler = new HttpClientHandler()
            {
                Credentials = new System.Net.NetworkCredential(username, password, domain)
            };
            
            using var httpClient = new HttpClient(handler);
            httpClient.DefaultRequestHeaders.Add("User-Agent", "DocVerse-LineCreation/1.0");
            httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
            
            try
            {
                var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                // Info logging for API call
                ConsoleColorHelper.WriteInfo($"[ERP] Calling BC API: {apiEndpoint}");
                ConsoleColorHelper.WriteInfo($"[ERP] Payload: {json}");
                ConsoleColorHelper.WriteInfo($"[ERP] Username: {username}, Domain: {domain}");

                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await httpClient.PostAsync(apiEndpoint, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (response.IsSuccessStatusCode)
                {
                    // Success logging
                    ConsoleColorHelper.WriteSuccess($"[ERP] API call successful - Status: {response.StatusCode}");
                    ConsoleColorHelper.WriteSuccess($"[ERP] Response Content: {responseContent}");
                    
                    // Parse the response to extract the line code
                    if (!string.IsNullOrWhiteSpace(responseContent))
                    {
                        try
                        {
                            var responseObj = JsonSerializer.Deserialize<JsonElement>(responseContent);
                            if (responseObj.TryGetProperty("value", out var valueElement))
                            {
                                // Handle both string and integer values from BC API
                                var lineCode = valueElement.ValueKind switch
                                {
                                    JsonValueKind.String => valueElement.GetString(),
                                    JsonValueKind.Number => valueElement.GetInt32().ToString(),
                                    _ => valueElement.ToString()
                                };
                                return ErpOperationResult.Success(lineCode ?? responseContent.Trim('"'));
                            }
                            return ErpOperationResult.Success(responseContent.Trim('"'));
                        }
                        catch (JsonException ex)
                        {
                            ConsoleColorHelper.WriteWarning($"[ERP] Failed to parse response JSON, using raw content: {ex.Message}");
                            return ErpOperationResult.Success(responseContent.Trim().Trim('"'));
                        }
                    }
                    return ErpOperationResult.Success(responseContent);
                }
                else
                {
                    // Extract meaningful error message from Business Central response
                    string userFriendlyError = ExtractBusinessCentralLineError(responseContent, (int)response.StatusCode);
                    
                    // Error logging
                    ConsoleColorHelper.WriteError($"[ERP] API call failed - Status: {response.StatusCode}");
                    ConsoleColorHelper.WriteError($"[ERP] Response Content: {responseContent}");
                    ConsoleColorHelper.WriteError($"[ERP] Request Headers: {string.Join(", ", httpClient.DefaultRequestHeaders.Select(h => $"{h.Key}: {string.Join(", ", h.Value)}"))}");
                    ConsoleColorHelper.WriteError($"[ERP] Response Headers: {string.Join(", ", response.Headers.Select(h => $"{h.Key}: {string.Join(", ", h.Value)}"))}");
                    
                    return ErpOperationResult.Failure(
                        userFriendlyError,
                        responseContent,
                        (int)response.StatusCode,
                        GetErrorTypeFromStatusCode((int)response.StatusCode)
                    );
                }
            }
            catch (HttpRequestException ex)
            {
                ConsoleColorHelper.WriteException("[ERP] Network error calling BC Line API", ex);
                ConsoleColorHelper.WriteError($"[ERP] Endpoint: {apiEndpoint}");
                ConsoleColorHelper.WriteError($"[ERP] Credentials - Username: {username}, Domain: {domain}");
                return ErpOperationResult.Failure(
                    "Unable to connect to Business Central ERP system. Please check network connectivity.",
                    ex.Message,
                    null,
                    "NetworkError"
                );
            }
            catch (TaskCanceledException ex)
            {
                ConsoleColorHelper.WriteException("[ERP] Timeout calling BC Line API", ex);
                return ErpOperationResult.Failure(
                    "ERP line creation timed out. The system may be busy, please try again later.",
                    ex.Message,
                    null,
                    "TimeoutError"
                );
            }
            catch (Exception ex)
            {
                // Exception logging with detailed information
                ConsoleColorHelper.WriteException("[ERP] API call exception", ex);
                ConsoleColorHelper.WriteError($"[ERP] Payload that caused error: {JsonSerializer.Serialize(payload, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase, WriteIndented = true })}");
                ConsoleColorHelper.WriteError($"[ERP] Endpoint: {apiEndpoint}");
                ConsoleColorHelper.WriteError($"[ERP] Credentials - Username: {username}, Domain: {domain}");
                return ErpOperationResult.Failure(
                    "An unexpected error occurred while creating the line in the ERP system.",
                    ex.Message,
                    null,
                    "UnexpectedError"
                );
            }
        }

        // Diagnostic endpoint to fix existing lines with raw JSON ERP codes
        [HttpPost("fix-erp-line-codes")]
        public async Task<IActionResult> FixErpLineCodes()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                var lignesWithRawJson = await _context.Lignes
                    .Where(l => !string.IsNullOrEmpty(l.ERPLineCode) && 
                               (l.ERPLineCode.Contains("@odata.context") || l.ERPLineCode.Contains("value")))
                    .ToListAsync();

                int fixedCount = 0;
                var fixedLines = new List<object>();

                foreach (var ligne in lignesWithRawJson)
                {
                    var originalCode = ligne.ERPLineCode;
                    
                    try
                    {
                        var responseObj = JsonSerializer.Deserialize<JsonElement>(originalCode);
                        if (responseObj.TryGetProperty("value", out var valueElement))
                        {
                            var cleanCode = valueElement.ValueKind switch
                            {
                                JsonValueKind.String => valueElement.GetString(),
                                JsonValueKind.Number => valueElement.GetInt32().ToString(),
                                _ => valueElement.ToString()
                            };

                            if (!string.IsNullOrEmpty(cleanCode))
                            {
                                ligne.ERPLineCode = cleanCode;
                                ligne.UpdatedAt = DateTime.UtcNow;
                                fixedCount++;
                                
                                fixedLines.Add(new {
                                    ligneId = ligne.Id,
                                    originalCode = originalCode,
                                    cleanCode = cleanCode
                                });

                                ConsoleColorHelper.WriteSuccess($"[FIX] Fixed ligne {ligne.Id}: '{originalCode}' -> '{cleanCode}'");
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        ConsoleColorHelper.WriteWarning($"[FIX] Failed to parse JSON for ligne {ligne.Id}: {ex.Message}");
                    }
                }

                if (fixedCount > 0)
                {
                    await _context.SaveChangesAsync();
                    ConsoleColorHelper.WriteSuccess($"[FIX] Successfully fixed {fixedCount} lines");
                }

                return Ok(new {
                    message = $"Fixed {fixedCount} lines with raw JSON ERP codes",
                    fixedCount = fixedCount,
                    totalFound = lignesWithRawJson.Count,
                    fixedLines = fixedLines
                });
            }
            catch (Exception ex)
            {
                ConsoleColorHelper.WriteException("[FIX] Error fixing ERP line codes", ex);
                return StatusCode(500, $"Error fixing ERP line codes: {ex.Message}");
            }
        }

        // Helper method for line-specific error extraction
        private string ExtractBusinessCentralLineError(string responseContent, int statusCode)
        {
            if (string.IsNullOrWhiteSpace(responseContent))
            {
                return GetGenericErrorMessage(statusCode, "line creation");
            }

            try
            {
                var responseObj = JsonSerializer.Deserialize<JsonElement>(responseContent);
                
                if (responseObj.TryGetProperty("error", out var errorObj))
                {
                    if (errorObj.TryGetProperty("message", out var messageObj))
                    {
                        var message = messageObj.GetString();
                        return TranslateBusinessCentralMessage(message ?? responseContent, "line creation");
                    }
                }
                
                if (responseObj.TryGetProperty("message", out var directMessage))
                {
                    var message = directMessage.GetString();
                    return TranslateBusinessCentralMessage(message ?? responseContent, "line creation");
                }
            }
            catch (JsonException)
            {
                return TranslateBusinessCentralMessage(responseContent, "line creation");
            }

            return GetGenericErrorMessage(statusCode, "line creation");
        }

        // Helper method to translate Business Central error messages to user-friendly messages
        private string TranslateBusinessCentralMessage(string bcMessage, string operation)
        {
            var lowerMessage = bcMessage.ToLower();

            // Common Business Central error patterns
            if (lowerMessage.Contains("item") && lowerMessage.Contains("not found"))
                return "The specified item does not exist in Business Central. Please verify the item code.";
            
            if (lowerMessage.Contains("account") && lowerMessage.Contains("not found"))
                return "The specified general ledger account does not exist in Business Central. Please verify the account code.";
            
            if (lowerMessage.Contains("customer") && lowerMessage.Contains("not found"))
                return "The specified customer does not exist in Business Central. Please verify the customer code.";
            
            if (lowerMessage.Contains("vendor") && lowerMessage.Contains("not found"))
                return "The specified vendor does not exist in Business Central. Please verify the vendor code.";
            
            if (lowerMessage.Contains("location") && lowerMessage.Contains("not found"))
                return "The specified location does not exist in Business Central. Please verify the location code.";
            
            if (lowerMessage.Contains("unit of measure") || lowerMessage.Contains("uom"))
                return "Invalid unit of measure. Please verify the unit code exists for this item in Business Central.";
            
            if (lowerMessage.Contains("responsibility center") || lowerMessage.Contains("responsibility centre"))
                return "The specified responsibility center does not exist in Business Central. Please verify the center code.";
            
            if (lowerMessage.Contains("dimension") || lowerMessage.Contains("shortcut dimension"))
                return "Invalid dimension value. Please verify the dimension settings in Business Central.";
            
            if (lowerMessage.Contains("posting date"))
                return "Invalid posting date. Please check the date falls within an open accounting period.";
            
            if (lowerMessage.Contains("document date"))
                return "Invalid document date. Please verify the date format and value.";
            
            if (lowerMessage.Contains("quantity") && lowerMessage.Contains("negative"))
                return "Negative quantities are not allowed for this operation.";
            
            if (lowerMessage.Contains("price") && (lowerMessage.Contains("negative") || lowerMessage.Contains("invalid")))
                return "Invalid price value. Please enter a valid positive price.";
            
            if (lowerMessage.Contains("currency"))
                return "Currency code issue. Please verify the currency is valid in Business Central.";
            
            if (lowerMessage.Contains("blocked"))
                return "The record is blocked in Business Central and cannot be used for new transactions.";
            
            if (lowerMessage.Contains("permission") || lowerMessage.Contains("access"))
                return "Insufficient permissions to perform this operation in Business Central. Contact your administrator.";
            
            if (lowerMessage.Contains("connection") || lowerMessage.Contains("timeout"))
                return "Connection issue with Business Central. Please try again later.";

            // If no specific pattern matches, return the original message with context
            return $"Business Central {operation} error: {bcMessage}";
        }

        // Helper method to get generic error messages based on status code
        private string GetGenericErrorMessage(int statusCode, string operation)
        {
            return statusCode switch
            {
                400 => $"Invalid data provided for {operation}. Please check all required fields.",
                401 => "Authentication failed with Business Central. Please check API credentials.",
                403 => "Access denied to Business Central. Contact your administrator for permissions.",
                404 => "Business Central API endpoint not found. Please verify system configuration.",
                500 => "Business Central server error occurred. Please try again later or contact support.",
                502 => "Business Central service is temporarily unavailable. Please try again later.",
                503 => "Business Central service is temporarily unavailable. Please try again later.",
                _ => $"An error occurred during {operation} (HTTP {statusCode}). Please try again or contact support."
            };
        }

        // Helper method to categorize error types
        private string GetErrorTypeFromStatusCode(int statusCode)
        {
            return statusCode switch
            {
                400 => "ValidationError",
                401 => "AuthenticationError",
                403 => "AuthorizationError",
                404 => "NotFoundError",
                408 => "TimeoutError",
                429 => "RateLimitError",
                500 => "ServerError",
                502 => "ServiceUnavailableError",
                503 => "ServiceUnavailableError",
                504 => "TimeoutError",
                _ => "UnknownError"
            };
        }
    }
}
