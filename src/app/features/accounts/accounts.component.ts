import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AccountService } from '../../core/services/account.service';
import { NotificationService } from '../../core/services/notification.service';
import { MoneyAccountDto, CreateMoneyAccountDto, UpdateMoneyAccountDto, AccountType } from '../../core/models';
import { ModalComponent } from '../../shared/components/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

/**
 * Gestión de Cuentas de Dinero (Efectivo, Débito, Crédito).
 * Permite agregar, editar y eliminar cuentas con soporte para roles y límites.
 */
@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ConfirmDialogComponent],
  template: `
    <div class="accounts-page">
      <!-- Encabezado de la página -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Cuentas de Dinero</h1>
          <p class="page-subtitle">Gestiona tus cuentas bancarias, tarjetas y fondos en efectivo</p>
        </div>

        <button type="button" class="btn btn-primary" (click)="openCreateModal()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nueva Cuenta
        </button>
      </div>

      <!-- Grid de Cuentas -->
      @if (loading()) {
        <div class="loading-box">
          <div class="spinner"></div>
          <p>Cargando cuentas...</p>
        </div>
      } @else if (accounts().length === 0) {
        <div class="card empty-card">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>
          <h3>No tienes cuentas registradas</h3>
          <p>Crea tu primera cuenta para comenzar a registrar transacciones y presupuestos.</p>
          <button type="button" class="btn btn-primary" (click)="openCreateModal()">
            Crear Primera Cuenta
          </button>
        </div>
      } @else {
        <div class="accounts-grid">
          @for (acc of accounts(); track acc.id) {
            <div class="account-card card" [ngClass]="'card-' + acc.accountType.toLowerCase()">
              <div class="card-chip">
                <span class="badge" [ngClass]="getBadgeClass(acc.accountType)">{{ acc.accountType }}</span>
                <span class="acc-id">#{{ acc.id }}</span>
              </div>

              <div class="card-details">
                <h3 class="account-name">{{ acc.name }}</h3>
                <span class="balance-label">Saldo Actual</span>
                <div class="account-balance">
                  $ {{ acc.balance | number:'1.2-2' }}
                </div>

                @if (acc.accountType === 'CREDIT' && acc.creditLimit) {
                  <div class="credit-limit-box">
                    <span>Límite de Crédito:</span>
                    <strong>$ {{ acc.creditLimit | number:'1.2-2' }}</strong>
                  </div>
                }
              </div>

              <div class="card-actions">
                <button type="button" class="btn btn-secondary btn-sm" (click)="openEditModal(acc)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path></svg>
                  Editar
                </button>
                <button type="button" class="btn btn-danger btn-sm" (click)="openDeleteConfirm(acc)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  Eliminar
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Modal para Crear Cuenta -->
      <app-modal [isOpen]="isCreateModalOpen()" title="Nueva Cuenta de Dinero" (close)="isCreateModalOpen.set(false)">
        <form body (ngSubmit)="saveCreateAccount()" id="createAccountForm">
          <div class="form-group">
            <label for="acc-name" class="form-label">Nombre de la Cuenta</label>
            <input
              id="acc-name"
              type="text"
              class="input-field"
              placeholder="Ej: Tarjeta Nómina BBVA, Efectivo Billetera"
              required
              maxlength="50"
              [(ngModel)]="newAccount.name"
              name="name"
            />
          </div>

          <div class="form-group">
            <label for="acc-type" class="form-label">Tipo de Cuenta</label>
            <select id="acc-type" class="select-field" required [(ngModel)]="newAccount.accountType" name="accountType">
              <option value="DEBIT">DÉBITO (DEBIT)</option>
              <option value="CREDIT">CRÉDITO (CREDIT)</option>
              <option value="CASH">EFECTIVO (CASH)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="acc-balance" class="form-label">Saldo Inicial ($)</label>
            <input
              id="acc-balance"
              type="number"
              step="0.01"
              class="input-field"
              placeholder="0.00"
              [(ngModel)]="newAccount.balance"
              name="balance"
            />
          </div>

          @if (newAccount.accountType === 'CREDIT') {
            <div class="form-group animate-fade">
              <label for="acc-limit" class="form-label">Límite de Crédito ($)</label>
              <input
                id="acc-limit"
                type="number"
                step="0.01"
                class="input-field"
                placeholder="10000.00"
                [(ngModel)]="newAccount.creditLimit"
                name="creditLimit"
              />
            </div>
          }
        </form>

        <div footer>
          <button type="button" class="btn btn-secondary" (click)="isCreateModalOpen.set(false)">Cancelar</button>
          <button type="submit" form="createAccountForm" class="btn btn-primary" [disabled]="saving()">
            {{ saving() ? 'Guardando...' : 'Crear Cuenta' }}
          </button>
        </div>
      </app-modal>

      <!-- Modal para Editar Cuenta -->
      <app-modal [isOpen]="isEditModalOpen()" title="Editar Cuenta" (close)="isEditModalOpen.set(false)">
        <form body (ngSubmit)="saveEditAccount()" id="editAccountForm">
          <div class="form-group">
            <label for="edit-name" class="form-label">Nombre de la Cuenta</label>
            <input
              id="edit-name"
              type="text"
              class="input-field"
              required
              maxlength="50"
              [(ngModel)]="editAccountData.name"
              name="editName"
            />
          </div>

          <div class="form-group">
            <label for="edit-type" class="form-label">Tipo de Cuenta</label>
            <select id="edit-type" class="select-field" required [(ngModel)]="editAccountData.accountType" name="editAccountType">
              <option value="DEBIT">DÉBITO (DEBIT)</option>
              <option value="CREDIT">CRÉDITO (CREDIT)</option>
              <option value="CASH">EFECTIVO (CASH)</option>
            </select>
          </div>

          @if (editAccountData.accountType === 'CREDIT') {
            <div class="form-group animate-fade">
              <label for="edit-limit" class="form-label">Límite de Crédito ($)</label>
              <input
                id="edit-limit"
                type="number"
                step="0.01"
                class="input-field"
                [(ngModel)]="editAccountData.creditLimit"
                name="editCreditLimit"
              />
            </div>
          }
        </form>

        <div footer>
          <button type="button" class="btn btn-secondary" (click)="isEditModalOpen.set(false)">Cancelar</button>
          <button type="submit" form="editAccountForm" class="btn btn-primary" [disabled]="saving()">
            {{ saving() ? 'Actualizando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </app-modal>

      <!-- Confirmación de Eliminación -->
      <app-confirm-dialog
        [isOpen]="isDeleteModalOpen()"
        title="Eliminar Cuenta"
        [message]="'¿Estás seguro de que deseas eliminar la cuenta ' + (selectedAccount()?.name ?? '') + '? Las transacciones asociadas podrían verse afectadas.'"
        confirmText="Sí, Eliminar Cuenta"
        (confirm)="confirmDelete()"
        (cancel)="isDeleteModalOpen.set(false)">
      </app-confirm-dialog>
    </div>
  `,
  styles: [`
    .accounts-page {
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
    .empty-card {
      text-align: center;
      padding: 3.5rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: var(--text-muted);
    }
    .empty-card h3 {
      font-size: 1.25rem;
      color: var(--text-primary);
    }
    .accounts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.25rem;
    }
    .account-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 200px;
      border-radius: var(--radius-lg);
      position: relative;
      background: linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%);
    }
    .card-chip {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .acc-id {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
    }
    .card-details {
      margin: 1rem 0;
    }
    .account-name {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .balance-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-top: 0.5rem;
      display: block;
    }
    .account-balance {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }
    .credit-limit-box {
      margin-top: 0.5rem;
      font-size: 0.8125rem;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      padding-top: 0.375rem;
      border-top: 1px dashed var(--border-subtle);
    }
    .card-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-subtle);
    }
    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
    }
  `]
})
export class AccountsComponent implements OnInit {
  private readonly accountService = inject(AccountService);
  public readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  public readonly accounts = signal<MoneyAccountDto[]>([]);
  public readonly loading = signal<boolean>(false);
  public readonly saving = signal<boolean>(false);

