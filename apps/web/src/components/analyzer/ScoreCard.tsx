/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ScoreCardProps {
  title: string;
  score: number;
  description: string;
  color: 'success' | 'warning' | 'danger';
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  title,
  score,
  description,
  color,
}) => {
  const strokeColor = 
    color === 'success' 
      ? 'stroke-emerald-500' 
      : color === 'warning' 
        ? 'stroke-amber-500' 
        : 'stroke-rose-500';

  const textColor = 
    color === 'success' 
      ? 'text-emerald-400' 
      : color === 'warning' 
        ? 'text-amber-400' 
        : 'text-rose-400';

  const bgColor = 
    color === 'success' 
      ? 'bg-emerald-500/10' 
      : color === 'warning' 
        ? 'bg-amber-500/10' 
        : 'bg-rose-500/10';

  const border = 
    color === 'success' 
      ? 'border-emerald-500/20' 
      : color === 'warning' 
        ? 'border-amber-500/20' 
        : 'border-rose-500/20';

  // Circular progress calculation
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`p-3 rounded-lg border ${border} ${bgColor} flex items-center justify-between gap-3 select-none font-sans`}>
      <div className="space-y-1 min-w-0">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
          {title}
        </span>
        <h4 className={`text-base font-extrabold ${textColor} leading-none`}>
          {score}%
        </h4>
        <p className="text-[9px] text-slate-400 truncate leading-relaxed">
          {description}
        </p>
      </div>

      <div className="relative h-14 w-14 shrink-0 flex items-center justify-center">
        <svg className="absolute h-full w-full transform -rotate-90">
          <circle
            cx="28"
            cy="28"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="3.5"
            fill="transparent"
          />
          <circle
            cx="28"
            cy="28"
            r={radius}
            className={`${strokeColor} transition-all duration-300`}
            strokeWidth="3.5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className={`text-[11px] font-mono font-extrabold ${textColor}`}>
          {score}
        </span>
      </div>
    </div>
  );
};
