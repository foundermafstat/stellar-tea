"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { FiCopy, FiLogOut } from "react-icons/fi";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { connectWallet, disconnectWallet } from "@/lib/wallet";
import { useWallet } from "@/lib/hooks/useWallet";
import { useWalletBalance } from "@/lib/hooks/useWalletBalance";

const shortenAddress = (value: string, size = 4) => {
  if (value.length <= size * 2) return value;
  return `${value.slice(0, size)}…${value.slice(-size)}`;
};

const navigationItems = [
  {
    label: "Marketplace",
    description: "Trade Stellar Tea collectibles and ingredients.",
    href: "/marketplace",
  },
  {
    label: "Brewing Lab",
    description: "Craft unique blends using your collected essences.",
    href: "/lab",
  },
  {
    label: "Lore",
    description: "Discover the chronicles behind Stellar Tea.",
    href: "/lore",
  },
];

export const Header = () => {
  const { address, isPending } = useWallet();
  const { xlm, isLoading: isBalanceLoading } = useWalletBalance();
  const [connecting, startConnecting] = useTransition();
  const [disconnecting, setDisconnecting] = useState(false);

  const isBusy = connecting || isPending;

  const initials = useMemo(
    () => (address ? address.slice(0, 2).toUpperCase() : "ST"),
    [address],
  );

  const handleConnect = () => {
    startConnecting(async () => {
      try {
        await connectWallet();
      } catch (error) {
        console.error(error);
        toast({
          title: "Wallet connection failed",
          description:
            "We could not connect to your wallet. Try again in a moment.",
        });
      }
    });
  };

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true);
      await disconnectWallet();
      toast({
        title: "Wallet disconnected",
        description: "You can reconnect at any time.",
        dismissible: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Unable to disconnect",
        description: "We could not disconnect the wallet. Please retry.",
      });
    } finally {
      setDisconnecting(false);
    }
  };

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      toast({
        title: "Address copied",
        description: "Wallet address saved to clipboard.",
        dismissible: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Copy failed",
        description: "We could not copy the address. Copy it manually instead.",
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/design/svg/stellar-tea-icon.svg"
            alt="Stellar Tea"
            width={32}
            height={32}
            className="h-8 w-8"
            priority
          />
          <span className="text-lg font-semibold tracking-tight">
            Stellar Tea
          </span>
        </Link>

        <nav className="ml-auto hidden flex-1 items-center justify-center md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Explore</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] md:grid-cols-2">
                    {navigationItems.map((item) => (
                      <li key={item.label}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={item.href}
                            className="block select-none rounded-md border border-transparent p-3 no-underline outline-none transition hover:border-primary/40 hover:bg-accent"
                          >
                            <div className="text-sm font-medium leading-none">
                              {item.label}
                            </div>
                            <p className="mt-1 text-sm leading-snug text-muted-foreground">
                              {item.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/about"
                    className="inline-flex h-10 items-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    About
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/docs"
                    className="inline-flex h-10 items-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Docs
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-3 md:flex-none">
          {!address ? (
            <Button onClick={handleConnect} disabled={isBusy}>
              {isBusy ? "Connecting..." : "Connect Wallet"}
            </Button>
          ) : (
            <TooltipProvider>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block truncate max-w-[120px]">
                      {shortenAddress(address)}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64"
                  align="end"
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                    Wallet
                  </DropdownMenuLabel>
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium text-foreground">
                      Connected account
                    </p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={handleCopy}
                          className="mt-1 flex w-full items-center gap-2 truncate rounded-md border border-transparent px-2 py-1 text-left text-xs text-muted-foreground transition hover:border-primary/50 hover:bg-accent"
                        >
                          <FiCopy aria-hidden className="h-4 w-4 shrink-0" />
                          <span className="truncate">{address}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        Copy address
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Balance</span>
                      <span className="font-semibold">
                        {isBalanceLoading ? "..." : `${xlm} XLM`}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault();
                      void handleDisconnect();
                    }}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                    disabled={disconnecting}
                  >
                    <FiLogOut className="h-4 w-4" aria-hidden />
                    {disconnecting ? "Disconnecting..." : "Disconnect"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TooltipProvider>
          )}
        </div>
      </div>
      <Separator />
    </header>
  );
};
