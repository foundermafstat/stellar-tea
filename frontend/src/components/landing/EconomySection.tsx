import Image from "next/image";

import economyVisual from "@/../public/design/images/Layer 3.png";

const tokenHighlights = [
  {
    name: "Bubbles (🟢)",
    headline: "Daily crafting fuel",
    bullets: [
      "Earned through quests, mini-games, and co-op mixes",
      "Spends on upgrades, ingredients, and time skips",
      "Soft-inflation tuned to keep newcomers in the loop",
    ],
  },
  {
    name: "Stars (✨)",
    headline: "Premium value layer",
    bullets: [
      "Backed 1:1 with XLM liquidity pools",
      "Required for marketplace listings and rare drops",
      "Staking bonuses unlock exclusive brewing slots",
    ],
  },
];

export const EconomySection = () => {
  return (
    <section className="relative mt-24 px-6 sm:px-10 lg:px-20">
      <div className="mx-auto max-w-6xl rounded-[40px] border border-white/60 bg-white/80 p-10 shadow-[0_28px_80px_rgba(189,140,255,0.22)] backdrop-blur-2xl lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:p-16">
        <div>
          <span className="tag-chip">Dual-token economy</span>
          <h2 className="mt-6 text-slate-900">
            Balance playful progression with real economic gravity
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            Stellar Tea merges a soft currency for everyday fun with a premium
            store of value that maps straight into Stellar liquidity. Clear
            separation keeps the meta fair, and gives advanced players true skin
            in the game.
          </p>

          <div className="mt-12 grid gap-6">
            {tokenHighlights.map((token) => (
              <article
                key={token.name}
                className="soft-panel border-white/70 bg-white/85"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {token.name}
                </p>
                <h3 className="mt-3 text-xl text-slate-900">
                  {token.headline}
                </h3>
                <ul className="mt-5 space-y-3 text-sm text-slate-600">
                  {token.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <span className="mt-1 inline-block h-2 w-2 rounded-full bg-pink-400" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <div className="relative mt-12 lg:mt-0">
          <div className="absolute -left-8 top-[-6rem] h-48 w-48 rounded-full bg-pink-200/50 blur-3xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-gradient-to-br from-white/80 via-pink-100/60 to-purple-100/60 p-6 shadow-[0_24px_70px_rgba(189,140,255,0.28)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.75),transparent_55%)]" />
            <Image
              src={economyVisual}
              alt="View of Stellar Tea economy dashboards"
              className="relative rounded-[24px]"
              priority={false}
            />
          </div>
          <div className="mt-6 rounded-[26px] border border-pink-200/60 bg-white/85 p-5 text-sm text-slate-600 shadow-[0_12px_40px_rgba(236,72,153,0.18)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-500">
              Defi alignment
            </p>
            <p className="mt-2">
              Stars plug into automated market makers on Stellar, while club
              treasuries leverage Soroban vaults to stream rewards in real time.
              Players graduate from casual tap-to-earn to sovereign finance
              without friction.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

