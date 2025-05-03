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
            if (cart == null)
            {
                return false; // Prevent null inputs
            }

            var cartExists = await dbcontext.Carts.AnyAsync(c => c.CustomerId == cart.CustomerId && c.ProductId == cart.ProductId);
            if (cartExists)
            {
                return false; // Prevent duplicate entries
            }

            var cartDB = mapper.Map<CartDBModel>(cart);

            await dbcontext.Carts.AddAsync(cartDB);

            await dbcontext.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteCartAsync(int cartId)
        {
            var cart = await dbcontext.Carts.FindAsync(cartId);
            if (cart == null)
            {
                return false; // Cart item not found
            }

            dbcontext.Carts.Remove(cart);
            await dbcontext.SaveChangesAsync();
            return true;
        }

        public async Task<List<CartDBModel>?> GetCartByUserIdAsync(int customerId)
        {
            return await dbcontext.Carts.Include(c => c.Products).Where(c => c.CustomerId == customerId).ToListAsync();
        }

        public async Task<bool> UpdateCartAsync(int cartId, CartUIModel cart)
        {
            var existingCart = await dbcontext.Carts.FindAsync(cartId);
            if (existingCart == null)
            {
                return false; // Cart item not found
            }

            mapper.Map(cart, existingCart);
            await dbcontext.SaveChangesAsync();
            return true;
        }
    }
}