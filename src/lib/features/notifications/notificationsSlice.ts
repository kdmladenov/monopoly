import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  Notification, 
  HistoryEntry, 
  NotificationFilter, 
  NotificationPreferences, 
  NotificationPriority 
} from '@/types/notifications';

interface NotificationsState {
  active: Notification[];
  history: HistoryEntry[];
  unreadCount: Record<string, number>;
  preferences: Record<string, NotificationPreferences>;
  ui: {
    showNotificationPanel: boolean;
    showHistoryLog: boolean;
    filter: NotificationFilter;
    expandedNotifications: string[];
  };
  currentTurn: number;
}

const initialState: NotificationsState = {
  active: [],
  history: [],
  unreadCount: {},
  preferences: {},
  ui: {
    showNotificationPanel: false,
    showHistoryLog: false,
    filter: {},
    expandedNotifications: [],
  },
  currentTurn: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      const notification = action.payload;
      state.active.unshift(notification);
      
      state.history.push({
        id: `history-${notification.id}`,
        turn: state.currentTurn,
        timestamp: notification.timestamp,
        notification,
      });

      if (notification.isGlobal) {
        Object.keys(state.unreadCount).forEach(playerId => {
          state.unreadCount[playerId] = (state.unreadCount[playerId] || 0) + 1;
        });
      } else {
        notification.targetPlayerIds.forEach(playerId => {
          state.unreadCount[playerId] = (state.unreadCount[playerId] || 0) + 1;
        });
      }

      if (state.active.length > 50) {
        state.active = state.active.slice(0, 50);
      }
    },
    markAsRead: (state, action: PayloadAction<{ notificationId: string; playerId: string }>) => {
      const { notificationId, playerId } = action.payload;
      const notification = state.active.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount[playerId] = Math.max(0, (state.unreadCount[playerId] || 0) - 1);
      }
    },
    dismissNotification: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const index = state.active.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        state.active[index].dismissed = true;
      }
    },
    clearDismissed: (state) => {
      state.active = state.active.filter(n => !n.dismissed);
    },
    toggleHistoryLog: (state) => {
      state.ui.showHistoryLog = !state.ui.showHistoryLog;
    },
    toggleNotificationPanel: (state) => {
      state.ui.showNotificationPanel = !state.ui.showNotificationPanel;
    },
    markAllAsRead: (state, action: PayloadAction<string>) => {
      const playerId = action.payload;
      state.active.forEach(n => {
        if (n.targetPlayerIds.includes(playerId) || n.isGlobal) {
          n.read = true;
        }
      });
      state.unreadCount[playerId] = 0;
    },
    setFilter: (state, action: PayloadAction<NotificationFilter>) => {
      state.ui.filter = action.payload;
    },
    incrementTurn: (state) => {
      state.currentTurn++;
    },
    initializePlayer: (state, action: PayloadAction<string>) => {
      const playerId = action.payload;
      state.unreadCount[playerId] = 0;
      state.preferences[playerId] = {
        playerId,
        enableSound: true,
        enableVisual: true,
        mutedCategories: [],
        minimumPriority: NotificationPriority.LOW,
      };
    }
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  clearDismissed,
  toggleHistoryLog,
  toggleNotificationPanel,
  setFilter,
  incrementTurn,
  initializePlayer,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
