import {
  Client as BallsTokenClient,
  networks as ballsNetworks,
} from "balls-token-client";
import {
  Client as StarsTokenClient,
  networks as starsNetworks,
} from "stars-token-client";
import {
  Client as TeaGameClient,
  networks as teaGameNetworks,
} from "tea-game-client";
import {
  Client as TeaNftClient,
  networks as teaNftNetworks,
} from "tea-nft-client";

import { network, rpcUrl } from "./util";

type ContractNetworkConfig = {
  contractId: string;
  networkPassphrase: string;
};

type ClientCtor<TClient> = new ({
  contractId,
  networkPassphrase,
  rpcUrl,
}: {
  contractId: string;
  networkPassphrase: string;
  rpcUrl: string;
}) => TClient;

const resolveNetworkConfig = (
  contracts: Readonly<Record<string, ContractNetworkConfig>>,
) => {
  const config = contracts[network.id as keyof typeof contracts];

  if (!config) {
    throw new Error(
      `Contract bindings are not configured for network "${network.id}".`,
    );
  }

  return config;
};

const createClientFactory = <TClient>(
  Client: ClientCtor<TClient>,
  contracts: Readonly<Record<string, ContractNetworkConfig>>,
) => {
  let cached: TClient | null = null;

  return () => {
    if (!cached) {
      const { contractId, networkPassphrase } = resolveNetworkConfig(contracts);

      cached = new Client({
        contractId,
        networkPassphrase,
        rpcUrl,
      });
    }

    return cached;
  };
};

export const getBallsClient = createClientFactory(
  BallsTokenClient,
  ballsNetworks,
);

export const getStarsClient = createClientFactory(
  StarsTokenClient,
  starsNetworks,
);

export const getTeaNftClient = createClientFactory(
  TeaNftClient,
  teaNftNetworks,
);

export const getTeaGameClient = createClientFactory(
  TeaGameClient,
  teaGameNetworks,
);

export const contractIds = {
  balls: resolveNetworkConfig(ballsNetworks).contractId,
  stars: resolveNetworkConfig(starsNetworks).contractId,
  teaNft: resolveNetworkConfig(teaNftNetworks).contractId,
  teaGame: resolveNetworkConfig(teaGameNetworks).contractId,
} as const;
