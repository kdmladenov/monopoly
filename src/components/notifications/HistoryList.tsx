'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';

interface HistoryListProps {
  maxEntries?: number;
  compact?: boolean;
}

export const HistoryList: React.FC<HistoryListProps> = ({ 
  maxEntries,
  compact = false
}) => {
  const { history } = useSelector((state: RootState) => state.notifications);
  
  let displayedHistory = [...history].reverse();
  if (maxEntries) {
    displayedHistory = displayedHistory.slice(0, maxEntries);
  }

  if (history.length === 0) {
    return (
      <div className={`text-center ${compact ? 'py-4' : 'py-20'} text-gray-400 italic text-sm`}>
        No history recorded yet
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${compact ? 'max-h-[300px] overflow-y-auto pr-2' : ''}`}>
      {displayedHistory.map((entry) => (
        <div key={entry.id} className="relative pl-4 pb-1 border-l border-gray-100 last:border-l-0">
          <div className="absolute -left-[4px] top-1.5 w-2 h-2 rounded-full bg-blue-500/50" />
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] text-gray-400 font-bold uppercase shrink-0">T{entry.turn}</span>
            <div className={`flex-1 flex items-center gap-1.5 ${compact ? 'bg-white/5' : 'bg-gray-50/50'} rounded-md px-2 py-1 border border-gray-50 hover:border-blue-100 transition-colors`}>
              <span className="text-xs shrink-0">{entry.notification.icon}</span>
              <p className={`text-[10px] leading-tight ${compact ? 'text-gray-300' : 'text-gray-600'}`}>
                <span className="font-extrabold mr-1">{entry.notification.title}:</span>
                {entry.notification.message}
              </p>
              <span className="text-[8px] text-gray-300 ml-auto tabular-nums">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
