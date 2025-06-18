namespace DocManagementBackend.Models
{
    public class CreateResponsibilityCentreRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Descr { get; set; } = string.Empty;
    }

    public class UpdateResponsibilityCentreRequest
    {
        public string? Code { get; set; }
        public string? Descr { get; set; }
    }

    public class AssociateUsersToResponsibilityCentreRequest
    {
        public int ResponsibilityCentreId { get; set; }
        public List<int> UserIds { get; set; } = new List<int>();
    }

    public class RemoveUsersFromResponsibilityCentreRequest
    {
        public List<int> UserIds { get; set; } = new List<int>();
    }

    public class AssociateUsersToResponsibilityCentreResponse
    {
        public int ResponsibilityCentreId { get; set; }
        public string ResponsibilityCentreCode { get; set; } = string.Empty;
        public string ResponsibilityCentreDescription { get; set; } = string.Empty;
        public int TotalUsersRequested { get; set; }
        public int UsersSuccessfullyAssociated { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
        public List<UserAssociationResult> Results { get; set; } = new List<UserAssociationResult>();
    }

    public class UserAssociationResult
    {
        public int UserId { get; set; }
        public string UserEmail { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
        public string? PreviousResponsibilityCentre { get; set; }
    }

    public class ResponsibilityCentreUserDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool IsOnline { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? ProfilePicture { get; set; }
        public RoleDto? Role { get; set; }
    }

    public class ResponsibilityCentreDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Descr { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int UsersCount { get; set; }
        public int DocumentsCount { get; set; }
        public List<ResponsibilityCentreUserDto> Users { get; set; } = new List<ResponsibilityCentreUserDto>();
    }

    public class ResponsibilityCentreSimpleDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Descr { get; set; } = string.Empty;
    }
} 