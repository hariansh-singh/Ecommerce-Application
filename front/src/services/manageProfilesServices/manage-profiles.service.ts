import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: number;
  createdDate: string;
  lastLoginDate?: string;
  CustomerId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ManageProfilesService {
  private baseUrl = 'https://localhost:7116/api';

  constructor(private http: HttpClient) {}

  // Get all users
  getAllUsers(): Observable<User[]> {
    return this.http.get<any>(`${this.baseUrl}/Customer`).pipe(
      map((response) => {
        // Handle different response formats
        if (Array.isArray(response)) {
          return response;
        } else if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        } else if (
          response &&
          response.users &&
          Array.isArray(response.users)
        ) {
          return response.users;
        } else if (response && typeof response === 'object') {
          // If it's an object, try to convert it to an array
          return Object.values(response);
        } else {
          console.error('Unexpected response format:', response);
          return [];
        }
      })
    );
  }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/Customer/${userId}`).pipe(
      map((response) => {
        if (
          response &&
          typeof response === 'object' &&
          !Array.isArray(response)
        ) {
          return response;
        } else {
          throw new Error('Invalid user data received from server');
        }
      })
    );
  }

  // Change user status
  changeUserStatus(userId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/Customer/${userId}/Status`, {});
  }

  // Change user role
  changeUserRole(userId: number, newRole: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/Customer/${userId}/Role?updatedRole=${newRole}`,
      {}
    );
  }
}
