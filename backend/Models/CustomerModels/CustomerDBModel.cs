using System.ComponentModel.DataAnnotations;

namespace backend.Models.CustomerModels
{
    public class CustomerDBModel
    {
        [Key]
        public int CustomerId { get; set; }


        [Required]
        public string? Name { get; set; }


        [Required]
        [EmailAddress]
        public string? Email { get; set; }


        [Required]
        public string? Password { get; set; }


        [Required]
        public string Role { get; set; } = "user";


        [Required]
        public int UserStatus { get; set; } = 1;
       
        [Required]
        public int PhoneNumber { get; set; }


        [Required]
        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
    }

