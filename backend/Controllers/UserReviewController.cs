using backend.Models.UserProfileModel;
using backend.Models.UserReviewModel;
using backend.Repositories;
using backend.Repositories.UserProfileRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers
{
    [ApiController]
    [Route("api")]
    public class UserReviewController : ControllerBase
    {
        private readonly IUserReviewRepo _reviewRepo;

        public UserReviewController(IUserReviewRepo _reviewRepo)
        {
            this._reviewRepo = _reviewRepo;
        }


        [HttpGet("reviews/{customerId}")]
        public async Task<IActionResult> GetReviews(int customerId)
        {
            var reviews = await _reviewRepo.GetReviewsByCustomerAsync(customerId);
            if (reviews.IsNullOrEmpty())
            {
                return NotFound(new
                {
                    err = 1,
                    msg = "No review found",
                });
            }
            return Ok(new
            {
                err = 0,
                msg = "Reviews fetched successfully",
                data = reviews,
            });
        }


        [HttpGet("product-reviews/{productId}")]
        public async Task<IActionResult> GetProductReviews(int productId)
        {
            var reviews = await _reviewRepo.GetReviewsByProductAsync(productId);
            if (reviews.IsNullOrEmpty())
            {
                return NotFound(new
                {
                    err = 1,
                    msg = "No review found",
                });
            }
            return Ok(new
            {
                err = 0,
                msg = "Reviews fetched successfully",
                data = reviews,
            });
        }


        [HttpPost("reviews")]
        public async Task<IActionResult> AddReview([FromBody] UserReviewUIModel review)
        {
            var isAdded = await _reviewRepo.AddReviewAsync(review);
                
            if (isAdded)
            {
                return Ok(new
                {
                    err = 0,
                    msg = "Review added successfully",
                });
            }
            return BadRequest(new
            {
                err = 1,
                msg = "Review already exists for this product by the customer",
            });
        }
    }
}
