import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TransferDto, CreateTransferDto, TransferFilters } from '../models';

/**
 * Servicio para gestión de transferencias entre cuentas.
 */
@Injectable({
  providedIn: 'root'
})
export class TransferService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/Transfer`;

  /**
   * Obtiene la lista de transferencias con filtros opcionales.
   */
  public getTransfers(filters?: TransferFilters): Observable<TransferDto[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.userId !== undefined && filters.userId !== null) {
        params = params.set('userId', filters.userId.toString());
      }
      if (filters.moneyAccountId !== undefined && filters.moneyAccountId !== null) {
        params = params.set('moneyAccountId', filters.moneyAccountId.toString());
      }
      if (filters.startDate) {
        params = params.set('startDate', filters.startDate);
      }
      if (filters.endDate) {
        params = params.set('endDate', filters.endDate);
      }
    }
    return this.http.get<TransferDto[]>(this.API_URL, { params });
  }

  /**
   * Obtiene una transferencia específica por su ID.
   */
  public getTransferById(id: number): Observable<TransferDto> {
    return this.http.get<TransferDto>(`${this.API_URL}/${id}`);
  }

  /**
   * Crea una nueva transferencia entre cuentas.
   */
  public createTransfer(dto: CreateTransferDto): Observable<TransferDto> {
    return this.http.post<TransferDto>(this.API_URL, dto);
  }

  /**
   * Elimina una transferencia por su ID.
   */
  public deleteTransfer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
