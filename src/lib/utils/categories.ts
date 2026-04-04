import {
  UtensilsCrossed,
  ShoppingBag,
  Wallet,
  TrendingUp,
  Car,
  Home,
  Zap,
  Phone,
  Wrench,
  Heart,
  Package,
  Receipt,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
}

// Income categories
export const INCOME_CATEGORIES: Category[] = [
  { id: 'sales', label: 'ขายของ', icon: UtensilsCrossed },
  { id: 'service', label: 'บริการ', icon: Wrench },
  { id: 'other_income', label: 'รายได้อื่น', icon: TrendingUp },
];

// Expense categories
export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'ingredients', label: 'วัตถุดิบ', icon: Package },
  { id: 'supplies', label: 'อุปกรณ์', icon: ShoppingBag },
  { id: 'rent', label: 'ค่าเช่า', icon: Home },
  { id: 'utilities', label: 'ค่าไฟ/น้ำ', icon: Zap },
  { id: 'transport', label: 'ค่าเดินทาง', icon: Car },
  { id: 'salary', label: 'เงินเดือน', icon: Wallet },
  { id: 'maintenance', label: 'ซ่อมบำรุง', icon: Wrench },
  { id: 'other_expense', label: 'อื่นๆ', icon: Receipt },
];
