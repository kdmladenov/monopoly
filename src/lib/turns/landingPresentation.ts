import { LandingIntent } from './landingController';

export function getLandingOutcomeMessage(intent: LandingIntent | null): string | null {
  if (!intent) {
    return null;
  }

  if (intent.kind === 'pay-rent') {
    return `Rent has been paid automatically for this landing.`;
  }

  if (intent.kind === 'special') {
    return intent.message;
  }

  return null;
}
