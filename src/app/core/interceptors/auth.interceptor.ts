import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token;

  // Debug logging - remove in production
  console.log('Interceptor: Request URL:', req.url);
  console.log('Interceptor: Token exists:', !!token);
  console.log('Interceptor: Current user:', authService.currentUser);

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    console.log('Interceptor: Authorization header added');
  } else {
    console.log('Interceptor: No token found, request will be unauthorized');
  }
  return next(req);
};
