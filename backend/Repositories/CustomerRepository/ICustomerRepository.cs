using backend.Models.CustomerModels;

namespace backend.Repositories.CustomerRepository
{
    public interface ICustomerRepository
    {
        Task<int?> AddUser(CustomerUIModel user);

        Task<CustomerDBModel?> GetUserById(int customerId);
        Task<CustomerDBModel?> FindByEmailAsync(string email);

        Task<List<CustomerDBModel>> GetAllUsers();

        Task<bool> UpdateUser(int customerId, CustomerUIModel updatedUser);

        Task<bool> DeleteUser(int customerId);

        Task<CustomerDBModel?> Login(LoginModel user);
        
        Task<string> ChangeUserStatus(int customerId);

        Task<bool> ChangeUserRole(int customerId, string updatedRole);
    }
}
