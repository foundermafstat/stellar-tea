import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

const formatAddress = (value?: string) => {
  if (!value) return "-";
  return `${value.slice(0, 5)}…${value.slice(-4)}`;
};

const WalletMenu = () => {
  const { addNotification } = useNotification();
  const { address, isPending } = useWallet();
  const safeAddress = typeof address === "string" ? address : "";
  const { xlm, isLoading, updateBalance } = useWalletBalance();
  const [isOpen, setIsOpen] = useState(false);

  const statusLabel = useMemo(() => {
    if (isPending) return "Connecting...";
    if (!safeAddress) return "Connect with wallet";
    if (isLoading) return "Fetching balance...";
    return `${xlm} XLM`;
  }, [safeAddress, isLoading, isPending, xlm]);

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
    if (!safeAddress) return;
    void navigator.clipboard
      .writeText(safeAddress)
      .then(() => {
        addNotification("Address copied to clipboard", "success");
      })
      .catch(() => {
        addNotification("Failed to copy address", "error");
      });
  }, [safeAddress, addNotification]);

  if (!safeAddress) {
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="group flex items-center gap-3 rounded-full border border-border/60 bg-card/70 px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition-all hover:border-primary/60 hover:bg-primary/10 hover:text-primary"
        >
          <Avatar className="h-9 w-9 border border-primary/30 bg-primary/15">
            <AvatarFallback className="bg-primary/20 text-primary">
              {safeAddress.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="flex flex-col items-start leading-none">
            <span>{formatAddress(safeAddress)}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {statusLabel}
            </span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        sideOffset={12}
        className="w-72"
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-primary/30 bg-primary/15">
            <AvatarFallback className="bg-primary/20 text-primary">
              {safeAddress.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">
              {formatAddress(safeAddress)}
            </span>
            <span className="text-xs text-muted-foreground">{statusLabel}</span>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-2xl bg-primary/10 text-sm font-semibold text-primary hover:bg-primary/15"
            onClick={() => {
              copyAddress();
            }}
          >
            <PiCopySimpleDuotone className="h-4 w-4" />
            Copy address
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-2xl bg-secondary/10 text-sm font-semibold text-secondary hover:bg-secondary/15"
            onClick={() => {
              void updateBalance();
            }}
          >
            <PiWalletDuotone className="h-4 w-4" />
            Refresh balance
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-2xl bg-destructive/10 text-sm font-semibold text-destructive hover:bg-destructive/20"
            onClick={() => {
              handleDisconnect();
              setIsOpen(false);
            }}
          >
            <PiSignOutDuotone className="h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default WalletMenu;