  // Modales
  public readonly isCreateModalOpen = signal<boolean>(false);
  public readonly isEditModalOpen = signal<boolean>(false);
  public readonly isDeleteModalOpen = signal<boolean>(false);
  public readonly selectedAccount = signal<MoneyAccountDto | null>(null);

  // Modelos de formulario
  public newAccount: CreateMoneyAccountDto = {
    name: '',
    accountType: 'DEBIT',
    balance: 0,
    creditLimit: null
  };

  public editAccountData: UpdateMoneyAccountDto = {
    name: '',
    accountType: 'DEBIT',
    creditLimit: null
  };

  constructor() {
    effect(() => {
      // Si cambia el usuario seleccionado en admin, recargamos
      const uid = this.authService.activeViewingUserId();
      this.loadAccounts();
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  public loadAccounts(): void {
    this.loading.set(true);
    const filterUserId = this.authService.isAdmin() ? (this.authService.activeViewingUserId() ?? undefined) : undefined;

    this.accountService.getAccounts({ userId: filterUserId }).subscribe({
      next: (data) => {
        this.accounts.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.notificationService.error('No se pudieron cargar las cuentas bancarias.', 'Error');
      }
    });
  }

  public openCreateModal(): void {
    this.newAccount = {
      name: '',
      accountType: 'DEBIT',
      balance: 0,
      creditLimit: null,
      userId: this.authService.effectiveUserId() || undefined
    };
    this.isCreateModalOpen.set(true);
  }

  public saveCreateAccount(): void {
    if (!this.newAccount.name.trim()) {
      this.notificationService.warning('El nombre de la cuenta es obligatorio.');
      return;
    }

    this.saving.set(true);
    this.newAccount.userId = this.authService.effectiveUserId() || undefined;

    this.accountService.createAccount(this.newAccount).subscribe({
      next: (created) => {
        this.saving.set(false);
        this.isCreateModalOpen.set(false);
        this.notificationService.success(`Cuenta "${created.name}" creada exitosamente.`);
        this.loadAccounts();
      },
      error: (err) => {
        this.saving.set(false);
        this.notificationService.error(err.error?.detail || 'Error al crear la cuenta.', 'Error');
      }
    });
  }

  public openEditModal(account: MoneyAccountDto): void {
    this.selectedAccount.set(account);
    this.editAccountData = {
      name: account.name,
      accountType: account.accountType,
      creditLimit: account.creditLimit
    };
    this.isEditModalOpen.set(true);
  }

  public saveEditAccount(): void {
    const acc = this.selectedAccount();
    if (!acc) return;

    if (!this.editAccountData.name.trim()) {
      this.notificationService.warning('El nombre es obligatorio.');
      return;
    }

    this.saving.set(true);
    this.accountService.updateAccount(acc.id, this.editAccountData).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.isEditModalOpen.set(false);
        this.notificationService.success(`Cuenta "${updated.name}" actualizada.`);
        this.loadAccounts();
      },
      error: (err) => {
        this.saving.set(false);
        this.notificationService.error(err.error?.detail || 'Error al actualizar la cuenta.', 'Error');
      }
    });
  }

  public openDeleteConfirm(account: MoneyAccountDto): void {
    this.selectedAccount.set(account);
    this.isDeleteModalOpen.set(true);
  }

  public confirmDelete(): void {
    const acc = this.selectedAccount();
    if (!acc) return;

    this.accountService.deleteAccount(acc.id).subscribe({
      next: () => {
        this.isDeleteModalOpen.set(false);
        this.notificationService.success(`Cuenta "${acc.name}" eliminada.`);
        this.loadAccounts();
      },
      error: (err) => {
        this.isDeleteModalOpen.set(false);
        this.notificationService.error(err.error?.detail || 'No se pudo eliminar la cuenta.', 'Error');
      }
    });
  }

  public getBadgeClass(type: AccountType): string {
    switch (type) {
      case 'CREDIT': return 'badge-admin';
      case 'DEBIT': return 'badge-income';
      case 'CASH': return 'badge-account';
    }
  }
}
