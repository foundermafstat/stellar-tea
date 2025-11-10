"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useWallet } from "@/lib/hooks/useWallet";
import { buildTeaMetadata } from "@/lib/nft";
import { generateLocalLayers } from "@/lib/nft/generateLocal";
import { buildFlavorTemplate } from "@/lib/nft/metadataTemplate";
import { renderTeaImage } from "@/lib/nft/generator";
import { uploadBlobToIpfs, uploadJsonToIpfs } from "@/lib/ipfs/client";
import {
  createTeaNftClient,
  getTeaContractId,
  type TeaNftWalletSigner,
} from "@/lib/contracts/nft";
import { BASE_MINT_STARS_COST, payStarsFee, type StarsWalletSigner } from "@/lib/contracts/stars";
import { transactionExplorerUrl } from "@/lib/stellarConfig";

const OUTPUT_WIDTH = 485;
const OUTPUT_HEIGHT = 1000;
const GATEWAY_BASE =
  (process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL ?? "https://ipfs.filebase.io").replace(/\/$/, "");

type MintHistoryItem = {
  seed: string;
  name: string;
  flavorDescription: string;
  imageCid: string;
  metadataCid: string;
  dataUrl: string;
  tokenId?: number;
  txHash?: string;
};

const randomStat = () => 40 + Math.floor(Math.random() * 40);

