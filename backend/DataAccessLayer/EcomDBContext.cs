using backend.Models.CartModels;
using backend.Models.CustomerModels;
using backend.Models.OrderItemModels;
using backend.Models.OrderModels;
using backend.Models.PaymentModel;
using backend.Models.ProductModels;
using backend.Models.SellerDetails;
using backend.Models.UserAddressModels;
using backend.Models.UserProfileModel;
using Microsoft.EntityFrameworkCore;

namespace backend.DataAccessLayer
{
    public class EcomDBContext(DbContextOptions<EcomDBContext> options) : DbContext(options)
    {
        public DbSet<CustomerDBModel> Customers { get; set; }
        public DbSet<SellerDetailsDBModel> SellerDetails { get; set; }
        public DbSet<ProductDBModel> Products { get; set; }
        public DbSet<CartDBModel> Carts { get; set; }
        public DbSet<OrderDBModel> Orders { get; set; }
        public DbSet<OrderItemDBModel> OrderItems { get; set; }
        public DbSet<UserAddressDBModel> UserAddress { get; set; }
        public DbSet<UserReviewDBModel> UserReviews { get; set; }
        public DbSet<PaymentDetailModel> PaymentDetails { get; set; }

    }
}

