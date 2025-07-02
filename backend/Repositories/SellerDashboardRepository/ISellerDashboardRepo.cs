using backend.Models.ProductSalesDTO;

namespace backend.Repositories.SellerDashboardRepository
{
    public interface ISellerDashboardRepo
    {
        Task<ProductSalesResponseDTO> GetSellerProductsSalesInfo(int sellerId);
    }
}
