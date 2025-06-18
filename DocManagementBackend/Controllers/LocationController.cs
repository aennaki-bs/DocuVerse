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
    public class LocationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public LocationController(ApplicationDbContext context, UserAuthorizationService authService)
        {
            _context = context;
            _authService = authService;
        }

        // GET: api/Location
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LocationDto>>> GetLocations()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var locations = await _context.Locations
                .Select(l => new LocationDto
                {
                    LocationCode = l.LocationCode,
                    Description = l.Description,
                    CreatedAt = l.CreatedAt,
                    UpdatedAt = l.UpdatedAt
                })
                .OrderBy(l => l.LocationCode)
                .ToListAsync();

            return Ok(locations);
        }

        // GET: api/Location/simple
        [HttpGet("simple")]
        public async Task<ActionResult<IEnumerable<LocationSimpleDto>>> GetLocationsSimple()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;
            
            var locations = await _context.Locations
                .Select(l => new LocationSimpleDto
                {
                    LocationCode = l.LocationCode,
                    Description = l.Description
                })
                .OrderBy(l => l.LocationCode)
                .ToListAsync();

            return Ok(locations);
        }

        // GET: api/Location/LOC001
        [HttpGet("{locationCode}")]
        public async Task<ActionResult<LocationDto>> GetLocation(string locationCode)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;
            
            var location = await _context.Locations
                .Where(l => l.LocationCode == locationCode)
                .Select(l => new LocationDto
                {
                    LocationCode = l.LocationCode,
                    Description = l.Description,
                    CreatedAt = l.CreatedAt,
                    UpdatedAt = l.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (location == null)
                return NotFound("Location not found.");

            return Ok(location);
        }

        // POST: api/Location/validate-code
        [HttpPost("validate-code")]
        public async Task<IActionResult> ValidateCode([FromBody] ValidateLocationCodeRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            if (string.IsNullOrWhiteSpace(request.LocationCode))
                return BadRequest("Location code is required.");

            var query = _context.Locations.AsQueryable();
            
            // Exclude the current code if provided (for edit scenarios)
            if (!string.IsNullOrWhiteSpace(request.ExcludeLocationCode))
            {
                query = query.Where(l => l.LocationCode.ToUpper() != request.ExcludeLocationCode.ToUpper());
            }

            var exists = await query.AnyAsync(l => l.LocationCode.ToUpper() == request.LocationCode.ToUpper());

            return Ok(!exists);
        }

        // POST: api/Location
        [HttpPost]
        public async Task<ActionResult<LocationDto>> CreateLocation([FromBody] CreateLocationRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            if (string.IsNullOrWhiteSpace(request.LocationCode))
                return BadRequest("Location code is required.");

            if (string.IsNullOrWhiteSpace(request.Description))
                return BadRequest("Description is required.");

            // Check if code already exists
            var existingCode = await _context.Locations
                .AnyAsync(l => l.LocationCode.ToUpper() == request.LocationCode.ToUpper());

            if (existingCode)
                return BadRequest("A location with this code already exists.");

            var location = new Location
            {
                LocationCode = request.LocationCode.ToUpper().Trim(),
                Description = request.Description.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Locations.Add(location);

            try
            {
                await _context.SaveChangesAsync();

                var createdDto = new LocationDto
                {
                    LocationCode = location.LocationCode,
                    Description = location.Description,
                    CreatedAt = location.CreatedAt,
                    UpdatedAt = location.UpdatedAt
                };

                return CreatedAtAction(nameof(GetLocation), new { locationCode = location.LocationCode }, createdDto);
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("A location with this code already exists.");
                
                return StatusCode(500, $"An error occurred while creating the location: {ex.Message}");
            }
        }

        // PUT: api/Location/LOC001
        [HttpPut("{locationCode}")]
        public async Task<IActionResult> UpdateLocation(string locationCode, [FromBody] UpdateLocationRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var location = await _context.Locations.FindAsync(locationCode);
            if (location == null)
                return NotFound("Location not found.");

            // Update fields if provided
            if (!string.IsNullOrWhiteSpace(request.Description))
                location.Description = request.Description.Trim();

            location.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while updating the location: {ex.Message}");
            }
        }

        // DELETE: api/Location/LOC001
        [HttpDelete("{locationCode}")]
        public async Task<IActionResult> DeleteLocation(string locationCode)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var location = await _context.Locations.FindAsync(locationCode);
            if (location == null)
                return NotFound("Location not found.");

            // Note: Locations are not directly referenced by documents yet
            // If you add location references to documents in the future, add the check here

            _context.Locations.Remove(location);

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while deleting the location: {ex.Message}");
            }
        }
    }
} 