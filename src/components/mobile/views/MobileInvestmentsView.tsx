'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext, Investment } from '@/context/AppContext';
import { TrendingUp, Edit2, Trash2, Plus, Calendar, Percent, Loader2, X } from 'lucide-react';
import { translations, Language, formatDate } from '@/utils/translations';

interface MobileInvestmentsViewProps {
  autoOpenModal?: boolean;
  onModalClose?: () => void;
}

export default function MobileInvestmentsView({ autoOpenModal, onModalClose }: MobileInvestmentsViewProps) {
  const { activeInvestments, addInvestment, editInvestment, deleteInvestment, accounts, settings, maskValue } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

  const currentLang = (settings?.language as Language) || 'en';
  const dateFormat = settings?.date_format || 'MM/DD/YYYY';
  const t = translations[currentLang];

  const [institution, setInstitution] = useState('');
  const [contribution, setContribution] = useState('');
  const [balance, setBalance] = useState('');
  const [payrollDeduction, setPayrollDeduction] = useState(false);
  const [fromBank, setFromBank] = useState('');
  const [tenor, setTenor] = useState('');
  const [rate, setRate] = useState('');
  const [valueDate, setValueDate] = useState('');
  const [maturityDate, setMaturityDate] = useState('');

  const resetForm = () => {
    setInstitution('');
    setContribution('');
    setBalance('');
    setPayrollDeduction(false);
    setFromBank('');
    setTenor('');
    setRate('');
    setValueDate('');
    setMaturityDate('');
  };
  
  useEffect(() => {
    if (autoOpenModal) {
      handleOpenModal();
    }
  }, [autoOpenModal]);

  const handleOpenModal = (inv: Investment | null = null) => {
    if (inv) {
      setEditingInvestment(inv);
      setInstitution(inv.institution);
      setContribution(inv.contribution.toString());
      setBalance(inv.currentBalance.toString());
      setPayrollDeduction(inv.payrollDeduction || false);
      setFromBank(inv.fromBank || '');
      setTenor(inv.tenor || '');
      setRate(inv.rate?.toString() || '');
      setValueDate(inv.value_date || '');
      setMaturityDate(inv.maturity_date || '');
    } else {
      resetForm();
      setEditingInvestment(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInvestment(null);
    if (onModalClose) onModalClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        date: editingInvestment ? editingInvestment.date : new Date().toISOString().split('T')[0],
        institution,
        accountType: 'Investment' as const,
        contribution: parseFloat(contribution) || 0,
        currentBalance: parseFloat(balance) || 0,
        payrollDeduction,
        fromBank: !payrollDeduction ? fromBank : undefined,
        monthKey: editingInvestment ? editingInvestment.monthKey : new Date().toISOString().slice(0, 7),
        ...(institution === 'CD' ? {
          tenor,
          rate: rate ? parseFloat(rate) : 0,
          value_date: valueDate || null,
          maturity_date: maturityDate || null
        } : {})
      };

      if (editingInvestment) {
        await editInvestment(editingInvestment.id, data);
      } else {
        await addInvestment(data);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving investment:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm(t.deleteThisRecord)) {
      deleteInvestment(id);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
       {/* ... view content ... */}
    </div>
  );
}
