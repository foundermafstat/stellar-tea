"use client";

import { FLAVOR_SWATCHES, type FlavorSwatch } from "@/lib/nft/flavors";
import type { SelectedLayer } from "@/lib/nft/generator";
import type { TeaColorway } from "@/lib/nft/schema";

const BASE_PATH = "/nft/generate";

const randomFromRange = (start: number, end: number) => {
  const span = end - start + 1;
  return start + Math.floor(Math.random() * span);
};

const pad = (value: number) => value.toString().padStart(4, "0");

const pickRandomFlavor = (): FlavorSwatch =>
  FLAVOR_SWATCHES[Math.floor(Math.random() * FLAVOR_SWATCHES.length)];

const pickSecondFlavor = (primary: FlavorSwatch): FlavorSwatch => {
  let candidate = pickRandomFlavor();
  let attempts = 0;
  while (candidate.id === primary.id && attempts < 5) {
    candidate = pickRandomFlavor();
    attempts += 1;
  }
  return candidate;
};

const createColorway = (
  options: { forceSolid?: boolean } = {},
): { colorway: TeaColorway; flavors: [FlavorSwatch, FlavorSwatch] } => {
  const { forceSolid = false } = options;
  const primary = pickRandomFlavor();
  const secondary = forceSolid ? primary : pickSecondFlavor(primary);
  const useGradient = forceSolid ? false : Math.random() > 0.4;

  if (!useGradient) {
    return {
      colorway: {
        mode: "solid",
        color: primary.hex,
      },
      flavors: [primary, primary],
    };
  }

  return {
    colorway: {
      mode: "linear-gradient",
      angleDeg: 225,
      stops: [
        { offset: 0, color: primary.hex },
        { offset: 1, color: secondary.hex },
      ],
    },
    flavors: [primary, secondary],
  };
};

const createVariant = (id: string, label: string, format: "png" | "svg-gradient" | "svg-mask") => ({
  id,
  label,
  assetCid: id,
  format,
});

export const generateLocalLayers = (options: { forceSolid?: boolean } = {}) => {
  const { colorway, flavors } = createColorway(options);

  const topBaseIndex = randomFromRange(1, 9);
  const topperIndex = randomFromRange(20, 29);

  const layers: SelectedLayer[] = [
    {
      categoryId: "base-foreground",
      order: 0,
      variant: createVariant(
        `${BASE_PATH}/${pad(topBaseIndex)}.png`,
        `Base ${pad(topBaseIndex)}`,
        "png",
      ),
    },
    {
      categoryId: "gradient-fill",
      order: 1,
      variant: createVariant(`${BASE_PATH}/0010.svg`, "Gradient mask", "svg-gradient"),
      tint: colorway,
    },
    {
      categoryId: "mid-topper",
      order: 2,
      variant: createVariant(
        `${BASE_PATH}/${pad(topperIndex)}.png`,
        `Topper ${pad(topperIndex)}`,
        "png",
      ),
    },
    {
      categoryId: "glass-frame",
      order: 3,
      variant: createVariant(`${BASE_PATH}/0030.png`, "Glass Frame", "png"),
    },
    {
      categoryId: "highlights",
      order: 4,
      variant: createVariant(`${BASE_PATH}/0040.png`, "Highlights", "png"),
    },
  ];

  return { layers, colorway, flavors };
};


