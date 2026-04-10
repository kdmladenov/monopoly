import { describe, expect, it } from 'vitest';
import { calculatePropertyRent, calculateTransportationRent } from './rent';
import { BoardSquare, SquareType } from '@/lib/game.types';

describe('rent helpers', () => {
  it('doubles base rent when a monopoly is owned', () => {
    const board: BoardSquare[] = [
      {
        id: 'p1',
        position: 0,
        type: SquareType.PROPERTY,
        property: {
          id: 'p1',
          name: 'Alpha',
          type: SquareType.PROPERTY,
          position: 0,
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
          ownerId: 'player-1',
          houses: 0,
          isMortgaged: false,
        },
      },
      {
        id: 'p2',
        position: 1,
        type: SquareType.PROPERTY,
        property: {
          id: 'p2',
          name: 'Beta',
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
          ownerId: 'player-1',
          houses: 0,
          isMortgaged: false,
        },
      },
    ];

    expect(calculatePropertyRent(board[0].property!, board)).toBe(20);
  });

  it('uses route count for transportation rent', () => {
    const board: BoardSquare[] = [
      {
        id: 't1',
        position: 0,
        type: SquareType.TRANSPORTATION,
        transportation: {
          type: 'station',
          name: 'One',
          price: 100,
          rent: { one: 25, two: 50, three: 100, four: 200 },
          mortgageValue: 50,
          ownerId: 'player-1',
        },
      },
      {
        id: 't2',
        position: 1,
        type: SquareType.TRANSPORTATION,
        transportation: {
          type: 'station',
          name: 'Two',
          price: 100,
          rent: { one: 25, two: 50, three: 100, four: 200 },
          mortgageValue: 50,
          ownerId: 'player-1',
        },
      },
    ];

    expect(
      calculateTransportationRent(board[0].transportation!, board, 'player-1')
    ).toBe(50);
  });

  it('uses house and hotel rent levels', () => {
    const property: BoardSquare = {
      id: 'p1',
      position: 0,
      type: SquareType.PROPERTY,
      property: {
        id: 'p1',
        name: 'Alpha',
        type: SquareType.PROPERTY,
        position: 0,
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
        ownerId: 'player-1',
        houses: 3,
        isMortgaged: false,
      },
    };

    expect(calculatePropertyRent(property.property!, [property])).toBe(40);
    expect(
      calculatePropertyRent(
        {
          ...property.property!,
          houses: 5,
        },
        [property]
      )
    ).toBe(60);
  });

  it('returns zero rent for mortgaged property', () => {
    const property: BoardSquare = {
      id: 'p1',
      position: 0,
      type: SquareType.PROPERTY,
      property: {
        id: 'p1',
        name: 'Alpha',
        type: SquareType.PROPERTY,
        position: 0,
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
        ownerId: 'player-1',
        houses: 0,
        isMortgaged: true,
      },
    };

    expect(calculatePropertyRent(property.property!, [property])).toBe(0);
  });
});
