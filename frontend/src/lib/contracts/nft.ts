"use client";

import {
  Client as TeaNftClient,
  type TeaMetadata,
  networks as teaNftNetworks,
} from "tea-nft-client";
import type { SignTransaction as SorobanSignTransaction } from "@stellar/stellar-sdk/contract";

import { networkPassphrase, rpcUrl, stellarNetwork } from "@/lib/stellarConfig";

type WalletSigner = SorobanSignTransaction;
export type TeaNftWalletSigner = WalletSigner;

const NETWORK_DEFAULT_CONTRACT: Partial<Record<typeof stellarNetwork, string>> = {
  TESTNET: teaNftNetworks.testnet.contractId,
};

const resolveContractId = () => {
  const fromEnv = process.env.NEXT_PUBLIC_TEA_NFT_CONTRACT_ID;
  const fallback = NETWORK_DEFAULT_CONTRACT[stellarNetwork];

  const contractId = fromEnv ?? fallback;

  if (!contractId) {
    throw new Error(
      `Tea NFT contract id is not configured for ${stellarNetwork}. Set NEXT_PUBLIC_TEA_NFT_CONTRACT_ID.`,
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
      throw new Error(response.error);
    }

    return response;
  };
};

type CreateClientParams = {
  publicKey?: string;
  signer?: WalletSigner;
};

export const createTeaNftClient = ({ publicKey, signer }: CreateClientParams = {}) => {
  const contractId = resolveContractId();

  return new TeaNftClient({
    contractId,
    networkPassphrase,
    rpcUrl,
    allowHttp: rpcUrl.startsWith("http://"),
    publicKey,
    signTransaction: signer && publicKey ? adaptWalletSigner(signer, publicKey) : undefined,
  });
};

export type OwnedTeaToken = {
  tokenId: number;
  metadata: TeaMetadata;
  tokenUri?: string;
};

export const fetchOwnedTeaTokens = async (owner: string): Promise<OwnedTeaToken[]> => {
  if (!owner) return [];

  const client = createTeaNftClient();

  const balanceTx = await client.balance({ account: owner });
  const rawBalance = balanceTx.result ?? 0;
  const balance = Number(rawBalance);

  if (!Number.isFinite(balance) || balance <= 0) {
    return [];
  }

  const tokens = await Promise.all(
    Array.from({ length: balance }).map(async (_, index) => {
      const tokenIdTx = await client.get_owner_token_id({ owner, index });
      const tokenId = Number(tokenIdTx.result ?? 0);

      const [metadataTx, tokenUriTx] = await Promise.all([
        client.get_metadata({ token_id: tokenId }),
        client.token_uri({ token_id: tokenId }),
      ]);

      return {
        tokenId,
        metadata: metadataTx.result,
        tokenUri: tokenUriTx.result ?? undefined,
      } satisfies OwnedTeaToken;
    }),
  );

  return tokens.sort((a, b) => a.tokenId - b.tokenId);
};

export const fetchTeaMetadata = async (tokenId: number): Promise<TeaMetadata | null> => {
  if (!Number.isFinite(tokenId)) return null;

  const client = createTeaNftClient();
  const metadataTx = await client.get_metadata({ token_id: tokenId });

  return metadataTx.result ?? null;
};


