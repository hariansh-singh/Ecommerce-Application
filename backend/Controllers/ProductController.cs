using backend.Models.ProductModels;
using backend.Repositories.ProductRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly IProductRepository productRepository;

        public ProductController(IProductRepository productRepository)
        {
            this.productRepository = productRepository;
        }


        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
            var allProducts = await productRepository.GetAllProducts();
            if(allProducts.IsNullOrEmpty())
            {
                return NotFound(new
                {
                    err = 1,
                    msg = "No product found",
                });
            }
            return Ok(new
            {
                err = 0,
                msg = "Products fetched successfully",
                data = allProducts,
            });
        }

        [HttpGet("myproducts/{sellerId}")]
        [Authorize(Roles = "seller,admin")]
        public async Task<IActionResult> GetSellerProducts(int sellerId)
        {
            var allProducts = await productRepository.GetSellerProducts(sellerId);
            if (allProducts.IsNullOrEmpty())
            {
                return NotFound(new
                {
                    err = 1,
                    msg = "No product found",
                });
            }
            return Ok(new
            {
                err = 0,
                msg = "Products fetched successfully",
                data = allProducts,
            });
        }


        [HttpGet("{productId}")]
        public async Task<IActionResult> GetProductById(int productId)
        {
            var res = await productRepository.GetProductById(productId);
            if (res == null)
            {
                return NotFound(new
                {
                    err = 1,
                    msg = "Product does not exit"
                });
            }
            return Ok(new
            {
                err = 0,
                msg = "Product fetched",
                data = res
            });
        }


        [HttpPost]
        [Authorize(Roles = "seller")]
        public async Task<IActionResult> AddProduct([FromForm] ProductUIModel product)
        {
            var result = await productRepository.AddProduct(product);
            if (result)
            {
                return Ok(new
                {
                    err = 0,
                    msg = "Product added successfully",
                });
            }
            return BadRequest(new
            {
                err = 1,
                msg = "Failed to add product",
            });
        }


        [HttpPut("{productId}")]
        [Authorize(Roles = "seller")]
        public async Task<IActionResult> UpdateProduct(int productId, [FromForm] ProductUIModel product)
        {
            var result = await productRepository.UpdateProduct(productId, product);
            if (result)
            {
                return Ok(new
                {
                    err = 0,
                    msg = "Product updated successfully",
                });
            }
            return BadRequest(new { err = 1, msg = "Failed to update product" });
        }


        [HttpDelete("{productId}")]
        [Authorize(Roles = "seller,admin")]
        public async Task<IActionResult> DeleteProduct(int productId)
        {
            var result = await productRepository.DeleteProduct(productId);
            if (result)
            {
                return Ok(new { err = 0, msg = "Product deleted successfully" });
            }
            return BadRequest(new { err = 1, msg = "Failed to delete product" });
        }
    }
}
