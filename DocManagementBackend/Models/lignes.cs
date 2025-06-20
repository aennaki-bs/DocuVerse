using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;

namespace DocManagementBackend.Models {
    public class Ligne
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int DocumentId { get; set; }
        [ForeignKey("DocumentId")]
        [JsonIgnore]
        public Document? Document { get; set; }
        public string LigneKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Article { get; set; } = string.Empty;
        [Obsolete("Use PriceHT instead")]
        public float Prix { get; set; }
        public int SousLigneCounter { get; set; } = 0;
        
        // Backward compatibility: Keep old field name during transition
        public int? LignesElementTypeId { get; set; }
        
        // New dynamic foreign key system
        public int? Type { get; set; } // Foreign key to LignesElementType(Id)
        [ForeignKey("Type")]
        public LignesElementType? LignesElementType { get; set; }
        
        [MaxLength(50)]
        public string? ElementId { get; set; } // Dynamic foreign key reference based on type
        
        // Location support - only applicable when LignesElementType is Item
        [MaxLength(50)]
        public string? LocationCode { get; set; } // Foreign key to Location
        [ForeignKey("LocationCode")]
        public Location? Location { get; set; }
        
        // Unit of measure support - only applicable when LignesElementType is Item
        [MaxLength(50)]
        public string? UnitCode { get; set; } // Foreign key to UnitOfMeasure
        [ForeignKey("UnitCode")]
        public UnitOfMeasure? Unit { get; set; }
        
        [Column(TypeName = "decimal(18,4)")]
        public decimal Quantity { get; set; } = 1;
        [Column(TypeName = "decimal(18,4)")]
        public decimal PriceHT { get; set; } = 0; // Adjusted price (unit price * ratio)
        [Column(TypeName = "decimal(18,4)")]
        public decimal OriginalPriceHT { get; set; } = 0; // Original unit price (before conversion)
        [Column(TypeName = "decimal(5,4)")]
        public decimal DiscountPercentage { get; set; } = 0;
        [Column(TypeName = "decimal(18,4)")]
        public decimal DiscountAmount { get; set; } = 0; // Calculated discount amount
        [Column(TypeName = "decimal(5,4)")]
        public decimal VatPercentage { get; set; } = 0;
        
        // Computed properties for accessing element data dynamically
        [NotMapped]
        public Item? Item { get; private set; }
        
        [NotMapped]
        public GeneralAccounts? GeneralAccount { get; private set; }
        
        [NotMapped]
        public UnitOfMeasure? UniteCode => Item?.UniteCodeNavigation;
        
        // Note: AmountHT, AmountVAT, and AmountTTC calculations are now handled by LigneCalculations utility
        // These properties are marked as obsolete and will be removed in future versions
        // Use LigneCalculations.CalculateAmountsForLigneAsync() instead for accurate calculations with unit conversion
        
        [NotMapped]
        [Obsolete("Use LigneCalculations.CalculateAmountsForLigneAsync() for accurate calculations with unit conversion")]
        public decimal AmountHT
        {
            get
            {
                // Legacy calculation - does not include unit conversion
                if (DiscountAmount > 0)
                {
                    return PriceHT * Quantity - DiscountAmount;
                }
                else
                {
                    return PriceHT * Quantity * (1 - DiscountPercentage);
                }
            }
        }
        
        [NotMapped]
        [Obsolete("Use LigneCalculations.CalculateAmountsForLigneAsync() for accurate calculations with unit conversion")]
        public decimal AmountVAT
        {
            get
            {
                // Legacy calculation - does not include unit conversion
                return AmountHT * VatPercentage;
            }
        }
        
        [NotMapped]
        [Obsolete("Use LigneCalculations.CalculateAmountsForLigneAsync() for accurate calculations with unit conversion")]
        public decimal AmountTTC
        {
            get
            {
                // Legacy calculation - does not include unit conversion
                return AmountHT + AmountVAT;
            }
        }
        
        // ERP Integration field
        [MaxLength(100)]
        public string? ERPLineCode { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        [JsonIgnore]
        public ICollection<SousLigne> SousLignes { get; set; } = new List<SousLigne>();
        
        // Method to synchronize LignesElementTypeId with Type during migration
        public void SynchronizeTypeFields()
        {
            if (Type.HasValue && !LignesElementTypeId.HasValue)
            {
                LignesElementTypeId = Type.Value;
            }
            else if (LignesElementTypeId.HasValue && !Type.HasValue)
            {
                Type = LignesElementTypeId.Value;
            }
        }
        
        // Method to load the appropriate element based on type
        public async Task LoadElementAsync(ApplicationDbContext context)
        {
            // Ensure type fields are synchronized
            SynchronizeTypeFields();
            
            if (LignesElementType == null || string.IsNullOrEmpty(ElementId))
                return;
                
            switch (LignesElementType.TypeElement)
            {
                case ElementType.Item:
                    Item = await context.Items
                        .Include(i => i.UniteCodeNavigation)
                        .FirstOrDefaultAsync(i => i.Code == ElementId);
                    break;
                case ElementType.GeneralAccounts:
                    GeneralAccount = await context.GeneralAccounts
                        .FirstOrDefaultAsync(ga => ga.Code == ElementId);
                    break;
            }
        }
        
        public void UpdateCalculatedFields()
        {
            // This method can be called before saving to update any stored calculated values
            // if you decide to store them in the database instead of computing them
        }
        
        public bool IsValid()
        {
            if (Quantity <= 0) return false;
            if (PriceHT < 0) return false;
            if (DiscountPercentage < 0 || DiscountPercentage > 1) return false;
            if (VatPercentage < 0 || VatPercentage > 1) return false;
            if (DiscountAmount < 0) return false;
            
            // Validate that ElementId corresponds to the appropriate reference table
            if (Type.HasValue && !string.IsNullOrEmpty(ElementId) && LignesElementType != null)
            {
                // Additional validation can be implemented here
                // For now, we rely on the LoadElementAsync method to validate the reference
                return true;
            }
            
            // Validate location is only set for Item types
            if (!string.IsNullOrEmpty(LocationCode) && LignesElementType != null)
            {
                if (LignesElementType.TypeElement != ElementType.Item)
                {
                    return false; // Location should only be set for Item types
                }
            }
            
            return true;
        }
    }

    public class SousLigne
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int LigneId { get; set; }
        [ForeignKey("LigneId")]
        [JsonIgnore]
        public Ligne? Ligne { get; set; }
        public string SousLigneKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Attribute { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}