const MintPage = () => {
  const { address, signTransaction } = useWallet();
  const [isMinting, setIsMinting] = useState(false);
  const [history, setHistory] = useState<MintHistoryItem[]>([]);

  const handleMint = async () => {
    if (!address || !signTransaction) {
      toast({
        title: "Wallet required",
        description: "Connect your wallet to mint brews.",
      });
      return;
    }

    setIsMinting(true);
    try {
      const seed =
        typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      const { layers, colorway, flavors } = generateLocalLayers({ forceSolid: true });
      const primaryFlavor = flavors[0];

      await payStarsFee({
        publicKey: address,
        signer: signTransaction as StarsWalletSigner,
        amount: BASE_MINT_STARS_COST,
        destination: getTeaContractId(),
      });

      const rendered = await renderTeaImage(layers, {
        width: OUTPUT_WIDTH,
        height: OUTPUT_HEIGHT,
        background: undefined,
        withBlob: true,
      });

      if (!rendered.blob) {
        throw new Error("Failed to prepare PNG for upload.");
      }

      const imageUpload = await uploadBlobToIpfs(rendered.blob, `${seed}.png`, "image/png");

      const template = buildFlavorTemplate(primaryFlavor, seed, "Common");
      const metadataPayload = buildTeaMetadata({
        name: template.name,
        description: `${template.description} Brewed fresh in the Stellar Tea lab.`,
        imageCid: imageUpload.cid,
        seed,
        rank: 1,
        rarity: template.rarity,
        flavorProfile: template.flavorProfile,
        infusion: template.infusion,
        colorway,
        layers: layers.map((layer) => ({
          categoryId: layer.categoryId,
          variantId: layer.variant.id,
          label: layer.variant.label,
          order: layer.order,
          assetUri: layer.variant.assetCid,
          tint: layer.tint,
        })),
        lineage: { generation: 0, parents: [] },
        stats: {
          body: randomStat(),
          caffeine: randomStat(),
          sweetness: randomStat(),
        },
        mixCount: 0,
      });

      const metadataUpload = await uploadJsonToIpfs(metadataPayload, `${seed}.json`);

      const teaClient = createTeaNftClient({
        publicKey: address,
        signer: signTransaction as TeaNftWalletSigner,
      });
      const mintTx = await teaClient.mint({
        caller: address,
        to: address,
        tea_metadata: metadataPayload,
      });

      const blockers = mintTx.needsNonInvokerSigningBy?.() ?? [];
      if (blockers.length > 0) {
        throw new Error(
          `Additional signatures required for mint: ${blockers.join(", ")}.`,
        );
      }

      const mintReceipt = await mintTx.signAndSend();
      const txHash =
        mintReceipt.getTransactionResponse?.txHash ??
        mintReceipt.sendTransactionResponse?.hash ??
        "";
      const tokenId = Number(mintTx.result ?? 0);

      setHistory((prev) =>
        [
          {
            seed,
            name: template.name,
            flavorDescription: template.description,
            imageCid: imageUpload.cid,
            metadataCid: metadataUpload.cid,
            dataUrl: rendered.dataUrl,
            tokenId: Number.isFinite(tokenId) ? tokenId : undefined,
            txHash: txHash || undefined,
          },
          ...prev,
        ].slice(0, 6),
      );

      toast({
        title: `${template.name} brewed`,
        description: `${BASE_MINT_STARS_COST} STARS debited.`,
        dismissible: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Mint failed",
        description:
          error instanceof Error ? error.message : "Unexpected error during generative mint.",
      });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#f6f1ff] to-[#fff] pb-24 pt-16">
      <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,_rgba(157,129,255,0.25),_transparent_70%)]" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 px-6">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-purple-500 shadow-[0_12px_32px_rgba(189,140,255,0.18)]">
            Base Mint · 150 STARS
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-800 md:text-4xl">
              One-click random Stellar Tea mint
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 md:text-base">
              Spend 150 STARS, assemble layers from the public directory, upload PNG and metadata to
              Filebase IPFS, and trigger the Soroban contract with no manual tweaks.
            </p>
          </div>
        </header>

        <section className="space-y-6 rounded-3xl border border-white/60 bg-white/90 p-8 shadow-[0_35px_85px_rgba(189,140,255,0.22)] backdrop-blur-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-700">Instant mint</h2>
              <p className="text-sm text-slate-500">
                No previews or tuning — the brew is generated on the fly. Colors, layers, rendering,
                and uploads are automatic.
              </p>
            </div>
            <Button
              variant="candy"
              disabled={!address || !signTransaction || isMinting}
              onClick={handleMint}
              className="h-12 rounded-full px-6 text-xs font-semibold uppercase tracking-[0.28em]"
            >
              {isMinting
                ? "Minting…"
                : address
                ? `Mint for ${BASE_MINT_STARS_COST} STARS`
                : "Connect wallet"}
            </Button>
          </div>
          <ul className="list-disc space-y-2 pl-5 text-xs text-slate-500">
            <li>150 STARS transfers to the tea-nft contract before generation</li>
            <li>PNG 485×1000 with transparency is rendered from layers in `public/nft/generate`</li>
            <li>Filebase IPFS stores both the image and metadata.json</li>
            <li>Rarity: Common, solid colorway, single flavor profile</li>
          </ul>
        </section>

        {history.length > 0 ? (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-700">Recent brews</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {history.map((item) => {
                const explorer = item.txHash ? transactionExplorerUrl(item.txHash) : undefined;
                return (
                  <div
                    key={`${item.metadataCid}-${item.seed}`}
                    className="overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-[0_30px_80px_rgba(189,140,255,0.2)] backdrop-blur-2xl"
                  >
                    <div className="relative aspect-[485/1000] w-full">
                      <Image
                        src={item.dataUrl}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-contain"
                      />
                    </div>
                    <div className="space-y-2 p-5 text-sm text-slate-600">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-slate-800">{item.name}</h3>
                        {typeof item.tokenId === "number" ? (
                          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-600">
                            #{item.tokenId}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-slate-500">{item.flavorDescription}</p>
                      <ul className="space-y-1 text-xs">
                        <li>
                          Image CID:{" "}
                          <a
                            href={`${GATEWAY_BASE}/ipfs/${item.imageCid}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-600 underline-offset-4 hover:underline"
                          >
                            {item.imageCid}
                          </a>
                        </li>
                        <li>
                          Metadata CID:{" "}
                          <a
                            href={`${GATEWAY_BASE}/ipfs/${item.metadataCid}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-purple-600 underline-offset-4 hover:underline"
                          >
                            {item.metadataCid}
                          </a>
                        </li>
                        {item.txHash ? (
                          <li>
                            Tx:{" "}
                            <a
                              href={explorer ?? "#"}
                              target="_blank"
                              rel="noreferrer"
                              className="text-purple-600 underline-offset-4 hover:underline"
                            >
                              {item.txHash}
                            </a>
                          </li>
                        ) : null}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
};

export default MintPage;


