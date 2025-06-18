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
    public class ResponsibilityCentreController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public ResponsibilityCentreController(ApplicationDbContext context, UserAuthorizationService authService)
        {
            _context = context;
            _authService = authService;
        }

        // GET: api/ResponsibilityCentre
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ResponsibilityCentreDto>>> GetResponsibilityCentres()
        {
            var responsibilityCentres = await _context.ResponsibilityCentres
                .Select(rc => new ResponsibilityCentreDto
                {
                    Id = rc.Id,
                    Code = rc.Code,
                    Descr = rc.Descr,
                    CreatedAt = rc.CreatedAt,
                    UpdatedAt = rc.UpdatedAt,
                    UsersCount = rc.Users.Count(),
                    DocumentsCount = rc.Documents.Count(),
                    Users = rc.Users.Select(u => new ResponsibilityCentreUserDto
                    {
                        Id = u.Id,
                        Email = u.Email,
                        Username = u.Username,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        UserType = u.UserType,
                        IsActive = u.IsActive,
                        IsOnline = u.IsOnline,
                        ProfilePicture = u.ProfilePicture,
                        Role = u.Role == null ? null : new RoleDto
                        {
                            RoleId = u.Role.Id,
                            RoleName = u.Role.RoleName
                        }
                    }).ToList()
                })
                .OrderBy(rc => rc.Code)
                .ToListAsync();

            return Ok(responsibilityCentres);
        }

        // GET: api/ResponsibilityCentre/simple
        [HttpGet("simple")]
        // [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ResponsibilityCentreSimpleDto>>> GetResponsibilityCentresSimple()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;
            
            var responsibilityCentres = await _context.ResponsibilityCentres
                .Select(rc => new ResponsibilityCentreSimpleDto
                {
                    Id = rc.Id,
                    Code = rc.Code,
                    Descr = rc.Descr
                })
                .OrderBy(rc => rc.Code)
                .ToListAsync();

            return Ok(responsibilityCentres);
        }

        // GET: api/ResponsibilityCentre/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ResponsibilityCentreDto>> GetResponsibilityCentre(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;
            
            var responsibilityCentre = await _context.ResponsibilityCentres
                .Where(rc => rc.Id == id)
                .Select(rc => new ResponsibilityCentreDto
                {
                    Id = rc.Id,
                    Code = rc.Code,
                    Descr = rc.Descr,
                    CreatedAt = rc.CreatedAt,
                    UpdatedAt = rc.UpdatedAt,
                    UsersCount = rc.Users.Count(),
                    DocumentsCount = rc.Documents.Count(),
                    Users = rc.Users.Select(u => new ResponsibilityCentreUserDto
                    {
                        Id = u.Id,
                        Email = u.Email,
                        Username = u.Username,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        UserType = u.UserType,
                        IsActive = u.IsActive,
                        IsOnline = u.IsOnline,
                        CreatedAt = u.CreatedAt,
                        ProfilePicture = u.ProfilePicture,
                        Role = u.Role == null ? null : new RoleDto
                        {
                            RoleId = u.Role.Id,
                            RoleName = u.Role.RoleName
                        }
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (responsibilityCentre == null)
                return NotFound("Responsibility Centre not found.");

            return Ok(responsibilityCentre);
        }

        // POST: api/ResponsibilityCentre/validate-code
        [HttpPost("validate-code")]
        public async Task<IActionResult> ValidateCode([FromBody] CreateResponsibilityCentreRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest("Code is required.");

            var exists = await _context.ResponsibilityCentres
                .AnyAsync(rc => rc.Code.ToUpper() == request.Code.ToUpper());

            return Ok(!exists);
        }

        // POST: api/ResponsibilityCentre
        [HttpPost]
        public async Task<ActionResult<ResponsibilityCentreDto>> CreateResponsibilityCentre([FromBody] CreateResponsibilityCentreRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest("Code is required.");

            if (string.IsNullOrWhiteSpace(request.Descr))
                return BadRequest("Description is required.");

            // Check if code already exists
            var existingCode = await _context.ResponsibilityCentres
                .AnyAsync(rc => rc.Code.ToUpper() == request.Code.ToUpper());

            if (existingCode)
                return BadRequest("A Responsibility Centre with this code already exists.");

            var responsibilityCentre = new ResponsibilityCentre
            {
                Code = request.Code.ToUpper().Trim(),
                Descr = request.Descr.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ResponsibilityCentres.Add(responsibilityCentre);

            try
            {
                await _context.SaveChangesAsync();

                var createdDto = new ResponsibilityCentreDto
                {
                    Id = responsibilityCentre.Id,
                    Code = responsibilityCentre.Code,
                    Descr = responsibilityCentre.Descr,
                    CreatedAt = responsibilityCentre.CreatedAt,
                    UpdatedAt = responsibilityCentre.UpdatedAt,
                    UsersCount = 0,
                    DocumentsCount = 0,
                    Users = new List<ResponsibilityCentreUserDto>()
                };

                return CreatedAtAction(nameof(GetResponsibilityCentre), new { id = responsibilityCentre.Id }, createdDto);
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("A Responsibility Centre with this code already exists.");
                
                return StatusCode(500, $"An error occurred while creating the Responsibility Centre: {ex.Message}");
            }
        }

        // PUT: api/ResponsibilityCentre/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateResponsibilityCentre(int id, [FromBody] UpdateResponsibilityCentreRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var responsibilityCentre = await _context.ResponsibilityCentres.FindAsync(id);
            if (responsibilityCentre == null)
                return NotFound("Responsibility Centre not found.");

            // Update Code if provided
            if (!string.IsNullOrWhiteSpace(request.Code))
            {
                var newCode = request.Code.ToUpper().Trim();
                if (newCode != responsibilityCentre.Code)
                {
                    // Check if new code already exists
                    var existingCode = await _context.ResponsibilityCentres
                        .AnyAsync(rc => rc.Code.ToUpper() == newCode && rc.Id != id);

                    if (existingCode)
                        return BadRequest("A Responsibility Centre with this code already exists.");

                    responsibilityCentre.Code = newCode;
                }
            }

            // Update Description if provided
            if (!string.IsNullOrWhiteSpace(request.Descr))
                responsibilityCentre.Descr = request.Descr.Trim();

            responsibilityCentre.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("A Responsibility Centre with this code already exists.");
                
                return StatusCode(500, $"An error occurred while updating the Responsibility Centre: {ex.Message}");
            }
        }

        // POST: api/ResponsibilityCentre/associate-users
        [HttpPost("associate-users")]
        public async Task<ActionResult<AssociateUsersToResponsibilityCentreResponse>> AssociateUsersToResponsibilityCentre([FromBody] AssociateUsersToResponsibilityCentreRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Validate request
            if (request.UserIds == null || !request.UserIds.Any())
                return BadRequest("At least one user ID must be provided.");

            if (request.UserIds.Count > 100)
                return BadRequest("Cannot associate more than 100 users at once.");

            // Check if responsibility centre exists
            var responsibilityCentre = await _context.ResponsibilityCentres
                .FirstOrDefaultAsync(rc => rc.Id == request.ResponsibilityCentreId);

            if (responsibilityCentre == null)
                return NotFound("Responsibility Centre not found.");

            var response = new AssociateUsersToResponsibilityCentreResponse
            {
                ResponsibilityCentreId = responsibilityCentre.Id,
                ResponsibilityCentreCode = responsibilityCentre.Code,
                ResponsibilityCentreDescription = responsibilityCentre.Descr,
                TotalUsersRequested = request.UserIds.Count
            };

            // Get all users to be associated
            var users = await _context.Users
                .Where(u => request.UserIds.Contains(u.Id))
                .Include(u => u.ResponsibilityCentre)
                .ToListAsync();

            var foundUserIds = users.Select(u => u.Id).ToList();
            var notFoundUserIds = request.UserIds.Except(foundUserIds).ToList();

            // Add errors for users not found
            foreach (var notFoundId in notFoundUserIds)
            {
                response.Results.Add(new UserAssociationResult
                {
                    UserId = notFoundId,
                    UserEmail = "Unknown",
                    UserName = "Unknown",
                    Success = false,
                    ErrorMessage = "User not found"
                });
                response.Errors.Add($"User with ID {notFoundId} not found.");
            }

            // Process found users
            foreach (var user in users)
            {
                var result = new UserAssociationResult
                {
                    UserId = user.Id,
                    UserEmail = user.Email,
                    UserName = $"{user.FirstName} {user.LastName}".Trim(),
                    PreviousResponsibilityCentre = user.ResponsibilityCentre?.Code
                };

                try
                {
                    // Update user's responsibility centre
                    user.ResponsibilityCentreId = request.ResponsibilityCentreId;
                    result.Success = true;
                    response.UsersSuccessfullyAssociated++;
                }
                catch (Exception ex)
                {
                    result.Success = false;
                    result.ErrorMessage = ex.Message;
                    response.Errors.Add($"Failed to associate user {user.Email}: {ex.Message}");
                }

                response.Results.Add(result);
            }

            try
            {
                await _context.SaveChangesAsync();
                
                // If some users failed, return partial success
                if (response.Errors.Any())
                {
                    return StatusCode(207, response); // 207 Multi-Status
                }

                return Ok(response);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new AssociateUsersToResponsibilityCentreResponse
                {
                    ResponsibilityCentreId = request.ResponsibilityCentreId,
                    TotalUsersRequested = request.UserIds.Count,
                    UsersSuccessfullyAssociated = 0,
                    Errors = new List<string> { $"Database error occurred: {ex.Message}" }
                });
            }
        }

        // POST: api/ResponsibilityCentre/remove-users
        [HttpPost("remove-users")]
        public async Task<ActionResult<AssociateUsersToResponsibilityCentreResponse>> RemoveUsersFromResponsibilityCentre([FromBody] RemoveUsersFromResponsibilityCentreRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Validate request
            if (request.UserIds == null || !request.UserIds.Any())
                return BadRequest("At least one user ID must be provided.");

            if (request.UserIds.Count > 100)
                return BadRequest("Cannot remove more than 100 users at once.");

            var response = new AssociateUsersToResponsibilityCentreResponse
            {
                ResponsibilityCentreId = 0, // No specific centre since we're removing
                ResponsibilityCentreCode = "NONE",
                ResponsibilityCentreDescription = "No Responsibility Centre",
                TotalUsersRequested = request.UserIds.Count
            };

            // Get all users to be removed from responsibility centres
            var users = await _context.Users
                .Where(u => request.UserIds.Contains(u.Id))
                .Include(u => u.ResponsibilityCentre)
                .ToListAsync();

            var foundUserIds = users.Select(u => u.Id).ToList();
            var notFoundUserIds = request.UserIds.Except(foundUserIds).ToList();

            // Add errors for users not found
            foreach (var notFoundId in notFoundUserIds)
            {
                response.Results.Add(new UserAssociationResult
                {
                    UserId = notFoundId,
                    UserEmail = "Unknown",
                    UserName = "Unknown",
                    Success = false,
                    ErrorMessage = "User not found"
                });
                response.Errors.Add($"User with ID {notFoundId} not found.");
            }

            // Process found users
            foreach (var user in users)
            {
                var result = new UserAssociationResult
                {
                    UserId = user.Id,
                    UserEmail = user.Email,
                    UserName = $"{user.FirstName} {user.LastName}".Trim(),
                    PreviousResponsibilityCentre = user.ResponsibilityCentre?.Code
                };

                try
                {
                    // Remove user from responsibility centre
                    user.ResponsibilityCentreId = null;
                    result.Success = true;
                    response.UsersSuccessfullyAssociated++;
                }
                catch (Exception ex)
                {
                    result.Success = false;
                    result.ErrorMessage = ex.Message;
                    response.Errors.Add($"Failed to remove user {user.Email}: {ex.Message}");
                }

                response.Results.Add(result);
            }

            try
            {
                await _context.SaveChangesAsync();
                
                // If some users failed, return partial success
                if (response.Errors.Any())
                {
                    return StatusCode(207, response); // 207 Multi-Status
                }

                return Ok(response);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, new AssociateUsersToResponsibilityCentreResponse
                {
                    ResponsibilityCentreId = 0,
                    TotalUsersRequested = request.UserIds.Count,
                    UsersSuccessfullyAssociated = 0,
                    Errors = new List<string> { $"Database error occurred: {ex.Message}" }
                });
            }
        }

        // DELETE: api/ResponsibilityCentre/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteResponsibilityCentre(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var responsibilityCentre = await _context.ResponsibilityCentres
                .Include(rc => rc.Users)
                .Include(rc => rc.Documents)
                .FirstOrDefaultAsync(rc => rc.Id == id);

            if (responsibilityCentre == null)
                return NotFound("Responsibility Centre not found.");

            // Check if there are users or documents associated
            if (responsibilityCentre.Users.Any())
                return BadRequest("Cannot delete Responsibility Centre. There are users associated with it.");

            if (responsibilityCentre.Documents.Any())
                return BadRequest("Cannot delete Responsibility Centre. There are documents associated with it.");

            _context.ResponsibilityCentres.Remove(responsibilityCentre);

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while deleting the Responsibility Centre: {ex.Message}");
            }
        }
    }
} 