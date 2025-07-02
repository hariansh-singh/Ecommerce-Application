using backend.DataAccessLayer;
using backend.Models.OrderItemModels;
using backend.Models.ProductSalesDTO;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.SellerDashboardRepository
{
    public class SellerDashboardRepo : ISellerDashboardRepo
    {
        private readonly EcomDBContext dbcontext;
        public SellerDashboardRepo(EcomDBContext dbcontext)
        {
            this.dbcontext = dbcontext;
        }

        public async Task<ProductSalesResponseDTO> GetSellerProductsSalesInfo(int sellerId)
        {
            // Get all order items for products belonging to the seller
            var sellerOrderItems = await dbcontext.OrderItems
                .Include(oi => oi.Products!)
                .Include(oi => oi.Orders!)
                    .ThenInclude(o => o.Customers!)
                .Where(oi => oi.Products != null && oi.Products.SellerId == sellerId)
                .Select(oi => new
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Products!.ProductName,
                    ProductCategory = oi.Products.ProductCategory,
                    ProductPrice = oi.Products.ProductPrice,
                    OrderId = oi.OrderId,
                    CustomerId = oi.Orders!.CustomerId,
                    CustomerName = (oi.Orders.Customers!.Name),
                    OrderDate = oi.Orders.OrderDate,
                    OrderStatus = oi.Orders.OrderStatus ?? "Unknown",
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalAmount = oi.Quantity * oi.UnitPrice
                })
                .ToListAsync();

            // Group by product and create the response
            var productSales = sellerOrderItems
                .GroupBy(x => new { x.ProductId, x.ProductName, x.ProductCategory, x.ProductPrice })
                .Select(group => new ProductSalesInfo
                {
                    ProductId = group.Key.ProductId,
                    ProductName = group.Key.ProductName ?? "Unknown Product",
                    ProductCategory = group.Key.ProductCategory ?? "Unknown Category",
                    ProductPrice = group.Key.ProductPrice,
                    TotalQuantitySold = group.Sum(x => x.Quantity),
                    TotalRevenue = group.Sum(x => x.TotalAmount),
                    OrderDetails = group.Select(x => new OrderDetailInfo
                    {
                        OrderId = x.OrderId,
                        CustomerId = x.CustomerId,
                        CustomerName = x.CustomerName?.Trim(),
                        OrderDate = x.OrderDate,
                        OrderStatus = x.OrderStatus,
                        QuantityOrdered = x.Quantity,
                        UnitPrice = x.UnitPrice,
                        TotalAmount = x.TotalAmount
                    }).ToList()
                })
                .ToList();

            return new ProductSalesResponseDTO
            {
                ProductSales = productSales,
                TotalRevenue = productSales.Sum(p => p.TotalRevenue),
                TotalOrdersCount = sellerOrderItems.Select(x => x.OrderId).Distinct().Count(),
                TotalProductsSold = productSales.Sum(p => p.TotalQuantitySold)
            };
        }
    }
}