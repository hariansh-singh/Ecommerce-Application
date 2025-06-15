using backend.Models.UserAddressModels;
using backend.Models.UserAddressModels.backend.Models.UserAddressModels;
using backend.Repositories.UserAddressRepo;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.DataAccessLayer;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/user-address")]
    public class UserAddressController : ControllerBase
    {
        private readonly IUserAddressRepo _userAddressRepo;

        public UserAddressController(IUserAddressRepo userAddressRepo)
        {
            _userAddressRepo = userAddressRepo;
        }

        // GET: api/user-address/{customerId}
        [HttpGet("{customerId}")]
        public ActionResult<List<UserAddressUIModel>> GetAddressesByCustomer(int customerId)
        {
            var addresses = _userAddressRepo.GetAddressesByCustomer(customerId);
            return addresses.Any() ? Ok(addresses) : NotFound("No addresses found for this customer.");
        }

        // POST: api/user-address/add
        [HttpPost("add")]
        public IActionResult AddAddress([FromBody] UserAddressUIModel uiModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _userAddressRepo.AddAddress(uiModel);
            return CreatedAtAction(nameof(GetAddressesByCustomer), new { customerId = uiModel.CustomerId }, uiModel);
        }

        // DELETE: api/user-address/remove/{addressId}
        [HttpDelete("remove/{addressId}")]
        public IActionResult RemoveAddress(int addressId)
        {
            var address = _userAddressRepo.GetAddressById(addressId); // ✅ Correct method to check Address ID
            if (address == null)
            {
                return NotFound($"❌ Address ID {addressId} not found.");
            }

            _userAddressRepo.RemoveAddress(addressId); // ✅ Calls correct repo method
            return NoContent();
        }




        // PUT: api/user-address/update/{addressId}
        [HttpPut("update/{addressId}")]
        public IActionResult UpdateAddress(int addressId, [FromBody] UserAddressUIModel uiModel)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _userAddressRepo.UpdateAddress(addressId, uiModel);
            return NoContent();
        }
    
    [HttpGet("default/{customerId}")]
        public IActionResult GetDefaultAddress(int customerId)
        {
            var defaultAddress = _userAddressRepo.GetDefaultAddress(customerId);

            if (defaultAddress != null)
            {
                return Ok(defaultAddress);
            }
            return NotFound("No default address found for this customer.");
        }

    }   
}
