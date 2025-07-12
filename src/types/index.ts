export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

// ========================================
// ACCOUNT TYPES
// ========================================

export interface Account {
  id: string;
  balance: number;
  createdAt?: string;
  user?: User;
}

export interface AccountForTransaction {
  id: string;
  user?: User;
}

// ========================================
// TRANSACTION TYPES
// ========================================

export type TransactionType = 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'REVERSAL';

export type TransactionSign = 'positive' | 'negative' | 'neutral';

export interface Transaction {
  id: string;
  amount: string;
  type: TransactionType;
  description?: string;
  createdAt: string;
  account: AccountForTransaction;
  senderAccount?: AccountForTransaction;
  receiverAccount?: AccountForTransaction;
  reversedTransactionId?: string | null;
  reversedTransaction?: Transaction | null;
}

export interface TransactionDetails {
  description: string;
  amount: string;
  sign: TransactionSign;
}

// ========================================
// API REQUEST/RESPONSE TYPES
// ========================================

export interface DepositRequest {
  accountId: string;
  amount: number;
}

export interface TransferRequest {
  sourceAccountId: string;
  targetEmail: string;
  amount: number;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
}

export interface DepositResponse extends ApiResponse {
  newBalance?: number;
}

export interface TransferResponse extends ApiResponse {
  newBalance?: number;
  transactionId?: string;
}

export interface RegisterResponse extends ApiResponse {
  id?: string;
  name?: string;
  email?: string;
}

export interface ReversalResponse extends ApiResponse {
  reversalTransaction?: Transaction;
}

// ========================================
// COMPONENT PROPS TYPES
// ========================================

export interface DepositFormProps {
  accountId: string;
}

export interface TransferFormProps {
  accountId: string;
}

// ========================================
// FORM VALIDATION TYPES
// ========================================

export interface FormValidationResult {
  isValid: boolean;
  error?: string;
}

// ========================================
// UTILITY TYPES
// ========================================

export type LoadingState = boolean;

export type MessageType = 'success' | 'error' | 'info';

export interface FormMessage {
  text: string;
  type: MessageType;
}

// ========================================
// SWR FETCHER TYPE
// ========================================

export type SWRFetcher<T> = (url: string) => Promise<T>;

// ========================================
// THEME TYPES
// ========================================

export type Theme = 'light' | 'dark';

// ========================================
// SESSION TYPES (NextAuth)
// ========================================

export interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}
