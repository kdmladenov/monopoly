import { Middleware } from '@reduxjs/toolkit';
import { addNotification, incrementTurn } from '@/lib/features/notifications/notificationsSlice';
import NotificationGenerator from '@/lib/services/NotificationGenerator';
import { NotificationType, NotificationData } from '@/types/notifications';
import { RootState } from '../store';

export const notificationMiddleware: Middleware<{}, RootState> = (store) => (next) => (action: any) => {
  const result = next(action);
  const generator = NotificationGenerator.getInstance();

  // Map core game actions to notifications
  switch (action.type) {
    case 'game/purchaseProperty': {
      const state = store.getState();
      const player = state.game.players.find(p => p.id === action.payload.playerId);
      const square = state.game.board[action.payload.propertyPosition];
      
      if (player && square) {
        store.dispatch(addNotification(generator.generate(
          NotificationType.PROPERTY_PURCHASED,
          {
            playerName: player.name,
            propertyName: square.property?.name || square.transportation?.name || 'Property',
            amount: square.property?.price || square.transportation?.price || 0
          }
        )));
      }
      break;
    }
    case 'game/payRent': {
      const state = store.getState();
      const fromPlayer = state.game.players.find(p => p.id === action.payload.fromPlayerId);
      const toPlayer = state.game.players.find(p => p.id === action.payload.toPlayerId);
      
      if (fromPlayer && toPlayer) {
        store.dispatch(addNotification(generator.generate(
          NotificationType.RENT_PAID,
          {
            playerName: fromPlayer.name,
            toPlayerName: toPlayer.name,
            amount: action.payload.amount,
            propertyName: 'Property' // Rent payload doesn't always have prop name, could enhance slice
          }
        )));
      }
      break;
    }
    case 'game/startAuction': {
      const state = store.getState();
      const square = state.game.board[action.payload.propertyPosition];
      if (square) {
        store.dispatch(addNotification(generator.generate(
          NotificationType.PROPERTY_AUCTIONED,
          { propertyName: square.property?.name || square.transportation?.name || 'Property' }
        )));
      }
      break;
    }
    case 'game/resolveLandingEffect': {
       if (action.payload.effect === 'goToJail') {
          const state = store.getState();
          const player = state.game.players[state.game.currentPlayerIndex];
          if (player) {
            store.dispatch(addNotification(generator.generate(
              NotificationType.SENT_TO_JAIL,
              { playerName: player.name }
            )));
          }
       }
       break;
    }
    case 'game/endTurn': {
      store.dispatch(incrementTurn());
      break;
    }
  }

  return result;
};
