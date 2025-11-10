import { stellarNetwork } from "@/lib/stellarConfig";

export const getFriendbotUrl = (address: string) => {
  switch (stellarNetwork) {
    case "LOCAL":
      return `/friendbot?addr=${address}`;
    case "FUTURENET":
      return `https://friendbot-futurenet.stellar.org/?addr=${address}`;
    case "TESTNET":
      return `https://friendbot.stellar.org/?addr=${address}`;
    default:
      throw new Error(
        `Unknown or unsupported NEXT_PUBLIC_STELLAR_NETWORK for friendbot: ${stellarNetwork}`,
      );
  }
};
