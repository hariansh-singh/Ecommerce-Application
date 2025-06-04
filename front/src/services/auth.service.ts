import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private API_URL = "https://localhost:7116"

  constructor(private http: HttpClient) { }

  //properly verify expiration before returning a token
  getToken() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const expiration = localStorage.getItem("tokenExpiration") || sessionStorage.getItem("tokenExpiration");

  if (token && expiration) {
    const expirationDate = new Date(expiration);
    if (expirationDate > new Date()) {
      return token; // Valid token
    } else {
      this.logout(); // Token expired, log out user
      return null;
    }
  }
  return null;
}


decodedTokenData() {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    try {
      return jwtDecode(token); // Decode token safely
    } catch (error) {
      console.error("Error decoding token:", error);
      return null; // Return null instead of undefined
    }
  }
  return null; // Explicitly return null if no token exists
}


  signUp(data: any) {
    return this.http.post(`${this.API_URL}/api/Auth/register`, data)
  }

 signIn(data: any) {
  return this.http.post(`${this.API_URL}/api/Auth/login`, data);
}



 logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("tokenExpiration");
  sessionStorage.removeItem("token");
}
}