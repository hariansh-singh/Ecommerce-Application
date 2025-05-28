import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = "https://localhost:7116"

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
      return this.http.post(`${this.API_URL}/api/Auth/register`, data)
    }

    signIn(data:any) {
      return this.http.post(`${this.API_URL}/api/Auth/login`, data)
    }

    logout() {
      localStorage.removeItem("token")
    }
}