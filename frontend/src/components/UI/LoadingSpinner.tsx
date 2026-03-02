export default function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-9 h-9 rounded-full border-[3px] border-blue-100 border-t-blue-600 animate-spin" />
      <p className="text-sm" style={{ color: 'var(--text-3)' }}>{text}</p>
    </div>
  );
}
