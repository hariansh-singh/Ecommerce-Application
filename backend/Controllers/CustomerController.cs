using backend.Models.CustomerModels;
using backend.Repositories.CustomerRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerRepository _customerRepository;

        public CustomerController(ICustomerRepository _customerRepository)
        {
            this._customerRepository = _customerRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _customerRepository.GetAllUsers();
            return Ok(new
            {
                err = 0,
                msg = "Users retrieved successfully",
                data = users
            });
        }

        [HttpGet("{customerId}")]
        public async Task<IActionResult> GetUserById(int customerId)
        {
            var user = await _customerRepository.GetUserById(customerId);
            if (user == null)
            {
                return NotFound(new
                {
                    err = 1,
                    msg = "User not found"
                });
            }
            return Ok(new
            {
                err = 0,
                msg = "User retrieved successfully",
                data = user
            });
        }

        [HttpPut("{customerId}")]
        public async Task<IActionResult> UpdateUser(int customerId, [FromBody] CustomerUIModel updatedUser)
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

            var isUpdated = await _customerRepository.UpdateUser(customerId, updatedUser);
            if (isUpdated)
            {
                return Ok(new
                {
                    err = 0,
                    msg = "User updated successfully"
                });
            }
            return NotFound(new
            {
                err = 1,
                msg = "User not found"
            });
        }

        [HttpDelete("{customerId}")]
        public async Task<IActionResult> DeleteUser(int customerId)
        {
            var isDeleted = await _customerRepository.DeleteUser(customerId);
            if (isDeleted)
            {
                return Ok(new
                {
                    err = 0,
                    msg = "User deleted successfully"
                });
            }
            return NotFound(new
            {
                err = 1,
                msg = "User not found"
            });
        }

        [HttpPut("{customerId}/Status")]
        public async Task<IActionResult> ChangeUserStatus(int customerId)
        {
            var isUpdated = await _customerRepository.ChangeUserStatus(customerId);
            if (isUpdated != string.Empty)
            {
                return Ok(new
                {
                    err = 0,
                    msg = isUpdated
                });
            }
            return NotFound(new
            {
                err = 1,
                msg = "User not found"
            });
        }

        [HttpPut("{customerId}/Role")]
        public async Task<IActionResult> ChangerUserRole(int customerId, string updatedRole)
        {
            var isUpdated = await _customerRepository.ChangeUserRole(customerId, updatedRole);

            if (isUpdated)
            {
                return Ok(new
                {
                    err = 0,
                    msg = "User role updated successfully"
                });
            }
            return NotFound(new
            {
                err = 1,
                msg = "User not found"
            });
        }
    }
}
