using backend.Models.CustomerModels;
using backend.Repositories.CustomerRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

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

        [HttpGet("{email}")]
        public async Task<IActionResult> GetUserByEmail(string email)
        {
            var user = await _customerRepository.GetUserByEmail(email);
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

        [HttpPut("{email}")]
        public async Task<IActionResult> UpdateUser(string email, [FromBody] CustomerUIModel updatedUser)
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

            var isUpdated = await _customerRepository.UpdateUser(email, updatedUser);
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

        [HttpDelete("{email}")]
        public async Task<IActionResult> DeleteUser(string email)
        {
            var isDeleted = await _customerRepository.DeleteUser(email);
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
    }
}
