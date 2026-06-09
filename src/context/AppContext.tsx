'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

// --- Interfaces ---

export type TransactionType = 'Purchase' | 'Payment' | 'Autopay' | 'Investment' | 'Income' | 'Other';
export type PaymentChannel = 'Bank' | 'Credit Card' | 'Autopay' | 'Venmo' | 'Zelle' | 'Cash' | 'PayPal';
export type ExpenseCategory = 
  | 'Housing' | 'Groceries' | 'Dining' | 'Leisure' | 'Gifts' 
  | 'Travel' | 'Memberships' | 'Autopay' | 'Utility' | 'Credit Card'
  | 'Health' | 'Transport' | 'Other' | 'Salary' | 'Investment';

export interface IncomeLog {
  id: string;
  user_id: string;
  date: string;
  source: string;
  paycheckLabel: string;
  amount: number;
  depositBank: string;
  notes?: string;
  already_included_in_bank_balance?: boolean;
  monthKey: string;
  created_at: string;
}

export interface ExpenseLog {
  id: string;
  user_id: string;
  date: string;
  transactionType: TransactionType;
  category: ExpenseCategory;
  subcategory?: string;
  description: string;
  occasionPurpose?: string;
  amount: number;
  paymentChannel: PaymentChannel;
  bank?: string;
  creditCard?: string;
  paymentPlan: 'One-time' | 'Installment';
  currentInstallment?: number;
  totalInstallments?: number;
  status: 'Paid' | 'Pending' | 'Planned';
  amountPaid: number;
  notes?: string;
  monthKey: string;
  created_at: string;
}

export interface UnifiedTransaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  icon: string;
  type: 'income' | 'expense' | 'investment';
  status?: string;
  paymentChannel?: string;
  bank?: string;
  creditCard?: string;
  paymentPlan?: 'One-time' | 'Installment';
  currentInstallment?: number;
  totalInstallments?: number;
}

export interface Card {
  id: string;
  user_id: string;
  cardName: string;
  creditLimit: number;
  currentBalance: number;
  totalCharges: number;
  totalPayments: number;
  availableCredit: number;
  utilization: number;
  notes?: string;
  color?: string;
  type: 'Credit' | 'Debit';
  dueDay?: string;
  annualFee?: number;
  renewalMonth?: string;
  expiry?: string;
}

export interface Account {
  id: string;
  user_id: string;
  institution: string;
  type: string;
  balance: number;
  startingBalance?: number;
  asOfDate?: string;
  projectedBalance?: number;
  varianceVsProjected?: number;
  notes?: string;
}

export interface Investment {
  id: string;
  user_id: string;
  date: string;
  institution: string;
  accountType: string;
  contribution: number;
  currentBalance: number;
  fromBank?: string;
  payrollDeduction: boolean;
  notes?: string;
  monthKey: string;
  tenor?: string;
  rate?: number;
  value_date?: string | null;
  maturity_date?: string | null;
  created_at: string;
}

export interface SavedReport {
  id: string;
  user_id: string;
  period: string;
  title: string;
  report_data: any;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  full_name: string;
  preferred_currency: string;
  // Optional/Advanced fields - keeping in interface but will be careful with saving
  email_notifications?: boolean;
  payment_reminders?: boolean;
  due_day_reminders?: boolean;
  monthly_summary?: boolean;
  investment_reminders?: boolean;
  language?: string;
  region?: string;
  date_format?: string;
  last_reset_date?: string;
  preferred_experience?: string;
}

