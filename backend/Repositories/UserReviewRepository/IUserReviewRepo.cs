using backend.Models.UserProfileModel;

namespace backend.Repositories.UserProfileRepository
{
    public interface IUserReviewRepo
    {
        List<UserReviewDBModel> GetReviewsByCustomer(int customerId);
        void AddReview(UserReviewDBModel review);
    }
}
