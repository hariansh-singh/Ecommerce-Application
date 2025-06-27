using backend.DataAccessLayer;
using backend.Models.PaymentModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly EcomDBContext _context;

        public PaymentController(EcomDBContext context)
        {
            this._context = context;
        }

        [HttpPost("store")]
        public async Task<IActionResult> StorePaymentDetail([FromBody] PaymentDetailModel detail)
        {
            if (string.IsNullOrWhiteSpace(detail.CardNumber))
                return BadRequest("Card number is required");

            _context.PaymentDetails.Add(detail);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Payment details stored securely" });
        }

        [HttpGet("getByCustomer/{customerId}")]
        public async Task<IActionResult> GetPaymentMethodsByCustomer(int customerId)
        {
            var paymentMethods = await _context.PaymentDetails
                .Where(p => p.CustomerId == customerId)
                .Select(p => new
                {
                    p.Id,
                    p.CustomerId,
                    p.CardholderName,
                    LastFour = p.CardNumber.Substring(p.CardNumber.Length - 4),
                    p.ExpiryDate
                })
                .ToListAsync();

            if (paymentMethods == null || !paymentMethods.Any())
            {
                return NotFound("No saved cards found for this user.");
            }

            return Ok(paymentMethods);
        }
    }
}
