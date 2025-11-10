"use client";

import { FLAVOR_SWATCHES, type FlavorSwatch } from "@/lib/nft/flavors";

export interface FlavorTemplate {
  swatch: FlavorSwatch;
  name: string;
  infusion: string;
  flavorProfile: string;
  rarity: string;
  description: string;
}

export const getFlavorById = (id: string) =>
  FLAVOR_SWATCHES.find((swatch) => swatch.id === id);

export const getDefaultFlavor = () => FLAVOR_SWATCHES[0];

export const getRandomFlavor = () =>
  FLAVOR_SWATCHES[Math.floor(Math.random() * FLAVOR_SWATCHES.length)];

export const buildFlavorTemplate = (
  swatch: FlavorSwatch,
  seed: string,
  rarity: string = "Common",
): FlavorTemplate => {
  const suffix = seed.slice(0, 6).toUpperCase();
  return {
    swatch,
    name: `${swatch.name} Brew #${suffix}`,
    infusion: `${swatch.name} Infusion`,
    flavorProfile: swatch.name,
    rarity,
    description: `A ${swatch.description.toLowerCase()} Crafted for the Stellar Tea collection.`,
  };
};


