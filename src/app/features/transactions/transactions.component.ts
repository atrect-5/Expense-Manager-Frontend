import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TransactionService } from '../../core/services/transaction.service';
import { AccountService } from '../../core/services/account.service';
import { CategoryService } from '../../core/services/category.service';
import { NotificationService } from '../../core/services/notification.service';
import { TransactionDto, CreateTransactionDto, UpdateTransactionDto, MoneyAccountDto, CategoryDto, TransactionFilters } from '../../core/models';
import { ModalComponent } from '../../shared/components/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

/**
 * Gestión de Transacciones (Ingresos y Gastos).
 * Permite filtrar, crear, editar y eliminar movimientos monetarios.
 */
@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ConfirmDialogComponent],
  template: `
    <div class="transactions-page">
      <!-- Encabezado -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Transacciones</h1>
          <p class="page-subtitle">Historial de movimientos monetarios y gastos registrados</p>
        </div>

        <button type="button" class="btn btn-primary" (click)="openCreateModal()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nueva Transacción
        </button>
      </div>

      <!-- Barra de Filtros -->
      <div class="card filter-card">
        <div class="filters-grid">
          <div class="filter-item">
            <label for="filterAccount" class="filter-label">Cuenta:</label>
            <select id="filterAccount" class="select-field" [(ngModel)]="filterAccountId" (change)="loadTransactions()">
              <option [ngValue]="null">Todas las cuentas</option>
              @for (acc of accounts(); track acc.id) {
                <option [ngValue]="acc.id">{{ acc.name }} ($ {{ acc.balance | number:'1.2-2' }})</option>
              }
            </select>
          </div>

          <div class="filter-item">
            <label for="filterCategory" class="filter-label">Categoría:</label>
            <select id="filterCategory" class="select-field" [(ngModel)]="filterCategoryId" (change)="loadTransactions()">
              <option [ngValue]="null">Todas las categorías</option>
              @for (cat of categories(); track cat.id) {
                <option [ngValue]="cat.id">{{ cat.name }} ({{ cat.type }})</option>
              }
            </select>
          </div>

          <div class="filter-item">
            <label for="transStartDate" class="filter-label">Fecha Desde:</label>
            <input id="transStartDate" type="date" class="input-field" [(ngModel)]="filterStartDate" (change)="loadTransactions()" />
          </div>

          <div class="filter-item">
            <label for="transEndDate" class="filter-label">Fecha Hasta:</label>
            <input id="transEndDate" type="date" class="input-field" [(ngModel)]="filterEndDate" (change)="loadTransactions()" />
          </div>

          <div class="filter-actions">
            <button type="button" class="btn btn-secondary btn-sm" (click)="resetFilters()">
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla de Transacciones -->
      <div class="card table-card">
        @if (loading()) {
          <div class="loading-box">
            <div class="spinner"></div>
            <p>Cargando transacciones...</p>
          </div>
        } @else if (transactions().length === 0) {
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="2" x2="12" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            <h3>No se encontraron transacciones</h3>
            <p>Prueba ajustando los filtros o registra tu primera transacción.</p>
          </div>
        } @else {
          <div class="table-container">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Cuenta</th>
                  <th>Monto</th>
                  <th class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (t of transactions(); track t.id) {
                  <tr>
                    <td class="whitespace-nowrap">{{ t.date | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td>
                      <span class="desc-text">{{ t.description || 'Sin descripción' }}</span>
                      @if (t.transferId) {
                        <span class="badge badge-account text-xs">Transferencia #{{ t.transferId }}</span>
                      }
                    </td>
                    <td>
                      <span class="badge" [ngClass]="getCategoryBadgeClass(t.categoryId)">
                        {{ getCategoryName(t.categoryId) }}
                      </span>
                    </td>
                    <td>
                      <span class="badge badge-account">
                        {{ getAccountName(t.moneyAccountId) }}
                      </span>
                    </td>
                    <td class="font-bold whitespace-nowrap">
                      $ {{ t.amount | number:'1.2-2' }}
                    </td>
                    <td class="text-right whitespace-nowrap">
                      <button type="button" class="btn-icon" (click)="openEditModal(t)" title="Editar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
                      </button>
                      <button type="button" class="btn-icon text-danger" (click)="openDeleteConfirm(t)" title="Eliminar">
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

      <!-- Modal Crear Transacción -->
      <app-modal [isOpen]="isCreateModalOpen()" title="Nueva Transacción" (close)="isCreateModalOpen.set(false)">
        <form body (ngSubmit)="saveCreateTransaction()" id="createTransForm">
          <div class="form-group">
            <label for="create-amount" class="form-label">Monto ($)</label>
            <input
              id="create-amount"
              type="number"
              step="0.01"
              min="0.01"
              class="input-field"
              placeholder="0.00"
              required
              [(ngModel)]="newTransaction.amount"
              name="amount"
            />
          </div>

          <div class="form-group">
            <label for="create-account" class="form-label">Cuenta de Dinero</label>
            <select id="create-account" class="select-field" required [(ngModel)]="newTransaction.moneyAccountId" name="moneyAccountId">
              <option [ngValue]="0" disabled>Selecciona una cuenta</option>
              @for (acc of accounts(); track acc.id) {
                <option [ngValue]="acc.id">{{ acc.name }} ($ {{ acc.balance | number:'1.2-2' }})</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="create-category" class="form-label">Categoría</label>
            <select id="create-category" class="select-field" required [(ngModel)]="newTransaction.categoryId" name="categoryId">
              <option [ngValue]="0" disabled>Selecciona una categoría</option>
              @for (cat of categories(); track cat.id) {
                <option [ngValue]="cat.id">{{ cat.name }} ({{ cat.type }})</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="create-date" class="form-label">Fecha y Hora</label>
            <input
              id="create-date"
              type="datetime-local"
              class="input-field"
              required
              [(ngModel)]="formDate"
              name="formDate"
            />
          </div>

          <div class="form-group">
            <label for="create-desc" class="form-label">Descripción</label>
            <input
              id="create-desc"
              type="text"
              class="input-field"
              placeholder="Ej: Compra de supermercado, Pago de nómina"
              maxlength="500"
              [(ngModel)]="newTransaction.description"
              name="description"
            />
          </div>
        </form>

        <div footer>
          <button type="button" class="btn btn-secondary" (click)="isCreateModalOpen.set(false)">Cancelar</button>
          <button type="submit" form="createTransForm" class="btn btn-primary" [disabled]="saving()">
            {{ saving() ? 'Guardando...' : 'Crear Transacción' }}
          </button>
        </div>
      </app-modal>

      <!-- Modal Editar Transacción -->
      <app-modal [isOpen]="isEditModalOpen()" title="Editar Transacción" (close)="isEditModalOpen.set(false)">
        <form body (ngSubmit)="saveEditTransaction()" id="editTransForm">
          <div class="form-group">
            <label for="edit-amount" class="form-label">Monto ($)</label>
            <input
              id="edit-amount"
              type="number"
              step="0.01"
              min="0.01"
              class="input-field"
              required
              [(ngModel)]="editTransactionData.amount"
              name="editAmount"
            />
          </div>

          <div class="form-group">
            <label for="edit-account" class="form-label">Cuenta de Dinero</label>
            <select id="edit-account" class="select-field" required [(ngModel)]="editTransactionData.moneyAccountId" name="editMoneyAccountId">
              @for (acc of accounts(); track acc.id) {
                <option [ngValue]="acc.id">{{ acc.name }} ($ {{ acc.balance | number:'1.2-2' }})</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="edit-category" class="form-label">Categoría</label>
            <select id="edit-category" class="select-field" required [(ngModel)]="editTransactionData.categoryId" name="editCategoryId">
              @for (cat of categories(); track cat.id) {
                <option [ngValue]="cat.id">{{ cat.name }} ({{ cat.type }})</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="edit-date" class="form-label">Fecha y Hora</label>
            <input
              id="edit-date"
              type="datetime-local"
              class="input-field"
              required
              [(ngModel)]="formDate"
              name="editFormDate"
            />
          </div>

          <div class="form-group">
            <label for="edit-desc" class="form-label">Descripción</label>
            <input
              id="edit-desc"
              type="text"
              class="input-field"
              maxlength="500"
              [(ngModel)]="editTransactionData.description"
              name="editDescription"
            />
          </div>
        </form>

        <div footer>
          <button type="button" class="btn btn-secondary" (click)="isEditModalOpen.set(false)">Cancelar</button>
          <button type="submit" form="editTransForm" class="btn btn-primary" [disabled]="saving()">
            {{ saving() ? 'Actualizando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </app-modal>

      <!-- Confirmación de Eliminación -->
      <app-confirm-dialog
        [isOpen]="isDeleteModalOpen()"
        title="Eliminar Transacción"
        [message]="'¿Estás seguro de que deseas eliminar esta transacción de $' + (selectedTransaction()?.amount | number:'1.2-2') + '?'"
        confirmText="Sí, Eliminar Transacción"
        (confirm)="confirmDelete()"
        (cancel)="isDeleteModalOpen.set(false)">
      </app-confirm-dialog>
    </div>
  `,
  styles: [`
    .transactions-page {
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
    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      align-items: flex-end;
    }
    .filter-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .filter-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .filter-actions {
      display: flex;
      align-items: center;
      height: 38px;
    }
    .table-card {
      padding: 0;
      overflow: hidden;
    }
    .loading-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 3rem;
      color: var(--text-muted);
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
    .empty-state {
      padding: 3.5rem 1.5rem;
      text-align: center;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
    .empty-state h3 {
      font-size: 1.125rem;
      color: var(--text-primary);
    }
    .desc-text {
      font-weight: 500;
      color: var(--text-primary);
    }
    .text-xs { font-size: 0.6875rem; margin-left: 0.5rem; }
    .font-bold { font-weight: 700; }
    .whitespace-nowrap { white-space: nowrap; }
    .text-right { text-align: right; }
    .text-danger { color: var(--danger-500); }
    .text-danger:hover { color: var(--danger-600); }
    .btn-sm { padding: 0.5rem 0.875rem; font-size: 0.8125rem; }
  `]
})
export class TransactionsComponent implements OnInit {
  private readonly transactionService = inject(TransactionService);
  private readonly accountService = inject(AccountService);
  private readonly categoryService = inject(CategoryService);
  public readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  public readonly transactions = signal<TransactionDto[]>([]);
  public readonly accounts = signal<MoneyAccountDto[]>([]);
  public readonly categories = signal<CategoryDto[]>([]);

