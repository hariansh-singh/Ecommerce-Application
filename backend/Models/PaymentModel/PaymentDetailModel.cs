namespace backend.Models.PaymentModel
{
    public class PaymentDetailModel
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string CardholderName { get; set; }
        public string CardNumber { get; set; } // Consider encrypting this
        public string ExpiryDate { get; set; }
        public DateTime SavedOn { get; set; } = DateTime.UtcNow;
    }
}
