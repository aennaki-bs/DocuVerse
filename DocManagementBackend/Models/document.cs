using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DocManagementBackend.Models
{
    public class Document
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int CreatedByUserId { get; set; }
        [ForeignKey("CreatedByUserId")]
        public required User CreatedBy { get; set; }
        public int? UpdatedByUserId { get; set; }
        [ForeignKey("UpdatedByUserId")]
        public User? UpdatedBy { get; set; }
        public int TypeId { get; set; }
        [ForeignKey("TypeId")]
        public DocumentType? DocumentType { get; set; }

        // New SubType relationship
        public int? SubTypeId { get; set; }
        [ForeignKey("SubTypeId")]
        public SubType? SubType { get; set; }
        public int? CurrentStatusId { get; set; }
        [ForeignKey("CurrentStatusId")]
        [JsonIgnore]
        public Status? CurrentStatus { get; set; }
        public int? CurrentStepId { get; set; }
        [ForeignKey("CurrentStepId")]
        [JsonIgnore]
        public Step? CurrentStep { get; set; }
        public int? CircuitId { get; set; }
        [ForeignKey("CircuitId")]
        public Circuit? Circuit { get; set; }
        public bool IsCircuitCompleted { get; set; } = false;
        
        public int? ResponsibilityCentreId { get; set; }
        [ForeignKey("ResponsibilityCentreId")]
        [JsonIgnore]
        public ResponsibilityCentre? ResponsibilityCentre { get; set; }
        [Required]
        public string DocumentKey { get; set; } = string.Empty;
        public string DocumentAlias { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        [Required]
        public int Status { get; set; } // 0 = Open, 1 = Validated
        public DateTime DocDate { get; set; }
        public DateTime ComptableDate { get; set; }
        public string DocumentExterne { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int LigneCouter { get; set; } = 0;
        public bool IsDeleted { get; set; } = false;
        
        // New customer/vendor relationship
        [MaxLength(50)]
        public string? CustomerOrVendor { get; set; }
        
        // Navigation properties for Customer and Vendor (will be resolved based on DocumentType.TierType)
        [ForeignKey("CustomerOrVendor")]
        public Customer? Customer { get; set; }
        
        [ForeignKey("CustomerOrVendor")]  
        public Vendor? Vendor { get; set; }
        
        // Customer/Vendor snapshot fields for historical accuracy
        [MaxLength(50)]
        public string? CustomerVendorCode { get; set; }
        
        [MaxLength(200)]
        public string? CustomerVendorName { get; set; }
        
        [MaxLength(500)]
        public string? CustomerVendorAddress { get; set; }
        
        [MaxLength(100)]
        public string? CustomerVendorCity { get; set; }
        
        [MaxLength(100)]
        public string? CustomerVendorCountry { get; set; }
        
        // ERP Integration field
        [MaxLength(100)]
        public string? ERPDocumentCode { get; set; }
        
        [JsonIgnore]
        public ICollection<Ligne> Lignes { get; set; } = new List<Ligne>();
    }

    public class DocumentType
    {
        [Key]
        public int Id { get; set; }
        public int TypeNumber { get; set; }
        public string TypeKey { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty;
        public string TypeAttr { get; set; } = string.Empty;
        public int DocumentCounter { get; set; } = 0;
        public int DocCounter { get; set; } = 0;
        
        // New tier type field
        public TierType TierType { get; set; } = TierType.None;
        
        [JsonIgnore]
        public ICollection<Document> Documents { get; set; } = new List<Document>();
        [JsonIgnore]
        public ICollection<Circuit> Circuits { get; set; } = new List<Circuit>();
    }
    public class SubType
    {
        [Key]
        public int Id { get; set; }

        public string SubTypeKey { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public int DocumentTypeId { get; set; }

        [ForeignKey("DocumentTypeId")]
        [JsonIgnore]
        public DocumentType? DocumentType { get; set; }

        public bool IsActive { get; set; } = true;

        [JsonIgnore]
        public ICollection<Document> Documents { get; set; } = new List<Document>();
    }
    public class TypeCounter
    {
        public int Id { get; set; }
        public int Counter { get; set; }
        public int circuitCounter { get; set; }
    }
    public class DocumentCircuitHistory
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int DocumentId { get; set; }
        [ForeignKey("DocumentId")]
        [JsonIgnore]
        public Document? Document { get; set; }
        public int? StepId { get; set; }
        [ForeignKey("StepId")]
        [JsonIgnore]
        public Step? Step { get; set; }
        public int? ActionId { get; set; }
        [ForeignKey("ActionId")]
        [JsonIgnore]
        public Action? Action { get; set; }
        public int? StatusId { get; set; }
        [ForeignKey("StatusId")]
        [JsonIgnore]
        public Status? Status { get; set; }
        [Required]
        public int ProcessedByUserId { get; set; }
        [ForeignKey("ProcessedByUserId")]
        [JsonIgnore]
        public User? ProcessedBy { get; set; }
        public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
        public string Comments { get; set; } = string.Empty;
        public bool IsApproved { get; set; } = true;
    }
    
    public class DocumentStepHistory
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int DocumentId { get; set; }
        [ForeignKey("DocumentId")]
        [JsonIgnore]
        public Document? Document { get; set; }
        [Required]
        public int StepId { get; set; }
        [ForeignKey("StepId")]
        [JsonIgnore]
        public Step? Step { get; set; }
        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        [JsonIgnore]
        public User? User { get; set; }
        public DateTime TransitionDate { get; set; } = DateTime.UtcNow;
        public string Comments { get; set; } = string.Empty;
    }
}