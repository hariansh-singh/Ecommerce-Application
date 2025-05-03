using AutoMapper;
using backend.DataAccessLayer;
using backend.Models.ProductModels;
using Microsoft.CodeAnalysis;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;

namespace backend.Repositories.ProductRepository
{
    public class ProductRepository : IProductRepository
    {
        private readonly EcomDBContext dbContext;
        private readonly IMapper mapper;

        public ProductRepository(EcomDBContext dbContext, IMapper mapper)
        {
            this.dbContext = dbContext;
            this.mapper = mapper;
        }

        public async Task<bool> AddProduct(ProductUIModel product)
        {
            var productToAdd = mapper.Map<ProductDBModel>(product);
            var existingProduct = await dbContext.Products.FirstOrDefaultAsync(p => p.ProductName == product.ProductName);
            if (existingProduct == null)
            {

                if (product.ProductImage != null)
                {
                    string uniqueFileName = Guid.NewGuid().ToString() + "_" + product.ProductImage.FileName;

                    string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }

                    string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await product.ProductImage.CopyToAsync(fileStream);
                    }

                    productToAdd.ProductImagePath = "uploads/" + uniqueFileName;
                }

                await dbContext.Products.AddAsync(productToAdd);
                await dbContext.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<bool> DeleteProduct(int productId)
        {
            var delProduct = await dbContext.Products.FirstOrDefaultAsync(p => p.ProductId == productId);
            if (delProduct != null)
            {
                if (!string.IsNullOrEmpty(delProduct.ProductImagePath))
                {
                    string imagePath = Path.Combine(Directory.GetCurrentDirectory(), delProduct.ProductImagePath);
                    if (File.Exists(imagePath))
                    {
                        File.Delete(imagePath);
                    }
                }

                dbContext.Products.Remove(delProduct);
                await dbContext.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public async Task<List<ProductDBModel>> GetAllProducts()
        {
            return await dbContext.Products.ToListAsync();
        }

        public async Task<ProductDBModel?> GetProductById(int productId)
        {
            return await dbContext.Products.FirstOrDefaultAsync(p => p.ProductId == productId);
        }

        public async Task<bool> UpdateProduct(int productId, ProductUIModel product)
        {
            var existingProduct = await dbContext.Products.FirstOrDefaultAsync(p => p.ProductId == productId);
            if (existingProduct != null)
            {
                existingProduct.ProductName = product.ProductName;
                existingProduct.StockQuantity = product.StockQuantity;
                existingProduct.ProductPrice = product.ProductPrice;

                if (product.ProductImage != null)
                {
                    string uniqueFileName = Guid.NewGuid().ToString() + "_" + product.ProductImage.FileName;
                    string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }

                    string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await product.ProductImage.CopyToAsync(fileStream);
                    }

                    // Delete the old image file from the server
                    if (!string.IsNullOrEmpty(existingProduct.ProductImagePath))
                    {
                        string oldImagePath = Path.Combine(Directory.GetCurrentDirectory(), existingProduct.ProductImagePath);
                        if (File.Exists(oldImagePath))
                        {
                            File.Delete(oldImagePath);
                        }
                    }

                    existingProduct.ProductImagePath = "uploads/" + uniqueFileName;
                }


                await dbContext.SaveChangesAsync();
                return true;
            }
            return false;
        }
    }
}
