using backend.Models.CartModels;
using backend.Repositories.CartRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartRepository _cartRepository;

        public CartController(ICartRepository _cartRepository)
        {
            this._cartRepository = _cartRepository;
        }


        [HttpGet("{customerId}")]
        public async Task<IActionResult> GetCartItems(int customerId)
        {
            var cartItems = await _cartRepository.GetCartByUserIdAsync(customerId);
            return Ok(new
            {
                err = 0,
                msg = "Cart added successfully",
                data = cartItems
            });
        }

        [HttpPost]
        public async Task<IActionResult> AddCartItem([FromBody] CartUIModel cart)
        {
            var result = await _cartRepository.AddCartAsync(cart);
            if (result)
            {
                return Ok(new
                {
                    err = 0,
                    msg = "Cart added successfully"
                });
            }
            else
            {
                return Conflict("Cart item already exists.");
            }
        }
    }
}
