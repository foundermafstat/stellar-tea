"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useWallet } from "@/lib/hooks/useWallet";
import {
  buildTeaMetadata,
  type LayerCategory,
  type LayersManifest,
  resolveManifestUrl,
  type LineageSnapshot,
  type TeaColorway,
  toIpfsUri,
} from "@/lib/nft";
import {
  renderTeaImage,
  type RenderResult,
  type SelectedLayer,
} from "@/lib/nft/generator";
import type { TeaColorwayLinearGradient, TeaColorwaySolid } from "@/lib/nft/schema";
import { uploadBlobToIpfs, uploadJsonToIpfs } from "@/lib/ipfs/client";

const MANIFEST_CID = process.env.NEXT_PUBLIC_TEA_LAYERS_MANIFEST_CID;
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL;

const CANVAS_SIZE = 1024;
const GATEWAY_BASE =
  (IPFS_GATEWAY ?? "https://ipfs.filebase.io").replace(/\/$/, "");

const DEFAULT_SOLID = "#ff91c1";
const DEFAULT_GRADIENT_START = "#ff91c1";
const DEFAULT_GRADIENT_END = "#7c5bff";

type SelectionState = Record<string, string>;

type ColorMode = "solid" | "linear";

const randomHexColor = () =>
  `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;

const weightedPick = (variants: LayerCategory["variants"]) => {
  if (variants.length === 0) return undefined;
  const total = variants.reduce((acc, item) => acc + (item.weight ?? 1), 0);
  const threshold = Math.random() * total;
  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.weight ?? 1;
    if (threshold <= cumulative) {
      return variant;
    }
  }
  return variants[variants.length - 1];
};

const buildColorway = (
  mode: ColorMode,
  solid: string,
  gradientStart: string,
  gradientEnd: string,
  gradientAngle: number,
): TeaColorway => {
  if (mode === "solid") {
    return {
      mode: "solid",
      color: solid,
    } satisfies TeaColorwaySolid;
  }

  return {
    mode: "linear-gradient",
    angleDeg: gradientAngle,
    stops: [
      { offset: 0, color: gradientStart },
      { offset: 1, color: gradientEnd },
    ],
  } satisfies TeaColorwayLinearGradient;
};

const buildSelectedLayers = (
  manifest: LayersManifest | null,
  selection: SelectionState,
  colorway: TeaColorway,
): SelectedLayer[] => {
  if (!manifest) return [];
  const result: SelectedLayer[] = [];
  manifest.categories.forEach((category) => {
    const variantId = selection[category.id];
    if (!variantId) return;
    const variant = category.variants.find((item) => item.id === variantId);
    if (!variant) return;
    result.push({
      categoryId: category.id,
      order: category.zIndex,
      variant,
      tint:
        variant.format === "svg-gradient" || variant.format === "svg-mask"
          ? colorway
          : undefined,
    });
  });
  return result;
};

const buildDefaultLineage = (): LineageSnapshot => ({
  generation: 0,
  parents: [],
});

const MintPage = () => {
  const { address } = useWallet();

  const [manifest, setManifest] = useState<LayersManifest | null>(null);
  const [manifestError, setManifestError] = useState<string | null>(null);
  const [isManifestLoading, setIsManifestLoading] = useState(false);

  const [selection, setSelection] = useState<SelectionState>({});
  const [colorMode, setColorMode] = useState<ColorMode>("linear");
  const [solidColor, setSolidColor] = useState(DEFAULT_SOLID);
  const [gradientStart, setGradientStart] = useState(DEFAULT_GRADIENT_START);
  const [gradientEnd, setGradientEnd] = useState(DEFAULT_GRADIENT_END);
  const [gradientAngle, setGradientAngle] = useState(90);

  const [seed, setSeed] = useState<string>(() =>
    typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36).slice(2),
  );
  const [rank, setRank] = useState(1);
  const [rarity, setRarity] = useState("Common");
  const [flavorProfile, setFlavorProfile] = useState("Fruity Bloom");
  const [infusion, setInfusion] = useState("Aurora Classic");
  const [mixCount, setMixCount] = useState(0);
  const [body, setBody] = useState(50);
  const [caffeine, setCaffeine] = useState(30);
  const [sweetness, setSweetness] = useState(60);
  const [lineage, setLineage] = useState<LineageSnapshot>(buildDefaultLineage);

  const [preview, setPreview] = useState<RenderResult | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [lastUploads, setLastUploads] = useState<{
    imageCid: string;
    metadataCid: string;
    metadata: ReturnType<typeof buildTeaMetadata>;
  } | null>(null);

  const colorway = useMemo(
    () =>
      buildColorway(colorMode, solidColor, gradientStart, gradientEnd, gradientAngle),
    [colorMode, solidColor, gradientStart, gradientEnd, gradientAngle],
  );

  useEffect(() => {
    if (!MANIFEST_CID) {
      setManifestError(
        "NEXT_PUBLIC_TEA_LAYERS_MANIFEST_CID is not configured. Provide IPFS CID with the layers manifest.",
      );
      return;
    }

    const abortController = new AbortController();
    const loadManifest = async () => {
      setIsManifestLoading(true);
      setManifestError(null);
      try {
        const manifestUrl = resolveManifestUrl({
          manifestCid: MANIFEST_CID,
          gatewayBaseUrl: IPFS_GATEWAY,
        });
        const response = await fetch(manifestUrl, { signal: abortController.signal });
        if (!response.ok) {
          throw new Error(`Unable to fetch layers manifest: ${response.statusText}`);
        }
        const data = (await response.json()) as LayersManifest;
        setManifest(data);
        const defaultSelection = data.categories.reduce<SelectionState>((acc, category) => {
          if (category.variants.length > 0) {
            acc[category.id] = category.variants[0].id;
          }
          return acc;
        }, {});
        setSelection(defaultSelection);
      } catch (error) {
        if (abortController.signal.aborted) return;
        console.error(error);
        setManifestError(
          error instanceof Error ? error.message : "Unknown error loading manifest.",
        );
      } finally {
        if (!abortController.signal.aborted) {
          setIsManifestLoading(false);
        }
      }
    };

    void loadManifest();

    return () => abortController.abort();
  }, []);

  const selectedLayers = useMemo(
    () => buildSelectedLayers(manifest, selection, colorway),
    [manifest, selection, colorway],
  );

  useEffect(() => {
    if (!manifest || selectedLayers.length === 0) return;
    let cancelled = false;
    const generate = async () => {
      setIsPreviewLoading(true);
      setPreviewError(null);
      try {
        const image = await renderTeaImage(selectedLayers, {
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          background: { mode: "solid", color: "#ffffff" },
          gatewayBaseUrl: IPFS_GATEWAY,
        });
        if (!cancelled) {
          setPreview(image);
        }
      } catch (error) {
        if (cancelled) return;
        console.error(error);
        setPreviewError(
          error instanceof Error ? error.message : "Unable to render preview image.",
        );
      } finally {
        if (!cancelled) {
          setIsPreviewLoading(false);
        }
      }
    };

    void generate();

    return () => {
      cancelled = true;
    };
  }, [manifest, selectedLayers]);

  const refreshSeed = () => {
    setSeed(crypto.randomUUID());
  };

  const randomizeSelection = () => {
    if (!manifest) return;
    const randomized: SelectionState = {};
    manifest.categories.forEach((category) => {
      const pick = weightedPick(category.variants);
      if (pick) randomized[category.id] = pick.id;
    });
    setSelection(randomized);
    setGradientStart(randomHexColor());
    setGradientEnd(randomHexColor());
    refreshSeed();
  };

  const previewMetadata = useMemo(() => {
    if (selectedLayers.length === 0) return null;
    return buildTeaMetadata({
      name: `Stellar Tea ${seed.slice(0, 6).toUpperCase()}`,
      description: `A one-of-a-kind Stellar Tea brew featuring ${flavorProfile} notes.`,
      imageCid: "placeholder",
      seed,
      rank,
      rarity,
      flavorProfile,
      infusion,
      colorway,
      layers: selectedLayers.map((layer) => ({
        categoryId: layer.categoryId,
        variantId: layer.variant.id,
        label: layer.variant.label,
        order: layer.order,
        assetUri: toIpfsUri(layer.variant.assetCid),
        tint: layer.tint,
      })),
      lineage,
      stats: {
        body,
        caffeine,
        sweetness,
      },
      mixCount,
    });
  }, [
    selectedLayers,
    flavorProfile,
    infusion,
    seed,
    rank,
    rarity,
    colorway,
    lineage,
    body,
    caffeine,
    sweetness,
    mixCount,
  ]);

  const metadataJson = useMemo(
    () => (previewMetadata ? JSON.stringify(previewMetadata, null, 2) : ""),
    [previewMetadata],
  );

  const handleChangeSelection = (categoryId: string, variantId: string) => {
    setSelection((prev) => ({
      ...prev,
      [categoryId]: variantId,
    }));
  };

  const handleMint = async () => {
    if (!address) {
      toast({
        title: "Wallet required",
        description: "Connect your wallet before attempting to mint.",
      });
      return;
    }

    if (selectedLayers.length === 0) {
      toast({
        title: "No layers selected",
        description: "Pick at least one layer before minting.",
      });
      return;
    }

    setIsMinting(true);
    try {
      const rendered = await renderTeaImage(selectedLayers, {
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        background: { mode: "solid", color: "#ffffff" },
        gatewayBaseUrl: IPFS_GATEWAY,
        withBlob: true,
      });

      if (!rendered.blob) {
        throw new Error("Unable to generate PNG blob for upload.");
      }

      const imageFilename = `${seed}.png`;
      const imageUpload = await uploadBlobToIpfs(rendered.blob, imageFilename, "image/png");

      const metadataPayload = buildTeaMetadata({
        name: `Stellar Tea ${seed.slice(0, 6).toUpperCase()}`,
        description: `A one-of-a-kind Stellar Tea brew featuring ${flavorProfile} notes.`,
        imageCid: imageUpload.cid,
        seed,
        rank,
        rarity,
        flavorProfile,
        infusion,
        colorway,
        layers: selectedLayers.map((layer) => ({
          categoryId: layer.categoryId,
          variantId: layer.variant.id,
          label: layer.variant.label,
          order: layer.order,
          assetUri: toIpfsUri(layer.variant.assetCid),
          tint: layer.tint,
        })),
        lineage,
        stats: {
          body,
          caffeine,
          sweetness,
        },
        mixCount,
      });

      const metadataFilename = `${seed}.json`;
      const metadataUpload = await uploadJsonToIpfs(metadataPayload, metadataFilename);

      setLastUploads({
        imageCid: imageUpload.cid,
        metadataCid: metadataUpload.cid,
        metadata: metadataPayload,
      });

      toast({
        title: "Assets uploaded to IPFS",
        description: `Image CID: ${imageUpload.cid}\nMetadata CID: ${metadataUpload.cid}`,
        dismissible: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Mint preparation failed",
        description:
          error instanceof Error ? error.message : "Unexpected error while uploading to IPFS.",
      });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-[#fdf6ff] via-[#f3f7ff] to-[#fff7f1] pb-24 pt-16">
      <div className="absolute inset-x-0 top-0 h-60 bg-[radial-gradient(circle_at_top,_rgba(194,172,255,0.25),_transparent_70%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-purple-500 shadow-[0_12px_32px_rgba(189,140,255,0.18)]">
            Generative Mint
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold leading-tight text-slate-800 md:text-5xl">
              Craft a generative Stellar Tea NFT
            </h1>
            <p className="max-w-3xl text-base text-slate-600 md:text-lg">
              Combine IPFS-hosted layers, customise gradients, preview the brew, and mint it to the
              on-chain tea collection. Manifest CID is loaded dynamically so you can update assets
              without redeploying the app.
            </p>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-white/60 bg-white/90 p-8 shadow-[0_35px_85px_rgba(189,140,255,0.22)] backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-700">Preview</h2>
              <div className="flex gap-3">
                <Button variant="outline" onClick={refreshSeed} className="rounded-full px-4 py-2">
                  Refresh seed
                </Button>
                <Button variant="candy" onClick={randomizeSelection} className="rounded-full px-4">
                  Randomize
                </Button>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-4">
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-white/70 bg-white/70 shadow-[0_25px_65px_rgba(189,140,255,0.18)]">
                {isPreviewLoading ? (
                  <span className="text-sm text-slate-500">Rendering preview…</span>
                ) : previewError ? (
                  <span className="text-sm text-destructive">{previewError}</span>
                ) : preview ? (
                  <Image
                    src={preview.dataUrl}
                    alt="NFT preview"
                    width={CANVAS_SIZE}
                    height={CANVAS_SIZE}
                    unoptimized
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-sm text-slate-500">
                    Select layers to generate your first preview.
                  </span>
                )}
              </div>

              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_15px_40px_rgba(189,140,255,0.16)]">
                <h3 className="text-sm font-semibold text-slate-700">Metadata snapshot</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Metadata will be pushed to IPFS together with the rendered PNG. CID placeholders
                  are used until the upload step is implemented.
                </p>
                <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-slate-900/90 p-4 text-xs text-slate-100">
                  {metadataJson || "// Select layers to preview metadata"}
                </pre>
              </div>
              {lastUploads ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-700">
                  <h3 className="font-semibold">Last upload</h3>
                  <ul className="mt-2 space-y-1 text-xs text-emerald-600">
                    <li>
                      Image CID:{" "}
                      <a
                        href={`${GATEWAY_BASE}/ipfs/${lastUploads.imageCid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {lastUploads.imageCid}
                      </a>
                    </li>
                    <li>
                      Metadata CID:{" "}
                      <a
                        href={`${GATEWAY_BASE}/ipfs/${lastUploads.metadataCid}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {lastUploads.metadataCid}
                      </a>
                    </li>
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-[0_30px_80px_rgba(189,140,255,0.2)] backdrop-blur-2xl">
              <h2 className="text-lg font-semibold text-slate-700">Layers & Traits</h2>
              {isManifestLoading ? (
                <p className="mt-4 text-sm text-slate-500">Loading layers from IPFS…</p>
              ) : manifestError ? (
                <p className="mt-4 text-sm text-destructive">{manifestError}</p>
              ) : manifest ? (
                <div className="mt-4 space-y-5">
                  {manifest.categories.map((category) => (
                    <div key={category.id} className="space-y-2">
                      <span className="text-sm font-semibold text-slate-700">
                        {category.label}
                      </span>
                      <select
                        className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-[0_12px_30px_rgba(189,140,255,0.12)] focus:border-purple-300 focus:outline-none"
                        value={selection[category.id] ?? ""}
                        onChange={(event) => handleChangeSelection(category.id, event.target.value)}
                      >
                        {category.variants.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-[0_30px_80px_rgba(189,140,255,0.2)] backdrop-blur-2xl">
              <h2 className="text-lg font-semibold text-slate-700">Colour & gradient</h2>
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <input
                      type="radio"
                      name="colorMode"
                      value="solid"
                      checked={colorMode === "solid"}
                      onChange={() => setColorMode("solid")}
                    />
                    Solid
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <input
                      type="radio"
                      name="colorMode"
                      value="linear"
                      checked={colorMode === "linear"}
                      onChange={() => setColorMode("linear")}
                    />
                    Gradient
                  </label>
                </div>

                {colorMode === "solid" ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={solidColor}
                      onChange={(event) => setSolidColor(event.target.value)}
                      className="h-10 w-16 cursor-pointer rounded-lg border border-slate-200 p-1"
                    />
                    <span className="text-xs text-slate-500">{solidColor}</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-slate-500">
                        Start
                        <input
                          type="color"
                          value={gradientStart}
                          onChange={(event) => setGradientStart(event.target.value)}
                          className="ml-2 h-10 w-16 cursor-pointer rounded-lg border border-slate-200 p-1"
                        />
                      </label>
                      <label className="text-xs text-slate-500">
                        End
                        <input
                          type="color"
                          value={gradientEnd}
                          onChange={(event) => setGradientEnd(event.target.value)}
                          className="ml-2 h-10 w-16 cursor-pointer rounded-lg border border-slate-200 p-1"
                        />
                      </label>
                    </div>
                    <label className="flex items-center gap-3 text-xs text-slate-500">
                      Angle
                      <input
                        type="number"
                        min={0}
                        max={360}
                        value={gradientAngle}
                        onChange={(event) => setGradientAngle(Number(event.target.value))}
                        className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-700 focus:border-purple-300 focus:outline-none"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-[0_30px_80px_rgba(189,140,255,0.2)] backdrop-blur-2xl">
              <h2 className="text-lg font-semibold text-slate-700">Metadata controls</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="flex flex-col text-xs font-medium text-slate-500">
                  Flavor profile
                  <input
                    value={flavorProfile}
                    onChange={(event) => setFlavorProfile(event.target.value)}
                    className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-purple-300 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col text-xs font-medium text-slate-500">
                  Infusion
                  <input
                    value={infusion}
                    onChange={(event) => setInfusion(event.target.value)}
                    className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-purple-300 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col text-xs font-medium text-slate-500">
                  Rarity
                  <input
                    value={rarity}
                    onChange={(event) => setRarity(event.target.value)}
                    className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-purple-300 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col text-xs font-medium text-slate-500">
                  Rank
                  <input
                    type="number"
                    min={0}
                    value={rank}
                    onChange={(event) => setRank(Number(event.target.value))}
                    className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-purple-300 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col text-xs font-medium text-slate-500">
                  Mix count
                  <input
                    type="number"
                    min={0}
                    value={mixCount}
                    onChange={(event) => setMixCount(Number(event.target.value))}
                    className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-purple-300 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col text-xs font-medium text-slate-500">
                  Generation
                  <input
                    type="number"
                    min={0}
                    value={lineage.generation}
                    onChange={(event) =>
                      setLineage((prev) => ({
                        ...prev,
                        generation: Number(event.target.value),
                      }))
                    }
                    className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-purple-300 focus:outline-none"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <label className="flex flex-col text-xs font-medium text-slate-500">
                  Body
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={body}
                    onChange={(event) => setBody(Number(event.target.value))}
                    className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-purple-300 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col text-xs font-medium text-slate-500">
                  Caffeine
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={caffeine}
                    onChange={(event) => setCaffeine(Number(event.target.value))}
                    className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-purple-300 focus:outline-none"
                  />
                </label>
                <label className="flex flex-col text-xs font-medium text-slate-500">
                  Sweetness
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={sweetness}
                    onChange={(event) => setSweetness(Number(event.target.value))}
                    className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-purple-300 focus:outline-none"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-purple-200 bg-purple-50/60 p-6 shadow-[0_25px_65px_rgba(189,140,255,0.18)]">
              <h2 className="text-lg font-semibold text-purple-700">Mint</h2>
              <p className="mt-2 text-sm text-purple-600">
                Upload the rendered PNG and metadata JSON to IPFS (Filebase). Contract interaction
                will be wired once the upload succeeds.
              </p>
              <Button
                variant="candy"
                disabled={!address || !previewMetadata || isPreviewLoading || isMinting}
                onClick={handleMint}
                className="mt-4 h-12 w-full rounded-full text-xs font-semibold uppercase tracking-[0.28em]"
              >
                {isMinting
                  ? "Uploading…"
                  : address
                  ? "Upload assets to IPFS"
                  : "Connect wallet to mint"}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default MintPage;


