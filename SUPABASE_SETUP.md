# Supabase Setup Instructions

Execute the following SQL in your Supabase SQL Editor to create the necessary tables and set up Row Level Security (RLS).

## 1. Create Tables

```sql
-- Bank Accounts Table
create table bank_accounts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  institution text not null,
  type text not null,
  balance decimal(12,2) default 0,
  starting_balance decimal(12,2) default 0,
  as_of_date date,
  projected_balance decimal(12,2),
  variance_vs_projected decimal(12,2),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Credit Cards Table
create table credit_cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  cardName text not null,
  creditLimit decimal(12,2) default 0,
  currentBalance decimal(12,2) default 0,
  totalCharges decimal(12,2) default 0,
  totalPayments decimal(12,2) default 0,
  availableCredit decimal(12,2) default 0,
  utilization decimal(12,2) default 0,
  dueDay text,
  annualFee decimal(12,2) default 0,
  renewalMonth text,
  expiry text,
  color text,
  type text default 'Credit',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Income Log Table
create table income_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  source text not null,
  paycheckLabel text,
  amount decimal(12,2) not null,
  depositBank text,
  monthKey text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Expense Log Table
create table expense_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  transactionType text not null,
  category text not null,
  subcategory text,
  description text not null,
  occasionPurpose text,
  amount decimal(12,2) not null,
  paymentChannel text not null,
  bank text,
  creditCard text,
  paymentPlan text default 'One-time',
  currentInstallment int,
  totalInstallments int,
  status text default 'Paid',
  amountPaid decimal(12,2) default 0,
  monthKey text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Investments Table
create table investments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  institution text not null,
  accountType text not null,
  contribution decimal(12,2) default 0,
  currentBalance decimal(12,2) default 0,
  fromBank text,
  payrollDeduction boolean default false,
  monthKey text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## 2. Enable Row Level Security (RLS)

```sql
alter table bank_accounts enable row level security;
alter table credit_cards enable row level security;
alter table income_log enable row level security;
alter table expense_log enable row level security;
alter table investments enable row level security;
```

## 3. Create RLS Policies

```sql
-- Policies for bank_accounts
create policy "Users can view own bank_accounts" on bank_accounts for select using (auth.uid() = user_id);
create policy "Users can insert own bank_accounts" on bank_accounts for insert with check (auth.uid() = user_id);
create policy "Users can update own bank_accounts" on bank_accounts for update using (auth.uid() = user_id);
create policy "Users can delete own bank_accounts" on bank_accounts for delete using (auth.uid() = user_id);

-- Policies for credit_cards
create policy "Users can view own credit_cards" on credit_cards for select using (auth.uid() = user_id);
create policy "Users can insert own credit_cards" on credit_cards for insert with check (auth.uid() = user_id);
create policy "Users can update own credit_cards" on credit_cards for update using (auth.uid() = user_id);
create policy "Users can delete own credit_cards" on credit_cards for delete using (auth.uid() = user_id);

-- Policies for income_log
create policy "Users can view own income_log" on income_log for select using (auth.uid() = user_id);
create policy "Users can insert own income_log" on income_log for insert with check (auth.uid() = user_id);
create policy "Users can update own income_log" on income_log for update using (auth.uid() = user_id);
create policy "Users can delete own income_log" on income_log for delete using (auth.uid() = user_id);

-- Policies for expense_log
create policy "Users can view own expense_log" on expense_log for select using (auth.uid() = user_id);
create policy "Users can insert own expense_log" on expense_log for insert with check (auth.uid() = user_id);
create policy "Users can update own expense_log" on expense_log for update using (auth.uid() = user_id);
create policy "Users can delete own expense_log" on expense_log for delete using (auth.uid() = user_id);

-- Policies for investments
create policy "Users can view own investments" on investments for select using (auth.uid() = user_id);
create policy "Users can insert own investments" on investments for insert with check (auth.uid() = user_id);
create policy "Users can update own investments" on investments for update using (auth.uid() = user_id);
create policy "Users can delete own investments" on investments for delete using (auth.uid() = user_id);
```
