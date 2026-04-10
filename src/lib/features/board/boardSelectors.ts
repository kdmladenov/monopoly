import { RootState } from '@/lib/store';
import { BoardSquare } from '@/lib/game.types';

export const selectSquareByPosition = (
  state: RootState,
  position: number
): BoardSquare | undefined => state.game.board[position];
