using backend.Models.OrderModels;

namespace backend.Repositories.OrderRepository
{
    public interface IOrderRepository
    {
        Task<bool> AddOrder(OrderUIModel order);
        Task<List<OrderDBModel>> GetAllOrders();
        Task<List<OrderDBModel>> GetOrdersById(int customerId);
        Task<bool> UpdateOrder(int orderId, OrderUIModel updatedOrder);
        Task<bool> DeleteOrder(int orderId);
        Task<bool> CancelOrderAsync(int orderId);
    }
}
