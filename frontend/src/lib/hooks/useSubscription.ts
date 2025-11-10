"use client";

import * as React from "react";
import { Server, Api } from "@stellar/stellar-sdk/rpc";
import { xdr } from "@stellar/stellar-sdk";

import { rpcUrl, stellarNetwork } from "@/lib/stellarConfig";

type PagingKey = `${string}:${string}`;

const paging: Record<
  PagingKey,
  { lastLedgerStart?: number; pagingToken?: string }
> = {};

const server = new Server(rpcUrl, { allowHttp: stellarNetwork === "LOCAL" });

export function useSubscription(
  contractId: string,
  topic: string,
  onEvent: (event: Api.EventResponse) => void,
  pollInterval = 5000,
) {
  const id = `${contractId}:${topic}` as PagingKey;
  paging[id] = paging[id] || {};

  React.useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let stop = false;

    const pollEvents = async () => {
      try {
        if (!paging[id].lastLedgerStart) {
          const latestLedgerState = await server.getLatestLedger();
          paging[id].lastLedgerStart = latestLedgerState.sequence;
        }

        const response = await server.getEvents({
          startLedger: !paging[id].pagingToken
            ? paging[id].lastLedgerStart
            : undefined,
          cursor: paging[id].pagingToken,
          filters: [
            {
              contractIds: [contractId],
              topics: [[xdr.ScVal.scvSymbol(topic).toXDR("base64")]],
              type: "contract",
            },
          ],
          limit: 10,
        });

        paging[id].pagingToken = undefined;
        if (response.latestLedger) {
          paging[id].lastLedgerStart = response.latestLedger;
        }
        if (response.events) {
          response.events.forEach((event) => {
            try {
              onEvent(event);
            } catch (error) {
              console.error("useSubscription event handler error", error);
            } finally {
              paging[id].pagingToken = event.pagingToken;
            }
          });
        }
      } catch (error) {
        console.error("useSubscription polling error", error);
      } finally {
        if (!stop) {
          timeoutId = setTimeout(() => void pollEvents(), pollInterval);
        }
      }
    };

    void pollEvents();

    return () => {
      stop = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [contractId, topic, onEvent, id, pollInterval]);
}
