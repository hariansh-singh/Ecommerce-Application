import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

<<<<<<< HEAD
  private API_URL = 'https://localhost:7116/api/Auth/'; 
=======
  private API_URL = "https://localhost:7116"

>>>>>>> abbd3cb14004d446cd9030c2ddbd1c4a357937cb
  constructor(private http:HttpClient) { }

    getToken() {  
      return localStorage.getItem("token")
    }

    decodedTokenData() {
      var token = localStorage.getItem("token")
      if(token) {
        return jwtDecode(token)
      }
      return 
    }

    signUp(data:any) {
<<<<<<< HEAD
      return this.http.post(`${this.API_URL}register`, data)
    }

    signIn(data:any) {
      return this.http.post(`${this.API_URL}login`, data)
=======
      return this.http.post(`${this.API_URL}/api/Auth/register`, data)
    }

    signIn(data:any) {
      return this.http.post(`${this.API_URL}/api/Auth/login`, data)
>>>>>>> abbd3cb14004d446cd9030c2ddbd1c4a357937cb
    }

}