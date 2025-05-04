using backend.Models.CustomerModels;

namespace backend.Repositories.CustomerRepository
{
    public interface ICustomerRepository
    {
        Task<bool> AddUser(CustomerUIModel user);

        Task<CustomerDBModel?> GetUserByEmail(string email);
        Task<List<CustomerDBModel>> GetAllUsers();

        Task<bool> UpdateUser(string email, CustomerUIModel updatedUser);

        Task<bool> DeleteUser(string email);

        Task<CustomerDBModel?> Login(LoginModel user);
    }
}
