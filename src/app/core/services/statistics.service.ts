import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FinancialSummaryDto, CategorySummaryDto, MonthlyFlowDto } from '../models';

/**
 * Servicio para consultar resúmenes financieros y estadísticas analíticas de los usuarios.
 */
@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private readonly http = inject(HttpClient);
  private readonly BASE_URL = `${environment.apiUrl}/users`;

  /**
   * Obtiene el resumen financiero global (saldo en efectivo, límite y uso de crédito).
   */
  public getFinancialSummary(userId: number): Observable<FinancialSummaryDto> {
    return this.http.get<FinancialSummaryDto>(`${this.BASE_URL}/${userId}/summary`);
  }

  /**
   * Obtiene el desglose de gastos agrupados por categoría en un rango de fechas,
   * con soporte para limitar a las 'N' categorías con mayor gasto.
   */
  public getSpendingByCategory(
    userId: number,
    startDate?: string,
    endDate?: string,
    limit?: number
  ): Observable<CategorySummaryDto[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (limit !== undefined && limit !== null && limit > 0) params = params.set('limit', limit.toString());

    return this.http.get<CategorySummaryDto[]>(
      `${this.BASE_URL}/${userId}/statistics/spending-by-category`,
      { params }
    );
  }

  /**
   * Obtiene el desglose de ingresos agrupados por categoría en un período de tiempo.
   */
  public getIncomeByCategory(
    userId: number,
    startDate?: string,
    endDate?: string
  ): Observable<CategorySummaryDto[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<CategorySummaryDto[]>(
      `${this.BASE_URL}/${userId}/statistics/income-by-category`,
      { params }
    );
  }

  /**
   * Obtiene el flujo de efectivo mensual (ingresos vs gastos vs neto) histórico o del año.
   */
  public getMonthlyCashFlow(userId: number): Observable<MonthlyFlowDto[]> {
    return this.http.get<MonthlyFlowDto[]>(
      `${this.BASE_URL}/${userId}/statistics/monthly-cash-flow`
    );
  }
}
