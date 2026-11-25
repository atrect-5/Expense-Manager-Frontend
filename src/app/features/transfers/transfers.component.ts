import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TransferService } from '../../core/services/transfer.service';
import { AccountService } from '../../core/services/account.service';
import { NotificationService } from '../../core/services/notification.service';
import { TransferDto, CreateTransferDto, MoneyAccountDto, TransferFilters } from '../../core/models';
import { ModalComponent } from '../../shared/components/modal.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

/**
 * Gestión de Transferencias entre cuentas de dinero.
 */
@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ConfirmDialogComponent],
  template: `
    <div class="transfers-page">
      <!-- Encabezado -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Transferencias</h1>
          <p class="page-subtitle">Transfiere fondos entre tus cuentas bancarias y de efectivo</p>
        </div>

        <button type="button" class="btn btn-primary" (click)="openCreateModal()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
          Nueva Transferencia
        </button>
      </div>

      <!-- Filtros -->
      <div class="card filter-card">
        <div class="filters-grid">
          <div class="filter-item">
            <label for="filterAccount" class="filter-label">Cuenta Relacionada:</label>
            <select id="filterAccount" class="select-field" [(ngModel)]="filterAccountId" (change)="loadTransfers()">
              <option [ngValue]="null">Todas las cuentas</option>
              @for (acc of accounts(); track acc.id) {
                <option [ngValue]="acc.id">{{ acc.name }}</option>
              }
            </select>
          </div>

          <div class="filter-item">
            <label for="transferStartDate" class="filter-label">Fecha Desde:</label>
            <input id="transferStartDate" type="date" class="input-field" [(ngModel)]="filterStartDate" (change)="loadTransfers()" />
          </div>

          <div class="filter-item">
            <label for="transferEndDate" class="filter-label">Fecha Hasta:</label>
            <input id="transferEndDate" type="date" class="input-field" [(ngModel)]="filterEndDate" (change)="loadTransfers()" />
          </div>

          <div class="filter-actions">
            <button type="button" class="btn btn-secondary btn-sm" (click)="resetFilters()">
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Tabla de Transferencias -->
      <div class="card table-card">
        @if (loading()) {
          <div class="loading-box">
            <div class="spinner"></div>
            <p>Cargando transferencias...</p>
          </div>
        } @else if (transfers().length === 0) {
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
            <h3>No se encontraron transferencias</h3>
            <p>Realiza transferencias entre tus cuentas para equilibrar tus saldos.</p>
          </div>
        } @else {
          <div class="table-container">
            <table class="modern-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cuenta Origen</th>
                  <th></th>
                  <th>Cuenta Destino</th>
                  <th>Monto Transferido</th>
                  <th>Descripción</th>
                  <th class="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (tr of transfers(); track tr.id) {
                  <tr>
                    <td class="whitespace-nowrap">{{ tr.date | date:'dd/MM/yyyy HH:mm' }}</td>
                    <td>
                      <span class="badge badge-account">
                        {{ getAccountName(tr.moneyAccountSendId) }}
                      </span>
                    </td>
                    <td class="text-center">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="arrow-icon"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </td>
                    <td>
                      <span class="badge badge-income">
                        {{ getAccountName(tr.moneyAccountReceiveId) }}
                      </span>
                    </td>
                    <td class="font-bold whitespace-nowrap">
                      $ {{ tr.amount | number:'1.2-2' }}
                    </td>
                    <td>{{ tr.description || 'Transferencia entre cuentas' }}</td>
                    <td class="text-right">
                      <button type="button" class="btn-icon text-danger" (click)="openDeleteConfirm(tr)" title="Eliminar">
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

      <!-- Modal Crear Transferencia -->
      <app-modal [isOpen]="isCreateModalOpen()" title="Nueva Transferencia" (close)="isCreateModalOpen.set(false)">
        <form body (ngSubmit)="saveCreateTransfer()" id="createTransferForm">
          <div class="form-group">
            <label for="trans-amount" class="form-label">Monto a Transferir ($)</label>
            <input
              id="trans-amount"
              type="number"
              step="0.01"
              min="0.01"
              class="input-field"
              placeholder="0.00"
              required
              [(ngModel)]="newTransfer.amount"
              name="amount"
            />
          </div>

          <div class="form-group">
            <label for="trans-source" class="form-label">Cuenta de Origen (Envía fondos)</label>
            <select id="trans-source" class="select-field" required [(ngModel)]="newTransfer.moneyAccountSendId" name="sendId">
              <option [ngValue]="0" disabled>Selecciona la cuenta de origen</option>
              @for (acc of accounts(); track acc.id) {
                <option [ngValue]="acc.id">{{ acc.name }} ($ {{ acc.balance | number:'1.2-2' }})</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="trans-dest" class="form-label">Cuenta de Destino (Recibe fondos)</label>
            <select id="trans-dest" class="select-field" required [(ngModel)]="newTransfer.moneyAccountReceiveId" name="receiveId">
              <option [ngValue]="0" disabled>Selecciona la cuenta de destino</option>
              @for (acc of accounts(); track acc.id) {
                <option [ngValue]="acc.id" [disabled]="acc.id === newTransfer.moneyAccountSendId">
                  {{ acc.name }} ($ {{ acc.balance | number:'1.2-2' }})
                </option>
              }
            </select>
          </div>

          <div class="form-group">
            <label for="trans-date" class="form-label">Fecha y Hora</label>
            <input
              id="trans-date"
              type="datetime-local"
              class="input-field"
              required
              [(ngModel)]="formDate"
              name="formDate"
            />
          </div>

          <div class="form-group">
            <label for="trans-desc" class="form-label">Descripción</label>
            <input
              id="trans-desc"
              type="text"
              class="input-field"
              placeholder="Ej: Traspaso a cuenta de ahorros"
              maxlength="500"
              [(ngModel)]="newTransfer.description"
              name="description"
            />
          </div>
        </form>

        <div footer>
          <button type="button" class="btn btn-secondary" (click)="isCreateModalOpen.set(false)">Cancelar</button>
          <button type="submit" form="createTransferForm" class="btn btn-primary" [disabled]="saving()">
            {{ saving() ? 'Transfiriendo...' : 'Realizar Transferencia' }}
          </button>
        </div>
      </app-modal>

      <!-- Confirmar Eliminación -->
      <app-confirm-dialog
        [isOpen]="isDeleteModalOpen()"
        title="Eliminar Transferencia"
        [message]="'¿Estás seguro de que deseas eliminar esta transferencia de $' + (selectedTransfer()?.amount | number:'1.2-2') + '?'"
        confirmText="Sí, Eliminar Transferencia"
        (confirm)="confirmDelete()"
        (cancel)="isDeleteModalOpen.set(false)">
      </app-confirm-dialog>
    </div>
  `,
  styles: [`
    .transfers-page {
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
    .arrow-icon {
      color: var(--primary-600);
    }
    .font-bold { font-weight: 700; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .whitespace-nowrap { white-space: nowrap; }
    .text-danger { color: var(--danger-500); }
    .text-danger:hover { color: var(--danger-600); }
    .btn-sm { padding: 0.5rem 0.875rem; font-size: 0.8125rem; }
  `]
})
export class TransfersComponent implements OnInit {
  private readonly transferService = inject(TransferService);
  private readonly accountService = inject(AccountService);
  public readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  public readonly transfers = signal<TransferDto[]>([]);
  public readonly accounts = signal<MoneyAccountDto[]>([]);

