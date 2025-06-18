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
    public class VendorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public VendorController(ApplicationDbContext context, UserAuthorizationService authService)
        {
            _context = context;
            _authService = authService;
        }

        // GET: api/Vendor
        [HttpGet]
        public async Task<ActionResult<IEnumerable<VendorDto>>> GetVendors()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var vendors = await _context.Vendors
                .Select(v => new VendorDto
                {
                    VendorCode = v.VendorCode,
                    Name = v.Name,
                    Address = v.Address,
                    City = v.City,
                    Country = v.Country,
                    CreatedAt = v.CreatedAt,
                    UpdatedAt = v.UpdatedAt,
                    DocumentsCount = _context.Documents.Count(d => d.CustomerOrVendor == v.VendorCode)
                })
                .OrderBy(v => v.VendorCode)
                .ToListAsync();

            return Ok(vendors);
        }

        // GET: api/Vendor/simple
        [HttpGet("simple")]
        public async Task<ActionResult<IEnumerable<VendorSimpleDto>>> GetVendorsSimple()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;
            
            var vendors = await _context.Vendors
                .Select(v => new VendorSimpleDto
                {
                    VendorCode = v.VendorCode,
                    Name = v.Name
                })
                .OrderBy(v => v.VendorCode)
                .ToListAsync();

            return Ok(vendors);
        }

        // GET: api/Vendor/VEND001
        [HttpGet("{vendorCode}")]
        public async Task<ActionResult<VendorDto>> GetVendor(string vendorCode)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;
            
            var vendor = await _context.Vendors
                .Where(v => v.VendorCode == vendorCode)
                .Select(v => new VendorDto
                {
                    VendorCode = v.VendorCode,
                    Name = v.Name,
                    Address = v.Address,
                    City = v.City,
                    Country = v.Country,
                    CreatedAt = v.CreatedAt,
                    UpdatedAt = v.UpdatedAt,
                    DocumentsCount = _context.Documents.Count(d => d.CustomerOrVendor == v.VendorCode)
                })
                .FirstOrDefaultAsync();

            if (vendor == null)
                return NotFound("Vendor not found.");

            return Ok(vendor);
        }

        // POST: api/Vendor/validate-code
        [HttpPost("validate-code")]
        public async Task<IActionResult> ValidateCode([FromBody] ValidateVendorCodeRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            if (string.IsNullOrWhiteSpace(request.VendorCode))
                return BadRequest("Vendor code is required.");

            var query = _context.Vendors.AsQueryable();
            
            // Exclude the current code if provided (for edit scenarios)
            if (!string.IsNullOrWhiteSpace(request.ExcludeVendorCode))
            {
                query = query.Where(v => v.VendorCode.ToUpper() != request.ExcludeVendorCode.ToUpper());
            }

            var exists = await query.AnyAsync(v => v.VendorCode.ToUpper() == request.VendorCode.ToUpper());

            return Ok(!exists);
        }

        // POST: api/Vendor
        [HttpPost]
        public async Task<ActionResult<VendorDto>> CreateVendor([FromBody] CreateVendorRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            if (string.IsNullOrWhiteSpace(request.VendorCode))
                return BadRequest("Vendor code is required.");

            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest("Name is required.");

            // Check if code already exists
            var existingCode = await _context.Vendors
                .AnyAsync(v => v.VendorCode.ToUpper() == request.VendorCode.ToUpper());

            if (existingCode)
                return BadRequest("A vendor with this code already exists.");

            var vendor = new Vendor
            {
                VendorCode = request.VendorCode.ToUpper().Trim(),
                Name = request.Name.Trim(),
                Address = request.Address?.Trim() ?? string.Empty,
                City = request.City?.Trim() ?? string.Empty,
                Country = request.Country?.Trim() ?? string.Empty,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Vendors.Add(vendor);

            try
            {
                await _context.SaveChangesAsync();

                var createdDto = new VendorDto
                {
                    VendorCode = vendor.VendorCode,
                    Name = vendor.Name,
                    Address = vendor.Address,
                    City = vendor.City,
                    Country = vendor.Country,
                    CreatedAt = vendor.CreatedAt,
                    UpdatedAt = vendor.UpdatedAt,
                    DocumentsCount = 0
                };

                return CreatedAtAction(nameof(GetVendor), new { vendorCode = vendor.VendorCode }, createdDto);
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("A vendor with this code already exists.");
                
                return StatusCode(500, $"An error occurred while creating the vendor: {ex.Message}");
            }
        }

        // PUT: api/Vendor/VEND001
        [HttpPut("{vendorCode}")]
        public async Task<IActionResult> UpdateVendor(string vendorCode, [FromBody] UpdateVendorRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var vendor = await _context.Vendors.FindAsync(vendorCode);
            if (vendor == null)
                return NotFound("Vendor not found.");

            // Update fields if provided
            if (!string.IsNullOrWhiteSpace(request.Name))
                vendor.Name = request.Name.Trim();
            
            if (request.Address != null)
                vendor.Address = request.Address.Trim();
            
            if (request.City != null)
                vendor.City = request.City.Trim();
            
            if (request.Country != null)
                vendor.Country = request.Country.Trim();

            vendor.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while updating the vendor: {ex.Message}");
            }
        }

        // DELETE: api/Vendor/VEND001
        [HttpDelete("{vendorCode}")]
        public async Task<IActionResult> DeleteVendor(string vendorCode)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var vendor = await _context.Vendors.FindAsync(vendorCode);
            if (vendor == null)
                return NotFound("Vendor not found.");

            // Check if there are documents associated
            var documentsCount = await _context.Documents.CountAsync(d => d.CustomerOrVendor == vendorCode);
            if (documentsCount > 0)
                return BadRequest("Cannot delete vendor. There are documents associated with it.");

            _context.Vendors.Remove(vendor);

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while deleting the vendor: {ex.Message}");
            }
        }
    }
} 