import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

/**
 * Barra lateral de navegación moderna y responsiva.
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar-container" [class.mobile-open]="isMobileOpen">
      <!-- Encabezado con Logo -->
      <div class="sidebar-header">
        <div class="logo-box">
          <svg class="logo-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20"></path>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <div class="logo-text">
            <h2>GastoSmart</h2>
            <span class="logo-tag">Finanzas Personales</span>
          </div>
        </div>

        <button type="button" class="btn-icon mobile-close-btn" (click)="closeSidebar.emit()" aria-label="Cerrar menú">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Enlaces de Navegación -->
      <nav class="sidebar-nav">
        <span class="nav-section-title">Principal</span>

        <a routerLink="/dashboard" routerLinkActive="active" (click)="closeSidebar.emit()" class="nav-link">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="7" height="9" x="3" y="3" rx="1"></rect>
            <rect width="7" height="5" x="14" y="3" rx="1"></rect>
            <rect width="7" height="9" x="14" y="12" rx="1"></rect>
            <rect width="7" height="5" x="3" y="16" rx="1"></rect>
          </svg>
          <span>Dashboard</span>
        </a>

        <span class="nav-section-title">Gestión Financiera</span>

        <a routerLink="/accounts" routerLinkActive="active" (click)="closeSidebar.emit()" class="nav-link">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="20" height="14" x="2" y="5" rx="2"></rect>
            <line x1="2" x2="22" y1="10" y2="10"></line>
          </svg>
          <span>Cuentas</span>
        </a>

        <a routerLink="/transactions" routerLinkActive="active" (click)="closeSidebar.emit()" class="nav-link">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" x2="12" y1="2" y2="22"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <span>Transacciones</span>
        </a>

        <a routerLink="/categories" routerLinkActive="active" (click)="closeSidebar.emit()" class="nav-link">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path>
            <path d="M7 7h.01"></path>
          </svg>
          <span>Categorías</span>
        </a>

        <a routerLink="/transfers" routerLinkActive="active" (click)="closeSidebar.emit()" class="nav-link">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="17 1 21 5 17 9"></polyline>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
            <polyline points="7 23 3 19 7 15"></polyline>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
          </svg>
          <span>Transferencias</span>
        </a>

        <!-- Sección exclusiva de Administrador -->
        @if (authService.isAdmin()) {
          <span class="nav-section-title">Administración</span>

          <a routerLink="/users" routerLinkActive="active" (click)="closeSidebar.emit()" class="nav-link admin-link">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Usuarios</span>
            <span class="badge badge-admin">Admin</span>
          </a>
        }

        <span class="nav-section-title">Configuración</span>

        <a routerLink="/settings" routerLinkActive="active" (click)="closeSidebar.emit()" class="nav-link">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          <span>Ajustes</span>
        </a>
      </nav>

      <!-- Pie de Sidebar con Perfil y Logout -->
      <div class="sidebar-footer">
        <div class="user-profile-badge">
          <div class="user-avatar">
            {{ (authService.currentUser()?.name || 'U').charAt(0).toUpperCase() }}
          </div>
          <div class="user-info">
            <span class="user-name" [title]="authService.currentUser()?.name">
              {{ authService.currentUser()?.name }}
            </span>
            <span class="user-role-text">
              {{ authService.currentUser()?.role === 'Admin' ? 'Administrador' : 'Usuario' }}
            </span>
          </div>
        </div>

        <button type="button" class="btn btn-secondary logout-btn" (click)="authService.logout()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" x2="9" y1="12" y2="12"></line>
          </svg>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar-container {
      width: 260px;
      height: 100vh;
      background-color: var(--bg-surface);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      z-index: 100;
      transition: transform var(--transition-normal);
    }
    .sidebar-header {
      padding: 1.5rem 1.25rem 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-subtle);
    }
    .logo-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .logo-icon {
      color: var(--primary-600);
      background-color: var(--primary-50);
      padding: 4px;
      border-radius: var(--radius-md);
    }
    .logo-text h2 {
      font-size: 1.125rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      line-height: 1.2;
    }
    .logo-tag {
      font-size: 0.6875rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .mobile-close-btn {
      display: none;
    }
    .sidebar-nav {
      flex: 1;
      padding: 1.25rem 0.875rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      overflow-y: auto;
    }
    .nav-section-title {
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-muted);
      margin: 1rem 0.625rem 0.375rem 0.625rem;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.875rem;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 600;
      text-decoration: none;
      transition: all var(--transition-fast);
      position: relative;
    }
    .nav-link:hover {
      background-color: var(--bg-surface-elevated);
      color: var(--text-primary);
    }
    .nav-link.active {
      background-color: var(--primary-50);
      color: var(--primary-600);
    }
    .nav-link.active .nav-icon {
      color: var(--primary-600);
    }
    .nav-icon {
      color: var(--text-muted);
      transition: color var(--transition-fast);
      flex-shrink: 0;
    }
    .admin-link {
      justify-content: space-between;
    }
    .sidebar-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--border-subtle);
      background-color: var(--bg-surface);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .user-profile-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: var(--radius-md);
      background-color: var(--bg-surface-elevated);
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-full);
      background-color: var(--primary-600);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.875rem;
    }
    .user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .user-name {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-role-text {
      font-size: 0.6875rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .logout-btn {
      width: 100%;
      padding: 0.5rem;
      font-size: 0.8125rem;
    }

    @media (max-width: 900px) {
      .sidebar-container {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        transform: translateX(-100%);
        box-shadow: var(--shadow-xl);
      }
      .sidebar-container.mobile-open {
        transform: translateX(0);
      }
      .mobile-close-btn {
        display: inline-flex;
      }
    }
  `]
})
export class SidebarComponent {
  public readonly authService = inject(AuthService);
  @Input() isMobileOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();
}
