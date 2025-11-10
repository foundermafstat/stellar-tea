import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Button,
  Code,
  Heading,
  Input,
  Layout,
  Text,
} from "@stellar/design-system";
import type { AssembledTransaction } from "@stellar/stellar-sdk/contract";

import { useWallet } from "../../hooks/useWallet";
import { formatTokenAmount, parseAmountToI128 } from "../../util/tokenMath";
import {
  asSorobanResult,
  extractSorobanErrorMessage,
} from "../../util/soroban";
import { Box } from "../layout/Box";

type TokenContractClient = {
  metadata: () => Promise<
    AssembledTransaction<readonly [number, string, string]>
  >;
  balance: (args: { id: string }) => Promise<AssembledTransaction<bigint>>;
  transfer: (args: {
    from: string;
    to: string;
    amount: bigint;
  }) => Promise<AssembledTransaction<null>>;
};

type TokenMeta = {
  decimals: number;
  name: string;
  symbol: string;
};

type TokenContractInterfaceProps = {
  title: string;
  description: string;
  contractId: string;
  getClient: () => TokenContractClient;
  symbolFallback: string;
};

export const TokenContractInterface = ({
  title,
  description,
  contractId,
  getClient,
  symbolFallback,
}: TokenContractInterfaceProps) => {
  const { address, signTransaction } = useWallet();
  const client = useMemo(() => getClient(), [getClient]);

  const [metadata, setMetadata] = useState<TokenMeta | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);

  const [balanceAddress, setBalanceAddress] = useState("");
  const [balanceValue, setBalanceValue] = useState<string>("-");
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferStatus, setTransferStatus] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  const decimals = metadata?.decimals ?? 7;
  const symbol = metadata?.symbol ?? symbolFallback;

  const loadMetadata = useCallback(async () => {
    try {
      const tx = await client.metadata();
      const [rawDecimals, name, rawSymbol] = tx.result;
      setMetadata({
        decimals: Number(rawDecimals),
        name,
        symbol: rawSymbol || symbolFallback,
      });
      setMetadataError(null);
    } catch (err) {
      setMetadataError(
        extractSorobanErrorMessage(err, "Failed to fetch metadata."),
      );
    }
  }, [client, symbolFallback]);

  const fetchBalance = useCallback(async () => {
    const target = balanceAddress.trim();
    if (!target) {
      setBalanceError("Provide an account address.");
      return;
    }

    setIsBalanceLoading(true);
    setBalanceError(null);
    try {
      const tx = await client.balance({ id: target });
      setBalanceValue(formatTokenAmount(tx.result, decimals));
    } catch (err) {
      setBalanceError(
        extractSorobanErrorMessage(err, "Failed to fetch balance."),
      );
    } finally {
      setIsBalanceLoading(false);
    }
  }, [balanceAddress, client, decimals]);

  const handleBalanceSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void fetchBalance();
    },
    [fetchBalance],
  );

  useEffect(() => {
    void loadMetadata();
  }, [loadMetadata]);

  useEffect(() => {
    if (address) {
      setBalanceAddress(address);
    }
  }, [address]);

  const handleTransfer = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!address) {
        setTransferError("Connect your wallet to sign the transaction.");
        return;
      }
      if (!signTransaction) {
        setTransferError("This wallet cannot sign transactions.");
        return;
      }

      const to = transferTo.trim();
      if (!to) {
        setTransferError("Provide a recipient address.");
        return;
      }

      try {
        const amount = parseAmountToI128(transferAmount, decimals);
        setIsTransferring(true);
        setTransferError(null);
        setTransferStatus(null);

        const tx = await client.transfer({
          from: address,
          to,
          amount,
        });

        const sentTx = await tx.signAndSend({ signTransaction });
        const result = asSorobanResult(sentTx.result);
        if (result?.isErr()) {
          const err = result.unwrapErr();
          setTransferError(
            extractSorobanErrorMessage(
              err,
              "The contract returned an error during transfer.",
            ),
          );
          return;
        }

        const hash = sentTx.sendTransactionResponse?.hash;
        setTransferStatus(
          hash ? `Transaction sent. hash: ${hash}` : "Transaction sent.",
        );
        setTransferAmount("");
        if (address === balanceAddress.trim()) {
          await fetchBalance();
        }
      } catch (err) {
        setTransferError(
          extractSorobanErrorMessage(err, "Failed to submit transfer."),
        );
      } finally {
        setIsTransferring(false);
      }
    },
    [
      address,
      balanceAddress,
      client,
      decimals,
      fetchBalance,
      signTransaction,
      transferAmount,
      transferTo,
    ],
  );

  return (
    <Layout.Content>
      <Layout.Inset>
        <Box gap="xl">
          <section>
            <Heading as="h1" size="xl">
              {title}
            </Heading>
            <Text as="p" size="md">
              {description}
            </Text>
            <Text as="p" size="sm">
              Contract: <Code size="sm">{contractId}</Code>
            </Text>
          </section>

          <section>
            <Heading as="h2" size="lg">
              Token details
            </Heading>
            {metadataError ? (
              <Text as="p" size="sm" variant="error">
                {metadataError}
              </Text>
            ) : (
              <Box gap="xs">
                <Text as="p" size="md">
                  Name: {metadata?.name ?? "-"}
                </Text>
                <Text as="p" size="md">
                  Symbol: {symbol}
                </Text>
                <Text as="p" size="md">
                  Decimals: {decimals}
                </Text>
              </Box>
            )}
          </section>

          <section>
            <Heading as="h2" size="lg">
              Check balance
            </Heading>
            <form onSubmit={handleBalanceSubmit}>
              <Box gap="sm">
                <Input
                  label="Account address"
                  value={balanceAddress}
                  onChange={(event) => setBalanceAddress(event.target.value)}
                  placeholder="G..."
                />
                <Button type="submit" disabled={isBalanceLoading}>
                  {isBalanceLoading ? "Fetching..." : "Fetch balance"}
                </Button>
              </Box>
            </form>
            <Text as="p" size="md">
              Balance: {balanceValue} {symbol}
            </Text>
            {balanceError ? (
              <Text as="p" size="sm" variant="error">
                {balanceError}
              </Text>
            ) : null}
          </section>

          <section>
            <Heading as="h2" size="lg">
              Transfer tokens
            </Heading>
            <form
              onSubmit={(event) => {
                void handleTransfer(event);
              }}
            >
              <Box gap="sm">
                <Input
                  label="Recipient"
                  value={transferTo}
                  onChange={(event) => setTransferTo(event.target.value)}
                  placeholder="G..."
                />
                <Input
                  label={`Amount (${symbol})`}
                  value={transferAmount}
                  onChange={(event) => setTransferAmount(event.target.value)}
                  placeholder="0.0"
                />
                <Button type="submit" disabled={isTransferring}>
                  {isTransferring ? "Submitting..." : "Send"}
                </Button>
              </Box>
            </form>
            {transferError ? (
              <Text as="p" size="sm" variant="error">
                {transferError}
              </Text>
            ) : null}
            {transferStatus ? (
              <Text as="p" size="sm" variant="success">
                {transferStatus}
              </Text>
            ) : null}
          </section>
        </Box>
      </Layout.Inset>
    </Layout.Content>
  );
};

export default TokenContractInterface;
