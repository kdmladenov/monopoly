import { describe, expect, it } from 'vitest';
import { AIDifficulty, AIStyle, BoardSquare, Player, PlayerType, SquareType } from '@/lib/game.types';
import { AIAdvisor } from './aiAdvisor';

const player: Player = {
  id: 'player_1',
  name: 'AI 1',
  type: PlayerType.AI,
  aiDifficulty: AIDifficulty.INTERMEDIATE,
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
};

const property: BoardSquare = {
  id: 'square_1',
  position: 1,
  type: SquareType.PROPERTY,
  property: {
    id: 'property_1',
    name: 'Cairo',
    type: SquareType.PROPERTY,
    position: 1,
    country: 'Egypt',
    color: 'brown',
    price: 200,
    rentStructure: {
      base: 80,
      house1: 100,
      house2: 120,
      house3: 140,
      house4: 160,
      hotel: 200,
    },
    housePrice: 100,
    mortgageValue: 100,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
  },
};

describe('AIAdvisor', () => {
  it('prefers buying strong affordable properties', () => {
    const advisor = new AIAdvisor();
    const decision = advisor.decidePurchase(
      { ...player, aiDifficulty: AIDifficulty.ADVANCED, money: 5000 },
      property,
      [property]
    );

    expect(decision.action).toBe('buy');
  });

  it('respects the cash reserve floor when buying', () => {
    const advisor = new AIAdvisor();
    const cautiousPlayer: Player = {
      ...player,
      aiDifficulty: AIDifficulty.BEGINNER,
      money: 3100,
    };
    const expensiveProperty: BoardSquare = {
      ...property,
      property: {
        ...property.property!,
        price: 200,
      },
    };

    const decision = advisor.decidePurchase(cautiousPlayer, expensiveProperty, [expensiveProperty]);

    expect(decision.action).toBe('pass');
  });

  it('suggests building when a monopoly exists', () => {
    const advisor = new AIAdvisor();
    const board: BoardSquare[] = [
      {
        ...property,
        property: {
          ...property.property!,
          ownerId: player.id,
        },
      },
      {
        ...property,
        id: 'square_2',
        position: 2,
        property: {
          ...property.property!,
          id: 'property_2',
          position: 2,
          ownerId: player.id,
        },
      },
    ];

    expect(advisor.decideBuilding({ ...player, money: 1000 }, board)?.action).toBe('build');
  });

  it('suggests mortgaging in emergency situations', () => {
    const advisor = new AIAdvisor();
    const board: BoardSquare[] = [
      {
        ...property,
        property: {
          ...property.property!,
          ownerId: player.id,
        },
      },
    ];

    expect(advisor.decideEmergencyMove({ ...player, money: 150 }, board)?.action).toBe('mortgage');
  });

  it('prefers selling a house before mortgaging in emergency situations', () => {
    const advisor = new AIAdvisor();
    const board: BoardSquare[] = [
      {
        ...property,
        property: {
          ...property.property!,
          ownerId: player.id,
          houses: 1,
        },
      },
      {
        ...property,
        id: 'square_2',
        position: 2,
        property: {
          ...property.property!,
          id: 'property_2',
          position: 2,
          ownerId: player.id,
          houses: 0,
        },
      },
    ];

    const decision = advisor.decideEmergencyMove(
      { ...player, money: 100, aiDifficulty: AIDifficulty.ADVANCED },
      board
    );

    expect(decision?.action).toBe('sell');
  });

  it('prioritizes building for advanced AI when both build and mortgage are possible', () => {
    const advisor = new AIAdvisor();
    const board: BoardSquare[] = [
      {
        ...property,
        property: {
          ...property.property!,
          ownerId: player.id,
        },
      },
      {
        ...property,
        id: 'square_2',
        position: 2,
        property: {
          ...property.property!,
          id: 'property_2',
          position: 2,
          ownerId: player.id,
        },
      },
    ];

    const decision = advisor.decidePropertyAction(
      { ...player, aiDifficulty: AIDifficulty.ADVANCED, money: 1100 },
      board
    );

    expect(decision?.action).toBe('build');
  });

  it('prioritizes mortgaging for beginner AI when both build and mortgage are possible', () => {
    const advisor = new AIAdvisor();
    const board: BoardSquare[] = [
      {
        ...property,
        property: {
          ...property.property!,
          ownerId: player.id,
        },
      },
      {
        ...property,
        id: 'square_2',
        position: 2,
        property: {
          ...property.property!,
          id: 'property_2',
          position: 2,
          ownerId: player.id,
        },
      },
    ];

    const decision = advisor.decidePropertyAction(
      { ...player, aiDifficulty: AIDifficulty.BEGINNER, money: 1000 },
      board
    );

    expect(decision?.action).toBe('mortgage');
  });

  it('prefers the emergency move when building would break the reserve floor', () => {
    const advisor = new AIAdvisor();
    const board: BoardSquare[] = [
      {
        ...property,
        property: {
          ...property.property!,
          ownerId: player.id,
          houses: 0,
        },
      },
      {
        ...property,
        id: 'square_2',
        position: 2,
        property: {
          ...property.property!,
          id: 'property_2',
          position: 2,
          ownerId: player.id,
          houses: 1,
        },
      },
    ];

    const decision = advisor.decidePropertyAction(
      { ...player, aiDifficulty: AIDifficulty.ADVANCED, money: 1025 },
      board
    );

    expect(decision?.action).toBe('sell');
  });

  it('still buys aggressively when advanced AI has room to spend', () => {
    const advisor = new AIAdvisor();
    const aggressivePlayer: Player = {
      ...player,
      aiDifficulty: AIDifficulty.ADVANCED,
      money: 5000,
    };

    const decision = advisor.decidePurchase(aggressivePlayer, property, [property]);

    expect(decision.action).toBe('buy');
  });

  it('uses AI style to distinguish cautious and aggressive buyers at the same difficulty', () => {
    const advisor = new AIAdvisor();
    const cautiousDecision = advisor.decidePurchase(
      {
        ...player,
        aiDifficulty: AIDifficulty.ADVANCED,
        aiStyle: AIStyle.CAUTIOUS,
        money: 3000,
      },
      {
        ...property,
        property: {
          ...property.property!,
          price: 1600,
        },
      },
      [
        {
          ...property,
          property: {
            ...property.property!,
            price: 1600,
          },
        },
      ]
    );
    const aggressiveDecision = advisor.decidePurchase(
      {
        ...player,
        aiDifficulty: AIDifficulty.BEGINNER,
        aiStyle: AIStyle.AGGRESSIVE,
        money: 3000,
      },
      {
        ...property,
        property: {
          ...property.property!,
          price: 1600,
        },
      },
      [
        {
          ...property,
          property: {
            ...property.property!,
            price: 1600,
          },
        },
      ]
    );

    expect(cautiousDecision.action).toBe('pass');
    expect(aggressiveDecision.action).toBe('buy');
  });
});
