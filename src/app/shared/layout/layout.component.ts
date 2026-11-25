import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { HeaderComponent } from './header.component';
import { ToastContainerComponent } from '../components/toast-container.component';

/**
 * Layout principal que envuelve las vistas autenticadas.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent, ToastContainerComponent],
  template: `
    <div class="app-layout">
      <!-- Barra lateral -->
      <app-sidebar 
        [isMobileOpen]="isMobileSidebarOpen()" 
        (closeSidebar)="isMobileSidebarOpen.set(false)"
      ></app-sidebar>

      <!-- Fondo móvil cuando la barra lateral está abierta -->
      @if (isMobileSidebarOpen()) {
        <div class="mobile-backdrop animate-fade" (click)="isMobileSidebarOpen.set(false)"></div>
      }

      <!-- Contenedor de contenido central -->
      <div class="app-main-content">
        <app-header (toggleMobile)="isMobileSidebarOpen.update(v => !v)"></app-header>
        
        <main class="page-body animate-fade">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Contenedor de notificaciones flotantes -->
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-app);
      position: relative;
    }
    .app-main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow-x: hidden;
    }
    .page-body {
      flex: 1;
      padding: 1.75rem;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
    }
    .mobile-backdrop {
      display: none;
    }
    @media (max-width: 900px) {
      .mobile-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
        z-index: 95;
      }
      .page-body {
        padding: 1.25rem 1rem;
      }
    }
  `]
})
export class LayoutComponent {
  public readonly isMobileSidebarOpen = signal<boolean>(false);
}
