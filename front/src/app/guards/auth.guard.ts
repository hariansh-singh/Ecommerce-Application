import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (token) {
    const userData: any = authService.decodedTokenData();
    const userRole = userData["Role"];

    // Restrict access based on role
    if (userRole === 'user') {
      // Users can only access MainComponent
      if (state.url.startsWith('/admindashboard') || state.url.startsWith('/sellerdashboard')) {
        router.navigateByUrl('/');
        return false;
      }
    } else if (userRole === 'seller') {
      // Sellers can only access SellerDashboard and MainComponent
      if (state.url.startsWith('/admindashboard')) {
        router.navigateByUrl('/');
        return false;
      }
    } else if (userRole === 'admin') {
      // Admins can only access AdminDashboard and MainComponent
      if (state.url.startsWith('/sellerdashboard')) {
        router.navigateByUrl('/');
        return false;
      }
    } else {
      // If role is unknown, redirect to home
      router.navigateByUrl('/');
      return false;
    }

    return true; // Allow access if none of the restrictions apply
  } else {
    router.navigateByUrl('/login'); // Redirect unauthenticated users
    return false;
  }
};