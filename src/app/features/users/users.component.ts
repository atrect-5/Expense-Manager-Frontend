import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserDto, CreateUserDto, UpdateUserDto } from '../../core/models';
import { ModalComponent } from '../../shared/components/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

/**
 * Gestión de Usuarios en el Sistema (Exclusivo para Administradores).
 */
@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ConfirmDialogComponent],
  template: `
    <div class="users-page">
      <!-- Encabezado -->
      <div class="page-header">
        <div>
          <div class="header-badge-row">
            <h1 class="page-title">Gestión de Usuarios</h1>
            <span class="badge badge-admin">Módulo Administrador</span>
          </div>
          <p class="page-subtitle">Administra todas las cuentas de usuario registradas en el sistema</p>
        </div>

        <button type="button" class="btn btn-primary" (click)="openCreateModal()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nuevo Usuario
        </button>
      </div>

      <!-- Tabla de Usuarios -->
      <div class="card table-card">
        @if (loading()) {
          <div class="loading-box">
            <div class="spinner"></div>
            <p>Cargando lista de usuarios...</p>
          </div>
        } @else if (users().length === 0) {
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <h3>No se encontraron usuarios</h3>
          </div>
        } @else {
          <div class="table-container">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Correo Electrónico</th>
                  <th>Estado Contexto</th>
                  <th class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (u of users(); track u.id) {
                  <tr>
                    <td class="font-bold">#{{ u.id }}</td>
                    <td>
                      <div class="user-row-name">
                        <div class="mini-avatar">
                          {{ u.name.charAt(0).toUpperCase() }}
                        </div>
                        <span>{{ u.name }}</span>
                      </div>
                    </td>
                    <td>{{ u.email }}</td>
                    <td>
                      @if (authService.activeViewingUserId() === u.id) {
                        <span class="badge badge-income">Activo en Vista</span>
                      } @else {
                        <button type="button" class="btn btn-secondary btn-xs" (click)="inspectUser(u)">
                          Inspeccionar Datos
                        </button>
                      }
                    </td>
                    <td class="text-right whitespace-nowrap">
                      <button type="button" class="btn-icon" (click)="openEditModal(u)" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
                      </button>
                      <button type="button" class="btn-icon text-danger" (click)="openDeleteConfirm(u)" title="Eliminar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Modal Crear Usuario -->
      <app-modal [isOpen]="isCreateModalOpen()" title="Crear Nuevo Usuario" (close)="isCreateModalOpen.set(false)">
        <form body (ngSubmit)="saveCreateUser()" id="createUserForm">
          <div class="form-group">
            <label for="create-user-name" class="form-label">Nombre Completo</label>
            <input
              id="create-user-name"
              type="text"
              class="input-field"
              required
              [(ngModel)]="newUser.name"
              name="userName"
            />
          </div>

          <div class="form-group">
            <label for="create-user-email" class="form-label">Correo Electrónico</label>
            <input
              id="create-user-email"
              type="email"
              class="input-field"
              required
              [(ngModel)]="newUser.email"
              name="userEmail"
            />
          </div>

          <div class="form-group">
            <label for="create-user-password" class="form-label">Contraseña</label>
            <input
              id="create-user-password"
              type="password"
              class="input-field"
              required
              [(ngModel)]="newUser.password"
              name="userPassword"
            />
          </div>
        </form>

        <div footer>
          <button type="button" class="btn btn-secondary" (click)="isCreateModalOpen.set(false)">Cancelar</button>
          <button type="submit" form="createUserForm" class="btn btn-primary" [disabled]="saving()">
            {{ saving() ? 'Guardando...' : 'Crear Usuario' }}
          </button>
        </div>
      </app-modal>

      <!-- Modal Editar Usuario -->
      <app-modal [isOpen]="isEditModalOpen()" title="Editar Usuario" (close)="isEditModalOpen.set(false)">
        <form body (ngSubmit)="saveEditUser()" id="editUserForm">
          <div class="form-group">
            <label for="edit-user-name" class="form-label">Nombre Completo</label>
            <input
              id="edit-user-name"
              type="text"
              class="input-field"
              [(ngModel)]="editUserData.name"
              name="editUserName"
            />
          </div>

          <div class="form-group">
            <label for="edit-user-pass" class="form-label">Nueva Contraseña (Opcional)</label>
            <input
              id="edit-user-pass"
              type="password"
              class="input-field"
              placeholder="Dejar en blanco para no modificar"
              [(ngModel)]="editUserData.password"
              name="editUserPass"
            />
          </div>
        </form>

        <div footer>
          <button type="button" class="btn btn-secondary" (click)="isEditModalOpen.set(false)">Cancelar</button>
          <button type="submit" form="editUserForm" class="btn btn-primary" [disabled]="saving()">
            {{ saving() ? 'Actualizando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </app-modal>

      <!-- Diálogo Confirmar Eliminación -->
      <app-confirm-dialog
        [isOpen]="isDeleteModalOpen()"
        title="Eliminar Usuario"
        [message]="'¿Estás seguro de que deseas eliminar permanentemente al usuario ' + (selectedUser()?.name ?? '') + '?'"
        confirmText="Sí, Eliminar Usuario"
        (confirm)="confirmDelete()"
        (cancel)="isDeleteModalOpen.set(false)">
      </app-confirm-dialog>
    </div>
  `,
  styles: [`
    .users-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .header-badge-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
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
    .table-card {
      padding: 0;
      overflow: hidden;
    }
    .loading-box, .empty-state {
      padding: 3.5rem 1.5rem;
      text-align: center;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
    .spinner {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border-subtle);
      border-radius: 50%;
      border-top-color: var(--primary-600);
      animation: spin 700ms linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .user-row-name {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      font-weight: 600;
    }
    .mini-avatar {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-full);
      background-color: var(--primary-100);
      color: var(--primary-600);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .font-bold { font-weight: 700; }
    .text-right { text-align: right; }
    .whitespace-nowrap { white-space: nowrap; }
    .text-danger { color: var(--danger-500); }
    .text-danger:hover { color: var(--danger-600); }
    .btn-xs { padding: 0.25rem 0.5rem; font-size: 0.75rem; }
  `]
})
export class UsersComponent implements OnInit {
  private readonly userService = inject(UserService);
  public readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  public readonly users = signal<UserDto[]>([]);
  public readonly loading = signal<boolean>(false);
  public readonly saving = signal<boolean>(false);

