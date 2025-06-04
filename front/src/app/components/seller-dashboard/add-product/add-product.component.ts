import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../../services/product.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-product',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent {
  selectedFile: File | null = null;
   // router: any;

  productForm: FormGroup = new FormGroup({
    ProductName: new FormControl('', [Validators.required]),
    ProductPrice: new FormControl('', [Validators.required]),
    Description: new FormControl('', [Validators.required]),
    StockQuantity: new FormControl('', [Validators.required])
  });
 
   imagePreview: string | undefined;
  imageName: any;


  constructor(private productService: ProductService,private router: Router) {}

  handleFileUpload(event: any) {
  if (event.target.files.length > 0) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.imagePreview = URL.createObjectURL(file);
      this.imageName = file.name; // Store image name
      console.log("Selected File:", this.selectedFile);
    }
  }
}
submitProduct() {
  if (!this.selectedFile) {
    console.error("Please select an image.");
    return;
  }

  const formData = new FormData();
  formData.append("ProductName", this.productForm.value.ProductName);
  formData.append("ProductPrice", this.productForm.value.ProductPrice);
  formData.append("Description", this.productForm.value.Description);
  formData.append("StockQuantity", this.productForm.value.StockQuantity);
  formData.append("ProductImage", this.selectedFile, this.selectedFile.name);

  this.productService.addProduct(formData).subscribe({
    next: (response) => {
      console.log("Product added successfully", response);

      // SweetAlert2 Notification
      Swal.fire({
        title: 'Product Added!',
        text: 'Do you want to go to the dashboard or add another product?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Go to Dashboard',
        cancelButtonText: 'Add More Products'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/sellerdashboard']); // Navigate to Dashboard
        } else {
          this.productForm.reset(); // Clear Form
          this.selectedFile = null;
          this.imagePreview = undefined;
          this.imageName = null;
        }
      });
    },
    error: (error) => console.error("Error adding product", error),
  });
}
}
