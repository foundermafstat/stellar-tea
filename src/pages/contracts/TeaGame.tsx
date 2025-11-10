import { useCallback, useMemo, useState } from "react";
import {
  Button,
  Code,
  Heading,
  Input,
  Layout,
  Text,
} from "@stellar/design-system";

import { TeaDashboard } from "../../components/TeaDashboard";
import { Box } from "../../components/layout/Box";
import { contractIds, getTeaGameClient } from "../../contracts/clients";
import { useWallet } from "../../hooks/useWallet";
import { parseAmountToI128 } from "../../util/tokenMath";
import {
  asSorobanResult,
  extractSorobanErrorMessage,
} from "../../util/soroban";

const TOKEN_DECIMALS = 7;

const TeaGamePage = () => {
  const { address, signTransaction } = useWallet();
  const client = useMemo(() => getTeaGameClient(), []);

  const [burnBalls, setBurnBalls] = useState("");
  const [burnStars, setBurnStars] = useState("");
  const [burnError, setBurnError] = useState<string | null>(null);
  const [burnStatus, setBurnStatus] = useState<string | null>(null);
  const [isBurning, setIsBurning] = useState(false);

  const [eventId, setEventId] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinStatus, setJoinStatus] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const handleBurnTokens = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!address) {
        setBurnError("Connect your wallet before burning tokens.");
        return;
      }
      if (!signTransaction) {
        setBurnError("This wallet does not support signing transactions.");
        return;
      }

      const normalizedBalls = burnBalls.trim();
      const normalizedStars = burnStars.trim();

      if (!normalizedBalls && !normalizedStars) {
        setBurnError("Enter the BALLS or STARS amount to burn.");
        return;
      }

      let ballsAmount: bigint | null = null;
      let starsAmount: bigint | null = null;

      try {
        if (normalizedBalls) {
          ballsAmount = parseAmountToI128(normalizedBalls, TOKEN_DECIMALS);
        }
        if (normalizedStars) {
          starsAmount = parseAmountToI128(normalizedStars, TOKEN_DECIMALS);
        }
      } catch (err) {
        setBurnError(extractSorobanErrorMessage(err, "Invalid amount."));
        return;
      }

      setIsBurning(true);
      setBurnError(null);
      setBurnStatus(null);
      try {
        const tx = await client.burn_tokens({
          from: address,
          balls: ballsAmount,
          stars: starsAmount,
        });
        const sentTx = await tx.signAndSend({ signTransaction });
        const result = asSorobanResult(sentTx.result);
        if (result?.isErr()) {
          setBurnError(
            extractSorobanErrorMessage(
              result.unwrapErr(),
              "The contract returned an error while burning tokens.",
            ),
          );
          return;
        }
        const hash = sentTx.sendTransactionResponse?.hash;
        setBurnStatus(hash ? `Burn complete. hash: ${hash}` : "Burn complete.");
        setBurnBalls("");
        setBurnStars("");
      } catch (err) {
        setBurnError(
          extractSorobanErrorMessage(err, "Failed to execute burn."),
        );
      } finally {
        setIsBurning(false);
      }
    },
    [address, burnBalls, burnStars, client, signTransaction],
  );

  const handleJoinEvent = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!address) {
        setJoinError("Connect your wallet before joining the event.");
        return;
      }
      if (!signTransaction) {
        setJoinError("This wallet does not support signing transactions.");
        return;
      }

      const eventIdTrimmed = eventId.trim();
      if (!eventIdTrimmed) {
        setJoinError("Enter an event identifier.");
        return;
      }

      let eventNumber: number;
      try {
        const parsed = BigInt(eventIdTrimmed);
        if (parsed > BigInt(2 ** 32 - 1) || parsed < BigInt(0)) {
          throw new Error("ID is out of the u32 range.");
        }
        eventNumber = Number(parsed);
      } catch (err) {
        setJoinError(
          extractSorobanErrorMessage(err, "ID must be between 0 and 2^32-1."),
        );
        return;
      }

      let stake: bigint;
      try {
        stake = parseAmountToI128(stakeAmount, TOKEN_DECIMALS);
      } catch (err) {
        setJoinError(extractSorobanErrorMessage(err, "Invalid stake value."));
        return;
      }

      setIsJoining(true);
      setJoinError(null);
      setJoinStatus(null);

      try {
        const tx = await client.join_event({
          player: address,
          event_id: eventNumber,
          stake,
        });
        const sentTx = await tx.signAndSend({ signTransaction });
        const result = asSorobanResult(sentTx.result);
        if (result?.isErr()) {
          setJoinError(
            extractSorobanErrorMessage(
              result.unwrapErr(),
              "The contract returned an error while joining the event.",
            ),
          );
          return;
        }
        const hash = sentTx.sendTransactionResponse?.hash;
        setJoinStatus(hash ? `Request sent. hash: ${hash}` : "Request sent.");
        setEventId("");
        setStakeAmount("");
      } catch (err) {
        setJoinError(
          extractSorobanErrorMessage(err, "Failed to join the event."),
        );
      } finally {
        setIsJoining(false);
      }
    },
    [address, client, eventId, signTransaction, stakeAmount],
  );

  return (
    <>
      <TeaDashboard />
      <Layout.Content>
        <Layout.Inset>
          <Box gap="xl">
            <section>
              <Heading as="h1" size="xl">
                Tea Game
              </Heading>
              <Text as="p" size="md">
                Extra interactions for the game contract. Contract:{" "}
                <Code size="sm">{contractIds.teaGame}</Code>
              </Text>
            </section>

            <section>
              <Heading as="h2" size="lg">
                Burn tokens
              </Heading>
              <form
                onSubmit={(event) => {
                  void handleBurnTokens(event);
                }}
              >
                <Box gap="sm">
                  <Input
                    label="BALLS to burn"
                    placeholder="0.0"
                    value={burnBalls}
                    onChange={(event) => setBurnBalls(event.target.value)}
                  />
                  <Input
                    label="STARS to burn"
                    placeholder="0.0"
                    value={burnStars}
                    onChange={(event) => setBurnStars(event.target.value)}
                  />
                  <Button type="submit" disabled={isBurning}>
                    {isBurning ? "Submitting..." : "Burn tokens"}
                  </Button>
                </Box>
              </form>
              {burnError ? (
                <Text as="p" size="sm" variant="error">
                  {burnError}
                </Text>
              ) : null}
              {burnStatus ? (
                <Text as="p" size="sm" variant="success">
                  {burnStatus}
                </Text>
              ) : null}
            </section>

            <section>
              <Heading as="h2" size="lg">
                Join event
              </Heading>
              <form
                onSubmit={(event) => {
                  void handleJoinEvent(event);
                }}
              >
                <Box gap="sm">
                  <Input
                    label="Event ID"
                    placeholder="0"
                    value={eventId}
                    onChange={(event) => setEventId(event.target.value)}
                  />
                  <Input
                    label="Stake (BALLS)"
                    placeholder="0.0"
                    value={stakeAmount}
                    onChange={(event) => setStakeAmount(event.target.value)}
                  />
                  <Button type="submit" disabled={isJoining}>
                    {isJoining ? "Submitting..." : "Join"}
                  </Button>
                </Box>
              </form>
              {joinError ? (
                <Text as="p" size="sm" variant="error">
                  {joinError}
                </Text>
              ) : null}
              {joinStatus ? (
                <Text as="p" size="sm" variant="success">
                  {joinStatus}
                </Text>
              ) : null}
            </section>
          </Box>
        </Layout.Inset>
      </Layout.Content>
    </>
  );
};

export default TeaGamePage;
