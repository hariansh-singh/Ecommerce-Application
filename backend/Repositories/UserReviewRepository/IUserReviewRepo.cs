using backend.Models.UserProfileModel;
using backend.Models.UserReviewModel;

namespace backend.Repositories.UserProfileRepository
{
    public interface IUserReviewRepo
    {
        List<UserReviewDBModel> GetReviewsByCustomer(int customerId);
        bool AddReview(UserReviewUIModel review);
    }
}
