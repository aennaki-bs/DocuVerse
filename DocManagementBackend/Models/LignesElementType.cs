using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DocManagementBackend.Models
{
    public enum ElementType
    {
        Item,
        GeneralAccounts
    }

    public class LignesElementType
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty; // Unique identifier for each line element type
        
        [Required]
        public ElementType TypeElement { get; set; } // ENUM: 'Item' | 'GeneralAccounts'
        
        // Backward compatibility: Helper property for string conversion
        [NotMapped]
        public string TypeElementString
        {
            get => TypeElement.ToString();
            set => TypeElement = Enum.Parse<ElementType>(value, true);
        }
        
        [Required]
        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string TableName { get; set; } = string.Empty; // e.g., 'Item', 'GeneralAccounts'
        
        // Backward compatibility: Keep old conditional foreign keys during transition
        [MaxLength(50)]
        public string? ItemCode { get; set; } // Foreign key to Item.Code when TypeElement = 'Item'
        
        [MaxLength(50)]
        public string? AccountCode { get; set; } // Foreign key to GeneralAccounts.Code when TypeElement = 'General Accounts'
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties for backward compatibility
        [ForeignKey("ItemCode")]
        public Item? Item { get; set; }
        
        [ForeignKey("AccountCode")]
        public GeneralAccounts? GeneralAccount { get; set; }
        
        // Navigation properties
        [JsonIgnore]
        public ICollection<Ligne> Lignes { get; set; } = new List<Ligne>();
        
        // Validation method for backward compatibility
        public bool IsValid()
        {
            // Allow generic element types without specific references
            // These are used as templates for creating lines
            if (string.IsNullOrEmpty(ItemCode) && string.IsNullOrEmpty(AccountCode))
                return true;
            
            // For specific element types, ensure only one of the foreign keys is populated based on TypeElement
            switch (TypeElement)
            {
                case ElementType.Item:
                    return !string.IsNullOrEmpty(ItemCode) && string.IsNullOrEmpty(AccountCode);
                case ElementType.GeneralAccounts:
                    return !string.IsNullOrEmpty(AccountCode) && string.IsNullOrEmpty(ItemCode);
                default:
                    return false;
            }
        }
    }

    public class GeneralAccounts
    {
        [Key]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string? AccountType { get; set; } // Stores IncomeBalance from BC API
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Backward compatibility: Stored count of lines using this general account
        public int LinesCount { get; set; } = 0;
        
        // Navigation properties for backward compatibility
        [JsonIgnore]
        public ICollection<LignesElementType> LignesElementTypes { get; set; } = new List<LignesElementType>();
    }

    public class Item
    {
        [Key]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        // Foreign key to UnitOfMeasure (renamed from UniteCode)
        [MaxLength(50)]
        public string? Unite { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [ForeignKey("Unite")]
        public UnitOfMeasure? UniteCodeNavigation { get; set; }
        
        // Backward compatibility navigation
        [JsonIgnore]
        public ICollection<LignesElementType> LignesElementTypes { get; set; } = new List<LignesElementType>();
        
        // Navigation to ItemUnitOfMeasure
        [JsonIgnore]
        public ICollection<ItemUnitOfMeasure> ItemUnitOfMeasures { get; set; } = new List<ItemUnitOfMeasure>();
    }

    // New table for item-specific unit of measure mappings and conversion ratios
    public class ItemUnitOfMeasure
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string ItemCode { get; set; } = string.Empty; // Foreign key to Item.Code
        
        [Required]
        [MaxLength(50)]
        public string UnitOfMeasureCode { get; set; } = string.Empty; // Foreign key to UnitOfMeasure.Code
        
        [Required]
        [Column(TypeName = "decimal(18,6)")]
        public decimal QtyPerUnitOfMeasure { get; set; } = 1; // Conversion ratio from the default unit to this unit
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [ForeignKey("ItemCode")]
        public Item Item { get; set; } = null!;
        
        [ForeignKey("UnitOfMeasureCode")]
        public UnitOfMeasure UnitOfMeasure { get; set; } = null!;
    }

    public class UnitOfMeasure // Renamed from UniteCode
    {
        [Key]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Backward compatibility: Stored count of items using this unit
        public int ItemsCount { get; set; } = 0;
        
        // Navigation properties
        [JsonIgnore]
        public ICollection<Item> Items { get; set; } = new List<Item>();
        
        // Navigation to ItemUnitOfMeasure
        [JsonIgnore]
        public ICollection<ItemUnitOfMeasure> ItemUnitOfMeasures { get; set; } = new List<ItemUnitOfMeasure>();
    }

    // Tier Type enum for DocumentType
    public enum TierType
    {
        None = 0,
        Customer = 1,
        Vendor = 2
    }

    // Customer model
    public class Customer
    {
        [Key]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string Address { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string Country { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [JsonIgnore]
        public ICollection<Document> Documents { get; set; } = new List<Document>();
    }

    // Vendor model
    public class Vendor
    {
        [Key]
        [MaxLength(50)]
        public string VendorCode { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(500)]
        public string Address { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string Country { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [JsonIgnore]
        public ICollection<Document> Documents { get; set; } = new List<Document>();
    }

    // Location model
    public class Location
    {
        [Key]
        [MaxLength(50)]
        public string LocationCode { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    // DTOs for new entities
    public class CustomerDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int DocumentsCount { get; set; }
    }

    public class CustomerSimpleDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    public class VendorDto
    {
        public string VendorCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int DocumentsCount { get; set; }
    }

    public class VendorSimpleDto
    {
        public string VendorCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    public class LocationDto
    {
        public string LocationCode { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class LocationSimpleDto
    {
        public string LocationCode { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    // Request DTOs
    public class CreateCustomerRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
    }

    public class UpdateCustomerRequest
    {
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
    }

    public class CreateVendorRequest
    {
        public string VendorCode { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
    }

    public class UpdateVendorRequest
    {
        public string? VendorCode { get; set; }
        public string? Name { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
    }

    public class CreateLocationRequest
    {
        public string LocationCode { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateLocationRequest
    {
        public string? LocationCode { get; set; }
        public string? Description { get; set; }
    }

    public class ValidateCustomerCodeRequest
    {
        public string Code { get; set; } = string.Empty;
        public string? ExcludeCode { get; set; }
    }

    public class ValidateVendorCodeRequest
    {
        public string VendorCode { get; set; } = string.Empty;
        public string? ExcludeVendorCode { get; set; }
    }

    public class ValidateLocationCodeRequest
    {
        public string LocationCode { get; set; } = string.Empty;
        public string? ExcludeLocationCode { get; set; }
    }
} 