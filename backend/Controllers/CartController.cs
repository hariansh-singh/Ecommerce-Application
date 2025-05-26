using backend.Models.CartModels;
using backend.Repositories.CartRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;
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
            if (cartItems == null || !cartItems.Any())
            {
                return Ok(new
                {
                    err = 1,
                    msg = "No Cart item found."
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
            // Validate required fields
            if (cart == null || cart.CustomerId <= 0 || cart.ProductId <= 0 || cart.Quantity <= 0)
            {
                return BadRequest(new
                {
                    err = 1,
                    msg = "Invalid cart data. Customer ID, Product ID, and Quantity must be greater than zero."
                });
            }

            try
            {
                var result = await _cartRepository.AddCartAsync(cart);
                if (result)
                {
                    return Ok(new
                    {
                        err = 0,
                        msg = "Cart item added successfully."
                    });
                }
                else
                {
                    return Conflict(new
                    {
                        err = 1,
                        msg = "Cart item already exists or couldn't be added."
                    });
                }
            }
            catch (Exception ex)
            {
                // Log the error (replace Console.WriteLine with a proper logging framework)
                Console.WriteLine($"Error adding cart item: {ex.Message}");
                return StatusCode(500, new
                {
                    err = 1,
                    msg = "An unexpected error occurred while adding the cart item. Please try again later."
                });
            }
        }


        //update the existing cart
       
        [HttpPut("{cartId}")]
        public async Task<IActionResult> UpdateCartAsync(int cartId, [FromBody] CartUIModel cart)
        {
            // Validate input
            if (cart == null || cartId <= 0 || cart.Quantity <= 0)
            {
                return BadRequest(new
                {
                    err = 1,
                    msg = "Invalid cart data. Quantity must be greater than zero."
                });
            }

            try
            {
                // Get the user's cart items
                var userCart = await _cartRepository.GetCartByUserIdAsync(cart.CustomerId);

                // Find the cart item with the given cartId
                var existingCartItem = userCart?.FirstOrDefault(c => c.CartId == cartId);
                if (existingCartItem == null)
                {
                    return NotFound(new
                    {
                        err = 2,
                        msg = $"Cart item with ID {cartId} not found for customer {cart.CustomerId}."
                    });
                }

                // Proceed with update
                var result = await _cartRepository.UpdateCartAsync(cartId, cart);
                if (result)
                {
                    return Ok(new
                    {
                        err = 0,
                        msg = $"Cart item with ID {cartId} updated successfully."
                    });
                }
                else
                {
                    return Conflict(new
                    {
                        err = 1,
                        msg = $"Failed to update cart item with ID {cartId}. Possible conflicting data or constraints."
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating cart (ID {cartId}): {ex.Message}");
                return StatusCode(500, new
                {
                    err = 1,
                    msg = $"An unexpected error occurred while updating cart ID {cartId}. Please try again later."
                });
            }
        }



        //delete product
        [HttpDelete("{cartId}")]
        public async Task<IActionResult> DeleteCartItem(int cartId)
        {
            if (cartId <= 0)
            {
                return BadRequest(new
                {
                    err = 1,
                    msg = "Invalid cart ID. Must be greater than zero."
                });
            }

            try
            {
                var result = await _cartRepository.DeleteCartAsync(cartId);
                if (result)
                {
                    return Ok(new
                    {
                        err = 0,
                        msg = "Cart item deleted successfully."
                    });
                }
                else
                {
                    return NotFound(new
                    {
                        err = 1,
                        msg = "Cart item not found or deletion failed."
                    });
                }
            }
            catch (Exception ex)
            {
                // Log the error properly (replace Console.WriteLine with a logging framework)
                Console.WriteLine($"Error deleting cart item: {ex.Message}");
                return StatusCode(500, new
                {
                    err = 1,
                    msg = "An unexpected error occurred. Please try again later."
                });
            }
        }

        [HttpDelete("clear/{userId}")]
        public async Task<IActionResult> ClearCart(int userId)
        {
            var result = await _cartRepository.ClearCartAsync(userId);

            if (result)
            {
                return Ok(new
                {
                    err = 0,
                    msg = "Cart cleared successfully."
                });
            }

            return BadRequest(new
            {
                err = 1,
                msg = "Failed to clear cart or invalid userId"
            });
        }

    }
}

    

