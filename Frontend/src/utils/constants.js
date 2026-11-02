export const CURRENCIES = {
  USD: { symbol: '$', code: 'USD', name: 'US Dollar (USD)' },
  EUR: { symbol: '€', code: 'EUR', name: 'Euro (EUR)' },
  GBP: { symbol: '£', code: 'GBP', name: 'British Pound (GBP)' },
  INR: { symbol: '₹', code: 'INR', name: 'Indian Rupee (INR)' },
  CAD: { symbol: 'CA$', code: 'CAD', name: 'Canadian Dollar (CAD)' },
  AUD: { symbol: 'AU$', code: 'AUD', name: 'Australian Dollar (AUD)' },
  JPY: { symbol: '¥', code: 'JPY', name: 'Japanese Yen (JPY)' },
  CHF: { symbol: 'CHF', code: 'CHF', name: 'Swiss Franc (CHF)' },
  CNY: { symbol: 'CN¥', code: 'CNY', name: 'Chinese Yuan (CNY)' },
};

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Housing & Rent',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities & Bills',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Other',
];

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance & Consulting',
  'Investments & Dividends',
  'Business Profit',
  'Gifts & Grants',
  'Rental Income',
  'Other Income',
];

export const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'Cash',
  'UPI',
  'Other',
];

export const CATEGORY_COLORS = {
  'Food & Dining': '#F97316',
  'Housing & Rent': '#8B5CF6',
  'Transportation': '#3B82F6',
  'Shopping': '#EC4899',
  'Entertainment': '#A855F7',
  'Utilities & Bills': '#06B6D4',
  'Healthcare': '#10B981',
  'Education': '#6366F1',
  'Travel': '#F59E0B',
  'Personal Care': '#14B8A6',
  'Other': '#64748B',
  'Salary': '#10B981',
  'Freelance & Consulting': '#34D399',
  'Investments & Dividends': '#22D3EE',
  'Business Profit': '#059669',
  'Gifts & Grants': '#A7F3D0',
  'Rental Income': '#6EE7B7',
  'Other Income': '#94A3B8',
  'Food': '#F97316',
  'Housing': '#8B5CF6',
  'Transport': '#3B82F6',
  'Utilities': '#06B6D4',
};

/**
 * Format currency with locale intelligence
 */
export const formatCurrency = (amount, currencyCode = 'USD') => {
  const num = Number(amount) || 0;
  const currency = CURRENCIES[currencyCode] ? currencyCode : 'USD';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch (e) {
    const symbol = CURRENCIES[currency]?.symbol || '$';
    return `${symbol}${num.toFixed(2)}`;
  }
};

/**
 * Format date based on user preferences
 */
export const formatDate = (dateString, format = 'YYYY-MM-DD') => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');

  if (format === 'DD/MM/YYYY') return `${dd}/${mm}/${yyyy}`;
  if (format === 'MM/DD/YYYY') return `${mm}/${dd}/${yyyy}`;
  return `${yyyy}-${mm}-${dd}`;
};
