using System.ComponentModel.DataAnnotations;

namespace backend.Models.CustomerModels
{
    public class CustomerUIModel
    {
        [Required]
        [StringLength(100)]
        public string? Name { get; set; }


        [Required]
        [EmailAddress]
        public string? Email { get; set; }


        [Required]
        [StringLength(50)]
        public string? Password { get; set; }
    }
}
