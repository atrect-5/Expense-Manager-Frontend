import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ThemeToggleComponent } from '../components/theme-toggle.component';
import { UserSelectorComponent } from '../components/user-selector.component';

/**
 * Encabezado superior con accesos rápidos, cambio de tema y selector de usuario.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ThemeToggleComponent, UserSelectorComponent],
  template: `
    <header class="header-container">
      <div class="header-left">
        <button type="button" class="btn-icon mobile-menu-toggle" (click)="toggleMobile.emit()" aria-label="Abrir menú de navegación">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="4" x2="20" y1="12" y2="12"></line>
            <line x1="4" x2="20" y1="6" y2="6"></line>
            <line x1="4" x2="20" y1="18" y2="18"></line>
          </svg>
        </button>
        <span class="header-status">
          <span class="status-indicator"></span>
          Sistema en Línea
        </span>
      </div>

      <div class="header-right">
        <!-- Selector exclusivo para Administrador -->
        <app-user-selector></app-user-selector>

        <!-- Alternador Modo Claro / Modo Oscuro -->
        <app-theme-toggle></app-theme-toggle>
      </div>
    </header>
  `,
  styles: [`
    .header-container {
      height: 64px;
      background-color: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      padding: 0 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 90;
      transition: background-color var(--transition-normal), border-color var(--transition-normal);
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .mobile-menu-toggle {
      display: none;
    }
    .header-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .status-indicator {
      width: 8px;
      height: 8px;
      background-color: #10b981;
      border-radius: var(--radius-full);
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }
    .header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    @media (max-width: 900px) {
      .mobile-menu-toggle {
        display: inline-flex;
      }
    }
  `]
})
export class HeaderComponent {
  public readonly authService = inject(AuthService);
  @Output() toggleMobile = new EventEmitter<void>();
}
