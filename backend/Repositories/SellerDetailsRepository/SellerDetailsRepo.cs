using AutoMapper;
using backend.DataAccessLayer;
using backend.Models.SellerDetails;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.SellerDetailsRepository
{
    public class SellerDetailsRepo : ISellerDetailsRepo
    {

        private readonly EcomDBContext dbContext;
        private readonly IMapper mapper;
        public SellerDetailsRepo(EcomDBContext dbContext, IMapper mapper)
        {
            this.dbContext = dbContext;
            this.mapper = mapper;
        }
        public async Task<bool> AddSellerDetailsAsync(SellerDetailsUIModel sellerDetails)
        {
            var existingData = await dbContext.SellerDetails.FirstOrDefaultAsync(s => s.SellerId == sellerDetails.SellerId || s.GSTNumber == sellerDetails.GSTNumber || s.StoreName == sellerDetails.StoreName);

            if (existingData != null)
            {
                return false; 
            }

            var newSellerDetails = mapper.Map<SellerDetailsDBModel>(sellerDetails);

            var istTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            var currentIST = TimeZoneInfo.ConvertTime(DateTime.UtcNow, istTimeZone);

            newSellerDetails.CreatedAt = currentIST;
            newSellerDetails.UpdatedAt = currentIST;

            await dbContext.SellerDetails.AddAsync(newSellerDetails);
            await dbContext.SaveChangesAsync();
            return true;

        }

        public async Task<bool> DeleteSellerDetailsAsync(int sellerId)
        {
            var sellerDetails = await dbContext.SellerDetails.FirstOrDefaultAsync(s => s.SellerId == sellerId);
            if (sellerDetails == null)
            {
                return false; // Seller details not found
            }
            dbContext.SellerDetails.Remove(sellerDetails);
            await dbContext.SaveChangesAsync();
            return true; // Seller details deleted successfully
        }

        public async Task<List<SellerDetailsDBModel>?> GetAllSellerDetailsAsync()
        {
            return await dbContext.SellerDetails.ToListAsync();
        }
        

        public async  Task<SellerDetailsDBModel?> GetSellerDetailsByIdAsync(int sellerId)
        {
            return await dbContext.SellerDetails.FirstOrDefaultAsync(s => s.SellerId == sellerId);
        }

        public async Task<bool> UpdateSellerDetailsAsync(int sellerId, SellerDetailsUIModel sellerDetails)
        {
            var existingSellerDetails = await dbContext.SellerDetails.FirstOrDefaultAsync(s => s.SellerId == sellerId);

            if (existingSellerDetails == null)
            {
                return false; // Seller details not found
            }

            // Check for duplicate StoreName or GSTNumber
            var duplicateCheck = await dbContext.SellerDetails.AnyAsync(s => (s.StoreName == sellerDetails.StoreName || s.GSTNumber == sellerDetails.GSTNumber) && s.SellerId != sellerDetails.SellerId);
            if (duplicateCheck)
            {
                return false; // Duplicate StoreName or GSTNumber found
            }

            // Map the updated details
            existingSellerDetails.StoreName = sellerDetails.StoreName;
            existingSellerDetails.GSTNumber = sellerDetails.GSTNumber;
            existingSellerDetails.BusinessAddress = sellerDetails.BusinessAddress;

            var istTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            existingSellerDetails.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.UtcNow, istTimeZone);

            dbContext.SellerDetails.Update(existingSellerDetails);
            await dbContext.SaveChangesAsync();
            return true; // Seller details updated successfully
        }
    }
}
