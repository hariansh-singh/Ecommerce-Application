using backend.Models.CustomerModels;
using backend.Repositories.CustomerRepository;
using backend.Services.EmailService;
using backend.Services.EmailTemplates;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Net.Http;
using System.Text.Json;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ICustomerRepository _customerRepository;
        private readonly IEmailService _emailService;

        public AuthController(IConfiguration _configuration, ICustomerRepository _customerRepository, IEmailService _emailService)
        {
            this._configuration = _configuration;
            this._customerRepository = _customerRepository;
            this._emailService = _emailService;
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

                if (user.Email != null && user.Password != null)
                {
                    string displayName = customerLogin.Name!;

                    // --- Get IP Address ---
                    string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString()!;
                    if (string.IsNullOrEmpty(ipAddress) || ipAddress == "::1" || ipAddress == "127.0.0.1") // Localhost fallback
                        ipAddress = "me"; // ipapi.co uses 'me' for current IP

                    // --- Get Location from IP ---
                    string location = "Unknown Location";
                    if(ipAddress != "me")
                    {
                        using (var httpClient = new HttpClient())
                        {
                            var response = await httpClient.GetStringAsync($"https://ipapi.co/{ipAddress}/json/");
                            var doc = JsonDocument.Parse(response);

                            string city = doc.RootElement.TryGetProperty("city", out var cityProp) ? cityProp.GetString() ?? "" : "";
                            string region = doc.RootElement.TryGetProperty("region", out var regionProp) ? regionProp.GetString() ?? "" : "";
                            string country = doc.RootElement.TryGetProperty("country_name", out var countryProp) ? countryProp.GetString() ?? "" : "";

                            var parts = new List<string>();
                            if (!string.IsNullOrWhiteSpace(city)) parts.Add(city);
                            if (!string.IsNullOrWhiteSpace(region)) parts.Add(region);
                            if (!string.IsNullOrWhiteSpace(country)) parts.Add(country);

                            if (parts.Count > 0)
                                location = string.Join(", ", parts);
                        }
                    }
                    else
                    {
                        location = "Local Host";
                    }

                        // --- Parse Device from User-Agent ---
                        string userAgent = Request.Headers["User-Agent"].ToString();
                    string device = ParseUserAgentSimple(userAgent);

                    await _emailService.SendEmailAsync(
                        user.Email,
                        "Welcome back to Sha.in - Login Confirmation",
                        EmailTemplateService.GetLoginEmailTemplate(displayName ?? "Valued Customer", location, device)
                    );
                }

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

        // Simple User-Agent parser (for real use, consider UAParser NuGet)
        private string ParseUserAgentSimple(string userAgent)
        {
            if (string.IsNullOrEmpty(userAgent))
                return "Unknown Device";

            if (userAgent.Contains("Windows"))
                return "Web Browser on Windows";
            if (userAgent.Contains("Macintosh"))
                return "Web Browser on macOS";
            if (userAgent.Contains("Linux") && !userAgent.Contains("Android"))
                return "Web Browser on Linux";
            if (userAgent.Contains("Android"))
                return "Mobile Browser on Android";
            if (userAgent.Contains("iPhone"))
                return "Mobile Browser on iPhone";
            if (userAgent.Contains("iPad"))
                return "Mobile Browser on iPad";
            // Add more as needed

            return "Web Browser";
        }
    }
}