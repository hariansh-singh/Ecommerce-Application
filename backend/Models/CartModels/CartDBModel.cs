using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using backend.Models.CustomerModels;
using backend.Models.ProductModels;
using System.Text.Json.Serialization;

namespace backend.Models.CartModels
{
    public class CartDBModel
    {
        [Key]
        public int CartId { get; set; }


        [Required]
        public int CustomerId { get; set; }


        [Required]
        public int ProductId { get; set; }


        [Required]
        public int Quantity { get; set; }


        [JsonIgnore]
        [ForeignKey(nameof(CustomerId))]
        public CustomerDBModel? Customer { get; set; }


        [ForeignKey(nameof(ProductId))]
        public ProductDBModel? Products { get; set; }
    }
}

