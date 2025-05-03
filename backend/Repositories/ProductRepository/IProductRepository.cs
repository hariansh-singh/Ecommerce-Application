using backend.Models.ProductModels;

namespace backend.Repositories.ProductRepository
{
    public interface IProductRepository
    {
        Task<bool> AddProduct(ProductUIModel product);
        Task<List<ProductDBModel>> GetAllProducts();
        Task<ProductDBModel?> GetProductById(int productId);
        Task<bool> UpdateProduct(int productId, ProductUIModel product);
        Task<bool> DeleteProduct(int productId);
    }
}
