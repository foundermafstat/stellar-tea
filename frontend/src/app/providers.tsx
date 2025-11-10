"use client";

import { WalletProvider } from "@/lib/providers/WalletProvider";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return <WalletProvider>{children}</WalletProvider>;
};
