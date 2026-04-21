import { AIStyle } from '../game.types';

export interface PersonalityConfig {
  riskTolerance: number;
  minCashReserve: number;
  targetCashReserve: number;
  propertyBuyThreshold: number;
  auctionMaxBidRatio: number;
  buildingAggression: number;
  monopolyBuildPriority: number;
  tradeWillingness: number;
  tradeValueMultiplier: number;
  mortgageReluctance: number;
  unmortgagePriority: number;
  jailEarlyGameValue: number;
  jailLateGameValue: number;
}

export const PERSONALITY_CONFIGS: Record<AIStyle, PersonalityConfig> = {
  [AIStyle.CAUTIOUS]: {
    riskTolerance: 0.3,
    minCashReserve: 5000, // Adjusted for typical game scale
    targetCashReserve: 10000,
    propertyBuyThreshold: 0.7,
    auctionMaxBidRatio: 0.6,
    buildingAggression: 0.3,
    monopolyBuildPriority: 0.9,
    tradeWillingness: 0.4,
    tradeValueMultiplier: 1.3,
    mortgageReluctance: 0.8,
    unmortgagePriority: 0.9,
    jailEarlyGameValue: -0.3,
    jailLateGameValue: 0.7,
  },
  [AIStyle.BALANCED]: {
    riskTolerance: 0.5,
    minCashReserve: 3000,
    targetCashReserve: 6000,
    propertyBuyThreshold: 0.85,
    auctionMaxBidRatio: 0.8,
    buildingAggression: 0.5,
    monopolyBuildPriority: 0.7,
    tradeWillingness: 0.6,
    tradeValueMultiplier: 1.15,
    mortgageReluctance: 0.5,
    unmortgagePriority: 0.6,
    jailEarlyGameValue: -0.5,
    jailLateGameValue: 0.5,
  },
  [AIStyle.AGGRESSIVE]: {
    riskTolerance: 0.8,
    minCashReserve: 1000,
    targetCashReserve: 3000,
    propertyBuyThreshold: 1.0,
    auctionMaxBidRatio: 1.1,
    buildingAggression: 0.9,
    monopolyBuildPriority: 0.5,
    tradeWillingness: 0.8,
    tradeValueMultiplier: 1.05,
    mortgageReluctance: 0.2,
    unmortgagePriority: 0.3,
    jailEarlyGameValue: -0.7,
    jailLateGameValue: 0.3,
  },
};
