namespace backend.Repositories.SellerDashboardRepository
{
    public interface ISellerDashboardRepo
    {
        Task<Dictionary<int, decimal>> GetSellerProductsSalesInfo(int sellerId);
    }
}
