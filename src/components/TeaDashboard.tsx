import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Code, Heading, Text } from "@stellar/design-system";

import {
  contractIds,
  getBallsClient,
  getStarsClient,
  getTeaGameClient,
} from "../contracts/clients";
import { useWallet } from "../hooks/useWallet";
import { formatTokenAmount } from "../util/tokenMath";
import { asSorobanResult, extractSorobanErrorMessage } from "../util/soroban";
import { Box } from "./layout/Box";

type TokenMeta = {
  decimals: number;
  name: string;
  symbol: string;
};

type TokenBalances = {
  balls?: bigint;
  stars?: bigint;
};

type TokenMetadata = {
  balls?: TokenMeta;
  stars?: TokenMeta;
};

const formatShortHash = (hash?: string) => {
  if (!hash) return "-";
  return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
};

const parseMetadata = (payload: unknown, fallbackSymbol: string): TokenMeta => {
  if (
    !Array.isArray(payload) ||
    payload.length !== 3 ||
    typeof payload[0] !== "number" ||
    typeof payload[1] !== "string" ||
    typeof payload[2] !== "string"
  ) {
    throw new Error("Unexpected token metadata format.");
  }

  const decimals = payload[0];
  const name = payload[1];
  const symbol = payload[2];

  return {
    decimals,
    name,
    symbol: symbol || fallbackSymbol,
  };
};

const parseBalance = (payload: unknown): bigint => {
  if (typeof payload !== "bigint") {
    throw new Error("The contract returned an invalid balance value.");
  }
  return payload;
};

const hasResult = (value: unknown): value is { result: unknown } =>
  typeof value === "object" && value !== null && "result" in value;

