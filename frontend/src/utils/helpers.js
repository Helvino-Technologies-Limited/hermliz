export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2 }).format(amount || 0);

export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const daysUntil = (date) => {
  const today = new Date();
  const target = new Date(date);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
};

export const getStatusColor = (status) => {
  const colors = {
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

export const getInsuranceClassLabel = (cls) => {
  const labels = {
    motor_private: 'Motor - Private', motor_commercial: 'Motor - Commercial',
    motor_psv: 'Motor - PSV', medical: 'Medical', life: 'Life',
    education: 'Education', pension: 'Pension', travel: 'Travel',
    fire: 'Fire', public_liability: 'Public Liability',
    professional_indemnity: 'Professional Indemnity', other: 'Other',
  };
  return labels[cls] || cls;
};

export const classifyRisk = (daysUntil) => {
  if (daysUntil <= 7) return { label: 'Critical', color: 'text-red-600 bg-red-50' };
  if (daysUntil <= 14) return { label: 'High', color: 'text-orange-600 bg-orange-50' };
  if (daysUntil <= 30) return { label: 'Medium', color: 'text-yellow-600 bg-yellow-50' };
  return { label: 'Normal', color: 'text-green-600 bg-green-50' };
};
