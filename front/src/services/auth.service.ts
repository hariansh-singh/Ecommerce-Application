import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = "https://localhost:7125"

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
      return this.http.post("https://localhost:7125/api/Auth/addUser", data)
    }

    signIn(data:any) {
      return this.http.post(`${this.API_URL}/api/Auth/Login`, data)
    }

}