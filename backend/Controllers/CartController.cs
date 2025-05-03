using backend.Models.CartModels;
using backend.Repositories.CartRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

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
            if(cartItems.IsNullOrEmpty())
            {
                return Ok(new
                {
                    err = 1,
                    msg = "No Cart found"
                });
            }
            return Ok(new
            {
                err = 0,
                msg = "Cart fetched successfully",
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
                return Conflict(new
                {
                    err = 1,
                    msg = "Cart item already exists."
                });
            }
        }
    }
}
