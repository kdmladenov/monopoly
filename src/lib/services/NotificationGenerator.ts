import { v4 as uuidv4 } from 'uuid';
import {
  Notification,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  NotificationData,
} from '@/types/notifications';

class NotificationGenerator {
  private static instance: NotificationGenerator;
  
  private constructor() {}
  
  static getInstance(): NotificationGenerator {
    if (!NotificationGenerator.instance) {
      NotificationGenerator.instance = new NotificationGenerator();
    }
    return NotificationGenerator.instance;
  }
  
  generate(
    type: NotificationType,
    data: NotificationData,
    targetPlayerIds: string[] = []
  ): Notification {
    const template = NOTIFICATION_TEMPLATES[type] || DEFAULT_TEMPLATE;
    
    return {
      id: uuidv4(),
      type,
      category: template.category,
      priority: template.priority,
      timestamp: Date.now(),
      title: this.interpolate(template.title, data),
      message: this.interpolate(template.message, data),
      targetPlayerIds,
      isGlobal: targetPlayerIds.length === 0,
      data,
      icon: template.icon,
      color: template.color,
      sound: template.sound,
      read: false,
      dismissed: false,
      expiresAt: template.duration ? Date.now() + template.duration : undefined,
    };
  }
  
  private interpolate(template: string, data: NotificationData): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      const val = data[key as keyof NotificationData];
      return val !== undefined ? val.toString() : match;
    });
  }
}

interface NotificationTemplate {
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  message: string;
  icon?: string;
  color?: string;
  sound?: string;
  duration?: number;
}

const NOTIFICATION_TEMPLATES: Partial<Record<NotificationType, NotificationTemplate>> = {
  [NotificationType.PROPERTY_PURCHASED]: {
    category: NotificationCategory.PROPERTY,
    priority: NotificationPriority.MEDIUM,
    title: 'Property Purchased',
    message: '{playerName} purchased {propertyName} for {amount}¤',
    icon: '🏠',
    color: '#10b981',
    duration: 5000,
  },
  [NotificationType.RENT_PAID]: {
    category: NotificationCategory.MONEY,
    priority: NotificationPriority.HIGH,
    title: 'Rent Paid',
    message: '{playerName} paid {amount}¤ rent for {propertyName}',
    icon: '💸',
    color: '#ef4444',
    duration: 5000,
  },
  [NotificationType.DICE_ROLLED]: {
    category: NotificationCategory.GAME,
    priority: NotificationPriority.LOW,
    title: 'Dice Rolled',
    message: '{playerName} rolled {total} ({dice1}, {dice2})',
    icon: '🎲',
    color: '#6b7280',
    duration: 3000,
  },
  [NotificationType.SENT_TO_JAIL]: {
    category: NotificationCategory.JAIL,
    priority: NotificationPriority.HIGH,
    title: 'Sent to Jail',
    message: '{playerName} was sent to jail!',
    icon: '👮',
    color: '#ef4444',
    duration: 6000,
  },
  [NotificationType.HOUSE_BUILT]: {
    category: NotificationCategory.BUILDING,
    priority: NotificationPriority.MEDIUM,
    title: 'House Built',
    message: '{playerName} built a house on {propertyName}',
    icon: '🏘️',
    color: '#3b82f6',
    duration: 4000,
  },
  [NotificationType.PROPERTY_AUCTIONED]: {
    category: NotificationCategory.PROPERTY,
    priority: NotificationPriority.HIGH,
    title: 'Auction Started',
    message: '{propertyName} is up for auction!',
    icon: '🔨',
    color: '#f59e0b',
    duration: 7000,
  },
  [NotificationType.PLAYER_WON]: {
    category: NotificationCategory.GAME,
    priority: NotificationPriority.CRITICAL,
    title: 'Winner!',
    message: '{playerName} won the game!',
    icon: '🏆',
    color: '#fbbf24',
    duration: 15000,
  }
};

const DEFAULT_TEMPLATE: NotificationTemplate = {
  category: NotificationCategory.GAME,
  priority: NotificationPriority.LOW,
  title: 'Event',
  message: 'Something happened',
  icon: '📢',
  color: '#6b7280',
};

export default NotificationGenerator;
