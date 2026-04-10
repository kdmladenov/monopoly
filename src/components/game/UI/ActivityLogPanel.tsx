'use client';

interface Props {
  entries: string[];
}

export default function ActivityLogPanel({ entries }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-300">
      <p className="font-semibold text-white">Activity log</p>
      <div className="mt-3 space-y-2">
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <div key={`${entry}-${index}`} className="rounded-xl bg-white/5 px-3 py-2 text-xs leading-5">
              {entry}
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500">No actions yet.</p>
        )}
      </div>
    </div>
  );
}
