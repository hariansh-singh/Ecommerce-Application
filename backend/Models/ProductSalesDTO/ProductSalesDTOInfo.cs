namespace backend.Models.ProductSalesDTO
{
    public class ProductSalesResponseDTO
    {
        public List<ProductSalesInfo> ProductSales { get; set; } = new List<ProductSalesInfo>();
        public decimal TotalRevenue { get; set; }
        public int TotalOrdersCount { get; set; }
        public int TotalProductsSold { get; set; }
    }

    public class ProductSalesInfo
    {
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public string? ProductCategory { get; set; }
        public decimal ProductPrice { get; set; }
        public int TotalQuantitySold { get; set; }
        public decimal TotalRevenue { get; set; }
        public List<OrderDetailInfo> OrderDetails { get; set; } = new List<OrderDetailInfo>();
    }

    public class OrderDetailInfo
    {
        public int OrderId { get; set; }
        public int CustomerId { get; set; }
        public string? CustomerName { get; set; }
        public DateTime OrderDate { get; set; }
        public string? OrderStatus { get; set; }
        public int QuantityOrdered { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalAmount { get; set; }
    }
}