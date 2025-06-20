using backend.Models.CustomerModels;
using backend.Models.OrderItemModels;
using backend.Models.ProductModels;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.UserProfileModel
{
        public class UserReviewDBModel
        {
            [Key]
            public int ReviewId { get; set; }

            [Required]
            public int CustomerId { get; set; }

            [Required]
            public int ProductId { get; set; }

            [Required]
            public int Rating { get; set; }  // Example: 1-5 stars

            public string? ReviewText { get; set; }

            [Required]
            public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


            [ForeignKey(nameof(ProductId))]
            public ProductDBModel? Products { get; set; }

            [ForeignKey(nameof(CustomerId))]
            public CustomerDBModel? Customers { get; set; }
    }
    }


