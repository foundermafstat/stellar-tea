import { useCallback, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Button,
  Code,
  Heading,
  Input,
  Layout,
  Text,
} from "@stellar/design-system";
import type { TeaMetadata } from "tea-nft-client";

import { Box } from "../../components/layout/Box";
import { contractIds, getTeaNftClient } from "../../contracts/clients";
import { extractSorobanErrorMessage } from "../../util/soroban";

const formatJson = (value: unknown): string => {
  const result = JSON.stringify(
    value,
    (_key, innerValue: unknown) =>
      typeof innerValue === "bigint" ? innerValue.toString() : innerValue,
    2,
  );

  return typeof result === "string" ? result : "";
};

const TeaNftPage = () => {
  const client = useMemo(() => getTeaNftClient(), []);

  const [metadataId, setMetadataId] = useState("");
  const [metadata, setMetadata] = useState<TeaMetadata | null>(null);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);

  const [ownerId, setOwnerId] = useState("");
  const [owner, setOwner] = useState<string>("-");
  const [ownerError, setOwnerError] = useState<string | null>(null);
  const [isOwnerLoading, setIsOwnerLoading] = useState(false);

  const fetchMetadata = useCallback(async () => {
    const id = metadataId.trim();
    if (!id) {
      setMetadataError("Provide a token identifier.");
      return;
    }

    let parsedId: bigint;
    try {
      parsedId = BigInt(id);
    } catch {
      setMetadataError("ID must be an integer.");
      return;
    }

    setIsMetadataLoading(true);
    setMetadataError(null);
    try {
      const tx = await client.get_metadata({ token_id: parsedId });
      setMetadata(tx.result);
    } catch (err) {
      setMetadataError(
        extractSorobanErrorMessage(err, "Failed to fetch metadata."),
      );
      setMetadata(null);
    } finally {
      setIsMetadataLoading(false);
    }
  }, [client, metadataId]);

  const fetchOwner = useCallback(async () => {
    const id = ownerId.trim();
    if (!id) {
      setOwnerError("Provide a token identifier.");
      return;
    }

    let parsedId: number;
    try {
      const value = BigInt(id);
      if (value > BigInt(2 ** 32 - 1) || value < BigInt(0)) {
        throw new Error("ID is out of the u32 range.");
      }
      parsedId = Number(value);
    } catch (err) {
      setOwnerError(
        extractSorobanErrorMessage(err, "ID must be between 0 and 2^32-1."),
      );
      return;
    }

    setIsOwnerLoading(true);
    setOwnerError(null);
    try {
      const tx = await client.owner_of({ token_id: parsedId });
      setOwner(tx.result);
    } catch (err) {
      setOwnerError(
        extractSorobanErrorMessage(err, "Failed to fetch the token owner."),
      );
      setOwner("-");
    } finally {
      setIsOwnerLoading(false);
    }
  }, [client, ownerId]);

  const handleMetadataSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void fetchMetadata();
    },
    [fetchMetadata],
  );

  const handleOwnerSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void fetchOwner();
    },
    [fetchOwner],
  );

  return (
    <Layout.Content>
      <Layout.Inset>
        <Box gap="xl">
          <section>
            <Heading as="h1" size="xl">
              Tea NFT
            </Heading>
            <Text as="p" size="md">
              Browse metadata and owners for the Stellar Tea NFT collection.
            </Text>
            <Text as="p" size="sm">
              Contract: <Code size="sm">{contractIds.teaNft}</Code>
            </Text>
          </section>

          <section>
            <Heading as="h2" size="lg">
              Token metadata
            </Heading>
            <form onSubmit={handleMetadataSubmit}>
              <Box gap="sm">
                <Input
                  label="Token ID (u64)"
                  value={metadataId}
                  onChange={(event) => setMetadataId(event.target.value)}
                  placeholder="Example: 1"
                />
                <Button type="submit" disabled={isMetadataLoading}>
                  {isMetadataLoading ? "Loading..." : "Fetch metadata"}
                </Button>
              </Box>
            </form>
            {metadataError ? (
              <Text as="p" size="sm" variant="error">
                {metadataError}
              </Text>
            ) : null}
            {metadata ? (
              <pre>{formatJson(metadata)}</pre>
            ) : (
              <Text as="p" size="sm">
                Data will appear after you request it.
              </Text>
            )}
          </section>

          <section>
            <Heading as="h2" size="lg">
              Token owner
            </Heading>
            <form onSubmit={handleOwnerSubmit}>
              <Box gap="sm">
                <Input
                  label="Token ID (u32)"
                  value={ownerId}
                  onChange={(event) => setOwnerId(event.target.value)}
                  placeholder="Example: 1"
                />
                <Button type="submit" disabled={isOwnerLoading}>
                  {isOwnerLoading ? "Loading..." : "Fetch owner"}
                </Button>
              </Box>
            </form>
            {ownerError ? (
              <Text as="p" size="sm" variant="error">
                {ownerError}
              </Text>
            ) : (
              <Text as="p" size="md">
                Owner: <Code size="sm">{owner}</Code>
              </Text>
            )}
          </section>
        </Box>
      </Layout.Inset>
    </Layout.Content>
  );
};

export default TeaNftPage;
