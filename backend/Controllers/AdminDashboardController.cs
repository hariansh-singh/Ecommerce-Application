using backend.Repositories.AdminDashboardRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/admin")]
    [ApiController]
    public class AdminDashboardController : ControllerBase
    {
        private readonly IAdminDashboardRepo _adminDashRepo;

        public AdminDashboardController(IAdminDashboardRepo dashboardRepository)
        {
            _adminDashRepo = dashboardRepository;
        }

        [HttpGet("total-users")]
        public async Task<IActionResult> GetTotalUsers()
        {
            var data = await _adminDashRepo.GetTotalUsersAsync();
            return Ok(new { err = 0, data = data });
        }

        [HttpGet("sellers-count")]
        public async Task<IActionResult> GetSellersCount()
        {
            var data = await _adminDashRepo.GetSellersCountAsync();
            return Ok(new { err = 0, data = data });
        }

        [HttpGet("new-orders")]
        public async Task<IActionResult> GetNewOrders()
        {
            var data = await _adminDashRepo.GetNewOrdersAsync();
            return Ok(new { err = 0, data = data });
        }

        [HttpGet("sales")]
        public async Task<IActionResult> GetSalesRevenue([FromQuery] string period)
        {
            var data = await _adminDashRepo.GetSalesRevenueAsync(period);
            return Ok(new { err = 0, data = data });
        }

        [HttpGet("top-products")]
        public async Task<IActionResult> GetTopSellingProducts()
        {
            var data = await _adminDashRepo.GetTopSellingProductsAsync();
            return Ok(new { err = 0, data = data });
        }
    }
}