import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { UserDto } from '../../core/models';

/**
 * Selector de usuario para el modo Administrador.
 * Permite cambiar el contexto activo a cualquier usuario del sistema.
 */
@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (authService.isAdmin()) {
      <div class="user-selector-container">
        <label for="admin-user-select" class="selector-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          Vista Admin:
        </label>
        <select
          id="admin-user-select"
          class="selector-dropdown"
          [ngModel]="authService.activeViewingUserId()"
          (ngModelChange)="onUserChange($event)">
          <option [ngValue]="null">👤 Todos los usuarios / Mi cuenta</option>
          @for (u of users(); track u.id) {
            <option [ngValue]="u.id">{{ u.name }} ({{ u.email }})</option>
          }
        </select>
      </div>
    }
  `,
  styles: [`
    .user-selector-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: var(--primary-50);
      border: 1px solid var(--primary-100);
      padding: 0.25rem 0.625rem;
      border-radius: var(--radius-md);
    }
    .selector-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--primary-600);
      display: flex;
      align-items: center;
      gap: 0.25rem;
      white-space: nowrap;
    }
    .selector-dropdown {
      background-color: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      font-size: 0.8125rem;
      padding: 0.25rem 0.5rem;
      outline: none;
      cursor: pointer;
      max-width: 220px;
    }
    .selector-dropdown:focus {
      border-color: var(--primary-500);
    }
  `]
})
export class UserSelectorComponent implements OnInit {
  public readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);

  public readonly users = signal<UserDto[]>([]);

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      this.loadUsers();
    }
  }

  public loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => this.users.set(data),
      error: () => {}
    });
  }

  public onUserChange(userId: number | null): void {
    this.authService.setViewingUserId(userId);
  }
}
