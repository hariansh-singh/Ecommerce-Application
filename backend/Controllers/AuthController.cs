﻿using backend.Models.CustomerModels;
using backend.Repositories.CustomerRepository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;


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
        public async Task<IActionResult> Login([FromBody] LoginModel user)
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
            if (result > 0)
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
        [HttpGet("google-login")]
        public IActionResult GoogleLogin()
        {
            var properties = new AuthenticationProperties
            {
                RedirectUri = Url.Action("GoogleCallback", "Auth", null, Request.Scheme)
            };
            return Challenge(properties, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("signin-google")]
        public async Task<IActionResult> GoogleCallback()
        {
            var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            if (!result.Succeeded)
                return Unauthorized(new { err = 1, msg = "Google authentication failed." });

            var principal = result.Principal;
            var email = principal.FindFirstValue(ClaimTypes.Email);
            var name = principal.FindFirstValue(ClaimTypes.Name);

            // Optional: check if user exists in DB, or auto-register
            var existingCustomer = await _customerRepository.FindByEmailAsync(email);
            if (existingCustomer == null)
            {
                var newCustomer = new CustomerUIModel
                {
                    Email = email,
                    Name = name,
                    Role = "user"
                };

                var newId = await _customerRepository.AddUser(newCustomer);
                existingCustomer = await _customerRepository.FindByEmailAsync(email); // re-fetch with ID
            }

            var token = IssueToken(existingCustomer);

            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);


            // ✅ Redirect to Angular app with token
            return Redirect($"http://localhost:4200/register?token={token}");

        }
    }
}