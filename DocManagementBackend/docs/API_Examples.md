# API Examples for Responsibility Centre User Association

## Associate Users to Responsibility Centre

### Endpoint
```
POST /api/ResponsibilityCentre/associate-users
```

### Authorization
- Requires Admin role
- Include JWT token in Authorization header: `Bearer {token}`

### Request Body
```json
{
  "responsibilityCentreId": 1,
  "userIds": [10, 15, 23, 45]
}
```

### Response Examples

#### Successful Association (200 OK)
```json
{
  "responsibilityCentreId": 1,
  "responsibilityCentreCode": "IT_DEPT",
  "responsibilityCentreDescription": "Information Technology Department",
  "totalUsersRequested": 4,
  "usersSuccessfullyAssociated": 4,
  "errors": [],
  "results": [
    {
      "userId": 10,
      "userEmail": "john.doe@company.com",
      "userName": "John Doe",
      "success": true,
      "errorMessage": null,
      "previousResponsibilityCentre": "HR_DEPT"
    },
    {
      "userId": 15,
      "userEmail": "jane.smith@company.com",
      "userName": "Jane Smith",
      "success": true,
      "errorMessage": null,
      "previousResponsibilityCentre": null
    },
    {
      "userId": 23,
      "userEmail": "bob.wilson@company.com",
      "userName": "Bob Wilson",
      "success": true,
      "errorMessage": null,
      "previousResponsibilityCentre": "FINANCE"
    },
    {
      "userId": 45,
      "userEmail": "alice.brown@company.com",
      "userName": "Alice Brown",
      "success": true,
      "errorMessage": null,
      "previousResponsibilityCentre": null
    }
  ]
}
```

#### Partial Success (207 Multi-Status)
```json
{
  "responsibilityCentreId": 1,
  "responsibilityCentreCode": "IT_DEPT",
  "responsibilityCentreDescription": "Information Technology Department",
  "totalUsersRequested": 4,
  "usersSuccessfullyAssociated": 2,
  "errors": [
    "User with ID 999 not found.",
    "User with ID 888 not found."
  ],
  "results": [
    {
      "userId": 10,
      "userEmail": "john.doe@company.com",
      "userName": "John Doe",
      "success": true,
      "errorMessage": null,
      "previousResponsibilityCentre": "HR_DEPT"
    },
    {
      "userId": 15,
      "userEmail": "jane.smith@company.com",
      "userName": "Jane Smith",
      "success": true,
      "errorMessage": null,
      "previousResponsibilityCentre": null
    },
    {
      "userId": 999,
      "userEmail": "Unknown",
      "userName": "Unknown",
      "success": false,
      "errorMessage": "User not found",
      "previousResponsibilityCentre": null
    },
    {
      "userId": 888,
      "userEmail": "Unknown",
      "userName": "Unknown",
      "success": false,
      "errorMessage": "User not found",
      "previousResponsibilityCentre": null
    }
  ]
}
```

### Error Responses

#### Bad Request (400)
```json
{
  "message": "At least one user ID must be provided."
}
```

```json
{
  "message": "Cannot associate more than 100 users at once."
}
```

#### Not Found (404)
```json
{
  "message": "Responsibility Centre not found."
}
```

#### Unauthorized (401)
```json
{
  "message": "Unauthorized"
}
```

#### Forbidden (403)
```json
{
  "message": "Access denied. Admin role required."
}
```

### Usage Notes

1. **Batch Processing**: You can associate up to 100 users at once
2. **Overwrite Behavior**: If a user is already associated with another responsibility centre, they will be moved to the new one
3. **Partial Success**: The API returns 207 Multi-Status if some users succeed and others fail
4. **Transaction Safety**: All successful associations are saved together; if database save fails, no changes are made
5. **Detailed Results**: Each user's association result is returned with success status and any error messages

### cURL Example
```bash
curl -X POST "https://your-api-domain/api/ResponsibilityCentre/associate-users" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "responsibilityCentreId": 1,
    "userIds": [10, 15, 23, 45]
  }'
```

## Remove Users from Responsibility Centre

### Endpoint
```
POST /api/ResponsibilityCentre/remove-users
```

### Authorization
- Requires Admin role
- Include JWT token in Authorization header: `Bearer {token}`

### Request Body
```json
{
  "userIds": [10, 15, 23, 45]
}
```

### Response Example (200 OK)
```json
{
  "responsibilityCentreId": 0,
  "responsibilityCentreCode": "NONE",
  "responsibilityCentreDescription": "No Responsibility Centre",
  "totalUsersRequested": 4,
  "usersSuccessfullyAssociated": 4,
  "errors": [],
  "results": [
    {
      "userId": 10,
      "userEmail": "john.doe@company.com",
      "userName": "John Doe",
      "success": true,
      "errorMessage": null,
      "previousResponsibilityCentre": "IT_DEPT"
    },
    {
      "userId": 15,
      "userEmail": "jane.smith@company.com",
      "userName": "Jane Smith",
      "success": true,
      "errorMessage": null,
      "previousResponsibilityCentre": "HR_DEPT"
    },
    {
      "userId": 23,
      "userEmail": "bob.wilson@company.com",
      "userName": "Bob Wilson",
      "success": true,
      "errorMessage": null,
      "previousResponsibilityCentre": "FINANCE"
    },
    {
      "userId": 45,
      "userEmail": "alice.brown@company.com",
      "userName": "Alice Brown",
      "success": true,
      "errorMessage": null,
      "previousResponsibilityCentre": null
    }
  ]
}
```

### Error Responses

#### Bad Request (400)
```json
{
  "message": "At least one user ID must be provided."
}
```

```json
{
  "message": "Cannot associate more than 100 users at once."
}
```

#### Not Found (404)
```json
{
  "message": "Responsibility Centre not found."
}
```

#### Unauthorized (401)
```json
{
  "message": "Unauthorized"
}
```

#### Forbidden (403)
```json
{
  "message": "Access denied. Admin role required."
}
```

### Usage Notes

1. **Batch Processing**: You can associate up to 100 users at once
2. **Overwrite Behavior**: If a user is already associated with another responsibility centre, they will be moved to the new one
3. **Partial Success**: The API returns 207 Multi-Status if some users succeed and others fail
4. **Transaction Safety**: All successful associations are saved together; if database save fails, no changes are made
5. **Detailed Results**: Each user's association result is returned with success status and any error messages

### cURL Examples

#### Associate Users
```bash
curl -X POST "https://your-api-domain/api/ResponsibilityCentre/associate-users" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "responsibilityCentreId": 1,
    "userIds": [10, 15, 23, 45]
  }'
```

#### Remove Users
```bash
curl -X POST "https://your-api-domain/api/ResponsibilityCentre/remove-users" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": [10, 15, 23, 45]
  }'
``` 