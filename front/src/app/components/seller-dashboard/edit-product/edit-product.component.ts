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
  filePreviewUrl: string | null = null; // Stores preview URL
  productDetails: any;

  constructor(private aroute: ActivatedRoute, private proser: ProductService, private router: Router) {}

  myForm: FormGroup = new FormGroup({
    ProductCategory: new FormControl('', [Validators.required]),
    ProductName: new FormControl('', [Validators.required]),
    ProductPrice: new FormControl('', [Validators.required]),
    StockQuantity: new FormControl('', [Validators.required]),
    Description: new FormControl('', [Validators.required]),
  });

  uploadFile(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert("Invalid file type. Please upload a JPEG or PNG.");
        return;
      }

      this.filePathRef = file;  // Store actual file
      this.filePreviewUrl = URL.createObjectURL(file);  // Create preview URL

      console.log("Generated preview URL:", this.filePreviewUrl);
      console.log("Selected File:", this.filePathRef);
    }
  }

  ngOnInit(): void {
     window.scrollTo(0, 0); // Ensures the page opens from the top
    this.id = this.aroute.snapshot.paramMap.get('id');
    console.log("Product ID:", this.id);

    this.proser.getProductById(this.id).subscribe({
      next: (data: any) => {
        console.log("Product Data from API:", data);

        if (data && data.data) {
          this.myForm.patchValue({
            ProductCategory: data.data.productName,
            ProductName: data.data.productName,  
            ProductPrice: data.data.productPrice,
            StockQuantity: data.data.stockQuantity,
            Description: data.data.description
          });

          this.productDetails = data.data;

          if (data.data.productImagePath) {
            this.filePathRef = `https://localhost:7116/${data.data.productImagePath}`;
            console.log("Existing Image Path:", this.filePathRef);
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

  formData.append("ProductCategory", fData.ProductName);
  formData.append("ProductName", fData.ProductName);
  formData.append("ProductPrice", fData.ProductPrice);
  formData.append("StockQuantity", fData.StockQuantity);
  formData.append("Description", fData.Description);

    if (this.filePathRef instanceof File) {
      formData.append("ProductImage", this.filePathRef, this.filePathRef.name);
    } else if (this.productDetails.productImagePath) {
      formData.append("ProductImage", this.productDetails.productImagePath);
    } else {
      console.warn("No new or existing image provided.");
    }

    console.log("Submitting FormData:");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
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
