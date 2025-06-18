using System.Security.Claims;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DocManagementBackend.Services
{
    public class UserAuthorizationService
    {
        private readonly ApplicationDbContext _context;

        public UserAuthorizationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<(bool IsAuthorized, ActionResult? ErrorResponse, User? User, int UserId)> AuthorizeUserAsync(
            ClaimsPrincipal userClaims, 
            string[]? allowedRoles = null)
        {
            // Default to Admin and FullUser if no roles specified
            allowedRoles ??= new[] { "Admin", "FullUser", "SimpleUser" };

            var userIdClaim = userClaims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (userIdClaim == null)
                return (false, new UnauthorizedObjectResult("User ID claim is missing."), null, 0);
            
            if (!int.TryParse(userIdClaim, out int userId))
                return (false, new UnauthorizedObjectResult("Invalid user ID format."), null, 0);

            var user = await _context.Users
                .Include(u => u.Role)
                .Include(u => u.ResponsibilityCentre)
                .FirstOrDefaultAsync(u => u.Id == userId);
            
            if (user == null)
                return (false, new BadRequestObjectResult("User not found."), null, userId);
            
            if (!user.IsActive)
                return (false, new UnauthorizedObjectResult("User account is deactivated. Please contact an admin!"), null, userId);
            
            if (user.Role == null || !allowedRoles.Contains(user.Role.RoleName))
                return (false, new UnauthorizedObjectResult($"User not allowed to perform this action. Required roles: {string.Join(", ", allowedRoles)}"), null, userId);

            return (true, null, user, userId);
        }
    }
} 