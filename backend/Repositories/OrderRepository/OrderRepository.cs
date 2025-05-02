using backend.Models.OrderModels;

namespace backend.Repositories.OrderRepository
{
    public class OrderRepository : IOrderRepository
    {
        public Task<bool> AddOrder(OrderUIModel order)
        {
            throw new NotImplementedException();
        }

        public Task<bool> DeleteOrder(int orderId)
        {
            throw new NotImplementedException();
        }

        public Task<List<OrderDBModel>> GetAllOrders()
        {
            throw new NotImplementedException();
        }

        public Task<OrderDBModel?> GetOrderById(int orderId)
        {
            throw new NotImplementedException();
        }

        public Task<List<OrderDBModel>> GetOrdersByUserEmail(string email)
        {
            throw new NotImplementedException();
        }

        public Task<bool> UpdateOrder(int orderId, OrderUIModel updatedOrder)
        {
            throw new NotImplementedException();
        }
    }
}
