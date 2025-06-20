namespace DocManagementBackend.Models
{
    public class LignesRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Attribute { get; set; } = string.Empty;
    }

    // DTO for creating lines in ERP via Business Central API
    public class ErpLineCreateRequest
    {
        public int TierTYpe { get; set; }          // 0 = None, 1 = Customer, 2 = Vendor
        public int DocType { get; set; }          // Integer type of the document
        public string DocNo { get; set; } = string.Empty;        // The ERP document number
        public int Type { get; set; }             // 1 = General Account, 2 = Item
        public string CodeLine { get; set; } = string.Empty;     // Code from Line's linked element
        public string DescriptionLine { get; set; } = string.Empty; // Description of the line
        public string LocationCode { get; set; } = string.Empty; // Location code for Items
        public decimal Qty { get; set; }         // Quantity from the line
        public string UniteOfMeasure { get; set; } = string.Empty; // Unit of measure code
        public decimal UnitpriceCOst { get; set; }  // Unit price excluding tax
        public decimal DiscountAmt { get; set; }    // Total discount amount
    }

    // Response DTO for ERP line creation
    public class ErpLineCreateResponse
    {
        public string? LineNumber { get; set; }  // The ERP line number returned from BC
        public bool IsSuccess { get; set; }
        public string? ErrorMessage { get; set; }
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
        
        // Unit of measure reference (only for Item types)
        public string? UnitCode { get; set; }
        public UniteCodeDto? Unit { get; set; }
        
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
        
        // ERP Integration field
        public string? ERPLineCode { get; set; }
        
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