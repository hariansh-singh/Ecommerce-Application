import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../../services/product.service';

@Component({
  selector: 'app-add-product',
  imports: [ReactiveFormsModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent {
  selectedFile: File | null = null;

  productForm: FormGroup = new FormGroup({
    ProductName: new FormControl('', [Validators.required]),
    ProductPrice: new FormControl('', [Validators.required]),
    Description: new FormControl('', [Validators.required]),
    StockQuantity: new FormControl('', [Validators.required])
  });

  constructor(private productService: ProductService) {}

  handleFileUpload(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      console.log("Selected File:", this.selectedFile);
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
      next: (response) => console.log("Product added successfully", response),
      error: (error) => console.error("Error adding product", error),
    });
  }
}