using System.ComponentModel.DataAnnotations;

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
        }
    }


