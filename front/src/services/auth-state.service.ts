import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {

  // BehaviorSubject to track login state, default value is `false` (not logged in)
  private loginStatus = new BehaviorSubject<boolean>(false);

  // Observable for components to subscribe to the login state
  loginStatus$ = this.loginStatus.asObservable();

  // Update the login state
  setLoginState(isLoggedIn: boolean): void {
    this.loginStatus.next(isLoggedIn);
  }

}
