'use client';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { markAsRead, toggleNotificationPanel } from '@/lib/features/notifications/notificationsSlice';
import { selectUnreadCount } from '@/lib/features/notifications/notificationSelectors';

export const NotificationPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { active, ui } = useSelector((state: RootState) => state.notifications);
  const currentPlayer = useSelector((state: RootState) => state.game.players[state.game.currentPlayerIndex]);
  const unreadCount = useSelector(selectUnreadCount(currentPlayer?.id || ''));
  const isOpen = ui.showNotificationPanel;

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 right-6 w-96 max-h-[80vh] bg-white shadow-2xl rounded-xl border border-gray-100 z-[9001] flex flex-col overflow-hidden animate-in slide-in-from-top-2 duration-200">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        <button 
          onClick={() => dispatch(toggleNotificationPanel())}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {active.length === 0 ? (
          <div className="p-10 text-center text-gray-400 italic">
            All caught up!
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {active.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => dispatch(markAsRead({ notificationId: notification.id, playerId: currentPlayer?.id || '' }))}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!notification.read ? 'bg-blue-50/50' : ''}`}
              >
                <div className="text-xl">{notification.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className={`text-sm font-bold ${!notification.read ? 'text-blue-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </p>
                    {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-3 border-t bg-gray-50 text-center">
        <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
          View All
        </button>
      </div>
    </div>
  );
};
