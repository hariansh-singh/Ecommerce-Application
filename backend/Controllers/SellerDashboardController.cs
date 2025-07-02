using backend.Repositories.SellerDashboardRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers
{
    [Route("api")]
    [ApiController]
    public class SellerDashboardController : ControllerBase
    {
        private readonly ISellerDashboardRepo _sellerDashboardRepo;

        public SellerDashboardController(ISellerDashboardRepo sellerDashboardRepo)
        {
            _sellerDashboardRepo = sellerDashboardRepo;
        }

        [HttpGet("salesinfo/{sellerId}")]
        public async Task<IActionResult> GetSalesInfo(int sellerId)
        {   
            try
            {
                var result = await _sellerDashboardRepo.GetSellerProductsSalesInfo(sellerId);

                if (result.ProductSales.IsNullOrEmpty())
                    return NotFound("No sales data found for the given seller.");

                return Ok(new
                {
                    err = 0,
                    msg = "Users retrieved successfully",
                    data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

    }
}
