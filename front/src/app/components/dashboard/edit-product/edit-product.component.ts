import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../services/product.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-product',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css'
})
export class EditProductComponent {
  id:any;
  filePathRef:any;
 
  constructor(private aroute:ActivatedRoute,private proser:ProductService,private router:Router){}
 
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
 
  ngOnInit(): void {
    this.id=this.aroute.snapshot.paramMap.get('id');//get params
    console.log(this.id)
    this.proser.getProductById(this.id)
    .subscribe({
        next:(data:any)=>{
          this.myForm.patchValue(data);
          console.log(data)
        },
        error:(err)=>{
           console.log(err)
        }
    })
  }
  postData(){
    let fData=this.myForm.value;
    let formData=new FormData();
    formData.append("ProductCategory",fData.ProductCategory);
    formData.append("ProductName",fData.ProductName);
    formData.append("ProductPrice",fData.ProductPrice);
    formData.append("ProductQuantity",fData.ProductQuantity);
    formData.append("ProductFeatures",fData.ProductFeatures);
    formData.append("ProductImage",this.filePathRef,this.filePathRef.name)
    this.proser.editProduct(this.id,formData)
    .subscribe({
       next:(data:any)=>{
          alert("Product Updated!");
          this.router.navigateByUrl("/dashboard");
       },
       error:(err)=>{
         console.log(err)
       }
    })
  }
}
