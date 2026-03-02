const { Policy } = require('../models');

const generatePolicyNumber = async (insuranceClass) => {
  const prefixes = {
    motor_private: 'MP', motor_commercial: 'MC', motor_psv: 'MV',
    medical: 'MD', life: 'LF', education: 'ED', pension: 'PN',
    travel: 'TV', fire: 'FR', public_liability: 'PL',
    professional_indemnity: 'PI', other: 'OT',
  };
  const prefix = prefixes[insuranceClass] || 'XX';
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await Policy.count();
  const num = String(count + 1).padStart(5, '0');
  return `HIA-${prefix}-${year}-${num}`;
};

module.exports = generatePolicyNumber;
