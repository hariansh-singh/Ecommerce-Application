using AutoMapper;
using backend.DataAccessLayer;
using backend.Models.UserProfileModel;
using backend.Models.UserReviewModel;

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

        public List<UserReviewDBModel> GetReviewsByCustomer(int customerId)
        {
            return dBContext.UserReviews.Where(r => r.CustomerId == customerId).ToList();
        }

        public bool AddReview(UserReviewUIModel review)
        {
            var reviewDB = _mapper.Map<UserReviewDBModel>(review);
            dBContext.UserReviews.Add(reviewDB);
            dBContext.SaveChanges();
            return true;
        }
    }
}
