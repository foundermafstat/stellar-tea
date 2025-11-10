"use client";

/**
 * Глобальные типы и хелперы для генеративных NFT Stellar Tea.
 *
 * Файл решает задачи to-do «Согласовать JSON-метадату и список генеративных параметров».
 * Дальнейшие шаги генератора и UI будут опираться на эти типы.
 */

export const GENERATIVE_METADATA_VERSION = "1.0.0";

export type LayerAssetFormat = "png" | "svg-mask" | "svg-gradient";

export interface LayerVariant {
  /** Уникальный идентификатор варианта внутри категории */
  id: string;
  /** Человекочитаемое имя (например, \"Strawberry pearls\") */
  label: string;
  /** CID или полный URL до исходного ассета */
  assetCid: string;
  /** Тип файла, определяет способ отрисовки */
  format: LayerAssetFormat;
  /**
   * Дополнительная информация: редкость, набор тегов, связь с рецептом и т.д.
   * Сохраняем плоский объект, чтобы было удобно сериализовать в IPFS.
   */
  traits?: Record<string, string | number | boolean>;
  /**
   * Вес для выпадения при рандомизации (0-100). Будет нормализован при генерации.
   */
  weight?: number;
}

export interface LayerCategory {
  /** Категория, например \"base\", \"topping\", \"straw\" */
  id: string;
  /** Заголовок для UI */
  label: string;
  /** Сортировка при отрисовке (малое значение — ниже) */
  zIndex: number;
  /** Ограничение по количеству одновременно выбранных слоёв */
  maxSelectable?: number;
  /** Возможные варианты слоя */
  variants: LayerVariant[];
}

export interface GradientStop {
  /** Значение между 0 и 1 */
  offset: number;
  /** Цвет в hex */
  color: string;
  /** Опциональная прозрачность (0-1) */
  opacity?: number;
}

export interface TeaColorwaySolid {
  mode: "solid";
  color: string;
}

export interface TeaColorwayLinearGradient {
  mode: "linear-gradient";
  angleDeg: number;
  stops: GradientStop[];
}

export interface TeaColorwayRadialGradient {
  mode: "radial-gradient";
  stops: GradientStop[];
}

export type TeaColorway =
  | TeaColorwaySolid
  | TeaColorwayLinearGradient
  | TeaColorwayRadialGradient;

export interface LayerSnapshot {
  categoryId: string;
  variantId: string;
  label: string;
  order: number;
  /** ipfs://CID/... */
  assetUri: string;
  /** Применённый цвет/градиент, если слой позволяет кастомизацию */
  tint?: TeaColorway;
}

export interface BlendComponentSnapshot {
  /** ID токена-родителя (если известен) */
  tokenId?: string;
  /** CID изображения родителя (для оффчейн проверки) */
  imageCid?: string;
  /** Сколько процентов (0-100) влияния внёс родитель */
  contribution: number;
  /** Палитра родителя для последующей визуализации */
  palette: string[];
}

export interface LineageSnapshot {
  generation: number;
  parents: BlendComponentSnapshot[];
}

export interface FlavorStats {
  body: number;
  caffeine: number;
  sweetness: number;
}

export interface Attribute {
  trait_type: string;
  value: string | number;
  display_type?: "number" | "boost_percentage" | "boost_number" | "date";
}

export interface TeaMetadataProperties {
  version: string;
  seed: string;
  rank: number;
  rarity: string;
  flavorProfile: string;
  infusion: string;
  colorway: TeaColorway;
  layers: LayerSnapshot[];
  lineage: LineageSnapshot;
  stats: FlavorStats;
  /** Общее количество смешиваний для истории */
  mixCount: number;
  /** Таймстемп генерации в ISO8601 */
  generatedAt: string;
}

export interface TeaMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  animation_url?: string;
  background_color?: string;
  attributes: Attribute[];
  properties: TeaMetadataProperties;
}

export interface BuildMetadataInput {
  name: string;
  description: string;
  imageCid: string;
  animationCid?: string;
  externalUrl?: string;
  backgroundColor?: string;
  seed: string;
  rank: number;
  rarity: string;
  flavorProfile: string;
  infusion: string;
  colorway: TeaColorway;
  layers: LayerSnapshot[];
  lineage: LineageSnapshot;
  stats: FlavorStats;
  mixCount: number;
  additionalAttributes?: Attribute[];
}

const IPFS_PREFIX = "ipfs://";

export const toIpfsUri = (cidOrUri: string) =>
  cidOrUri.startsWith(IPFS_PREFIX) ? cidOrUri : `${IPFS_PREFIX}${cidOrUri}`;

const baselineAttributes = (input: BuildMetadataInput): Attribute[] => [
  { trait_type: "Rank", value: input.rank },
  { trait_type: "Rarity", value: input.rarity },
  { trait_type: "Flavor Profile", value: input.flavorProfile },
  { trait_type: "Infusion", value: input.infusion },
  { trait_type: "Generations", value: input.lineage.generation },
  { trait_type: "Mix Count", value: input.mixCount },
  { trait_type: "Body", value: input.stats.body, display_type: "number" },
  { trait_type: "Caffeine", value: input.stats.caffeine, display_type: "number" },
  { trait_type: "Sweetness", value: input.stats.sweetness, display_type: "number" },
];

export const buildTeaMetadata = (input: BuildMetadataInput): TeaMetadata => {
  const attributes = [
    ...baselineAttributes(input),
    ...(input.additionalAttributes ?? []),
  ];

  return {
    name: input.name,
    description: input.description,
    image: toIpfsUri(input.imageCid),
    external_url: input.externalUrl,
    animation_url: input.animationCid ? toIpfsUri(input.animationCid) : undefined,
    background_color: input.backgroundColor,
    attributes,
    properties: {
      version: GENERATIVE_METADATA_VERSION,
      seed: input.seed,
      rank: input.rank,
      rarity: input.rarity,
      flavorProfile: input.flavorProfile,
      infusion: input.infusion,
      colorway: input.colorway,
      layers: input.layers,
      lineage: input.lineage,
      stats: input.stats,
      mixCount: input.mixCount,
      generatedAt: new Date().toISOString(),
    },
  };
};

export interface LayersManifest {
  categories: LayerCategory[];
}

export interface LoadLayersOptions {
  manifestCid: string;
  gatewayBaseUrl?: string;
}

export const resolveManifestUrl = ({
  manifestCid,
  gatewayBaseUrl,
}: LoadLayersOptions) =>
  gatewayBaseUrl
    ? `${gatewayBaseUrl.replace(/\/$/, "")}/ipfs/${manifestCid}`
    : `https://ipfs.filebase.io/ipfs/${manifestCid}`;


