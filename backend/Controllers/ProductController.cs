using backend.Models.ProductModels;
using backend.Repositories.ProductRepository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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
            if (allProducts != null)
            {
                return Ok(new
                {
                    err = 0,
                    msg = "Products fetched successfully",
                    data = allProducts,
                });
            }
            else
            {
                return NotFound(new
                {
                    err = 1,
                    msg = "No product found",
                });
            }
        }


        [HttpGet("{productId}")]
        public async Task<IActionResult> GetProductById(int productId)
        {
            var res = await productRepository.GetProductById(productId);
            if (res == null)
            {
                return NotFound();
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


        [HttpPut("{id}")]
        [Authorize(Roles = "seller")]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] ProductUIModel product)
        {
            var result = await productRepository.UpdateProduct(id, product);
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
        [Authorize(Roles = "seller")]
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
