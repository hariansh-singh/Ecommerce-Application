﻿using AutoMapper;
using backend.DataAccessLayer;
using backend.Models.CustomerModels;
using backend.Services.EmailService;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.CustomerRepository
{
    public class CustomerRepository : ICustomerRepository
    {

        private readonly EcomDBContext dBContext;
        private readonly IMapper mapper;
        private readonly IEmailService emailService;

        public CustomerRepository(EcomDBContext dBContext, IMapper mapper, IEmailService emailService)
        {
            this.dBContext = dBContext;
            this.mapper = mapper;
            this.emailService = emailService;
        }

        public async Task<int?> AddUser(CustomerUIModel user)
        {
            var existingUser = await dBContext.Customers.FirstOrDefaultAsync(u => u.Email == user.Email);
            if (existingUser == null)
            {
                var addUser = mapper.Map<CustomerDBModel>(user);

                // ✅ Only hash the password if it's not null or empty
                if (!string.IsNullOrEmpty(user.Password))
                {
                    addUser.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
                }
                else
                {
                    addUser.Password = null; // or some placeholder like Guid.NewGuid().ToString()
                }
                //else
                //{
                //    // TEMP: Use a unique placeholder password for users created via social login
                //    var dummyPassword = Guid.NewGuid().ToString("N"); // No dashes
                //    addUser.Password = BCrypt.Net.BCrypt.HashPassword(dummyPassword);
                //}


                // ✅ Assign role properly
                addUser.Role = user.Role == "seller" ? "seller" : "user";

                await dBContext.Customers.AddAsync(addUser);
                await dBContext.SaveChangesAsync();

                return addUser.CustomerId;
            }
            return 0;
        }


        public async Task<bool> ChangeUserRole(int customerId, string updatedRole)
        {
            var userData = await dBContext.Customers.FirstOrDefaultAsync(x => x.CustomerId == customerId);
            if(userData != null)
            {
                userData.Role = updatedRole;
                await dBContext.SaveChangesAsync();
                return true;
            }
            return false;
        }

       

        public async Task<bool> DeleteUser(int customerId)
        {
            var user = await dBContext.Customers.FirstOrDefaultAsync(u => u.CustomerId == customerId);
            if (user != null)
            {
                dBContext.Customers.Remove(user);
                await dBContext.SaveChangesAsync();
                return true;
            }
            return false; // User not found
        }

        public async Task<List<CustomerDBModel>> GetAllUsers()
        {
            return await dBContext.Customers.ToListAsync(); // Retrieve all users
        }

        public async Task<CustomerDBModel?> GetUserById(int customerId)
        {
            return await dBContext.Customers.FirstOrDefaultAsync(u => u.CustomerId == customerId);
        }

        public async Task<CustomerDBModel?> FindByEmailAsync(string email)
        {
            return await dBContext.Customers
                .FirstOrDefaultAsync(c => c.Email == email);
        }

        public async Task<CustomerDBModel?> Login(LoginModel user)
        {
            var userLogin = await dBContext.Customers.FirstOrDefaultAsync(u => u.Email == user.Email);

            if (userLogin != null)
            {
                // Verify the input password with the stored hashed password
                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(user.Password, userLogin.Password);

                if (isPasswordValid)
                {
                    return userLogin; // Return the user details if the password is correct
                }
            }

            return null; // Return null if authentication fails
        }

        public async Task<bool> UpdateUser(int customerId, CustomerUIModel updatedUser)
        {
            var user = await dBContext.Customers.FirstOrDefaultAsync(u => u.CustomerId == customerId);
            if (user != null)
            {
                user.Name = updatedUser.Name;
                user.PhoneNumber = updatedUser.PhoneNumber;
                user.UpdatedAt = DateTime.UtcNow;

                // Update password only if provided
                if (!string.IsNullOrEmpty(updatedUser.Password))
                {
                    user.Password = BCrypt.Net.BCrypt.HashPassword(updatedUser.Password);
                }

                dBContext.Customers.Update(user);
                await dBContext.SaveChangesAsync();

                return true;
            }

            return false;
        }

        public async Task<string> ChangeUserStatus(int customerId)
        {
            var userData = await dBContext.Customers.FirstOrDefaultAsync(x => x.CustomerId == customerId);
            if (userData != null)
            {
                bool isActivating = userData.UserStatus == 0;

                userData.UserStatus = isActivating ? 1 : 0;
                await dBContext.SaveChangesAsync();

                // ✉️ Send status update email
                var statusLabel = isActivating ? "Activated" : "Deactivated";
                string subject = $"Your account has been {statusLabel}";
                string message = $@"
            Hello {userData.Name},<br/><br/>
            Your account has been <strong>{statusLabel.ToLower()}</strong> by the admin.<br/>
            If you believe this was done in error, please reach out to support.<br/><br/>
            — Sha.in Team
        ";

                await emailService.SendEmailAsync(userData.Email!, subject, message);

                return $"User {statusLabel}";
            }

            return string.Empty;
        }
    }
}
