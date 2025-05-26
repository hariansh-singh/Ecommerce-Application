using AutoMapper;
using backend.DataAccessLayer;
using backend.Models.CartModels;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.CartRepository
{
    public class CartRepository : ICartRepository
    {
        private readonly EcomDBContext dbcontext;
        private readonly IMapper mapper;

        public CartRepository(EcomDBContext dbcontext, IMapper mapper)
        {
            this.dbcontext = dbcontext;
            this.mapper = mapper;
        }

        public async Task<bool> AddCartAsync(CartUIModel cart)
        {
            if (cart == null || cart.CustomerId <= 0 || cart.ProductId <= 0)
            {
                return false; // prevent invalid input
            }

            //check for existing cart item
            var existingCartItem = await dbcontext.Carts
                .FirstOrDefaultAsync(c => c.CustomerId == cart.CustomerId && c.ProductId == cart.ProductId);

            if (existingCartItem != null)
            {
                //If exists update quantity
                existingCartItem.Quantity += cart.Quantity;
                dbcontext.Carts.Update(existingCartItem);

            }
            else
            {
                // If it doesn't exist, create a new cart item
                var cartDB = mapper.Map<CartDBModel>(cart);
                await dbcontext.Carts.AddAsync(cartDB);
            }
            await dbcontext.SaveChangesAsync();
            return true;
           }

        public async Task<bool> ClearCartAsync(int userId)
        {
            if (userId <= 0)
            {
                return false; // Invalid user ID
            }

            var cartItems = await dbcontext.Carts
                .Where(c => c.CustomerId == userId)
                .ToListAsync();

            if (cartItems == null || !cartItems.Any())
            {
                return true; // No items to clear, consider it successful
            }

            dbcontext.Carts.RemoveRange(cartItems);
            await dbcontext.SaveChangesAsync();
            return true;
        }

        // delete cart items
        public async Task<bool> DeleteCartAsync(int cartId)
        {
            if (cartId <=0)
            {
                return false; //invalid ID
            }
            var cart = await dbcontext.Carts.FindAsync(cartId).ConfigureAwait(false);
            if (cart == null)
            {
                return false; // Cart item not found
            }

            dbcontext.Carts.Remove(cart);
            await dbcontext.SaveChangesAsync().ConfigureAwait(false);
            return true;
        }

        //get cart by user id
        public async Task<List<CartDBModel>?> GetCartByUserIdAsync(int customerId)
        {
            if (customerId <=0)
            {
                return null; //invalid customer id
            }
            return await dbcontext.Carts
                .Include(c => c.Products)
                .Where(c => c.CustomerId == customerId)
                .ToListAsync()
                .ConfigureAwait(false);
        }

        //update cart
        public async Task<bool> UpdateCartAsync(int cartId, CartUIModel cart)
        {
            if (cartId <= 0 || cart == null)
            {
                return false;//invalid input
            }

            var existingCart = await dbcontext.Carts.FindAsync(cartId).ConfigureAwait(false);
            if (existingCart == null)
            {
                return false; // Cart item not found
            }


            mapper.Map(cart, existingCart);
            dbcontext.Update(existingCart);
            await dbcontext.SaveChangesAsync().ConfigureAwait(false);
            return true;
        }
    }
}