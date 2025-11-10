"use client";

import { toIpfsUri } from "@/lib/nft";

export interface UploadResult {
  cid: string;
  uri: string;
  gatewayUrl: string;
}

const FILEBASE_API_ENDPOINT =
  process.env.NEXT_PUBLIC_IPFS_API_ENDPOINT ?? "https://ipfs.filebase.io/api/v1";
const FILEBASE_AUTH = process.env.NEXT_PUBLIC_IPFS_API_KEY;
const DEFAULT_GATEWAY =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL ?? "https://ipfs.filebase.io";

const ensureAuthHeader = () => {
  if (!FILEBASE_AUTH) {
    throw new Error(
      "IPFS API key is missing. Set NEXT_PUBLIC_IPFS_API_KEY in your environment.",
    );
  }

  if (FILEBASE_AUTH.startsWith("Basic ")) {
    return FILEBASE_AUTH;
  }

  return `Basic ${FILEBASE_AUTH}`;
};

const resolveEndpoint = (path: string) => `${FILEBASE_API_ENDPOINT.replace(/\/$/, "")}${path}`;

const buildGatewayUrl = (cid: string) =>
  `${DEFAULT_GATEWAY.replace(/\/$/, "")}/ipfs/${cid}`;

const parseCidFromResponse = async (response: Response) => {
  const payload = (await response.json()) as { cid?: string; hash?: string; IpfsHash?: string };
  const cid = payload.cid ?? payload.hash ?? payload.IpfsHash;
  if (!cid) {
    throw new Error("Filebase response does not include a CID.");
  }
  return cid;
};

export const uploadBlobToIpfs = async (
  blob: Blob,
  filename: string,
  contentType?: string,
): Promise<UploadResult> => {
  const formData = new FormData();
  const file = blob instanceof File ? blob : new File([blob], filename, { type: contentType });
  formData.append("file", file);

  const response = await fetch(resolveEndpoint("/ipfs"), {
    method: "POST",
    headers: {
      Authorization: ensureAuthHeader(),
    },
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Filebase upload failed: ${response.status} ${message}`);
  }

  const cid = await parseCidFromResponse(response);
  return {
    cid,
    uri: toIpfsUri(cid),
    gatewayUrl: buildGatewayUrl(cid),
  };
};

export const uploadJsonToIpfs = async (
  data: unknown,
  filename = "metadata.json",
): Promise<UploadResult> => {
  const json = JSON.stringify(data);
  const blob = new Blob([json], { type: "application/json" });
  return uploadBlobToIpfs(blob, filename, "application/json");
};


