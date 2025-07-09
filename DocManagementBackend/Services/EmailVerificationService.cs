using System.Text.Json;
using System.Text.Json.Serialization;

namespace DocManagementBackend.Services
{
    public interface IEmailVerificationService
    {
        Task<bool> VerifyEmailExistsAsync(string email);
    }

    public class EmailVerificationService : IEmailVerificationService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly ILogger<EmailVerificationService> _logger;

        public EmailVerificationService(HttpClient httpClient, IConfiguration configuration, ILogger<EmailVerificationService> logger)
        {
            _httpClient = httpClient;
            _apiKey = Environment.GetEnvironmentVariable("ABSTRACT_API_KEY") ?? "";
            _logger = logger;
        }

        public async Task<bool> VerifyEmailExistsAsync(string email)
        {
            try
            {
                // Log API key status for debugging
                _logger.LogInformation("Email verification API key configured: {IsConfigured}", !string.IsNullOrEmpty(_apiKey));
                
                // If no API key is configured, skip verification and return true
                if (string.IsNullOrEmpty(_apiKey))
                {
                    _logger.LogWarning("Email verification API key not configured. Skipping external validation for {Email}", email);
                    return true; // Allow all emails in development
                }

                // Basic email format validation first
                if (!IsValidEmailFormat(email))
                {
                    _logger.LogWarning("Invalid email format: {Email}", email);
                    return false;
                }

                // Call Abstract API Email Validation
                var apiUrl = $"https://emailvalidation.abstractapi.com/v1/?api_key={_apiKey}&email={Uri.EscapeDataString(email)}";
                
                _logger.LogInformation("Calling Abstract API for email: {Email}", email);
                var response = await _httpClient.GetAsync(apiUrl);
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Email verification API returned error: {StatusCode}", response.StatusCode);
                    return true; // Allow registration if API fails
                }

                var jsonResponse = await response.Content.ReadAsStringAsync();
                _logger.LogInformation("Abstract API response: {Response}", jsonResponse);
                
                var apiResult = JsonSerializer.Deserialize<AbstractApiResponse>(jsonResponse, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (apiResult == null)
                {
                    _logger.LogError("Failed to parse email verification response");
                    return true; // Allow registration if parsing fails
                }

                // Enhanced validation approach
                var isValidFormat = apiResult.IsValidFormat?.Value == true;
                var hasMxRecord = apiResult.IsMxFound?.Value == true;
                var isDeliverable = apiResult.Deliverability?.ToUpperInvariant() == "DELIVERABLE";
                var isDisposable = apiResult.IsDisposableEmail?.Value == true;
                var isRoleEmail = apiResult.IsRoleEmail?.Value == true;
                
                _logger.LogInformation("Email {Email} validation - Format: {IsValidFormat}, MX: {HasMx}, Deliverable: {IsDeliverable}, Disposable: {IsDisposable}, Role: {IsRoleEmail}", 
                    email, isValidFormat, hasMxRecord, isDeliverable, isDisposable, isRoleEmail);

                // Reject disposable emails
                if (isDisposable)
                {
                    _logger.LogWarning("Email {Email} rejected - disposable email not allowed", email);
                    return false;
                }

                // Reject role emails (like info@, admin@, etc.)
                if (isRoleEmail)
                {
                    _logger.LogWarning("Email {Email} rejected - role emails not allowed", email);
                    return false;
                }

                // Reject undeliverable emails regardless of provider
                if (!isDeliverable)
                {
                    _logger.LogWarning("Email {Email} rejected - email is undeliverable", email);
                    return false;
                }

                // For major email providers, if format is valid and deliverable, accept it
                if (isValidFormat && IsMajorEmailProvider(email))
                {
                    _logger.LogInformation("Email {Email} is from a major provider with valid format and deliverable, accepting", email);
                    return true;
                }
                
                // For other providers, require format, MX record, and deliverability
                var isValid = isValidFormat && hasMxRecord && isDeliverable;
                
                _logger.LogInformation("Email {Email} final validation result: {IsValid}", email, isValid);
                
                return isValid;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error verifying email {Email}", email);
                return true; // Allow registration if there's an exception
            }
        }

        private static bool IsValidEmailFormat(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        private static bool IsMajorEmailProvider(string email)
        {
            var domain = email.Split('@').LastOrDefault()?.ToLowerInvariant();
            if (string.IsNullOrEmpty(domain)) return false;

            var majorProviders = new[]
            {
                "gmail.com", "googlemail.com",
                "yahoo.com", "yahoo.fr", "yahoo.co.uk", "yahoo.ca", "yahoo.de", "yahoo.es", "yahoo.it",
                "hotmail.com", "hotmail.fr", "hotmail.co.uk", "hotmail.de", "hotmail.es", "hotmail.it",
                "outlook.com", "live.com", "msn.com",
                "icloud.com", "me.com", "mac.com"
            };

            return majorProviders.Contains(domain);
        }
    }

    // DTOs for Abstract API Response
    public class AbstractApiResponse
    {
        public string? Email { get; set; }
        
        [JsonPropertyName("is_valid_format")]
        public BooleanField? IsValidFormat { get; set; }
        
        [JsonPropertyName("deliverability")]
        public string? Deliverability { get; set; }
        
        [JsonPropertyName("is_mx_found")]
        public BooleanField? IsMxFound { get; set; }
        
        [JsonPropertyName("is_smtp_valid")]
        public BooleanField? IsSmtpValid { get; set; }

        [JsonPropertyName("is_disposable_email")]
        public BooleanField? IsDisposableEmail { get; set; }

        [JsonPropertyName("is_role_email")]
        public BooleanField? IsRoleEmail { get; set; }
    }

    public class BooleanField
    {
        public bool? Value { get; set; }
        public string? Text { get; set; }
    }
} 