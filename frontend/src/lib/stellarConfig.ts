import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";

const NETWORK_FALLBACK = "LOCAL" as const;
const RPC_FALLBACK = "http://localhost:8000/rpc";
const HORIZON_FALLBACK = "http://localhost:8000";

const networkFromEnv =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_STELLAR_NETWORK
    ? process.env.NEXT_PUBLIC_STELLAR_NETWORK.toUpperCase()
    : undefined;

const allowedNetworks = new Set([
  "PUBLIC",
  "FUTURENET",
  "TESTNET",
  "LOCAL",
  "STANDALONE",
]);

const resolvedNetwork =
  networkFromEnv && allowedNetworks.has(networkFromEnv)
    ? networkFromEnv
    : NETWORK_FALLBACK;

const passphraseFromEnv =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE) ||
  WalletNetwork.STANDALONE;

const rpcFromEnv =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_STELLAR_RPC_URL) ||
  RPC_FALLBACK;

const horizonFromEnv =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL) ||
  HORIZON_FALLBACK;

const normalizedNetwork =
  resolvedNetwork === "STANDALONE" ? NETWORK_FALLBACK : resolvedNetwork;

export const stellarNetwork = normalizedNetwork as
  | "PUBLIC"
  | "FUTURENET"
  | "TESTNET"
  | "LOCAL";

export const networkPassphrase = passphraseFromEnv as WalletNetwork;

export const rpcUrl = rpcFromEnv;
export const horizonUrl = horizonFromEnv;

const encodeForUrl = (value: string) =>
  value.replace(/\//g, "//").replace(/;/g, "/;");

export const labPrefix = () => {
  switch (stellarNetwork) {
    case "LOCAL":
      return `http://localhost:8000/lab/transaction-dashboard?$=network$id=custom&label=Custom&horizonUrl=${encodeForUrl(
        horizonUrl,
      )}&rpcUrl=${encodeForUrl(rpcUrl)}&passphrase=${encodeForUrl(networkPassphrase)};`;
    case "PUBLIC":
      return `https://lab.stellar.org/transaction-dashboard?$=network$id=mainnet&label=Mainnet&horizonUrl=${encodeForUrl(
        horizonUrl,
      )}&rpcUrl=${encodeForUrl(rpcUrl)}&passphrase=${encodeForUrl(networkPassphrase)};`;
    case "TESTNET":
      return `https://lab.stellar.org/transaction-dashboard?$=network$id=testnet&label=Testnet&horizonUrl=${encodeForUrl(
        horizonUrl,
      )}&rpcUrl=${encodeForUrl(rpcUrl)}&passphrase=${encodeForUrl(networkPassphrase)};`;
    case "FUTURENET":
      return `https://lab.stellar.org/transaction-dashboard?$=network$id=futurenet&label=Futurenet&horizonUrl=${encodeForUrl(
        horizonUrl,
      )}&rpcUrl=${encodeForUrl(rpcUrl)}&passphrase=${encodeForUrl(networkPassphrase)};`;
    default:
      return `https://lab.stellar.org/transaction-dashboard?$=network$id=testnet&label=Testnet&horizonUrl=${encodeForUrl(
        horizonUrl,
      )}&rpcUrl=${encodeForUrl(rpcUrl)}&passphrase=${encodeForUrl(networkPassphrase)};`;
  }
};

type NetworkDescriptor = {
  id: "mainnet" | "testnet" | "futurenet" | "custom";
  label: string;
  passphrase: WalletNetwork;
  rpcUrl: string;
  horizonUrl: string;
};

const networkIdFrom = (
  network: typeof stellarNetwork,
): NetworkDescriptor["id"] => {
  switch (network) {
    case "PUBLIC":
      return "mainnet";
    case "TESTNET":
      return "testnet";
    case "FUTURENET":
      return "futurenet";
    default:
      return "custom";
  }
};

export const network: NetworkDescriptor = {
  id: networkIdFrom(stellarNetwork),
  label: stellarNetwork.toLowerCase(),
  passphrase: networkPassphrase,
  rpcUrl,
  horizonUrl,
};

const EXPLORER_BASE: Partial<Record<typeof stellarNetwork, string>> = {
  PUBLIC: "https://stellar.expert/explorer/public",
  TESTNET: "https://stellar.expert/explorer/testnet",
  FUTURENET: "https://stellar.expert/explorer/futurenet",
};

const trimTrailingSlash = (value: string) =>
  value.endsWith("/") ? value.slice(0, -1) : value;

export const transactionExplorerUrl = (hash: string | undefined | null) => {
  if (!hash) return undefined;

  const base = EXPLORER_BASE[stellarNetwork];
  if (base) {
    return `${base}/tx/${hash}`;
  }

  const normalizedHorizon = trimTrailingSlash(horizonUrl);
  return `${normalizedHorizon}/transactions/${hash}`;
};
