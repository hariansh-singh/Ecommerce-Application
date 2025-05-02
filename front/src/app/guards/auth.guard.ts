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

    if (state.url.startsWith('/dashboard')) {
      if (userRole === 'admin') {
        return true; // Admins can access the dashboard
      } else {
        router.navigateByUrl('/'); // Redirect non-admins
        return false;
      }
    }

    if (userRole === 'user') {
      return true; // Users can access non-dashboard routes
    }

    router.navigateByUrl(userRole === 'admin' ? '/dashboard' : '/'); // Fallback redirection
    return false;
  } else {
    router.navigateByUrl('/login'); // Redirect unauthenticated users
    return false;
  }
};