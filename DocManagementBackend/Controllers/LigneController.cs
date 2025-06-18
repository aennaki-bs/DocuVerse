using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using DocManagementBackend.Mappings;
using DocManagementBackend.Services;
using System.Security.Claims;
using System.Linq;

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
                .ToListAsync();

            // Load selected elements dynamically for each ligne
            foreach (var ligne in lignes)
            {
                await ligne.LoadElementAsync(_context);
            }

            var lignesDtos = lignes.Select(LigneMappings.ToLigneDto.Compile()).ToList();
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
                .FirstOrDefaultAsync(l => l.Id == id);
                
            if (ligne == null)
                return NotFound("Ligne not found.");

            // Load selected element dynamically
            await ligne.LoadElementAsync(_context);

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
                .ToListAsync();

            // Load selected elements dynamically for each ligne
            foreach (var ligne in lignes)
            {
                await ligne.LoadElementAsync(_context);
            }

            var lignesDtos = lignes.Select(LigneMappings.ToLigneDto.Compile()).ToList();
            return Ok(lignesDtos);
        }

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

            // Create the ligne entity
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
                Quantity = request.Quantity,
                PriceHT = request.PriceHT,
                DiscountPercentage = request.DiscountPercentage,
                DiscountAmount = request.DiscountAmount,
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
                    .FirstOrDefaultAsync(l => l.Id == ligne.Id);

                if (createdLigne != null)
                {
                    // Load selected element dynamically
                    await createdLigne.LoadElementAsync(_context);
                }

                var ligneDto = createdLigne != null ? LigneMappings.ToLigneDto.Compile()(createdLigne) : null;
                
                return CreatedAtAction(nameof(GetLigne), new { id = ligne.Id }, ligneDto);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while creating the ligne: {ex.Message}");
            }
        }

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
                ligne.PriceHT = request.PriceHT.Value;
                ligne.Prix = (float)request.PriceHT.Value; // Update legacy field
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
                ligne.DiscountAmount = request.DiscountAmount.Value;
            }

            if (request.VatPercentage.HasValue)
            {
                if (request.VatPercentage.Value < 0 || request.VatPercentage.Value > 1)
                    return BadRequest("VAT percentage must be between 0 and 1.");
                ligne.VatPercentage = request.VatPercentage.Value;
            }

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
            // Handle cases like AV2506-0004 -> AV2506-4
            var parts = documentKey.Split('-');
            for (int i = 0; i < parts.Length; i++)
            {
                // If the part is all digits and starts with 0, remove leading zeros
                if (parts[i].All(char.IsDigit) && parts[i].Length > 1 && parts[i].StartsWith('0'))
                {
                    parts[i] = int.Parse(parts[i]).ToString();
                }
            }
            return string.Join("-", parts);
        }
    }
}
