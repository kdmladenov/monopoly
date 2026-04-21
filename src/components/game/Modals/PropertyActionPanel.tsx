'use client';

import { BoardSquare, Player, SquareType } from '@/lib/game.types';
import { calculatePropertyRent, calculateTransportationRent } from '@/lib/utils/rent';

interface Props {
  board: BoardSquare[];
  square: BoardSquare | undefined;
  player: Player | undefined;
  enableAuctions?: boolean;
  auctionNextBidderName?: string | null;
  onBuy: () => void;
  onStartAuction?: () => void;
  onPlaceAuctionBid?: (amount: number) => void;
  onEndAuctionRound?: () => void;
  onBuildHouse: (propertyPosition: number) => void;
  onSellHouse: (propertyPosition: number) => void;
  onMortgageProperty: (propertyPosition: number) => void;
  onUnmortgageProperty: (propertyPosition: number) => void;
}

export default function PropertyActionPanel({
  board,
  square,
  player,
  enableAuctions = false,
  auctionNextBidderName = null,
  onBuy,
  onStartAuction,
  onPlaceAuctionBid,
  onEndAuctionRound,
  onBuildHouse,
  onSellHouse,
  onMortgageProperty,
  onUnmortgageProperty,
}: Props) {
  if (!square || !player) {
    return null;
  }

  if (square.type === SquareType.SPECIAL) {
    const effectLabel = square.special?.type ?? 'event';
    const effectCopy =
      square.special?.type === 'casino'
        ? 'Roll the dice of fate and see if you win or lose money.'
        : square.special?.type === 'lottery'
          ? 'Try your luck and hope the numbers come up in your favor.'
          : square.special?.description ?? `Special effect: ${square.special?.type ?? 'event'}`;
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Landing</p>
        <h2 className="mt-2 text-xl font-semibold">{square.special?.name ?? 'Special tile'}</h2>
        <p className="mt-2 text-slate-400">{effectCopy}</p>
        <div className="mt-4 rounded-xl border border-white/8 bg-white/5 p-3 text-xs">
          <p className="text-slate-400">Effect</p>
          <p className="mt-1 font-semibold text-white capitalize">{effectLabel}</p>
        </div>
      </div>
    );
  }

  if (square.type === SquareType.TRANSPORTATION && square.transportation) {
    const transportation = square.transportation;
    const rentAmount = transportation.ownerId
      ? calculateTransportationRent(transportation, board, transportation.ownerId)
      : transportation.rent.one;
    const isOwned = Boolean(transportation.ownerId);
    const ownedByCurrentPlayer = transportation.ownerId === player.id;

    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
        <p className="text-xs uppercase tracking-[0.2em] text-sky-200">Landing</p>
        <h2 className="mt-2 text-xl font-semibold">{transportation.name}</h2>
        <p className="mt-1 text-slate-400">{transportation.type}</p>

        <div className="mt-4 rounded-xl border border-white/8 bg-white/5 p-3 text-xs">
          {ownedByCurrentPlayer ? (
            <p>You own this route.</p>
          ) : isOwned ? (
            <p>You owe {rentAmount} for this route.</p>
          ) : (
            <p>Unowned route. You can buy it now.</p>
          )}
        </div>

        <button
          onClick={onBuy}
          className="mt-4 w-full rounded-xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200"
        >
          {isOwned ? `Pay route rent ${rentAmount}` : `Buy for ${transportation.price}`}
        </button>
      </div>
    );
  }

  if (square.type !== SquareType.PROPERTY || !square.property) {
    return null;
  }

  const property = square.property;
  const isOwned = Boolean(property.ownerId);
  const canBuy = !isOwned && player.money >= property.price;
  const sameColorProperties = board.filter(
    (item) => item.type === SquareType.PROPERTY && item.property?.color === property.color
  );
  const ownsColorSet =
    sameColorProperties.length > 0 &&
    sameColorProperties.every((item) => item.property?.ownerId === player.id);
  const canBuildHouse =
    property.ownerId === player.id &&
    player.money >= property.housePrice &&
    property.houses < 5 &&
    ownsColorSet;
  const ownedByCurrentPlayer = property.ownerId === player.id;
  const rentAmount = calculatePropertyRent(property, board);
  const canMortgage = ownedByCurrentPlayer && property.houses === 0 && !property.isMortgaged;
  const canUnmortgage = ownedByCurrentPlayer && property.isMortgaged;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-200">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Landing</p>
      <h2 className="mt-2 text-xl font-semibold">{property.name}</h2>
      <p className="mt-1 text-slate-400">{property.country}</p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-slate-400">Price</p>
          <p className="mt-1 font-semibold">{property.price}</p>
        </div>
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-slate-400">Rent</p>
          <p className="mt-1 font-semibold">{rentAmount}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-white/8 bg-white/5 p-3 text-xs">
        {ownedByCurrentPlayer ? (
          <p>You own this property.</p>
        ) : isOwned ? (
          <p>You owe {rentAmount} to the owner.</p>
        ) : (
          <p>{enableAuctions ? 'Unowned property. An auction will start if you cannot buy it.' : 'Unowned property. You can buy it now.'}</p>
        )}
      </div>

      {property.isMortgaged ? (
        <div className="mt-3 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-xs text-emerald-100">
          This property is mortgaged and does not collect rent.
        </div>
      ) : null}

      <button
        onClick={onBuy}
        disabled={!canBuy && !(enableAuctions && !isOwned && onStartAuction)}
        className="mt-4 w-full rounded-xl bg-cyan-300 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isOwned ? `Pay rent ${rentAmount}` : `Buy for ${property.price}`}
      </button>

      {enableAuctions && !isOwned && !canBuy && onStartAuction ? (
        <button
          onClick={onStartAuction}
          className="mt-3 w-full rounded-xl border border-amber-300/30 px-4 py-3 font-semibold text-amber-100 transition hover:bg-amber-300/10"
        >
          Start auction
        </button>
      ) : null}

      {enableAuctions && !isOwned && onPlaceAuctionBid ? (
        <button
          onClick={() => onPlaceAuctionBid(Math.max(1, Math.floor(property.price / 2)))}
          className="mt-3 w-full rounded-xl border border-fuchsia-300/30 px-4 py-3 font-semibold text-fuchsia-100 transition hover:bg-fuchsia-300/10"
        >
          Bid {Math.max(1, Math.floor(property.price / 2))}
        </button>
      ) : null}

      {enableAuctions && !isOwned && onEndAuctionRound ? (
        <button
          onClick={onEndAuctionRound}
          className="mt-3 w-full rounded-xl border border-white/15 px-4 py-3 font-semibold text-slate-100 transition hover:bg-white/8"
        >
          End auction round
        </button>
      ) : null}

      {enableAuctions && auctionNextBidderName ? (
        <p className="mt-3 text-xs text-slate-400">
          Next bidder: <span className="text-white">{auctionNextBidderName}</span>
        </p>
      ) : null}

      {canBuildHouse ? (
        <button
          onClick={() => onBuildHouse(property.position)}
          className="mt-3 w-full rounded-xl border border-white/15 px-4 py-3 font-semibold transition hover:bg-white/8"
        >
          Build house ({property.housePrice})
        </button>
      ) : null}

      {property.ownerId === player.id && property.houses > 0 ? (
        <button
          onClick={() => onSellHouse(property.position)}
          className="mt-3 w-full rounded-xl border border-amber-300/30 px-4 py-3 font-semibold text-amber-100 transition hover:bg-amber-300/10"
        >
          Sell house ({Math.floor(property.housePrice / 2)})
        </button>
      ) : null}

      {canMortgage ? (
        <button
          onClick={() => onMortgageProperty(property.position)}
          className="mt-3 w-full rounded-xl border border-slate-400/30 px-4 py-3 font-semibold text-slate-100 transition hover:bg-white/8"
        >
          Mortgage ({property.mortgageValue})
        </button>
      ) : null}

      {canUnmortgage ? (
        <button
          onClick={() => onUnmortgageProperty(property.position)}
          className="mt-3 w-full rounded-xl border border-emerald-300/30 px-4 py-3 font-semibold text-emerald-100 transition hover:bg-emerald-300/10"
        >
          Unmortgage ({Math.ceil(property.mortgageValue * 1.1)})
        </button>
      ) : null}
    </div>
  );
}
