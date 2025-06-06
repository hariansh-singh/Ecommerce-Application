using backend.Models.UserAddressModels.backend.Models.UserAddressModels;
using backend.Models.UserAddressModels;

namespace backend.Repositories.UserAddressRepo
{
    public interface IUserAddressRepo
    {
        List<UserAddressDBModel> GetAddressesByCustomer(int customerId);
        void AddAddress(UserAddressUIModel uiModel);
        void RemoveAddress(int addressId);
        void UpdateAddress(int addressId, UserAddressUIModel uiModel);
    }
}
