using backend.Models.CartModels;

namespace backend.Repositories.CartRepository
{
    public interface ICartRepository
    {
        Task<List<CartDBModel>?> GetCartByUserIdAsync(int userId);
        Task<bool> AddCartAsync(CartUIModel cart);
        Task<bool> UpdateCartAsync(int cartId, CartUIModel cart);
        Task<bool> DeleteCartAsync(int cartId);
    }
}
