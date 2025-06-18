namespace DocManagementBackend.Models
{
    // LignesElementType DTOs
    public class LignesElementTypeDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string TypeElement { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TableName { get; set; } = string.Empty;
        public string? ItemCode { get; set; }
        public string? AccountCode { get; set; }
        public ItemDto? Item { get; set; }
        public GeneralAccountsDto? GeneralAccount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateLignesElementTypeRequest
    {
        public string Code { get; set; } = string.Empty;
        public string TypeElement { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TableName { get; set; } = string.Empty;
        public string? ItemCode { get; set; }
        public string? AccountCode { get; set; }
    }

    public class UpdateLignesElementTypeRequest
    {
        public string? Code { get; set; }
        public string? TypeElement { get; set; }
        public string? Description { get; set; }
        public string? TableName { get; set; }
        public string? ItemCode { get; set; }
        public string? AccountCode { get; set; }
    }

    // Item DTOs
    public class ItemDto
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Unite { get; set; }
        public UniteCodeDto? UniteCodeNavigation { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int ElementTypesCount { get; set; }
    }

    public class CreateItemRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Unite { get; set; }
    }

    public class UpdateItemRequest
    {
        public string? Description { get; set; }
        public string? Unite { get; set; }
    }

    // UniteCode DTOs
    public class UniteCodeDto
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int ItemsCount { get; set; }
    }

    public class CreateUniteCodeRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateUniteCodeRequest
    {
        public string? Code { get; set; }
        public string? Description { get; set; }
    }

    public class ValidateUniteCodeRequest
    {
        public string Code { get; set; } = string.Empty;
        public string? ExcludeCode { get; set; }
    }

    // GeneralAccounts DTOs
    public class GeneralAccountsDto
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? AccountType { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int LignesCount { get; set; }
    }

    public class CreateGeneralAccountsRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateGeneralAccountsRequest
    {
        public string? Code { get; set; }
        public string? Description { get; set; }
    }

    // Enhanced Ligne request DTOs (updated for new structure)
    public class CreateLigneRequest
    {
        public int DocumentId { get; set; }
        public string LigneKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Article { get; set; } = string.Empty;
        
        // Reference to line element via LignesElementType
        public int? LignesElementTypeId { get; set; }
        
        // Selected element code (Item.Code or GeneralAccounts.Code)
        public string? SelectedElementCode { get; set; }
        
        // Location reference (only for Item types)
        public string? LocationCode { get; set; }
        
        // Pricing fields
        public decimal Quantity { get; set; } = 1;
        public decimal PriceHT { get; set; } = 0;
        public decimal DiscountPercentage { get; set; } = 0;
        public decimal? DiscountAmount { get; set; }
        public decimal VatPercentage { get; set; } = 0;
    }

    public class UpdateLigneRequest
    {
        public string? LigneKey { get; set; }
        public string? Title { get; set; }
        public string? Article { get; set; }
        
        // Reference to line element via LignesElementType
        public int? LignesElementTypeId { get; set; }
        
        // Selected element code (Item.Code or GeneralAccounts.Code)
        public string? SelectedElementCode { get; set; }
        
        // Location reference (only for Item types)
        public string? LocationCode { get; set; }
        
        // Pricing fields
        public decimal? Quantity { get; set; }
        public decimal? PriceHT { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? VatPercentage { get; set; }
    }

    // Simple DTOs for dropdowns
    public class LignesElementTypeSimpleDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string TypeElement { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class ItemSimpleDto
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Unite { get; set; }
    }

    public class UniteCodeSimpleDto
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class GeneralAccountsSimpleDto
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
} 