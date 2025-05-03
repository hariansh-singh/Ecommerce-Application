using backend.Models.OrderItemModels;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models.OrderModels
{
    public class OrderUIModel
    {

        [Required]
        public int CustomerId { get; set; }


        [Required]
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;


        [Required]
        [Column(TypeName = "decimal(10, 2)")]
        public decimal TotalPrice { get; set; }


        [Required]
        public string? ShippingAddress { get; set; }

        [Required]
        public List<OrderItemUIModel> OrderItems { get; set; } = new List<OrderItemUIModel>();
    }
}
