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

        public async Task<bool> AddUser(CustomerUIModel user)
        {
            var existingUser = await dBContext.Customers.FirstOrDefaultAsync(u => u.Email == user.Email);
            if (existingUser == null)
            {
                var addUser = mapper.Map<CustomerDBModel>(user);

                // Securely hash the password using bcrypt
                addUser.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);

                await dBContext.Customers.AddAsync(addUser);

                await dBContext.SaveChangesAsync();

                return true; // User successfully added
            }

            return false; // User already exists
        }

        public async Task<bool> DeleteUser(string email)
        {
            var user = await dBContext.Customers.FirstOrDefaultAsync(u => u.Email == email);
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

        public async Task<CustomerDBModel?> GetUserByEmail(string email)
        {
            return await dBContext.Customers.FirstOrDefaultAsync(u => u.Email == email);
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

        public async Task<bool> UpdateUser(string email, CustomerUIModel updatedUser)
        {
            var user = await dBContext.Customers.FirstOrDefaultAsync(u => u.Email == email);
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
