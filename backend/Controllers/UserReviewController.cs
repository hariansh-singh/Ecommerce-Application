using backend.Models.UserProfileModel;
using backend.Repositories;
using backend.Repositories.UserProfileRepository;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/user-reviews")]
    public class UserReviewController : ControllerBase
    {
        private readonly UserReviewRepo _reviewRepo = new();

        [HttpGet("customer/{customerId}")]
        public IActionResult GetReviews(int customerId)
        {
            var reviews = _reviewRepo.GetReviewsByCustomer(customerId);
            return reviews.Count > 0 ? Ok(reviews) : NotFound("No reviews found for this customer.");
        }

        [HttpPost("add")]
        public IActionResult AddReview([FromBody] UserReviewDBModel review)
        {
            _reviewRepo.AddReview(review);
            return Ok("Review added successfully!");
        }
    }
}
