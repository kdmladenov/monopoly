import { describe, expect, it } from 'vitest';
import reducer, {
  addActivityLog,
  buildHouse,
  declareBankruptcy,
  decrementJailTurn,
  mortgageProperty,
  rollDice,
  resolveLandingEffect,
  sellHouse,
  unmortgageProperty,
  endTurn,
} from './gameSlice';
import { initialGameState } from '@/lib/gameState';
import { GamePhase, GameState, SquareType, TurnPhase } from '@/lib/game.types';

function makeState(): GameState {
  return structuredClone(initialGameState);
}

describe('game slice', () => {
  it('keeps the activity log capped', () => {
    let state = makeState();

    for (let index = 0; index < 8; index += 1) {
      state = reducer(state, addActivityLog(`entry ${index}`));
    }

    expect(state.activityLog).toHaveLength(6);
    expect(state.activityLog[0]).toBe('entry 7');
    expect(state.activityLog[5]).toBe('entry 2');
  });

  it('resolves start and tax effects into the turn phase', () => {
    const startState = reducer(
      makeState(),
      resolveLandingEffect({
        playerId: 'player_1',
        effect: 'start',
      })
    );

    expect(startState.players[0].money).toBe(
      initialGameState.players[0].money + initialGameState.settings.passingStartBonus
    );
    expect(startState.turnPhase).toBe(TurnPhase.END_TURN);

    const taxState = reducer(
      makeState(),
      resolveLandingEffect({
        playerId: 'player_1',
        effect: 'tax',
        amount: 2500,
      })
    );

    expect(taxState.players[0].money).toBe(
      initialGameState.players[0].money - 2500
    );
    expect(taxState.turnPhase).toBe(TurnPhase.END_TURN);
  });

  it('declares bankruptcy and ends the game when one player remains', () => {
    const state = makeState();
    state.players[0].ownedProperties = ['property_1'];
    state.board[1] = {
      id: 'property_1',
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
    };

    const next = reducer(
      state,
      declareBankruptcy({ playerId: 'player_1' })
    );

    expect(next.players[0].isBankrupt).toBe(true);
    expect(next.board[1].property?.ownerId).toBeNull();
    expect(next.phase).toBe(GamePhase.ENDED);
    expect(next.winner).toBe('player_2');
  });

  it('releases a player from jail when the countdown reaches zero', () => {
    const state = makeState();
    state.players[0].isInJail = true;
    state.players[0].jailTurns = 1;

    const next = reducer(
      state,
      decrementJailTurn({ playerId: state.players[0].id })
    );

    expect(next.players[0].isInJail).toBe(false);
    expect(next.players[0].jailTurns).toBe(0);
  });

  it('resolves jail, casino, and lottery effects', () => {
    const jailState = reducer(
      makeState(),
      resolveLandingEffect({
        playerId: 'player_1',
        effect: 'goToJail',
        jailPosition: 10,
      })
    );

    expect(jailState.players[0].isInJail).toBe(true);
    expect(jailState.players[0].position).toBe(10);
    expect(jailState.players[0].jailTurns).toBe(2);
    expect(jailState.turnPhase).toBe(TurnPhase.END_TURN);

    const casinoState = reducer(
      makeState(),
      resolveLandingEffect({
        playerId: 'player_1',
        effect: 'casinoWin',
        amount: 2000,
      })
    );

    expect(casinoState.players[0].money).toBe(
      initialGameState.players[0].money + 2000
    );

    const lotteryState = reducer(
      makeState(),
      resolveLandingEffect({
        playerId: 'player_1',
        effect: 'lotteryLoss',
        amount: 500,
      })
    );

    expect(lotteryState.players[0].money).toBe(
      initialGameState.players[0].money - 500
    );
  });

  it('keeps the same player on a double turn and sends them to jail after three doubles', () => {
    const state = makeState();

    const first = reducer(
      state,
      rollDice({ die1: 2, die2: 2, total: 4, isDouble: true })
    );
    const afterFirstEnd = reducer(first, endTurn());

    expect(afterFirstEnd.currentPlayerIndex).toBe(0);
    expect(afterFirstEnd.turn).toBe(2);

    const second = reducer(
      afterFirstEnd,
      rollDice({ die1: 3, die2: 3, total: 6, isDouble: true })
    );
    const afterSecondEnd = reducer(second, endTurn());

    expect(afterSecondEnd.currentPlayerIndex).toBe(0);

    const third = reducer(
      afterSecondEnd,
      rollDice({ die1: 5, die2: 5, total: 10, isDouble: true })
    );

    expect(third.players[0].isInJail).toBe(true);
    expect(third.players[0].jailTurns).toBe(2);
    expect(third.turnPhase).toBe(TurnPhase.END_TURN);
  });

  it('builds a house when the player owns the color set and can afford it', () => {
    const state = makeState();
    state.players[0].money = 1000;
    state.board = [
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

    const next = reducer(
      state,
      buildHouse({ playerId: 'player_1', propertyPosition: 1 })
    );

    expect(next.players[0].money).toBe(950);
    expect(next.board[0].property?.houses).toBe(1);
    expect(next.turnPhase).toBe(TurnPhase.END_TURN);
  });

  it('sells a house for half the build price', () => {
    const state = makeState();
    state.players[0].money = 100;
    state.board = [
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
    ];

    const next = reducer(
      state,
      sellHouse({ playerId: 'player_1', propertyPosition: 1 })
    );

    expect(next.players[0].money).toBe(125);
    expect(next.board[0].property?.houses).toBe(0);
    expect(next.turnPhase).toBe(TurnPhase.END_TURN);
  });

  it('mortgages and unmortgages a property', () => {
    const state = makeState();
    state.players[0].money = 100;
    state.board = [
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
    ];

    const mortgaged = reducer(
      state,
      mortgageProperty({ playerId: 'player_1', propertyPosition: 1 })
    );

    expect(mortgaged.players[0].money).toBe(125);
    expect(mortgaged.board[0].property?.isMortgaged).toBe(true);

    const unmortgaged = reducer(
      mortgaged,
      unmortgageProperty({ playerId: 'player_1', propertyPosition: 1 })
    );

    expect(unmortgaged.players[0].money).toBe(97);
    expect(unmortgaged.board[0].property?.isMortgaged).toBe(false);
  });
});
