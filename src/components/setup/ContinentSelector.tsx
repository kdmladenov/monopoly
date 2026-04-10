'use client';

import { ContinentId } from '@/lib/game.types';

const continents = [
  { id: ContinentId.EUROPE, label: 'Europe', accent: 'from-blue-500/30 to-cyan-400/10' },
  { id: ContinentId.ASIA, label: 'Asia', accent: 'from-amber-500/30 to-orange-400/10' },
  { id: ContinentId.AFRICA, label: 'Africa', accent: 'from-orange-500/30 to-amber-400/10' },
  { id: ContinentId.NORTH_AMERICA, label: 'North America', accent: 'from-emerald-500/30 to-teal-400/10' },
  { id: ContinentId.SOUTH_AMERICA, label: 'South America', accent: 'from-violet-500/30 to-fuchsia-400/10' },
  { id: ContinentId.OCEANIA, label: 'Oceania', accent: 'from-cyan-500/30 to-sky-400/10' },
];

interface ContinentSelectorProps {
  selected: ContinentId;
  onSelect: (continent: ContinentId) => void;
}

export default function ContinentSelector({ selected, onSelect }: ContinentSelectorProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
      <h2 className="text-lg font-semibold">Continent</h2>
      <p className="mt-2 text-sm text-slate-400">Pick the map style before the board is generated.</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {continents.map((continent) => {
          const isSelected = continent.id === selected;

          return (
            <button
              key={continent.id}
              onClick={() => onSelect(continent.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                isSelected
                  ? 'border-cyan-300 bg-cyan-300/15 text-cyan-50 shadow-lg shadow-cyan-900/20'
                  : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
              }`}
            >
              <div className={`mb-3 h-2 rounded-full bg-gradient-to-r ${continent.accent}`} />
              <p className="font-semibold">{continent.label}</p>
              <p className="mt-1 text-xs text-slate-400">
                {isSelected ? 'Selected' : 'Tap to choose'}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
