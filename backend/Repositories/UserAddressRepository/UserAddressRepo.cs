using backend.DataAccessLayer;
using backend.Models.UserAddressModels;
using backend.Models.UserAddressModels.backend.Models.UserAddressModels;
using Microsoft.EntityFrameworkCore;
using backend.Repositories.UserAddressRepo;

namespace backend.Repositories.UserAddressRepo
{
    public class UserAddressRepo : IUserAddressRepo
    {
        private readonly EcomDBContext _context;

        public UserAddressRepo(EcomDBContext context)
        {
            _context = context;
        }

        public List<UserAddressDBModel> GetAddressesByCustomer(int customerId)
        {
            return _context.UserAddress
                .Where(a => a.CustomerId == customerId)
                .ToList(); // ✅ Directly return DB model
        }


        public void AddAddress(UserAddressUIModel uiModel)
        {
            var address = new UserAddressDBModel
            {
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

            _context.UserAddress.Add(address);
            _context.SaveChanges(); // ✅ Persist to DB
        }

        public void RemoveAddress(int addressId)
        {
            var address = _context.UserAddress.AsNoTracking().FirstOrDefault(a => a.AddressId == addressId);
            if (address != null)
            {
                _context.UserAddress.Remove(address);
                _context.SaveChanges();
            }
        }


        public void UpdateAddress(int addressId, UserAddressUIModel uiModel)
        {
            var address = _context.UserAddress.Find(addressId);
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

                _context.UserAddress.Update(address);
                _context.SaveChanges(); // ✅ Persist updates
            }
        }
        public UserAddressDBModel? GetDefaultAddress(int customerId)
        {
            return _context.UserAddress.FirstOrDefault(a => a.CustomerId == customerId && a.IsDefault);
        }

        public UserAddressDBModel? GetAddressById(int addressId)
        {
            return _context.UserAddress.AsNoTracking().FirstOrDefault(a => a.AddressId == addressId);
        }

    }

}
