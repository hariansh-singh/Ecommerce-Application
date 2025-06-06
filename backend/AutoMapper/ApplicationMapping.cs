using AutoMapper;
using backend.Models.CartModels;
using backend.Models.CustomerModels;
using backend.Models.OrderItemModels;
using backend.Models.OrderModels;
using backend.Models.ProductModels;
using backend.Models.UserAddressModels;
using backend.Models.UserAddressModels.backend.Models.UserAddressModels;
using backend.Models.UserProfileModel;
using backend.Models.UserReviewModel;

namespace backend.AutoMapper
{
    public class ApplicationMapping : Profile
    {
        public ApplicationMapping()
        {
            CreateMap<CustomerDBModel, CustomerUIModel>().ReverseMap();
            CreateMap<ProductDBModel, ProductUIModel>().ReverseMap();
            CreateMap<OrderDBModel, OrderUIModel>().ReverseMap();
            CreateMap<OrderItemDBModel, OrderItemUIModel>().ReverseMap();
            CreateMap<CartDBModel, CartUIModel>().ReverseMap();
            CreateMap<UserAddressDBModel, UserAddressUIModel>().ReverseMap();
            CreateMap<UserReviewDBModel, UserReviewUIModel>().ReverseMap();
        }
    }
}

