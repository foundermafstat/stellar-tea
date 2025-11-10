const loops = [
  {
    title: "Micro sessions",
    description:
      "Every 4 hours, quick-tap brewing mini-games drop fresh ingredients and accelerate club progress without grinding.",
    insight: "Avg. session length: 6m 12s with 3 on-chain actions.",
  },
  {
    title: "Daily mastery track",
    description:
      "Mission cards rotate daily to teach wallet signatures, swaps, and staking. Players earn badges that unlock décor perks.",
    insight: "Mission completion lifts 7-day retention by 34%.",
  },
  {
    title: "Seasonal showdowns",
    description:
      "Team up for leaderboard pushes with themed recipes and shared vault staking. Winners take home exclusive fusions.",
    insight: "Season finales drive 4x marketplace volume.",
  },
];

export const EngagementSection = () => {
  return (
    <section className="relative mt-24 px-6 sm:px-10 lg:px-20">
      <div className="mx-auto max-w-6xl rounded-[40px] border border-white/60 bg-white/80 p-10 shadow-[0_28px_75px_rgba(189,140,255,0.24)] backdrop-blur-2xl lg:p-16">
        <header className="max-w-3xl">
          <span className="tag-chip">Retention engine</span>
          <h2 className="mt-6 text-slate-900">
            Delight players into daily on-chain momentum
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            Engagement loops are tuned around small wins, social nudges, and
            automated education. The result: players come back multiple times a
            day and graduate from casual fans to Web3 natives.
          </p>
        </header>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {loops.map((loop) => (
            <article
              key={loop.title}
              className="soft-panel relative overflow-hidden border-white/70 bg-white/85"
            >
              <div className="absolute -right-6 top-6 h-32 w-32 rounded-full bg-pink-200/55 blur-3xl" />
              <h3 className="text-lg font-semibold uppercase tracking-[0.28em] text-purple-600">
                {loop.title}
              </h3>
              <p className="mt-4 text-sm text-slate-600">{loop.description}</p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-pink-500">
                {loop.insight}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

