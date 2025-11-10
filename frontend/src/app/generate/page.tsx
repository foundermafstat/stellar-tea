"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { renderTeaImage, type RenderResult } from "@/lib/nft/generator";
import { generateLocalLayers } from "@/lib/nft/generateLocal";
import type { TeaColorway } from "@/lib/nft/schema";

const WIDTH = 485;
const HEIGHT = 1000;

const flavorNames = (flavors: [unknown, unknown]) =>
  flavors.map((flavor) => (typeof flavor === "object" && flavor && "name" in flavor ? flavor.name : "—"));

const describeColorway = (colorway: TeaColorway) => {
  switch (colorway.mode) {
    case "solid":
      return `Solid ${colorway.color}`;
    case "linear-gradient":
      return `Gradient ${colorway.stops[0].color} → ${colorway.stops[colorway.stops.length - 1].color}`;
    case "radial-gradient":
      return `Radial ${colorway.stops[0].color} → ${colorway.stops[colorway.stops.length - 1].color}`;
    default:
      return "Custom";
  }
};

const GeneratePage = () => {
  const [renderResult, setRenderResult] = useState<RenderResult | null>(null);
  const [colorway, setColorway] = useState<TeaColorway | null>(null);
  const [flavors, setFlavors] = useState<[string, string]>(["—", "—"]);
  const [isRendering, setIsRendering] = useState(false);

  const compose = useCallback(async () => {
    setIsRendering(true);
    try {
      const { layers, colorway: generatedColorway, flavors: pickedFlavors } =
        generateLocalLayers();
      setColorway(generatedColorway);
      setFlavors(flavorNames(pickedFlavors) as [string, string]);
      const result = await renderTeaImage(layers, {
        width: WIDTH,
        height: HEIGHT,
        background: undefined,
        withBlob: true,
      });
      setRenderResult(result);
    } catch (error) {
      console.error(error);
      toast({
        title: "Generation error",
        description:
          error instanceof Error ? error.message : "Failed to compose local NFT preview.",
      });
    } finally {
      setIsRendering(false);
    }
  }, []);

  useEffect(() => {
    void compose();
  }, [compose]);

  const downloadLink = useMemo(() => {
    if (!renderResult?.blob) return null;
    return URL.createObjectURL(renderResult.blob);
  }, [renderResult]);

  useEffect(() => {
    return () => {
      if (downloadLink) {
        URL.revokeObjectURL(downloadLink);
      }
    };
  }, [downloadLink]);

  return (
    <main className="relative min-h-screen bg-gradient-to-b from-[#f6f1ff] to-[#fff] pb-24 pt-16">
      <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,_rgba(157,129,255,0.25),_transparent_70%)]" />
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 px-6">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-purple-500 shadow-[0_12px_32px_rgba(189,140,255,0.18)]">
            Generative Preview
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-800 md:text-4xl">
              Local layer compositing (485×1000 PNG)
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 md:text-base">
              Randomises the five-layer stack from <code>public/nft/generate</code>, applies a solid
              colour or diagonal gradient to the SVG mask, and renders a transparent PNG suitable
              for minting.
            </p>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[0.7fr_0.3fr]">
          <div className="flex flex-col gap-5">
            <div className="relative flex aspect-[485/1000] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/70 bg-white/80 shadow-[0_30px_80px_rgba(189,140,255,0.22)]">
              {renderResult ? (
                <Image
                  src={renderResult.dataUrl}
                  alt="Generated NFT preview"
                  width={WIDTH}
                  height={HEIGHT}
                  unoptimized
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-sm text-slate-500">
                  {isRendering ? "Generating…" : "Click generate to preview"}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="candy"
                onClick={() => compose()}
                disabled={isRendering}
                className="rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em]"
              >
                {isRendering ? "Rendering…" : "Generate new"}
              </Button>
              {renderResult?.blob && downloadLink ? (
                <a
                  href={downloadLink}
                  download="stellar-tea-preview.png"
                  className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-5 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-purple-600 shadow-[0_12px_32px_rgba(189,140,255,0.18)] transition hover:bg-purple-100"
                >
                  Download PNG
                </a>
              ) : null}
            </div>
          </div>
          <aside className="space-y-4 rounded-3xl border border-white/60 bg-white/90 p-6 shadow-[0_28px_75px_rgba(189,140,255,0.2)]">
            <h2 className="text-lg font-semibold text-slate-700">Layer stack</h2>
            <ol className="space-y-2 text-sm text-slate-600">
              <li>1. Random base (`0001-0009.png`)</li>
              <li>2. SVG mask (`0010.svg`) tinted solid or gradient (↘ direction)</li>
              <li>3. Random topping (`0020-0029.png`)</li>
              <li>4. Glass frame (`0030.png`)</li>
              <li>5. Highlights (`0040.png`)</li>
            </ol>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-xs text-slate-500">
              <p className="font-semibold text-slate-600">Current colourway</p>
              <p className="mt-1">
                {colorway ? describeColorway(colorway) : "—"}
              </p>
              {colorway?.mode === "linear-gradient" && (
                <div className="mt-3 flex gap-2">
                  {colorway.stops.map((stop) => (
                    <span
                      key={`${stop.offset}-${stop.color}`}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-white shadow"
                      style={{ background: stop.color }}
                      title={stop.color}
                    />
                  ))}
                </div>
              )}
              {colorway?.mode === "solid" && (
                <div className="mt-3 h-6 w-6 rounded-full border border-white shadow"
                  style={{ background: colorway.color }}
                  title={colorway.color}
                />
              )}
              <div className="mt-3 text-xs text-slate-500">
                Flavor pairing: {flavors[0]}
                {flavors[1] && flavors[1] !== flavors[0] ? ` × ${flavors[1]}` : ""}
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Output is transparent by default. Use the download action to inspect the raw PNG.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
};

export default GeneratePage;


