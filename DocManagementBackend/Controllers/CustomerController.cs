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
    public class CustomerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public CustomerController(ApplicationDbContext context, UserAuthorizationService authService)
        {
            _context = context;
            _authService = authService;
        }

        // GET: api/Customer
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var customers = await _context.Customers
                .Select(c => new CustomerDto
                {
                    Code = c.Code,
                    Name = c.Name,
                    Address = c.Address,
                    City = c.City,
                    Country = c.Country,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    DocumentsCount = _context.Documents.Count(d => d.CustomerOrVendor == c.Code)
                })
                .OrderBy(c => c.Code)
                .ToListAsync();

            return Ok(customers);
        }

        // GET: api/Customer/simple
        [HttpGet("simple")]
        public async Task<ActionResult<IEnumerable<CustomerSimpleDto>>> GetCustomersSimple()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;
            
            var customers = await _context.Customers
                .Select(c => new CustomerSimpleDto
                {
                    Code = c.Code,
                    Name = c.Name
                })
                .OrderBy(c => c.Code)
                .ToListAsync();

            return Ok(customers);
        }

        // GET: api/Customer/CUST001
        [HttpGet("{code}")]
        public async Task<ActionResult<CustomerDto>> GetCustomer(string code)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;
            
            var customer = await _context.Customers
                .Where(c => c.Code == code)
                .Select(c => new CustomerDto
                {
                    Code = c.Code,
                    Name = c.Name,
                    Address = c.Address,
                    City = c.City,
                    Country = c.Country,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt,
                    DocumentsCount = _context.Documents.Count(d => d.CustomerOrVendor == c.Code)
                })
                .FirstOrDefaultAsync();

            if (customer == null)
                return NotFound("Customer not found.");

            return Ok(customer);
        }

        // POST: api/Customer/validate-code
        [HttpPost("validate-code")]
        public async Task<IActionResult> ValidateCode([FromBody] ValidateCustomerCodeRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest("Code is required.");

            var query = _context.Customers.AsQueryable();
            
            // Exclude the current code if provided (for edit scenarios)
            if (!string.IsNullOrWhiteSpace(request.ExcludeCode))
            {
                query = query.Where(c => c.Code.ToUpper() != request.ExcludeCode.ToUpper());
            }

            var exists = await query.AnyAsync(c => c.Code.ToUpper() == request.Code.ToUpper());

            return Ok(!exists);
        }

        // POST: api/Customer
        [HttpPost]
        public async Task<ActionResult<CustomerDto>> CreateCustomer([FromBody] CreateCustomerRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest("Code is required.");

            if (string.IsNullOrWhiteSpace(request.Name))
                return BadRequest("Name is required.");

            // Check if code already exists
            var existingCode = await _context.Customers
                .AnyAsync(c => c.Code.ToUpper() == request.Code.ToUpper());

            if (existingCode)
                return BadRequest("A customer with this code already exists.");

            var customer = new Customer
            {
                Code = request.Code.ToUpper().Trim(),
                Name = request.Name.Trim(),
                Address = request.Address?.Trim() ?? string.Empty,
                City = request.City?.Trim() ?? string.Empty,
                Country = request.Country?.Trim() ?? string.Empty,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Customers.Add(customer);

            try
            {
                await _context.SaveChangesAsync();

                var createdDto = new CustomerDto
                {
                    Code = customer.Code,
                    Name = customer.Name,
                    Address = customer.Address,
                    City = customer.City,
                    Country = customer.Country,
                    CreatedAt = customer.CreatedAt,
                    UpdatedAt = customer.UpdatedAt,
                    DocumentsCount = 0
                };

                return CreatedAtAction(nameof(GetCustomer), new { code = customer.Code }, createdDto);
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("A customer with this code already exists.");
                
                return StatusCode(500, $"An error occurred while creating the customer: {ex.Message}");
            }
        }

        // PUT: api/Customer/CUST001
        [HttpPut("{code}")]
        public async Task<IActionResult> UpdateCustomer(string code, [FromBody] UpdateCustomerRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var customer = await _context.Customers.FindAsync(code);
            if (customer == null)
                return NotFound("Customer not found.");

            // Update fields if provided
            if (!string.IsNullOrWhiteSpace(request.Name))
                customer.Name = request.Name.Trim();
            
            if (request.Address != null)
                customer.Address = request.Address.Trim();
            
            if (request.City != null)
                customer.City = request.City.Trim();
            
            if (request.Country != null)
                customer.Country = request.Country.Trim();

            customer.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while updating the customer: {ex.Message}");
            }
        }

        // DELETE: api/Customer/CUST001
        [HttpDelete("{code}")]
        public async Task<IActionResult> DeleteCustomer(string code)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var customer = await _context.Customers.FindAsync(code);
            if (customer == null)
                return NotFound("Customer not found.");

            // Check if there are documents associated
            var documentsCount = await _context.Documents.CountAsync(d => d.CustomerOrVendor == code);
            if (documentsCount > 0)
                return BadRequest("Cannot delete customer. There are documents associated with it.");

            _context.Customers.Remove(customer);

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while deleting the customer: {ex.Message}");
            }
        }
    }
} 