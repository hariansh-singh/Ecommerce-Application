using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using backend.Models.OrderModels;
using backend.Models.ProductModels;
using System.Text.Json.Serialization;

namespace backend.Models.OrderItemModels
{
    public class OrderItemDBModel
    {
        [Key]
        public int OrderItemId { get; set; }


        [Required]
        public int OrderId { get; set; }


        [Required]
        public int ProductId { get; set; }


        [Required]
        public int Quantity { get; set; }


        [Required]
        public decimal UnitPrice { get; set; }



        [JsonIgnore]
        [ForeignKey(nameof(OrderId))]
        public OrderDBModel? Orders { get; set; }


        [JsonIgnore]
        [ForeignKey(nameof(ProductId))]
        public ProductDBModel? Products { get; set; }
    }
}
