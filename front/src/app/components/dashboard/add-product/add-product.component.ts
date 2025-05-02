import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../../services/product.service';

@Component({
  selector: 'app-add-product',
  imports: [ReactiveFormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent {

  prodService:any = inject(ProductService)
  filePathRef:any;

   myForm:FormGroup=new FormGroup({
      ProductCategory:new FormControl('',[Validators.required]),
      ProductName:new FormControl('',[Validators.required]),
      ProductPrice:new FormControl('',[Validators.required]),
      ProductQuantity:new FormControl('',[Validators.required]),
      ProductFeatures:new FormControl('',[Validators.required]),
   })
   uploadFile(event:any){
        if(event.target.files.length>0){
           let fileRef=event.target.files[0];
           console.log(fileRef)
           this.filePathRef=fileRef;
        }
   }
   postProduct(){
     let fData=this.myForm.value;
     //whwn file upload send data through formData
     let formData=new FormData();
     formData.append("ProductCategory",fData.ProductCategory);
     formData.append("ProductName",fData.ProductName);
     formData.append("ProductPrice",fData.ProductPrice);
     formData.append("ProductQuantity",fData.ProductQuantity);
     formData.append("ProductFeatures",fData.ProductFeatures);
     formData.append("ProductImage",this.filePathRef,this.filePathRef.name)

     this.prodService.addProduct(formData).subscribe({
      next: (response:any) => console.log('Product added successfully', response),
      error: (error:any) => console.error('Error adding product', error),
    });
   }
}
