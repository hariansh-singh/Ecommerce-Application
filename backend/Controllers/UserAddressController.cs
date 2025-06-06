using backend.Models.UserAddressModels.backend.Models.UserAddressModels;
using backend.Repositories.UserAddressRepo;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/user-address")]
    public class UserAddressController : ControllerBase
    {
        private readonly IUserAddressRepo _addressRepo;

        public UserAddressController(IUserAddressRepo addressService)
        {
            _addressRepo = addressService;
        }

        [HttpGet("{customerId}")]
        public IActionResult GetAddresses(int customerId)
        {
            var addresses = _addressRepo.GetAddressesByCustomer(customerId);
            return addresses.Count > 0 ? Ok(addresses) : NotFound("No addresses found.");
        }

        [HttpPost("add")]
        public IActionResult AddAddress([FromBody] UserAddressUIModel uiModel)
        {
            _addressRepo.AddAddress(uiModel);
            return Ok("Address added successfully!");
        }

        [HttpDelete("remove/{addressId}")]
        public IActionResult RemoveAddress(int addressId)
        {
            _addressRepo.RemoveAddress(addressId);
            return Ok("Address removed successfully!");
        }

        [HttpPut("update/{addressId}")]
        public IActionResult UpdateAddress(int addressId, [FromBody] UserAddressUIModel uiModel)
        {
            _addressRepo.UpdateAddress(addressId, uiModel);
            return Ok("Address updated successfully!");
        }
    }
}
