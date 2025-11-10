"use client";

import storage from "@/lib/storage";
import { networkPassphrase } from "@/lib/stellarConfig";
import {
  ISupportedWallet,
  StellarWalletsKit,
  WalletNetwork,
  sep43Modules,
} from "@creit.tech/stellar-wallets-kit";

type KitInstance = StellarWalletsKit;

let kit: KitInstance | null = null;

const ensureKit = () => {
  if (kit) return kit;
  if (typeof window === "undefined") {
    throw new Error("StellarWalletsKit is only available in the browser");
  }
  kit = new StellarWalletsKit({
    network: networkPassphrase as WalletNetwork,
    modules: sep43Modules(),
  });
  return kit;
};

const NETWORK_HOSTS: Record<string, string> = {
  LOCAL: "http://localhost:8000",
  FUTURENET: "https://horizon-futurenet.stellar.org",
  TESTNET: "https://horizon-testnet.stellar.org",
  PUBLIC: "https://horizon.stellar.org",
};

export const connectWallet = async () => {
  const currentKit = ensureKit();
  await currentKit.openModal({
    modalTitle: "Connect to your wallet",
    onWalletSelected: (option: ISupportedWallet) => {
      const selectedId = option.id;
      currentKit.setWallet(selectedId);

      void currentKit.getAddress().then((address) => {
        if (address.address) {
          storage.setItem("walletId", selectedId);
          storage.setItem("walletAddress", address.address);
        } else {
          storage.setItem("walletId", "");
          storage.setItem("walletAddress", "");
        }
      });

      if (selectedId === "freighter" || selectedId === "hot-wallet") {
        void currentKit.getNetwork().then((network) => {
          if (network.network && network.networkPassphrase) {
            storage.setItem("walletNetwork", network.network);
            storage.setItem("networkPassphrase", network.networkPassphrase);
          } else {
            storage.setItem("walletNetwork", "");
            storage.setItem("networkPassphrase", "");
          }
        });
      }
    },
  });
};

export const disconnectWallet = async () => {
  try {
    await ensureKit().disconnect();
  } finally {
    storage.removeItem("walletId");
  }
};

export type Balance = {
  asset_type: string;
  balance: string;
  [key: string]: unknown;
};

type BalanceSuccessResponse = { balances: Balance[] };
type BalanceErrorResponse = { error: string };

const resolveNetwork = (network?: string) => {
  if (!network) return undefined;
  const normalized = network.toUpperCase();
  return NETWORK_HOSTS[normalized] ? normalized : undefined;
};

export const fetchBalance = async (address: string, network?: string) => {
  const params = new URLSearchParams({ address });
  const normalizedNetwork = resolveNetwork(network);
  if (normalizedNetwork) {
    params.set("network", normalizedNetwork);
  }

  const response = await fetch(`/api/wallet/balance?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  const payload = (await response.json()) as
    | BalanceSuccessResponse
    | BalanceErrorResponse;

  if (!response.ok) {
    const message =
      "error" in payload && payload.error
        ? payload.error
        : `Failed to fetch balance (${response.status})`;
    throw new Error(message);
  }

  if (!("balances" in payload)) {
    throw new Error("Malformed balance response.");
  }

  return payload.balances;
};

export const wallet = {
  setWallet: (...args: Parameters<KitInstance["setWallet"]>) =>
    ensureKit().setWallet(...args),
  getAddress: (...args: Parameters<KitInstance["getAddress"]>) =>
    ensureKit().getAddress(...args),
  getNetwork: (...args: Parameters<KitInstance["getNetwork"]>) =>
    ensureKit().getNetwork(...args),
  signTransaction: (...args: Parameters<KitInstance["signTransaction"]>) =>
    ensureKit().signTransaction(...args),
};
