import { NextRequest, NextResponse } from "next/server";

import { horizonUrl } from "@/lib/stellarConfig";

export const dynamic = "force-dynamic";

const normalizeUrl = (base: string) => base.replace(/\/$/, "");

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");

  if (!address) {
    return NextResponse.json(
      { error: "Wallet address is required." },
      { status: 400 },
    );
  }

  const target = `${normalizeUrl(horizonUrl)}/accounts/${address}`;

  try {
    const response = await fetch(target, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text();
      const message = body || response.statusText || "Unknown Horizon error.";
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const data = (await response.json()) as { balances?: unknown };
    return NextResponse.json({ balances: data.balances ?? [] });
  } catch (error) {
    console.error("Horizon balance proxy error", error);
    return NextResponse.json(
      { error: "Failed to reach Horizon server." },
      { status: 502 },
    );
  }
}
