using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using Microsoft.AspNetCore.Authorization;
using DocManagementBackend.Services;

namespace DocManagementBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ItemController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public ItemController(ApplicationDbContext context, UserAuthorizationService authService)
        {
            _context = context;
            _authService = authService;
        }

        // GET: api/Item
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ItemDto>>> GetItems()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var items = await _context.Items
                .Include(i => i.UniteCodeNavigation)
                .Select(i => new ItemDto
                {
                    Code = i.Code,
                    Description = i.Description,
                    Unite = i.Unite,
                    UniteCodeNavigation = i.UniteCodeNavigation != null ? new UniteCodeDto
                    {
                        Code = i.UniteCodeNavigation.Code,
                        Description = i.UniteCodeNavigation.Description,
                        CreatedAt = i.UniteCodeNavigation.CreatedAt,
                        UpdatedAt = i.UniteCodeNavigation.UpdatedAt,
                        ItemsCount = i.UniteCodeNavigation.ItemsCount
                    } : null,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt,
                    ElementTypesCount = _context.Lignes.Count(l => l.ElementId == i.Code)
                })
                .OrderBy(i => i.Code)
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/Item/simple
        [HttpGet("simple")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ItemSimpleDto>>> GetItemsSimple()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var items = await _context.Items
                .Select(i => new ItemSimpleDto
                {
                    Code = i.Code,
                    Description = i.Description,
                    Unite = i.Unite
                })
                .OrderBy(i => i.Code)
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/Item/ABC123
        [HttpGet("{code}")]
        public async Task<ActionResult<ItemDto>> GetItem(string code)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var item = await _context.Items
                .Include(i => i.UniteCodeNavigation)
                .Where(i => i.Code == code)
                .Select(i => new ItemDto
                {
                    Code = i.Code,
                    Description = i.Description,
                    Unite = i.Unite,
                    UniteCodeNavigation = i.UniteCodeNavigation != null ? new UniteCodeDto
                    {
                        Code = i.UniteCodeNavigation.Code,
                        Description = i.UniteCodeNavigation.Description,
                        CreatedAt = i.UniteCodeNavigation.CreatedAt,
                        UpdatedAt = i.UniteCodeNavigation.UpdatedAt,
                        ItemsCount = i.UniteCodeNavigation.ItemsCount
                    } : null,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt,
                    ElementTypesCount = _context.Lignes.Count(l => l.ElementId == i.Code)
                })
                .FirstOrDefaultAsync();

            if (item == null)
                return NotFound("Item not found.");

            return Ok(item);
        }

        // GET: api/Item/ABC123/units
        [HttpGet("{code}/units")]
        public async Task<ActionResult<IEnumerable<ItemUnitOfMeasureDto>>> GetItemUnits(string code)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // First verify the item exists
            var itemExists = await _context.Items
                .AnyAsync(i => i.Code == code);

            if (!itemExists)
                return NotFound("Item not found.");

            var itemUnits = await _context.ItemUnitOfMeasures
                .Include(ium => ium.UnitOfMeasure)
                .Where(ium => ium.ItemCode == code)
                .Select(ium => new ItemUnitOfMeasureDto
                {
                    Id = ium.Id,
                    ItemCode = ium.ItemCode,
                    UnitOfMeasureCode = ium.UnitOfMeasureCode,
                    UnitOfMeasureDescription = ium.UnitOfMeasure.Description,
                    QtyPerUnitOfMeasure = ium.QtyPerUnitOfMeasure,
                    CreatedAt = ium.CreatedAt,
                    UpdatedAt = ium.UpdatedAt
                })
                .OrderBy(ium => ium.UnitOfMeasureCode)
                .ToListAsync();

            return Ok(itemUnits);
        }

        // POST: api/Item/validate-code
        [HttpPost("validate-code")]
        public async Task<IActionResult> ValidateCode([FromBody] CreateItemRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest("Code is required.");

            var exists = await _context.Items
                .AnyAsync(i => i.Code.ToUpper() == request.Code.ToUpper());

            return Ok(!exists);
        }

        // POST: api/Item
        [HttpPost]
        public async Task<ActionResult<ItemDto>> CreateItem([FromBody] CreateItemRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest("Code is required.");

            if (string.IsNullOrWhiteSpace(request.Unite))
                return BadRequest("Unit code is required.");

            // Check if code already exists
            var existingCode = await _context.Items
                .AnyAsync(i => i.Code.ToUpper() == request.Code.ToUpper());

            if (existingCode)
                return BadRequest("An item with this code already exists.");

            // Validate Unite code exists
            var uniteExists = await _context.UnitOfMeasures
                .AnyAsync(uc => uc.Code == request.Unite);
            
            if (!uniteExists)
                return BadRequest("The specified unit code does not exist.");

            var item = new Item
            {
                Code = request.Code.ToUpper().Trim(),
                Description = string.IsNullOrWhiteSpace(request.Description) ? string.Empty : request.Description.Trim(),
                Unite = request.Unite.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Items.Add(item);

            try
            {
                await _context.SaveChangesAsync();

                // Increment the ItemsCount for the associated UnitOfMeasure
                var uniteCode = await _context.UnitOfMeasures.FindAsync(request.Unite.Trim());
                if (uniteCode != null)
                {
                    uniteCode.ItemsCount++;
                    uniteCode.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                var createdDto = new ItemDto
                {
                    Code = item.Code,
                    Description = item.Description,
                    Unite = item.Unite,
                    UniteCodeNavigation = null,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    ElementTypesCount = 0
                };

                return CreatedAtAction(nameof(GetItem), new { code = item.Code }, createdDto);
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("An item with this code already exists.");
                
                return StatusCode(500, $"An error occurred while creating the item: {ex.Message}");
            }
        }

        // PUT: api/Item/ABC123
        [HttpPut("{code}")]
        public async Task<IActionResult> UpdateItem(string code, [FromBody] UpdateItemRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var item = await _context.Items.FindAsync(code);
            if (item == null)
                return NotFound("Item not found.");

            // Track original unit for count updates
            var originalUnite = item.Unite;

            // Update Description if provided (can be empty)
            if (request.Description != null)
                item.Description = request.Description.Trim();

            // Update Unite if provided (required - cannot be null or empty)
            if (request.Unite != null)
            {
                if (string.IsNullOrWhiteSpace(request.Unite))
                {
                    return BadRequest("Unit code is required and cannot be empty.");
                }
                else
                {
                    // Validate Unite code exists
                    var uniteExists = await _context.UnitOfMeasures
                        .AnyAsync(uc => uc.Code == request.Unite);
                    
                    if (!uniteExists)
                        return BadRequest("The specified unit code does not exist.");
                    
                    item.Unite = request.Unite.Trim();
                }
            }

            item.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();

                // Update ItemsCount for UnitOfMeasures if unit changed
                if (request.Unite != null && originalUnite != item.Unite)
                {
                    // Decrement count for old unit
                    if (!string.IsNullOrEmpty(originalUnite))
                    {
                        var oldUniteCode = await _context.UnitOfMeasures.FindAsync(originalUnite);
                        if (oldUniteCode != null)
                        {
                            oldUniteCode.ItemsCount = Math.Max(0, oldUniteCode.ItemsCount - 1);
                            oldUniteCode.UpdatedAt = DateTime.UtcNow;
                        }
                    }

                    // Increment count for new unit
                    var newUniteCode = await _context.UnitOfMeasures.FindAsync(item.Unite);
                    if (newUniteCode != null)
                    {
                        newUniteCode.ItemsCount++;
                        newUniteCode.UpdatedAt = DateTime.UtcNow;
                    }

                    await _context.SaveChangesAsync();
                }

                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while updating the item: {ex.Message}");
            }
        }

        // DELETE: api/Item/ABC123
        [HttpDelete("{code}")]
        public async Task<IActionResult> DeleteItem(string code)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var item = await _context.Items
                .FirstOrDefaultAsync(i => i.Code == code);

            if (item == null)
                return NotFound("Item not found.");

            // Check if there are lines directly referencing this item
            var lignesCount = await _context.Lignes.CountAsync(l => l.ElementId == code);
            if (lignesCount > 0)
                return BadRequest("Cannot delete item. There are document lines associated with it.");

            // Track unit for count update
            var itemUnite = item.Unite;

            _context.Items.Remove(item);

            try
            {
                await _context.SaveChangesAsync();

                // Decrement ItemsCount for the associated UnitOfMeasure
                if (!string.IsNullOrEmpty(itemUnite))
                {
                    var uniteCode = await _context.UnitOfMeasures.FindAsync(itemUnite);
                    if (uniteCode != null)
                    {
                        uniteCode.ItemsCount = Math.Max(0, uniteCode.ItemsCount - 1);
                        uniteCode.UpdatedAt = DateTime.UtcNow;
                        await _context.SaveChangesAsync();
                    }
                }

                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while deleting the item: {ex.Message}");
            }
        }
    }
} 