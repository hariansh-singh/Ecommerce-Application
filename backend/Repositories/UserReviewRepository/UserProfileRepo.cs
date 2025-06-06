using backend.Models.UserProfileModel;

namespace backend.Repositories.UserProfileRepository
{
    public class UserReviewRepo : IUserReviewRepo
    {
        private static List<UserReviewDBModel> Reviews = new();

        public List<UserReviewDBModel> GetReviewsByCustomer(int customerId)
        {
            return Reviews.Where(r => r.CustomerId == customerId).ToList();
        }

        public void AddReview(UserReviewDBModel review)
        {
            review.ReviewId = Reviews.Count + 1;
            Reviews.Add(review);
        }
    }
}
