import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../services/product.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css']
})
export class EditProductComponent implements OnInit {
  id: any;
  filePathRef: any;
  productDetails: any;

  constructor(private aroute: ActivatedRoute, private proser: ProductService, private router: Router) {}

  myForm: FormGroup = new FormGroup({
    ProductName: new FormControl('', [Validators.required]),
    ProductPrice: new FormControl('', [Validators.required]),
    StockQuantity: new FormControl('', [Validators.required]),
    Description: new FormControl('', [Validators.required]),
  });

  uploadFile(event: any) {
    if (event.target.files.length > 0) {
      this.filePathRef = event.target.files[0];
      console.log("Selected File:", this.filePathRef);
    }
  }

  ngOnInit(): void {
    this.id = this.aroute.snapshot.paramMap.get('id'); // Get ID from route params
    console.log("Product ID:", this.id);

    this.proser.getProductById(this.id).subscribe({
      next: (data: any) => {
        console.log("Product Data from API:", data);

        if (data && data.data) {
          this.myForm.patchValue({
            ProductName: data.data.productName,  
            ProductPrice: data.data.productPrice,
            StockQuantity: data.data.stockQuantity,
            Description: data.data.description
          });

          this.productDetails = data.data; // Store product details

          if (data.data.productImagePath) {
            this.filePathRef = `https://localhost:7116/${data.data.productImagePath}`;
            console.log(data.data.productImagePath);
          }
        }
      },
      error: (err) => {
        console.error("Error Fetching Product:", err);
      }
    });
  }

postData() {
  const fData = this.myForm.value;
  const formData = new FormData();

  formData.append("ProductName", fData.ProductName);
  formData.append("ProductPrice", fData.ProductPrice);
  formData.append("StockQuantity", fData.StockQuantity);
  formData.append("Description", fData.Description);

  // Append image only if a new one is selected
  if (this.filePathRef instanceof File) {
    formData.append("ProductImage", this.filePathRef, this.filePathRef.name);
  }

   this.proser.editProduct(this.id, formData).subscribe({
    next: () => {
      Swal.fire({
        icon: 'success',
        title: 'Product Updated!',
        text: 'Redirecting...',
        showConfirmButton: false, // Removes "OK" button
        timer: 2000, // Auto-close alert after 2 seconds
        timerProgressBar: true // Show progress bar for timer
      });

      // Navigate after alert disappears
      setTimeout(() => {
        this.router.navigateByUrl("/sellerdashboard");
      }, 2000);
    },
    error: (err) => {
      console.error("Error Updating Product:", err);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed!',
        text: 'Something went wrong, please try again.',
        showConfirmButton: true,
        confirmButtonText: 'Retry'
      });
    }
  });
}
}