using AutoMapper;
using backend.DataAccessLayer;
using backend.Models.OrderItemModels;
using backend.Models.OrderModels;
using backend.Models.ProductModels;
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


        public async Task<OrderDBModel> AddOrder(OrderUIModel order)
        {
            using var transaction = await dbContext.Database.BeginTransactionAsync();
            try
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

                // Clear the mapped order items - we'll recreate them with proper pricing
                var originalOrderItems = newOrder.OrderItems.ToList();
                newOrder.OrderItems.Clear();

                // Validate stock and create proper order items
                var orderItemsToProcess = new List<(OrderItemDBModel orderItem, ProductDBModel product)>();

                foreach (var originalItem in originalOrderItems)
                {
                    // Check if product exists and validate stock
                    var product = await dbContext.Products.FirstOrDefaultAsync(p => p.ProductId == originalItem.ProductId);
                    if (product == null)
                    {
                        throw new InvalidOperationException($"Product with ID {originalItem.ProductId} does not exist.");
                    }

                    if (product.StockQuantity < originalItem.Quantity)
                    {
                        throw new InvalidOperationException($"Product '{product.ProductName}' has insufficient stock. Available: {product.StockQuantity}, Requested: {originalItem.Quantity}");
                    }

                    // Create order item with unit price from product
                    var orderItemEntity = new OrderItemDBModel
                    {
                        ProductId = originalItem.ProductId,
                        Quantity = originalItem.Quantity,
                        UnitPrice = product.ProductPrice // Get unit price from product
                    };

                    orderItemsToProcess.Add((orderItemEntity, product));
                }

                // Add the order first to generate OrderId
                await dbContext.Orders.AddAsync(newOrder);
                await dbContext.SaveChangesAsync(); // Save to get the OrderId

                // Process all order items
                foreach (var (orderItemEntity, product) in orderItemsToProcess)
                {
                    // Set the OrderId now that we have it
                    orderItemEntity.OrderId = newOrder.OrderId;

                    // Deduct stock
                    product.StockQuantity -= orderItemEntity.Quantity;
                    dbContext.Products.Update(product);

                    // Add order item to the order's collection
                    newOrder.OrderItems.Add(orderItemEntity);
                }

                // Save all changes
                await dbContext.SaveChangesAsync();

                // Commit transaction
                await transaction.CommitAsync();
                var completeOrder = await dbContext.Orders
                    .Include(o => o.OrderItems)!                                   // used ! to prevent null value warnings
                        .ThenInclude(oi => oi.Products)
                            .FirstOrDefaultAsync(o => o.OrderId == newOrder.OrderId);

                return completeOrder ?? newOrder;
            }
            catch
            {
                // Rollback transaction on any error
                await transaction.RollbackAsync();
                throw; // Re-throw the exception
            }
        }

        

        public async Task<List<OrderDBModel>> GetAllOrders()
        {
            var data = await dbContext.Orders
                .Include(o => o.OrderItems) // Include associated OrderItems
                .ToListAsync();
            return data;
        }

        public async Task<List<OrderDBModel>> GetOrdersById(int customerId)
        {
            return await dbContext.Orders
                .Include(o => o.OrderItems!) // Include associated OrderItems
                    .ThenInclude(oi => oi.Products) // Include Product details for each OrderItem
                .Where(o => o.CustomerId == customerId)
                .ToListAsync();
        }

        public async Task<bool> UpdateOrder(int orderId, OrderUIModel updatedOrder)
        {
            var existingOrder = await dbContext.Orders
                .FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (existingOrder != null)
            {
                //existingOrder.Status = updatedOrder.Status ?? existingOrder.Status;
                existingOrder.ShippingAddress = updatedOrder.ShippingAddress ?? existingOrder.ShippingAddress;

                dbContext.Orders.Update(existingOrder);
                await dbContext.SaveChangesAsync();
                return true;
            }

            return false;
        }

        public async Task<bool> DeleteOrder(int orderId)
        {
            var order = await dbContext.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order != null)
            {
                dbContext.Orders.Remove(order);
                await dbContext.SaveChangesAsync();
                return true;
            }

            return false;
        }

        public async Task<bool> CancelOrderAsync(int orderId)
        {
            var order = await dbContext.Orders.FirstOrDefaultAsync(o => o.OrderId == orderId);

            if (order == null)
                return false;

            if (order.OrderStatus == "Delivered")
                return false;

            order.OrderStatus = "Cancelled";

           
            dbContext.Orders.Update(order);
            var result = await dbContext.SaveChangesAsync();

            return result > 0;
        }
        public async Task<bool> UpdateOrderStatusAsync(int orderId, string newStatus)
        {
            var order = await dbContext.Orders.FindAsync(orderId);
            if (order == null) return false;

            // Prevent status changes on canceled orders
            if (order.OrderStatus == "Canceled")
                return false;

            // Define allowed forward transitions
            var validTransitions = new Dictionary<string, List<string>>
    {
        { "Pending", new() { "Shipped" } },
        { "Shipped", new() { "Delivered" } },
        { "Delivered", new() },  // Terminal state
        { "Canceled", new() }    // Terminal state
    };

            if (!validTransitions.TryGetValue(order.OrderStatus, out var allowed) || !allowed.Contains(newStatus))
                return false;

            order.OrderStatus = newStatus;
            await dbContext.SaveChangesAsync();
            return true;
        }


    }
}
