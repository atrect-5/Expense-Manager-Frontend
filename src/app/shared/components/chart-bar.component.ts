import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyFlowDto } from '../../core/models';

/**
 * Gráfico de barras SVG interactivo para representar el flujo de caja mensual (Ingresos vs Gastos).
 */
@Component({
  selector: 'app-chart-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bar-chart-container">
      @if (data().length === 0) {
        <div class="empty-bar-chart">
          <p>No hay datos mensuales registrados todavía</p>
        </div>
      } @else {
        <div class="chart-legend-top">
          <span class="legend-badge income">
            <span class="dot"></span> Ingresos
          </span>
          <span class="legend-badge expense">
            <span class="dot"></span> Gastos
          </span>
          <span class="legend-badge net">
            <span class="dot"></span> Flujo Neto
          </span>
        </div>

        <div class="svg-wrapper">
          <svg viewBox="0 0 600 240" class="bar-svg" preserveAspectRatio="none">
            <!-- Líneas de cuadrícula horizontal -->
            <line x1="40" y1="20" x2="580" y2="20" stroke="var(--border-subtle)" stroke-dasharray="3" />
            <line x1="40" y1="80" x2="580" y2="80" stroke="var(--border-subtle)" stroke-dasharray="3" />
            <line x1="40" y1="140" x2="580" y2="140" stroke="var(--border-subtle)" stroke-dasharray="3" />
            <line x1="40" y1="200" x2="580" y2="200" stroke="var(--border-subtle)" />

            @for (bar of computedBars(); track bar.monthLabel; let i = $index) {
              <!-- Barra Ingreso -->
              <rect
                [attr.x]="bar.xIncome"
                [attr.y]="bar.yIncome"
                [attr.width]="bar.barWidth"
                [attr.height]="bar.hIncome"
                rx="3"
                class="bar bar-income"
                (mouseenter)="activeHover.set({ title: bar.monthLabel + ' - Ingresos', val: bar.raw.totalIncome })"
                (mouseleave)="activeHover.set(null)"
              />

              <!-- Barra Gasto -->
              <rect
                [attr.x]="bar.xExpense"
                [attr.y]="bar.yExpense"
                [attr.width]="bar.barWidth"
                [attr.height]="bar.hExpense"
                rx="3"
                class="bar bar-expense"
                (mouseenter)="activeHover.set({ title: bar.monthLabel + ' - Gastos', val: bar.raw.totalExpenses })"
                (mouseleave)="activeHover.set(null)"
              />

              <!-- Etiqueta mes -->
              <text
                [attr.x]="bar.xCenter"
                y="225"
                text-anchor="middle"
                class="axis-label"
              >{{ bar.monthLabel }}</text>
            }
          </svg>
        </div>

        @if (activeHover()) {
          <div class="hover-tooltip animate-fade">
            <span class="tooltip-title">{{ activeHover()?.title }}</span>
            <span class="tooltip-val">$ {{ activeHover()?.val | number:'1.2-2' }}</span>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .bar-chart-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      position: relative;
    }
    .empty-bar-chart {
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
    }
    .chart-legend-top {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      font-size: 0.8125rem;
    }
    .legend-badge {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .legend-badge .dot {
      width: 8px;
      height: 8px;
      border-radius: var(--radius-full);
    }
    .legend-badge.income .dot { background-color: #10b981; }
    .legend-badge.expense .dot { background-color: #ef4444; }
    .legend-badge.net .dot { background-color: #6366f1; }
    
    .svg-wrapper {
      width: 100%;
      height: 220px;
    }
    .bar-svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
    .bar {
      transition: opacity 150ms ease, transform 150ms ease;
      cursor: pointer;
    }
    .bar:hover {
      opacity: 0.85;
    }
    .bar-income {
      fill: #10b981;
    }
    .bar-expense {
      fill: #ef4444;
    }
    .axis-label {
      fill: var(--text-muted);
      font-size: 11px;
      font-family: inherit;
    }
    .hover-tooltip {
      position: absolute;
      bottom: 2.5rem;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--bg-surface-elevated);
      border: 1px solid var(--border-subtle);
      padding: 0.375rem 0.75rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      pointer-events: none;
      z-index: 10;
    }
    .tooltip-title {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    .tooltip-val {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-primary);
    }
  `]
})
export class ChartBarComponent {
  public readonly data = signal<MonthlyFlowDto[]>([]);
  public readonly activeHover = signal<{ title: string; val: number } | null>(null);

  @Input()
  public set flowData(value: MonthlyFlowDto[]) {
    this.data.set(value || []);
  }

  private readonly monthNames = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  public readonly computedBars = computed(() => {
    const list = this.data();
    if (list.length === 0) return [];

    const maxVal = Math.max(
      ...list.map(d => Math.max(d.totalIncome, d.totalExpenses)),
      100
    );

    const chartHeight = 180;
    const baseY = 200;
    const availableWidth = 520;
    const count = list.length;
    const step = availableWidth / count;
    const barW = Math.min(step * 0.32, 18);

    return list.map((item, i) => {
      const xStart = 50 + i * step;
      const hIncome = Math.max((item.totalIncome / maxVal) * chartHeight, 3);
      const hExpense = Math.max((item.totalExpenses / maxVal) * chartHeight, 3);

      const yIncome = baseY - hIncome;
      const yExpense = baseY - hExpense;

      const monthName = this.monthNames[item.month - 1] || `M${item.month}`;

      return {
        monthLabel: `${monthName} ${item.year % 100}`,
        xIncome: xStart,
        yIncome,
        hIncome,
        xExpense: xStart + barW + 3,
        yExpense,
        hExpense,
        barWidth: barW,
        xCenter: xStart + barW + 1.5,
        raw: item
      };
    });
  });
}
