import { GameState, Player, BoardSquare, SquareType, AIStyle, AuctionState, AuctionBid } from '../game.types';

export interface AIConfiguration {
  riskTolerance: number;
  spendingPropensity: number;
  propertyValueMultiplier: number;
  monopolyValueMultiplier: number;
  blockingValueMultiplier: number;
  patience: number;
  bidVariance: number;
  foldThreshold: number;
}

const AI_PERSONALITY_PRESETS: Record<AIStyle, AIConfiguration> = {
  [AIStyle.CAUTIOUS]: {
    riskTolerance: 0.3,
    spendingPropensity: 0.4,
    propertyValueMultiplier: 0.8,
    monopolyValueMultiplier: 1.2,
    blockingValueMultiplier: 0.5,
    patience: 0.7,
    foldThreshold: 0.6,
    bidVariance: 0.05
  },
  [AIStyle.BALANCED]: {
    riskTolerance: 0.5,
    spendingPropensity: 0.6,
    propertyValueMultiplier: 1.0,
    monopolyValueMultiplier: 1.5,
    blockingValueMultiplier: 0.8,
    patience: 0.5,
    foldThreshold: 0.75,
    bidVariance: 0.1
  },
  [AIStyle.AGGRESSIVE]: {
    riskTolerance: 0.8,
    spendingPropensity: 0.8,
    propertyValueMultiplier: 1.2,
    monopolyValueMultiplier: 2.0,
    blockingValueMultiplier: 1.2,
    patience: 0.2,
    foldThreshold: 0.85,
    bidVariance: 0.15
  }
};

export interface PropertyValuation {
  totalValue: number;
  monopolyValue: number;
  rentValue: number;
  blockingValue: number;
}

/**
 * Evaluates a property's worth to a specific AI player
 */
export function evaluateProperty(
  square: BoardSquare,
  aiPlayer: Player,
  gameState: GameState
): PropertyValuation {
  const property = square.property || square.transportation;
  if (!property) return { totalValue: 0, monopolyValue: 0, rentValue: 0, blockingValue: 0 };

  const config = AI_PERSONALITY_PRESETS[aiPlayer.aiStyle || AIStyle.BALANCED];
  
  // Base value
  let baseValue = property.price;

  // 1. Monopoly Value
  let monopolyValue = 0;
  if (square.type === SquareType.PROPERTY && square.property) {
    const color = square.property.color;
    const colorGroup = gameState.board.filter(s => s.property?.color === color);
    const ownedInGroup = colorGroup.filter(s => s.property?.ownerId === aiPlayer.id);

    if (ownedInGroup.length === 0) {
      monopolyValue = baseValue * 0.3;
    } else if (ownedInGroup.length === colorGroup.length - 1) {
      // Would complete monopoly
      monopolyValue = baseValue * config.monopolyValueMultiplier * 2.5;
    } else {
      monopolyValue = baseValue * 1.5;
    }
  }

  // 2. Rent Value (ROI)
  let rentValue = 0;
  if (square.property) {
    const avgRent = (
      square.property.rentStructure.base +
      square.property.rentStructure.house1 +
      square.property.rentStructure.hotel
    ) / 3;
    rentValue = avgRent * 3; // Estimated ROI for next few turns
  } else if (square.transportation) {
    rentValue = square.transportation.rent.two * 4;
  }

  // 3. Blocking Value
  let blockingValue = 0;
  for (const opponent of gameState.players) {
    if (opponent.id === aiPlayer.id || opponent.isBankrupt) continue;
    
    if (square.property) {
      const color = square.property.color;
      const colorGroup = gameState.board.filter(s => s.property?.color === color);
      const opponentOwned = colorGroup.filter(s => s.property?.ownerId === opponent.id);
      
      if (opponentOwned.length === colorGroup.length - 1) {
        // Opponent is one away from monopoly
        blockingValue = Math.max(blockingValue, baseValue * config.blockingValueMultiplier * 2.0);
      }
    }
  }

  // Combine
  const strategicValue = (monopolyValue * 0.4) + (rentValue * 0.3) + (blockingValue * 0.3);
  const totalValue = baseValue + (strategicValue * config.propertyValueMultiplier);

  return { totalValue, monopolyValue, rentValue, blockingValue };
}

/**
 * Calculates the maximum bid the AI is willing to place
 */
export function calculateMaxWillingBid(
  valuation: PropertyValuation,
  aiPlayer: Player,
  gameState: GameState
): number {
  const config = AI_PERSONALITY_PRESETS[aiPlayer.aiStyle || AIStyle.BALANCED];
  
  // Start with valuation
  let maxBid = valuation.totalValue;

  // Adjust by cash constraints
  const cashLimit = aiPlayer.money * config.spendingPropensity;
  maxBid = Math.min(maxBid, cashLimit);

  // If losing badly, bid more aggressively (desperation)
  const isLosing = aiPlayer.money < (gameState.players.find(p => !p.isBankrupt)?.money || 0) * 0.5;
  if (isLosing) {
    maxBid *= 1.25;
  }

  return Math.floor(maxBid / 10) * 10;
}

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

  const valuation = evaluateProperty(square, aiPlayer, gameState);
  const maxWillingBid = calculateMaxWillingBid(valuation, aiPlayer, gameState);
  const currentBid = auction.highestBid;
  const config = AI_PERSONALITY_PRESETS[aiPlayer.aiStyle || AIStyle.BALANCED];

  if (currentBid >= maxWillingBid) {
    return { type: 'fold' };
  }

  // Calculation of specific bid amount
  let bidAmount: number;
  const diff = maxWillingBid - currentBid;

  if (aiPlayer.aiStyle === AIStyle.AGGRESSIVE) {
    // Aggressive jump
    const jump = Math.max(100, diff * 0.4);
    bidAmount = currentBid + jump;
  } else if (aiPlayer.aiStyle === AIStyle.CAUTIOUS) {
    // Smallest possible bid to stay in
    bidAmount = currentBid + 10;
  } else {
    // Balanced: standard increment
    bidAmount = currentBid + Math.max(50, diff * 0.2);
  }

  // Random variance
  const variance = bidAmount * config.bidVariance * (Math.random() * 2 - 1);
  bidAmount += variance;

  // Final validation
  bidAmount = Math.max(currentBid + 1, Math.min(bidAmount, maxWillingBid, aiPlayer.money));
  bidAmount = Math.floor(bidAmount / 10) * 10;

  if (bidAmount <= currentBid) {
    return { type: 'fold' };
  }

  return { type: 'bid', amount: bidAmount };
}
