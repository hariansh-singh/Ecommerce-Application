using System.ComponentModel.DataAnnotations;

namespace backend.Models.CustomerModels
{
    public class CustomerUIModel
    {
        [Required]
        public string? Name { get; set; }


        [Required]
        [EmailAddress]
        public string? Email { get; set; }


        [Required]
        public string? Password { get; set; }
    }
}
