'use client';

import React, { useState } from 'react';
import { useAppContext, Investment } from '@/context/AppContext';
import { 
  TrendingUp, 
  Edit2, 
  Trash2, 
  Plus, 
  Calendar, 
  Percent, 
  Loader2 
} from 'lucide-react';
import { translations, Language, formatDate } from '@/utils/translations';

export default function MobileInvestmentsView({ autoOpenModal, onModalClose }: MobileInvestmentsViewProps) {
  const { activeInvestments, addInvestment, editInvestment, deleteInvestment, accounts, settings, maskValue } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

  const currentLang = (settings?.language as Language) || 'en';
  const dateFormat = settings?.date_format || 'MM/DD/YYYY';
  const t = translations[currentLang];

  // Form State
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
    if (isModalOpen && !editingInvestment) {
      resetForm();
    } else if (editingInvestment) {
      setInstitution(editingInvestment.institution);
      setContribution(editingInvestment.contribution.toString());
      setBalance(editingInvestment.currentBalance.toString());
      setPayrollDeduction(editingInvestment.payrollDeduction || false);
      setFromBank(editingInvestment.fromBank || '');
      setTenor(editingInvestment.tenor || '');
      setRate(editingInvestment.rate?.toString() || '');
      setValueDate(editingInvestment.value_date || '');
      setMaturityDate(editingInvestment.maturity_date || '');
    }
  }, [isModalOpen, editingInvestment]);

  useEffect(() => {
    if (autoOpenModal) {
      handleOpenModal();
    }
  }, [autoOpenModal]);

  const handleOpenModal = (inv: Investment | null = null) => {
    setEditingInvestment(inv);
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
        accountType: 'Investment',
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
      {/* ... rest of the view JSX ... */}
    </div>
  );
}

interface MobileInvestmentsViewProps {
  autoOpenModal?: boolean;
  onModalClose?: () => void;
}