  // Modales
  public readonly isCreateModalOpen = signal<boolean>(false);
  public readonly isEditModalOpen = signal<boolean>(false);
  public readonly isDeleteModalOpen = signal<boolean>(false);
  public readonly selectedUser = signal<UserDto | null>(null);

  // Modelos
  public newUser: CreateUserDto = {
    name: '',
    email: '',
    password: ''
  };

  public editUserData: UpdateUserDto = {
    name: '',
    password: ''
  };

  ngOnInit(): void {
    this.loadUsers();
  }

  public loadUsers(): void {
    this.loading.set(true);
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notificationService.error('Error al cargar la lista de usuarios.');
      }
    });
  }

  public inspectUser(user: UserDto): void {
    this.authService.setViewingUserId(user.id);
    this.notificationService.info(`Ahora visualizando los datos del usuario: ${user.name}`);
    this.router.navigate(['/dashboard']);
  }

  public openCreateModal(): void {
    this.newUser = { name: '', email: '', password: '' };
    this.isCreateModalOpen.set(true);
  }

  public saveCreateUser(): void {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.password) {
      this.notificationService.warning('Todos los campos son requeridos.');
      return;
    }

    this.saving.set(true);
    this.userService.createUser(this.newUser).subscribe({
      next: (created) => {
        this.saving.set(false);
        this.isCreateModalOpen.set(false);
        this.notificationService.success(`Usuario "${created.name}" creado correctamente.`);
        this.loadUsers();
      },
      error: (err) => {
        this.saving.set(false);
        this.notificationService.error(err.error?.detail || 'Error al crear usuario.');
      }
    });
  }

  public openEditModal(user: UserDto): void {
    this.selectedUser.set(user);
    this.editUserData = {
      name: user.name,
      password: ''
    };
    this.isEditModalOpen.set(true);
  }

  public saveEditUser(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.saving.set(true);
    const payload: UpdateUserDto = {};
    if (this.editUserData.name) payload.name = this.editUserData.name;
    if (this.editUserData.password) payload.password = this.editUserData.password;

    this.userService.updateUser(user.id, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.isEditModalOpen.set(false);
        this.notificationService.success(`Usuario actualizado.`);
        this.loadUsers();
      },
      error: (err) => {
        this.saving.set(false);
        this.notificationService.error(err.error?.detail || 'Error al actualizar usuario.');
      }
    });
  }

  public openDeleteConfirm(user: UserDto): void {
    this.selectedUser.set(user);
    this.isDeleteModalOpen.set(true);
  }

  public confirmDelete(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.isDeleteModalOpen.set(false);
        this.notificationService.success(`Usuario "${user.name}" eliminado.`);
        this.loadUsers();
      },
      error: (err) => {
        this.isDeleteModalOpen.set(false);
        this.notificationService.error(err.error?.detail || 'No se pudo eliminar el usuario.');
      }
    });
  }
}
