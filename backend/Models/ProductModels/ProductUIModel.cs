using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.ProductModels
{
    public class ProductUIModel
    {
        [Required]
        public string? ProductCategory { get; set; }

        [Required]
        public string? ProductName { get; set; }


        [Required]
        [Column(TypeName = "decimal(10, 2)")]
        public decimal ProductPrice { get; set; }

        [Required]
        public string? Description { get; set; }


        [Required]
        public int StockQuantity { get; set; }


        [Required]
        public int SellerId { get; set; }

        [Required]
        public IFormFile? ProductImage { get; set; }
    }
}
