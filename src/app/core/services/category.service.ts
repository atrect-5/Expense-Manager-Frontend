import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryDto, CreateCategoryDto, UpdateCategoryDto, CategoryFilters } from '../models';

/**
 * Servicio para gestión de categorías de ingresos y gastos.
 */
@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/Category`;

  /**
   * Obtiene la lista de categorías con filtros opcionales.
   */
  public getCategories(filters?: CategoryFilters): Observable<CategoryDto[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.userId !== undefined && filters.userId !== null) {
        params = params.set('userId', filters.userId.toString());
      }
      if (filters.nameFilter && filters.nameFilter.trim() !== '') {
        params = params.set('nameFilter', filters.nameFilter.trim());
      }
      if (filters.typeFilter) {
        params = params.set('typeFilter', filters.typeFilter);
      }
    }
    return this.http.get<CategoryDto[]>(this.API_URL, { params });
  }

  /**
   * Obtiene una categoría específica por su ID.
   */
  public getCategoryById(id: number): Observable<CategoryDto> {
    return this.http.get<CategoryDto>(`${this.API_URL}/${id}`);
  }

  /**
   * Crea una nueva categoría.
   */
  public createCategory(dto: CreateCategoryDto): Observable<CategoryDto> {
    return this.http.post<CategoryDto>(this.API_URL, dto);
  }

  /**
   * Actualiza una categoría existente.
   */
  public updateCategory(id: number, dto: UpdateCategoryDto): Observable<CategoryDto> {
    return this.http.put<CategoryDto>(`${this.API_URL}/${id}`, dto);
  }

  /**
   * Elimina una categoría por su ID.
   */
  public deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