  public readonly loading = signal<boolean>(false);
  public readonly saving = signal<boolean>(false);

  // Filtros
  public filterAccountId: number | null = null;
  public filterStartDate = '';
  public filterEndDate = '';

  // Modales
  public readonly isCreateModalOpen = signal<boolean>(false);
  public readonly isDeleteModalOpen = signal<boolean>(false);
  public readonly selectedTransfer = signal<TransferDto | null>(null);

  // Formulario
  public formDate = '';
  public newTransfer: CreateTransferDto = {
    amount: 0,
    userId: 0,
    moneyAccountSendId: 0,
    moneyAccountReceiveId: 0,
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
    const filterUserId = this.authService.isAdmin() ? (this.authService.activeViewingUserId() ?? undefined) : undefined;

    this.accountService.getAccounts({ userId: filterUserId }).subscribe({
      next: (accs) => this.accounts.set(accs || []),
      error: () => {}
    });

    this.loadTransfers();
  }

  public loadTransfers(): void {
    this.loading.set(true);
    const filterUserId = this.authService.isAdmin() ? (this.authService.activeViewingUserId() ?? undefined) : undefined;

    const filters: TransferFilters = {
      userId: filterUserId,
      moneyAccountId: this.filterAccountId ?? undefined,
      startDate: this.filterStartDate || undefined,
      endDate: this.filterEndDate || undefined
    };

    this.transferService.getTransfers(filters).subscribe({
      next: (data) => {
        const sorted = (data || []).sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
        this.transfers.set(sorted);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notificationService.error('Error al cargar transferencias.');
      }
    });
  }

