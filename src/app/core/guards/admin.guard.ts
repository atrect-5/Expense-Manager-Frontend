import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Guardian de ruta que restringe vistas exclusivas para Administradores.
 * Redirige al Dashboard si un usuario normal intenta acceder.
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  notificationService.warning('Acceso denegado: esta sección requiere permisos de Administrador.');
  return router.createUrlTree(['/dashboard']);
};
