import Image from "next/image";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import type { TeaMetadata as OffchainTeaMetadata, TeaColorway } from "@/lib/nft/schema";
import type { TeaMetadata as ChainTeaMetadata } from "tea-nft-client";

const resolveGatewayBase = () =>
  (process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL ?? "https://ipfs.filebase.io").replace(/\/$/, "");

const resolveIfIpfs = (value: string | null | undefined) => {
  if (!value) return undefined;
  if (value.startsWith("ipfs://")) {
    const path = value.slice("ipfs://".length);
    return `${resolveGatewayBase()}/ipfs/${path}`;
  }
  return value;
};

const normalizeColor = (color?: string | null) => {
  if (!color) return undefined;
  const trimmed = color.trim();
  if (!trimmed) return undefined;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed.replace(/^#/, "")}`;
};

const colorwayStopsToCss = (colorway?: TeaColorway) => {
  if (!colorway) return undefined;

  if (colorway.mode === "solid") {
    return normalizeColor(colorway.color);
  }

  const stops = colorway.stops
    .map((stop) => `${normalizeColor(stop.color) ?? stop.color} ${Math.round(stop.offset * 100)}%`)
    .join(", ");

  if (colorway.mode === "linear-gradient") {
    return `linear-gradient(${colorway.angleDeg}deg, ${stops})`;
  }

  if (colorway.mode === "radial-gradient") {
    return `radial-gradient(circle, ${stops})`;
  }

  return undefined;
};

const primaryColorFromColorway = (colorway?: TeaColorway) => {
  if (!colorway) return undefined;

  if (colorway.mode === "solid") {
    return normalizeColor(colorway.color);
  }

  const first = colorway.stops[0];
  return normalizeColor(first?.color);
};

const fallbackCardBackground = "linear-gradient(135deg, #f5f3ff, #ecfeff)";
const fallbackAccent = "#f1e9ff";
const fallbackImage = "/design/nft/stellar-tea-001.png";

export type TeaCardData = {
  tokenId?: number | string;
  chainMetadata?: ChainTeaMetadata | null;
  offchainMetadata?: OffchainTeaMetadata | null;
  imageUri?: string | null;
  tokenUri?: string | null;
};

type TeaCardProps = {
  data: TeaCardData;
  onList?: () => void;
  onMix?: () => void;
  listDisabled?: boolean;
  mixDisabled?: boolean;
  loading?: boolean;
};

export const TeaCard = ({
  data,
  onList,
  onMix,
  listDisabled,
  mixDisabled,
  loading,
}: TeaCardProps) => {
  const offchain = data.offchainMetadata ?? null;
  const chain = data.chainMetadata ?? null;

  const cardBackground = useMemo(() => {
    const colorwayCss = colorwayStopsToCss(offchain?.properties?.colorway);
    const backgroundColor = normalizeColor(offchain?.background_color);
    return colorwayCss ?? backgroundColor ?? fallbackCardBackground;
  }, [offchain?.properties?.colorway, offchain?.background_color]);

  const accentColor = useMemo(() => {
    return (
      primaryColorFromColorway(offchain?.properties?.colorway) ??
      normalizeColor(offchain?.background_color) ??
      fallbackAccent
    );
  }, [offchain?.properties?.colorway, offchain?.background_color]);

  const imageUrl =
    resolveIfIpfs(offchain?.image) ??
    resolveIfIpfs(data.imageUri) ??
    resolveIfIpfs(chain?.image_uri) ??
    resolveIfIpfs(data.tokenUri) ??
    fallbackImage;

  const tokenLabel = data.tokenId !== undefined ? `#${data.tokenId}` : "—";
  const level = chain?.level ?? offchain?.properties?.stats?.body ?? null;

  const rarity =
    offchain?.properties?.rarity ??
    (typeof chain?.rarity === "number" ? `Tier ${chain.rarity}` : chain?.rarity) ??
    "—";

  const flavor =
    offchain?.properties?.flavorProfile ?? chain?.flavor_profile ?? offchain?.description ?? "Custom blend";
  const infusion = offchain?.properties?.infusion ?? chain?.infusion ?? null;

  const stats = offchain?.properties?.stats ?? chain?.stats ?? null;

  const factChips = [
    offchain?.properties?.rank !== undefined
      ? { label: "Rank", value: `#${offchain.properties.rank}` }
      : null,
    offchain?.properties?.mixCount !== undefined
      ? { label: "Mix Count", value: offchain.properties.mixCount }
      : null,
    offchain?.properties?.lineage?.generation !== undefined
      ? { label: "Generation", value: offchain.properties.lineage.generation }
      : null,
  ].filter(Boolean) as { label: string; value: string | number }[];

  const statItems = stats
    ? ([
        { key: "Body", value: stats.body },
        { key: "Caffeine", value: stats.caffeine },
        { key: "Sweetness", value: stats.sweetness },
      ] as const)
    : [];

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/30 shadow-[0_28px_68px_rgba(17,24,39,0.18)] transition-transform duration-300 hover:-translate-y-1"
      style={{ background: cardBackground }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/55 via-white/35 to-white/15 backdrop-blur-[2px]" />
      <div className="relative flex h-full flex-col gap-5 p-5">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-600">
          <span className="rounded-full bg-white/70 px-3 py-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">{tokenLabel}</span>
          <span className="rounded-full bg-white/70 px-3 py-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
            Lvl {chain?.level ?? "—"}
          </span>
        </div>
        <div className="relative rounded-2xl border border-white/60 bg-white/70 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.10)]">
          <div
            className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl p-4"
            style={{
              background: `linear-gradient(160deg, rgba(255,255,255,0.96) 0%, ${accentColor} 100%)`,
            }}
          >
            <Image
              src={imageUrl}
              alt={offchain?.name ?? chain?.display_name ?? `Tea ${tokenLabel}`}
              width={420}
              height={420}
              className="max-h-full w-auto object-contain"
              sizes="(max-width: 768px) 100vw, 420px"
            />
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4">
          {factChips.length > 0 ? (
            <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.24em] text-slate-500">
              {factChips.map((chip) => (
                <span
                  key={chip.label}
                  className="rounded-full bg-white/70 px-3 py-1 font-semibold text-slate-600 shadow-[0_8px_18px_rgba(15,23,42,0.12)]"
                >
                  {chip.label}: {chip.value}
                </span>
              ))}
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-semibold text-slate-800">
              {offchain?.name ?? chain?.display_name ?? `Tea ${tokenLabel}`}
            </h3>
            <p className="text-sm text-slate-600">
              {flavor}
              {infusion ? <span className="text-slate-500"> · {infusion}</span> : null}
            </p>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">{rarity}</p>
          </div>
          {statItems.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {statItems.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center gap-1 rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-[0_14px_28px_rgba(15,23,42,0.12)]"
                >
                  <span className="uppercase tracking-[0.18em] text-slate-400">{item.key}</span>
                  <span className="text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>
          ) : null}
          {(onList || onMix) && (
            <div className="mt-auto flex flex-col gap-3 pt-2 md:flex-row">
              {onList ? (
                <Button
                  onClick={onList}
                  variant="outline"
                  className="w-full rounded-full text-xs font-semibold uppercase tracking-[0.26em]"
                  disabled={loading || listDisabled}
                >
                  List for Sale
                </Button>
              ) : null}
              {onMix ? (
                <Button
                  onClick={onMix}
                  variant="candy"
                  className="w-full rounded-full text-xs font-semibold uppercase tracking-[0.26em]"
                  disabled={loading || mixDisabled}
                >
                  Send for Fusion
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default TeaCard;

