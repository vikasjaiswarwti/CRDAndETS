// ─── Alias Registry ───────────────────────────────────────────────────────────
// Maps real-world language that users type → menu vocabulary.
// Extend this file to add new domain aliases. No other file changes needed.
// Open/Closed Principle: open for extension (add entries), closed for modification.

import type { AliasMap } from '../types/command-palette.types';

/**
 * Domain alias expansion map.
 *
 * Key:   the menu title (exactly as returned from backend menuName)
 * Value: array of alias strings users might type instead
 *
 * Strategy:
 * 1. Common alternate names ("employees" → "staff", "people", "workforce")
 * 2. Task-oriented phrases ("create invoice" → "billing", "raise bill")
 * 3. Industry jargon ("roster" → "Scheduling")
 * 4. Abbreviations ("PO" → "Purchase Order")
 */
export const ALIAS_REGISTRY: AliasMap = {
  // ── HR / People ──────────────────────────────────────────────────────────
  'Employees': [
    'staff', 'people', 'workforce', 'team members', 'headcount',
    'employee list', 'personnel', 'worker', 'HR records',
  ],
  'Scheduling': [
    'roster', 'employee roster', 'shift planning', 'weekly shift',
    'schedule employee', 'fill roster', 'shifts', 'timetable',
    'duty chart', 'work schedule',
  ],
  'Leave Management': [
    'leave', 'time off', 'PTO', 'vacation', 'sick leave', 'absence',
    'holiday request', 'leave request', 'leave balance',
  ],
  'Payroll': [
    'salary', 'pay slip', 'payslip', 'wages', 'compensation',
    'pay run', 'salary processing', 'monthly payroll',
  ],
  'Attendance': [
    'check in', 'check out', 'time tracking', 'punch in', 'punch out',
    'working hours', 'time log', 'attendance log',
  ],
  'Performance': [
    'appraisal', 'review', 'KPI', 'goals', 'OKR', 'evaluation',
    'performance review', '360 review', 'ratings',
  ],
  'Recruitment': [
    'hiring', 'jobs', 'job posting', 'vacancy', 'candidates',
    'applicants', 'onboarding', 'talent acquisition', 'JD',
  ],
  'Training': [
    'learning', 'LMS', 'courses', 'upskilling', 'certification',
    'training plan', 'skill development',
  ],

  // ── Finance / Accounts ────────────────────────────────────────────────────
  'Invoices': [
    'bills', 'billing', 'invoice list', 'raise invoice', 'create invoice',
    'tax invoice', 'receipts', 'invoice management',
  ],

  'Expenses': [
    'expense claims', 'reimbursement', 'petty cash', 'spend',
    'expense report', 'T&E', 'travel expenses',
  ],
  'Accounts Payable': [
    'AP', 'vendor payment', 'pay vendor', 'creditors', 'bills payable',
  ],
  'Accounts Receivable': [
    'AR', 'customer payment', 'debtors', 'collect payment', 'receivables',
  ],
  'General Ledger': [
    'GL', 'ledger', 'journal entries', 'chart of accounts', 'books',
  ],
  'Reports': [
    'analytics', 'insights', 'dashboard data', 'export', 'statements',
    'financial report', 'summary', 'MIS', 'management report',
  ],

  // ── Inventory / Warehouse ─────────────────────────────────────────────────
  'Inventory': [
    'stock', 'items', 'products', 'goods', 'warehouse', 'SKU',
    'stock list', 'materials', 'catalogue',
  ],

  'Suppliers': [
    'vendors', 'supplier list', 'vendor management', 'partners',
  ],

  // ── CRM / Sales ───────────────────────────────────────────────────────────
  'Customers': [
    'clients', 'accounts', 'customer list', 'CRM', 'contacts',
    'business accounts',
  ],
  'Leads': [
    'prospects', 'pipeline', 'opportunities', 'new leads',
    'sales leads', 'potential customers',
  ],
  'Quotations': [
    'quotes', 'proposals', 'price quote', 'estimate', 'RFQ',
  ],
  'Sales Orders': [
    'SO', 'sales', 'order management', 'customer orders', 'orders',
  ],

  // ── Admin / Settings ──────────────────────────────────────────────────────
  'Users': [
    'user management', 'accounts', 'user list', 'admin users',
    'system users', 'logins',
  ],
  'Roles': [
    'permissions', 'access control', 'role management', 'ACL',
    'user roles', 'privileges',
  ],
  'Settings': [
    'configuration', 'setup', 'preferences', 'system settings',
    'config', 'options', 'admin settings',
  ],
  'Audit Logs': [
    'activity log', 'history', 'trail', 'audit trail', 'change log',
    'system log',
  ],
};

/**
 * Get aliases for a given menu name.
 * Returns empty array if no aliases registered — graceful fallback.
 */
export function getAliasesForMenu(menuName: string): string[] {
  // Exact match first
  if (ALIAS_REGISTRY[menuName]) return ALIAS_REGISTRY[menuName];

  // Case-insensitive fallback
  const key = Object.keys(ALIAS_REGISTRY).find(
    (k) => k.toLowerCase() === menuName.toLowerCase(),
  );
  return key ? ALIAS_REGISTRY[key] : [];
}

/**
 * Get relevant keywords from aliases (first word of each alias phrase).
 * Used for the `keywords` field in SearchIndexItem.
 */
export function extractKeywords(aliases: string[]): string[] {
  const words = new Set<string>();
  aliases.forEach((alias) => {
    alias.split(' ').forEach((w) => {
      if (w.length > 2) words.add(w.toLowerCase());
    });
  });
  return Array.from(words);
}