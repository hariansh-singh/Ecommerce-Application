using AutoMapper;
using backend.Models.CartModels;
using backend.Models.CustomerModels;
using backend.Models.OrderItemModels;
using backend.Models.OrderModels;
using backend.Models.ProductModels;

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
        }
    }
}