  public readonly loading = signal<boolean>(false);
  public readonly saving = signal<boolean>(false);

  // Filtros
  public filterAccountId: number | null = null;
  public filterCategoryId: number | null = null;
  public filterStartDate = '';
  public filterEndDate = '';

  // Modales
  public readonly isCreateModalOpen = signal<boolean>(false);
  public readonly isEditModalOpen = signal<boolean>(false);
  public readonly isDeleteModalOpen = signal<boolean>(false);
  public readonly selectedTransaction = signal<TransactionDto | null>(null);

  // Modelos
  public formDate = '';
  public newTransaction: CreateTransactionDto = {
    amount: 0,
    userId: 0,
    categoryId: 0,
    moneyAccountId: 0,
    description: ''
  };

  public editTransactionData: UpdateTransactionDto = {
    amount: 0,
    date: '',
    categoryId: 0,
    moneyAccountId: 0,
    description: ''
  };

  constructor() {
    effect(() => {
      const uid = this.authService.activeViewingUserId();
      this.loadInitialData();
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  public loadInitialData(): void {
    this.loadAccountsAndCategories();
    this.loadTransactions();
  }

  public loadAccountsAndCategories(): void {
    const filterUserId = this.authService.isAdmin() ? (this.authService.activeViewingUserId() ?? undefined) : undefined;

    this.accountService.getAccounts({ userId: filterUserId }).subscribe({
      next: (accs) => this.accounts.set(accs || []),
      error: () => {}
    });

    this.categoryService.getCategories({ userId: filterUserId }).subscribe({
      next: (cats) => this.categories.set(cats || []),
      error: () => {}
    });
  }

  public loadTransactions(): void {
    this.loading.set(true);
    const filterUserId = this.authService.isAdmin() ? (this.authService.activeViewingUserId() ?? undefined) : undefined;

    const filters: TransactionFilters = {
      userId: filterUserId,
      moneyAccountId: this.filterAccountId ?? undefined,
      categoryId: this.filterCategoryId ?? undefined,
      startDate: this.filterStartDate || undefined,
      endDate: this.filterEndDate || undefined
    };

    this.transactionService.getTransactions(filters).subscribe({
      next: (data) => {
        const sorted = (data || []).sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
        this.transactions.set(sorted);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notificationService.error('Error al cargar transacciones.');
      }
    });
  }

  public resetFilters(): void {
    this.filterAccountId = null;
    this.filterCategoryId = null;
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.loadTransactions();
  }

  public openCreateModal(): void {
    const now = new Date();
    // Formato local para datetime-local
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.formDate = now.toISOString().slice(0, 16);

    const firstAcc = this.accounts().length > 0 ? this.accounts()[0].id : 0;
    const firstCat = this.categories().length > 0 ? this.categories()[0].id : 0;

    this.newTransaction = {
      amount: 0,
      userId: this.authService.effectiveUserId(),
      categoryId: firstCat,
      moneyAccountId: firstAcc,
      description: ''
    };
    this.isCreateModalOpen.set(true);
  }

  public saveCreateTransaction(): void {
    if (this.newTransaction.amount <= 0) {
      this.notificationService.warning('El monto debe ser mayor a 0.');
      return;
    }
    if (!this.newTransaction.moneyAccountId) {
      this.notificationService.warning('Debes seleccionar una cuenta.');
      return;
    }
    if (!this.newTransaction.categoryId) {
      this.notificationService.warning('Debes seleccionar una categoría.');
      return;
    }

    this.saving.set(true);
    this.newTransaction.userId = this.authService.effectiveUserId();
    this.newTransaction.date = new Date(this.formDate).toISOString();

    this.transactionService.createTransaction(this.newTransaction).subscribe({
      next: () => {
        this.saving.set(false);
        this.isCreateModalOpen.set(false);
        this.notificationService.success('Transacción registrada correctamente.');
        this.loadTransactions();
      },
      error: (err) => {
        this.saving.set(false);
        this.notificationService.error(err.error?.detail || 'Error al crear la transacción.');
      }
    });
  }

  public openEditModal(t: TransactionDto): void {
    this.selectedTransaction.set(t);
    const dateObj = t.date ? new Date(t.date) : new Date();
    dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
    this.formDate = dateObj.toISOString().slice(0, 16);

    this.editTransactionData = {
      amount: t.amount,
      date: t.date || new Date().toISOString(),
      categoryId: t.categoryId,
      moneyAccountId: t.moneyAccountId,
      description: t.description || ''
    };
    this.isEditModalOpen.set(true);
  }

  public saveEditTransaction(): void {
    const t = this.selectedTransaction();
    if (!t) return;

    if (this.editTransactionData.amount <= 0) {
      this.notificationService.warning('El monto debe ser mayor a 0.');
      return;
    }

    this.saving.set(true);
    this.editTransactionData.date = new Date(this.formDate).toISOString();

    this.transactionService.updateTransaction(t.id, this.editTransactionData).subscribe({
      next: () => {
        this.saving.set(false);
        this.isEditModalOpen.set(false);
        this.notificationService.success('Transacción actualizada.');
        this.loadTransactions();
      },
      error: (err) => {
        this.saving.set(false);
        this.notificationService.error(err.error?.detail || 'Error al actualizar la transacción.');
      }
    });
  }

  public openDeleteConfirm(t: TransactionDto): void {
    this.selectedTransaction.set(t);
    this.isDeleteModalOpen.set(true);
  }

  public confirmDelete(): void {
    const t = this.selectedTransaction();
    if (!t) return;

    this.transactionService.deleteTransaction(t.id).subscribe({
      next: () => {
        this.isDeleteModalOpen.set(false);
        this.notificationService.success('Transacción eliminada.');
        this.loadTransactions();
      },
      error: (err) => {
        this.isDeleteModalOpen.set(false);
        this.notificationService.error(err.error?.detail || 'No se pudo eliminar la transacción.');
      }
    });
  }

  public getCategoryName(categoryId: number): string {
    const cat = this.categories().find(c => c.id === categoryId);
    return cat ? cat.name : `Cat #${categoryId}`;
  }

  public getAccountName(accountId: number): string {
    const acc = this.accounts().find(a => a.id === accountId);
    return acc ? acc.name : `Cuenta #${accountId}`;
  }

  public getCategoryBadgeClass(categoryId: number): string {
    const cat = this.categories().find(c => c.id === categoryId);
    if (!cat) return 'badge-account';
    return cat.type === 'INCOME' ? 'badge-income' : 'badge-expenditure';
  }
}
