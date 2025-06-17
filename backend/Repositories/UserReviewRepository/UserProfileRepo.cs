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
            return await dBContext.UserReviews.Where(r => r.CustomerId == customerId).ToListAsync();
        }
        public async Task<List<UserReviewDBModel>?> GetReviewsByProductAsync(int customerId)
        {
            return await dBContext.UserReviews.Where(r => r.CustomerId == customerId).ToListAsync();
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
