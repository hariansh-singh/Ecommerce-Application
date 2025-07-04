﻿using backend.Models.OrderModels;
using backend.Repositories.OrderRepository;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {

        private readonly IOrderRepository _orderRepository;

        public OrderController(IOrderRepository orderRepository)
        {
            _orderRepository = orderRepository;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _orderRepository.GetAllOrders();
            return Ok(new
            {
                err = 0,
                msg = "Orders retrieved successfully",
                data = orders
            });
        }


        [HttpGet("byUser/{customerId}")]
        public async Task<IActionResult> GetOrdersById(int customerId)
        {
            var orders = await _orderRepository.GetOrdersById(customerId);
            if (orders == null)
            {
                return NotFound(new
                {
                    err = 1,
                    msg = "No orders found for the user"
                });
            }
            return Ok(new
            {
                err = 0,
                msg = "Orders retrieved successfully",
                data = orders
            });
        }


        [HttpPost]
        public async Task<IActionResult> AddOrder([FromBody] OrderUIModel order)
        {

            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    err = 1,
                    msg = "Invalid input data",
                    details = ModelState
                });
            }

            var result = await _orderRepository.AddOrder(order);
            if (!result)
            {
                return BadRequest(new
                {
                    err = 1,
                    msg = "Failed to place order. Insufficient stock or product not found."
                });
            }
            return Ok(new
            {
                err = 0,
                msg = "Order placed successfully"
            });
        }


        [HttpPut("{orderId}")]
        public async Task<IActionResult> UpdateOrder(int orderId, [FromBody] OrderUIModel updatedOrder)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new
                {
                    err = 1,
                    msg = "Invalid input data",
                    details = ModelState
                });
            }

            var result = await _orderRepository.UpdateOrder(orderId, updatedOrder);
            if (!result)
            {
                return NotFound(new
                {
                    err = 1,
                    msg = "Order not found"
                });
            }
            return Ok(new
            {
                err = 0,
                msg = "Order updated successfully"
            });
        }


        [HttpDelete("{orderId}")]
        public async Task<IActionResult> DeleteOrder(int orderId)
        {
            var result = await _orderRepository.DeleteOrder(orderId);
            if (!result)
            {
                return NotFound(new
                {
                    err = 1,
                    msg = "Order not found"
                });
            }
            return Ok(new
            {
                err = 0,
                msg = "Order deleted successfully"
            });
        }

        [HttpPatch("cancel/{orderId}")]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            bool success = await _orderRepository.CancelOrderAsync(orderId);

            if (!success)
            {
                return BadRequest(new
                {
                    message = "Failed to cancel the order. It may not exist or is already delivered."
                });
            }

            return Ok(new
            {
                message = "Order has been cancelled successfully."
            });
        }

        [HttpPatch("updateStatus/{orderId}")]
        public async Task<IActionResult> UpdateDeliveryStatus(int orderId, [FromBody] string newStatus)
        {
            if (string.IsNullOrWhiteSpace(newStatus))
            {
                return BadRequest(new
                {
                    err = 1,
                    msg = "Invalid delivery status provided"
                });
            }

            var result = await _orderRepository.UpdateOrderStatusAsync(orderId, newStatus);

            if (!result)
            {
                return NotFound(new
                {
                    err = 1,
                    msg = "Order not found or update failed"
                });
            }

            return Ok(new
            {
                err = 0,
                msg = $"Order status updated to '{newStatus}'"
            });
        }

    }

}
