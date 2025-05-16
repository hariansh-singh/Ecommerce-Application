namespace backend.Repositories.AdminDashboardRepository
{
    public interface IAdminDashboardRepo
    {
        Task<int> GetTotalUsersAsync();
        Task<int> GetSellersCountAsync();
        Task<int> GetNewOrdersAsync();
        Task<decimal> GetSalesRevenueAsync(string period);
        Task<List<object>> GetTopSellingProductsAsync();
    }
}
