using backend.Models.UserAddressModels.backend.Models.UserAddressModels;
using backend.Models.UserAddressModels;

namespace backend.Repositories.UserAddressRepo
{
    public class UserAddressRepo : IUserAddressRepo
    {
        private static List<UserAddressDBModel> Addresses = new();

        public List<UserAddressDBModel> GetAddressesByCustomer(int customerId)
        {
            return Addresses.Where(a => a.CustomerId == customerId).ToList();
        }

        public void AddAddress(UserAddressUIModel uiModel)
        {
            var address = new UserAddressDBModel
            {
                AddressId = Addresses.Count + 1,
                CustomerId = uiModel.CustomerId,
                AddressLine1 = uiModel.AddressLine1,
                AddressLine2 = uiModel.AddressLine2,
                Landmark = uiModel.Landmark,
                City = uiModel.City,
                State = uiModel.State,
                Country = uiModel.Country,
                PostalCode = uiModel.PostalCode,
                IsDefault = uiModel.IsDefault
            };

            Addresses.Add(address);
        }

        public void RemoveAddress(int addressId)
        {
            Addresses.RemoveAll(a => a.AddressId == addressId);
        }

        public void UpdateAddress(int addressId, UserAddressUIModel uiModel)
        {
            var address = Addresses.FirstOrDefault(a => a.AddressId == addressId);
            if (address != null)
            {
                address.AddressLine1 = uiModel.AddressLine1;
                address.AddressLine2 = uiModel.AddressLine2;
                address.Landmark = uiModel.Landmark;
                address.City = uiModel.City;
                address.State = uiModel.State;
                address.Country = uiModel.Country;
                address.PostalCode = uiModel.PostalCode;
                address.IsDefault = uiModel.IsDefault;
            }
        }
    }
}
    