import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

/**
 * Servicio para gestionar el tema de la aplicación (Claro / Oscuro).
 * Persiste la preferencia en localStorage y aplica la clase 'dark' al elemento raíz html.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'app_theme_preference';
  
  // Señal reactiva con el tema actual
  public readonly theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    // Efecto reactivo para actualizar el DOM cada vez que cambie el tema
    effect(() => {
      const currentTheme = this.theme();
      this.applyTheme(currentTheme);
      try {
        localStorage.setItem(this.STORAGE_KEY, currentTheme);
      } catch (e) {
        console.warn('No se pudo guardar la preferencia de tema en localStorage', e);
      }
    });
  }

  /**
   * Alterna entre tema claro y oscuro.
   */
  public toggleTheme(): void {
    this.theme.update(current => (current === 'dark' ? 'light' : 'dark'));
  }

  /**
   * Establece un tema específico.
   */
  public setTheme(newTheme: Theme): void {
    this.theme.set(newTheme);
  }

  /**
   * Obtiene el tema inicial desde localStorage o la preferencia del sistema operativo.
   */
  private getInitialTheme(): Theme {
    try {
      const savedTheme = localStorage.getItem(this.STORAGE_KEY) as Theme;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
    } catch {
      // Ignorar errores en acceso a storage
    }

    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }

  /**
   * Aplica la clase CSS al documento HTML.
   */
  private applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}
