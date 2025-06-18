namespace DocManagementBackend.Models
{
    public class LignesRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Attribute { get; set; } = string.Empty;
    }

    public class LigneDto
    {
        public int Id { get; set; }
        public int DocumentId { get; set; }
        public string LigneKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Article { get; set; } = string.Empty;
        
        // Legacy field
        public float Prix { get; set; }
        
        public int SousLignesCount { get; set; }
        
        // LignesElementType reference (new normalized structure)
        public int? LignesElementTypeId { get; set; }
        public LignesElementTypeDto? LignesElementType { get; set; }
        
        // Element references (computed properties from LignesElementType)
        public string? ItemCode { get; set; }
        public ItemDto? Item { get; set; }
        public string? GeneralAccountsCode { get; set; }
        public GeneralAccountsDto? GeneralAccounts { get; set; }
        
        // Location reference (only for Item types)
        public string? LocationCode { get; set; }
        public LocationDto? Location { get; set; }
        
        // Pricing fields
        public decimal Quantity { get; set; }
        public decimal PriceHT { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal VatPercentage { get; set; }
        
        // Calculated fields
        public decimal AmountHT { get; set; }
        public decimal AmountVAT { get; set; }
        public decimal AmountTTC { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DocumentDto Document { get; set; } = new DocumentDto();
    }

    public class SousLigneDto
    {
        public int Id { get; set; }
        public int LigneId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Attribute { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public LigneDto Ligne { get; set; } = new LigneDto();
    }
}