interface AppSummary {
  availableBalance: number;
  incomeThisMonth: number;
  cashOutThisMonth: number;
  investmentThisMonth: number;
  cardOutstanding: number;
  investmentsTotal: number;
  categories: Record<string, number>;
  cardPayments: number;
  payrollDeduction: number;
  manualInvestments: number;
  totalIncome: number;
  totalSpending: number;
  actualCashOut: number;
  creditCardsOutstanding: number;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  incomeLogs: IncomeLog[];
  expenseLogs: ExpenseLog[];
  activeIncomeLogs: IncomeLog[];
  activeExpenseLogs: ExpenseLog[];
  activeInvestments: Investment[];
  transactions: UnifiedTransaction[];
  cards: Card[];
  accounts: Account[];
  investments: Investment[];
  reports: SavedReport[];
  settings: UserSettings | null;
  summary: AppSummary;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  refreshData: () => Promise<void>;
  addIncome: (log: Omit<IncomeLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  addExpense: (log: Omit<ExpenseLog, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateExpense: (id: string, log: Partial<ExpenseLog>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCard: (card: Omit<Card, 'id' | 'user_id'>) => Promise<void>;
  editCard: (id: string, card: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  addAccount: (account: Omit<Account, 'id' | 'user_id'>) => Promise<void>;
  editAccount: (id: string, account: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addInvestment: (inv: Omit<Investment, 'id' | 'user_id' | 'created_at'>, skipLog?: boolean) => Promise<void>;
  editInvestment: (id: string, inv: Partial<Investment>) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  addReport: (report: Omit<SavedReport, 'id' | 'user_id' | 'created_at'>) => Promise<SavedReport | null>;
  deleteReport: (id: string) => Promise<void>;
  startNewMonth: () => Promise<void>;
  factoryReset: () => Promise<void>;
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  maskValue: (value: string | number) => string;
  calculateSummary: (
    targetMonthKey: string,
    filterByReset: boolean,
    incomes: IncomeLog[],
    expenses: ExpenseLog[],
    investmentLogs: Investment[],
    bankAccounts: Account[],
    creditCards: Card[]
  ) => any;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);

  // Initialize privacy mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('onelleve_privacy_mode');
    if (savedMode === 'true') setIsPrivacyMode(true);
  }, []);

  const togglePrivacyMode = () => {
    setIsPrivacyMode(prev => {
      const newMode = !prev;
      localStorage.setItem('onelleve_privacy_mode', String(newMode));
      return newMode;
    });
  };

  const maskValue = (value: string | number): string => {
    if (!isPrivacyMode) return typeof value === 'number' ? value.toLocaleString() : String(value);
    return '******';
  };
  
  const [incomeLogs, setIncomeLogs] = useState<IncomeLog[]>([]);
  const [expenseLogs, setExpenseLogs] = useState<ExpenseLog[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [reports, setReports] = useState<SavedReport[]>([]);

  // Helper to fetch all data
  const fetchAllData = async (currentUser: User, silent = false) => {
    if (!supabase) return;
    if (!silent) setLoading(true);
    try {
      const [
        incRes,
        expRes,
        crdRes,
        accRes,
        invRes,
        setRes,
        repRes
      ] = await Promise.all([
        supabase.from('income_log').select('*').order('date', { ascending: false }),
        supabase.from('expense_log').select('*').order('date', { ascending: false }),
        supabase.from('credit_cards').select('*').order('cardName'),
        supabase.from('bank_accounts').select('*').order('institution'),
        supabase.from('investments').select('*').order('date', { ascending: false }),
        supabase.from('user_settings').select('*').eq('user_id', currentUser.id).maybeSingle(),
        supabase.from('reports').select('*').order('created_at', { ascending: false })
      ]);

      if (incRes.error) console.error('Error fetching income:', incRes.error);
      if (expRes.error) console.error('Error fetching expenses:', expRes.error);
      if (crdRes.error) console.error('Error fetching cards:', crdRes.error);
      if (accRes.error) console.error('Error fetching accounts:', accRes.error);
      if (invRes.error) console.error('Error fetching investments:', invRes.error);
      if (setRes.error) console.error('Error fetching settings:', setRes.error);
      if (repRes.error) console.error('Error fetching reports:', repRes.error);

      setIncomeLogs(incRes.data || []);
      setExpenseLogs(expRes.data || []);
      setCards(crdRes.data || []);
      setAccounts(accRes.data || []);
      setInvestments(invRes.data || []);
      
      // Deduplicate reports by period for the UI (keeping the most recent)
      const uniqueReports: SavedReport[] = [];
      const seenPeriods = new Set();
      (repRes.data || []).forEach(report => {
        if (!seenPeriods.has(report.period)) {
          uniqueReports.push(report);
          seenPeriods.add(report.period);
        }
      });
      setReports(uniqueReports);
      
      if (setRes.data) {
        // Ensure all keys have default values to avoid UI bugs with missing columns
        setSettings({
          ...setRes.data,
          language: setRes.data.language || 'en',
          date_format: setRes.data.date_format || 'MM/DD/YYYY',
          email_notifications: !!setRes.data.email_notifications,
          payment_reminders: !!setRes.data.payment_reminders,
          due_day_reminders: !!setRes.data.due_day_reminders,
          monthly_summary: !!setRes.data.monthly_summary,
          investment_reminders: !!setRes.data.investment_reminders
        });
      } else if (!setRes.error) {
        // Only attempt to create default if no record exists AND no error occurred
        const defaultSettings: Omit<UserSettings, 'id'> = {
          user_id: currentUser.id,
          full_name: currentUser.user_metadata?.full_name || '',
          preferred_currency: 'USD',
          language: 'en',
          date_format: 'MM/DD/YYYY',
          email_notifications: false,
          payment_reminders: false,
          due_day_reminders: false,
          monthly_summary: false,
          investment_reminders: false
        };
        const { data: newSet, error: insertError } = await supabase
          .from('user_settings')
          .insert([defaultSettings])
          .select()
          .single();
          
        if (newSet) {
          setSettings(newSet);
        } else if (insertError) {
          console.error('Error creating default settings:', insertError);
        }
      }
    } catch (error) {
      console.error('General Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (user) await fetchAllData(user, true);
  };

  // Auth Listener
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchAllData(u);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchAllData(u);
      else {
        setIncomeLogs([]);
        setExpenseLogs([]);
        setCards([]);
        setAccounts([]);
        setInvestments([]);
        setReports([]);
        setSettings(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const activeIncomeLogs = useMemo(() => {
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
    const lastReset = settings?.last_reset_date || currentMonthStart.toISOString();
    return incomeLogs.filter(log => log.created_at >= lastReset);
  }, [incomeLogs, settings]);

  const activeExpenseLogs = useMemo(() => {
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
    const lastReset = settings?.last_reset_date || currentMonthStart.toISOString();
    return expenseLogs.filter(log => log.created_at >= lastReset);
  }, [expenseLogs, settings]);

  const activeInvestments = useMemo(() => {
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
    const lastReset = settings?.last_reset_date || currentMonthStart.toISOString();
    return investments.filter(inv => inv.created_at >= lastReset);
  }, [investments, settings]);

  const transactions = useMemo(() => {
    const incomes: UnifiedTransaction[] = activeIncomeLogs.map(log => ({
      id: log.id,
      name: log.source,
      category: 'Income',
      amount: log.amount,
      date: log.date,
      icon: 'DollarSign',
      type: 'income'
    }));

    const expenses: UnifiedTransaction[] = activeExpenseLogs.map(log => ({
      id: log.id,
      name: log.description,
      category: log.category,
      amount: -log.amount,
      date: log.date,
      icon: log.category === 'Dining' ? 'Coffee' : log.category === 'Leisure' ? 'ShoppingCart' : 'Smartphone',
      type: (log.transactionType === 'Investment' || log.category === 'Investment') ? 'investment' : 'expense',
      status: log.status,
      paymentChannel: log.paymentChannel,
      bank: log.bank,
      creditCard: log.creditCard,
      paymentPlan: log.paymentPlan,
      currentInstallment: log.currentInstallment,
      totalInstallments: log.totalInstallments
    }));

    const unifiedInvestments: UnifiedTransaction[] = activeInvestments.map(inv => ({
      id: inv.id,
      name: inv.institution,
      category: 'Investment',
      amount: -inv.contribution,
      date: inv.date,
      icon: 'TrendingUp',
      type: 'investment'
    }));

    return [...incomes, ...expenses, ...unifiedInvestments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeIncomeLogs, activeExpenseLogs, activeInvestments]);

  const calculateSummary = (
    targetMonthKey: string,
    filterByReset: boolean,
    incomes: IncomeLog[],
    expenses: ExpenseLog[],
    investmentLogs: Investment[],
    bankAccounts: Account[],
    creditCards: Card[]
  ): any => {
    const lastReset = settings?.last_reset_date || '1970-01-01T00:00:00.000Z';

    // 1. Filter active logs for the specific period
    const activeIncomes = incomes.filter(log => 
      log.monthKey === targetMonthKey && (!filterByReset || log.created_at >= lastReset)
    );
    const activeExpenses = expenses.filter(log => 
      log.monthKey === targetMonthKey && (!filterByReset || log.created_at >= lastReset)
    );
    // For contributions, we use the specific month and reset filter
    const activeInvLogs = investmentLogs.filter(inv => 
      inv.monthKey === targetMonthKey && (!filterByReset || inv.created_at >= lastReset)
    );

    // 2. Income This Month
    const incomeThisMonth = activeIncomes.reduce((acc, log) => acc + log.amount, 0);

    // 3. Cash Out Calculation Rules (Rule 9: Money that actually left the bank/cash)
    // Pure Bank Spending = Actual Cash Out for the breakdown
    const actualCashOut = activeExpenses.filter(log => 
      log.transactionType !== 'Payment' && 
      log.transactionType !== 'Investment' && 
      log.category !== 'Credit Card' &&
      log.category !== 'Investment' &&
      log.paymentChannel !== 'Credit Card'
    ).reduce((acc, log) => acc + log.amount, 0);

    const cardPayments = activeExpenses.filter(log => 
      log.transactionType === 'Payment'
    ).reduce((acc, log) => acc + log.amount, 0);

    // Contributions from active records for the month
    const manualInvestmentsMonthly = activeInvLogs.filter(inv => !inv.payrollDeduction).reduce((acc, inv) => acc + inv.contribution, 0);
    const payrollInvestmentsMonthly = activeInvLogs.filter(inv => inv.payrollDeduction).reduce((acc, inv) => acc + inv.contribution, 0);

    // Rule 1: Total Cash Out = Actual Cash Out (Pure bank) + CC Payments + Manual Investments
    const totalCashOut = actualCashOut + cardPayments + manualInvestmentsMonthly;

    // 4. Investment This Month (Rule 10)
    const investmentThisMonth = manualInvestmentsMonthly + payrollInvestmentsMonthly;

    // 5. Category Breakdown (Excluding internal payments and investments to avoid double counting in spending charts)
    const categories = activeExpenses.filter(log => 
      log.transactionType !== 'Payment' && 
      log.transactionType !== 'Investment' &&
      log.category !== 'Investment' &&
      log.category !== 'Credit Card'
    ).reduce((acc: Record<string, number>, log) => {
      acc[log.category] = (acc[log.category] || 0) + log.amount;
      return acc;
    }, {});

    // 6. Global State (Rule 8, 11, 3)
    const bankBalances = bankAccounts.reduce((acc, accnt) => acc + accnt.balance, 0);
    const cardOutstanding = creditCards.reduce((acc, card) => acc + card.currentBalance, 0);
    // Total is sum of (base balance + total contributions) across all cards
    const investmentsTotal = investmentLogs.reduce((acc, inv) => acc + inv.currentBalance + inv.contribution, 0);

    return {
      availableBalance: bankBalances,
      incomeThisMonth,
      cashOutThisMonth: totalCashOut, // For Dashboard compat
      investmentThisMonth,
      cardOutstanding,
      investmentsTotal,
      categories,
      cardPayments,
      payrollDeduction: payrollInvestmentsMonthly,
      manualInvestments: manualInvestmentsMonthly,
      bankBalances,
      totalIncome: incomeThisMonth,
      totalSpending: Object.values(categories).reduce((a, b) => a + b, 0),
      totalCashOut: totalCashOut, // For Report Modal compat
      actualCashOut: actualCashOut, // Pure bank expenses
      creditCardsOutstanding: cardOutstanding
    };
  };

  const summary = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return calculateSummary(currentMonth, true, incomeLogs, expenseLogs, investments, accounts, cards);
  }, [incomeLogs, expenseLogs, investments, accounts, cards, settings]);

  // Actions
  const startNewMonth = async () => {
    if (!user || !supabase) return;
    
    try {
      const d = new Date();
      const month = d.toLocaleString('en-US', { month: 'long' });
      const year = d.getFullYear().toString();
      const nowISO = d.toISOString();
      const period = `${month} ${year}`;

      // Capture current summary for archiving BEFORE cleaning up
      const snapshotToArchive = { ...summary };

      // Validation: Only archive if there is real data
      const hasData = 
        snapshotToArchive.incomeThisMonth > 0 || 
        snapshotToArchive.cashOutThisMonth > 0 || 
        snapshotToArchive.investmentThisMonth > 0 ||
        snapshotToArchive.investmentsTotal > 0 ||
        snapshotToArchive.availableBalance > 0 ||
        snapshotToArchive.cardOutstanding > 0;

      if (hasData) {
        // 1. Check for existing entries to avoid duplicates
        const [archiveCheck, reportCheck] = await Promise.all([
          supabase.from('monthly_archives').select('id').eq('user_id', user.id).eq('month', month).eq('year', year).maybeSingle(),
          supabase.from('reports').select('id').eq('user_id', user.id).eq('period', period).maybeSingle()
        ]);

        // 2. Archive or Update current snapshot
        if (archiveCheck.data) {
          await supabase.from('monthly_archives').update({ snapshot_data: snapshotToArchive }).eq('id', archiveCheck.data.id);
        } else {
          await supabase.from('monthly_archives').insert([{
            user_id: user.id,
            month,
            year,
            snapshot_data: snapshotToArchive
          }]);
        }
        
        // 3. Save or Update report for UI visibility
        if (reportCheck.data) {
          await supabase.from('reports').update({ report_data: snapshotToArchive }).eq('id', reportCheck.data.id);
        } else {
          await addReport({
            title: `${period} Financial Summary (Archived)`,
            period,
            report_data: snapshotToArchive
          });
        }
      }
      
      // 4. Reset persistent balances and CLEAR active investments
      const { error: resetError } = await supabase.rpc('start_new_month_cleanup', { p_user_id: user.id });
      
      if (resetError) {
        // Fallback to manual if RPC doesn't exist
        await Promise.all([
          supabase.from('bank_accounts').update({ balance: 0 }).eq('user_id', user.id),
          supabase.from('credit_cards').update({ currentBalance: 0 }).eq('user_id', user.id),
          supabase.from('investments').delete().eq('user_id', user.id)
        ]);
      }
      
      // 5. Record reset date to clear dashboard monthly KPIs
      await updateSettings({ last_reset_date: nowISO });
      
      await refreshData();
    } catch (error) {
      console.error('Error starting new month:', error);
      throw error;
    }
  };
  const factoryReset = async () => {
    if (!user || !supabase) return;
    const client = supabase; // Standard reference to avoid undefined checks in map

    try {
      // 1. Delete data from all financial tables for this user
      const tables = [
        'bank_accounts',
        'credit_cards',
        'income_log',
        'expense_log',
        'investments',
        'reports',
        'monthly_archives'
      ];

      const deletePromises = tables.map(table => 
        client.from(table).delete().eq('user_id', user.id)
      );

      const results = await Promise.all(deletePromises);

      // Check for errors in any deletion
      const firstError = results.find(res => res.error)?.error;
      if (firstError) {
        console.error('Factory Reset Deletion Error:', firstError);
        throw firstError;
      }

      // 2. Update last_reset_date to now
      await updateSettings({ last_reset_date: new Date().toISOString() });

      // 3. Reload everything
      await refreshData();
    } catch (error) {
      console.error('General Factory Reset Error:', error);
      throw error;
    }
  };

  const addIncome = async (log: Omit<IncomeLog, 'id' | 'user_id' | 'created_at'>) => {
    if (!user || !supabase) return;

    // Save to income_log
    const { error: insertError } = await supabase.from('income_log').insert([{ ...log, user_id: user.id }]);
    if (insertError) {
      console.error('Error inserting income:', insertError);
      throw insertError;
    }

    // Update Bank Balance only if NOT already included
    if (log.depositBank && !log.already_included_in_bank_balance) {
      const account = accounts.find(a => a.institution === log.depositBank);
      if (account) {
        const { error: updateError } = await supabase
          .from('bank_accounts')
          .update({ balance: account.balance + log.amount })
          .eq('id', account.id)
          .eq('user_id', user.id); // Extra safety

        if (updateError) {
          console.error('Error updating bank balance:', updateError);
          throw updateError;
        }
      }
    }

    await refreshData();
  };
  const addExpense = async (log: Omit<ExpenseLog, 'id' | 'user_id' | 'created_at'>) => {
    if (!user || !supabase) return;
    await supabase.from('expense_log').insert([{ ...log, user_id: user.id }]);
    
    // Rule: If transaction is an Investment, update the Portfolio Card and handle bank balance
    if (log.transactionType === 'Investment' || log.category === 'Investment') {
       await addInvestment({
         date: log.date,
         institution: log.description, 
         accountType: 'Investment',
         contribution: log.amount,
         currentBalance: 0, // Keep existing base balance
         payrollDeduction: !log.bank, 
         monthKey: log.monthKey,
         fromBank: log.bank
       }, true); // skipLog = true to avoid double entry
       return; 
    }

    // Rule 3: Credit Card Purchase increases Outstanding
    if (log.transactionType === 'Purchase' && log.paymentChannel === 'Credit Card' && log.creditCard) {
      const card = cards.find(c => c.cardName === log.creditCard);
      if (card) {
        await supabase.from('credit_cards').update({ 
          currentBalance: card.currentBalance + log.amount,
          totalCharges: card.totalCharges + log.amount
        }).eq('id', card.id);
      }
    }
    
    // Rule 4 & 5: Credit Card Payment reduces Outstanding
    // A Payment type OR an Autopay channel targeting a card reduces its balance
    if ((log.transactionType === 'Payment' || log.paymentChannel === 'Autopay') && log.creditCard) {
      const card = cards.find(c => c.cardName === log.creditCard);
      if (card) {
        await supabase.from('credit_cards').update({ 
          currentBalance: Math.max(0, card.currentBalance - log.amount),
          totalPayments: card.totalPayments + log.amount
        }).eq('id', card.id);
      }
    }

    // Rule 2, 4, 5: Money leaving bank reduces Bank Balance
    if (log.paymentChannel === 'Bank' || log.paymentChannel === 'Autopay' || log.transactionType === 'Payment') {
      if (log.bank) {
        const account = accounts.find(a => a.institution === log.bank);
        if (account) {
          await supabase.from('bank_accounts').update({ balance: account.balance - log.amount }).eq('id', account.id);
        }
      }
    }
    await refreshData();
  };

  const updateExpense = async (id: string, log: Partial<ExpenseLog>) => {
    if (!supabase) return;
    await supabase.from('expense_log').update(log).eq('id', id);
    await refreshData();
  };

  const deleteExpense = async (id: string) => {
    await deleteTransaction(id);
  };

  const deleteTransaction = async (id: string) => {
    if (!supabase) return;
    
    // 1. Find the transaction to revert its effect on balances
    const income = incomeLogs.find(i => i.id === id);
    const expense = expenseLogs.find(e => e.id === id);
    
    if (income) {
       // Only revert bank balance if it was NOT already included
       if (income.depositBank && !income.already_included_in_bank_balance) {
         const account = accounts.find(a => a.institution === income.depositBank);
         if (account) {
           await supabase.from('bank_accounts')
             .update({ balance: account.balance - income.amount })
             .eq('id', account.id)
             .eq('user_id', user?.id); // Extra safety
         }
       }
       await supabase.from('income_log').delete().eq('id', id);
    }
    
    if (expense) {
       // Rule: Revert Investment contribution
       if (expense.transactionType === 'Investment' || expense.category === 'Investment') {
          const inv = investments.find(i => i.institution === expense.description);
          if (inv) {
             await supabase.from('investments').update({
                contribution: Math.max(0, inv.contribution - expense.amount)
             }).eq('id', inv.id);
          }
       }

       // Revert CC outstanding if applicable
       if (expense.transactionType === 'Purchase' && expense.paymentChannel === 'Credit Card' && expense.creditCard) {
         const card = cards.find(c => c.cardName === expense.creditCard);
         if (card) {
           await supabase.from('credit_cards').update({ 
             currentBalance: Math.max(0, card.currentBalance - expense.amount),
             totalCharges: card.totalCharges - expense.amount
           }).eq('id', card.id);
         }
       }
       
       if ((expense.transactionType === 'Payment' || expense.paymentChannel === 'Autopay') && expense.creditCard) {
          const card = cards.find(c => c.cardName === expense.creditCard);
          if (card) {
            await supabase.from('credit_cards').update({ 
              currentBalance: card.currentBalance + expense.amount,
              totalPayments: card.totalPayments - expense.amount
            }).eq('id', card.id);
          }
       }
       
       // Revert Bank Balance
       if (expense.paymentChannel === 'Bank' || expense.paymentChannel === 'Autopay' || expense.transactionType === 'Payment') {
         if (expense.bank) {
           const account = accounts.find(a => a.institution === expense.bank);
           if (account) {
             await supabase.from('bank_accounts').update({ balance: account.balance + expense.amount }).eq('id', account.id);
           }
         }
       }
       await supabase.from('expense_log').delete().eq('id', id);
    }

    await refreshData();
  };

  const addCard = async (card: Omit<Card, 'id' | 'user_id'>) => {
    if (!user || !supabase) return;
    await supabase.from('credit_cards').insert([{ ...card, user_id: user.id }]);
    await refreshData();
  };

  const editCard = async (id: string, card: Partial<Card>) => {
    if (!supabase) return;
    await supabase.from('credit_cards').update(card).eq('id', id);
    await refreshData();
  };

  const deleteCard = async (id: string) => {
    if (!supabase) return;
    await supabase.from('credit_cards').delete().eq('id', id);
    await refreshData();
  };

  const addAccount = async (account: Omit<Account, 'id' | 'user_id'>) => {
    if (!user || !supabase) return;
    await supabase.from('bank_accounts').insert([{ ...account, user_id: user.id }]);
    await refreshData();
  };

  const editAccount = async (id: string, account: Partial<Account>) => {
    if (!supabase) return;
    await supabase.from('bank_accounts').update(account).eq('id', id);
    await refreshData();
  };

  const deleteAccount = async (id: string) => {
    if (!supabase) return;
    await supabase.from('bank_accounts').delete().eq('id', id);
    await refreshData();
  };

  const addInvestment = async (inv: Omit<Investment, 'id' | 'user_id' | 'created_at'>, skipLog = false) => {
    if (!user || !supabase) return;

    // 1. Portfolio Card Logic: Check if institution type exists for this user
    const existing = investments.find(i => i.institution === inv.institution);

    if (existing) {
       // Update existing card: 
       // Cumulative contribution + keep/update base balance
       const newContribution = existing.contribution + inv.contribution;
       const newBaseBalance = inv.currentBalance > 0 ? inv.currentBalance : existing.currentBalance;
       
       await supabase.from('investments').update({
         contribution: newContribution,
         currentBalance: newBaseBalance,
         date: inv.date,
         notes: inv.notes || existing.notes,
         tenor: inv.tenor || existing.tenor,
         rate: inv.rate || existing.rate,
         value_date: inv.value_date || existing.value_date,
         maturity_date: inv.maturity_date || existing.maturity_date
       }).eq('id', existing.id);
    } else {
       // Create new card
       await supabase.from('investments').insert([{ ...inv, user_id: user.id }]);
    }

    // 2. Log Entry: Create an expense log record so it's visible in history and search
    // We only do this if it's a contribution (not a direct balance update) and log is not skipped
    if (inv.contribution > 0 && !skipLog) {
       await supabase.from('expense_log').insert([{
         user_id: user.id,
         date: inv.date,
         description: inv.institution,
         amount: inv.contribution,
         category: 'Investment',
         transactionType: 'Investment',
         paymentChannel: inv.payrollDeduction ? 'Autopay' : 'Bank',
         bank: inv.fromBank,
         status: 'Paid',
         amountPaid: inv.contribution,
         monthKey: inv.monthKey
       }]);
    }

    // 3. Bank Balance side effect (for manual investments)
    if (!inv.payrollDeduction && inv.fromBank) {
      const account = accounts.find(a => a.institution === inv.fromBank);
      if (account) {
        await supabase.from('bank_accounts').update({ balance: account.balance - inv.contribution }).eq('id', account.id);
      }
    }
    await refreshData();
  };

  const editInvestment = async (id: string, inv: Partial<Investment>) => {
    if (!supabase) return;
    await supabase.from('investments').update(inv).eq('id', id);
    await refreshData();
  };

  const deleteInvestment = async (id: string) => {
    if (!supabase) return;
    await supabase.from('investments').delete().eq('id', id);
    await refreshData();
  };

  const addReport = async (report: Omit<SavedReport, 'id' | 'user_id' | 'created_at'>): Promise<SavedReport | null> => {
    if (!user || !supabase) return null;
    const { data, error } = await supabase.from('reports').insert([{ ...report, user_id: user.id }]).select().single();
    if (error) {
      console.error('Supabase addReport error:', error);
      throw error;
    }
    await refreshData();
    return data;
  };

  const deleteReport = async (id: string) => {
    if (!supabase) return;
    await supabase.from('reports').delete().eq('id', id);
    await refreshData();
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user || !supabase) return;
    
    // STRICT UPSERT: Sending allowed fields to avoid DB errors
    const payload: any = {
      user_id: user.id,
      updated_at: new Date().toISOString()
    };
    
    if (newSettings.full_name !== undefined) payload.full_name = newSettings.full_name;
    if (newSettings.preferred_currency !== undefined) payload.preferred_currency = newSettings.preferred_currency;
    if (newSettings.language !== undefined) payload.language = newSettings.language;
    if (newSettings.date_format !== undefined) payload.date_format = newSettings.date_format;
    if (newSettings.last_reset_date !== undefined) payload.last_reset_date = newSettings.last_reset_date;
    if (newSettings.email_notifications !== undefined) payload.email_notifications = newSettings.email_notifications;
    if (newSettings.payment_reminders !== undefined) payload.payment_reminders = newSettings.payment_reminders;
    if (newSettings.due_day_reminders !== undefined) payload.due_day_reminders = newSettings.due_day_reminders;
    if (newSettings.monthly_summary !== undefined) payload.monthly_summary = newSettings.monthly_summary;
    if (newSettings.investment_reminders !== undefined) payload.investment_reminders = newSettings.investment_reminders;
    if (newSettings.preferred_experience !== undefined) payload.preferred_experience = newSettings.preferred_experience;

    const { error } = await supabase.from('user_settings').upsert(payload, { onConflict: 'user_id' });

    if (!error) {
      setSettings(prev => {
        const updated = prev ? { ...prev, ...newSettings } : ({ ...newSettings, user_id: user.id } as UserSettings);
        return updated;
      });
    } else {
      console.error('Supabase updateSettings error:', error);
      throw error;
    }
  };

  return (
    <AppContext.Provider value={{ 
      user, loading, incomeLogs, expenseLogs, activeIncomeLogs, activeExpenseLogs, activeInvestments, transactions, cards, accounts, investments, reports, settings, summary, updateSettings, refreshData,
      addIncome, addExpense, updateExpense, deleteExpense, deleteTransaction,
      addCard, editCard, deleteCard, addAccount, editAccount, deleteAccount, addInvestment, editInvestment, deleteInvestment,
      addReport, deleteReport, startNewMonth, factoryReset, isPrivacyMode, togglePrivacyMode, maskValue, calculateSummary
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};
