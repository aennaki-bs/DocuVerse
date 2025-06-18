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
    public class UniteCodeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public UniteCodeController(ApplicationDbContext context, UserAuthorizationService authService)
        {
            _context = context;
            _authService = authService;
        }

        // GET: api/UniteCode
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UniteCodeDto>>> GetUniteCodes()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var uniteCodes = await _context.UnitOfMeasures
                .Select(uc => new UniteCodeDto
                {
                    Code = uc.Code,
                    Description = uc.Description,
                    CreatedAt = uc.CreatedAt,
                    UpdatedAt = uc.UpdatedAt,
                    ItemsCount = _context.Items.Count(i => i.Unite == uc.Code)
                })
                .OrderBy(uc => uc.Code)
                .ToListAsync();

            return Ok(uniteCodes);
        }

        // GET: api/UniteCode/simple
        [HttpGet("simple")]
        // [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<UniteCodeSimpleDto>>> GetUniteCodesSimple()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;
            
            var uniteCodes = await _context.UnitOfMeasures
                .Select(uc => new UniteCodeSimpleDto
                {
                    Code = uc.Code,
                    Description = uc.Description
                })
                .OrderBy(uc => uc.Code)
                .ToListAsync();

            return Ok(uniteCodes);
        }

        // GET: api/UniteCode/KG
        [HttpGet("{code}")]
        public async Task<ActionResult<UniteCodeDto>> GetUniteCode(string code)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;
            
            var uniteCode = await _context.UnitOfMeasures
                .Where(uc => uc.Code == code)
                .Select(uc => new UniteCodeDto
                {
                    Code = uc.Code,
                    Description = uc.Description,
                    CreatedAt = uc.CreatedAt,
                    UpdatedAt = uc.UpdatedAt,
                    ItemsCount = _context.Items.Count(i => i.Unite == uc.Code)
                })
                .FirstOrDefaultAsync();

            if (uniteCode == null)
                return NotFound("Unite code not found.");

            return Ok(uniteCode);
        }

        // POST: api/UniteCode/validate-code
        [HttpPost("validate-code")]
        public async Task<IActionResult> ValidateCode([FromBody] ValidateUniteCodeRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest("Code is required.");

            var query = _context.UnitOfMeasures.AsQueryable();
            
            // Exclude the current code if provided (for edit scenarios)
            if (!string.IsNullOrWhiteSpace(request.ExcludeCode))
            {
                query = query.Where(uc => uc.Code.ToUpper() != request.ExcludeCode.ToUpper());
            }

            var exists = await query.AnyAsync(uc => uc.Code.ToUpper() == request.Code.ToUpper());

            return Ok(!exists);
        }

        // POST: api/UniteCode
        [HttpPost]
        public async Task<ActionResult<UniteCodeDto>> CreateUniteCode([FromBody] CreateUniteCodeRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest("Code is required.");

            if (string.IsNullOrWhiteSpace(request.Description))
                return BadRequest("Description is required.");

            // Check if code already exists
            var existingCode = await _context.UnitOfMeasures
                .AnyAsync(uc => uc.Code.ToUpper() == request.Code.ToUpper());

            if (existingCode)
                return BadRequest("A unite code with this code already exists.");

            var uniteCode = new UnitOfMeasure
            {
                Code = request.Code.ToUpper().Trim(),
                Description = request.Description.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.UnitOfMeasures.Add(uniteCode);

            try
            {
                await _context.SaveChangesAsync();

                var createdDto = new UniteCodeDto
                {
                    Code = uniteCode.Code,
                    Description = uniteCode.Description,
                    CreatedAt = uniteCode.CreatedAt,
                    UpdatedAt = uniteCode.UpdatedAt,
                    ItemsCount = 0
                };

                return CreatedAtAction(nameof(GetUniteCode), new { code = uniteCode.Code }, createdDto);
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("A unite code with this code already exists.");
                
                return StatusCode(500, $"An error occurred while creating the unite code: {ex.Message}");
            }
        }

        // PUT: api/UniteCode/KG
        [HttpPut("{code}")]
        public async Task<IActionResult> UpdateUniteCode(string code, [FromBody] UpdateUniteCodeRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var uniteCode = await _context.UnitOfMeasures
                .Include(uc => uc.Items)
                .FirstOrDefaultAsync(uc => uc.Code == code);
                
            if (uniteCode == null)
                return NotFound("Unite code not found.");

            // If changing the code, we need to create a new entity and update references
            if (!string.IsNullOrWhiteSpace(request.Code) && 
                request.Code.ToUpper() != uniteCode.Code.ToUpper())
            {
                var newCode = request.Code.ToUpper().Trim();
                
                // Check for uniqueness
                var existingCode = await _context.UnitOfMeasures
                    .AnyAsync(uc => uc.Code.ToUpper() == newCode);

                if (existingCode)
                    return BadRequest("A unite code with this code already exists.");

                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // Create new UnitOfMeasure entity
                    var newUniteCode = new UnitOfMeasure
                    {
                        Code = newCode,
                        Description = !string.IsNullOrWhiteSpace(request.Description) 
                            ? request.Description.Trim() 
                            : uniteCode.Description,
                        CreatedAt = uniteCode.CreatedAt,
                        UpdatedAt = DateTime.UtcNow,
                        ItemsCount = uniteCode.ItemsCount
                    };

                    _context.UnitOfMeasures.Add(newUniteCode);
                    await _context.SaveChangesAsync();

                    // Update all Items that reference the old code
                    var itemsToUpdate = await _context.Items
                        .Where(i => i.Unite == uniteCode.Code)
                        .ToListAsync();

                    foreach (var item in itemsToUpdate)
                    {
                        item.Unite = newCode;
                        item.UpdatedAt = DateTime.UtcNow;
                    }

                    // Remove the old UnitOfMeasure
                    _context.UnitOfMeasures.Remove(uniteCode);
                    
                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return NoContent();
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }

            // If only updating description (no code change)
            if (!string.IsNullOrWhiteSpace(request.Description))
                uniteCode.Description = request.Description.Trim();

            uniteCode.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while updating the unite code: {ex.Message}");
            }
        }

        // DELETE: api/UniteCode/KG
        [HttpDelete("{code}")]
        public async Task<IActionResult> DeleteUniteCode(string code)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var uniteCode = await _context.UnitOfMeasures
                .Include(uc => uc.Items)
                .FirstOrDefaultAsync(uc => uc.Code == code);

            if (uniteCode == null)
                return NotFound("Unite code not found.");

            // Check if there are items associated
            if (uniteCode.Items.Any())
                return BadRequest("Cannot delete unite code. There are items associated with it.");

            _context.UnitOfMeasures.Remove(uniteCode);

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while deleting the unite code: {ex.Message}");
            }
        }
    }
} 