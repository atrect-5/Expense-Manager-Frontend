import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}

/**
 * Servicio para emitir notificaciones emergentes (toasts) limpias y animadas.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public readonly toasts = signal<ToastMessage[]>([]);

  /**
   * Muestra un mensaje exitoso.
   */
  public success(message: string, title = 'Operación Exitosa'): void {
    this.show('success', title, message);
  }

  /**
   * Muestra un mensaje de error.
   */
  public error(message: string, title = 'Error'): void {
    this.show('error', title, message, 6000);
  }

  /**
   * Muestra una advertencia.
   */
  public warning(message: string, title = 'Atención'): void {
    this.show('warning', title, message);
  }

  /**
   * Muestra un mensaje informativo.
   */
  public info(message: string, title = 'Información'): void {
    this.show('info', title, message);
  }

  /**
   * Agrega un nuevo toast a la lista y programa su auto-cierre.
   */
  public show(type: ToastType, title: string, message: string, duration = 4000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastMessage = { id, type, title, message, duration };

    this.toasts.update(current => [...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  /**
   * Cierra manualmente un toast por su ID.
   */
  public dismiss(id: string): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}
