import Image from "next/image";

import socialVisual from "@/../public/design/images/Layer 4.png";

const socialPillars = [
  {
    heading: "Tea clubs",
    copy: "Create or join dedicated groups with shared vaults, weekly quests, and custom lounges that evolve with your crew.",
    stat: "1.8K clubs earning seasonal rewards",
  },
  {
    heading: "Invite-to-earn",
    copy: "Refer friends with deep-link invites that reward rare accessories, décor drops, and brewing boosts instead of raw tokens.",
    stat: "Avg. 2.6 new players per invite chain",
  },
  {
    heading: "Tea houses",
    copy: "Virtual venues host tasting parties, leaderboard reveals, and co-op challenges. Every décor item is an NFT with utility.",
    stat: "71% of sessions happen inside houses",
  },
];

export const SocialSection = () => {
  return (
    <section className="relative mt-24 px-6 sm:px-10 lg:px-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[40px] border border-white/60 bg-white/78 shadow-[0_28px_75px_rgba(178,132,255,0.22)] backdrop-blur-2xl">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative p-10 lg:p-16">
            <span className="tag-chip">Social-first design</span>
            <h2 className="mt-6 text-slate-900">
              Build a fandom that returns for the people and the pours
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              Stellar Tea bakes community into every layer. Play together, mint
              together, and celebrate each fusion as a club milestone. Social
              mechanics amplify retention without inflating the economy.
            </p>

            <div className="mt-10 space-y-8">
              {socialPillars.map((pillar) => (
                <div key={pillar.heading} className="soft-panel bg-white/85">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-pink-500">
                    {pillar.heading}
                  </p>
                  <p className="mt-3 text-sm text-slate-600">{pillar.copy}</p>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-purple-600">
                    {pillar.stat}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100/60 via-white/70 to-purple-100/60" />
            <div className="relative flex h-full items-end justify-center p-10 lg:p-16">
              <div className="relative w-full overflow-hidden rounded-[32px] border border-white/60 bg-white/85 shadow-[0_22px_65px_rgba(189,140,255,0.3)]">
                <Image
                  src={socialVisual}
                  alt="Social experience inside Stellar Tea"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

