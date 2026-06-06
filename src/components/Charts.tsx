'use client';

import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useAppContext } from '@/context/AppContext';

interface MonthlyData {
  name: string;
  income: number;
  expenses: number;
}

interface CategoryTotal {
  [key: string]: number;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const Charts = () => {
  const { transactions } = useAppContext();
  const [pieFilter, setPieFilter] = useState<'income' | 'expense'>('expense');

  // 1. Process data for Monthly Bar Chart
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toLocaleString('en-US', { month: 'short' });
  }).reverse();

  const monthlyData: MonthlyData[] = last6Months.map(month => {
    const monthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.toLocaleString('en-US', { month: 'short' }) === month;
    });

    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    return { name: month, income, expenses };
  });

  // 2. Process data for Category Pie Chart (Dynamic based on Filter)
  const categories = transactions.reduce((acc: CategoryTotal, t) => {
    if (t.type === pieFilter) {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    }
    return acc;
  }, {});

  const colors: { [key: string]: string } = {
    // Expense Colors
    'Housing': '#f43f5e',
    'Groceries': '#f59e0b',
    'Dining': '#fbbf24',
    'Leisure': '#10b981',
    'Gifts': '#ec4899',
    'Travel': '#3b82f6',
    'Memberships': '#8b5cf6',
    'Autopay': '#6366f1',
    'Utility': '#d946ef',
    'Health': '#06b6d4',
    'Transport': '#14b8a6',
    'Credit Card': '#475569',
    // Income/Investment
    'Income': '#10b981',
    'Salary': '#059669',
    'Investment': '#6366f1',
    'Other': '#94a3b8'
  };

  const categoryData: CategoryData[] = Object.keys(categories).map(cat => ({
    name: cat,
    value: categories[cat],
    color: colors[cat] || colors['Other']
  }));

  const totalValue = Object.values(categories).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-in fade-in duration-1000">
      {/* Monthly Digest Chart */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:white tracking-tight">Monthly Digest</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Income vs Expenses</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Expenses</span>
            </div>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                tickFormatter={(value: number) => `$${value}`}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(37,99,235,0.03)' }}
                contentStyle={{ 
                  borderRadius: '20px', 
                  border: 'none', 
                  boxShadow: '0 25px 30px -5px rgb(0 0 0 / 0.15)',
                  padding: '16px',
                  backgroundColor: 'rgba(255,255,255,0.95)'
                }}
              />
              <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} barSize={10} />
              <Bar dataKey="expenses" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spending Flow Chart with Dynamic Filter */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Flow Analysis</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Distribution by Category</p>
          </div>
          
          <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
             {(['income', 'expense'] as const).map(f => (
               <button
                key={f}
                onClick={() => setPieFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${pieFilter === f ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {f}
               </button>
             ))}
          </div>
        </div>

        <div className="h-72 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData.length > 0 ? categoryData : [{ name: 'No Data', value: 1, color: '#f8fafc' }]}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={105}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 15px 20px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 text-center pointer-events-none">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
            <p className={`text-xl font-black ${pieFilter === 'income' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
              ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
