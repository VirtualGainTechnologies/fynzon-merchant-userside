import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { environment } from '../../../environment/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);

  // Add credentials only for API calls
  if (req.url.startsWith(environment.apiUrl) && !req.url.includes('/logout')) {
    req = req.clone({ withCredentials: true });
  }

  return next(req).pipe(
    catchError((err: any) => {
      console.log('Interceptor error:', err);

      if (err instanceof HttpErrorResponse && err.status === 401) {
        // Handle expired session or unauthorized response
        return authService.logout().pipe(
          switchMap((res: any) => {
            snackBar.open(res?.message || 'Session expired. Logged out.', 'close', {
              duration: 5000,
              panelClass: ['error-snackbar', 'snackbar-with-progress'],
              verticalPosition: 'top',
              horizontalPosition: 'end',
            });
            router.navigate(['/']);
            return throwError(() => err); // Error still propagates
          }),
          catchError((logoutError: HttpErrorResponse) => {
            snackBar.open(logoutError.error.message || 'Logout failed!', 'close', {
              duration: 5000,
              panelClass: ['error-snackbar', 'snackbar-with-progress'],
              verticalPosition: 'top',
              horizontalPosition: 'end',
            });
            router.navigate(['/']);
            return throwError(() => err); // Forward original error to caller
          })
        );
      }

      // Re-throw the error to propagate it further
      return throwError(() => err);
    })
  );
};
