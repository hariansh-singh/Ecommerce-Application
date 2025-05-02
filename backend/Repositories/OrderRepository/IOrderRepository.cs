using backend.Models.OrderModels;

namespace backend.Repositories.OrderRepository
{
    public interface IOrderRepository
    {
        Task<bool> AddOrder(OrderUIModel order);
        Task<OrderDBModel?> GetOrderById(int orderId);
        Task<List<OrderDBModel>> GetAllOrders();
        Task<List<OrderDBModel>> GetOrdersByUserEmail(string email);
        Task<bool> UpdateOrder(int orderId, OrderUIModel updatedOrder);
        Task<bool> DeleteOrder(int orderId);
    }
}
