"use client";

import { Client as StarsTokenClient, networks as starsNetworks } from "stars-token-client";
import type { SignTransaction as SorobanSignTransaction } from "@stellar/stellar-sdk/contract";

import { networkPassphrase, rpcUrl, stellarNetwork } from "@/lib/stellarConfig";
import { extractSorobanErrorMessage } from "@/lib/util/soroban";

type WalletSigner = SorobanSignTransaction;
export type StarsWalletSigner = WalletSigner;

const NETWORK_DEFAULT_CONTRACT: Partial<Record<typeof stellarNetwork, string>> = {
  TESTNET: starsNetworks.testnet.contractId,
};

const resolveContractId = () => {
  const fromEnv = process.env.NEXT_PUBLIC_STARS_CONTRACT_ID;
  const fallback = NETWORK_DEFAULT_CONTRACT[stellarNetwork];

  const contractId = fromEnv ?? fallback;

  if (!contractId) {
    throw new Error(
      `STARS contract id is not configured for ${stellarNetwork}. Set NEXT_PUBLIC_STARS_CONTRACT_ID.`,
    );
  }

  return contractId;
};

const adaptWalletSigner = (
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
      const error = new Error(
        extractSorobanErrorMessage(response.error, "Wallet rejected the transaction."),
      );
      throw error;
    }

    return response;
  };
};

type CreateClientParams = {
  publicKey?: string;
  signer?: WalletSigner;
};

export const createStarsClient = ({ publicKey, signer }: CreateClientParams = {}) => {
  const contractId = resolveContractId();

  return new StarsTokenClient({
    contractId,
    networkPassphrase,
    rpcUrl,
    allowHttp: rpcUrl.startsWith("http://"),
    publicKey,
    signTransaction: signer && publicKey ? adaptWalletSigner(signer, publicKey) : undefined,
  });
};

export const fetchStarsMetadata = async () => {
  const client = createStarsClient();
  const metadataTx = await client.metadata();
  const [decimals, name, symbol] = metadataTx.result ?? [7, "Stars", "STARS"];

  return {
    decimals: Number(decimals),
    name,
    symbol,
  };
};

