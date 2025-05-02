using System.ComponentModel.DataAnnotations;

namespace backend.Models.CustomerModels
{
    public class CustomerDBModel
    {
        [Key]
        public int CustomerId { get; set; }


        [Required]
        [StringLength(100)]
        public string? Name { get; set; }


        [Required]
        [EmailAddress]
        public string? Email { get; set; }


        [Required]
        [StringLength(50)]
        public string? Password { get; set; }


        [Required]
        public string Role { get; set; } = "user";


        [Required]
        public int UserStatus { get; set; } = 1;


        [Required]
        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
    }

