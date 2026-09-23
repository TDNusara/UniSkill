import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...', fullPage = false }) => {
  if (fullPage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-9 h-9 text-indigo-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">{text}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8 gap-3">
      <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      <span className="text-sm font-medium text-slate-500">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
