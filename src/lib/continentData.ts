import europe from '@/data/continents/europe.json';
import asia from '@/data/continents/asia.json';
import africa from '@/data/continents/africa.json';
import northAmerica from '@/data/continents/north-america.json';
import southAmerica from '@/data/continents/south-america.json';
import oceania from '@/data/continents/oceania.json';
import world from '@/data/continents/world.json';

import { ContinentId } from './game.types';

export const continentDataMap = {
  [ContinentId.WORLD]: world,
  [ContinentId.EUROPE]: europe,
  [ContinentId.ASIA]: asia,
  [ContinentId.AFRICA]: africa,
  [ContinentId.NORTH_AMERICA]: northAmerica,
  [ContinentId.SOUTH_AMERICA]: southAmerica,
  [ContinentId.OCEANIA]: oceania,
} as const;

export type ContinentData = (typeof continentDataMap)[ContinentId];
