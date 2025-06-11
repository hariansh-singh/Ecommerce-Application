using backend.Models.SellerDetails;
using backend.Repositories.SellerDetailsRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/seller_details")]
    [ApiController]
    public class SellerDetailsController : ControllerBase
    {
        private readonly ISellerDetailsRepo _sellerDetailsRepository;
        public SellerDetailsController(ISellerDetailsRepo _sellerDetailsRepository)
        {
            this._sellerDetailsRepository = _sellerDetailsRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSellers()
        {
            var sellers = await _sellerDetailsRepository.GetAllSellerDetailsAsync();
            return Ok(new
            {
                err = 0,
                msg = "Sellers fetched successfully",
                data = sellers,
            });
        }

        [HttpGet("{sellerId}")]
        public async Task<IActionResult> GetSellerDetails(int sellerId)
        {
            var sellerDetails = await _sellerDetailsRepository.GetSellerDetailsByIdAsync(sellerId);
            if (sellerDetails == null)
            {
                return NotFound(new
                {
                    err = 1,
                    msg = "Seller details not found",
                });
            }
            return Ok(new
            {
                err = 0,
                msg = "Seller details fetched successfully",
                data = sellerDetails,
            });
        }

        [HttpPost]
        public async Task<IActionResult> AddSellerDetails([FromBody] SellerDetailsUIModel sellerDetails)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    err = 1,
                    msg = "Invalid input",
                    details = ModelState
                });
            }
            var result = await _sellerDetailsRepository.AddSellerDetailsAsync(sellerDetails);
            if (result)
            {
                return Ok(new
                {
                    err = 0,
                    msg = "Seller details added successfully",
                });
            }
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                err = 1,
                msg = "Failed to add seller details",
            });
        }

        [HttpPut("{sellerId}")]
        public async Task<IActionResult> UpdateSellerDetails(int sellerId, [FromBody] SellerDetailsUIModel updatedSellerDetails)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    err = 1,
                    msg = "Invalid input",
                    details = ModelState
                });
            } // Ensure the ID is set for the update
            var result = await _sellerDetailsRepository.UpdateSellerDetailsAsync(sellerId, updatedSellerDetails);
            if (result)
            {
                return Ok(new
                {
                    err = 0,
                    msg = "Seller details updated successfully",
                });
            }
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                err = 1,
                msg = "Failed to update seller details",
            });
        }

        [HttpDelete("{sellerId}")]
        public async Task<IActionResult> DeleteSellerDetails(int sellerId)
        {
            var result = await _sellerDetailsRepository.DeleteSellerDetailsAsync(sellerId);
            if (result)
            {
                return Ok(new
                {
                    err = 0,
                    msg = "Seller details deleted successfully",
                });
            }
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                err = 1,
                msg = "Failed to delete seller details",
            });
        }
    }
}
