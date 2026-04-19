import { continentDataMap } from '@/lib/continentData';
import {
  BoardSquare,
  ContinentId,
  SquareType,
} from '@/lib/game.types';

export class BoardGenerator {
  generateBoard(continentId: ContinentId): BoardSquare[] {
    const continent = (continentDataMap as any)[continentId];
    
    if (continentId === ContinentId.CLASSIC) {
      return this.generateClassicBoard(continent);
    }

    // Hierarchical logic for Europoly-style boards
    const squares: BoardSquare[] = [];
    const properties: any[] = [];
    continent.countries.forEach((country: any) => {
      country.cities.forEach((city: any) => {
        properties.push({ ...city, color: country.color });
      });
    });

    const transportation = continent.transportation || [];
    const specials = continent.specialSquares || [];

    for (let i = 0; i < 40; i++) {
      let type: SquareType = SquareType.SPECIAL;
      let data: any = null;

      // Corner Assignments (6x16: 0, 5, 20, 25)
      if (i === 0) data = specials.find((s: any) => s.type === 'start') || { name: 'GO', type: 'start' };
      else if (i === 5) data = specials.find((s: any) => s.type === 'jail') || { name: 'JAIL', type: 'jail' };
      else if (i === 20) data = specials.find((s: any) => s.type === 'freeParking') || { name: 'FREE PARKING', type: 'freeParking' };
      else if (i === 25) data = specials.find((s: any) => s.type === 'goToJail') || { name: 'GO TO JAIL', type: 'goToJail' };
      
      // Transportation slots
      else if ([6, 15, 26, 35].includes(i)) {
        type = SquareType.TRANSPORTATION;
        const tIndex = [6, 15, 26, 35].indexOf(i);
        data = transportation[tIndex] || { name: 'Station', type: 'station', price: 2000 };
      }
      
      // Special Items
      else if ([2, 10, 17, 22, 33, 36].includes(i)) data = specials.find((s: any) => s.type === 'lottery') || { name: 'CHANCE', type: 'lottery' };
      else if (i === 4 || i === 38) {
        const taxS = specials.filter((s: any) => s.type === 'tax');
        data = (i === 4 ? taxS[0] : taxS[1]) || { name: 'Tax', type: 'tax', amount: 2000 };
      }
      // Utilities
      else if (i === 12 || i === 29) {
        type = SquareType.TRANSPORTATION;
        data = { name: i === 12 ? 'Electric Co.' : 'Water Works', type: 'utility', price: 1500, rent: { one: 400, two: 1000, three: 2000, four: 4000 }, mortgageValue: 750 };
      }
      // Property Filling
      else {
        type = SquareType.PROPERTY;
        const propIndices = [1, 3, 7, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24, 27, 28, 30, 31, 32, 34, 37, 39];
        const pIndex = propIndices.indexOf(i);
        if (pIndex !== -1 && properties[pIndex]) {
          data = properties[pIndex];
        } else {
          type = SquareType.SPECIAL;
          data = { name: 'CHANCE', type: 'lottery' };
        }
      }
      squares.push(this.createSquareFromData(i, type, data));
    }
    return squares;
  }

  private generateClassicBoard(continent: any): BoardSquare[] {
    const squares: BoardSquare[] = [];
    const props = continent.countries.flatMap((c: any) => c.cities.map((city: any) => ({ ...city, color: c.color })));
    const trans = continent.transportation;
    const special = continent.specialSquares;

    // Classic mapping for 40 squares on 6x16 grid
    const layout = [
      { pos: 0, type: SquareType.SPECIAL, data: special[0] }, // GO
      { pos: 1, type: SquareType.PROPERTY, data: props[0] }, // Med
      { pos: 2, type: SquareType.SPECIAL, data: special[3] }, // Chest
      { pos: 3, type: SquareType.PROPERTY, data: props[1] }, // Baltic
      { pos: 4, type: SquareType.SPECIAL, data: special[5] }, // Income Tax
      { pos: 5, type: SquareType.SPECIAL, data: special[1] }, // Jail
      { pos: 6, type: SquareType.TRANSPORTATION, data: trans[0] }, // Reading
      { pos: 7, type: SquareType.PROPERTY, data: props[2] }, // Oriental
      { pos: 8, type: SquareType.SPECIAL, data: special[4] }, // Chance
      { pos: 9, type: SquareType.PROPERTY, data: props[3] }, // Vermont
      { pos: 10, type: SquareType.PROPERTY, data: props[4] }, // Conn
      { pos: 11, type: SquareType.PROPERTY, data: props[5] }, // St Charles
      { pos: 12, type: SquareType.TRANSPORTATION, data: { name: 'Electric Co.', price: 1500, rent: { one: 400, two: 1000, three: 2000, four: 4000 }, mortgageValue: 750 } },
      { pos: 13, type: SquareType.PROPERTY, data: props[6] }, // States
      { pos: 14, type: SquareType.PROPERTY, data: props[7] }, // Virginia
      { pos: 15, type: SquareType.TRANSPORTATION, data: trans[1] }, // Penn RR
      { pos: 16, type: SquareType.PROPERTY, data: props[8] }, // St James
      { pos: 17, type: SquareType.SPECIAL, data: special[8] }, // Chest
      { pos: 18, type: SquareType.PROPERTY, data: props[9] }, // Tenn
      { pos: 19, type: SquareType.PROPERTY, data: props[10] }, // NY
      { pos: 20, type: SquareType.SPECIAL, data: special[7] }, // Parking
      { pos: 21, type: SquareType.PROPERTY, data: props[11] }, // Kent
      { pos: 22, type: SquareType.SPECIAL, data: special[9] }, // Chance
      { pos: 23, type: SquareType.PROPERTY, data: props[12] }, // Ind
      { pos: 24, type: SquareType.PROPERTY, data: props[13] }, // Ill
      { pos: 25, type: SquareType.SPECIAL, data: special[2] }, // Goto Jail
      { pos: 26, type: SquareType.TRANSPORTATION, data: trans[2] }, // B&O
      { pos: 27, type: SquareType.PROPERTY, data: props[14] }, // Atl
      { pos: 28, type: SquareType.PROPERTY, data: props[15] }, // Vent
      { pos: 29, type: SquareType.TRANSPORTATION, data: { name: 'Water Works', price: 1500, rent: { one: 400, two: 1000, three: 2000, four: 4000 }, mortgageValue: 750 } },
      { pos: 30, type: SquareType.PROPERTY, data: props[16] }, // Marv
      { pos: 31, type: SquareType.PROPERTY, data: props[17] }, // Pac
      { pos: 32, type: SquareType.PROPERTY, data: props[18] }, // NC
      { pos: 33, type: SquareType.SPECIAL, data: special[8] }, // Chest
      { pos: 34, type: SquareType.PROPERTY, data: props[19] }, // Penn Ave
      { pos: 35, type: SquareType.TRANSPORTATION, data: trans[3] }, // Short
      { pos: 36, type: SquareType.SPECIAL, data: special[4] }, // Chance
      { pos: 37, type: SquareType.PROPERTY, data: props[20] }, // Park
      { pos: 38, type: SquareType.SPECIAL, data: special[6] }, // Lux Tax
      { pos: 39, type: SquareType.PROPERTY, data: props[21] }, // Board
    ];

    layout.forEach(item => {
      squares.push(this.createSquareFromData(item.pos, item.type, item.data));
    });

    return squares;
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
        type: data.type || 'station',
        name: data.name,
        price: data.price,
        rent: data.rent || { one: 250, two: 500, three: 1000, four: 2000 },
        mortgageValue: data.mortgageValue || 1000,
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
