export enum NotificationType {
  // Property Events
  PROPERTY_PURCHASED = 'PROPERTY_PURCHASED',
  PROPERTY_AUCTIONED = 'PROPERTY_AUCTIONED',
  PROPERTY_AUCTION_WON = 'PROPERTY_AUCTION_WON',
  PROPERTY_MORTGAGED = 'PROPERTY_MORTGAGED',
  PROPERTY_UNMORTGAGED = 'PROPERTY_UNMORTGAGED',
  
  // Building Events
  HOUSE_BUILT = 'HOUSE_BUILT',
  HOTEL_BUILT = 'HOTEL_BUILT',
  HOUSE_SOLD = 'HOUSE_SOLD',
  HOTEL_SOLD = 'HOTEL_SOLD',
  
  // Rent Events
  RENT_PAID = 'RENT_PAID',
  RENT_RECEIVED = 'RENT_RECEIVED',
  
  // Trade Events
  TRADE_PROPOSED = 'TRADE_PROPOSED',
  TRADE_ACCEPTED = 'TRADE_ACCEPTED',
  TRADE_REJECTED = 'TRADE_REJECTED',
  TRADE_COUNTERED = 'TRADE_COUNTERED',
  TRADE_COMPLETED = 'TRADE_COMPLETED',
  TRADE_CANCELLED = 'TRADE_CANCELLED',
  
  // Money Events
  MONEY_RECEIVED = 'MONEY_RECEIVED',
  MONEY_PAID = 'MONEY_PAID',
  SALARY_COLLECTED = 'SALARY_COLLECTED',
  TAX_PAID = 'TAX_PAID',
  
  // Jail Events
  SENT_TO_JAIL = 'SENT_TO_JAIL',
  JAIL_FINE_PAID = 'JAIL_FINE_PAID',
  JAIL_CARD_USED = 'JAIL_CARD_USED',
  RELEASED_FROM_JAIL = 'RELEASED_FROM_JAIL',
  ROLLED_DOUBLES_IN_JAIL = 'ROLLED_DOUBLES_IN_JAIL',
  
  // Card Events
  CHANCE_CARD_DRAWN = 'CHANCE_CARD_DRAWN',
  COMMUNITY_CHEST_DRAWN = 'COMMUNITY_CHEST_DRAWN',
  GET_OUT_OF_JAIL_CARD_RECEIVED = 'GET_OUT_OF_JAIL_CARD_RECEIVED',
  
  // Game State Events
  TURN_STARTED = 'TURN_STARTED',
  DICE_ROLLED = 'DICE_ROLLED',
  PLAYER_MOVED = 'PLAYER_MOVED',
  DOUBLES_ROLLED = 'DOUBLES_ROLLED',
  
  // Bankruptcy Events
  BANKRUPTCY_DECLARED = 'BANKRUPTCY_DECLARED',
  PLAYER_ELIMINATED = 'PLAYER_ELIMINATED',
  ASSETS_TRANSFERRED = 'ASSETS_TRANSFERRED',
  
  // Monopoly Events
  MONOPOLY_FORMED = 'MONOPOLY_FORMED',
  MONOPOLY_BROKEN = 'MONOPOLY_BROKEN',
  
  // Game Events
  GAME_STARTED = 'GAME_STARTED',
  GAME_ENDED = 'GAME_ENDED',
  PLAYER_WON = 'PLAYER_WON',
  
  // System Events
  PLAYER_JOINED = 'PLAYER_JOINED',
  PLAYER_LEFT = 'PLAYER_LEFT',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum NotificationCategory {
  PROPERTY = 'PROPERTY',
  MONEY = 'MONEY',
  TRADE = 'TRADE',
  BUILDING = 'BUILDING',
  JAIL = 'JAIL',
  GAME = 'GAME',
  SYSTEM = 'SYSTEM',
}

export interface NotificationData {
  playerId?: string;
  playerName?: string;
  amount?: number;
  propertyId?: string;
  propertyName?: string;
  propertyColor?: string;
  tradeId?: string;
  fromPlayerId?: string;
  fromPlayerName?: string;
  toPlayerId?: string;
  toPlayerName?: string;
  buildingCount?: number;
  buildingType?: 'HOUSE' | 'HOTEL';
  dice1?: number;
  dice2?: number;
  total?: number;
  isDoubles?: boolean;
  cardText?: string;
  cardType?: 'CHANCE' | 'COMMUNITY_CHEST';
  fromPosition?: number;
  toPosition?: number;
  colorGroup?: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  timestamp: number;
  title: string;
  message: string;
  targetPlayerIds: string[];
  isGlobal: boolean;
  data: NotificationData;
  icon?: string;
  color?: string;
  sound?: string;
  read: boolean;
  dismissed: boolean;
  expiresAt?: number;
}

export interface HistoryEntry {
  id: string;
  turn: number;
  timestamp: number;
  notification: Notification;
}

export interface NotificationFilter {
  categories?: NotificationCategory[];
  priorities?: NotificationPriority[];
  playerIds?: string[];
  startTime?: number;
  endTime?: number;
  searchText?: string;
  types?: NotificationType[];
}

export interface NotificationPreferences {
  playerId: string;
  enableSound: boolean;
  enableVisual: boolean;
  mutedCategories: NotificationCategory[];
  minimumPriority: NotificationPriority;
}
