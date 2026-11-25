import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Pantalla de Ajustes de la aplicación:
 * - Selección explícita entre Modo Claro y Modo Oscuro según el requerimiento.
 * - Información del perfil activo y sesión.
 * - Variables de entorno / Configuración de la API.
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings-page">
      <!-- Encabezado -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Ajustes del Sistema</h1>
          <p class="page-subtitle">Personaliza tu experiencia y gestiona las preferencias de la aplicación</p>
        </div>
      </div>

      <!-- Sección 1: Tema de la Aplicación -->
      <div class="card settings-card">
        <div class="card-section-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>
          <div>
            <h3>Apariencia y Tema Visual</h3>
            <p>Alterna entre tema claro y tema oscuro con un solo clic</p>
          </div>
        </div>

        <div class="theme-selection-grid">
          <!-- Opción Tema Claro -->
          <div
            class="theme-card"
            [class.selected]="themeService.theme() === 'light'"
            (click)="themeService.setTheme('light')">
            <div class="theme-preview light-preview">
              <div class="mock-header"></div>
              <div class="mock-content">
                <div class="mock-bar"></div>
                <div class="mock-bar short"></div>
              </div>
            </div>
            <div class="theme-card-footer">
              <span class="theme-name">Tema Claro</span>
              @if (themeService.theme() === 'light') {
                <span class="badge badge-income">Activo</span>
              }
            </div>
          </div>

          <!-- Opción Tema Oscuro -->
          <div
            class="theme-card"
            [class.selected]="themeService.theme() === 'dark'"
            (click)="themeService.setTheme('dark')">
            <div class="theme-preview dark-preview">
              <div class="mock-header"></div>
              <div class="mock-content">
                <div class="mock-bar"></div>
                <div class="mock-bar short"></div>
              </div>
            </div>
            <div class="theme-card-footer">
              <span class="theme-name">Tema Oscuro</span>
              @if (themeService.theme() === 'dark') {
                <span class="badge badge-admin">Activo</span>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Sección 2: Información del Usuario y Sesión -->
      <div class="card settings-card">
        <div class="card-section-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <div>
            <h3>Datos de tu Cuenta</h3>
            <p>Información del usuario autenticado en la sesión</p>
          </div>
        </div>

        <div class="info-list">
          <div class="info-item">
            <span class="info-label">Nombre:</span>
            <span class="info-value font-bold">{{ authService.currentUser()?.name }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Correo Electrónico:</span>
            <span class="info-value">{{ authService.currentUser()?.email }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Rol del Usuario:</span>
            <span class="badge" [ngClass]="authService.isAdmin() ? 'badge-admin' : 'badge-income'">
              {{ authService.currentUser()?.role === 'Admin' ? 'Administrador' : 'Usuario Regular' }}
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">ID de Usuario:</span>
            <span class="info-value">#{{ authService.currentUser()?.id }}</span>
          </div>
        </div>
      </div>

      <!-- Sección 3: Conexión con el Backend -->
      <div class="card settings-card">
        <div class="card-section-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"></rect><rect width="20" height="8" x="2" y="14" rx="2" ry="2"></rect><line x1="6" x2="6.01" y1="6" y2="6"></line><line x1="6" x2="6.01" y1="18" y2="18"></line></svg>
          <div>
            <h3>Conexión con el Backend ASP.NET Core</h3>
            <p>Parámetros de configuración de la API REST</p>
          </div>
        </div>

        <div class="info-list">
          <div class="info-item">
            <span class="info-label">URL de la API:</span>
            <code class="code-badge">{{ apiUrl }}</code>
          </div>

          <div class="info-item">
            <span class="info-label">Token CSRF (Header X-CSRF-TOKEN):</span>
            <span class="info-value">
              @if (authService.csrfToken()) {
                <span class="badge badge-income">Presente y Activo</span>
              } @else {
                <span class="badge badge-expenditure">No detectado</span>
              }
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">Cookies HttpOnly (JWT & Refresh):</span>
            <span class="badge badge-income">Manejadas automáticamente por el navegador</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      max-width: 900px;
    }
    .page-title {
      font-size: 1.625rem;
      font-weight: 800;
      color: var(--text-primary);
    }
    .page-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }
    .settings-card {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .card-section-title {
      display: flex;
      align-items: flex-start;
      gap: 0.875rem;
      color: var(--primary-600);
    }
    .card-section-title h3 {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .card-section-title p {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }
    .theme-selection-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }
    .theme-card {
      border: 2px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 1rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: all var(--transition-fast);
      background-color: var(--bg-surface);
    }
    .theme-card:hover {
      border-color: var(--border-focus);
      transform: translateY(-2px);
    }
    .theme-card.selected {
      border-color: var(--primary-600);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
    }
    .theme-preview {
      height: 100px;
      border-radius: var(--radius-md);
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .light-preview {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .light-preview .mock-header {
      height: 12px;
      background-color: #ffffff;
      border-radius: var(--radius-sm);
    }
    .light-preview .mock-bar {
      height: 8px;
      background-color: #cbd5e1;
      border-radius: var(--radius-sm);
      margin-bottom: 4px;
    }
    .light-preview .mock-bar.short {
      width: 60%;
    }
    .dark-preview {
      background-color: #0b0f19;
      border: 1px solid #1f2937;
    }
    .dark-preview .mock-header {
      height: 12px;
      background-color: #1f2937;
      border-radius: var(--radius-sm);
    }
    .dark-preview .mock-bar {
      height: 8px;
      background-color: #374151;
      border-radius: var(--radius-sm);
      margin-bottom: 4px;
    }
    .dark-preview .mock-bar.short {
      width: 60%;
    }
    .theme-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .theme-name {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .info-list {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }
    .info-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .info-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .info-label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .info-value {
      font-size: 0.875rem;
      color: var(--text-primary);
    }
    .font-bold { font-weight: 700; }
    .code-badge {
      background-color: var(--bg-surface-elevated);
      color: var(--primary-600);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-family: monospace;
      font-size: 0.8125rem;
      border: 1px solid var(--border-subtle);
    }
  `]
})
export class SettingsComponent {
  public readonly themeService = inject(ThemeService);
  public readonly authService = inject(AuthService);

  public readonly apiUrl = environment.apiUrl;
}
