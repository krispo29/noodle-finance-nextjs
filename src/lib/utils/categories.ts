import {
  Car,
  Heart,
  Home,
  Package,
  Receipt,
  ShoppingBag,
  Snowflake,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  Wrench,
  Zap,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export const CATEGORY_ICON_COMPONENTS = {
  Car,
  Heart,
  Home,
  Package,
  Receipt,
  ShoppingBag,
  Snowflake,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  Wrench,
  Zap,
} as const;

export type CategoryIconName = keyof typeof CATEGORY_ICON_COMPONENTS;
export type CategoryType = 'income' | 'expense' | 'owner_withdrawal' | 'owner_topup';

export const CATEGORY_ICON_NAMES = Object.keys(
  CATEGORY_ICON_COMPONENTS
) as CategoryIconName[];

export const CATEGORY_ICON_OPTIONS = CATEGORY_ICON_NAMES.map((iconName) => ({
  id: iconName,
  label: iconName,
  icon: CATEGORY_ICON_COMPONENTS[iconName],
}));

export interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  iconName: CategoryIconName;
}

export interface TransactionTypeOption {
  id: CategoryType;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  tone: 'emerald' | 'rose' | 'amber' | 'sky';
}

export interface DefaultTransactionCategory extends Omit<Category, 'icon'> {
  type: CategoryType;
  sortOrder: number;
}

function createCategory(id: string, label: string, iconName: CategoryIconName): Category {
  return {
    id,
    label,
    iconName,
    icon: CATEGORY_ICON_COMPONENTS[iconName],
  };
}

export function getCategoryIcon(iconName?: string): LucideIcon {
  if (iconName && iconName in CATEGORY_ICON_COMPONENTS) {
    return CATEGORY_ICON_COMPONENTS[iconName as CategoryIconName];
  }
  return Receipt;
}

export const INCOME_CATEGORIES: Category[] = [
  createCategory('sales', 'ขายของ', 'UtensilsCrossed'),
  createCategory('service', 'บริการ', 'Wrench'),
  createCategory('other_income', 'รายได้อื่น', 'TrendingUp'),
];

export const EXPENSE_CATEGORIES: Category[] = [
  createCategory('ingredients', 'วัตถุดิบ', 'Package'),
  createCategory('supplies', 'อุปกรณ์', 'ShoppingBag'),
  createCategory('ice', 'ค่าน้ำแข็ง', 'Snowflake'),
  createCategory('utilities', 'ค่าน้ำค่าไฟ', 'Zap'),
  createCategory('transport', 'ค่าเดินทาง', 'Car'),
  createCategory('salary', 'เงินเดือน', 'Wallet'),
  createCategory('maintenance', 'ซ่อมบำรุง', 'Wrench'),
  createCategory('other_expense', 'อื่น ๆ', 'Receipt'),
];

export const OWNER_WITHDRAWAL_CATEGORIES: Category[] = [
  createCategory('home_expense', 'ถอนใช้ในบ้าน', 'Home'),
  createCategory('personal_use', 'ใช้ส่วนตัว', 'Heart'),
  createCategory('family_support', 'ให้คนในบ้าน', 'Wallet'),
];

export const OWNER_TOPUP_CATEGORIES: Category[] = [
  createCategory('cash_topup', 'เติมเงินสดเข้าร้าน', 'Wallet'),
  createCategory('emergency_topup', 'เติมเงินฉุกเฉิน', 'Heart'),
  createCategory('working_capital', 'เงินหมุนร้าน', 'ShoppingBag'),
];

export const DEFAULT_TRANSACTION_CATEGORIES: DefaultTransactionCategory[] = [
  ...INCOME_CATEGORIES.map((category, index) => ({
    id: category.id,
    label: category.label,
    iconName: category.iconName,
    type: 'income' as const,
    sortOrder: index,
  })),
  ...EXPENSE_CATEGORIES.map((category, index) => ({
    id: category.id,
    label: category.label,
    iconName: category.iconName,
    type: 'expense' as const,
    sortOrder: index,
  })),
  ...OWNER_WITHDRAWAL_CATEGORIES.map((category, index) => ({
    id: category.id,
    label: category.label,
    iconName: category.iconName,
    type: 'owner_withdrawal' as const,
    sortOrder: index,
  })),
  ...OWNER_TOPUP_CATEGORIES.map((category, index) => ({
    id: category.id,
    label: category.label,
    iconName: category.iconName,
    type: 'owner_topup' as const,
    sortOrder: index,
  })),
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
