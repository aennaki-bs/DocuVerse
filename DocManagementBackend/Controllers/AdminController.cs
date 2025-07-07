using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using System.Security.Claims;
using DocManagementBackend.Mappings;
using DocManagementBackend.Utils;
using DocManagementBackend.Services;

namespace DocManagementBackend.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public AdminController(
            ApplicationDbContext context,
            UserAuthorizationService authService) 
        { 
            _context = context;
            _authService = authService;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            
            var users = await _context.Users
                .Include(u => u.Role).Where(u => u.Id != userId).Select(UserMappings.ToUserDto).ToListAsync();
            return Ok(users);
        }

        [HttpGet("users/unassigned")]
        public async Task<IActionResult> GetUnassignedUsers()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            
            var unassignedUsers = await _context.Users
                .Include(u => u.Role)
                .Where(u => u.ResponsibilityCentreId == null)
                .Select(UserMappings.ToUserDto)
                .OrderBy(u => u.Username)
                .ToListAsync();
            
            return Ok(unassignedUsers);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;
            
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                return NotFound("User not found.");
            return Ok(user);
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetAllRoles()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var roles = await _context.Roles.ToListAsync();
            return Ok(roles);
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] AdminCreateUserRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var thisUser = authResult.User!;

            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Email is already in use.");
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                return BadRequest("Username is already in use.");
            
            int roleId = 0;
            if (request.RoleName == "Admin") { roleId = 1; }
            if (request.RoleName == "SimpleUser") { roleId = 2; }
            if (request.RoleName == "FullUser") { roleId = 3; }
            
            var role = await _context.Roles.FindAsync(roleId);
            if (role == null)
                return BadRequest("Invalid RoleName.");
            
            if (request.ResponsibilityCenterId.HasValue)
            {
                var responsibilityCentre = await _context.ResponsibilityCentres.FindAsync(request.ResponsibilityCenterId);
                if (responsibilityCentre == null)
                    return BadRequest("Invalid ResponsibilityCenterId.");
            }
            
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.PasswordHash);
            var emailVerificationCode = new Random().Next(100000, 999999).ToString();
            var newUser = new User
            {
                Email = request.Email,
                Username = request.Username,
                PasswordHash = hashedPassword,
                FirstName = request.FirstName,
                LastName = request.LastName,
                IsEmailConfirmed = false,
                IsActive = false,
                CreatedAt = DateTime.UtcNow,
                RoleId = roleId,
                EmailVerificationCode = emailVerificationCode,
                ProfilePicture = "/images/profile/default.png",
                City = request.City,
                Country = request.Country,
                Address = request.Address,
                Identity = request.Identity,
                PhoneNumber = request.PhoneNumber,
                ResponsibilityCentreId = request.ResponsibilityCenterId.HasValue ? request.ResponsibilityCenterId.Value : null,
                UserType = request.UserType
            };
            
            string? frontDomain = Environment.GetEnvironmentVariable("FRONTEND_DOMAIN");
            var verificationLink = $"{frontDomain}/verify/{newUser.Email}";
            string emailBody = AuthHelper.CreateEmailBody(verificationLink, newUser.EmailVerificationCode);
            
            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();
            
            AuthHelper.SendEmail(newUser.Email, "Email Verification", emailBody);
            
            var logEntry = new LogHistory
            {
                UserId = userId,
                User = thisUser,
                Timestamp = DateTime.UtcNow,
                ActionType = 7,
                Description = $"{thisUser.Username} has created a profile for {newUser.Username}"
            };
            
            _context.LogHistories.Add(logEntry);
            await _context.SaveChangesAsync();
            
            return CreatedAtAction(nameof(GetUser), new { id = newUser.Id }, new
            {
                newUser.Id,
                newUser.Username,
                newUser.Email,
                newUser.FirstName,
                newUser.LastName,
                Role = role.RoleName,
                newUser.IsActive,
                newUser.CreatedAt,
                newUser.ResponsibilityCentreId,
                newUser.UserType,
                newUser.City,
                newUser.Country,
                newUser.Address,
                newUser.Identity,
                newUser.PhoneNumber
            });
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] AdminUpdateUserRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var thisUser = authResult.User!;

            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound("User not found.");
            
            if (!string.IsNullOrEmpty(request.Username) && await _context.Users.AnyAsync(u => u.Username == request.Username) && user.Username != request.Username)
                return BadRequest("Username is already in use.");
            
            if (!string.IsNullOrEmpty(request.Username))
                user.Username = request.Username;
            
            if (!string.IsNullOrEmpty(request.PasswordHash))
            {
                if (!AuthHelper.IsValidPassword(request.PasswordHash))
                    return BadRequest("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a digit, and a special character.");
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.PasswordHash);
            }
            
            if (!string.IsNullOrEmpty(request.FirstName))
                user.FirstName = request.FirstName;
            
            if (!string.IsNullOrEmpty(request.LastName))
                user.LastName = request.LastName;
            
            if (request.IsActive.HasValue)
                user.IsActive = request.IsActive.Value;
            
            if (!string.IsNullOrEmpty(request.City))
                user.City = request.City;
            
            if (!string.IsNullOrEmpty(request.Country))
                user.Country = request.Country;
            
            if (!string.IsNullOrEmpty(request.Address))
                user.Address = request.Address;
            
            if (!string.IsNullOrEmpty(request.Identity))
                user.Identity = request.Identity;
            
            if (!string.IsNullOrEmpty(request.PhoneNumber)) 
                user.PhoneNumber = request.PhoneNumber;
            
            if (request.ResponsibilityCenterId.HasValue)
            {
                var responsibilityCentre = await _context.ResponsibilityCentres.FindAsync(request.ResponsibilityCenterId);
                if (responsibilityCentre == null)   
                    return BadRequest("Invalid ResponsibilityCenterId.");
                user.ResponsibilityCentreId = request.ResponsibilityCenterId.Value;
            }
            
            if (!string.IsNullOrEmpty(request.RoleName))
            {
                int roleId = 0;
                if (request.RoleName == "Admin") { roleId = 1; }
                if (request.RoleName == "SimpleUser") { roleId = 2; }
                if (request.RoleName == "FullUser") { roleId = 3; }
                var role = await _context.Roles.FindAsync(roleId);
                if (role == null)
                    return BadRequest("Invalid RoleName.");
                user.RoleId = role.Id; 
                user.Role = role;
            }
            
            await _context.SaveChangesAsync();
            
            var logEntry = new LogHistory
            {
                UserId = userId,
                User = thisUser,
                Timestamp = DateTime.UtcNow,
                ActionType = 8,
                Description = $"{thisUser.Username} has modified the profile {user.Username}"
            };
            
            _context.LogHistories.Add(logEntry);
            await _context.SaveChangesAsync();
            
            return Ok(new { Message = "User updated successfully" });
        }

        [HttpPut("users/email/{id}")]
        public async Task<IActionResult> UpdateEmailUser(int id, [FromBody] AdminUpdateUserRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");
            int userId = int.Parse(userIdClaim);
            var ThisUser = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (ThisUser == null)
                return BadRequest("User not found.");
            if (!ThisUser.IsActive)
                return Unauthorized("User account is deactivated. Please contact un admin!");
            if (ThisUser.Role!.RoleName != "Admin")
                return Unauthorized("User Not Allowed To do this action.");
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound("User not found.");
            if (!string.IsNullOrEmpty(request.Email) && await _context.Users.AnyAsync(u => u.Email == request.Email) && user.Email != request.Email)
                return BadRequest("Email is already in use.");
            if (!string.IsNullOrEmpty(request.Email))
                user.Email = request.Email;
            user.EmailVerificationCode = new Random().Next(100000, 999999).ToString();
            user.IsActive = false;
            user.IsEmailConfirmed = false;
            string? frontDomain = Environment.GetEnvironmentVariable("FRONTEND_DOMAIN");
            var verificationLink = $"{frontDomain}/verify/{user.Email}";
            string emailBody = AuthHelper.CreateEmailBody(verificationLink, user.EmailVerificationCode);
            await _context.SaveChangesAsync();
            AuthHelper.SendEmail(user.Email, "Email Verification", emailBody);
            var logEntry = new LogHistory
            {
                UserId = userId,
                User = ThisUser,
                Timestamp = DateTime.UtcNow,
                ActionType = 8,
                Description = $"{ThisUser.Username} has updated {user.Username}'s profile"
            };
            _context.LogHistories.Add(logEntry);
            await _context.SaveChangesAsync();
            return Ok($"{user.Username}'s email is updated successfully. He need to check his email for confirmation!");
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var currentUser = authResult.User!;

            // Prevent admin from deleting themselves
            if (id == userId)
                return BadRequest("You cannot delete your own account.");

            var userToDelete = await _context.Users.FindAsync(id);
            if (userToDelete == null)
                return NotFound("User not found.");

            // Check if user has any associated data that would prevent deletion
            var hasDocumentsAsCreator = await _context.Documents.AnyAsync(d => d.CreatedByUserId == id);
            // var hasDocumentsAsUpdater = await _context.Documents.AnyAsync(d => d.UpdatedByUserId == id);
            var hasApprovals = await _context.ApprovalWritings.AnyAsync(aw => aw.ProcessedByUserId == id);
            // var hasCircuitHistory = await _context.DocumentCircuitHistory.AnyAsync(dch => dch.ProcessedByUserId == id);
            // var hasStepHistory = await _context.DocumentStepHistory.AnyAsync(dsh => dsh.UserId == id);
            // var hasDocumentStatusHistory = await _context.DocumentStatus.AnyAsync(ds => ds.CompletedByUserId == id);

            if (hasDocumentsAsCreator || hasApprovals)
            {
                // Instead of hard deletion, deactivate the user
                userToDelete.IsActive = false;
                userToDelete.Email = $"deleted_{userToDelete.Id}_{userToDelete.Email}";
                userToDelete.Username = $"deleted_{userToDelete.Id}_{userToDelete.Username}";
                
                await _context.SaveChangesAsync();

                var logEntry = new LogHistory
                {
                    UserId = userId,
                    User = currentUser,
                    Timestamp = DateTime.UtcNow,
                    ActionType = 9,
                    Description = $"{currentUser.Username} has deactivated {userToDelete.Username}'s account (user had associated data)"
                };
                _context.LogHistories.Add(logEntry);
                await _context.SaveChangesAsync();

                return Ok("User account has been deactivated due to associated data.");
            }

            // Safe to delete completely
            _context.Users.Remove(userToDelete);
            
            var deleteLogEntry = new LogHistory
            {
                UserId = userId,
                User = currentUser,
                Timestamp = DateTime.UtcNow,
                ActionType = 9,
                Description = $"{currentUser.Username} has deleted {userToDelete.Username}'s profile"
            };
            _context.LogHistories.Add(deleteLogEntry);
            
            await _context.SaveChangesAsync();
            return Ok("User deleted successfully.");
        }

        [HttpDelete("delete-users")]
        public async Task<IActionResult> DeleteUsers([FromBody] List<int> userIds)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var currentUser = authResult.User!;

            if (userIds == null || !userIds.Any())
                return BadRequest("No user IDs provided.");

            // Remove current user from the list to prevent self-deletion
            userIds.RemoveAll(id => id == userId);

            if (!userIds.Any())
                return BadRequest("Cannot delete your own account or no valid user IDs provided.");

            var usersToDelete = await _context.Users.Where(u => userIds.Contains(u.Id)).ToListAsync();
            if (!usersToDelete.Any())
                return NotFound("No users found with the provided IDs.");

            int deletedCount = 0;
            int deactivatedCount = 0;

            foreach (var user in usersToDelete)
            {
                // Check if user has any associated data that would prevent deletion
                var hasDocumentsAsCreator = await _context.Documents.AnyAsync(d => d.CreatedByUserId == user.Id);
                // var hasDocumentsAsUpdater = await _context.Documents.AnyAsync(d => d.UpdatedByUserId == user.Id);
                var hasApprovals = await _context.ApprovalWritings.AnyAsync(aw => aw.ProcessedByUserId == user.Id);
                // var hasCircuitHistory = await _context.DocumentCircuitHistory.AnyAsync(dch => dch.ProcessedByUserId == user.Id);
                // var hasStepHistory = await _context.DocumentStepHistory.AnyAsync(dsh => dsh.UserId == user.Id);
                // var hasDocumentStatusHistory = await _context.DocumentStatus.AnyAsync(ds => ds.CompletedByUserId == user.Id);

                if (hasDocumentsAsCreator || hasApprovals)
                {
                    // Deactivate instead of delete
                    user.IsActive = false;
                    user.Email = $"deleted_{user.Id}_{user.Email}";
                    user.Username = $"deleted_{user.Id}_{user.Username}";
                    deactivatedCount++;
                }
                else
                {
                    // Safe to delete completely
                    _context.Users.Remove(user);
                    deletedCount++;
                }
            }

            await _context.SaveChangesAsync();

            var logEntry = new LogHistory
            {
                UserId = userId,
                User = currentUser,
                Timestamp = DateTime.UtcNow,
                ActionType = 9,
                Description = $"{currentUser.Username} performed bulk user cleanup: {deletedCount} deleted, {deactivatedCount} deactivated"
            };
            _context.LogHistories.Add(logEntry);
            await _context.SaveChangesAsync();

            var message = $"{deletedCount} users deleted, {deactivatedCount} users deactivated (had associated data).";
            return Ok(message);
        }

        [HttpGet("logs/{id}")]
        public async Task<IActionResult> GetUserLogHistory(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");
            int userId = int.Parse(userIdClaim);
            var ThisUser = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (ThisUser == null)
                return BadRequest("User not found.");
            if (!ThisUser.IsActive)
                return Unauthorized("User account is deactivated. Please contact un admin!");
            if (ThisUser.Role!.RoleName != "Admin")
                return Unauthorized("User Not Allowed To do this action.");
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                return NotFound("User not found!");
            var logsDto = await _context.LogHistories.Where(l => l.UserId == id).Include(l => l.User)
                .ThenInclude(u => u.Role)
            .Select(l => new LogHistoryDto
            {
                Id = l.Id,
                ActionType = l.ActionType,
                Timestamp = l.Timestamp,
                Description = l.Description,
                User = new UserLogDto
                {
                    Username = l.User.Username,
                    Role = l.User.Role != null ? l.User.Role.RoleName : string.Empty
                }
            }).OrderByDescending(l => l.Timestamp).ToListAsync();
            if (logsDto == null)
                return NotFound("User logs not found!");
            return Ok(logsDto);
        }
    }
}
// Console.ForegroundColor = ConsoleColor.Green;
// Console.WriteLine($"=== request Users === {request.RoleName}");
// Console.ResetColor();
