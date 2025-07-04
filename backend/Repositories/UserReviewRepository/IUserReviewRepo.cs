﻿using backend.Models.UserProfileModel;
using backend.Models.UserReviewModel;

namespace backend.Repositories.UserProfileRepository
{
    public interface IUserReviewRepo
    {
        Task<List<UserReviewDBModel>?> GetReviewsByCustomerAsync(int customerId);
        Task<List<UserReviewDBModel>?> GetReviewsByProductAsync(int productId);
        Task<bool> AddReviewAsync(UserReviewUIModel review);
    }
}
