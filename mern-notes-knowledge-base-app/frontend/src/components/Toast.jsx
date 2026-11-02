import React, { useEffect } from 'react';
import { useNotes } from '../context/NotesContext.jsx';

export default function Toast() {
  const { toast, hideToast } = useNotes();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      hideToast();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-50 flex items-center justify-between sm:justify-start gap-2.5 px-4 py-3 rounded-xl shadow-xl bg-inverse-surface text-inverse-on-surface border border-outline/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 max-w-sm sm:max-w-md"
      role="status"
    >
      <span
        className={`material-symbols-outlined text-lg ${
          isSuccess ? 'text-primary-fixed' : isError ? 'text-error-container' : 'text-primary-fixed-dim'
        }`}
      >
        {isSuccess ? 'check_circle' : isError ? 'error' : 'info'}
      </span>
      <span className="font-body-sm text-body-sm">{toast.message}</span>
      <button
        onClick={hideToast}
        className="ml-2 text-inverse-on-surface/60 hover:text-inverse-on-surface p-1 rounded transition-colors"
        aria-label="Dismiss"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}
