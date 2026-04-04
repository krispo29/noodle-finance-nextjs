import {
  Car,
  Heart,
  Home,
  Package,
  Receipt,
  ShoppingBag,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  Wrench,
  Zap,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
}

export interface TransactionTypeOption {
  id: 'income' | 'expense' | 'owner_withdrawal' | 'owner_topup';
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  tone: 'emerald' | 'rose' | 'amber' | 'sky';
}

export const INCOME_CATEGORIES: Category[] = [
  { id: 'sales', label: 'ขายของ', icon: UtensilsCrossed },
  { id: 'service', label: 'บริการ', icon: Wrench },
  { id: 'other_income', label: 'รายได้อื่น', icon: TrendingUp },
];

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'ingredients', label: 'วัตถุดิบ', icon: Package },
  { id: 'supplies', label: 'อุปกรณ์', icon: ShoppingBag },
  { id: 'rent', label: 'ค่าเช่า', icon: Home },
  { id: 'utilities', label: 'ค่าน้ำค่าไฟ', icon: Zap },
  { id: 'transport', label: 'ค่าเดินทาง', icon: Car },
  { id: 'salary', label: 'เงินเดือน', icon: Wallet },
  { id: 'maintenance', label: 'ซ่อมบำรุง', icon: Wrench },
  { id: 'other_expense', label: 'อื่น ๆ', icon: Receipt },
];

export const OWNER_WITHDRAWAL_CATEGORIES: Category[] = [
  { id: 'home_expense', label: 'ถอนใช้ในบ้าน', icon: Home },
  { id: 'personal_use', label: 'ใช้ส่วนตัว', icon: Heart },
  { id: 'family_support', label: 'ให้คนในบ้าน', icon: Wallet },
];

export const OWNER_TOPUP_CATEGORIES: Category[] = [
  { id: 'cash_topup', label: 'เติมเงินสดเข้าร้าน', icon: Wallet },
  { id: 'emergency_topup', label: 'เติมเงินฉุกเฉิน', icon: Heart },
  { id: 'working_capital', label: 'เงินหมุนร้าน', icon: ShoppingBag },
];

export const TRANSACTION_TYPE_OPTIONS: TransactionTypeOption[] = [
  {
    id: 'income',
    label: 'รายรับจากร้าน',
    shortLabel: 'รายรับ',
    icon: TrendingUp,
    tone: 'emerald',
  },
  {
    id: 'expense',
    label: 'รายจ่ายร้าน',
    shortLabel: 'รายจ่าย',
    icon: Receipt,
    tone: 'rose',
  },
  {
    id: 'owner_withdrawal',
    label: 'ถอนใช้ส่วนตัว',
    shortLabel: 'ถอนใช้',
    icon: Wallet,
    tone: 'amber',
  },
  {
    id: 'owner_topup',
    label: 'เติมเงินเข้าร้าน',
    shortLabel: 'เติมร้าน',
    icon: ShoppingBag,
    tone: 'sky',
  },
];

export function getCategoriesByTransactionType(type: TransactionTypeOption['id']) {
  switch (type) {
    case 'income':
      return INCOME_CATEGORIES;
    case 'expense':
      return EXPENSE_CATEGORIES;
    case 'owner_withdrawal':
      return OWNER_WITHDRAWAL_CATEGORIES;
    case 'owner_topup':
      return OWNER_TOPUP_CATEGORIES;
    default:
      return [];
  }
}

export function getTransactionTypeMeta(type: TransactionTypeOption['id']) {
  return (
    TRANSACTION_TYPE_OPTIONS.find((option) => option.id === type) ??
    TRANSACTION_TYPE_OPTIONS[0]
  );
}
