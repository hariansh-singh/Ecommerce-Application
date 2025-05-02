using backend.Models.CartModels;
using backend.Models.CustomerModels;
using backend.Models.OrderItemModels;
using backend.Models.OrderModels;
using backend.Models.ProductModels;
using Microsoft.EntityFrameworkCore;

namespace backend.DataAccessLayer
{
    public class EcomDBContext : DbContext
    {
        public EcomDBContext(DbContextOptions<EcomDBContext> options) : base(options) { }

        public DbSet<CustomerDBModel> Customers { get; set; }
        public DbSet<ProductDBModel> Products { get; set; }
        public DbSet<CartDBModel> Carts { get; set; }
        public DbSet<OrderDBModel> Orders { get; set; }
        public DbSet<OrderItemDBModel> OrderItems { get; set; }

    }
}

