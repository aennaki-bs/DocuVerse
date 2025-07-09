# Email Verification Setup

This document explains how to set up email verification using Abstract API's Email Validation service.

## Overview

The email verification feature validates that email addresses actually exist before allowing user registration. It performs:

1. **Format validation** - Checks if the email follows proper format
2. **Domain validation** - Verifies the domain exists and has MX records
3. **SMTP validation** - Checks if the email address is deliverable
4. **Database check** - Ensures email is not already registered

## Setup Instructions

### 1. Get Abstract API Key

1. Visit [Abstract API Email Validation](https://app.abstractapi.com/api/email-validation)
2. Sign up for a free account (100 requests/month free)
3. Copy your API key from the dashboard

### 2. Configure Backend

Add your API key to the configuration:

**appsettings.json:**
```json
{
  "EmailVerification": {
    "AbstractApiKey": "your_api_key_here"
  }
}
```

**Environment variable (recommended for production):**
```bash
EmailVerification__AbstractApiKey=your_api_key_here
```

### 3. Development Mode

If no API key is configured, the service will:
- Log a warning
- Skip external validation
- Allow all properly formatted emails

This allows development without requiring an API key.

## API Response Handling

### Success Response
- Status: 200 OK
- Body: `"True"`

### Email Already Registered
- Status: 200 OK  
- Body: `"False"`

### Email Does Not Exist
- Status: 400 Bad Request
- Body: 
```json
{
  "message": "Email address does not exist or is not deliverable",
  "isValid": false,
  "reason": "email_not_exist"
}
```

## Frontend Integration

The frontend automatically handles the new validation:
- Shows appropriate error messages
- Caches validation results
- Provides user-friendly feedback

## Error Handling

The service is designed to be resilient:
- If API is down → allows registration (logs warning)
- If API key is invalid → allows registration (logs error)
- If network error → allows registration (logs error)

This ensures the registration process never fails due to external service issues.

## Testing

Test with these email addresses:
- `test@gmail.com` - Should be valid
- `invalid@nonexistentdomain12345.com` - Should be invalid
- `test@` - Should fail format validation

## Monitoring

Monitor these log messages:
- `Email verification API key not configured`
- `Email verification API returned error`
- `Failed to parse email verification response`

## Cost Considerations

Abstract API free tier:
- 100 requests/month
- Additional requests: $0.001 each

For high-volume applications, consider:
- Caching results longer
- Rate limiting validation requests
- Using bulk validation endpoints 