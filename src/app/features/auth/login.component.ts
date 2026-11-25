import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle.component';
import { ToastContainerComponent } from '../../shared/components/toast-container.component';

/**
 * Pantalla de inicio de sesión y registro de usuarios.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ThemeToggleComponent, ToastContainerComponent],
  template: `
    <div class="auth-page">
      <!-- Botón de Tema en la esquina superior -->
      <div class="theme-top-bar">
        <app-theme-toggle></app-theme-toggle>
      </div>

      <div class="auth-card card animate-slide-up">
        <!-- Encabezado con Logo -->
        <div class="auth-header">
          <div class="logo-circle">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v20"></path>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <h1 class="auth-title">a5-em</h1>
          <p class="auth-subtitle">Gestión inteligente de finanzas y gastos personales</p>
        </div>

        <!-- Pestañas: Login vs Registro -->
        <div class="auth-tabs">
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="activeTab() === 'login'" 
            (click)="activeTab.set('login')">
            Iniciar Sesión
          </button>
          <button 
            type="button" 
            class="tab-btn" 
            [class.active]="activeTab() === 'register'" 
            (click)="activeTab.set('register')">
            Registrarse
          </button>
        </div>

        <!-- Formulario Iniciar Sesión -->
        @if (activeTab() === 'login') {
          <form (ngSubmit)="onLogin()" class="auth-form" #loginForm="ngForm">
            <div class="form-group">
              <label for="login-email" class="form-label">Correo Electrónico</label>
              <input
                id="login-email"
                type="email"
                name="email"
                class="input-field"
                placeholder="ejemplo@correo.com"
                required
                [(ngModel)]="loginEmail"
                autocomplete="email"
              />
            </div>

            <div class="form-group">
              <label for="login-password" class="form-label">Contraseña</label>
              <div class="password-wrapper">
                <input
                  id="login-password"
                  [type]="showPassword() ? 'text' : 'password'"
                  name="password"
                  class="input-field"
                  placeholder="Contraseña"
                  required
                  [(ngModel)]="loginPassword"
                  autocomplete="current-password"
                />
                <button type="button" class="btn-icon eye-btn" (click)="showPassword.update(v => !v)">
                  @if (showPassword()) {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>
                  } @else {
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary submit-btn" [disabled]="loading()">
              @if (loading()) {
                <span class="spinner"></span>
                Iniciando sesión...
              } @else {
                Entrar a mi cuenta
              }
            </button>
          </form>
        }

        <!-- Formulario Registrarse -->
        @if (activeTab() === 'register') {
          <form (ngSubmit)="onRegister()" class="auth-form" #regForm="ngForm">
            <div class="form-group">
              <label for="reg-name" class="form-label">Nombre Completo</label>
              <input
                id="reg-name"
                type="text"
                name="name"
                class="input-field"
                placeholder="Juan Pérez"
                required
                [(ngModel)]="regName"
              />
            </div>

            <div class="form-group">
              <label for="reg-email" class="form-label">Correo Electrónico</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                class="input-field"
                placeholder="juan@correo.com"
                required
                [(ngModel)]="regEmail"
              />
            </div>

            <div class="form-group">
              <label for="reg-password" class="form-label">Contraseña</label>
              <input
                id="reg-password"
                type="password"
                name="password"
                class="input-field"
                placeholder="Mínimo 6 caracteres"
                required
                [(ngModel)]="regPassword"
              />
            </div>

            <button type="submit" class="btn btn-primary submit-btn" [disabled]="loading()">
              @if (loading()) {
                <span class="spinner"></span>
                Creando cuenta...
              } @else {
                Registrarme
              }
            </button>
          </form>
        }
      </div>

      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      background-color: var(--bg-app);
      position: relative;
    }
    .theme-top-bar {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 2.25rem 2rem;
    }
    .auth-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      margin-bottom: 1.75rem;
    }
    .logo-circle {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-lg);
      background-color: var(--primary-50);
      color: var(--primary-600);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      box-shadow: var(--shadow-sm);
    }
    .auth-title {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }
    .auth-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    .auth-tabs {
      display: flex;
      background-color: var(--bg-surface-elevated);
      padding: 0.25rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;
    }
    .tab-btn {
      flex: 1;
      padding: 0.5rem;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .tab-btn.active {
      background-color: var(--bg-surface);
      color: var(--text-primary);
      box-shadow: var(--shadow-sm);
    }
    .auth-form {
      display: flex;
      flex-direction: column;
    }
    .password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .password-wrapper input {
      padding-right: 2.5rem;
    }
    .eye-btn {
      position: absolute;
      right: 0.5rem;
      padding: 0.25rem;
      color: var(--text-muted);
    }
    .submit-btn {
      width: 100%;
      margin-top: 0.5rem;
      padding: 0.75rem;
      font-size: 0.9375rem;
    }
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #ffffff;
      animation: spin 600ms linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  public readonly activeTab = signal<'login' | 'register'>('login');
  public readonly loading = signal<boolean>(false);
  public readonly showPassword = signal<boolean>(false);

  // Login form
  public loginEmail = '';
  public loginPassword = '';

  // Register form
  public regName = '';
  public regEmail = '';
  public regPassword = '';

  public onLogin(): void {
    if (!this.loginEmail || !this.loginPassword) {
      this.notificationService.warning('Por favor completa todos los campos.');
      return;
    }

    this.loading.set(true);
    this.authService.login({
      email: this.loginEmail.trim(),
      password: this.loginPassword
    }).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const detail = err.error?.detail || err.error?.title || 'Contraseña o usuario incorrectos.';
        this.notificationService.error(detail, 'Error al Iniciar Sesión');
      }
    });
  }

  public onRegister(): void {
    if (!this.regName || !this.regEmail || !this.regPassword) {
      this.notificationService.warning('Por favor completa todos los campos de registro.');
      return;
    }

    this.loading.set(true);
    this.authService.register({
      name: this.regName.trim(),
      email: this.regEmail.trim(),
      password: this.regPassword
    }).subscribe({
      next: (user) => {
        this.loading.set(false);
        this.notificationService.success(`Cuenta creada para ${user.name}. Iniciando sesión automáticamente...`);
        // Iniciar sesión de forma automática
        this.loginEmail = this.regEmail;
        this.loginPassword = this.regPassword;
        this.onLogin();
      },
      error: (err) => {
        this.loading.set(false);
        const detail = err.error?.detail || err.error?.title || 'No se pudo crear la cuenta. Verifica que el correo no esté registrado.';
        this.notificationService.error(detail, 'Error al Registrarse');
      }
    });
  }
}
