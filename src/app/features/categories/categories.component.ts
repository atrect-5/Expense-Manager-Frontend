import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { NotificationService } from '../../core/services/notification.service';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto, CategoryType, CategoryFilters } from '../../core/models';
import { ModalComponent } from '../../shared/components/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

/**
 * Gestión de Categorías de Ingresos y Gastos.
 */
@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ConfirmDialogComponent],
  template: `
    <div class="categories-page">
      <!-- Encabezado -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Categorías</h1>
          <p class="page-subtitle">Organiza tus ingresos y clasifica tus gastos por conceptos</p>
        </div>

        <button type="button" class="btn btn-primary" (click)="openCreateModal()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nueva Categoría
        </button>
      </div>

      <!-- Filtros -->
      <div class="card filter-card">
        <div class="filters-row">
          <div class="search-box">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" x2="16.65" y1="21" y2="16.65"></line></svg>
            <input
              type="text"
              class="input-field search-input"
              placeholder="Buscar categoría por nombre..."
              [(ngModel)]="nameFilter"
              (input)="loadCategories()"
            />
          </div>

          <div class="type-filter-group">
            <button
              type="button"
              class="pill-btn"
              [class.active]="typeFilter === null"
              (click)="setTypeFilter(null)">
              Todas
            </button>
            <button
              type="button"
              class="pill-btn"
              [class.active]="typeFilter === 'EXPENDITURE'"
              (click)="setTypeFilter('EXPENDITURE')">
              Gastos (EXPENDITURE)
            </button>
            <button
              type="button"
              class="pill-btn"
              [class.active]="typeFilter === 'INCOME'"
              (click)="setTypeFilter('INCOME')">
              Ingresos (INCOME)
            </button>
          </div>
        </div>
      </div>

      <!-- Grid de Categorías -->
      <div class="categories-content">
        @if (loading()) {
          <div class="loading-box">
            <div class="spinner"></div>
            <p>Cargando categorías...</p>
          </div>
        } @else if (categories().length === 0) {
          <div class="card empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"></path><path d="M7 7h.01"></path></svg>
            <h3>No se encontraron categorías</h3>
            <p>Crea categorías personalizadas para tus gastos e ingresos.</p>
            <button type="button" class="btn btn-primary" (click)="openCreateModal()">
              Crear Categoría
            </button>
          </div>
        } @else {
          <div class="categories-grid">
            @for (cat of categories(); track cat.id) {
              <div class="category-card card card-hover">
                <div class="category-card-header">
                  <div class="cat-icon-box" [ngClass]="cat.type === 'INCOME' ? 'income' : 'expense'">
                    @if (cat.type === 'INCOME') {
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                    } @else {
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
                    }
                  </div>
                  <span class="badge" [ngClass]="cat.type === 'INCOME' ? 'badge-income' : 'badge-expenditure'">
                    {{ cat.type === 'INCOME' ? 'Ingreso' : 'Gasto' }}
                  </span>
                </div>

                <div class="category-info">
                  <h3 class="category-name">{{ cat.name }}</h3>
                  <span class="category-id">ID: #{{ cat.id }}</span>
                </div>

                <div class="category-actions">
                  <button type="button" class="btn-icon" (click)="openEditModal(cat)" title="Editar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
                  </button>
                  <button type="button" class="btn-icon text-danger" (click)="openDeleteConfirm(cat)" title="Eliminar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Modal Crear Categoría -->
      <app-modal [isOpen]="isCreateModalOpen()" title="Nueva Categoría" (close)="isCreateModalOpen.set(false)">
        <form body (ngSubmit)="saveCreateCategory()" id="createCategoryForm">
          <div class="form-group">
            <label for="create-cat-name" class="form-label">Nombre de la Categoría</label>
            <input
              id="create-cat-name"
              type="text"
              class="input-field"
              placeholder="Ej: Alimentación, Salario, Transporte"
              required
              maxlength="50"
              [(ngModel)]="newCategory.name"
              name="catName"
            />
          </div>

          <div class="form-group">
            <label for="create-cat-type" class="form-label">Tipo de Movimiento</label>
            <select id="create-cat-type" class="select-field" required [(ngModel)]="newCategory.type" name="catType">
              <option value="EXPENDITURE">GASTO (EXPENDITURE)</option>
              <option value="INCOME">INGRESO (INCOME)</option>
            </select>
          </div>
        </form>

        <div footer>
          <button type="button" class="btn btn-secondary" (click)="isCreateModalOpen.set(false)">Cancelar</button>
          <button type="submit" form="createCategoryForm" class="btn btn-primary" [disabled]="saving()">
            {{ saving() ? 'Guardando...' : 'Crear Categoría' }}
          </button>
        </div>
      </app-modal>

      <!-- Modal Editar Categoría -->
      <app-modal [isOpen]="isEditModalOpen()" title="Editar Categoría" (close)="isEditModalOpen.set(false)">
        <form body (ngSubmit)="saveEditCategory()" id="editCategoryForm">
          <div class="form-group">
            <label for="edit-cat-name" class="form-label">Nombre de la Categoría</label>
            <input
              id="edit-cat-name"
              type="text"
              class="input-field"
              required
              maxlength="50"
              [(ngModel)]="editCategoryData.name"
              name="editCatName"
            />
          </div>

          <div class="form-group">
            <label for="edit-cat-type" class="form-label">Tipo de Movimiento</label>
            <select id="edit-cat-type" class="select-field" required [(ngModel)]="editCategoryData.type" name="editCatType">
              <option value="EXPENDITURE">GASTO (EXPENDITURE)</option>
              <option value="INCOME">INGRESO (INCOME)</option>
            </select>
          </div>
        </form>

        <div footer>
          <button type="button" class="btn btn-secondary" (click)="isEditModalOpen.set(false)">Cancelar</button>
          <button type="submit" form="editCategoryForm" class="btn btn-primary" [disabled]="saving()">
            {{ saving() ? 'Actualizando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </app-modal>

      <!-- Diálogo Confirmar Eliminación -->
      <app-confirm-dialog
        [isOpen]="isDeleteModalOpen()"
        title="Eliminar Categoría"
        [message]="'¿Estás seguro de que deseas eliminar la categoría ' + (selectedCategory()?.name ?? '') + '?'"
        confirmText="Sí, Eliminar Categoría"
        (confirm)="confirmDelete()"
        (cancel)="isDeleteModalOpen.set(false)">
      </app-confirm-dialog>
    </div>
  `,
  styles: [`
    .categories-page {
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
    .filters-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .search-box {
      position: relative;
      flex: 1;
      max-width: 360px;
      min-width: 240px;
    }
    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }
    .search-input {
      padding-left: 2.25rem;
    }
    .type-filter-group {
      display: flex;
      gap: 0.5rem;
    }
    .pill-btn {
      padding: 0.4rem 0.875rem;
      border-radius: var(--radius-full);
      background-color: var(--bg-surface-elevated);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .pill-btn:hover {
      background-color: var(--bg-surface-hover);
      color: var(--text-primary);
    }
    .pill-btn.active {
      background-color: var(--primary-600);
      color: #ffffff;
      border-color: var(--primary-600);
    }
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.25rem;
    }
    .category-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
    }
    .category-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .cat-icon-box {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cat-icon-box.income {
      background-color: var(--success-bg);
      color: var(--success-text);
    }
    .cat-icon-box.expense {
      background-color: var(--danger-bg);
      color: var(--danger-500);
    }
    .category-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .category-id {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .category-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--border-subtle);
    }
    .loading-box, .empty-state {
      padding: 3.5rem 1.5rem;
      text-align: center;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
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
    .text-danger { color: var(--danger-500); }
    .text-danger:hover { color: var(--danger-600); }
  `]
})
export class CategoriesComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  public readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  public readonly categories = signal<CategoryDto[]>([]);
  public readonly loading = signal<boolean>(false);
  public readonly saving = signal<boolean>(false);

  // Filtros
  public nameFilter = '';
  public typeFilter: CategoryType | null = null;

  // Modales
  public readonly isCreateModalOpen = signal<boolean>(false);
  public readonly isEditModalOpen = signal<boolean>(false);
  public readonly isDeleteModalOpen = signal<boolean>(false);
  public readonly selectedCategory = signal<CategoryDto | null>(null);

  // Modelos
  public newCategory: CreateCategoryDto = {
    name: '',
    type: 'EXPENDITURE',
    userId: 0
  };

  public editCategoryData: UpdateCategoryDto = {
    name: '',
    type: 'EXPENDITURE'
  };

  constructor() {
    effect(() => {
      const uid = this.authService.activeViewingUserId();
      this.loadCategories();
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  public setTypeFilter(type: CategoryType | null): void {
    this.typeFilter = type;
    this.loadCategories();
  }

  public loadCategories(): void {
    this.loading.set(true);
    const filterUserId = this.authService.isAdmin() ? (this.authService.activeViewingUserId() ?? undefined) : undefined;

    const filters: CategoryFilters = {
      userId: filterUserId,
      nameFilter: this.nameFilter.trim() || undefined,
      typeFilter: this.typeFilter || undefined
    };

    this.categoryService.getCategories(filters).subscribe({
      next: (data) => {
        this.categories.set(data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notificationService.error('Error al cargar categorías.');
      }
    });
  }

  public openCreateModal(): void {
    this.newCategory = {
      name: '',
      type: 'EXPENDITURE',
      userId: this.authService.effectiveUserId()
    };
    this.isCreateModalOpen.set(true);
  }

  public saveCreateCategory(): void {
    if (!this.newCategory.name.trim()) {
      this.notificationService.warning('El nombre de la categoría es requerido.');
      return;
    }

    this.saving.set(true);
    this.newCategory.userId = this.authService.effectiveUserId() || undefined;

    this.categoryService.createCategory(this.newCategory).subscribe({
      next: (created) => {
        this.saving.set(false);
        this.isCreateModalOpen.set(false);
        this.notificationService.success(`Categoría "${created.name}" creada.`);
        this.loadCategories();
      },
      error: (err) => {
        this.saving.set(false);
        this.notificationService.error(err.error?.detail || 'Error al crear la categoría.');
      }
    });
  }

  public openEditModal(cat: CategoryDto): void {
    this.selectedCategory.set(cat);
    this.editCategoryData = {
      name: cat.name,
      type: cat.type
    };
    this.isEditModalOpen.set(true);
  }

  public saveEditCategory(): void {
    const cat = this.selectedCategory();
    if (!cat) return;

    if (!this.editCategoryData.name.trim()) {
      this.notificationService.warning('El nombre es requerido.');
      return;
    }

    this.saving.set(true);
    this.categoryService.updateCategory(cat.id, this.editCategoryData).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.isEditModalOpen.set(false);
        this.notificationService.success(`Categoría "${updated.name}" actualizada.`);
        this.loadCategories();
      },
      error: (err) => {
        this.saving.set(false);
        this.notificationService.error(err.error?.detail || 'Error al actualizar categoría.');
      }
    });
  }

  public openDeleteConfirm(cat: CategoryDto): void {
    this.selectedCategory.set(cat);
    this.isDeleteModalOpen.set(true);
  }

  public confirmDelete(): void {
    const cat = this.selectedCategory();
    if (!cat) return;

    this.categoryService.deleteCategory(cat.id).subscribe({
      next: () => {
        this.isDeleteModalOpen.set(false);
        this.notificationService.success(`Categoría "${cat.name}" eliminada.`);
        this.loadCategories();
      },
      error: (err) => {
        this.isDeleteModalOpen.set(false);
        this.notificationService.error(err.error?.detail || 'No se pudo eliminar la categoría.');
      }
    });
  }
}
