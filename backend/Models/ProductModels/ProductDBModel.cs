using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.ProductModels
{
    public class ProductDBModel
    {
        [Key]
        public int ProductId { get; set; }


        [Required]
        [StringLength(100)]
        public string? ProductName { get; set; }


        [Required]
        [Column(TypeName = "decimal(10, 2)")]
        public decimal ProductPrice { get; set; }


        [StringLength(500)]
        public string? Description { get; set; }


        [Required]
        public int StockQuantity { get; set; }


        [Required]
        public string? ProductImagePath { get; set; }


        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
    }
