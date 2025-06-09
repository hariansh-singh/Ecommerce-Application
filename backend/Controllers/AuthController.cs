using backend.Models.CustomerModels;
using backend.Repositories.CustomerRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ICustomerRepository _customerRepository;

        public AuthController(IConfiguration _configuration, ICustomerRepository _customerRepository)
        {
            this._configuration = _configuration;
            this._customerRepository = _customerRepository;
        }


        [HttpPost]
        [Route("login")]
        public async Task<IActionResult> Login([FromBody]LoginModel user)
        {
            if (ModelState.IsValid)
            {
                var customerLogin = await _customerRepository.Login(user);
                if (customerLogin == null)
                {
                    return Ok(new
                    {
                        err = 1,
                        msg = "Invalid credentials"
                    });
                }
                var token = IssueToken(customerLogin);

                return Ok(new
                {
                    err = 0,
                    msg = "Login successful",
                    token = token
                });
            }
            return BadRequest(new
            {
                err = 1,
                msg = "Invalid request body",
                details = ModelState
            });
        }

        private string IssueToken(CustomerDBModel customer)
        {
            var jwtKey = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey))
            {
                throw new InvalidOperationException("JWT Key is missing in configuration.");
            }

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new("CustomerId", customer.CustomerId.ToString()),
                new("Email", customer.Email ?? ""),
                new("Name", customer.Name ?? ""),
                new("Role", customer.Role ?? ""),
                new("RegisteredAt", customer.RegisteredAt.ToString()),
                new(ClaimTypes.Role, customer.Role ?? "")
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpPost]
        [Route("register")]
        public async Task<IActionResult> AddUser([FromBody] CustomerUIModel customer)
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

            var result = await _customerRepository.AddUser(customer);
            if (result>0)
            {
                return Ok(new
                {
                    err = 0,
                    msg = "Registration successful",
                    userId = result
                });
            }
            return Ok(new
            {
                err = 1,
                msg = "Failed to add user"
            });
        }
    }
}
