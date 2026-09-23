import React from 'react';

const ProgressBar = ({ progress = 0, size = 'md', showLabel = true, className = '' }) => {
  const safeProgress = Math.min(100, Math.max(0, progress));

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const getColor = (val) => {
    if (val >= 100) return 'bg-emerald-500';
    if (val >= 60) return 'bg-indigo-600';
    if (val >= 30) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-semibold text-slate-600">
          <span>Project Completion</span>
          <span className="text-slate-900">{safeProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heights[size] || heights.md}`}>
        <div
          className={`${getColor(safeProgress)} ${heights[size] || heights.md} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
