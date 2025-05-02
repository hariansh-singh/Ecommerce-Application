using backend.Models.CustomerModels;
using backend.Models.ProductModels;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.CartModels
{
    public class CartUIModel
    {
        [Required]
        public int CustomerId { get; set; }


        [Required]
        public int ProductId { get; set; }


        [Required]
        public int Quantity { get; set; }
    }
}
