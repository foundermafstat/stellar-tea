import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PiCoffeeDuotone,
  PiSparkleDuotone,
  PiUsersThreeDuotone,
  PiLightningDuotone,
  PiChartLineUpDuotone,
  PiHandshakeDuotone,
  PiPlanetDuotone,
  PiClockCountdownDuotone,
} from "react-icons/pi";

const heroImage = {
  src: "/design/images/Layer 6.png",
  alt: "Immersive Stellar Tea concept art",
};

const sectionImages = [
  "/design/images/Layer 7.png",
  "/design/images/Layer 5.png",
  "/design/images/Layer 9.png",
];

const nftImages = [
  {
    src: "/design/nft/stellar-tea-001.png",
    title: "Stellar Tea #001",
    rarity: "Mythic",
  },
  {
    src: "/design/nft/stellar-tea-002.png",
    title: "Stellar Tea #002",
    rarity: "Rare",
  },
  {
    src: "/design/nft/stellar-tea-003.png",
    title: "Stellar Tea #003",
    rarity: "Legendary",
  },
];

const sections = [
  {
    id: "gameplay",
    title: "Core Gameplay",
    description:
      "Stellar Tea invites players to collect, blend, and trade vibrant NFT bubble teas. Each drink is a fully on-chain collectible with unique flavor, color, and rarity traits.",
    bullets: [
      "Collect dazzling teas across varied rarity tiers.",
      "Fuse two teas to craft brand-new legendary flavors.",
      "Showcase creations in immersive tea houses and galleries.",
    ],
    icon: PiCoffeeDuotone,
  },
  {
    id: "token-bubbles",
    title: "Dual-Token Economy",
    description:
      "A balanced economy powers daily play and high-stakes trading. The Bubbles and Stars tokens keep progression fun while preserving long-term value.",
    bullets: [
      "Bubbles (🟢) reward play, crafting, and experimentation.",
      "Stars (✨) unlock premium drops, market trades, and XLM conversions.",
      "Blend-to-earn mechanics ensure every session feels rewarding.",
    ],
    icon: PiChartLineUpDuotone,
  },
  {
    id: "community",
    title: "Social Play",
    description:
      "Collaboration is at the heart of Stellar Tea. Invite friends, form tea clubs, and run bustling tea houses to unlock exclusive rewards.",
    bullets: [
      "Earn special teas by inviting friends and teaming up.",
      "Form tea houses with shared goals, perks, and identity.",
      "Compete in seasonal events and social leaderboards.",
    ],
    icon: PiUsersThreeDuotone,
  },
  {
    id: "retention",
    title: "Retention Design",
    description:
      "Designed for multiple daily visits, Stellar Tea layers mini-games, timed missions, and collaborative rituals that keep the kettle bubbling.",
    bullets: [
      "Timed mini-games refresh every few hours.",
      "Daily missions encourage consistent progression.",
      "Co-op mixing flows introduce multi-sig transactions playfully.",
    ],
    icon: PiClockCountdownDuotone,
  },
  {
    id: "marketplace",
    title: "Why Stellar",
    description:
      "Built on Scaffold Stellar, the experience showcases how fast, transparent, and environmentally friendly Web3 gaming can be.",
    bullets: [
      "Instant, low-fee transactions on the Stellar network.",
      "Multi-sig teas demonstrate real-world smart contract power.",
      "A playful gateway into decentralized ownership and creativity.",
    ],
    icon: PiPlanetDuotone,
  },
];

