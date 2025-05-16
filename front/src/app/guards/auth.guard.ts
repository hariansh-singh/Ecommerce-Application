import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = authService.getToken();

  if (token) {
    const userData: any = authService.decodedTokenData();
    const userRole = userData["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    // Redirect on login based on role
    if (state.url === '/login') {
      if (userRole === 'admin') {
        router.navigateByUrl('/admindashboard');
      } else if (userRole === 'seller') {
        router.navigateByUrl('/dashboard');
      } else {
        router.navigateByUrl('/');
      }
      return false;
    }

    // Access control rules
    if (state.url.startsWith('/admindashboard')) {
      if (userRole !== 'admin') {
        router.navigateByUrl('/');
        return false;
      }
    } else if (state.url.startsWith('/dashboard')) {
      if (userRole !== 'seller') {
        router.navigateByUrl('/');
        return false;
      }
    }

    return true; // Allow access if none of the restrictions apply
  } else {
    router.navigateByUrl('/login'); // Redirect unauthenticated users
    return false;
  }
};