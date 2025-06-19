using System.ComponentModel.DataAnnotations;

namespace backend.Models.UserReviewModel
{
    public class UserReviewUIModel
    {

        [Required]
        public int CustomerId { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        public int Rating { get; set; }  // Example: 1-5 stars

        public string? ReviewText { get; set; }

        public string Username { get; set; } = "Anonymous"; // Provided in API when sending reviews
    }
}
