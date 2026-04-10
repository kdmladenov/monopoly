import { BoardSquare, PropertyDetails, SquareType, TransportationSquare } from '@/lib/game.types';

export function calculatePropertyRent(
  property: PropertyDetails,
  board: BoardSquare[]
): number {
  if (property.isMortgaged) {
    return 0;
  }

  if (property.houses === 0) {
    const monopoly = hasMonopoly(property, board);
    return monopoly ? property.rentStructure.base * 2 : property.rentStructure.base;
  }

  switch (property.houses) {
    case 1:
      return property.rentStructure.house1;
    case 2:
      return property.rentStructure.house2;
    case 3:
      return property.rentStructure.house3;
    case 4:
      return property.rentStructure.house4;
    case 5:
      return property.rentStructure.hotel;
    default:
      return property.rentStructure.base;
  }
}

export function calculateTransportationRent(
  transportation: TransportationSquare,
  board: BoardSquare[],
  ownerId: string
): number {
  const ownedCount = board.filter(
    (square) =>
      square.type === SquareType.TRANSPORTATION &&
      square.transportation?.ownerId === ownerId
  ).length;

  switch (ownedCount) {
    case 1:
      return transportation.rent.one;
    case 2:
      return transportation.rent.two;
    case 3:
      return transportation.rent.three;
    case 4:
      return transportation.rent.four;
    default:
      return transportation.rent.one;
  }
}

function hasMonopoly(property: PropertyDetails, board: BoardSquare[]): boolean {
  if (!property.color) {
    return false;
  }

  const propertiesOfColor = board.filter(
    (square) => square.type === SquareType.PROPERTY && square.property?.color === property.color
  );

  return propertiesOfColor.length > 0 && propertiesOfColor.every((square) => square.property?.ownerId === property.ownerId);
}
