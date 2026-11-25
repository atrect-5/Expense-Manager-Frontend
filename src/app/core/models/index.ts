/**
 * Definiciones de tipos y modelos de datos basados en la especificación OpenAPI (docs/openapi.json).
 * Centralizados aquí para evitar duplicación de código en la aplicación.
 */

// ==========================================
// Roles y Usuario
// ==========================================

export type UserRole = 'User' | 'Admin';

export interface UserDto {
  id: number;
  name: string;
  email: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserDto {
  name?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

// ==========================================
// Categorías
// ==========================================

export type CategoryType = 'INCOME' | 'EXPENDITURE';

export interface CategoryDto {
  id: number;
  name: string;
  type: CategoryType;
  userId?: number;
}

export interface CreateCategoryDto {
  name: string;
  type: CategoryType;
  userId?: number;
}

export interface UpdateCategoryDto {
  name: string;
  type: CategoryType;
}

export interface CategoryFilters {
  userId?: number;
  nameFilter?: string;
  typeFilter?: CategoryType;
}

// ==========================================
// Cuentas de Dinero (MoneyAccount)
// ==========================================

export type AccountType = 'CASH' | 'DEBIT' | 'CREDIT';

export interface MoneyAccountDto {
  id: number;
  name: string;
  accountType: AccountType;
  balance: number;
  creditLimit?: number | null;
  userId: number;
}

export interface CreateMoneyAccountDto {
  name: string;
  accountType: AccountType;
  balance?: number;
  creditLimit?: number | null;
  userId?: number;
}

export interface UpdateMoneyAccountDto {
  name: string;
  accountType: AccountType;
  creditLimit?: number | null;
}

export interface MoneyAccountFilters {
  userId?: number;
}

// ==========================================
// Transacciones
// ==========================================

export interface TransactionDto {
  id: number;
  amount: number;
  date?: string;
  description?: string;
  userId: number;
  categoryId: number;
  moneyAccountId: number;
  transferId?: number | null;
}

export interface CreateTransactionDto {
  amount: number;
  date?: string;
  description?: string;
  userId: number;
  categoryId: number;
  moneyAccountId: number;
}

export interface UpdateTransactionDto {
  amount: number;
  date: string;
  description?: string;
  categoryId: number;
  moneyAccountId: number;
}

export interface TransactionFilters {
  userId?: number;
  moneyAccountId?: number;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
}

// ==========================================
// Transferencias
// ==========================================

export interface TransferDto {
  id: number;
  amount: number;
  date?: string;
  description?: string;
  userId: number;
  moneyAccountSendId: number;
  moneyAccountReceiveId: number;
  transactions?: TransactionDto[];
}

export interface CreateTransferDto {
  amount: number;
  date?: string;
  description?: string;
  userId: number;
  moneyAccountSendId: number;
  moneyAccountReceiveId: number;
}

export interface TransferFilters {
  userId?: number;
  moneyAccountId?: number;
  startDate?: string;
  endDate?: string;
}

// ==========================================
// Estadísticas y Resúmenes Financieros
// ==========================================

export interface FinancialSummaryDto {
  totalCashBalance?: number;
  totalCreditLimit?: number;
  totalCreditUsed?: number;
}

export interface CategorySummaryDto {
  categoryId: number;
  categoryName: string;
  totalAmount: number;
}

export interface MonthlyFlowDto {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
}

// ==========================================
// Errores del Backend (ProblemDetails)
// ==========================================

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}
