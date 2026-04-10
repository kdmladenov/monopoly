import Link from 'next/link';

const highlights = [
  'Choose a continent and reshape the board',
  'Mix human and AI players in one session',
  'Build, trade, and outlast everyone else',
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col justify-between rounded-[2rem] border border-white/10 bg-[var(--panel)] p-8 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-12">
        <section className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="max-w-3xl space-y-6">
            <p className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm tracking-[0.22em] text-cyan-200 uppercase">
              Worldopoly
            </p>
            <h1 className="text-5xl font-black leading-none tracking-tight text-balance md:text-7xl">
              A globe-spanning strategy game built for long, dramatic turns.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Claim city groups, pressure opponents, and turn continents into
              your personal empire. This foundation now includes routing,
              Redux state, and the first app shell for setup and gameplay.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/setup"
                className="rounded-full bg-cyan-300 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Start setup
              </Link>
              <Link
                href="/game"
                className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/8"
              >
                View game board
              </Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-200">Foundation status</p>
                <p className="text-2xl font-semibold">Ready to expand</p>
              </div>
              <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm text-emerald-200">
                Alpha
              </div>
            </div>
            <ul className="space-y-4">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-white/8 bg-black/15 px-4 py-3 text-sm text-slate-200"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            ['Routes', 'Landing, setup, and game shells are wired up.'],
            ['State', 'Redux now has a dedicated game slice.'],
            ['Visuals', 'Global styling is set for the Worldopoly theme.'],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-3xl border border-white/10 bg-black/20 p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">{title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-200">{copy}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
