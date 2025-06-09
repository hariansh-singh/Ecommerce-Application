using backend.Models.CustomerModels;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.SellerDetails
{
    public class SellerDetailsDBModel
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Customer")]
        public int SellerId { get; set; }

        public string? StoreName { get; set; }

        [StringLength(15, MinimumLength = 15)]
        public string? GSTNumber { get; set; }

        public string? BusinessAddress { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }


        // Navigation property
        public CustomerDBModel? Customer { get; set; }
    }
}