import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

/**
 * Botón moderno para alternar entre Modo Claro y Modo Oscuro.
 */
@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      type="button" 
      class="theme-toggle-btn" 
      (click)="themeService.toggleTheme()" 
      [attr.aria-label]="themeService.theme() === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
      [title]="themeService.theme() === 'dark' ? 'Modo Claro' : 'Modo Oscuro'">
      @if (themeService.theme() === 'dark') {
        <!-- Sol (Light mode icon) -->
        <svg class="theme-icon sun animate-fade" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="m17.66 17.66 1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="m6.34 17.66-1.41 1.41"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
        </svg>
      } @else {
        <!-- Luna (Dark mode icon) -->
        <svg class="theme-icon moon animate-fade" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </svg>
      }
    </button>
  `,
  styles: [`
    .theme-toggle-btn {
      background-color: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      color: var(--text-secondary);
      border-radius: var(--radius-md);
      width: 38px;
      height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .theme-toggle-btn:hover {
      background-color: var(--bg-surface-hover);
      color: var(--text-primary);
      border-color: var(--border-focus);
      transform: scale(1.05);
    }
    .theme-toggle-btn:active {
      transform: scale(0.95);
    }
    .theme-icon {
      transition: transform var(--transition-normal);
    }
    .sun {
      color: #f59e0b;
    }
    .moon {
      color: #6366f1;
    }
  `]
})
export class ThemeToggleComponent {
  public readonly themeService = inject(ThemeService);
}
