namespace backend.Models.UploadInvoiceRequestDTO
{
    public class UploadInvoiceRequest
    {
        public int OrderId { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerName { get; set; }
        public IFormFile? Invoice { get; set; }
    }
}
