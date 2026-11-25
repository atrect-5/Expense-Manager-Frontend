import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Interceptor HTTP de Angular:
 * 1. Garantiza 'withCredentials: true' para enviar las cookies HttpOnly (JWT y RefreshToken).
 * 2. Inyecta el header 'X-CSRF-TOKEN' en solicitudes modificadoras (POST, PUT, DELETE, PATCH).
 * 3. Gestiona errores 401 Unauthorized redirigiendo al login si la sesión expiró.
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.csrfToken();
  const isApiRequest = req.url.startsWith(environment.apiUrl) || req.url.startsWith('/api');

  // Solo modificamos peticiones dirigidas al backend de la API
  if (!isApiRequest) {
    return next(req);
  }

  // Preparamos headers base
  let headers = req.headers;

  // Si es un método que modifica datos (POST, PUT, DELETE, PATCH) y disponemos del token XSRF, lo inyectamos
  const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (mutatingMethods.includes(req.method.toUpperCase()) && token) {
    headers = headers.set('X-CSRF-TOKEN', token);
  }

  // Clonamos la solicitud asegurando credenciales (cookies HttpOnly) y headers
  const clonedRequest = req.clone({
    headers,
    withCredentials: true
  });

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si la respuesta es 401 Unauthorized y no es el endpoint de login
      if (error.status === 401 && !req.url.includes('/Authentication/login')) {
        console.warn('Sesión no autorizada o expirada (401).');
      }
      return throwError(() => error);
    })
  );
};
