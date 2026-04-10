// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AIStyle, Player, PlayerType } from '@/lib/game.types';
import PlayerConfigurator from './PlayerConfigurator';

const humanPlayer: Player = {
  id: 'player_1',
  name: 'Player 1',
  type: PlayerType.HUMAN,
  avatar: 'lion',
  color: '#f97316',
  money: 40000,
  position: 0,
  isInJail: false,
  jailTurns: 0,
  consecutiveDoubles: 0,
  ownedProperties: [],
  isBankrupt: false,
  turnOrder: 0,
};

const aiPlayer: Player = {
  id: 'player_2',
  name: 'AI 1',
  type: PlayerType.AI,
  aiStyle: AIStyle.BALANCED,
  avatar: 'globe',
  color: '#38bdf8',
  money: 40000,
  position: 0,
  isInJail: false,
  jailTurns: 0,
  consecutiveDoubles: 0,
  ownedProperties: [],
  isBankrupt: false,
  turnOrder: 1,
};

describe('PlayerConfigurator', () => {
  it('renders the AI style selector and add AI control', () => {
    const onAddPlayer = vi.fn();
    const onAddAIPlayer = vi.fn();
    const onRemovePlayer = vi.fn();
    const onUpdatePlayer = vi.fn();

    render(
      <PlayerConfigurator
        players={[humanPlayer, aiPlayer]}
        maxPlayers={4}
        onAddPlayer={onAddPlayer}
        onAddAIPlayer={onAddAIPlayer}
        onRemovePlayer={onRemovePlayer}
        onUpdatePlayer={onUpdatePlayer}
      />
    );

    expect(screen.getByRole('button', { name: 'Add AI' })).toBeTruthy();
    expect(screen.getByRole('combobox')).toBeTruthy();
  });

  it('updates AI style when the selector changes', () => {
    const onAddPlayer = vi.fn();
    const onAddAIPlayer = vi.fn();
    const onRemovePlayer = vi.fn();
    const onUpdatePlayer = vi.fn();

    render(
      <PlayerConfigurator
        players={[humanPlayer, aiPlayer]}
        maxPlayers={4}
        onAddPlayer={onAddPlayer}
        onAddAIPlayer={onAddAIPlayer}
        onRemovePlayer={onRemovePlayer}
        onUpdatePlayer={onUpdatePlayer}
      />
    );

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: AIStyle.AGGRESSIVE },
    });

    expect(onUpdatePlayer).toHaveBeenCalledWith('player_2', { aiStyle: AIStyle.AGGRESSIVE });
  });
});
