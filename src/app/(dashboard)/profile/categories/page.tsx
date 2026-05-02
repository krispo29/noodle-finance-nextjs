'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import {
  createTransactionCategory,
  deleteTransactionCategory,
  updateTransactionCategory,
} from '@/app/actions/categories';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { useTransactionCategories } from '@/hooks/useCategories';
import {
  CATEGORY_ICON_OPTIONS,
  CategoryIconName,
  CategoryType,
  TRANSACTION_TYPE_OPTIONS,
  getCategoryIcon,
} from '@/lib/utils/categories';
import type { TransactionCategory } from '@/types';

const typeToneClasses = {
  income: 'text-emerald-700 dark:text-emerald-400',
  expense: 'text-rose-700 dark:text-rose-400',
  owner_withdrawal: 'text-amber-700 dark:text-amber-400',
  owner_topup: 'text-sky-700 dark:text-sky-400',
} as const;

const typeBadgeClasses = {
  income: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  expense: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  owner_withdrawal: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  owner_topup: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
} as const;

type CategoryDraft = {
  label: string;
  iconName: CategoryIconName;
  isActive: boolean;
};

const defaultDraft: CategoryDraft = {
  label: '',
  iconName: 'Receipt',
  isActive: true,
};

const springTap = { type: 'spring', stiffness: 400, damping: 17 } as const;

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useTransactionCategories(true);
  const [activeType, setActiveType] = useState<CategoryType>('expense');
  const [newCategory, setNewCategory] = useState<CategoryDraft>(defaultDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<CategoryDraft>(defaultDraft);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const categoriesByType = useMemo(
    () =>
      TRANSACTION_TYPE_OPTIONS.reduce<Record<CategoryType, TransactionCategory[]>>(
        (acc, type) => {
          acc[type.id] = categories
            .filter((category) => category.type === type.id)
            .sort((a, b) => a.sortOrder - b.sortOrder);
          return acc;
        },
        {
          income: [],
          expense: [],
          owner_withdrawal: [],
          owner_topup: [],
        }
      ),
    [categories]
  );

  const refreshCategories = () =>
    queryClient.invalidateQueries({ queryKey: ['transaction-categories'] });

  const handleCreateCategory = async () => {
    setIsSaving(true);
    setMessage('');
    const result = await createTransactionCategory({
      type: activeType,
      label: newCategory.label,
      iconName: newCategory.iconName,
    });

    if (result.success) {
      setNewCategory(defaultDraft);
      setMessage('เพิ่มหมวดหมู่แล้ว');
      await refreshCategories();
    } else {
      setMessage(result.error || 'เพิ่มหมวดหมู่ไม่สำเร็จ');
    }
    setIsSaving(false);
  };

  const startEditing = (category: TransactionCategory) => {
    setEditingId(category.id);
    setEditDraft({
      label: category.label,
      iconName: category.iconName as CategoryIconName,
      isActive: category.isActive,
    });
    setMessage('');
  };

  const handleUpdateCategory = async (category: TransactionCategory, draft = editDraft) => {
    setIsSaving(true);
    setMessage('');
    const result = await updateTransactionCategory({
      id: category.id,
      label: draft.label,
      iconName: draft.iconName,
      isActive: draft.isActive,
    });

    if (result.success) {
      setEditingId(null);
      setMessage('บันทึกหมวดหมู่แล้ว');
      await refreshCategories();
    } else {
      setMessage(result.error || 'บันทึกหมวดหมู่ไม่สำเร็จ');
    }
    setIsSaving(false);
  };

  const handleToggleActive = (category: TransactionCategory) =>
    handleUpdateCategory(category, {
      label: category.label,
      iconName: category.iconName as CategoryIconName,
      isActive: !category.isActive,
    });

  const handleDeleteCategory = async (category: TransactionCategory) => {
    const shouldDelete = confirm(
      category.transactionCount > 0
        ? 'หมวดหมู่นี้มีรายการที่เคยใช้ ระบบจะปิดใช้งานแทนการลบ ต้องการทำต่อไหม?'
        : 'ต้องการลบหมวดหมู่นี้ใช่ไหม?'
    );
    if (!shouldDelete) return;

    setIsSaving(true);
    setMessage('');
    const result = await deleteTransactionCategory({ id: category.id });
    if (result.success) {
      setMessage(category.transactionCount > 0 || category.isDefault ? 'ปิดใช้งานหมวดหมู่แล้ว' : 'ลบหมวดหมู่แล้ว');
      await refreshCategories();
    } else {
      setMessage(result.error || 'ลบหมวดหมู่ไม่สำเร็จ');
    }
    setIsSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl space-y-10 px-4 pb-32 pt-8 md:px-8"
    >
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <Link href="/profile">
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={springTap}
              className="flex min-h-[44px] items-center gap-2 text-[17px] font-semibold text-apple-blue"
            >
              <ArrowLeft className="h-5 w-5" />
              กลับ
            </motion.span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="max-w-3xl space-y-3">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground">
            Category settings
          </p>
          <h1 className="text-[40px] font-semibold leading-[1.07] text-foreground md:text-[56px]">
            จัดการหมวดหมู่รายการ
          </h1>
          <p className="max-w-2xl text-[21px] font-medium leading-snug text-muted-foreground">
            เพิ่ม แก้ไข ปิดใช้งาน หรือลบหมวดหมู่ โดยข้อมูลเก่าจะยังอยู่ในประวัติและรายงาน
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {TRANSACTION_TYPE_OPTIONS.map((type) => {
            const Icon = type.icon;
            const isActive = activeType === type.id;
            return (
              <motion.button
                key={type.id}
                type="button"
                onClick={() => setActiveType(type.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={springTap}
                className={`flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-[15px] font-semibold transition-all ${
                  isActive
                    ? typeBadgeClasses[type.id]
                    : 'bg-light-gray text-muted-foreground hover:bg-border/30 dark:bg-near-black'
                }`}
              >
                <Icon className="h-4 w-4" />
                {type.shortLabel}
              </motion.button>
            );
          })}
        </div>

        <div className="apple-card space-y-5 p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
            <input
              type="text"
              value={newCategory.label}
              onChange={(event) => setNewCategory((prev) => ({ ...prev, label: event.target.value }))}
              className="min-h-11 rounded-lg border border-border bg-background px-4 py-2 text-[17px] font-medium outline-none focus:ring-2 focus:ring-apple-blue"
              placeholder="ชื่อหมวดหมู่ใหม่"
            />
            <select
              value={newCategory.iconName}
              onChange={(event) =>
                setNewCategory((prev) => ({
                  ...prev,
                  iconName: event.target.value as CategoryIconName,
                }))
              }
              className="min-h-11 rounded-lg border border-border bg-background px-4 py-2 text-[17px] font-medium outline-none focus:ring-2 focus:ring-apple-blue"
            >
              {CATEGORY_ICON_OPTIONS.map((icon) => (
                <option key={icon.id} value={icon.id}>
                  {icon.label}
                </option>
              ))}
            </select>
            <motion.button
              type="button"
              onClick={handleCreateCategory}
              disabled={isSaving || newCategory.label.trim().length === 0}
              whileHover={isSaving || newCategory.label.trim().length === 0 ? undefined : { scale: 1.02 }}
              whileTap={isSaving || newCategory.label.trim().length === 0 ? undefined : { scale: 0.97 }}
              transition={springTap}
              className="btn-primary min-h-[44px] rounded-lg px-5 disabled:opacity-50"
            >
              <Plus className="mr-2 h-4 w-4" />
              เพิ่ม
            </motion.button>
          </div>
          {message && <p className="text-[14px] font-semibold text-muted-foreground">{message}</p>}
        </div>
      </section>

      <section className="space-y-4">
        {isLoading ? (
          <div className="apple-card space-y-4 p-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : categoriesByType[activeType].length === 0 ? (
          <div className="apple-card flex flex-col items-center justify-center gap-3 border border-dashed border-border/50 py-16 text-center text-muted-foreground">
            <Tags className="h-12 w-12 rounded-full bg-apple-blue/10 p-3 text-apple-blue" />
            <p className="text-[21px] font-bold text-foreground">ยังไม่มีหมวดหมู่ในประเภทนี้</p>
            <p className="text-[17px] font-medium">เพิ่มชื่อหมวดหมู่ด้านบนเพื่อเริ่มใช้งาน</p>
          </div>
        ) : (
          categoriesByType[activeType].map((category) => {
            const Icon = getCategoryIcon(category.iconName);
            const isEditing = editingId === category.id;

            return (
              <div key={category.id} className="apple-card p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-background dark:bg-black/30">
                      <Icon className={`h-5 w-5 ${typeToneClasses[category.type]}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                          <input
                            type="text"
                            value={editDraft.label}
                            onChange={(event) =>
                              setEditDraft((prev) => ({ ...prev, label: event.target.value }))
                            }
                            className="min-h-11 rounded-lg border border-border bg-background px-4 py-2 text-[17px] font-medium outline-none focus:ring-2 focus:ring-apple-blue"
                          />
                          <select
                            value={editDraft.iconName}
                            onChange={(event) =>
                              setEditDraft((prev) => ({
                                ...prev,
                                iconName: event.target.value as CategoryIconName,
                              }))
                            }
                            className="min-h-11 rounded-lg border border-border bg-background px-4 py-2 text-[17px] font-medium outline-none focus:ring-2 focus:ring-apple-blue"
                          >
                            {CATEGORY_ICON_OPTIONS.map((icon) => (
                              <option key={icon.id} value={icon.id}>
                                {icon.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <>
                          <p className="truncate text-[17px] font-bold">{category.label}</p>
                          <p className="text-[12px] font-semibold text-muted-foreground">
                            {category.isDefault ? 'หมวดเริ่มต้น' : 'หมวดที่สร้างเอง'} · ใช้แล้ว{' '}
                            {category.transactionCount} รายการ · {category.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                      <>
                        <motion.button
                          type="button"
                          onClick={() => handleUpdateCategory(category)}
                          disabled={isSaving || editDraft.label.trim().length === 0}
                          whileHover={isSaving || editDraft.label.trim().length === 0 ? undefined : { scale: 1.02 }}
                          whileTap={isSaving || editDraft.label.trim().length === 0 ? undefined : { scale: 0.97 }}
                          transition={springTap}
                          className="btn-primary min-h-[44px] rounded-lg px-4 disabled:opacity-50"
                        >
                          <Check className="mr-2 h-4 w-4" />
                          บันทึก
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => setEditingId(null)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          transition={springTap}
                          className="btn-outline min-h-[44px] rounded-lg px-4"
                        >
                          ยกเลิก
                        </motion.button>
                      </>
                    ) : (
                      <>
                        <motion.button
                          type="button"
                          onClick={() => startEditing(category)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          transition={springTap}
                          className="btn-outline min-h-[44px] rounded-lg px-4"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          แก้ไข
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => handleToggleActive(category)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          transition={springTap}
                          className="min-h-[44px] rounded-lg bg-light-gray px-4 text-[15px] font-semibold text-foreground transition-colors hover:bg-border/30 dark:bg-near-black"
                        >
                          {category.isActive ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                        </motion.button>
                        <motion.button
                          type="button"
                          onClick={() => handleDeleteCategory(category)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          transition={springTap}
                          className="min-h-[44px] rounded-lg bg-rose-50 px-4 text-[15px] font-semibold text-rose-700 transition-colors hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-300"
                        >
                          <Trash2 className="mr-2 inline h-4 w-4" />
                          ลบ
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </motion.div>
  );
}
