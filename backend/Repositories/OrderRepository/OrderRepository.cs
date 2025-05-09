using AutoMapper;
using backend.DataAccessLayer;
using backend.Models.OrderItemModels;
using backend.Models.OrderModels;
using Microsoft.EntityFrameworkCore;

namespace backend.Repositories.OrderRepository
{
    public class OrderRepository : IOrderRepository
    {
        private readonly EcomDBContext dbContext;
        private readonly IMapper _mapper;

        public OrderRepository(EcomDBContext dbContext, IMapper _mapper)
        {
            this.dbContext = dbContext;
            this._mapper = _mapper;
        }


        public async Task<bool> AddOrder(OrderUIModel order)
        {
            // Map UI model to database model
            var newOrder = _mapper.Map<OrderDBModel>(order);
            if (newOrder == null)
            {
                throw new InvalidOperationException("Mapping failed: newOrder is null.");
            }

            // Validate order items
            if (newOrder.OrderItems == null || !newOrder.OrderItems.Any())
            {
                throw new ArgumentException("Order must contain at least one item.");
            }

            // Validate stock for all order items before saving the order
            foreach (var orderItem in newOrder.OrderItems)
            {
                // Check if product exists and validate stock
                var product = await dbContext.Products.FirstOrDefaultAsync(p => p.ProductId == orderItem.ProductId);
                if (product == null || product.StockQuantity < orderItem.Quantity)
                {
                    throw new InvalidOperationException($"Product with ID {orderItem.ProductId} does not exist or has insufficient stock.");
                }

                // Deduct product stock
                product.StockQuantity -= orderItem.Quantity;
                dbContext.Products.Update(product);
            }

            // Save the new order to generate OrderID
            await dbContext.Orders.AddAsync(newOrder);
            await dbContext.SaveChangesAsync();

            // Save order items to the database
            foreach (var orderItem in newOrder.OrderItems)
            {
                var orderItemEntity = new OrderItemDBModel
                {
                    OrderId = newOrder.OrderId,
                    ProductId = orderItem.ProductId,
                    Quantity = orderItem.Quantity,
                    UnitPrice = orderItem.UnitPrice
                };

                var existingOrderItem = await dbContext.OrderItems
                    .FirstOrDefaultAsync(oi => oi.OrderID == newOrder.OrderID && oi.ProductId == orderItem.ProductId);

                if (existingOrderItem == null)
                {
                    // Add the new order item if it doesn't exist
                    await dbContext.OrderItems.AddAsync(orderItemEntity);
                }
                else
                {
                    // Update the existing order item if necessary
                    existingOrderItem.Quantity += orderItem.Quantity; // Example: Increment quantity
                    existingOrderItem.UnitPrice = orderItem.UnitPrice; // Update unit price
                    dbContext.OrderItems.Update(existingOrderItem);
                }
            }

            // Save updated product quantities and order items
            await dbContext.SaveChangesAsync();

            return true;
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