const Home = () => {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<HTMLDivElement[]>([]);
  const [activeNft, setActiveNft] = useState(0);

  const addSectionRef = (el: HTMLDivElement | null) => {
    if (el && !sectionRefs.current.includes(el)) {
      sectionRefs.current.push(el);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current.querySelectorAll("[data-hero-animate]"),
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 1,
            ease: "power3.out",
          },
        );
      }

      sectionRefs.current.forEach((section) => {
        gsap.fromTo(
          section,
          { y: 70, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
            },
          },
        );
      });

      if (carouselRef.current) {
        gsap.to(carouselRef.current.querySelectorAll("[data-carousel-item]"), {
          y: -12,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: {
            each: 0.4,
            from: "center",
          },
        });
      }
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveNft((prev) => (prev + 1) % nftImages.length);
    }, 4500);
    return () => window.clearInterval(interval);
  }, []);

  const heroCopy = useMemo(
    () => ({
      kicker: "Play-to-earn taste lab",
      headline: "Stellar Tea blends creativity, community, and Web3 magic.",
      subheadline:
        "Craft vibrant NFT bubble teas, collaborate with friends, and master a dual-token economy that keeps the fun—and the rewards—flowing.",
    }),
    [],
  );

  return (
    <div className="flex flex-col gap-24 pb-24">
      <section
        ref={heroRef}
        className="relative overflow-hidden px-6 pt-16 lg:px-12"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-12 rounded-[40px] bg-card/70 p-10 shadow-confection backdrop-blur-lg lg:flex-row lg:items-center lg:gap-16">
          <div className="relative z-10 flex-1 space-y-6">
            <span
              data-hero-animate
              className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.25em] text-primary"
            >
              <PiSparkleDuotone className="h-4 w-4" />
              {heroCopy.kicker}
            </span>
            <h1
              data-hero-animate
              className="font-display text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              {heroCopy.headline}
            </h1>
            <p
              data-hero-animate
              className="max-w-xl text-lg text-muted-foreground"
            >
              {heroCopy.subheadline}
            </p>
            <div
              data-hero-animate
              className="flex flex-wrap items-center gap-3"
            >
              <Button
                asChild
                size="lg"
                className="rounded-full bg-primary px-6 text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90"
              >
                <Link to="#gameplay">Start brewing</Link>
              </Button>
              <Button
                variant="outline"
                className="rounded-full border-primary/20 bg-card/80 px-6 text-sm font-semibold text-primary hover:bg-primary/10"
              >
                <PiLightningDuotone className="mr-2 h-4 w-4" />
                View tokenomics
              </Button>
              <span className="ml-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <PiHandshakeDuotone className="h-4 w-4 text-secondary" />
                Co-create fusions in real time
              </span>
            </div>
          </div>
          <div className="relative flex flex-1 justify-center">
            <div className="relative w-full max-w-3xl">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/25 via-secondary/15 to-transparent blur-3xl" />
              <img
                src={encodeURI(heroImage.src)}
                alt={heroImage.alt}
                className="relative z-10 w-full rounded-[40px] border border-border/30 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4" ref={addSectionRef}>
            <h2 className="font-display text-3xl text-foreground">
              Hero Collectibles Carousel
            </h2>
            <p className="text-muted-foreground">
              A rotating gallery of signature Stellar Tea NFTs, each animated
              with a soft float to hint at the light, bubbly experience that
              awaits. Hover any tea to pause the slide and soak in the craft.
            </p>
          </div>
          <div
            ref={carouselRef}
            className="flex flex-1 items-center justify-center gap-6"
          >
            {nftImages.map((nft, index) => {
              const isActive = activeNft === index;
              return (
                <button
                  type="button"
                  key={nft.src}
                  data-carousel-item
                  onMouseEnter={() => setActiveNft(index)}
                  className={cn(
                    "group relative flex h-[320px] w-[220px] flex-col items-center justify-end overflow-hidden rounded-[28px] border border-primary/30 bg-card/80 p-4 shadow-lg transition-all",
                    isActive
                      ? "scale-105 shadow-confection"
                      : "scale-95 opacity-70 hover:opacity-95",
                  )}
                  aria-pressed={isActive}
                >
                  <img
                    src={nft.src}
                    alt={nft.title}
                    className={cn(
                      "absolute inset-x-4 top-8 h-[200px] w-auto object-contain drop-shadow-xl transition-transform duration-700",
                      isActive ? "translate-y-0" : "translate-y-4",
                    )}
                  />
                  <div className="relative z-10 mt-40 space-y-1 text-center">
                    <span className="text-sm font-semibold text-foreground">
                      {nft.title}
                    </span>
                    <span className="text-xs uppercase tracking-[0.3em] text-secondary">
                      {nft.rarity}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-16 px-6 lg:px-12">
        {sections.map(
          ({ id, title, description, bullets, icon: Icon }, index) => (
            <div
              key={id}
              id={id}
              ref={addSectionRef}
              className="mx-auto flex w-full max-w-6xl flex-col gap-10 rounded-[36px] bg-card/70 p-10 shadow-lg shadow-primary/10 ring-1 ring-border/40 backdrop-blur lg:flex-row"
            >
              <div className="flex flex-1 flex-col gap-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-primary">
                  <Icon className="h-4 w-4" />
                  {title}
                </span>
                <p className="text-lg text-muted-foreground">{description}</p>
                <ul className="space-y-3 text-sm text-foreground">
                  {bullets.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 h-2 w-2 rounded-full bg-secondary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <div className="relative flex h-[280px] w-full max-w-[360px] items-center justify-center overflow-hidden rounded-[32px] bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20">
                  <img
                    src={sectionImages[index % sectionImages.length]}
                    alt={`${title} visual`}
                    className="h-full w-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-card/70 via-transparent to-card/30" />
                </div>
              </div>
            </div>
          ),
        )}
      </section>

      <section className="px-6 lg:px-12">
        <div
          id="events"
          ref={addSectionRef}
          className="mx-auto flex w-full max-w-6xl flex-col gap-8 rounded-[32px] bg-primary/12 p-10 text-primary-foreground shadow-lg shadow-primary/30"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3 max-w-3xl">
              <h3 className="font-display text-3xl text-primary-foreground">
                Cooperative mixing introduces multi-signature smart contracts in
                a playful way.
              </h3>
              <p className="text-primary-foreground/80">
                When one player lists a tea for mixing, a unique link appears. A
                partner signs the joint transaction, and together they mint a
                brand-new fusion NFT—learning Stellar multi-sig by doing.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="rounded-full border border-primary/40 bg-background/80 px-6 text-primary hover:bg-background"
            >
              <Link to="/contracts/tea-game">Explore Tea Game contract</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Real-time fusions",
                value: "2-player",
              },
              {
                label: "Seasonal events",
                value: "Monthly",
              },
              {
                label: "Daily missions",
                value: "24h cycles",
              },
              {
                label: "Marketplace volume",
                value: "$XLM linked",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl bg-background/40 p-4 text-center text-primary"
              >
                <span className="block text-2xl font-semibold">
                  {stat.value}
                </span>
                <span className="text-xs uppercase tracking-[0.3em] text-primary/70">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-12">
        <div
          ref={addSectionRef}
          className="mx-auto flex w-full max-w-6xl flex-col gap-8 rounded-[32px] bg-card/70 p-10 shadow-lg ring-1 ring-border/40"
        >
          <div className="flex flex-col gap-4">
            <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-secondary">
              <PiPlanetDuotone className="h-4 w-4" />
              Built with Stellar
            </span>
            <h3 className="font-display text-3xl text-foreground">
              Why Stellar powers sweet on-chain experiences
            </h3>
            <p className="max-w-3xl text-muted-foreground">
              Fast finality, transparent contracts, and carbon-friendly
              infrastructure make Stellar the perfect foundation for social Web3
              gameplay. Scaffold Stellar streamlines deployment, so every
              interactive element of Stellar Tea stays on-chain and verifiable.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Transparent economy",
                copy: "Every blend, trade, and upgrade lives on-chain for full provenance.",
              },
              {
                title: "Scalable UX",
                copy: "Low fees and instant settlement keep experimentation frictionless.",
              },
              {
                title: "Gateway to Web3",
                copy: "Players learn wallets, multi-sig, and token swaps through play.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-primary/20 bg-background/60 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-confection"
              >
                <h4 className="text-xl font-semibold text-foreground">
                  {item.title}
                </h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
