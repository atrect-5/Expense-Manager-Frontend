import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalComponent } from './modal.component';

/**
 * Diálogo reutilizable de confirmación para acciones críticas o eliminaciones.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ModalComponent],
  template: `
    <app-modal [isOpen]="isOpen" [title]="title" (close)="onCancel()">
      <div body class="confirm-content">
        <div class="confirm-icon-wrapper" [class.danger]="danger">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div class="confirm-text">
          <p class="confirm-message">{{ message }}</p>
        </div>
      </div>

      <div footer>
        <button type="button" class="btn btn-secondary" (click)="onCancel()">
          {{ cancelText }}
        </button>
        <button type="button" class="btn" [ngClass]="danger ? 'btn-danger' : 'btn-primary'" (click)="onConfirm()">
          {{ confirmText }}
        </button>
      </div>
    </app-modal>
  `,
  styles: [`
    .confirm-content {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }
    .confirm-icon-wrapper {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--warning-bg);
      color: var(--warning-text);
      border: 1px solid var(--warning-border);
    }
    .confirm-icon-wrapper.danger {
      background-color: var(--danger-bg);
      color: var(--danger-500);
      border-color: var(--danger-border);
    }
    .confirm-text {
      flex: 1;
    }
    .confirm-message {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = '¿Estás seguro?';
  @Input() message = 'Esta acción no se puede deshacer.';
  @Input() confirmText = 'Eliminar';
  @Input() cancelText = 'Cancelar';
  @Input() danger = true;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  public onConfirm(): void {
    this.confirm.emit();
  }

  public onCancel(): void {
    this.cancel.emit();
  }
}
