import React from 'react';

type ModalProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
};

export default function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={`w-full ${sizes[size]} rounded-xl bg-slate-900 border border-slate-700 shadow-2xl`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              className="text-slate-300 hover:text-white"
              onClick={onClose}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
          <div className="p-4">{children}</div>
          {footer && <div className="px-4 py-3 border-t border-slate-800">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
