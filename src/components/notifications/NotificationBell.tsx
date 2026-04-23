'use client';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/lib/store';
import { toggleNotificationPanel } from '@/lib/features/notifications/notificationsSlice';
import { selectUnreadCount } from '@/lib/features/notifications/notificationSelectors';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { IconButton, Badge, Tooltip } from '@mui/material';

export const NotificationBell: React.FC = () => {
  const dispatch = useDispatch();
  const currentPlayer = useSelector((state: RootState) => state.game.players[state.game.currentPlayerIndex]);
  const unreadCount = useSelector(selectUnreadCount(currentPlayer?.id || ''));

  return (
    <Tooltip title="Notifications">
      <IconButton 
        onClick={() => dispatch(toggleNotificationPanel())}
        sx={{ border: '2px solid #94a3b8', color: '#1e293b' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};
