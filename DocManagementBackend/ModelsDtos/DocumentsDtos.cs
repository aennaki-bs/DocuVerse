namespace DocManagementBackend.Models
{

    public class CreateDocumentRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public int TypeId { get; set; }
        public int? SubTypeId { get; set; }
        public string? DocumentAlias { get; set; }
        public string? DocumentExterne { get; set; }
        public DateTime? DocDate { get; set; }
        public DateTime? ComptableDate { get; set; }
        public int? CircuitId { get; set; }
        public int? ResponsibilityCentreId { get; set; }
        
        // Customer/Vendor information
        public string? CustomerVendorCode { get; set; }
        public string? CustomerVendorName { get; set; }
        public string? CustomerVendorAddress { get; set; }
        public string? CustomerVendorCity { get; set; }
        public string? CustomerVendorCountry { get; set; }
    }

    public class UpdateDocumentRequest
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        public int? TypeId { get; set; }
        public int? SubTypeId { get; set; }
        public string? DocumentAlias { get; set; }
        public string? DocumentExterne { get; set; }
        public DateTime? DocDate { get; set; }
        public DateTime? ComptableDate { get; set; }
        public int? CircuitId { get; set; }
        
        // Customer/Vendor information
        public string? CustomerVendorCode { get; set; }
        public string? CustomerVendorName { get; set; }
        public string? CustomerVendorAddress { get; set; }
        public string? CustomerVendorCity { get; set; }
        public string? CustomerVendorCountry { get; set; }
    }
    
    public class DocumentDto
    {
        public int Id { get; set; }
        public string DocumentKey { get; set; } = string.Empty;
        public string DocumentAlias { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime DocDate { get; set; }
        public DateTime ComptableDate { get; set; }
        public string DocumentExterne { get; set; } = string.Empty;
        public int Status { get; set; }
        public int TypeId { get; set; }
        public DocumentTypeDto? DocumentType { get; set; }
        public int? SubTypeId { get; set; }
        public SubTypeDto? SubType { get; set; }
        public int CreatedByUserId { get; set; }
        public DocumentUserDto? CreatedBy { get; set; }
        public int? UpdatedByUserId { get; set; }
        public DocumentUserDto? UpdatedBy { get; set; }
        public int LignesCount { get; set; }
        public int SousLignesCount { get; set; }
        public int? CircuitId { get; set; }
        public int? CurrentStepId { get; set; }
        public string CurrentStepTitle { get; set; } = string.Empty;
        public int? CurrentStatusId { get; set; }
        public string CurrentStatusTitle { get; set; } = string.Empty;
        public bool IsCircuitCompleted { get; set; }
        public int? ResponsibilityCentreId { get; set; }
        public ResponsibilityCentreSimpleDto? ResponsibilityCentre { get; set; }
        
        // Customer/Vendor information
        public string? CustomerVendorCode { get; set; }
        public string? CustomerVendorName { get; set; }
        public string? CustomerVendorAddress { get; set; }
        public string? CustomerVendorCity { get; set; }
        public string? CustomerVendorCountry { get; set; }
        
        // ERP Integration
        public string? ERPDocumentCode { get; set; }
    }

    public class DocumentTypeDto
    {
        public int TypeNumber { get; set; }
        public string TypeAlias { get; set; } = string.Empty;
        public string TypeKey { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty;
        public string TypeAttr { get; set; } = string.Empty;
        public TierType TierType { get; set; } = TierType.None;
    }

    public class DocumentUserDto
    {
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Role { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
    }
}
