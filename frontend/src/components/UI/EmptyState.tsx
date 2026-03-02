import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}>
          <Icon size={28} />
        </div>
      )}
      <h3 className="font-semibold text-base mb-1" style={{ color: 'var(--text-1)' }}>{title}</h3>
      {description && <p className="text-sm mb-5 max-w-xs" style={{ color: 'var(--text-3)' }}>{description}</p>}
      {action}
    </div>
  );
}
