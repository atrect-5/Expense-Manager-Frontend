import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TransactionDto, CreateTransactionDto, UpdateTransactionDto, TransactionFilters } from '../models';

/**
 * Servicio para gestión de transacciones (ingresos y gastos).
 */
@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/Transaction`;

  /**
   * Obtiene la lista de transacciones con filtros opcionales.
   */
  public getTransactions(filters?: TransactionFilters): Observable<TransactionDto[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.userId !== undefined && filters.userId !== null) {
        params = params.set('userId', filters.userId.toString());
      }
      if (filters.moneyAccountId !== undefined && filters.moneyAccountId !== null) {
        params = params.set('moneyAccountId', filters.moneyAccountId.toString());
      }
      if (filters.categoryId !== undefined && filters.categoryId !== null) {
        params = params.set('categoryId', filters.categoryId.toString());
      }
      if (filters.startDate) {
        params = params.set('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params = params.set('endDate', filters.endDate);
      }
    }
    return this.http.get<TransactionDto[]>(this.API_URL, { params });
  }

  /**
   * Obtiene una transacción específica por su ID.
   */
  public getTransactionById(id: number): Observable<TransactionDto> {
    return this.http.get<TransactionDto>(`${this.API_URL}/${id}`);
  }

  /**
   * Crea una nueva transacción.
   */
  public createTransaction(dto: CreateTransactionDto): Observable<TransactionDto> {
    return this.http.post<TransactionDto>(this.API_URL, dto);
  }

  /**
   * Actualiza una transacción existente.
   */
  public updateTransaction(id: number, dto: UpdateTransactionDto): Observable<TransactionDto> {
    return this.http.put<TransactionDto>(`${this.API_URL}/${id}`, dto);
  }

  /**
   * Elimina una transacción por su ID.
   */
  public deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
