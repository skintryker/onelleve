'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { supabase } from '@/utils/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

// --- Interfaces ---

export type TransactionType = 'Purchase' | 'Payment' | 'Autopay' | 'Investment' | 'Income' | 'Other';
export type PaymentChannel = 'Bank' | 'Credit Card' | 'Autopay' | 'Venmo' | 'Zelle' | 'Cash' | 'PayPal';
export type ExpenseCategory = 
  | 'Housing' | 'Groceries' | 'Dining' | 'Leisure' | 'Gifts' 
  | 'Travel' | 'Memberships' | 'Autopay' | 'Credit Card'
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
  monthKey: string;
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
}

interface AppSummary {
  availableBalance: number;
  incomeThisMonth: number;
  spendingThisMonth: number;
  investmentThisMonth: number;
  cardOutstanding: number;
  investmentsTotal: number;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  incomeLogs: IncomeLog[];
  expenseLogs: ExpenseLog[];
  transactions: UnifiedTransaction[];
  cards: Card[];
  accounts: Account[];
  investments: Investment[];
  summary: AppSummary;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  refreshData: () => Promise<void>;
  addIncome: (log: Omit<IncomeLog, 'id' | 'user_id'>) => Promise<void>;
  addExpense: (log: Omit<ExpenseLog, 'id' | 'user_id'>) => Promise<void>;
  updateExpense: (id: string, log: Partial<ExpenseLog>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCard: (card: Omit<Card, 'id' | 'user_id'>) => Promise<void>;
  editCard: (id: string, card: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  addAccount: (account: Omit<Account, 'id' | 'user_id'>) => Promise<void>;
  editAccount: (id: string, account: Partial<Account>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addInvestment: (inv: Omit<Investment, 'id' | 'user_id'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');
  
  const [incomeLogs, setIncomeLogs] = useState<IncomeLog[]>([]);
  const [expenseLogs, setExpenseLogs] = useState<ExpenseLog[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);

  // Helper to fetch all data
  const fetchAllData = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const [
        { data: inc },
        { data: exp },
        { data: crd },
        { data: acc },
        { data: inv }
      ] = await Promise.all([
        supabase.from('income_log').select('*').order('date', { ascending: false }),
        supabase.from('expense_log').select('*').order('date', { ascending: false }),
        supabase.from('credit_cards').select('*').order('cardName'),
        supabase.from('bank_accounts').select('*').order('institution'),
        supabase.from('investments').select('*').order('date', { ascending: false })
      ]);

      setIncomeLogs(inc || []);
      setExpenseLogs(exp || []);
      setCards(crd || []);
      setAccounts(acc || []);
      setInvestments(inv || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auth Listener
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchAllData();
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchAllData();
      else {
        setIncomeLogs([]);
        setExpenseLogs([]);
        setCards([]);
        setAccounts([]);
        setInvestments([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshData = fetchAllData;

  const transactions = useMemo(() => {
    const incomes: UnifiedTransaction[] = incomeLogs.map(log => ({
      id: log.id,
      name: log.source,
      category: 'Income',
      amount: log.amount,
      date: log.date,
      icon: 'DollarSign',
      type: 'income'
    }));

    const expenses: UnifiedTransaction[] = expenseLogs.map(log => ({
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

    const unifiedInvestments: UnifiedTransaction[] = investments.map(inv => ({
      id: inv.id,
      name: inv.institution,
      category: 'Investment',
      amount: -inv.contribution,
      date: inv.date,
      icon: 'TrendingUp',
      type: 'investment'
    }));

    return [...incomes, ...expenses, ...unifiedInvestments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incomeLogs, expenseLogs, investments]);

  const summary = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const incomeThisMonth = incomeLogs.filter(log => log.monthKey === currentMonth).reduce((acc, log) => acc + log.amount, 0);
    const spendingThisMonth = expenseLogs.filter(log => log.monthKey === currentMonth && log.transactionType !== 'Payment' && log.transactionType !== 'Investment' && log.category !== 'Credit Card').reduce((acc, log) => acc + log.amount, 0);
    const investmentThisMonth = investments.filter(inv => inv.monthKey === currentMonth).reduce((acc, inv) => acc + inv.contribution, 0);
    const availableBalance = accounts.reduce((acc, account) => acc + account.balance, 0);
    const cardOutstanding = cards.reduce((acc, card) => acc + card.currentBalance, 0);
    const investmentsTotal = investments.reduce((acc, inv) => acc + inv.currentBalance, 0);

    return { availableBalance, incomeThisMonth, spendingThisMonth, investmentThisMonth, cardOutstanding, investmentsTotal };
  }, [incomeLogs, expenseLogs, cards, accounts, investments]);

  // Actions
  const addIncome = async (log: Omit<IncomeLog, 'id' | 'user_id'>) => {
    if (!user || !supabase) return;
    await supabase.from('income_log').insert([{ ...log, user_id: user.id }]);
    await refreshData();
  };

  const addExpense = async (log: Omit<ExpenseLog, 'id' | 'user_id'>) => {
    if (!user || !supabase) return;
    await supabase.from('expense_log').insert([{ ...log, user_id: user.id }]);
    
    // Internal side effects (Updating balances)
    if (log.transactionType === 'Purchase' && log.paymentChannel === 'Credit Card' && log.creditCard) {
      const card = cards.find(c => c.cardName === log.creditCard);
      if (card) {
        await supabase.from('credit_cards').update({ 
          currentBalance: card.currentBalance + log.amount,
          totalCharges: card.totalCharges + log.amount
        }).eq('id', card.id);
      }
    }
    
    if (log.transactionType === 'Payment' && log.creditCard) {
      const card = cards.find(c => c.cardName === log.creditCard);
      if (card) {
        await supabase.from('credit_cards').update({ 
          currentBalance: card.currentBalance - log.amount,
          totalPayments: card.totalPayments + log.amount
        }).eq('id', card.id);
      }
    }

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
    if (!supabase) return;
    await supabase.from('expense_log').delete().eq('id', id);
    await refreshData();
  };

  const deleteTransaction = async (id: string) => {
    if (!supabase) return;
    await Promise.all([
      supabase.from('income_log').delete().eq('id', id),
      supabase.from('expense_log').delete().eq('id', id)
    ]);
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

  const addInvestment = async (inv: Omit<Investment, 'id' | 'user_id'>) => {
    if (!user || !supabase) return;
    await supabase.from('investments').insert([{ ...inv, user_id: user.id }]);
    if (!inv.payrollDeduction && inv.fromBank) {
      const account = accounts.find(a => a.institution === inv.fromBank);
      if (account) {
        await supabase.from('bank_accounts').update({ balance: account.balance - inv.contribution }).eq('id', account.id);
      }
    }
    await refreshData();
  };

  const setTheme = (t: 'light' | 'dark') => {
    setThemeState(t);
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  return (
    <AppContext.Provider value={{ 
      user, loading, incomeLogs, expenseLogs, transactions, cards, accounts, investments, summary, theme, setTheme, refreshData,
      addIncome, addExpense, updateExpense, deleteExpense, deleteTransaction,
      addCard, editCard, deleteCard, addAccount, editAccount, deleteAccount, addInvestment
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
