import { Link, NavLink } from "react-router-dom";
import { memo, useMemo } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import WalletMenu from "./WalletMenu";
import {
  PiGameControllerDuotone,
  PiHandshakeDuotone,
  PiSparkleDuotone,
  PiRocketLaunchDuotone,
  PiMedalDuotone,
} from "react-icons/pi";

const logoUrl = new URL(
  "../../../public/design/svg/stellar-tea-icon.svg",
  import.meta.url,
).href;

const overviewLinks = [
  {
    title: "Gameplay",
    description: "Collect, blend, and showcase rare bubble teas.",
    hash: "gameplay",
    icon: PiGameControllerDuotone,
  },
  {
    title: "Community",
    description: "Join tea clubs and houses to accelerate your progress.",
    hash: "community",
    icon: PiHandshakeDuotone,
  },
  {
    title: "Events",
    description: "Seasonal challenges and leaderboards with NFT rewards.",
    hash: "events",
    icon: PiMedalDuotone,
  },
];

const economyLinks = [
  {
    title: "Bubbles",
    description: "Core currency for crafting, mixing, and daily activities.",
    hash: "token-bubbles",
  },
  {
    title: "Stars",
    description:
      "Premium token convertible to XLM and used on the marketplace.",
    hash: "token-stars",
  },
  {
    title: "Marketplace",
    description: "Create liquidity for rare flavors and monetize creativity.",
    hash: "marketplace",
  },
];

const contractLinks = [
  { label: "BALLS Token", to: "/contracts/balls" },
  { label: "STARS Token", to: "/contracts/stars" },
  { label: "Tea NFT", to: "/contracts/tea-nft" },
  { label: "Tea Game", to: "/contracts/tea-game" },
];

const hashLink = (hash: string) => ({ pathname: "/", hash });

const maskStyle = {
  WebkitMaskImage: `url(${logoUrl})`,
  WebkitMaskRepeat: "no-repeat" as const,
  WebkitMaskSize: "contain" as const,
  maskImage: `url(${logoUrl})`,
  maskRepeat: "no-repeat" as const,
  maskSize: "contain" as const,
};

const LogoMark = memo(() => (
  <Link to="/" className="group inline-flex items-center gap-3 text-primary">
    <span
      aria-hidden
      className="h-10 w-10 rounded-3xl bg-current shadow-confection transition-transform duration-500 group-hover:rotate-6 group-hover:scale-105"
      style={maskStyle}
    />
    <span className="flex flex-col leading-tight">
      <span className="font-display text-xl uppercase tracking-[0.2em] text-foreground">
        Stellar Tea
      </span>
      <span className="text-xs text-muted-foreground">
        Sweet Web3 Confectionery
      </span>
    </span>
  </Link>
));
LogoMark.displayName = "LogoMark";

const OverviewGrid = () => (
  <div className="grid gap-4 p-6 md:w-[520px] md:grid-cols-3">
    {overviewLinks.map(({ hash, title, description, icon: Icon }) => (
      <Link
        key={hash}
        to={hashLink(hash)}
        className="group flex flex-col gap-2 rounded-3xl bg-card/80 p-4 text-left shadow-sm ring-1 ring-border/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-confection"
      >
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </Link>
    ))}
  </div>
);

const EconomyList = () => (
  <div className="flex flex-col gap-4 p-6 md:w-[480px]">
    {economyLinks.map(({ hash, title, description }) => (
      <Link
        key={hash}
        to={hashLink(hash)}
        className="group flex items-start gap-3 rounded-3xl bg-card/80 p-4 shadow-sm ring-1 ring-border/40 transition-all duration-300 hover:-translate-y-1 hover:bg-primary/10"
      >
        <span className="mt-1 h-2 w-2 rounded-full bg-secondary" />
        <span className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground">{description}</span>
        </span>
      </Link>
    ))}
  </div>
);

const ContractLinks = () => (
  <div className="flex flex-col gap-2 p-6 md:w-[320px]">
    <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
      Contracts
    </span>
    <div className="flex flex-col gap-1">
      {contractLinks.map(({ label, to }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex items-center justify-between rounded-2xl px-4 py-2 text-sm transition-colors",
              isActive
                ? "bg-primary/15 text-primary"
                : "hover:bg-primary/10 hover:text-primary",
            )
          }
        >
          {label}
          <PiRocketLaunchDuotone className="h-4 w-4 opacity-60" />
        </NavLink>
      ))}
    </div>
  </div>
);

const PageLinks = memo(() => {
  const quickLinks = useMemo(
    () => [
      { label: "Home", to: "/" },
      { label: "Debugger", to: "/debug" },
      {
        label: "Docs",
        to: "https://github.com/stellar/scaffold-stellar",
        external: true,
      },
    ],
    [],
  );

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {quickLinks.map((link) =>
        link.external ? (
          <a
            key={link.label}
            href={link.to}
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {link.label}
          </a>
        ) : (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
              )
            }
          >
            {link.label}
          </NavLink>
        ),
      )}
    </nav>
  );
});
PageLinks.displayName = "PageLinks";

const AppHeader = () => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-6">
          <LogoMark />
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="rounded-full bg-card/70 px-5">
                  Overview
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <OverviewGrid />
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="rounded-full bg-card/70 px-5">
                  Economy
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <EconomyList />
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="rounded-full bg-card/70 px-5">
                  Contracts
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ContractLinks />
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-4">
          <PageLinks />
          <Button
            variant="ghost"
            className="hidden rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20 lg:inline-flex"
          >
            <PiSparkleDuotone className="mr-2 h-4 w-4" />
            Watch trailer
          </Button>
          <WalletMenu />
        </div>
      </div>
    </header>
  );
};

export default memo(AppHeader);
