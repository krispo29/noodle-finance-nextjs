import { TransactionType } from '@/types';
import { create } from 'zustand';

interface AppState {
  // Active tab in navigation
  activeTab: 'dashboard' | 'add' | 'history' | 'monthly';
  setActiveTab: (tab: 'dashboard' | 'add' | 'history' | 'monthly') => void;

  // Transaction type toggle (income/expense)
  transactionType: TransactionType;
  setTransactionType: (type: TransactionType) => void;

  // Selected category for transaction
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;

  // Reset form state
  resetForm: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  activeTab: 'dashboard',
  transactionType: 'income',
  selectedCategory: '',

  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setTransactionType: (type) => set({ 
    transactionType: type,
    selectedCategory: '' // Reset category when type changes
  }),
  
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  resetForm: () => set({ 
    transactionType: 'income',
    selectedCategory: '' 
  }),
}));