export const TeaDashboard = () => {
  const { address, signTransaction } = useWallet();
  const [balances, setBalances] = useState<TokenBalances>({});
  const [metadata, setMetadata] = useState<TokenMetadata>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const isWalletReady = Boolean(address);

  const loadTokenMetadata = useCallback(async () => {
    const ballsClient = getBallsClient();
    const starsClient = getStarsClient();

    const rawBallsMeta: unknown = await ballsClient.metadata();
    const rawStarsMeta: unknown = await starsClient.metadata();

    if (!hasResult(rawBallsMeta) || !hasResult(rawStarsMeta)) {
      throw new Error("Contract metadata came back in an invalid format.");
    }

    const ballsMetaPayload = rawBallsMeta.result;
    const starsMetaPayload = rawStarsMeta.result;

    const ballsMeta = parseMetadata(ballsMetaPayload, "BALLS");
    const starsMeta = parseMetadata(starsMetaPayload, "STARS");

    setMetadata({
      balls: ballsMeta,
      stars: starsMeta,
    });
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    setError(null);
    try {
      const ballsClient = getBallsClient();
      const starsClient = getStarsClient();

      const rawBallsBalance: unknown = await ballsClient.balance({
        id: address,
      });
      const rawStarsBalance: unknown = await starsClient.balance({
        id: address,
      });

      if (!hasResult(rawBallsBalance) || !hasResult(rawStarsBalance)) {
        throw new Error("The contract returned an invalid balance response.");
      }

      const ballsPayload = rawBallsBalance.result;
      const starsPayload = rawStarsBalance.result;

      setBalances({
        balls: parseBalance(ballsPayload),
        stars: parseBalance(starsPayload),
      });
    } catch (err) {
      setError(extractSorobanErrorMessage(err, "Failed to fetch balances."));
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void loadTokenMetadata();
  }, [loadTokenMetadata]);

  useEffect(() => {
    if (!address) {
      setBalances({});
      return;
    }

    void refreshBalances();
  }, [address, refreshBalances]);

  const handleClaimDaily = useCallback(async () => {
    if (!address) {
      setTxError("Connect your wallet before invoking the contract.");
      return;
    }

    if (!signTransaction) {
      setTxError("This wallet does not support signing transactions.");
      return;
    }

    setTxError(null);
    setTxHash(null);
    try {
      const client = getTeaGameClient();
      const tx = await client.claim_daily({ player: address });
      const rawSentTx: unknown = await tx.signAndSend({
        signTransaction,
      });

      if (!hasResult(rawSentTx)) {
        throw new Error("Failed to process the contract response.");
      }

      const typedTx = rawSentTx as {
        result: unknown;
        sendTransactionResponse?: { hash?: string };
      };

      const contractResult = asSorobanResult(typedTx.result);

      if (contractResult?.isErr()) {
        const err = contractResult.unwrapErr();
        setTxError(
          extractSorobanErrorMessage(
            err,
            "The contract returned an error during claim_daily.",
          ),
        );
        return;
      }

      const txHash = typedTx.sendTransactionResponse?.hash
        ? String(typedTx.sendTransactionResponse.hash)
        : null;

      setTxHash(txHash);
      await refreshBalances();
    } catch (err) {
      setTxError(
        extractSorobanErrorMessage(err, "Failed to execute claim_daily."),
      );
    }
  }, [address, refreshBalances, signTransaction]);

  const cards = useMemo(
    () => [
      {
        label: metadata.balls?.name ?? "BALLS",
        contract: contractIds.balls,
        value: formatTokenAmount(balances.balls, metadata.balls?.decimals),
        symbol: metadata.balls?.symbol ?? "BALLS",
      },
      {
        label: metadata.stars?.name ?? "STARS",
        contract: contractIds.stars,
        value: formatTokenAmount(balances.stars, metadata.stars?.decimals),
        symbol: metadata.stars?.symbol ?? "STARS",
      },
    ],
    [balances, metadata],
  );

  return (
    <Box gap="xl">
      <section>
        <Heading as="h2" size="sm">
          Contracts
        </Heading>
        <Box gap="xs">
          <Text as="p" size="sm">
            Game: <Code size="sm">{contractIds.teaGame}</Code>
          </Text>
          <Text as="p" size="sm">
            BALLS: <Code size="sm">{contractIds.balls}</Code>
          </Text>
          <Text as="p" size="sm">
            STARS: <Code size="sm">{contractIds.stars}</Code>
          </Text>
          <Text as="p" size="sm">
            Tea NFT: <Code size="sm">{contractIds.teaNft}</Code>
          </Text>
        </Box>
      </section>

      <section>
        <Heading as="h2" size="sm">
          Player balance
        </Heading>
        {!isWalletReady ? (
          <Text as="p" size="md">
            Connect your wallet to see token balances.
          </Text>
        ) : (
          <Box gap="md">
            {cards.map(({ label, contract, value, symbol }) => (
              <Box key={contract} gap="xs">
                <Text as="p" size="md">
                  {label} ({symbol})
                </Text>
                <Text as="p" size="lg">
                  {value} {symbol}
                </Text>
              </Box>
            ))}
            <Box direction="row" gap="sm" align="center">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => void refreshBalances()}
                disabled={isLoading}
              >
                {isLoading ? "Refreshing..." : "Refresh"}
              </Button>
            </Box>
            {error ? (
              <Text as="p" size="sm" variant="error">
                {error}
              </Text>
            ) : null}
          </Box>
        )}
      </section>

      <section>
        <Heading as="h2" size="sm">
          Daily rewards
        </Heading>
        <Text as="p" size="md">
          The <Code size="sm">claim_daily</Code> command grants the reward and
          resets the limits.
        </Text>
        <Button
          size="md"
          variant="primary"
          onClick={() => void handleClaimDaily()}
          disabled={!isWalletReady}
        >
          Claim daily reward
        </Button>
        {txHash ? (
          <Text as="p" size="sm">
            Transaction: <Code size="sm">{formatShortHash(txHash)}</Code>
          </Text>
        ) : null}
        {txError ? (
          <Text as="p" size="sm" variant="error">
            {txError}
          </Text>
        ) : null}
      </section>
    </Box>
  );
};
