import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../services/product.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-product',
  imports: [ReactiveFormsModule], // Kept the imports array as per request
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css']
})
export class EditProductComponent implements OnInit {
  id: any;
  selectedFile: File | null = null;
  prodService = inject(ProductService);
  router = inject(Router);
  aroute = inject(ActivatedRoute);

  myForm: FormGroup = new FormGroup({
    ProductName: new FormControl('', [Validators.required]),
    ProductPrice: new FormControl(null, [Validators.required]),
    Description: new FormControl('', [Validators.required]),
    StockQuantity: new FormControl(null, [Validators.required])
  });

  ngOnInit(): void {
    this.id = this.aroute.snapshot.paramMap.get('id'); // Fetch ID from params
    console.log("Product ID:", this.id);

    this.prodService.getProductById(this.id).subscribe({
      next: (response: any) => {
        console.log("Raw API Response:", response);
        const productData = response.product ?? response; // Adjust if API response is nested
        console.log("Processed Product Data:", productData);

        if (productData) {
          this.myForm.patchValue({
            ProductName: productData.ProductName || '',
            ProductPrice: productData.ProductPrice !== null ? productData.ProductPrice : null,
            Description: productData.Description || '',
            StockQuantity: productData.StockQuantity !== null ? productData.StockQuantity : null
          });
        }
      },
      error: (err) => {
        console.error("Error fetching product:", err);
      }
    });
  }

  uploadFile(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      console.log("Selected File:", this.selectedFile);
    }
  }

  postData() {
    const formData = new FormData();
    formData.append("ProductName", this.myForm.value.ProductName);
    formData.append("ProductPrice", this.myForm.value.ProductPrice);
    formData.append("Description", this.myForm.value.Description);
    formData.append("StockQuantity", this.myForm.value.StockQuantity);

    if (this.selectedFile) {
      formData.append("ProductImage", this.selectedFile, this.selectedFile.name);
    }

    this.prodService.editProduct(this.id, formData).subscribe({
      next: () => {
        alert("Product Updated!");
        this.router.navigateByUrl("/dashboard");
      },
      error: (err) => {
        console.error("Error updating product:", err);
      }
    });
  }
}