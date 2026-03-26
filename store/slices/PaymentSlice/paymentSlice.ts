import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type VIPPlan = 'free' | 'basic' | 'premium' | 'vip';
export type PaymentTransactionStatus =
  | 'pending'
  | 'success'
  | 'failed'
  | 'cancelled'
  | 'timeout';

export interface VIPSubscription {
  status: 'active' | 'expired' | 'inactive';
  plan: VIPPlan;
  startDate: string;
  expiryDate: string;
  autoRenewal: boolean;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  plan: VIPPlan;
  status: PaymentTransactionStatus;
  createdAt: string;
}

interface PaymentState {
  subscription: VIPSubscription | null;
  transactions: PaymentTransaction[];
  loading: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  subscription: {
    status: 'inactive',
    plan: 'free',
    startDate: new Date().toISOString(),
    expiryDate: new Date().toISOString(),
    autoRenewal: false,
  },
  transactions: [],
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setSubscription: (state, action: PayloadAction<VIPSubscription>) => {
      state.subscription = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addTransaction: (state, action: PayloadAction<PaymentTransaction>) => {
      state.transactions.push(action.payload);
    },
    setTransactions: (state, action: PayloadAction<PaymentTransaction[]>) => {
      state.transactions = action.payload;
    },
    updateTransactionStatus: (
      state,
      action: PayloadAction<{ id: string; status: PaymentTransactionStatus }>
    ) => {
      const transaction = state.transactions.find((t) => t.id === action.payload.id);
      if (transaction) {
        transaction.status = action.payload.status;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setSubscription,
  setLoading,
  setError,
  addTransaction,
  setTransactions,
  updateTransactionStatus,
  clearError,
} = paymentSlice.actions;
export default paymentSlice.reducer;
