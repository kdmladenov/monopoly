import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '@/lib/store';
import { NotificationCategory, NotificationPriority, NotificationType } from '@/types/notifications';

export const selectNotifications = (state: RootState) => state.notifications;
export const selectActiveNotifications = (state: RootState) => state.notifications.active;
export const selectHistory = (state: RootState) => state.notifications.history;
export const selectFilter = (state: RootState) => state.notifications.ui.filter;

export const selectUnreadCount = (playerId: string) => (state: RootState) =>
  state.notifications.unreadCount[playerId] || 0;

export const selectFilteredHistory = createSelector(
  [selectHistory, selectFilter],
  (history, filter) => {
    let filtered = [...history];
    
    if (filter.searchText) {
      const searchLower = filter.searchText.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.notification.title.toLowerCase().includes(searchLower) ||
          h.notification.message.toLowerCase().includes(searchLower)
      );
    }
    
    if (filter.categories && filter.categories.length > 0) {
      filtered = filtered.filter((h) => filter.categories!.includes(h.notification.category));
    }
    
    return filtered;
  }
);

export const selectHistoryByTurn = createSelector(
  [selectHistory],
  (history) => {
    return history.reduce((acc, entry) => {
      if (!acc[entry.turn]) {
        acc[entry.turn] = [];
      }
      acc[entry.turn].push(entry);
      return acc;
    }, {} as Record<number, any[]>);
  }
);
