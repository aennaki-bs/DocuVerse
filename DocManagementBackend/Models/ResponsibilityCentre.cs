using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace DocManagementBackend.Models
{
    public class ResponsibilityCentre
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        [StringLength(200)]
        public string Descr { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [JsonIgnore]
        public ICollection<User> Users { get; set; } = new List<User>();
        
        [JsonIgnore]
        public ICollection<Document> Documents { get; set; } = new List<Document>();
    }
} 