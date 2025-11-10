"use client";

import { useCallback, useEffect, useState } from "react";

import { useWallet } from "@/hooks/useWallet";
import { fetchBalance, type Balance } from "@/lib/wallet";

const formatter = new Intl.NumberFormat();

const hasFunds = (balances: Balance[]) =>
  balances.some(({ balance }) =>
    Number.isFinite(Number(balance)) ? Number(balance) > 0 : false,
  );

type WalletBalanceState = {
  balances: Balance[];
  xlm: string;
  isFunded: boolean;
  isLoading: boolean;
  error: Error | null;
};

export const useWalletBalance = () => {
  const { address } = useWallet();
  const [state, setState] = useState<WalletBalanceState>({
    balances: [],
    xlm: "-",
    isFunded: false,
    isLoading: false,
    error: null,
  });

  const updateBalance = useCallback(async () => {
    if (!address) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const balances = await fetchBalance(address);
      const native = balances.find(({ asset_type }) => asset_type === "native");
      const isFunded = hasFunds(balances);

      setState({
        balances,
        isFunded,
        isLoading: false,
        xlm: native?.balance ? formatter.format(Number(native.balance)) : "-",
        error: null,
      });
    } catch (error) {
      if (error instanceof Error && error.message.match(/not found/i)) {
        setState({
          balances: [],
          isFunded: false,
          isLoading: false,
          xlm: "-",
          error: new Error("Error fetching balance. Is your wallet funded?"),
        });
        return;
      }

      console.error(error);
      setState({
        balances: [],
        isFunded: false,
        isLoading: false,
        xlm: "-",
        error: new Error("Unknown error fetching balance."),
      });
    }
  }, [address]);

  useEffect(() => {
    void updateBalance();
  }, [updateBalance]);

  return {
    ...state,
    updateBalance,
  };
};
