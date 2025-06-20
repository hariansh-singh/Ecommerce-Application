using AutoMapper;
using backend.DataAccessLayer;
using backend.Models.UserProfileModel;
using backend.Models.UserReviewModel;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.UserProfileRepository
{
    public class UserReviewRepo : IUserReviewRepo
    {
        private readonly IMapper _mapper;
        private readonly EcomDBContext dBContext;

        public UserReviewRepo(IMapper _mapper, EcomDBContext dBContext)
        {
            this._mapper = _mapper;
            this.dBContext = dBContext;
        }

        public async Task<List<UserReviewDBModel>?> GetReviewsByCustomerAsync(int customerId)
        {
            return await dBContext.UserReviews
                .Include(p => p.Products)
                .Where(r => r.CustomerId == customerId).ToListAsync();
        }
        public async Task<List<UserReviewUIModel>> GetReviewsByProductAsync(int productId)
        {
            return await dBContext.UserReviews
<<<<<<< HEAD
                .Where(r => r.ProductId == productId)
                .Include(r => r.Customer) // Make sure this works with your navigation
                .Select(r => new UserReviewUIModel
                {
                    CustomerId = r.CustomerId,
                    ProductId = r.ProductId,
                    Rating = r.Rating,
                    ReviewText = r.ReviewText,
                    Username = r.Customer != null ? r.Customer.Name : "Anonymous"
                })
                .ToListAsync();
=======
                .Include(c => c.Customers)
                .Where(r => r.ProductId == productId).ToListAsync();
>>>>>>> eed92de017572df73ff88c42626171ab019790f0
        }


        public async Task<bool> AddReviewAsync(UserReviewUIModel review)
        {
            var existingReview = await dBContext.UserReviews
                .FirstOrDefaultAsync(r => r.CustomerId == review.CustomerId && r.ProductId == review.ProductId);

            if (existingReview == null) {
                var reviewDB = _mapper.Map<UserReviewDBModel>(review);
                await dBContext.UserReviews.AddAsync(reviewDB);
                await dBContext.SaveChangesAsync();
                return true;
            }
            return false;
        }
    }
}
