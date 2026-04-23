'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence } from 'framer-motion';
import { RootState } from '@/lib/store';
import { NotificationToast } from './NotificationToast';

export const NotificationContainer: React.FC = () => {
  const activeNotifications = useSelector((state: RootState) => 
    state.notifications.active.filter(n => !n.dismissed)
  );

  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col items-end pointer-events-none w-full max-w-[400px]">
      <AnimatePresence mode="popLayout">
        {activeNotifications.map((notification) => (
          <NotificationToast key={notification.id} notification={notification} />
        ))}
      </AnimatePresence>
    </div>
  );
};
