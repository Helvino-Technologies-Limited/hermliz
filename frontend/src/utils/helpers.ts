export const formatCurrency = (amount: number | string) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2 }).format(Number(amount) || 0);

export const formatDate = (date: string | null | undefined) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const daysUntil = (date: string) => {
  const today = new Date();
  const target = new Date(date);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    expired: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-700',
    pending: 'bg-yellow-100 text-yellow-700',
    renewed: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    partial: 'bg-orange-100 text-orange-700',
    overdue: 'bg-red-100 text-red-700',
    reported: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
    closed: 'bg-gray-100 text-gray-700',
    under_review: 'bg-purple-100 text-purple-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};

export const getInsuranceClassLabel = (cls: string) => {
  const labels: Record<string, string> = {
    motor_private: 'Motor - Private', motor_commercial: 'Motor - Commercial',
    motor_psv: 'Motor - PSV', medical: 'Medical', life: 'Life',
    education: 'Education', pension: 'Pension', travel: 'Travel',
    fire: 'Fire', public_liability: 'Public Liability',
    professional_indemnity: 'Professional Indemnity', other: 'Other',
  };
  return labels[cls] || cls;
};
