namespace backend.Models.UserAddressModels
{
    using System.ComponentModel.DataAnnotations;
    using System.ComponentModel.DataAnnotations.Schema;


    namespace backend.Models.UserAddressModels
    {

        public class UserAddressUIModel
        {
          

            [Required]
            public int CustomerId { get; set; }  // Foreign key to associate address with a customer

            [Required]
            public string AddressLine1 { get; set; }

            public string? AddressLine2 { get; set; } // Optional additional address details

            public string? Landmark { get; set; } // Nearby identifiable place for delivery reference

            [Required]
            public string City { get; set; }

            [Required]
            public string State { get; set; }

            [Required]
            public string Country { get; set; }

            [Required]
            [MaxLength(10)]
            public string PostalCode { get; set; }

            public bool IsDefault { get; set; }  // Marks the primary address for the user
        }
    }



}
