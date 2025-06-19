import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { OrderService } from '../../../../services/order.service';
import { AuthService } from '../../../../services/auth.service';
import { jsPDF } from 'jspdf';
import Swal from 'sweetalert2';

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  products?: any;
  rating?: number; // Rating for this specific item (1-5)
  reviewText?: string; // Review text for this specific item
  hoverRating?: number; // For hover effect on stars
  reviewSubmitted?: boolean; // Flag to track if review was submitted
}

interface Order {
  orderId: string;
  orderDate: string;
  totalPrice: number;
  orderStatus: 'Delivered' | 'Preparing' | 'Cancelled';
  paymentMethod: string;
  shippingAddress: string;
  orderItems: OrderItem[];
  showItems?: boolean;
}

interface UserReviewModel {
  customerId: number;
  productId: number;
  rating: number;
  reviewText?: string;
}

@Component({
  selector: 'app-my-order-details',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-order-details.component.html',
  styleUrls: ['./my-order-details.component.css'],
})
export class MyOrderDetailsComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  id: string = '';
  name: string = '';
  isLoading: boolean = false;
  error: string | null = null;
  isSubmittingReview: boolean = false;

  // Modal dialog properties
  showReviewModal: boolean = false;
  selectedItem: OrderItem | null = null;
  selectedOrder: Order | null = null;
  reviewForm = {
    rating: 0,
    reviewText: '',
    hoverRating: 0,
  };

  private destroy$ = new Subject<void>();
  private authService = inject(AuthService);

  userData: any = this.authService.decodedTokenData();
  userName: any = this.userData['Name'] || 'User';
  userEmail: any = this.userData['Email'] || 'User';
  customerId: number = parseInt(this.userData['CustomerId'] || '0');

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService
  ) {
    this.initializeUserData();
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    if (this.id) {
      this.fetchUserOrders(this.id);
    }
  }

  downloadInvoice(order: any): void {
    const doc = new jsPDF();

    // Logo (Corrected placement & aspect ratio)
    const img = new Image();
    img.src = 'logo.png';
    doc.addImage(img, 'PNG', 160, 10, 40, 20); // Top-right, proper aspect ratio

    // Invoice Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 255);
    doc.text('INVOICE', 10, 30);

    // Order Details Section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    let yPosition = 40; // ✅ Use a dynamic yPosition for spacing

    doc.text(`Order ID: ${order.orderId}`, 10, yPosition);
    yPosition += 10; // 🔹 Increment Y position after each line

    doc.text(`Customer ID: ${order.customerId}`, 10, yPosition);
    yPosition += 10;

    doc.text(`Customer Name: ${this.userName}`, 10, yPosition);
    yPosition += 10;

    doc.text(`Customer Email: ${this.userEmail}`, 10, yPosition);
    yPosition += 10;

    doc.text(
      `Order Date: ${new Date(order.orderDate).toLocaleDateString()}`,
      10,
      yPosition
    );
    yPosition += 10;

    doc.text(`Shipping Address: ${order.shippingAddress}`, 10, yPosition);
    yPosition += 10;

    // Add Line Separator
    doc.setDrawColor(0, 0, 0);
    doc.line(10, yPosition, 200, yPosition);
    yPosition += 10; // Space after the line

    // Order Items Table Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Order Items', 10, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text('No.', 10, yPosition);
    doc.text('Product', 30, yPosition);
    doc.text('Qty', 120, yPosition);
    doc.text('Price', 150, yPosition);
    doc.line(10, yPosition + 2, 200, yPosition + 2);
    yPosition += 10;

    // Order Items Table Rows
    doc.setFont('helvetica', 'normal');
    order.orderItems.forEach((item: any, index: any) => {
      doc.text(`${index + 1}`, 10, yPosition);
      doc.text(
        `${item.products?.productName || 'Unknown Product'}`,
        30,
        yPosition
      );
      doc.text(`${item.quantity}`, 120, yPosition);
      doc.text(`₹${item.products?.productPrice || 0}`, 150, yPosition);
      yPosition += 10; // ✅ Increment Y position for each item row
    });

    // Total Amount
    yPosition += 20;
    doc.setFont('Arial Unicode MS'); // Use a font that supports ₹
    doc.text(`Total Price: ₹ ${order.totalPrice}`, 10, yPosition);
    yPosition += 20;

    // Signature & Footer
    doc.setFontSize(12);
    doc.text('Authorized Signature:', 10, yPosition);
    doc.line(60, yPosition, 120, yPosition); // Signature Line
    yPosition += 20;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for your purchase!', 10, yPosition);

    // Generate and Download the PDF
    doc.save(`Invoice_Order_${order.orderId}.pdf`);
  }

  // Modal dialog methods
  openReviewDialog(item: OrderItem, order: Order): void {
    this.selectedItem = item;
    this.selectedOrder = order;
    this.reviewForm = {
      rating: item.rating || 0,
      reviewText: item.reviewText || '',
      hoverRating: 0,
    };
    this.showReviewModal = true;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  closeReviewDialog(): void {
    this.showReviewModal = false;
    this.selectedItem = null;
    this.selectedOrder = null;
    this.reviewForm = {
      rating: 0,
      reviewText: '',
      hoverRating: 0,
    };
    document.body.style.overflow = 'auto'; // Restore scrolling
  }

  // Modal rating methods
  setRating(rating: number): void {
    this.reviewForm.rating = rating;
  }

  setHoverRating(rating: number): void {
    this.reviewForm.hoverRating = rating;
  }

  clearHoverRating(): void {
    this.reviewForm.hoverRating = 0;
  }

  getRatingText(rating: number): string {
    const ratingTexts = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent',
    };
    return ratingTexts[rating as keyof typeof ratingTexts] || '';
  }

  submitReviewFromModal(): void {
  if (!this.selectedItem || !this.selectedOrder) {
    console.error('Error: No selected item or order.');
    return;
  }

  if (!this.reviewForm.rating || this.reviewForm.rating < 1 || this.reviewForm.rating > 5) {
    alert('Please select a rating between 1 and 5 stars.');
    console.error('Invalid rating:', this.reviewForm.rating);
    return;
  }

  if (!this.customerId || this.customerId === 0) {
    alert('Customer ID not found. Please log in again.');
    console.error('Customer ID missing.');
    return;
  }

  this.isSubmittingReview = true;

  const reviewData: UserReviewModel = {
    customerId: this.customerId,
    productId: parseInt(this.selectedItem.productId),
    rating: this.reviewForm.rating,
    reviewText: this.reviewForm.reviewText || '',
  };

  console.log('Submitting review:', reviewData);

  this.orderService.submitProductReview(reviewData)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isSubmittingReview = false;
      })
    )
    .subscribe({
      next: (response) => {
        console.log('Review submitted successfully:', response);
        this.selectedItem!.rating = this.reviewForm.rating;
        this.selectedItem!.reviewText = this.reviewForm.reviewText;
        this.selectedItem!.reviewSubmitted = true;
        this.closeReviewDialog();
        this.showSuccessMessage('Review submitted successfully!');
         Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Your review was submitted successfully.',
            timer: 2000,
            showConfirmButton: false,
          });
        
      },
      error: (response) => {
        // console.error('Error submitting review:', error);
        Swal.fire({
            icon: 'info',
            title: 'Review Already Submitted',
            text: response.msg || 'You have already reviewed this product.',
          });
      },
    });
}


  private showSuccessMessage(message: string): void {
    // You can implement a toast notification here
    // For now, using console.log
    console.log(message);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.body.style.overflow = 'auto'; // Ensure scrolling is restored
  }

  private initializeUserData(): void {
    try {
      const userData: any = this.authService.decodedTokenData();
      this.name = userData['Name'] || 'User';
      this.customerId = parseInt(userData['CustomerId'] || '0');
    } catch (error) {
      console.error('Error decoding user data:', error);
      this.name = 'User';
      this.customerId = 0;
    }
  }

  private fetchUserOrders(userId: string): void {
    this.isLoading = true;
    this.error = null;

    this.orderService
      .fetchOrdersById(userId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (response) => {
          console.log('Fetched orders:', response);
          if (response?.data && Array.isArray(response.data)) {
            // 🔹 Added showItems property for dropdown functionality
            this.orders = response.data.map((order: any) => ({
              ...order,
              showItems: false, // Default state: items hidden
              orderItems:
                order.orderItems?.map((item: any) => ({
                  ...item,
                  rating: 0,
                  reviewText: '',
                  hoverRating: 0,
                  reviewSubmitted: false,
                })) || [],
            }));
          } else {
            this.orders = [];
          }
        },
        error: (error) => {
          console.error('Error fetching orders:', error);
          this.orders = [];
        },
      });
  }

  trackByOrderId(index: number, order: Order): string {
    return order.orderId;
  }

  trackByItemId(index: number, item: OrderItem): string {
    return `${item.productId}-${index}`;
  }
}
