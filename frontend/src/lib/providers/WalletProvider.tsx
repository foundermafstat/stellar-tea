"use client";

import {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import storage from "@/lib/storage";
import { wallet } from "@/lib/wallet";
import type { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";

export interface WalletContextType {
  address?: string;
  network?: string;
  networkPassphrase?: string;
  isPending: boolean;
  signTransaction?: StellarWalletsKit["signTransaction"];
}

const initialState = {
  address: undefined,
  network: undefined,
  networkPassphrase: undefined,
};

const POLL_INTERVAL = 1000;

export const WalletContext = createContext<WalletContextType>({
  isPending: true,
});

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] =
    useState<Omit<WalletContextType, "isPending">>(initialState);
  const [isPending, startTransition] = useTransition();
  const popupLock = useRef(false);

  const nullify = () => {
    updateState(initialState);
    storage.setItem("walletId", "");
    storage.setItem("walletAddress", "");
    storage.setItem("walletNetwork", "");
    storage.setItem("networkPassphrase", "");
  };

  const updateState = (newState: Omit<WalletContextType, "isPending">) => {
    setState((prev) => {
      if (
        prev.address !== newState.address ||
        prev.network !== newState.network ||
        prev.networkPassphrase !== newState.networkPassphrase
      ) {
        return newState;
      }
      return prev;
    });
  };

  const updateCurrentWalletState = async () => {
    if (typeof window === "undefined") return;

    const walletId = storage.getItem("walletId");
    const walletNetwork = storage.getItem("walletNetwork");
    const walletAddr = storage.getItem("walletAddress");
    const passphrase = storage.getItem("networkPassphrase");

    if (
      !state.address &&
      walletAddr !== null &&
      walletNetwork !== null &&
      passphrase !== null
    ) {
      updateState({
        address: walletAddr,
        network: walletNetwork,
        networkPassphrase: passphrase,
      });
    }

    if (!walletId) {
      nullify();
    } else {
      if (popupLock.current) return;
      try {
        popupLock.current = true;
        wallet.setWallet(walletId);
        if (walletId !== "freighter" && walletAddr !== null) return;
        const [a, n] = await Promise.all([
          wallet.getAddress(),
          wallet.getNetwork(),
        ]);

        if (!a.address) storage.setItem("walletId", "");
        if (
          a.address !== state.address ||
          n.network !== state.network ||
          n.networkPassphrase !== state.networkPassphrase
        ) {
          storage.setItem("walletAddress", a.address);
          updateState({ ...a, ...n });
        }
      } catch (error) {
        nullify();
        console.error(error);
      } finally {
        popupLock.current = false;
      }
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const pollWalletState = async () => {
      if (!isMounted) return;

      await updateCurrentWalletState();

      if (isMounted) {
        timer = setTimeout(() => {
          void pollWalletState();
        }, POLL_INTERVAL);
      }
    };

    startTransition(async () => {
      await updateCurrentWalletState();
      if (isMounted) {
        timer = setTimeout(() => {
          void pollWalletState();
        }, POLL_INTERVAL);
      }
    });

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const contextValue = useMemo(
    () => ({
      ...state,
      isPending,
      signTransaction: wallet.signTransaction,
    }),
    [state, isPending],
  );

  return <WalletContext value={contextValue}>{children}</WalletContext>;
};
