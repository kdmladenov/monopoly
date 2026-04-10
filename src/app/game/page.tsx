'use client';

import Link from 'next/link';
import GameBoard from '@/components/game/Board/GameBoard';
import PropertyActionPanel from '@/components/game/Modals/PropertyActionPanel';
import GameInfoPanel from '@/components/game/UI/GameInfoPanel';
import TurnSidebar from '@/components/game/UI/TurnSidebar';
import { useGameTurnController } from '@/hooks/useGameTurnController';

export default function GamePage() {
  const {
    game,
    currentPlayer,
    bankruptPlayers,
    activeLandingSquare,
    landingOutcomeMessage,
    handleRoll,
    handleBankruptcy,
    handleLandingAction,
    handleStartAuction,
    handlePlaceAuctionBid,
    handleEndAuctionRound,
    handleEndTurn,
    handleBuildHouse,
    handleSellHouse,
    handleMortgageProperty,
    handleUnmortgageProperty,
  } = useGameTurnController();
  const auctionNextBidderName = game.auction.active
    ? game.players.find((player) => player.id === game.auction.participants[game.auction.currentBidderIndex])?.name ?? null
    : null;

  return (
    <main className="min-h-screen px-6 py-10 text-white">
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1fr_320px]">
        <section className="rounded-[2rem] border border-white/10 bg-[var(--panel)] p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between gap-4 px-2">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-cyan-200">Game board</p>
              <h1 className="text-3xl font-black">Worldopoly table</h1>
            </div>
            <Link href="/setup" className="rounded-full border border-white/15 px-4 py-2 text-sm transition hover:bg-white/8">
              Back to setup
            </Link>
          </div>

          <GameBoard board={game.board} players={game.players} />

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
            <GameInfoPanel game={game} />

            <PropertyActionPanel
              board={game.board}
              square={activeLandingSquare}
              player={currentPlayer}
              enableAuctions={game.settings.enableAuctions}
              auctionNextBidderName={auctionNextBidderName}
              onBuy={handleLandingAction}
              onStartAuction={handleStartAuction}
              onPlaceAuctionBid={handlePlaceAuctionBid}
              onEndAuctionRound={handleEndAuctionRound}
              onBuildHouse={handleBuildHouse}
              onSellHouse={handleSellHouse}
              onMortgageProperty={handleMortgageProperty}
              onUnmortgageProperty={handleUnmortgageProperty}
            />
            {landingOutcomeMessage ? (
              <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                {landingOutcomeMessage}
              </div>
            ) : null}
          </div>
        </section>

        <TurnSidebar
          game={game}
          currentPlayer={currentPlayer}
          bankruptPlayers={bankruptPlayers}
          onRoll={handleRoll}
          onEndTurn={handleEndTurn}
          onDeclareBankruptcy={handleBankruptcy}
        />
      </div>
    </main>
  );
}
