# a5-em — Frontend de Gestión de Gastos

Aplicación web desarrollada con **Angular** y **TypeScript** para el control y administración de finanzas personales. Permite gestionar cuentas bancarias y de efectivo, registrar ingresos y gastos, organizar categorías, realizar transferencias entre cuentas y visualizar estadísticas financieras interactivas.

Este frontend consume la API REST desarrollada en ASP.NET Core disponible en:  
🔗 **[Course-WEB-API-.NET-CORE](https://github.com/atrect-5/Course-WEB-API-.NET-CORE)**

---

## ✨ Características Principales

- **Autenticación y Seguridad**: Inicio de sesión y registro de usuarios mediante cookies `HttpOnly` (JWT + Refresh Token) y protección CSRF con el encabezado `X-CSRF-TOKEN` en solicitudes modificadoras (`POST`, `PUT`, `DELETE`).
- **Control de Roles**:
  - **Usuario**: Gestión completa de sus propias cuentas, transacciones, categorías y transferencias.
  - **Administrador**: Acceso global para inspeccionar y administrar registros de todos los usuarios, además de un módulo exclusivo para la gestión de usuarios.
- **Dashboard Analítico**: Tarjetas de resumen financiero, gráfico Donut interactivo de gastos/ingresos por categoría con filtros por fecha y límite, y gráfico de barras de flujo de efectivo mensual.
- **Tema Claro / Oscuro**: Alternancia fluida entre modo claro y oscuro con persistencia en `localStorage`.

---

## ⚙️ Requisitos y Configuración

### 1. Prerrequisitos
- **Node.js** (v20 o superior recomendado)
- **pnpm** (o `npm`)
- Tener en ejecución el backend de la API: [Course-WEB-API-.NET-CORE](https://github.com/atrect-5/Course-WEB-API-.NET-CORE)

### 2. Instalación
Clona el repositorio e instala las dependencias:

```bash
pnpm install
# o con npm:
npm install
```

### 3. Configuración de la URL de la API
Para desarrollo local, configura la URL donde corre tu backend ASP.NET Core en `src/environments/environment.development.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7219/api' // Ajusta el puerto según tu perfil de launchSettings.json
};
```

> **Nota sobre CORS y Cookies**: Asegúrate de que el backend tenga habilitado CORS para el origen del frontend (`http://localhost:4200`) con `AllowCredentials()` para permitir el envío de cookies `HttpOnly` y el token `X-CSRF-TOKEN`.

### 4. Ejecutar en Desarrollo
```bash
npm start
```
La aplicación estará disponible en `http://localhost:4200/`.


---

## 📁 Estructura del Proyecto

```text
├── docs/
│   └── openapi.json                  # Especificación OpenAPI de la API REST
├── src/
│   ├── environments/                 # Configuración de URLs por entorno (dev / prod)
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/               # Protección de rutas (authGuard, adminGuard)
│   │   │   ├── interceptors/         # Inyección de withCredentials y X-CSRF-TOKEN
│   │   │   ├── models/               # Interfaces y DTOs tipados
│   │   │   └── services/             # Servicios HTTP, autenticación, tema y notificaciones
│   │   ├── features/
│   │   │   ├── accounts/             # Gestión de cuentas (Efectivo, Débito, Crédito)
│   │   │   ├── auth/                 # Pantalla de inicio de sesión y registro
│   │   │   ├── categories/           # Gestión de categorías (INCOME / EXPENDITURE)
│   │   │   ├── dashboard/            # Resumen financiero y gráficos estadísticos
│   │   │   ├── settings/             # Ajustes de tema y detalles de sesión
│   │   │   ├── transactions/         # Registro y filtrado de transacciones
│   │   │   ├── transfers/            # Transferencias entre cuentas
│   │   │   └── users/                # Administración de usuarios (solo Admin)
│   │   ├── shared/
│   │   │   ├── components/           # Modales, diálogos, gráficos SVG, toasts, tarjetas
│   │   │   └── layout/               # Sidebar, Header y Layout principal
│   │   ├── app.config.ts             # Proveedores globales (Router, HttpClient + Interceptor)
│   │   └── app.routes.ts             # Definición de rutas con carga perezosa (lazy loading)
│   └── styles.css                    # Sistema de diseño, variables CSS (claro/oscuro) y animaciones
└── angular.json                      # Configuración de compilación y reemplazo de entornos
```
