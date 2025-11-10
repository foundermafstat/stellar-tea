import Image from "next/image";

import mixingBoard from "@/../public/design/images/Layer 5.png";

const steps = [
  {
    title: "List a tea for mixing",
    description:
      "Select any NFT from your cellar, set desired rarity targets, and publish a mixing invite with one tap.",
    detail: "The Soroban contract locks your NFT while the invite is live.",
  },
  {
    title: "Share the fusion link",
    description:
      "A co-op URL invites a partner to review the recipe, contribute their tea, and co-sign the transaction in-wallet.",
    detail: "Multi-sig prompts teach players Stellar’s collaborative signing flow.",
  },
  {
    title: "Mint the hybrid flavor",
    description:
      "Once signed by both wallets, the contract burns the ingredients and mints a brand-new rarity tier with shared rewards.",
    detail:
      "Bonus multipliers pay out Bubbles to both players while Stars stake the premium share.",
  },
];

export const MixingShowcase = () => {
  return (
    <section className="relative mt-24 px-6 sm:px-10 lg:px-20">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 overflow-hidden rounded-[40px] border border-white/60 bg-white/75 p-10 shadow-[0_24px_70px_rgba(194,132,255,0.25)] backdrop-blur-2xl lg:flex-row lg:p-16">
        <div className="relative flex-1">
          <div className="tag-chip">Two-player mixing ritual</div>
          <h2 className="mt-6 text-slate-900">
            Multi-signature magic that feels like a toast
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            Stellar Tea transforms multi-party transactions into a celebratory
            ritual. Teach wallets, signatures, and Soroban logic through tactile
            play instead of dry tutorials.
          </p>
          <ul className="mt-10 space-y-8">
            {steps.map((step, index) => (
              <li key={step.title} className="group relative pl-8">
                <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-pink-400/70 text-sm font-semibold text-white shadow-lg">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold uppercase tracking-[0.3em] text-slate-500">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
                <p className="mt-2 text-xs text-pink-500">{step.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex-1">
          <div className="absolute -top-14 right-4 h-40 w-40 rounded-full bg-purple-200/60 blur-3xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/60 bg-gradient-to-br from-white/80 via-pink-100/60 to-purple-100/60 p-6 shadow-[0_18px_60px_rgba(189,140,255,0.28)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.8),transparent_60%)]" />
            <Image
              src={mixingBoard}
              alt="Mixing workflow interface"
              className="relative rounded-[24px] shadow-[0_28px_60px_rgba(175,120,255,0.25)]"
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

