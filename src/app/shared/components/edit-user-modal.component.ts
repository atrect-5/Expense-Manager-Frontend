import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from './modal.component';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { CurrentUser, UpdateUserDto, UserDto } from '../../core/models';

/**
 * Modal reutilizable para editar los datos de un usuario.
 * Centraliza el formulario y la petición de actualización para que pueda usarse
 * tanto en la gestión de usuarios (Admin) como en la edición del propio perfil (Ajustes).
 */
@Component({
  selector: 'app-edit-user-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <app-modal [isOpen]="isOpen" [title]="title" (close)="onClose()">
      <form body (ngSubmit)="save()" id="sharedEditUserForm">
        <div class="form-group">
          <label for="shared-edit-user-name" class="form-label">Nombre Completo</label>
          <input
            id="shared-edit-user-name"
            type="text"
            class="input-field"
            required
            [(ngModel)]="formData.name"
            name="editUserName"
          />
        </div>
      </form>

      <div footer>
        <button type="button" class="btn btn-secondary" (click)="onClose()" [disabled]="saving()">
          Cancelar
        </button>
        <button type="submit" form="sharedEditUserForm" class="btn btn-primary" [disabled]="saving()">
          {{ saving() ? 'Actualizando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </app-modal>
  `
})
export class EditUserModalComponent implements OnChanges {
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  @Input() isOpen = false;
  @Input() user: UserDto | CurrentUser | null = null;
  @Input() title = 'Editar Usuario';

  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<UserDto>();

  public readonly saving = signal<boolean>(false);

  public formData: UpdateUserDto = { name: '' };

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['isOpen'] || changes['user']) && this.isOpen && this.user) {
      this.formData = {
        name: this.user.name
      };
    }
  }

  public onClose(): void {
    if (!this.saving()) {
      this.close.emit();
    }
  }

  public save(): void {
    if (!this.user) return;

    const trimmedName = this.formData.name?.trim();

    if (!trimmedName) {
      this.notificationService.warning('Ingresa un nombre para actualizar.');
      return;
    }

    const payload: UpdateUserDto = { name: trimmedName };

    this.saving.set(true);
    this.userService.updateUser(this.user.id, payload).subscribe({
      next: (updatedUser) => {
        this.saving.set(false);
        // Si el usuario editado es el mismo que tiene la sesión activa, sincronizamos el estado local
        this.authService.updateCurrentUserProfile(updatedUser);
        this.notificationService.success('Información de usuario actualizada.');
        this.saved.emit(updatedUser);
        this.close.emit();
      },
      error: (err) => {
        this.saving.set(false);
        this.notificationService.error(err.error?.detail || 'Error al actualizar usuario.');
      }
    });
  }
}
