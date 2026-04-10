// @vitest-environment jsdom

import type { ReactNode } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import gameReducer, { setBoard, setPlayers } from '@/lib/features/game/gameSlice';
import { initialGameState } from '@/lib/gameState';
import { AIDifficulty, AIStyle, GamePhase, PlayerType, SquareType, TurnPhase } from '@/lib/game.types';
import { makeStore } from '@/lib/store';
import { useGameTurnController } from './useGameTurnController';

function makeWrapper(store = makeStore()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('useGameTurnController', () => {
  it('routes bankruptcy through the store and advances the turn', () => {
    const store = makeStore();
    store.dispatch(
      setPlayers([
        {
          id: 'player_1',
          name: 'Player 1',
          type: 'human',
          avatar: 'lion',
          color: '#f97316',
          money: 0,
          position: 0,
          isInJail: false,
          jailTurns: 0,
          consecutiveDoubles: 0,
          ownedProperties: [],
          isBankrupt: false,
          turnOrder: 0,
        },
        {
          id: 'player_2',
          name: 'Player 2',
          type: 'human',
          avatar: 'globe',
          color: '#38bdf8',
          money: 1000,
          position: 0,
          isInJail: false,
          jailTurns: 0,
          consecutiveDoubles: 0,
          ownedProperties: [],
          isBankrupt: false,
          turnOrder: 1,
        },
      ])
    );
    store.dispatch(
      setBoard([
        {
          id: 'square_0',
          position: 0,
          type: SquareType.SPECIAL,
          special: {
            type: 'start',
            name: 'Start',
          },
        },
      ])
    );

    const { result } = renderHook(() => useGameTurnController(), {
      wrapper: makeWrapper(store),
    });

    act(() => {
      result.current.handleBankruptcy();
    });

    const state = store.getState().game;
    expect(state.players[0].isBankrupt).toBe(true);
    expect(state.turn).toBe(2);
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.activityLog[0]).toBe('Player 1 declared bankruptcy.');
    expect(state.phase).toBe(GamePhase.ENDED);
  });

  it('auto-rolls AI turns', () => {
    vi.useFakeTimers();

    try {
      vi.spyOn(Math, 'random').mockReturnValue(0.1);

      const store = makeStore();
      store.dispatch(
        setPlayers([
          {
            id: 'player_1',
            name: 'AI 1',
            type: PlayerType.AI,
            aiDifficulty: AIDifficulty.BEGINNER,
            avatar: 'globe',
            color: '#38bdf8',
            money: 40000,
            position: 0,
            isInJail: false,
            jailTurns: 0,
            consecutiveDoubles: 0,
            ownedProperties: [],
            isBankrupt: false,
            turnOrder: 0,
          },
        ])
      );
      store.dispatch(
        setBoard([
          {
            id: 'square_0',
            position: 0,
            type: SquareType.SPECIAL,
            special: {
              type: 'start',
              name: 'Start',
            },
          },
        ])
      );
      store.dispatch({ type: 'game/startGame' });

      renderHook(() => useGameTurnController(), {
        wrapper: makeWrapper(store),
      });

      act(() => {
        vi.runAllTimers();
      });

      const state = store.getState().game;
      expect(state.turnPhase).not.toBe(TurnPhase.ROLL_DICE);
    } finally {
      vi.useRealTimers();
      vi.restoreAllMocks();
    }
  });

  it('lets AI build during an end-turn decision', () => {
    vi.useFakeTimers();

    try {
      const preloadedGame = structuredClone(initialGameState);
      preloadedGame.phase = GamePhase.PLAYING;
      preloadedGame.turnPhase = TurnPhase.END_TURN;
      preloadedGame.players = [
        {
          id: 'player_1',
          name: 'AI 1',
          type: PlayerType.AI,
          aiDifficulty: AIDifficulty.ADVANCED,
          avatar: 'globe',
          color: '#38bdf8',
          money: 1100,
          position: 0,
          isInJail: false,
          jailTurns: 0,
          consecutiveDoubles: 0,
          ownedProperties: [],
          isBankrupt: false,
          turnOrder: 0,
        },
      ];
      preloadedGame.board = [
        {
          id: 'square_1',
          position: 1,
          type: SquareType.PROPERTY,
          property: {
            id: 'property_1',
            name: 'Alpha',
            type: SquareType.PROPERTY,
            position: 1,
            country: 'Test',
            color: 'red',
            price: 100,
            rentStructure: {
              base: 10,
              house1: 20,
              house2: 30,
              house3: 40,
              house4: 50,
              hotel: 60,
            },
            housePrice: 50,
            mortgageValue: 25,
            ownerId: 'player_1',
            houses: 0,
            isMortgaged: false,
          },
        },
        {
          id: 'square_2',
          position: 2,
          type: SquareType.PROPERTY,
          property: {
            id: 'property_2',
            name: 'Beta',
            type: SquareType.PROPERTY,
            position: 2,
            country: 'Test',
            color: 'red',
            price: 100,
            rentStructure: {
              base: 10,
              house1: 20,
              house2: 30,
              house3: 40,
              house4: 50,
              hotel: 60,
            },
            housePrice: 50,
            mortgageValue: 25,
            ownerId: 'player_1',
            houses: 0,
            isMortgaged: false,
          },
        },
      ];

      const store = configureStore({
        reducer: {
          game: gameReducer,
        },
        preloadedState: {
          game: preloadedGame,
        },
      });

      renderHook(() => useGameTurnController(), {
        wrapper: makeWrapper(store),
      });

      act(() => {
        vi.runAllTimers();
      });

      const state = store.getState().game;
      expect(state.board[0].property?.houses).toBe(1);
      expect(state.players[0].money).toBe(1050);
    } finally {
      vi.useRealTimers();
      vi.restoreAllMocks();
    }
  });

  it('lets AI sell a house before mortgaging during an end-turn decision', () => {
    vi.useFakeTimers();

    try {
      const preloadedGame = structuredClone(initialGameState);
      preloadedGame.phase = GamePhase.PLAYING;
      preloadedGame.turnPhase = TurnPhase.END_TURN;
      preloadedGame.players = [
        {
          id: 'player_1',
          name: 'AI 1',
          type: PlayerType.AI,
          aiDifficulty: AIDifficulty.BEGINNER,
          avatar: 'globe',
          color: '#38bdf8',
          money: 1000,
          position: 0,
          isInJail: false,
          jailTurns: 0,
          consecutiveDoubles: 0,
          ownedProperties: [],
          isBankrupt: false,
          turnOrder: 0,
        },
      ];
      preloadedGame.board = [
        {
          id: 'square_1',
          position: 1,
          type: SquareType.PROPERTY,
          property: {
            id: 'property_1',
            name: 'Alpha',
            type: SquareType.PROPERTY,
            position: 1,
            country: 'Test',
            color: 'red',
            price: 100,
            rentStructure: {
              base: 10,
              house1: 20,
              house2: 30,
              house3: 40,
              house4: 50,
              hotel: 60,
            },
            housePrice: 50,
            mortgageValue: 25,
            ownerId: 'player_1',
            houses: 1,
            isMortgaged: false,
          },
        },
        {
          id: 'square_2',
          position: 2,
          type: SquareType.PROPERTY,
          property: {
            id: 'property_2',
            name: 'Beta',
            type: SquareType.PROPERTY,
            position: 2,
            country: 'Test',
            color: 'red',
            price: 100,
            rentStructure: {
              base: 10,
              house1: 20,
              house2: 30,
              house3: 40,
              house4: 50,
              hotel: 60,
            },
            housePrice: 50,
            mortgageValue: 25,
            ownerId: 'player_1',
            houses: 0,
            isMortgaged: false,
          },
        },
      ];

      const store = configureStore({
        reducer: {
          game: gameReducer,
        },
        preloadedState: {
          game: preloadedGame,
        },
      });

      renderHook(() => useGameTurnController(), {
        wrapper: makeWrapper(store),
      });

      act(() => {
        vi.runAllTimers();
      });

      const state = store.getState().game;
      expect(state.board[0].property?.houses).toBe(0);
      expect(state.players[0].money).toBe(1025);
    } finally {
      vi.useRealTimers();
      vi.restoreAllMocks();
    }
  });

  it('starts an auction when a player cannot buy a property', () => {
    const preloadedGame = structuredClone(initialGameState);
    preloadedGame.phase = GamePhase.PLAYING;
    preloadedGame.turnPhase = TurnPhase.ACTION;
    preloadedGame.settings.enableAuctions = true;
    preloadedGame.players = [
      {
        id: 'player_1',
        name: 'Player 1',
        type: PlayerType.HUMAN,
        avatar: 'lion',
        color: '#f97316',
        money: 100,
        position: 1,
        isInJail: false,
        jailTurns: 0,
        consecutiveDoubles: 0,
        ownedProperties: [],
        isBankrupt: false,
        turnOrder: 0,
      },
      {
        id: 'player_2',
        name: 'AI 1',
        type: PlayerType.AI,
        aiDifficulty: AIDifficulty.ADVANCED,
        aiStyle: AIStyle.AGGRESSIVE,
        avatar: 'globe',
        color: '#38bdf8',
        money: 5000,
        position: 0,
        isInJail: false,
        jailTurns: 0,
        consecutiveDoubles: 0,
        ownedProperties: [],
        isBankrupt: false,
        turnOrder: 1,
      },
    ];
    preloadedGame.currentPlayerIndex = 0;
    preloadedGame.board = [
      {
        id: 'square_0',
        position: 0,
        type: SquareType.SPECIAL,
        special: {
          type: 'start',
          name: 'Start',
        },
      },
      {
        id: 'square_1',
        position: 1,
        type: SquareType.PROPERTY,
        property: {
          id: 'property_1',
          name: 'Auction Island',
          type: SquareType.PROPERTY,
          position: 1,
          country: 'Test',
          color: 'green',
          price: 400,
          rentStructure: {
            base: 40,
            house1: 80,
            house2: 120,
            house3: 160,
            house4: 200,
            hotel: 240,
          },
          housePrice: 200,
          mortgageValue: 200,
          ownerId: null,
          houses: 0,
          isMortgaged: false,
        },
      },
    ];

    const store = configureStore({
      reducer: {
        game: gameReducer,
      },
      preloadedState: {
        game: preloadedGame,
      },
    });

    const { result } = renderHook(() => useGameTurnController(), {
      wrapper: makeWrapper(store),
    });

    act(() => {
      result.current.handleLandingAction();
    });

    const state = store.getState().game;
    expect(state.auction.active).toBe(true);
    expect(state.auction.propertyPosition).toBe(1);
    expect(state.activityLog[0]).toBe('Auction started for Auction Island.');
  });

  it('keeps an auction active across bids until the round ends', () => {
    const preloadedGame = structuredClone(initialGameState);
    preloadedGame.phase = GamePhase.PLAYING;
    preloadedGame.turnPhase = TurnPhase.ACTION;
    preloadedGame.settings.enableAuctions = true;
    preloadedGame.players = [
      {
        id: 'player_1',
        name: 'Player 1',
        type: PlayerType.HUMAN,
        avatar: 'lion',
        color: '#f97316',
        money: 100,
        position: 1,
        isInJail: false,
        jailTurns: 0,
        consecutiveDoubles: 0,
        ownedProperties: [],
        isBankrupt: false,
        turnOrder: 0,
      },
    ];
    preloadedGame.currentPlayerIndex = 0;
    preloadedGame.board = [
      {
        id: 'square_0',
        position: 0,
        type: SquareType.SPECIAL,
        special: {
          type: 'start',
          name: 'Start',
        },
      },
      {
        id: 'square_1',
        position: 1,
        type: SquareType.PROPERTY,
        property: {
          id: 'property_1',
          name: 'Auction Island',
          type: SquareType.PROPERTY,
          position: 1,
          country: 'Test',
          color: 'green',
          price: 400,
          rentStructure: {
            base: 40,
            house1: 80,
            house2: 120,
            house3: 160,
            house4: 200,
            hotel: 240,
          },
          housePrice: 200,
          mortgageValue: 200,
          ownerId: null,
          houses: 0,
          isMortgaged: false,
        },
      },
    ];

    const store = configureStore({
      reducer: {
        game: gameReducer,
      },
      preloadedState: {
        game: preloadedGame,
      },
    });

    const { result } = renderHook(() => useGameTurnController(), {
      wrapper: makeWrapper(store),
    });

    act(() => {
      result.current.handleStartAuction();
      result.current.handlePlaceAuctionBid(50);
    });

    const midState = store.getState().game;
    expect(midState.auction.active).toBe(true);
    expect(midState.auction.highestBid).toBe(50);
    expect(midState.auction.highestBidderId).toBe('player_1');

    act(() => {
      result.current.handleEndAuctionRound();
    });

    const endState = store.getState().game;
    expect(endState.auction.active).toBe(false);
    expect(endState.board[1].property?.ownerId).toBe('player_1');
    expect(endState.players[0].money).toBe(50);
    expect(endState.turnPhase).toBe(TurnPhase.ROLL_DICE);
    expect(endState.activityLog[0]).toBe('Auction resolved for Auction Island.');
  });
});
