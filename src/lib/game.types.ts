export enum GamePhase {
  SETUP = 'setup',
  PLAYING = 'playing',
  ENDED = 'ended',
}

export enum TurnPhase {
  ROLL_DICE = 'rollDice',
  MOVE = 'move',
  ACTION = 'action',
  END_TURN = 'endTurn',
}

export enum ContinentId {
  EUROPE = 'europe',
  ASIA = 'asia',
  AFRICA = 'africa',
  NORTH_AMERICA = 'north-america',
  SOUTH_AMERICA = 'south-america',
  OCEANIA = 'oceania',
}

export enum PlayerType {
  HUMAN = 'human',
  AI = 'ai',
}

export enum AIDifficulty {
  BEGINNER = 1,
  INTERMEDIATE = 2,
  ADVANCED = 3,
}

export enum AIStyle {
  CAUTIOUS = 'cautious',
  BALANCED = 'balanced',
  AGGRESSIVE = 'aggressive',
}

export interface DiceRoll {
  die1: number;
  die2: number;
  total: number;
  isDouble: boolean;
}

export interface GameSettings {
  startingMoney: number;
  passingStartBonus: number;
  maxPlayers: number;
  enableSound: boolean;
  gameSpeed: 1 | 2 | 3;
  enableAuctions: boolean;
}

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  aiDifficulty?: AIDifficulty;
  aiStyle?: AIStyle;
  avatar: string;
  color: string;
  money: number;
  position: number;
  isInJail: boolean;
  jailTurns: number;
  consecutiveDoubles: number;
  ownedProperties: string[];
  isBankrupt: boolean;
  turnOrder: number;
}

export enum SquareType {
  PROPERTY = 'property',
  TRANSPORTATION = 'transportation',
  SPECIAL = 'special',
}

export interface RentStructure {
  base: number;
  house1: number;
  house2: number;
  house3: number;
  house4: number;
  hotel: number;
}

export interface PropertyDetails {
  id: string;
  name: string;
  type: SquareType.PROPERTY;
  position: number;
  country?: string;
  color?: string;
  price: number;
  rentStructure: RentStructure;
  housePrice: number;
  mortgageValue: number;
  ownerId: string | null;
  houses: number;
  isMortgaged: boolean;
}

export interface TransportationSquare {
  type: 'airport' | 'motorway' | 'ferry' | 'station';
  name: string;
  price: number;
  rent: {
    one: number;
    two: number;
    three: number;
    four: number;
  };
  mortgageValue: number;
  ownerId?: string | null;
}

export interface SpecialSquare {
  type: 'start' | 'jail' | 'goToJail' | 'casino' | 'lottery' | 'tax' | 'freeParking';
  name: string;
  description?: string;
  amount?: number;
}

export interface BoardSquare {
  id: string;
  position: number;
  type: SquareType;
  property?: PropertyDetails;
  transportation?: TransportationSquare;
  special?: SpecialSquare;
}

export interface GameState {
  id: string;
  phase: GamePhase;
  turnPhase: TurnPhase;
  continent: ContinentId;
  board: BoardSquare[];
  players: Player[];
  currentPlayerIndex: number;
  settings: GameSettings;
  lastDiceRoll: DiceRoll | null;
  turn: number;
  winner: string | null;
  activityLog: string[];
  auction: AuctionState;
}

export interface MovePlayerPayload {
  playerId: string;
  newPosition: number;
  passedStart: boolean;
}

export interface LandingEffectPayload {
  playerId: string;
  effect: 'start' | 'tax' | 'goToJail' | 'casinoWin' | 'casinoLoss' | 'lotteryWin' | 'lotteryLoss';
  amount?: number;
  jailPosition?: number;
}

export interface BuildHousePayload {
  playerId: string;
  propertyPosition: number;
}

export interface SellHousePayload {
  playerId: string;
  propertyPosition: number;
}

export interface MortgagePropertyPayload {
  playerId: string;
  propertyPosition: number;
}

export interface AuctionState {
  propertyPosition: number;
  active: boolean;
  highestBid: number;
  highestBidderId: string | null;
  minimumBid: number;
  currentBidderIndex: number;
  participants: string[];
}
