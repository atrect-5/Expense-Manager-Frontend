import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DonutSlice {
  label: string;
  value: number;
  percentage: number;
  color: string;
  strokeDasharray: string;
  strokeDashoffset: number;
}

/**
 * Gráfico interactivo Donut en SVG puro.
 * Ligero, moderno, sin librerías externas pesadas.
 */
@Component({
  selector: 'app-chart-donut',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container">
      @if (slices().length === 0 || total() === 0) {
        <div class="empty-chart">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 12h8"></path>
          </svg>
          <p>No hay gastos registrados para este período</p>
        </div>
      } @else {
        <div class="donut-wrapper">
          <svg viewBox="0 0 100 100" class="donut-svg">
            <!-- Círculo base de fondo -->
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="var(--bg-surface-elevated)"
              stroke-width="14"
            />
            <!-- Segmentos del donut -->
            @for (slice of slices(); track slice.label; let i = $index) {
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                [attr.stroke]="slice.color"
                stroke-width="14"
                [attr.stroke-dasharray]="slice.strokeDasharray"
                [attr.stroke-dashoffset]="slice.strokeDashoffset"
                class="donut-segment"
                [class.active]="hoveredIndex() === i"
                (mouseenter)="hoveredIndex.set(i)"
                (mouseleave)="hoveredIndex.set(null)"
              />
            }
          </svg>

          <!-- Centro informativo -->
          <div class="donut-center">
            @if (hoveredSlice()) {
              <span class="donut-center-label">{{ hoveredSlice()?.label }}</span>
              <span class="donut-center-value">$ {{ hoveredSlice()?.value | number:'1.2-2' }}</span>
              <span class="donut-center-pct">{{ hoveredSlice()?.percentage | number:'1.1-1' }}%</span>
            } @else {
              <span class="donut-center-label">{{ centerLabel }}</span>
              <span class="donut-center-value">$ {{ total() | number:'1.2-2' }}</span>
            }
          </div>
        </div>

        <!-- Leyenda -->
        <div class="donut-legend">
          @for (slice of slices(); track slice.label; let i = $index) {
            <div 
              class="legend-item" 
              [class.highlight]="hoveredIndex() === i"
              (mouseenter)="hoveredIndex.set(i)"
              (mouseleave)="hoveredIndex.set(null)">
              <span class="legend-color" [style.background-color]="slice.color"></span>
              <span class="legend-name" [title]="slice.label">{{ slice.label }}</span>
              <span class="legend-val">$ {{ slice.value | number:'1.2-2' }}</span>
              <span class="legend-pct">({{ slice.percentage | number:'1.0-0' }}%)</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      width: 100%;
    }
    @media (min-width: 640px) {
      .chart-container {
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }
    }
    .empty-chart {
      padding: 3rem 1rem;
      text-align: center;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      width: 100%;
    }
    .donut-wrapper {
      position: relative;
      width: 220px;
      height: 220px;
      flex-shrink: 0;
    }
    .donut-svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    .donut-segment {
      transition: stroke-width 200ms ease, opacity 200ms ease;
      cursor: pointer;
    }
    .donut-segment:hover, .donut-segment.active {
      stroke-width: 17;
      opacity: 0.95;
    }
    .donut-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      pointer-events: none;
      padding: 1rem;
    }
    .donut-center-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      max-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .donut-center-value {
      font-size: 1.125rem;
      font-weight: 800;
      color: var(--text-primary);
      margin-top: 0.125rem;
    }
    .donut-center-pct {
      font-size: 0.75rem;
      color: var(--primary-600);
      font-weight: 700;
    }
    .donut-legend {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      max-height: 240px;
      overflow-y: auto;
      padding-right: 0.5rem;
      flex: 1;
      min-width: 180px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8125rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      transition: background-color var(--transition-fast);
    }
    .legend-item:hover, .legend-item.highlight {
      background-color: var(--bg-surface-elevated);
    }
    .legend-color {
      width: 10px;
      height: 10px;
      border-radius: var(--radius-full);
      flex-shrink: 0;
    }
    .legend-name {
      flex: 1;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 140px;
    }
    .legend-val {
      font-weight: 600;
      color: var(--text-primary);
    }
    .legend-pct {
      color: var(--text-muted);
      font-size: 0.75rem;
    }
  `]
})
export class ChartDonutComponent {
  private readonly rawData = signal<{ label: string; value: number }[]>([]);
  public readonly hoveredIndex = signal<number | null>(null);

  @Input()
  public set data(value: { label: string; value: number }[]) {
    this.rawData.set(value || []);
  }

  @Input() centerLabel = 'Total Gastos';

  // Paleta de colores vibrantes y modernos
  private readonly colors = [
    '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
    '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4', '#e11d48'
  ];

  public readonly total = computed(() => {
    return this.rawData().reduce((acc, item) => acc + (item.value || 0), 0);
  });

  public readonly slices = computed<DonutSlice[]>(() => {
    const list = this.rawData();
    const tot = this.total();
    if (tot === 0) return [];

    const circumference = 2 * Math.PI * 40; // radio = 40 => ~251.327
    let accumulatedOffset = 0;

    return list.map((item, idx) => {
      const pct = (item.value / tot) * 100;
      const arcLength = (item.value / tot) * circumference;
      const strokeDasharray = `${arcLength} ${circumference - arcLength}`;
      const strokeDashoffset = -accumulatedOffset;
      accumulatedOffset += arcLength;

      return {
        label: item.label,
        value: item.value,
        percentage: pct,
        color: this.colors[idx % this.colors.length],
        strokeDasharray,
        strokeDashoffset
      };
    });
  });

  public readonly hoveredSlice = computed(() => {
    const idx = this.hoveredIndex();
    if (idx === null) return null;
    return this.slices()[idx] ?? null;
  });
}
