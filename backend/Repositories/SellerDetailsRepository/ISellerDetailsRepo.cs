using backend.Models.SellerDetails;

namespace backend.Repositories.SellerDetailsRepository
{
    public interface ISellerDetailsRepo
    {
        Task<SellerDetailsDBModel?> GetSellerDetailsByIdAsync(int sellerId);
        Task<List<SellerDetailsDBModel>?> GetAllSellerDetailsAsync();
        Task<bool> AddSellerDetailsAsync(SellerDetailsUIModel sellerDetails);
        Task<bool> UpdateSellerDetailsAsync(int sellerId, SellerDetailsUIModel sellerDetails);
        Task<bool> DeleteSellerDetailsAsync(int sellerId);
    }
}
