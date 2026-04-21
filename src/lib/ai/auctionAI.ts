import { GameState, Player } from '../game.types';
import { BotDecisionMaker } from './BotDecisionMaker';

const decisionMaker = new BotDecisionMaker();

/**
 * Decides whether to bid or fold
 */
export function getAIDecision(
  gameState: GameState,
  aiPlayer: Player
): { type: 'bid', amount: number } | { type: 'fold' } {
  const auction = gameState.auction;
  const square = gameState.board.find(s => s.position === auction.propertyPosition);
  if (!square) return { type: 'fold' };

  const currentBid = auction.highestBid;
  const nextBid = decisionMaker.calculateAuctionBid(square, currentBid, aiPlayer, gameState);

  if (nextBid === null || nextBid <= currentBid) {
    return { type: 'fold' };
  }

  return { type: 'bid', amount: nextBid };
}
