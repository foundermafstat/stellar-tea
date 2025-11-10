"use client";

import { Client as SwapContractClient } from "swap-client";
import type { SignTransaction as SorobanSignTransaction } from "@stellar/stellar-sdk/contract";

import { networkPassphrase, rpcUrl } from "@/lib/stellarConfig";
import { extractSorobanErrorMessage } from "@/lib/util/soroban";

type WalletSigner = SorobanSignTransaction;

const resolveContractId = () => {
  const contractId = process.env.NEXT_PUBLIC_SWAP_CONTRACT_ID;
  if (!contractId) {
    throw new Error("NEXT_PUBLIC_SWAP_CONTRACT_ID is not set.");
  }
  return contractId;
};

const adaptSigner = (
  signer: Required<WalletSigner>,
  defaultAddress?: string,
): WalletSigner => {
  return async (xdr, opts) => {
    const response = await signer(xdr, {
      ...opts,
      address: opts?.address ?? defaultAddress,
      networkPassphrase: opts?.networkPassphrase ?? networkPassphrase,
    });

    if ("error" in response && response.error) {
      throw new Error(
        extractSorobanErrorMessage(response.error, "Wallet rejected the transaction."),
      );
    }

    return response;
  };
};

type CreateClientParams = {
  publicKey?: string;
  signer?: WalletSigner;
};

export const createSwapClient = ({ publicKey, signer }: CreateClientParams = {}) => {
  const contractId = resolveContractId();

  return new SwapContractClient({
    contractId,
    networkPassphrase,
    rpcUrl,
    allowHttp: rpcUrl.startsWith("http://"),
    publicKey,
    signTransaction: signer && publicKey ? adaptSigner(signer, publicKey) : undefined,
  });
};

