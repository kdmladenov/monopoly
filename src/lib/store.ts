import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counter/counterSlice';
import gameReducer from './features/game/gameSlice';
import notificationsReducer from './features/notifications/notificationsSlice';
import { notificationMiddleware } from './store/middleware/notificationMiddleware';

export const makeStore = () => {
  return configureStore({
    reducer: {
      counter: counterReducer,
      game: gameReducer,
      notifications: notificationsReducer,
    },
    middleware: (getDefaultMiddleware) => 
      getDefaultMiddleware().concat(notificationMiddleware),
  });
};

export const store = makeStore();

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
