
using backend.DataAccessLayer;
using backend.Models.OrderItemModels;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.SellerDashboardRepository
{
    public class SellerDashboardRepo : ISellerDashboardRepo
    {
        private readonly EcomDBContext _dbcontext;
        public SellerDashboardRepo(EcomDBContext _dbcontext)
        {
            this._dbcontext = _dbcontext;
        }
        public async Task<Dictionary<int, decimal>> GetSellerProductsSalesInfo(int sellerId)
        {
            return await _dbcontext.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Products)
                .Where(o => o.OrderStatus == "Completed")
                .SelectMany(o => o.OrderItems ?? new List<OrderItemDBModel>()) // Safe fallback for null OrderItems
                .Where(oi => oi.Products != null && oi.Products.SellerId == sellerId) // Filter only non-null Products
                .GroupBy(oi => oi.ProductId)
                .Select(g => new
                {
                    ProductId = g.Key,
                    TotalSales = g.Sum(x => x.Quantity * x.UnitPrice)
                })
                .ToDictionaryAsync(x => x.ProductId, x => x.TotalSales);
        }
    }
}
