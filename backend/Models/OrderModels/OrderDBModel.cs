using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using backend.Models.CustomerModels;
using backend.Models.OrderItemModels;
using System.Text.Json.Serialization;

namespace backend.Models.OrderModels
{
    public class OrderDBModel
    {
        [Key]
        public int OrderId { get; set; }


        [Required]
        public int CustomerId { get; set; }


        [Required]
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;


        [Required]
        [Column(TypeName = "decimal(10, 2)")]
        public decimal TotalPrice { get; set; }


        [Required]
        [StringLength(200)]
        public string? ShippingAddress { get; set; }


        [Required]
        public ICollection<OrderItemDBModel>? OrderItems { get; set; }


        [JsonIgnore]
        [ForeignKey(nameof(CustomerId))]
        public CustomerDBModel? Customers { get; set; }

    }
    }

