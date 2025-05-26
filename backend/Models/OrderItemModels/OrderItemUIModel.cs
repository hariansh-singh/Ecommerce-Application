using backend.Models.OrderModels;
using backend.Models.ProductModels;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace backend.Models.OrderItemModels
{
    public class OrderItemUIModel
    {
        //[Required]
        //public int OrderId { get; set; }


        [Required]
        public int ProductId { get; set; }


        [Required]
        public int Quantity { get; set; }
    }
}
