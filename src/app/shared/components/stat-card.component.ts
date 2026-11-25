import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Tarjeta de métrica/estadística con diseño limpio, moderno e interactivo.
 */
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stat-card card card-hover">
      <div class="stat-header">
        <span class="stat-title">{{ title }}</span>
        <div class="stat-icon-box" [ngClass]="variant">
          <ng-content select="[icon]"></ng-content>
        </div>
      </div>
      <div class="stat-body">
        <h3 class="stat-value">{{ formattedValue }}</h3>
        @if (subtitle) {
          <p class="stat-subtitle" [ngClass]="subtitleClass">{{ subtitle }}</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      position: relative;
      overflow: hidden;
    }
    .stat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .stat-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .stat-icon-box {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg-surface-elevated);
      color: var(--text-primary);
    }
    .stat-icon-box.primary {
      background-color: var(--primary-50);
      color: var(--primary-600);
    }
    .stat-icon-box.success {
      background-color: var(--success-bg);
      color: var(--success-text);
    }
    .stat-icon-box.danger {
      background-color: var(--danger-bg);
      color: var(--danger-500);
    }
    .stat-icon-box.warning {
      background-color: var(--warning-bg);
      color: var(--warning-text);
    }
    .stat-body {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .stat-value {
      font-size: 1.75rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }
    .stat-subtitle {
      font-size: 0.8125rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .stat-subtitle.text-success {
      color: var(--success-text);
    }
    .stat-subtitle.text-danger {
      color: var(--danger-500);
    }
  `]
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: number | string = 0;
  @Input() prefix = '$';
  @Input() subtitle = '';
  @Input() subtitleClass = '';
  @Input() variant: 'default' | 'primary' | 'success' | 'danger' | 'warning' = 'default';

  public get formattedValue(): string {
    if (typeof this.value === 'number') {
      return `${this.prefix} ${this.value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${this.prefix} ${this.value}`;
  }
}
