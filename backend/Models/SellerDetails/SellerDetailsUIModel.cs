using System.ComponentModel.DataAnnotations;

namespace backend.Models.SellerDetails
{
    public class SellerDetailsUIModel
    {
        [Required]
        public int SellerId { get; set; }

        [Required]
        public string? StoreName { get; set; }

        [Required]
        [StringLength(15, MinimumLength = 15)]
        public string? GSTNumber { get; set; }

        [Required]
        public string? BusinessAddress { get; set; }
    }
}
