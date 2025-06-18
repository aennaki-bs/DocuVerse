using System.ComponentModel.DataAnnotations;

namespace DocManagementBackend.Models
{
    // Configuration models
    public class ApiSyncConfiguration
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string EndpointName { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string ApiUrl { get; set; } = string.Empty;
        
        public int PollingIntervalMinutes { get; set; } = 60;
        
        public bool IsEnabled { get; set; } = true;
        
        public DateTime LastSyncTime { get; set; } = DateTime.MinValue;
        
        public DateTime NextSyncTime { get; set; } = DateTime.UtcNow;
        
        [MaxLength(1000)]
        public string? LastSyncStatus { get; set; }
        
        [MaxLength(2000)]
        public string? LastErrorMessage { get; set; }
        
        public int SuccessfulSyncs { get; set; } = 0;
        
        public int FailedSyncs { get; set; } = 0;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    // External API DTOs
    public class BcApiResponse<T>
    {
        public List<T> Value { get; set; } = new List<T>();
        public string? ODataContext { get; set; }
    }

    public class BcItemDto
    {
        public string No { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string BaseUnitofMeasure { get; set; } = string.Empty;
    }

    public class BcGeneralAccountDto
    {
        public string No { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string IncomeBalance { get; set; } = string.Empty;
    }

    public class BcCustomerDto
    {
        public string No { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
    }

    public class BcVendorDto
    {
        public string No { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
    }

    public class BcLocationDto
    {
        public string No { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class BcResponsibilityCentreDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class BcUnitOfMeasureDto
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class BcItemUnitOfMeasureDto
    {
        public string ItemNo { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public decimal QtyperUnitofMeasure { get; set; } = 1;
    }

    // Sync result models
    public class SyncResult
    {
        public string EndpointName { get; set; } = string.Empty;
        public bool IsSuccess { get; set; }
        public int RecordsProcessed { get; set; }
        public int RecordsInserted { get; set; }
        public int RecordsSkipped { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime SyncTime { get; set; } = DateTime.UtcNow;
        public TimeSpan Duration { get; set; }
    }

    // API endpoint configuration
    public enum ApiEndpointType
    {
        UnitOfMeasures,        // Must sync first - referenced by Items
        Items,                 // Depends on UnitOfMeasures
        GeneralAccounts,
        Customers,
        Vendors,
        Locations,
        ResponsibilityCentres,
        ItemUnitOfMeasures     // Must sync last - depends on both Items and UnitOfMeasures
    }

    public class ApiEndpointConfig
    {
        public string Name { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public ApiEndpointType Type { get; set; }
        public int DefaultPollingIntervalMinutes { get; set; } = 60;
    }
} 