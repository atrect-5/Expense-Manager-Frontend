import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserDto, CreateUserDto, UpdateUserDto, ChangePasswordDto } from '../models';

/**
 * Servicio para la gestión de usuarios (exclusivo para Administradores según las reglas de negocio).
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/User`;

  /**
   * Obtiene la lista de todos los usuarios (Solo Administradores).
   */
  public getUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.API_URL);
  }

  /**
   * Obtiene un usuario específico por su ID.
   */
  public getUserById(id: number): Observable<UserDto> {
    return this.http.get<UserDto>(`${this.API_URL}/${id}`);
  }

  /**
   * Crea un nuevo usuario.
   */
  public createUser(dto: CreateUserDto): Observable<UserDto> {
    return this.http.post<UserDto>(this.API_URL, dto);
  }

  /**
   * Actualiza los datos de un usuario existente.
   */
  public updateUser(id: number, dto: UpdateUserDto): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.API_URL}/${id}`, dto);
  }

  /**
   * Cambia la contraseña del usuario autenticado.
   */
  public changePassword(dto: ChangePasswordDto): Observable<void> {
    return this.http.put<void>(`${this.API_URL}/me/password`, dto);
  }

  /**
   * Elimina un usuario por su ID.
   */
  public deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
