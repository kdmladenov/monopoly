// @vitest-environment jsdom

import type { BoardSquare, Player } from '@/lib/game.types';
import { PlayerType, SquareType } from '@/lib/game.types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PropertyActionPanel from './PropertyActionPanel';

const player: Player = {
  id: 'player_1',
  name: 'Player 1',
  type: PlayerType.HUMAN,
  avatar: 'lion',
  color: '#f97316',
  money: 1000,
  position: 0,
  isInJail: false,
  jailTurns: 0,
  consecutiveDoubles: 0,
  ownedProperties: [],
  isBankrupt: false,
  turnOrder: 0,
};

const propertySquare: BoardSquare = {
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
    price: 600,
    rentStructure: {
      base: 20,
      house1: 100,
      house2: 300,
      house3: 900,
      house4: 1600,
      hotel: 2500,
    },
    housePrice: 500,
    mortgageValue: 300,
    ownerId: null,
    houses: 0,
    isMortgaged: false,
  },
};

describe('PropertyActionPanel', () => {
  it('shows the buy details for an unowned property', () => {
    render(
      <PropertyActionPanel
        board={[propertySquare]}
        square={propertySquare}
        player={player}
        onBuy={vi.fn()}
        onBuildHouse={vi.fn()}
        onSellHouse={vi.fn()}
        onMortgageProperty={vi.fn()}
        onUnmortgageProperty={vi.fn()}
      />
    );

    expect(screen.getByText('Cairo')).toBeTruthy();
    expect(screen.getByText('Price')).toBeTruthy();
    expect(screen.getByText('Rent')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Buy for ¤600' }).hasAttribute('disabled')).toBe(false);
    expect(screen.getByText('Unowned property. You can buy it now.')).toBeTruthy();
  });

  it('shows a build house action for an owned property', () => {
    const buildableSquare: BoardSquare = {
      ...propertySquare,
      property: {
        ...propertySquare.property,
        ownerId: player.id,
      },
    };

    render(
      <PropertyActionPanel
        board={[
          buildableSquare,
          {
            ...buildableSquare,
            id: 'square_2',
            position: 2,
            property: {
              ...buildableSquare.property,
              id: 'property_2',
              name: 'Alexandria',
              position: 2,
              ownerId: player.id,
            },
          },
        ]}
        square={buildableSquare}
        player={player}
        onBuy={vi.fn()}
        onBuildHouse={vi.fn()}
        onSellHouse={vi.fn()}
        onMortgageProperty={vi.fn()}
        onUnmortgageProperty={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Build house (¤500)' }).hasAttribute('disabled')).toBe(false);
  });

  it('shows a sell house action when a property has houses', () => {
    const houseSquare: BoardSquare = {
      ...propertySquare,
      property: {
        ...propertySquare.property,
        ownerId: player.id,
        houses: 1,
      },
    };

    render(
      <PropertyActionPanel
        board={[houseSquare]}
        square={houseSquare}
        player={player}
        onBuy={vi.fn()}
        onBuildHouse={vi.fn()}
        onSellHouse={vi.fn()}
        onMortgageProperty={vi.fn()}
        onUnmortgageProperty={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Sell house (¤250)' }).hasAttribute('disabled')).toBe(false);
  });

  it('shows mortgage actions for an unmortgaged owned property', () => {
    const mortgageSquare: BoardSquare = {
      ...propertySquare,
      property: {
        ...propertySquare.property,
        ownerId: player.id,
      },
    };

    render(
      <PropertyActionPanel
        board={[mortgageSquare]}
        square={mortgageSquare}
        player={player}
        onBuy={vi.fn()}
        onBuildHouse={vi.fn()}
        onSellHouse={vi.fn()}
        onMortgageProperty={vi.fn()}
        onUnmortgageProperty={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Mortgage (¤300)' }).hasAttribute('disabled')).toBe(false);
  });

  it('shows unmortgage action for a mortgaged owned property', () => {
    const unmortgageSquare: BoardSquare = {
      ...propertySquare,
      property: {
        ...propertySquare.property,
        ownerId: player.id,
        isMortgaged: true,
      },
    };

    render(
      <PropertyActionPanel
        board={[unmortgageSquare]}
        square={unmortgageSquare}
        player={player}
        onBuy={vi.fn()}
        onBuildHouse={vi.fn()}
        onSellHouse={vi.fn()}
        onMortgageProperty={vi.fn()}
        onUnmortgageProperty={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Unmortgage (¤330)' }).hasAttribute('disabled')).toBe(false);
    expect(
      screen.getByText('This property is mortgaged and does not collect rent.')
    ).toBeTruthy();
  });

  it('shows rent details for an owned property', () => {
    const ownedSquare: BoardSquare = {
      ...propertySquare,
      property: {
        ...propertySquare.property,
        ownerId: 'player_2',
      },
    };

    render(
      <PropertyActionPanel
        board={[ownedSquare]}
        square={ownedSquare}
        player={player}
        onBuy={vi.fn()}
        onBuildHouse={vi.fn()}
        onSellHouse={vi.fn()}
        onMortgageProperty={vi.fn()}
        onUnmortgageProperty={vi.fn()}
      />
    );

    expect(screen.getByText('You owe ¤40 to the owner.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Pay rent ¤40' }).hasAttribute('disabled')).toBe(true);
  });

  it('shows special tile copy for casino squares', () => {
    const square: BoardSquare = {
      id: 'square_2',
      position: 2,
      type: SquareType.SPECIAL,
      special: {
        type: 'casino',
        name: 'Sahara Casino',
      },
    };

    render(
      <PropertyActionPanel
        board={[square]}
        square={square}
        player={player}
        onBuy={vi.fn()}
        onBuildHouse={vi.fn()}
        onSellHouse={vi.fn()}
        onMortgageProperty={vi.fn()}
        onUnmortgageProperty={vi.fn()}
      />
    );

    expect(screen.getByText('Sahara Casino')).toBeTruthy();
    expect(
      screen.getByText('Roll the dice of fate and see if you win or lose money.')
    ).toBeTruthy();
    expect(screen.getByText('casino')).toBeTruthy();
  });

  it('shows route rent details for a transportation square', () => {
    const transportationSquare: BoardSquare = {
      id: 'square_3',
      position: 3,
      type: SquareType.TRANSPORTATION,
      transportation: {
        type: 'station',
        name: 'Safari Junction',
        price: 2000,
        rent: {
          one: 250,
          two: 500,
          three: 1000,
          four: 2000,
        },
        mortgageValue: 1000,
        ownerId: 'player_2',
      },
    };

    render(
      <PropertyActionPanel
        board={[
          transportationSquare,
          {
            ...transportationSquare,
            id: 'square_4',
            position: 4,
            transportation: {
              ...transportationSquare.transportation,
              ownerId: 'player_2',
            },
          },
        ]}
        square={transportationSquare}
        player={player}
        onBuy={vi.fn()}
        onBuildHouse={vi.fn()}
        onSellHouse={vi.fn()}
      />
    );

    expect(screen.getByText('Safari Junction')).toBeTruthy();
    expect(screen.getByText('You owe ¤500 for this route.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Pay route rent ¤500' }).hasAttribute('disabled')).toBe(false);
  });

  it('shows auction copy and actions for an unaffordable property', () => {
    const expensiveSquare: BoardSquare = {
      ...propertySquare,
      property: {
        ...propertySquare.property,
        price: 2000,
      },
    };

    render(
      <PropertyActionPanel
        board={[expensiveSquare]}
        square={expensiveSquare}
        player={player}
        enableAuctions
        onBuy={vi.fn()}
        onStartAuction={vi.fn()}
        onPlaceAuctionBid={vi.fn()}
        onBuildHouse={vi.fn()}
        onSellHouse={vi.fn()}
        onMortgageProperty={vi.fn()}
        onUnmortgageProperty={vi.fn()}
      />
    );

    expect(
      screen.getByText('Unowned property. An auction will start if you cannot buy it.')
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Start auction' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Bid ¤1000' })).toBeTruthy();
  });
});
