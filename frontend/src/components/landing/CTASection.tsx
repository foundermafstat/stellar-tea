import Link from "next/link";

import { Button } from "@/components/ui/button";

export const CTASection = () => {
  return (
    <section className="relative mt-24 px-6 pb-32 sm:px-10 lg:px-20">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[40px] border border-white/60 bg-gradient-to-br from-pink-200/70 via-white/85 to-purple-200/70 p-10 text-center shadow-[0_32px_90px_rgba(189,140,255,0.3)] backdrop-blur-2xl lg:p-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl">
          <span className="tag-chip">Launch on Stellar</span>
          <h2 className="mt-6 text-slate-900">
            Ready to pour the next generation of Web3 onboarding?
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-600">
            Spin up Stellar Tea with Scaffold Stellar, tap into low-fee
            multi-sig smart contracts, and onboard your community with a
            sugar-smooth funnel. Demo the marketplace, review the docs, or book
            a partner session today.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              className="h-12 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-500 px-10 text-xs font-semibold uppercase tracking-[0.3em]"
            >
              <Link href="/marketplace">Experience the Demo</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border-white/70 bg-white/80 px-10 text-xs font-semibold uppercase tracking-[0.3em] text-purple-600"
            >
              <Link href="/docs">Review Technical Docs</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="h-12 rounded-full px-8 text-xs font-semibold uppercase tracking-[0.3em] text-pink-600 hover:bg-white/60"
            >
              <Link href="/contact">Book Partner Call</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

