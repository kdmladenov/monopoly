// @vitest-environment jsdom

import type { GameState, Player } from '@/lib/game.types';
import { GamePhase, PlayerType, TurnPhase } from '@/lib/game.types';
import { initialGameState } from '@/lib/gameState';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import TurnSidebar from './TurnSidebar';

function makeGame(overrides: Partial<GameState> = {}): GameState {
  return {
    ...structuredClone(initialGameState),
    ...overrides,
  };
}

const player: Player = {
  id: 'player_1',
  name: 'Player 1',
  type: PlayerType.HUMAN,
  avatar: 'lion',
  color: '#f97316',
  money: 0,
  position: 7,
  isInJail: false,
  jailTurns: 0,
  consecutiveDoubles: 0,
  ownedProperties: [],
  isBankrupt: false,
  turnOrder: 0,
};

describe('TurnSidebar', () => {
  it('renders the active turn controls and status', () => {
    const game = makeGame({
      phase: GamePhase.PLAYING,
      turnPhase: TurnPhase.ROLL_DICE,
      turn: 3,
      activityLog: ['Player 1 rolled a 6.'],
    });

    render(
      <TurnSidebar
        game={game}
        currentPlayer={player}
        bankruptPlayers={[]}
        onRoll={vi.fn()}
        onEndTurn={vi.fn()}
        onDeclareBankruptcy={vi.fn()}
      />
    );

    expect(screen.getByText('Player 1')).toBeTruthy();
    expect(screen.getByText('Phase: rollDice')).toBeTruthy();
    expect(screen.getByText('Round: 3')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Roll dice' }).hasAttribute('disabled')).toBe(false);
    expect(screen.getByRole('button', { name: 'End turn' }).hasAttribute('disabled')).toBe(true);
    expect(screen.getByText('Player 1 is ready to roll.')).toBeTruthy();
    expect(screen.getByText('Player 1 rolled a 6.')).toBeTruthy();
  });

  it('shows the bankruptcy prompt when money runs out', () => {
    const game = makeGame({
      phase: GamePhase.PLAYING,
      turnPhase: TurnPhase.END_TURN,
    });

    render(
      <TurnSidebar
        game={game}
        currentPlayer={{ ...player, money: 0 }}
        bankruptPlayers={[{ ...player, isBankrupt: true }] }
        onRoll={vi.fn()}
        onEndTurn={vi.fn()}
        onDeclareBankruptcy={vi.fn()}
      />
    );

    expect(
      screen.getByText('This player is out of money and can declare bankruptcy.')
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Declare bankruptcy' })).toBeTruthy();
  });

  it('shows the doubles hint after a double roll', () => {
    const game = makeGame({
      phase: GamePhase.PLAYING,
      turnPhase: TurnPhase.END_TURN,
      lastDiceRoll: { die1: 4, die2: 4, total: 8, isDouble: true },
    });

    render(
      <TurnSidebar
        game={game}
        currentPlayer={player}
        bankruptPlayers={[]}
        onRoll={vi.fn()}
        onEndTurn={vi.fn()}
        onDeclareBankruptcy={vi.fn()}
      />
    );

    expect(screen.getByText('Doubles rolled: you keep the turn.')).toBeTruthy();
  });

  it('shows a jail hint when the player is in jail', () => {
    const game = makeGame({
      phase: GamePhase.PLAYING,
      turnPhase: TurnPhase.MOVE,
    });

    render(
      <TurnSidebar
        game={game}
        currentPlayer={{ ...player, isInJail: true, jailTurns: 2 }}
        bankruptPlayers={[]}
        onRoll={vi.fn()}
        onEndTurn={vi.fn()}
        onDeclareBankruptcy={vi.fn()}
      />
    );

    expect(screen.getByText('Jail status active: roll to reduce the timer.')).toBeTruthy();
  });
});
