'use client';

import React from 'react';
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

  // 2. Process data for Category Pie Chart
  const categories = transactions.reduce((acc: CategoryTotal, t) => {
    if (t.type === 'expense') {
      acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
    }
    return acc;
  }, {});

  const colors: { [key: string]: string } = {
    'Entertainment': '#3b82f6',
    'Shopping': '#10b981',
    'Food': '#f59e0b',
    'Subscription': '#8b5cf6',
    'Housing': '#f43f5e',
    'Salary': '#22c55e',
    'Investment': '#6366f1',
    'Other': '#94a3b8'
  };

  const categoryData: CategoryData[] = Object.keys(categories).map(cat => ({
    name: cat,
    value: categories[cat],
    color: colors[cat] || colors['Other']
  }));

  const totalExpense = Object.values(categories).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-in fade-in duration-1000">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Monthly Digest</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Income vs Expenses</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Income</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
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
              <Bar dataKey="income" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={12} />
              <Bar dataKey="expenses" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-xl">
        <div className="mb-8">
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Spending Flow</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">By Category</p>
        </div>
        <div className="h-72 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData.length > 0 ? categoryData : [{ name: 'No Data', value: 1, color: '#f1f5f9' }]}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={105}
                paddingAngle={10}
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
                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 text-center pointer-events-none">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              ${totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;
