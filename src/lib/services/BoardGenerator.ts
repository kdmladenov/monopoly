import { continentDataMap } from '@/lib/continentData';
import {
  BoardSquare,
  ContinentId,
  PropertyDetails,
  SquareType,
  TransportationSquare,
} from '@/lib/game.types';

export class BoardGenerator {
  generateBoard(continentId: ContinentId): BoardSquare[] {
    const continent = (continentDataMap as any)[continentId];
    
    // If it's already flat (legacy/hardcoded), just return it
    if (continent.squares) {
      return (continent.squares as any[]).map((s: any) => this.mapToBoardSquare(s));
    }

    // Hierarchical logic for the restored schema
    const squares: BoardSquare[] = [];
    const properties: any[] = [];
    continent.countries.forEach((country: any) => {
      country.cities.forEach((city: any) => {
        properties.push({ ...city, color: country.color });
      });
    });

    const transportation = continent.transportation || [];
    const specials = continent.specialSquares || [];

    // Define fixed positions for a 40-tile board (13x9 corners: 0, 12, 20, 32)
    // This is a simplified logic to fill the board
    for (let i = 0; i < 40; i++) {
      let type: SquareType = SquareType.SPECIAL;
      let data: any = null;

      // Corner Assignments (6x16: 0, 5, 20, 25)
      if (i === 0) data = specials.find((s: any) => s.type === 'start') || { name: 'GO', type: 'start' };
      else if (i === 5) {
        type = SquareType.TRANSPORTATION;
        data = transportation[0] || { name: 'Station', type: 'station', price: 2000 };
      }
      else if (i === 20) data = specials.find((s: any) => s.type === 'jail') || { name: 'JAIL', type: 'jail' };
      else if (i === 25) data = specials.find((s: any) => s.type === 'freeParking') || { name: 'FREE PARKING', type: 'freeParking' };
      else if (i === 19) data = specials.find((s: any) => s.type === 'goToJail') || { name: 'GO TO JAIL', type: 'goToJail' };
      
      // Other Transportation (15, 25(taken), 35)
      else if ([15, 35].includes(i)) {
        type = SquareType.TRANSPORTATION;
        const tIndex = i === 15 ? 1 : 3;
        data = transportation[tIndex] || { name: 'Station', type: 'station', price: 2000 };
      }
      
      // Special Item Dispersion
      else if ([2, 17, 33].includes(i)) data = specials.find((s: any) => s.type === 'lottery') || { name: 'Lottery', type: 'lottery' };
      else if ([6, 22, 36].includes(i)) data = specials.find((s: any) => s.type === 'casino') || { name: 'Casino', type: 'casino' };
      else if (i === 4 || i === 38) {
        const taxS = specials.filter((s: any) => s.type === 'tax');
        data = (i === 4 ? taxS[0] : taxS[1]) || { name: 'Tax', type: 'tax', amount: 2000 };
      }

      // Property Filling
      else {
        type = SquareType.PROPERTY;
        // Find a property that hasn't been assigned yet? Simple sequence for now
        // Standard Monopoly property indices: 1, 3, 6, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24, 26, 27, 28, 29, 31, 34, 37, 39
        const propIndices = [1, 3, 7, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24, 26, 27, 28, 29, 31, 34, 37, 39];
        const pIndex = propIndices.indexOf(i);
        if (pIndex !== -1 && properties[pIndex]) {
          data = properties[pIndex];
        } else {
          // Fill remaining property slots with generic or neighbors
          type = SquareType.SPECIAL;
          data = { name: 'Card', type: 'lottery' };
        }
      }

      squares.push(this.createSquareFromData(i, type, data));
    }

    return squares;
  }

  private mapToBoardSquare(s: any): BoardSquare {
    const square: BoardSquare = {
      id: `square_${s.position}`,
      position: s.position,
      type: s.type as SquareType,
    };

    if (s.type === SquareType.PROPERTY && s.property) {
      square.property = { ...s.property, id: `property_${s.position}`, position: s.position, ownerId: null, houses: 0, isMortgaged: false };
    } else if (s.type === SquareType.TRANSPORTATION && s.transportation) {
      square.transportation = { ...s.transportation, ownerId: null };
    } else if (s.type === SquareType.SPECIAL && s.special) {
      square.special = s.special;
    }
    return square;
  }

  private createSquareFromData(pos: number, type: SquareType, data: any): BoardSquare {
    const square: BoardSquare = {
      id: `square_${pos}`,
      position: pos,
      type,
    };

    if (type === SquareType.PROPERTY) {
      const colorMap: any = { brown: '#78350f', lightBlue: '#60a5fa', purple: '#a855f7', orange: '#fb923c', red: '#ef4444', yellow: '#facc15', green: '#22c55e', darkBlue: '#1e40af' };
      square.property = {
        id: `prop_${pos}`,
        name: data.name,
        type: SquareType.PROPERTY,
        position: pos,
        price: data.price,
        color: colorMap[data.color] || data.color || '#ccc',
        rentStructure: {
          base: data.rentBase,
          house1: data.rent1House,
          house2: data.rent2House,
          house3: data.rent3House,
          house4: data.rent4House,
          hotel: data.rentHotel,
        },
        housePrice: data.housePrice,
        mortgageValue: data.mortgageValue,
        ownerId: null,
        houses: 0,
        isMortgaged: false,
      };
    } else if (type === SquareType.TRANSPORTATION) {
      square.transportation = {
        type: data.type,
        name: data.name,
        price: data.price,
        rent: data.rent,
        mortgageValue: data.mortgageValue,
        ownerId: null,
      };
    } else {
      square.special = {
        type: data.type,
        name: data.name,
        amount: data.amount,
      };
    }

    return square;
  }
}
