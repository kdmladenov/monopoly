'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { dismissNotification } from '@/lib/features/notifications/notificationsSlice';
import { Notification, NotificationPriority } from '@/types/notifications';

interface NotificationToastProps {
  notification: Notification;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
}) => {
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(100);
  
  // Timer effect
  useEffect(() => {
    if (!notification.expiresAt) return;
    
    const duration = notification.expiresAt - Date.now();
    if (duration <= 0) {
       dispatch(dismissNotification(notification.id));
       return;
    }
    
    const interval = 50;
    const decrement = (100 * interval) / duration;
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - decrement;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [notification.expiresAt, notification.id, dispatch]);

  // Dismiss effect when progress hits zero
  useEffect(() => {
    if (progress <= 0) {
      dispatch(dismissNotification(notification.id));
    }
  }, [progress, notification.id, dispatch]);
  
  const getPriorityStyles = () => {
    switch (notification.priority) {
      case NotificationPriority.CRITICAL:
        return 'border-red-500 bg-red-50 text-red-900 border-l-4';
      case NotificationPriority.HIGH:
        return 'border-orange-500 bg-orange-50 text-orange-900 border-l-4';
      case NotificationPriority.MEDIUM:
        return 'border-blue-500 bg-blue-50 text-blue-900 border-l-4';
      default:
        return 'border-gray-500 bg-white text-gray-900 border-l-4';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`
        relative overflow-hidden rounded px-3 py-1 shadow-md mb-1.5 flex items-center gap-2.5
        ${getPriorityStyles()}
        min-w-[280px] pointer-events-auto backdrop-blur-md bg-opacity-95
      `}
    >
      <div className="text-sm shrink-0">{notification.icon || '📢'}</div>
      <div className="flex-1 min-w-0 flex items-center overflow-hidden">
        <p className="text-[11px] font-bold truncate tracking-tight">{notification.message}</p>
      </div>
      <button 
        onClick={() => dispatch(dismissNotification(notification.id))}
        className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 flex items-center justify-center w-4 h-4 text-[10px]"
      >
        ✕
      </button>

      {notification.expiresAt && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-10">
          <div 
            className="h-full bg-current opacity-30 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
};
