/**
 * Format currency amount in Thai Baht style
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "฿1,250")
 */
export function formatCurrency(amount: number): string {
  // Check if amount is a whole number
  if (Number.isInteger(amount)) {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // For decimal amounts
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
