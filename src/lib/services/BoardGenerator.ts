import { continentDataMap } from '@/lib/continentData';
import {
  BoardSquare,
  ContinentId,
  PropertyDetails,
  SpecialSquare,
  SquareType,
  TransportationSquare,
} from '@/lib/game.types';

type ContinentModel = {
  countries: Array<{
    name: string;
    color: string;
    cities: Array<{
      name: string;
      price: number;
      rentBase: number;
      rent1House: number;
      rent2House: number;
      rent3House: number;
      rent4House: number;
      rentHotel: number;
      housePrice: number;
      mortgageValue: number;
    }>;
  }>;
  transportation: TransportationSquare[];
  specialSquares: SpecialSquare[];
};

export class BoardGenerator {
  generateBoard(continentId: ContinentId): BoardSquare[] {
    const continent = continentDataMap[continentId] as unknown as ContinentModel;
    const cityPool = this.buildCityPool(continent);
    const transportPositions = [5, 15, 25, 35];
    const specialByPosition = new Map<number, SpecialSquare>();

    continent.specialSquares.forEach((square, index) => {
      if (square.type === 'start') specialByPosition.set(0, square);
      if (square.type === 'jail') specialByPosition.set(10, square);
      if (square.type === 'freeParking') specialByPosition.set(20, square);
      if (square.type === 'goToJail') specialByPosition.set(30, square);
      if (square.type === 'casino') specialByPosition.set(index === 0 ? 7 : 22, square);
      if (square.type === 'lottery') specialByPosition.set(index === 0 ? 2 : 17, square);
      if (square.type === 'tax') specialByPosition.set(index === 0 ? 4 : 38, square);
    });

    const board: BoardSquare[] = [];
    let cityIndex = 0;
    let transportIndex = 0;

    for (let position = 0; position < 40; position += 1) {
      if (position === 0) {
        board.push({
          id: `square_${position}`,
          position,
          type: SquareType.SPECIAL,
          special: continent.specialSquares.find((square) => square.type === 'start'),
        });
        continue;
      }

      if (transportPositions.includes(position)) {
        const transportation = continent.transportation[transportIndex % continent.transportation.length];
        board.push({
          id: `square_${position}`,
          position,
          type: SquareType.TRANSPORTATION,
          transportation: {
            ...transportation,
            ownerId: null,
          } as TransportationSquare,
        });
        transportIndex += 1;
        continue;
      }

      const special = specialByPosition.get(position);
      if (special) {
        board.push({
          id: `square_${position}`,
          position,
          type: SquareType.SPECIAL,
          special,
        });
        continue;
      }

      const city = cityPool[cityIndex % cityPool.length];
      board.push({
        id: `square_${position}`,
        position,
        type: SquareType.PROPERTY,
        property: this.toProperty(position, city, cityIndex),
      });
      cityIndex += 1;
    }

    return board;
  }

  private buildCityPool(continent: ContinentModel) {
    return continent.countries.flatMap((country) =>
      country.cities.map((city, index) => ({
        ...city,
        country: country.name,
        color: country.color,
        key: `${country.name}-${city.name}-${index}`,
      }))
    );
  }

  private toProperty(position: number, city: ReturnType<typeof this.buildCityPool>[number], index: number): PropertyDetails {
    const suffix = city.key ? ` ${Math.floor(index / 12) + 1}` : '';
    return {
      id: `property_${position}`,
      name: `${city.name}${suffix}`,
      type: SquareType.PROPERTY,
      position,
      country: city.country,
      color: city.color,
      price: city.price,
      rentStructure: {
        base: city.rentBase,
        house1: city.rent1House,
        house2: city.rent2House,
        house3: city.rent3House,
        house4: city.rent4House,
        hotel: city.rentHotel,
      },
      housePrice: city.housePrice,
      mortgageValue: city.mortgageValue,
      ownerId: null,
      houses: 0,
      isMortgaged: false,
    };
  }

  private propertyPositions(): number[] {
    return [
      1, 3, 6, 8, 9,
      11, 13, 14, 16, 18, 19,
      21, 23, 24, 26, 27, 29,
      31, 32, 33, 34, 36, 37, 39,
    ];
  }
}
