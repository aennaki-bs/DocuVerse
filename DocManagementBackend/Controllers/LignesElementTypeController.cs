using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using DocManagementBackend.Services;
using Microsoft.AspNetCore.Authorization;

namespace DocManagementBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LignesElementTypeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly LineElementService _lineElementService;
        private readonly UserAuthorizationService _authService;

        public LignesElementTypeController(
            ApplicationDbContext context, 
            LineElementService lineElementService,
            UserAuthorizationService authService)
        {
            _context = context;
            _lineElementService = lineElementService;
            _authService = authService;
        }

        // GET: api/LignesElementType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LignesElementTypeDto>>> GetLignesElementTypes()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var elementTypes = await _lineElementService.GetAllElementTypesAsync();
            
            var dtos = elementTypes.Select(let => new LignesElementTypeDto
            {
                Id = let.Id,
                Code = let.Code,
                TypeElement = let.TypeElement.ToString(),
                Description = let.Description,
                TableName = let.TableName,
                ItemCode = let.ItemCode,
                AccountCode = let.AccountCode,
                Item = let.Item == null ? null : new ItemDto
                {
                    Code = let.Item.Code,
                    Description = let.Item.Description,
                    Unite = let.Item.Unite,
                    UniteCodeNavigation = let.Item.UniteCodeNavigation == null ? null : new UniteCodeDto
                    {
                        Code = let.Item.UniteCodeNavigation.Code,
                        Description = let.Item.UniteCodeNavigation.Description,
                        CreatedAt = let.Item.UniteCodeNavigation.CreatedAt,
                        UpdatedAt = let.Item.UniteCodeNavigation.UpdatedAt,
                        ItemsCount = let.Item.UniteCodeNavigation.Items.Count()
                    },
                    CreatedAt = let.Item.CreatedAt,
                    UpdatedAt = let.Item.UpdatedAt,
                    ElementTypesCount = let.Item.LignesElementTypes.Count()
                },
                GeneralAccount = let.GeneralAccount == null ? null : new GeneralAccountsDto
                {
                    Code = let.GeneralAccount.Code,
                    Description = let.GeneralAccount.Description,
                    AccountType = let.GeneralAccount.AccountType,
                    CreatedAt = let.GeneralAccount.CreatedAt,
                    UpdatedAt = let.GeneralAccount.UpdatedAt,
                    LignesCount = let.GeneralAccount.LignesElementTypes.Count()
                },
                CreatedAt = let.CreatedAt,
                UpdatedAt = let.UpdatedAt
            }).ToList();

            return Ok(dtos);
        }

        // GET: api/LignesElementType/simple
        [HttpGet("simple")]
        // [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<LignesElementTypeSimpleDto>>> GetLignesElementTypesSimple()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;
            
            var elementTypes = await _context.LignesElementTypes
                .Select(let => new LignesElementTypeSimpleDto
                {
                    Id = let.Id,
                    Code = let.Code,
                    TypeElement = let.TypeElement.ToString(),
                    Description = let.Description
                })
                .OrderBy(let => let.Code)
                .ToListAsync();

            return Ok(elementTypes);
        }

        // GET: api/LignesElementType/by-type/Item
        [HttpGet("by-type/{typeElement}")]
        public async Task<ActionResult<IEnumerable<LignesElementTypeDto>>> GetLignesElementTypesByType(string typeElement)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var elementTypes = await _lineElementService.GetElementTypesByTypeAsync(typeElement);
            
            var dtos = elementTypes.Select(let => new LignesElementTypeDto
            {
                Id = let.Id,
                Code = let.Code,
                TypeElement = let.TypeElement.ToString(),
                Description = let.Description,
                TableName = let.TableName,
                ItemCode = let.ItemCode,
                AccountCode = let.AccountCode,
                CreatedAt = let.CreatedAt,
                UpdatedAt = let.UpdatedAt
            }).ToList();

            return Ok(dtos);
        }

        // GET: api/LignesElementType/5
        [HttpGet("{id}")]
        public async Task<ActionResult<LignesElementTypeDto>> GetLignesElementType(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var elementType = await _context.LignesElementTypes
                .Include(let => let.Item).ThenInclude(i => i!.UniteCodeNavigation)
                .Include(let => let.GeneralAccount)
                .FirstOrDefaultAsync(let => let.Id == id);

            if (elementType == null)
                return NotFound("Line element type not found.");

            var dto = new LignesElementTypeDto
            {
                Id = elementType.Id,
                Code = elementType.Code,
                TypeElement = elementType.TypeElement.ToString(),
                Description = elementType.Description,
                TableName = elementType.TableName,
                ItemCode = elementType.ItemCode,
                AccountCode = elementType.AccountCode,
                Item = elementType.Item == null ? null : new ItemDto
                {
                    Code = elementType.Item.Code,
                    Description = elementType.Item.Description,
                    Unite = elementType.Item.Unite,
                    UniteCodeNavigation = elementType.Item.UniteCodeNavigation == null ? null : new UniteCodeDto
                    {
                        Code = elementType.Item.UniteCodeNavigation.Code,
                        Description = elementType.Item.UniteCodeNavigation.Description,
                        CreatedAt = elementType.Item.UniteCodeNavigation.CreatedAt,
                        UpdatedAt = elementType.Item.UniteCodeNavigation.UpdatedAt,
                        ItemsCount = elementType.Item.UniteCodeNavigation.Items.Count()
                    },
                    CreatedAt = elementType.Item.CreatedAt,
                    UpdatedAt = elementType.Item.UpdatedAt,
                    ElementTypesCount = elementType.Item.LignesElementTypes.Count()
                },
                GeneralAccount = elementType.GeneralAccount == null ? null : new GeneralAccountsDto
                {
                    Code = elementType.GeneralAccount.Code,
                    Description = elementType.GeneralAccount.Description,
                    AccountType = elementType.GeneralAccount.AccountType,
                    CreatedAt = elementType.GeneralAccount.CreatedAt,
                    UpdatedAt = elementType.GeneralAccount.UpdatedAt,
                    LignesCount = elementType.GeneralAccount.LignesElementTypes.Count()
                },
                CreatedAt = elementType.CreatedAt,
                UpdatedAt = elementType.UpdatedAt
            };

            return Ok(dto);
        }

        // GET: api/LignesElementType/5/in-use
        [HttpGet("{id}/in-use")]
        public async Task<ActionResult<bool>> IsLignesElementTypeInUse(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var elementType = await _context.LignesElementTypes.FindAsync(id);
            if (elementType == null)
                return NotFound("Line element type not found.");

            var isInUse = await _lineElementService.IsElementTypeInUseAsync(id);
            return Ok(isInUse);
        }

        // POST: api/LignesElementType
        [HttpPost]
        public async Task<ActionResult<LignesElementTypeDto>> CreateLignesElementType([FromBody] CreateLignesElementTypeRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest("Code is required.");

            if (string.IsNullOrWhiteSpace(request.TypeElement))
                return BadRequest("TypeElement is required.");

            if (string.IsNullOrWhiteSpace(request.Description))
                return BadRequest("Description is required.");

            // Check if code already exists
            var existingCode = await _context.LignesElementTypes
                .AnyAsync(let => let.Code.ToUpper() == request.Code.ToUpper());

            if (existingCode)
                return BadRequest("A line element type with this code already exists.");

            var elementType = new LignesElementType
            {
                Code = request.Code.ToUpper().Trim(),
                TypeElementString = request.TypeElement.Trim(),
                Description = request.Description.Trim(),
                TableName = request.TableName?.Trim() ?? string.Empty,
                ItemCode = string.IsNullOrWhiteSpace(request.ItemCode) ? null : request.ItemCode.Trim(),
                AccountCode = string.IsNullOrWhiteSpace(request.AccountCode) ? null : request.AccountCode.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Validate the element type
            if (!await _lineElementService.ValidateElementTypeAsync(elementType))
                return BadRequest("Invalid line element type configuration. Please check the type and referenced codes.");

            _context.LignesElementTypes.Add(elementType);

            try
            {
                await _context.SaveChangesAsync();

                var createdDto = new LignesElementTypeDto
                {
                    Id = elementType.Id,
                    Code = elementType.Code,
                    TypeElement = elementType.TypeElement.ToString(),
                    Description = elementType.Description,
                    TableName = elementType.TableName,
                    ItemCode = elementType.ItemCode,
                    AccountCode = elementType.AccountCode,
                    CreatedAt = elementType.CreatedAt,
                    UpdatedAt = elementType.UpdatedAt
                };

                return CreatedAtAction(nameof(GetLignesElementType), new { id = elementType.Id }, createdDto);
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("A line element type with this code already exists.");
                
                return StatusCode(500, $"An error occurred while creating the line element type: {ex.Message}");
            }
        }

        // POST: api/LignesElementType/for-item/{itemCode}
        [HttpPost("for-item/{itemCode}")]
        public async Task<ActionResult<LignesElementTypeDto>> CreateElementTypeForItem(string itemCode)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                var elementType = await _lineElementService.GetOrCreateItemElementTypeAsync(itemCode);

                var dto = new LignesElementTypeDto
                {
                    Id = elementType.Id,
                    Code = elementType.Code,
                    TypeElement = elementType.TypeElement.ToString(),
                    Description = elementType.Description,
                    TableName = elementType.TableName,
                    ItemCode = elementType.ItemCode,
                    AccountCode = elementType.AccountCode,
                    CreatedAt = elementType.CreatedAt,
                    UpdatedAt = elementType.UpdatedAt
                };

                return Ok(dto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // POST: api/LignesElementType/for-account/{accountCode}
        [HttpPost("for-account/{accountCode}")]
        public async Task<ActionResult<LignesElementTypeDto>> CreateElementTypeForAccount(string accountCode)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                var elementType = await _lineElementService.GetOrCreateGeneralAccountElementTypeAsync(accountCode);

                var dto = new LignesElementTypeDto
                {
                    Id = elementType.Id,
                    Code = elementType.Code,
                    TypeElement = elementType.TypeElement.ToString(),
                    Description = elementType.Description,
                    TableName = elementType.TableName,
                    ItemCode = elementType.ItemCode,
                    AccountCode = elementType.AccountCode,
                    CreatedAt = elementType.CreatedAt,
                    UpdatedAt = elementType.UpdatedAt
                };

                return Ok(dto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        // PUT: api/LignesElementType/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLignesElementType(int id, [FromBody] UpdateLignesElementTypeRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var elementType = await _context.LignesElementTypes.FindAsync(id);
            if (elementType == null)
                return NotFound("Line element type not found.");

            // Create a copy of the element type with proposed changes to validate
            var proposedElementType = new LignesElementType
            {
                Id = elementType.Id,
                Code = !string.IsNullOrWhiteSpace(request.Code) ? request.Code.ToUpper().Trim() : elementType.Code,
                TypeElementString = !string.IsNullOrWhiteSpace(request.TypeElement) ? request.TypeElement.Trim() : elementType.TypeElementString,
                Description = !string.IsNullOrWhiteSpace(request.Description) ? request.Description.Trim() : elementType.Description,
                TableName = !string.IsNullOrWhiteSpace(request.TableName) ? request.TableName.Trim() : elementType.TableName,
                ItemCode = request.ItemCode != null ? (string.IsNullOrWhiteSpace(request.ItemCode) ? null : request.ItemCode.Trim()) : elementType.ItemCode,
                AccountCode = request.AccountCode != null ? (string.IsNullOrWhiteSpace(request.AccountCode) ? null : request.AccountCode.Trim()) : elementType.AccountCode,
                CreatedAt = elementType.CreatedAt,
                UpdatedAt = DateTime.UtcNow
            };

            // Validate if the update can be safely performed
            var (canUpdate, errorMessage) = await _lineElementService.CanUpdateElementTypeAsync(id, proposedElementType);
            if (!canUpdate)
            {
                return BadRequest(errorMessage);
            }

            // Update fields if provided
            if (!string.IsNullOrWhiteSpace(request.Code))
            {
                // Check if new code already exists
                var existingCode = await _context.LignesElementTypes
                    .AnyAsync(let => let.Code.ToUpper() == request.Code.ToUpper() && let.Id != id);

                if (existingCode)
                    return BadRequest("A line element type with this code already exists.");

                elementType.Code = request.Code.ToUpper().Trim();
            }

            if (!string.IsNullOrWhiteSpace(request.TypeElement))
            {
                elementType.TypeElementString = request.TypeElement.Trim();
                
                // Clear opposite foreign key fields based on new type
                if (elementType.TypeElementString == "Item")
                {
                    elementType.AccountCode = null; // Clear account code when switching to Item
                }
                else if (elementType.TypeElementString == "General Accounts")
                {
                    elementType.ItemCode = null; // Clear item code when switching to General Accounts
                }
            }

            if (!string.IsNullOrWhiteSpace(request.Description))
                elementType.Description = request.Description.Trim();

            if (!string.IsNullOrWhiteSpace(request.TableName))
                elementType.TableName = request.TableName.Trim();

            // Update foreign key fields only if explicitly provided and matches the type
            if (request.ItemCode != null && elementType.TypeElementString == "Item")
                elementType.ItemCode = string.IsNullOrWhiteSpace(request.ItemCode) ? null : request.ItemCode.Trim();

            if (request.AccountCode != null && elementType.TypeElementString == "General Accounts")
                elementType.AccountCode = string.IsNullOrWhiteSpace(request.AccountCode) ? null : request.AccountCode.Trim();

            elementType.UpdatedAt = DateTime.UtcNow;

            // Validate the updated element type
            if (!await _lineElementService.ValidateElementTypeAsync(elementType))
                return BadRequest("Invalid line element type configuration. Please check the type and referenced codes.");

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("A line element type with this code already exists.");
                
                return StatusCode(500, $"An error occurred while updating the line element type: {ex.Message}");
            }
        }

        // DELETE: api/LignesElementType/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLignesElementType(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var success = await _lineElementService.DeleteElementTypeAsync(id);
            
            if (!success)
            {
                var elementType = await _context.LignesElementTypes.FindAsync(id);
                if (elementType == null)
                    return NotFound("Line element type not found.");
                
                return BadRequest("Cannot delete line element type. There are lines associated with it.");
            }

            return NoContent();
        }
    }
} 