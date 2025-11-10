"use client";

import { GameNotificationBridge } from "@/lib/game/notifications";
import { WalletProvider } from "@/lib/providers/WalletProvider";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <WalletProvider>
      {children}
      <GameNotificationBridge />
    </WalletProvider>
  );
};
