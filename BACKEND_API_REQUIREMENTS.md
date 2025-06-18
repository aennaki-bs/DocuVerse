# Backend API Requirements

## Missing API Endpoints

### 1. Ligne Code Validation Endpoint

**Endpoint:** `POST /api/Lignes/validate-code`

**Purpose:** Validate that a ligne code is unique within a specific document.

**Request Body:**
```json
{
  "code": "string",
  "documentId": "number"
}
```

**Response:**
```json
{
  "isValid": "boolean",
  "message": "string (optional)"
}
```

**Example Request:**
```json
{
  "code": "L001",
  "documentId": 45
}
```

**Example Responses:**

**Success (code is unique):**
```json
{
  "isValid": true,
  "message": "Code is available"
}
```

**Failure (code already exists):**
```json
{
  "isValid": false,
  "message": "Code already exists in this document"
}
```

**Implementation Notes:**
- Check against both `ligneKey` and `title` fields in the database
- Case-insensitive comparison
- Only check within the specified document (by documentId)
- Return 400 for invalid request format
- Return 404 if document doesn't exist

## Current Workaround

The frontend currently uses **client-side validation** by:
1. Fetching all existing lignes for the document using `GET /api/Lignes/by-document/{documentId}`
2. Checking for duplicates locally
3. This works but is less efficient and secure than server-side validation

## Recommended Implementation

```csharp
[HttpPost("validate-code")]
public async Task<IActionResult> ValidateCode([FromBody] ValidateLigneCodeRequest request)
{
    try
    {
        // Validate request
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return BadRequest(new { isValid = false, message = "Code is required" });
        }

        // Check if document exists
        var documentExists = await _context.Documents.AnyAsync(d => d.Id == request.DocumentId);
        if (!documentExists)
        {
            return NotFound(new { isValid = false, message = "Document not found" });
        }

        // Check for duplicate codes (case-insensitive)
        var codeExists = await _context.Lignes
            .AnyAsync(l => l.DocumentId == request.DocumentId && 
                          (l.LigneKey.ToLower() == request.Code.ToLower() || 
                           l.Title.ToLower() == request.Code.ToLower()));

        return Ok(new { 
            isValid = !codeExists,
            message = codeExists ? "Code already exists in this document" : "Code is available"
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error validating ligne code");
        return StatusCode(500, new { isValid = false, message = "Internal server error" });
    }
}

public class ValidateLigneCodeRequest
{
    public string Code { get; set; }
    public int DocumentId { get; set; }
}
``` 