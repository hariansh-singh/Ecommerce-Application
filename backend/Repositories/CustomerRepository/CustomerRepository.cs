using AutoMapper;
using backend.DataAccessLayer;
using backend.Models.CustomerModels;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.CustomerRepository
{
    public class CustomerRepository : ICustomerRepository
    {

        private readonly EcomDBContext dBContext;
        private readonly IMapper mapper;

        public CustomerRepository(EcomDBContext dBContext, IMapper mapper)
        {
            this.dBContext = dBContext;
            this.mapper = mapper;
        }

        public async Task<int?> AddUser(CustomerUIModel user)
        {
            var existingUser = await dBContext.Customers.FirstOrDefaultAsync(u => u.Email == user.Email);
            if (existingUser == null)
            {
                var addUser = mapper.Map<CustomerDBModel>(user);

                addUser.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

                // **Ensure the role is properly assigned**
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

        public async Task<string> ChangeUserStatus(int customerId)
        {
            var userData = await dBContext.Customers.FirstOrDefaultAsync(x => x.CustomerId == customerId);
            if (userData != null)
            {
                if(userData.UserStatus == 1)
                {
                    userData.UserStatus = 0;
                    await dBContext.SaveChangesAsync();
                    return "User Deactivated";
                }
                else
                {
                    userData.UserStatus = 1;
                    await dBContext.SaveChangesAsync();
                    return "User Activated";
                }
            }
            return string.Empty;
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
    }
}
