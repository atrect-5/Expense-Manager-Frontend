import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MoneyAccountDto, CreateMoneyAccountDto, UpdateMoneyAccountDto, MoneyAccountFilters } from '../models';

/**
 * Servicio para la gestión de cuentas de dinero (efectivo, débito, crédito).
 */
@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/MoneyAccount`;

  /**
   * Obtiene la lista de cuentas con filtros opcionales.
   */
  public getAccounts(filters?: MoneyAccountFilters): Observable<MoneyAccountDto[]> {
    let params = new HttpParams();
    if (filters?.userId !== undefined && filters?.userId !== null) {
      params = params.set('userId', filters.userId.toString());
    }
    return this.http.get<MoneyAccountDto[]>(this.API_URL, { params });
  }

  /**
   * Obtiene una cuenta específica por su ID.
   */
  public getAccountById(id: number): Observable<MoneyAccountDto> {
    return this.http.get<MoneyAccountDto>(`${this.API_URL}/${id}`);
  }

  /**
   * Crea una nueva cuenta de dinero.
   */
  public createAccount(dto: CreateMoneyAccountDto): Observable<MoneyAccountDto> {
    return this.http.post<MoneyAccountDto>(this.API_URL, dto);
  }

  /**
   * Actualiza una cuenta de dinero existente.
   */
  public updateAccount(id: number, dto: UpdateMoneyAccountDto): Observable<MoneyAccountDto> {
    return this.http.put<MoneyAccountDto>(`${this.API_URL}/${id}`, dto);
  }

  /**
   * Elimina una cuenta de dinero por su ID.
   */
  public deleteAccount(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
