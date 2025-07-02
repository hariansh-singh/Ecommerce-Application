using backend.DataAccessLayer;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.AdminDashboardRepository
{
    public class AdminDashboardRepo : IAdminDashboardRepo
    {
        private readonly EcomDBContext _context;
        public AdminDashboardRepo(EcomDBContext context)
        {
            _context = context;
        }

        public async Task<int> GetTotalUsersAsync()
        {
            return await _context.Customers.CountAsync();
        }

        public async Task<int> GetSellersCountAsync()
        {
            return await _context.Customers.CountAsync(c => c.Role == "seller");
        }


        public async Task<int> GetNewOrdersAsync()
        {
            return await _context.Orders.CountAsync(o => o.OrderDate.Date == DateTime.Today);
        }

        public async Task<decimal> GetSalesRevenueAsync(string period)
        {
            DateTime startDate = period switch
            {
                "weekly" => DateTime.Now.AddDays(-7),
                "monthly" => DateTime.Now.AddMonths(-1),
                _ => DateTime.Now.AddYears(-1)
            };

            return await _context.Orders.Where(o => o.OrderDate >= startDate)
                                        .SumAsync(o => o.TotalPrice);
        }

        public async Task<List<object>> GetTopSellingProductsAsync()
        {
            var topProducts = await _context.OrderItems
        .Include(oi => oi.Products) // Eagerly load related product
        .GroupBy(oi => new { oi.ProductId, oi.Products.ProductName }) // Group by ID + Name
        .Select(g => new
        {
            ProductId = g.Key.ProductId,
            ProductName = g.Key.ProductName,
            TotalSold = g.Sum(x => x.Quantity)
        })
        .OrderByDescending(x => x.TotalSold)
        .Take(5)
        .ToListAsync();

            return topProducts.Cast<object>().ToList(); // Return as List<object> if needed
        }
    }
}
