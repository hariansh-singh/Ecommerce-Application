import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private API_URL = "https://localhost:7116"

  constructor(private http:HttpClient) { }

    getAllProducts(){
      return this.http.get(`${this.API_URL}/api/Product`);
    }
    
    addProduct(data:any) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
      return this.http.post(`${this.API_URL}/api/Product`, data, { headers })
    }

    getProductById(id:number):Observable<any> {
      return this.http.get(`${this.API_URL}/api/Product/${id}`);
    }

    editProduct(id:number, data:any):Observable<any> {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
      return this.http.put(`${this.API_URL}/api/Product/${id}`, data, {headers})
    }

    deleteProduct(id:number) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('token')}`);
      return this.http.delete(`${this.API_URL}/api/Product/${id}`, { headers })
    
    }
}
