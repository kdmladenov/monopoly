'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '@/lib/store';
import { toggleHistoryLog } from '@/lib/features/notifications/notificationsSlice';
import { HistoryList } from './HistoryList';

export const HistoryLog: React.FC = () => {
  const dispatch = useDispatch();
  const { history, ui } = useSelector((state: RootState) => state.notifications);
  const show = ui.showHistoryLog;

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(toggleHistoryLog())}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9000]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[9001] flex flex-col"
          >
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">Game History</h2>
              <button 
                onClick={() => dispatch(toggleHistoryLog())}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <HistoryList />
            </div>
            
            <div className="p-4 border-t bg-gray-50 text-center text-xs text-gray-400">
               {history.length} events recorded
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
