import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CurrentUser, LoginDto, CreateUserDto, UserDto, UserRole, MoneyAccountDto, CategoryDto } from '../models';
import { NotificationService } from './notification.service';

/**
 * Servicio central de autenticación y autorización.
 * Maneja el token X-CSRF-TOKEN requerido para solicitudes modificadoras,
 * gestiona la sesión con cookies HttpOnly y la detección de roles (Admin / User).
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  private readonly API_URL = environment.apiUrl;
  private readonly CSRF_STORAGE_KEY = 'app_csrf_token';
  private readonly USER_STORAGE_KEY = 'app_current_user';
  private readonly VIEWING_USER_KEY = 'app_admin_viewing_user_id';

  // Token X-CSRF-TOKEN en memoria y persistido
  public readonly csrfToken = signal<string | null>(this.getStoredCsrfToken());

  // Usuario actualmente autenticado
  public readonly currentUser = signal<CurrentUser | null>(this.getStoredUser());

  // Para usuarios con rol Admin: permite filtrar/ver datos de un usuario específico
  public readonly activeViewingUserId = signal<number | null>(this.getStoredViewingUserId());

  // Computados de estado
  public readonly isAuthenticated = computed(() => !!this.currentUser());
  public readonly isAdmin = computed(() => this.currentUser()?.role === 'Admin');

  /**
   * Retorna el ID de usuario efectivo sobre el cual consultar estadísticas y transacciones.
   * Si es admin y ha seleccionado un usuario, retorna ese ID; si no, retorna el ID propio.
   */
  public readonly effectiveUserId = computed(() => {
    const adminViewing = this.activeViewingUserId();
    if (this.isAdmin() && adminViewing !== null) {
      return adminViewing;
    }
    return this.currentUser()?.id ?? 0;
  });

  /**
   * Inicia sesión en el backend.
   * El backend responde con un objeto JSON que contiene el xsrfToken y setea las cookies HttpOnly (JWT y RefreshToken).
   */
  public login(credentials: LoginDto): Observable<string> {
    return this.http.post<{ message?: string; xsrfToken?: string } | string>(`${this.API_URL}/Authentication/login`, credentials, {
      withCredentials: true
    }).pipe(
      map((response) => {
        if (typeof response === 'string') {
          return response.replace(/^"|"$/g, '').trim();
        }
        return response?.xsrfToken?.trim() ?? '';
      }),
      tap((token: string) => {
        if (token) {
          this.setCsrfToken(token);
        }
      }),
      // Una vez obtenido el token, determinamos el rol y datos del usuario
      tap(() => {
        this.resolveUserAndRole(credentials.email);
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Registra un nuevo usuario en el sistema (/api/User).
   */
  public register(userData: CreateUserDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.API_URL}/User`, userData, {
      withCredentials: true
    }).pipe(
      tap((createdUser) => {
        // Pre-guardamos los datos para el auto-enlace tras el login
        try {
          localStorage.setItem('registered_user_' + createdUser.email.toLowerCase(), JSON.stringify(createdUser));
        } catch {}
      })
    );
  }

  /**
   * Cierra la sesión revocando el token en el servidor y limpiando el estado local.
   */
  public logout(): void {
    this.http.post(`${this.API_URL}/Authentication/logout`, {}, {
      withCredentials: true
    }).pipe(
      catchError(() => of(null)) // Si la petición falla, igual limpiamos sesión local
    ).subscribe(() => {
      this.clearSession();
      this.notificationService.info('Has cerrado sesión correctamente.', 'Hasta pronto');
      this.router.navigate(['/login']);
    });
  }

  /**
   * Refresca las credenciales usando el endpoint de refresh.
   */
  public refresh(): Observable<any> {
    return this.http.post(`${this.API_URL}/Authentication/refresh`, {}, {
      withCredentials: true
    });
  }

  /**
   * Establece el usuario que el administrador está inspeccionando actualmente.
   */
  public setViewingUserId(userId: number | null): void {
    this.activeViewingUserId.set(userId);
    try {
      if (userId !== null) {
        localStorage.setItem(this.VIEWING_USER_KEY, userId.toString());
      } else {
        localStorage.removeItem(this.VIEWING_USER_KEY);
      }
    } catch {}
  }

  /**
   * Resuelve el rol del usuario y su ID.
   * Según los requisitos:
   * - Admin puede listar todos los usuarios (/api/User responde 200).
   * - Usuario normal recibe 403 Forbidden al intentar /api/User.
   */
  public resolveUserAndRole(email: string): void {
    // Intentamos consultar la lista de usuarios para verificar si tiene permisos de administrador
    this.http.get<UserDto[]>(`${this.API_URL}/User`, { withCredentials: true }).subscribe({
      next: (users) => {
        // Si responde 200 OK, es Administrador
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        const user: CurrentUser = {
          id: found?.id ?? 1,
          name: found?.name ?? 'Administrador',
          email: email,
          role: 'Admin'
        };
        this.setCurrentUser(user);
        this.notificationService.success(`Bienvenido, ${user.name} (Administrador)`);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        // Si responde 403, es un Usuario regular
        const role: UserRole = 'User';
        let registeredUser: UserDto | null = null;
        try {
          const cached = localStorage.getItem('registered_user_' + email.toLowerCase());
          if (cached) registeredUser = JSON.parse(cached);
        } catch {}

        // Consultamos cuentas o categorías para recuperar el userId
        this.http.get<MoneyAccountDto[]>(`${this.API_URL}/MoneyAccount`, { withCredentials: true }).subscribe({
          next: (accounts) => {
            const detectedId = (accounts && accounts.length > 0) ? accounts[0].userId : (registeredUser?.id ?? 1);
            const user: CurrentUser = {
              id: detectedId,
              name: registeredUser?.name ?? email.split('@')[0],
              email: email,
              role: role
            };
            this.setCurrentUser(user);
            this.notificationService.success(`Bienvenido, ${user.name}`);
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            // Fallback si no tiene cuentas aún
            const user: CurrentUser = {
              id: registeredUser?.id ?? 1,
              name: registeredUser?.name ?? email.split('@')[0],
              email: email,
              role: role
            };
            this.setCurrentUser(user);
            this.notificationService.success(`Bienvenido, ${user.name}`);
            this.router.navigate(['/dashboard']);
          }
        });
      }
    });
  }

  /**
   * Actualiza los datos del perfil del usuario autenticado tras una edición exitosa.
   */
  public updateCurrentUserProfile(updated: UserDto): void {
    const current = this.currentUser();
    if (current && current.id === updated.id) {
      this.setCurrentUser({
        ...current,
        name: updated.name,
        email: updated.email ?? current.email
      });
    }
  }

  /**
   * Actualiza el ID de usuario cuando se detecta un ID real desde una entidad cargada.
   */
  public updateDetectedUserId(newId: number): void {
    const current = this.currentUser();
    if (current && current.role === 'User' && current.id !== newId) {
      this.setCurrentUser({ ...current, id: newId });
    }
  }

  private setCsrfToken(token: string): void {
    this.csrfToken.set(token);
    try {
      localStorage.setItem(this.CSRF_STORAGE_KEY, token);
    } catch {}
  }

  private setCurrentUser(user: CurrentUser): void {
    this.currentUser.set(user);
    try {
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(user));
    } catch {}
  }

  private clearSession(): void {
    this.csrfToken.set(null);
    this.currentUser.set(null);
    this.activeViewingUserId.set(null);
    try {
      localStorage.removeItem(this.CSRF_STORAGE_KEY);
      localStorage.removeItem(this.USER_STORAGE_KEY);
      localStorage.removeItem(this.VIEWING_USER_KEY);
    } catch {}
  }

  private getStoredCsrfToken(): string | null {
    try {
      return localStorage.getItem(this.CSRF_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private getStoredUser(): CurrentUser | null {
    try {
      const data = localStorage.getItem(this.USER_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private getStoredViewingUserId(): number | null {
    try {
      const val = localStorage.getItem(this.VIEWING_USER_KEY);
      return val ? parseInt(val, 10) : null;
    } catch {
      return null;
    }
  }
}
