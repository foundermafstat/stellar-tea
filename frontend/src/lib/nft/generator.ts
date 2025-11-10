"use client";

import type {
  LayerVariant,
  TeaColorway,
  TeaColorwayLinearGradient,
  TeaColorwayRadialGradient,
  TeaColorwaySolid,
} from "./schema";
import { toIpfsUri } from "./schema";

export interface SelectedLayer {
  categoryId: string;
  order: number;
  variant: LayerVariant;
  tint?: TeaColorway;
  opacity?: number;
  blendMode?: GlobalCompositeOperation;
}

export interface RenderOptions {
  width: number;
  height: number;
  background?: TeaColorway;
  pixelRatio?: number;
  gatewayBaseUrl?: string;
  /**
   * Когда true, генератор вернёт Blob в формате image/png.
   * Иначе blob будет undefined, что ускорит предпросмотр.
   */
  withBlob?: boolean;
}

export interface RenderResult {
  canvas: HTMLCanvasElement;
  blob?: Blob;
  dataUrl: string;
}

const DEFAULT_GATEWAY = "https://ipfs.filebase.io";

const toGatewayUrl = (cidOrUri: string, gatewayBase?: string) => {
  if (cidOrUri.startsWith("http://") || cidOrUri.startsWith("https://")) {
    return cidOrUri;
  }
  if (cidOrUri.startsWith("/")) {
    return cidOrUri;
  }
  const base = (gatewayBase ?? DEFAULT_GATEWAY).replace(/\/$/, "");
  const uri = toIpfsUri(cidOrUri);
  return uri.replace("ipfs://", `${base}/ipfs/`);
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = src;
  });

const applyColorway = (
  ctx: CanvasRenderingContext2D,
  colorway: TeaColorway,
  width: number,
  height: number,
) => {
  switch (colorway.mode) {
    case "solid": {
      ctx.fillStyle = (colorway as TeaColorwaySolid).color;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case "linear-gradient": {
      const spec = colorway as TeaColorwayLinearGradient;
      const angleRad = (spec.angleDeg * Math.PI) / 180;
      const x0 = width / 2 - (Math.cos(angleRad) * width) / 2;
      const y0 = height / 2 - (Math.sin(angleRad) * height) / 2;
      const x1 = width - x0;
      const y1 = height - y0;
      const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
      spec.stops.forEach(({ offset, color, opacity }) => {
        const alpha = opacity ?? 1;
        gradient.addColorStop(offset, convertColorWithAlpha(color, alpha));
      });
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case "radial-gradient": {
      const spec = colorway as TeaColorwayRadialGradient;
      const radius = Math.max(width, height) / 2;
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        radius,
      );
      spec.stops.forEach(({ offset, color, opacity }) => {
        const alpha = opacity ?? 1;
        gradient.addColorStop(offset, convertColorWithAlpha(color, alpha));
      });
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    default:
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
  }
};

const convertColorWithAlpha = (hexColor: string, alpha: number) => {
  const normalized = hexColor.startsWith("#") ? hexColor.slice(1) : hexColor;
  const bigint = Number.parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const drawPngLikeLayer = async (
  ctx: CanvasRenderingContext2D,
  layer: SelectedLayer,
  renderWidth: number,
  renderHeight: number,
  gatewayBase?: string,
) => {
  const url = toGatewayUrl(layer.variant.assetCid, gatewayBase);
  const image = await loadImage(url);

  ctx.save();
  ctx.globalAlpha = layer.opacity ?? 1;
  if (layer.blendMode) {
    ctx.globalCompositeOperation = layer.blendMode;
  }
  ctx.drawImage(image, 0, 0, renderWidth, renderHeight);
  ctx.restore();

  if (layer.tint && layer.variant.format === "svg-mask") {
    // Для масок поддерживаем заливку tint поверх альфа-канала.
    const offscreen = document.createElement("canvas");
    offscreen.width = renderWidth;
    offscreen.height = renderHeight;
    const offCtx = offscreen.getContext("2d");
    if (!offCtx) return;

    applyColorway(offCtx, layer.tint, renderWidth, renderHeight);
    offCtx.globalCompositeOperation = "destination-in";
    offCtx.drawImage(image, 0, 0, renderWidth, renderHeight);

    ctx.drawImage(offscreen, 0, 0);
  }
};

const drawGradientLayer = async (
  ctx: CanvasRenderingContext2D,
  layer: SelectedLayer,
  renderWidth: number,
  renderHeight: number,
  gatewayBase?: string,
) => {
  const tint = layer.tint;
  if (!tint) {
    await drawPngLikeLayer(ctx, layer, renderWidth, renderHeight, gatewayBase);
    return;
  }

  const url = toGatewayUrl(layer.variant.assetCid, gatewayBase);
  const mask = await loadImage(url);

  const offscreen = document.createElement("canvas");
  offscreen.width = renderWidth;
  offscreen.height = renderHeight;
  const offCtx = offscreen.getContext("2d");
  if (!offCtx) return;

  applyColorway(offCtx, tint, renderWidth, renderHeight);

  offCtx.globalCompositeOperation = "destination-in";
  offCtx.drawImage(mask, 0, 0, renderWidth, renderHeight);

  ctx.save();
  ctx.globalAlpha = layer.opacity ?? 1;
  if (layer.blendMode) {
    ctx.globalCompositeOperation = layer.blendMode;
  }
  ctx.drawImage(offscreen, 0, 0);
  ctx.restore();
};

const drawLayer = async (
  ctx: CanvasRenderingContext2D,
  layer: SelectedLayer,
  renderWidth: number,
  renderHeight: number,
  gatewayBase?: string,
) => {
  if (layer.variant.format === "svg-gradient") {
    await drawGradientLayer(ctx, layer, renderWidth, renderHeight, gatewayBase);
    return;
  }

  await drawPngLikeLayer(ctx, layer, renderWidth, renderHeight, gatewayBase);
};

const createCanvas = (width: number, height: number, pixelRatio: number) => {
  const canvas = document.createElement("canvas");
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to initialize 2D context for NFT generator.");
  }
  ctx.scale(pixelRatio, pixelRatio);
  return { canvas, ctx };
};

export const renderTeaImage = async (
  layers: SelectedLayer[],
  options: RenderOptions,
): Promise<RenderResult> => {
  const pixelRatio = options.pixelRatio ?? window.devicePixelRatio ?? 1;
  const { canvas, ctx } = createCanvas(options.width, options.height, pixelRatio);

  ctx.clearRect(0, 0, options.width, options.height);
  if (options.background) {
    applyColorway(ctx, options.background, options.width, options.height);
  }

  const sortedLayers = [...layers].sort((a, b) => a.order - b.order);
  for (const layer of sortedLayers) {
    await drawLayer(ctx, layer, options.width, options.height, options.gatewayBaseUrl);
  }

  const dataUrl = canvas.toDataURL("image/png");
  let blob: Blob | undefined;

  if (options.withBlob) {
    blob = await new Promise<Blob | undefined>((resolve) => {
      canvas.toBlob((value) => resolve(value ?? undefined), "image/png");
    });
  }

  return { canvas, blob, dataUrl };
};


