namespace DocManagementBackend.Models {
    public class LoginRequest
    {
        public string EmailOrUsername { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
    public class LogoutRequest { public int UserId { get; set; } }

    public class RegisterRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string WebSite { get; set; } = string.Empty;
        public string Identity { get; set; } = string.Empty;
        public int? ResponsibilityCentreId { get; set; }
        public CreateResponsibilityCentreRequest? NewResponsibilityCentre { get; set; }
    }

    public class VerifyEmailRequest
    {
        public string? Email { get; set; }
        public string? VerificationCode { get; set; }
    }

    public class JwtSettings
    {
        public string SecretKey { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int ExpiryMinutes { get; set; } = 180;
    }
}