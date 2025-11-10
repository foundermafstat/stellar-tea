import { useCallback, useMemo } from "react";
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
import { useWallet } from "@/hooks/useWallet";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { connectWallet, disconnectWallet } from "@/util/wallet";
import { cn } from "@/lib/utils";
import { useNotification } from "@/hooks/useNotification";
import {
  PiCopySimpleDuotone,
  PiLightningDuotone,
  PiSignOutDuotone,
  PiWalletDuotone,
} from "react-icons/pi";
import { BiLoaderAlt } from "react-icons/bi";

const formatAddress = (address: string) =>
  `${address.slice(0, 5)}…${address.slice(-4)}`;

const WalletMenu = () => {
  const { addNotification } = useNotification();
  const { address, isPending } = useWallet();
  const { xlm, isLoading, updateBalance } = useWalletBalance();

  const statusLabel = useMemo(() => {
    if (isPending) return "Connecting...";
    if (!address) return "Connect with wallet";
    if (isLoading) return "Fetching balance...";
    return `${xlm} XLM`;
  }, [address, isLoading, isPending, xlm]);

  const handleConnect = useCallback(() => {
    if (isPending) return;
    void connectWallet();
  }, [isPending]);

  const handleDisconnect = useCallback(() => {
    void disconnectWallet().then(() => {
      addNotification("Wallet disconnected", "warning");
    });
  }, [addNotification]);

  const copyAddress = useCallback(() => {
    if (!address) return;
    void navigator.clipboard
      .writeText(address)
      .then(() => {
        addNotification("Address copied to clipboard", "success");
      })
      .catch(() => {
        addNotification("Failed to copy address", "error");
      });
  }, [address, addNotification]);

  if (!address) {
    return (
      <Button
        size="lg"
        onClick={handleConnect}
        disabled={isPending}
        className={cn(
          "relative overflow-hidden rounded-full px-6 py-5 text-base font-semibold text-background shadow-confection transition-all",
          "bg-gradient-to-br from-primary via-secondary to-accent hover:translate-y-[-2px] hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2",
        )}
      >
        <span className="relative z-10 inline-flex items-center gap-2">
          {isPending ? (
            <BiLoaderAlt className="h-5 w-5 animate-spin" />
          ) : (
            <PiLightningDuotone className="h-5 w-5" />
          )}
          Connect wallet
        </span>
        <span
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/20"
          aria-hidden
        />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group flex items-center gap-3 rounded-full border border-border/60 bg-card/70 px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
        >
          <Avatar className="h-9 w-9 border border-primary/30 bg-primary/15">
            <AvatarFallback className="bg-primary/20 text-primary">
              {address.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="flex flex-col items-start leading-none">
            <span>{formatAddress(address)}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {statusLabel}
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 rounded-3xl border-border/60 bg-card/90 p-2">
        <DropdownMenuLabel className="rounded-2xl bg-muted/40 px-3 py-2 text-[13px] font-medium text-muted-foreground">
          Connected to Stellar
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/40" />
        <DropdownMenuItem
          className="rounded-2xl px-3 py-2"
          onSelect={() => {
            copyAddress();
          }}
        >
          <PiCopySimpleDuotone className="text-primary" />
          Copy address
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-2xl px-3 py-2"
          onSelect={() => {
            void updateBalance();
          }}
        >
          <PiWalletDuotone className="text-secondary" />
          Refresh balance
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border/40" />
        <DropdownMenuItem
          className="rounded-2xl px-3 py-2 text-destructive"
          onSelect={() => {
            handleDisconnect();
          }}
        >
          <PiSignOutDuotone />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletMenu;
