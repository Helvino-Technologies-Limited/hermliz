import type { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange';
  subtitle?: string;
  trend?: string;
}

const colorMap = {
  blue:   { bg: '#ebf0ff', icon: '#1a56db', text: '#1342b0' },
  green:  { bg: '#dcfce7', icon: '#16a34a', text: '#15803d' },
  red:    { bg: '#fee2e2', icon: '#dc2626', text: '#b91c1c' },
  yellow: { bg: '#fef9c3', icon: '#ca8a04', text: '#a16207' },
  purple: { bg: '#f3e8ff', icon: '#9333ea', text: '#7e22ce' },
  orange: { bg: '#ffedd5', icon: '#ea580c', text: '#c2410c' },
};

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle, trend }: Props) {
  const c = colorMap[color];
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-3)' }}>{title}</p>
        {Icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: c.bg }}>
            <Icon size={18} style={{ color: c.icon }} />
          </div>
        )}
      </div>
      <p className="font-bold num" style={{ fontSize: 'clamp(18px, 4vw, 26px)', color: 'var(--text-1)' }}>{value}</p>
      {subtitle && <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{subtitle}</p>}
      {trend && <p className="text-xs mt-1 font-medium" style={{ color: c.text }}>{trend}</p>}
    </div>
  );
}
