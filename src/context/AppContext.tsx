'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';

// --- Interfaces ---

export type TransactionType = 'Purchase' | 'Payment' | 'Autopay' | 'Investment' | 'Income' | 'Other';
export type PaymentChannel = 'Bank' | 'Credit Card' | 'Autopay' | 'Venmo' | 'Zelle' | 'Cash' | 'Other';
export type ExpenseCategory = 
  | 'Housing' | 'Groceries' | 'Dining' | 'Leisure' | 'Gifts' 
  | 'Travel' | 'Memberships' | 'Autopay' | 'Credit Card'
  | 'Health' | 'Transport' | 'Other' | 'Salary' | 'Investment';

export interface IncomeLog {
  id: string;
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
  type: 'income' | 'expense';
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
  dueDay?: string; // Renamed from statementDate
  annualFee?: number;
  renewalMonth?: string;
  expiry?: string;
}

export interface Account {
  id: string;
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
  incomeLogs: IncomeLog[];
  expenseLogs: ExpenseLog[];
  transactions: UnifiedTransaction[];
  cards: Card[];
  accounts: Account[];
  investments: Investment[];
  summary: AppSummary;
  addIncome: (log: Omit<IncomeLog, 'id'>) => void;
  addExpense: (log: Omit<ExpenseLog, 'id'>) => void;
  updateExpense: (id: string, log: Partial<ExpenseLog>) => void;
  deleteExpense: (id: string) => void;
  deleteTransaction: (id: string) => void;
  addCard: (card: Omit<Card, 'id'>) => void;
  editCard: (id: string, card: Partial<Card>) => void;
  deleteCard: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  editAccount: (id: string, account: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  addInvestment: (inv: Omit<Investment, 'id'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incomeLogs, setIncomeLogs] = useState<IncomeLog[]>([]);
  const [expenseLogs, setExpenseLogs] = useState<ExpenseLog[]>([]);
  const [cards, setCards] = useState<Card[]>([
    { 
      id: '1', 
      cardName: 'AMEX Platinum', 
      creditLimit: 0, 
      currentBalance: 0, 
      totalCharges: 0, 
      totalPayments: 0, 
      availableCredit: 0, 
      utilization: 0, 
      color: '#C0C0C0', 
      type: 'Credit', 
      dueDay: '15',
      annualFee: 695.00,
      renewalMonth: 'January',
      expiry: '12/28'
    }
  ]);
  const [accounts, setAccounts] = useState<Account[]>([
    { id: '1', institution: 'Chase Bank', type: 'Checking', balance: 5000 },
    { id: '2', institution: 'Bank of America', type: 'Savings', balance: 4000.30 },
  ]);
  const [investments, setInvestments] = useState<Investment[]>([]);

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
      type: 'expense',
      status: log.status,
      paymentChannel: log.paymentChannel,
      bank: log.bank,
      creditCard: log.creditCard,
      paymentPlan: log.paymentPlan,
      currentInstallment: log.currentInstallment,
      totalInstallments: log.totalInstallments
    }));

    return [...incomes, ...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incomeLogs, expenseLogs]);

  const summary = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // 1. Income: All income logged this month
    const incomeThisMonth = incomeLogs
      .filter(log => log.monthKey === currentMonth)
      .reduce((acc, log) => acc + log.amount, 0);
    
    // 2. Spending: All expenses this month EXCEPT 'Payment' (which are card bill payments)
    const spendingThisMonth = expenseLogs
      .filter(log => log.monthKey === currentMonth && log.transactionType !== 'Payment' && log.category !== 'Credit Card')
      .reduce((acc, log) => acc + log.amount, 0);
    
    // 3. Investment: All contributions logged this month (manual + payroll)
    const investmentThisMonth = investments
      .filter(inv => inv.monthKey === currentMonth)
      .reduce((acc, inv) => acc + inv.contribution, 0);

    // 4. Available Balance: Sum of all current bank balances (already updated by addExpense/addInvestment)
    const availableBalance = accounts.reduce((acc, account) => acc + account.balance, 0);

    // 5. Card Outstanding: Sum of all current credit card balances
    const cardOutstanding = cards.reduce((acc, card) => acc + card.currentBalance, 0);

    // 6. Investments Total: Sum of all current investment account balances
    const investmentsTotal = investments.reduce((acc, inv) => acc + inv.currentBalance, 0);

    return {
      availableBalance,
      incomeThisMonth,
      spendingThisMonth,
      investmentThisMonth,
      cardOutstanding,
      investmentsTotal
    };
  }, [incomeLogs, expenseLogs, cards, accounts, investments]);

  // Actions
  const addIncome = (log: Omit<IncomeLog, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setIncomeLogs(prev => [...prev, { ...log, id }]);
    
    // Add to bank balance
    setAccounts(prev => prev.map(acc => acc.institution === log.depositBank ? { ...acc, balance: acc.balance + log.amount } : acc));
  };

  const addExpense = (log: Omit<ExpenseLog, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setExpenseLogs(prev => [...prev, { ...log, id }]);
    
    // Purchase with Credit Card -> increase card balance
    if (log.transactionType === 'Purchase' && log.paymentChannel === 'Credit Card' && log.creditCard) {
      setCards(prev => prev.map(card => card.cardName === log.creditCard ? { ...card, currentBalance: card.currentBalance + log.amount, totalCharges: card.totalCharges + log.amount } : card));
    }
    
    // Payment (Card Bill) -> decrease card balance AND reduce bank cash
    if (log.transactionType === 'Payment' && log.creditCard) {
      setCards(prev => prev.map(card => card.cardName === log.creditCard ? { ...card, currentBalance: card.currentBalance - log.amount, totalPayments: card.totalPayments + log.amount } : card));
    }

    // Any transaction that uses Bank/Autopay/Payment -> reduces bank balance
    if (log.paymentChannel === 'Bank' || log.paymentChannel === 'Autopay' || log.transactionType === 'Payment') {
      if (log.bank) {
        setAccounts(prev => prev.map(acc => acc.institution === log.bank ? { ...acc, balance: acc.balance - log.amount } : acc));
      }
    }
  };

  const updateExpense = (id: string, log: Partial<ExpenseLog>) => setExpenseLogs(prev => prev.map(item => item.id === id ? { ...item, ...log } : item));
  const deleteExpense = (id: string) => setExpenseLogs(prev => prev.filter(t => t.id !== id));
  
  const deleteTransaction = (id: string) => {
    setIncomeLogs(prev => prev.filter(t => t.id !== id));
    setExpenseLogs(prev => prev.filter(t => t.id !== id));
  };

  const addCard = (card: Omit<Card, 'id'>) => setCards(prev => [...prev, { ...card, id: Math.random().toString(36).substr(2, 9) }]);
  const editCard = (id: string, card: Partial<Card>) => setCards(prev => prev.map(item => item.id === id ? { ...item, ...card } : item));
  const deleteCard = (id: string) => setCards(prev => prev.filter(c => c.id !== id));
  
  const addAccount = (account: Omit<Account, 'id'>) => setAccounts(prev => [...prev, { ...account, id: Math.random().toString(36).substr(2, 9) }]);
  const editAccount = (id: string, account: Partial<Account>) => setAccounts(prev => prev.map(item => item.id === id ? { ...item, ...account } : item));
  const deleteAccount = (id: string) => setAccounts(prev => prev.filter(a => a.id !== id));
  
  const addInvestment = (inv: Omit<Investment, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setInvestments(prev => [...prev, { ...inv, id }]);
    
    // Reduce bank if it's a manual investment from bank
    if (!inv.payrollDeduction && inv.fromBank) {
      setAccounts(prev => prev.map(acc => acc.institution === inv.fromBank ? { ...acc, balance: acc.balance - inv.contribution } : acc));
    }
  };

  return (
    <AppContext.Provider value={{ 
      incomeLogs, expenseLogs, transactions, cards, accounts, investments, summary,
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
