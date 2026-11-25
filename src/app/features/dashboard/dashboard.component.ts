import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StatisticsService } from '../../core/services/statistics.service';
import { TransactionService } from '../../core/services/transaction.service';
import { CategorySummaryDto, FinancialSummaryDto, MonthlyFlowDto, TransactionDto } from '../../core/models';
import { StatCardComponent } from '../../shared/components/stat-card.component';
import { ChartDonutComponent } from '../../shared/components/chart-donut.component';
import { ChartBarComponent } from '../../shared/components/chart-bar.component';

/**
 * Pantalla principal (Dashboard) con resumen financiero, gráfico de gastos por categoría,
 * filtros interactivos y exploración de demás estadísticas disponibles.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    StatCardComponent,
    ChartDonutComponent,
    ChartBarComponent
  ],
  template: `
    <div class="dashboard-container">
      <!-- Encabezado de Bienvenida -->
      <div class="dashboard-header">
        <div>
          <h1 class="page-title">Resumen Financiero</h1>
          <p class="page-subtitle">
            Hola, {{ authService.currentUser()?.name }}. Aquí tienes el estado de tus finanzas.
            @if (authService.isAdmin() && authService.activeViewingUserId()) {
              <span class="badge badge-admin">Viendo Usuario ID: {{ authService.activeViewingUserId() }}</span>
            }
          </p>
        </div>

        <div class="header-actions">
          <a routerLink="/transactions" class="btn btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Nueva Transacción
          </a>
        </div>
      </div>

      <!-- Tarjetas de Resumen Financiero -->
      <div class="summary-cards-grid">
        <app-stat-card
          title="Saldo en Efectivo"
          [value]="financialSummary()?.totalCashBalance ?? 0"
          variant="success"
          subtitle="Total disponible en cuentas">
          <svg icon width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="20" height="12" x="2" y="6" rx="2"></rect>
            <circle cx="12" cy="12" r="2"></circle>
            <path d="M6 12h.01M18 12h.01"></path>
          </svg>
        </app-stat-card>

        <app-stat-card
          title="Límite de Crédito"
          [value]="financialSummary()?.totalCreditLimit ?? 0"
          variant="primary"
          subtitle="Límite total en tarjetas">
          <svg icon width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="20" height="14" x="2" y="5" rx="2"></rect>
            <line x1="2" x2="22" y1="10" y2="10"></line>
          </svg>
        </app-stat-card>

        <app-stat-card
          title="Crédito Utilizado"
          [value]="financialSummary()?.totalCreditUsed ?? 0"
          variant="danger"
          subtitle="Deuda activa en tarjetas">
          <svg icon width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </app-stat-card>

        <app-stat-card
          title="Crédito Disponible"
          [value]="availableCredit()"
          variant="warning"
          subtitle="Margen restante para compras">
          <svg icon width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 14 14"></polyline>
          </svg>
        </app-stat-card>
      </div>

      <!-- SECCIÓN PRINCIPAL: Gráfica de Gastos por Categoría con Filtros -->
      <div class="card chart-section">
        <div class="section-header">
          <div class="section-title-box">
            <h2 class="section-title">Desglose de Gastos por Categoría</h2>
            <p class="section-desc">Analiza en qué conceptos se distribuye tu dinero</p>
          </div>

          <!-- Filtros de la Gráfica -->
          <div class="chart-filters-bar">
            <div class="filter-item">
              <label for="startDate" class="filter-label">Desde:</label>
              <input
                id="startDate"
                type="date"
                class="input-field filter-input"
                [(ngModel)]="filterStartDate"
                (change)="loadSpendingStats()"
              />
            </div>

            <div class="filter-item">
              <label for="endDate" class="filter-label">Hasta:</label>
              <input
                id="endDate"
                type="date"
                class="input-field filter-input"
                [(ngModel)]="filterEndDate"
                (change)="loadSpendingStats()"
              />
            </div>

            <div class="filter-item">
              <label for="limit" class="filter-label">Límite:</label>
              <select
                id="limit"
                class="select-field filter-select"
                [(ngModel)]="filterLimit"
                (change)="loadSpendingStats()">
                <option [ngValue]="null">Todas</option>
                <option [ngValue]="3">Top 3 con más gastos</option>
                <option [ngValue]="5">Top 5 con más gastos</option>
                <option [ngValue]="10">Top 10 con más gastos</option>
              </select>
            </div>

            <button type="button" class="btn btn-secondary filter-reset-btn" (click)="resetFilters()">
              Restablecer Último Mes
            </button>
          </div>
        </div>

        <div class="chart-content">
          @if (loadingSpending()) {
            <div class="loading-state">
              <span class="spinner-large"></span>
              <p>Cargando análisis de gastos...</p>
            </div>
          } @else {
            <app-chart-donut
              [data]="donutData()"
              centerLabel="Total Gastado">
            </app-chart-donut>
          }
        </div>
      </div>

      <!-- OTRAS ESTADÍSTICAS DISPONIBLES (Pestañas / Desplegables) -->
      <div class="extra-stats-container">
        <!-- Pestañas de Navegación de Estadísticas Adicionales -->
        <div class="extra-tabs-bar">
          <button
            type="button"
            class="tab-pill"
            [class.active]="activeExtraTab() === 'cashflow'"
            (click)="activeExtraTab.set('cashflow')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
            Flujo Mensual (Ingresos vs Gastos)
          </button>

          <button
            type="button"
            class="tab-pill"
            [class.active]="activeExtraTab() === 'income'"
            (click)="activeExtraTab.set('income'); loadIncomeStats()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="m16 12-4-4-4 4"></path><path d="M12 16V8"></path></svg>
            Ingresos por Categoría
          </button>

          <button
            type="button"
            class="tab-pill"
            [class.active]="activeExtraTab() === 'recent'"
            (click)="activeExtraTab.set('recent'); loadRecentTransactions()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            Últimas Transacciones
          </button>
        </div>

        <!-- Vista 1: Flujo de Caja Mensual -->
        @if (activeExtraTab() === 'cashflow') {
          <div class="card animate-fade">
            <h3 class="card-title">Flujo de Efectivo Mensual</h3>
            <p class="card-desc">Comparativa histórica de ingresos contra gastos mensuales</p>
            <div class="mt-4">
              <app-chart-bar [flowData]="monthlyFlow()"></app-chart-bar>
            </div>
          </div>
        }

        <!-- Vista 2: Ingresos por Categoría -->
        @if (activeExtraTab() === 'income') {
          <div class="card animate-fade">
            <h3 class="card-title">Distribución de Ingresos por Categoría</h3>
            <p class="card-desc">Fuentes de ingresos registradas en el período</p>
            <div class="mt-4">
              <app-chart-donut
                [data]="incomeDonutData()"
                centerLabel="Total Ingresos">
              </app-chart-donut>
            </div>
          </div>
        }

        <!-- Vista 3: Últimas Transacciones -->
        @if (activeExtraTab() === 'recent') {
          <div class="card animate-fade">
            <div class="table-header-flex">
              <div>
                <h3 class="card-title">Movimientos Recientes</h3>
                <p class="card-desc">Últimas transacciones registradas</p>
              </div>
              <a routerLink="/transactions" class="btn btn-secondary btn-sm">Ver Todas</a>
            </div>

            <div class="table-container mt-4">
              <table class="modern-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Monto</th>
                    <th>Cuenta ID</th>
                  </tr>
                </thead>
                <tbody>
                  @for (t of recentTransactions(); track t.id) {
                    <tr>
                      <td>{{ t.date | date:'dd/MM/yyyy HH:mm' }}</td>
                      <td>{{ t.description || 'Sin descripción' }}</td>
                      <td class="font-bold">
                        $ {{ t.amount | number:'1.2-2' }}
                      </td>
                      <td>
                        <span class="badge badge-account">Cuenta #{{ t.moneyAccountId }}</span>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="4" class="text-center py-4 text-muted">
                        No hay transacciones registradas todavía
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }
    .dashboard-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .page-title {
      font-size: 1.625rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }
    .page-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .summary-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
    }
    .chart-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .section-desc {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }
    .chart-filters-bar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .filter-item {
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }
    .filter-label {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
    }
    .filter-input {
      padding: 0.375rem 0.625rem;
      font-size: 0.8125rem;
      width: auto;
    }
    .filter-select {
      padding: 0.375rem 0.625rem;
      font-size: 0.8125rem;
      width: auto;
    }
    .filter-reset-btn {
      padding: 0.4rem 0.75rem;
      font-size: 0.75rem;
    }
    .chart-content {
      min-height: 260px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      color: var(--text-muted);
      padding: 3rem;
    }
    .spinner-large {
      width: 32px;
      height: 32px;
      border: 3px solid var(--border-subtle);
      border-radius: 50%;
      border-top-color: var(--primary-600);
      animation: spin 700ms linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .extra-stats-container {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .extra-tabs-bar {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }
    .tab-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-full);
      background-color: var(--bg-surface-elevated);
      color: var(--text-secondary);
      border: 1px solid var(--border-subtle);
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      white-space: nowrap;
    }
    .tab-pill:hover {
      background-color: var(--bg-surface-hover);
      color: var(--text-primary);
    }
    .tab-pill.active {
      background-color: var(--primary-600);
      color: #ffffff;
      border-color: var(--primary-600);
    }
    .card-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .card-desc {
      font-size: 0.8125rem;
      color: var(--text-muted);
    }
    .table-header-flex {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .mt-4 { margin-top: 1rem; }
    .font-bold { font-weight: 700; }
    .text-center { text-align: center; }
    .text-muted { color: var(--text-muted); }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .btn-sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }
  `]
})
export class DashboardComponent implements OnInit {
  public readonly authService = inject(AuthService);
  private readonly statsService = inject(StatisticsService);
  private readonly transactionService = inject(TransactionService);

  // Estados reactivos
  public readonly financialSummary = signal<FinancialSummaryDto | null>(null);
  public readonly spendingStats = signal<CategorySummaryDto[]>([]);
  public readonly incomeStats = signal<CategorySummaryDto[]>([]);
  public readonly monthlyFlow = signal<MonthlyFlowDto[]>([]);
  public readonly recentTransactions = signal<TransactionDto[]>([]);

  public readonly loadingSpending = signal<boolean>(false);
  public readonly activeExtraTab = signal<'cashflow' | 'income' | 'recent'>('cashflow');

  // Filtros de fecha (por defecto último mes)
  public filterStartDate = '';
  public filterEndDate = '';
  public filterLimit: number | null = null;

  constructor() {
    // Al cambiar el usuario activo en vista Admin, recargar estadísticas automáticamente
    effect(() => {
      const uid = this.authService.effectiveUserId();
      if (uid > 0) {
        this.loadAllData(uid);
      }
    });
  }

  ngOnInit(): void {
    this.initDefaultDates();
    const uid = this.authService.effectiveUserId();
    if (uid > 0) {
      this.loadAllData(uid);
    }
  }

  private initDefaultDates(): void {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(today.getDate() - 30);

    this.filterEndDate = today.toISOString().split('T')[0];
    this.filterStartDate = oneMonthAgo.toISOString().split('T')[0];
  }

  public resetFilters(): void {
    this.initDefaultDates();
    this.filterLimit = null;
    this.loadSpendingStats();
  }

  public loadAllData(userId: number): void {
    this.loadFinancialSummary(userId);
    this.loadSpendingStats(userId);
    this.loadMonthlyFlow(userId);
    this.loadRecentTransactions(userId);
  }

  public loadFinancialSummary(userId = this.authService.effectiveUserId()): void {
    if (!userId) return;
    this.statsService.getFinancialSummary(userId).subscribe({
      next: (data) => this.financialSummary.set(data),
      error: () => {}
    });
  }

  public loadSpendingStats(userId = this.authService.effectiveUserId()): void {
    if (!userId) return;
    this.loadingSpending.set(true);
    this.statsService.getSpendingByCategory(
      userId,
      this.filterStartDate || undefined,
      this.filterEndDate || undefined,
      this.filterLimit || undefined
    ).subscribe({
      next: (data) => {
        this.spendingStats.set(data || []);
        this.loadingSpending.set(false);
      },
      error: () => {
        this.spendingStats.set([]);
        this.loadingSpending.set(false);
      }
    });
  }

  public loadIncomeStats(userId = this.authService.effectiveUserId()): void {
    if (!userId) return;
    this.statsService.getIncomeByCategory(userId, this.filterStartDate, this.filterEndDate).subscribe({
      next: (data) => this.incomeStats.set(data || []),
      error: () => this.incomeStats.set([])
    });
  }

  public loadMonthlyFlow(userId = this.authService.effectiveUserId()): void {
    if (!userId) return;
    this.statsService.getMonthlyCashFlow(userId).subscribe({
      next: (data) => this.monthlyFlow.set(data || []),
      error: () => this.monthlyFlow.set([])
    });
  }

  public loadRecentTransactions(userId = this.authService.effectiveUserId()): void {
    if (!userId) return;
    this.transactionService.getTransactions({ userId }).subscribe({
      next: (data) => {
        const sorted = (data || []).sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0;
          const dateB = b.date ? new Date(b.date).getTime() : 0;
          return dateB - dateA;
        });
        this.recentTransactions.set(sorted.slice(0, 5));
      },
      error: () => this.recentTransactions.set([])
    });
  }

  // Cálculos derivados
  public availableCredit(): number {
    const s = this.financialSummary();
    if (!s) return 0;
    const limit = s.totalCreditLimit ?? 0;
    const used = s.totalCreditUsed ?? 0;
    return Math.max(limit - used, 0);
  }

  public donutData(): { label: string; value: number }[] {
    return this.spendingStats().map(s => ({
      label: s.categoryName || `Categoría #${s.categoryId}`,
      value: s.totalAmount
    }));
  }

  public incomeDonutData(): { label: string; value: number }[] {
    return this.incomeStats().map(s => ({
      label: s.categoryName || `Categoría #${s.categoryId}`,
      value: s.totalAmount
    }));
  }
}