  public resetFilters(): void {
    this.filterAccountId = null;
    this.filterStartDate = '';
    this.filterEndDate = '';
    this.loadTransfers();
  }

  public openCreateModal(): void {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    this.formDate = now.toISOString().slice(0, 16);

    const accs = this.accounts();
    this.newTransfer = {
      amount: 0,
      userId: this.authService.effectiveUserId(),
      moneyAccountSendId: accs.length > 0 ? accs[0].id : 0,
      moneyAccountReceiveId: accs.length > 1 ? accs[1].id : 0,
      description: ''
    };
    this.isCreateModalOpen.set(true);
  }

  public saveCreateTransfer(): void {
    if (this.newTransfer.amount <= 0) {
      this.notificationService.warning('El monto debe ser mayor a 0.');
      return;
    }
    if (!this.newTransfer.moneyAccountSendId || !this.newTransfer.moneyAccountReceiveId) {
      this.notificationService.warning('Debes seleccionar cuenta de origen y cuenta de destino.');
      return;
    }
    if (this.newTransfer.moneyAccountSendId === this.newTransfer.moneyAccountReceiveId) {
      this.notificationService.warning('La cuenta de origen y la de destino no pueden ser la misma.');
      return;
    }

    this.saving.set(true);
    this.newTransfer.userId = this.authService.effectiveUserId();
    this.newTransfer.date = new Date(this.formDate).toISOString();

    this.transferService.createTransfer(this.newTransfer).subscribe({
      next: () => {
        this.saving.set(false);
        this.isCreateModalOpen.set(false);
        this.notificationService.success('Transferencia realizada correctamente.');
        this.loadTransfers();
      },
      error: (err) => {
        this.saving.set(false);
        this.notificationService.error(err.error?.detail || 'Error al procesar transferencia.');
      }
    });
  }

  public openDeleteConfirm(tr: TransferDto): void {
    this.selectedTransfer.set(tr);
    this.isDeleteModalOpen.set(true);
  }

  public confirmDelete(): void {
    const tr = this.selectedTransfer();
    if (!tr) return;

    this.transferService.deleteTransfer(tr.id).subscribe({
      next: () => {
        this.isDeleteModalOpen.set(false);
        this.notificationService.success('Transferencia eliminada.');
        this.loadTransfers();
      },
      error: (err) => {
        this.isDeleteModalOpen.set(false);
        this.notificationService.error(err.error?.detail || 'No se pudo eliminar la transferencia.');
      }
    });
  }

  public getAccountName(accountId: number): string {
    const acc = this.accounts().find(a => a.id === accountId);
    return acc ? acc.name : `Cuenta #${accountId}`;
  }
}
