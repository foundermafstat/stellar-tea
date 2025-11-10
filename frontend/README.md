## Stellar Tea Frontend

Generative NFT tooling for the Stellar Tea experience is implemented in this app:

- NFT layer manifest loading from IPFS
- Browser-side compositing of PNG layers and gradient overlays
- IPFS uploads (Filebase) for rendered PNG + JSON metadata
- Fusion helpers for mixing teas and minting through the Soroban contracts

## Requirements

- Node 20+
- pnpm 8+ (`corepack enable pnpm`)
- Installed workspace dependencies (`pnpm install`)

## Environment Variables

Create `.env.local` in `frontend/` with:

```bash
# Soroban / IPFS
NEXT_PUBLIC_TEA_LAYERS_MANIFEST_CID=<CID with layers manifest JSON>
NEXT_PUBLIC_IPFS_API_KEY=<Filebase basic token, e.g. MTJ...>
NEXT_PUBLIC_IPFS_API_ENDPOINT=https://ipfs.filebase.io/api/v1   # optional override
NEXT_PUBLIC_IPFS_GATEWAY_URL=https://ipfs.filebase.io           # optional override
```

The manifest JSON must match the `LayersManifest` shape defined in `src/lib/nft/schema.ts`.

## Commands

```bash
pnpm dev       # start the Next.js dev server
pnpm lint      # eslint check
pnpm test      # vitest unit tests for fusion helpers
```

## Generative Workflow

1. Upload layer PNG/SVG assets to IPFS (Filebase recommended).
2. Publish a manifest (CID referenced by `NEXT_PUBLIC_TEA_LAYERS_MANIFEST_CID`).
3. Use `/mint` to:
   - select layers
   - tweak gradients and traits
   - preview the rendered PNG
   - upload PNG + metadata JSON to IPFS
4. Consume the upload results with the Soroban contracts (`tea-nft` / `tea-game`) for minting or mixing.

## Project Structure

- `src/lib/nft/schema.ts` – metadata schema + builder helpers.
- `src/lib/nft/generator.ts` – canvas renderer for layers and gradients.
- `src/lib/nft/fusion-helpers.ts` – pure color/stat lineage helpers (tested).
- `src/lib/nft/fusion.ts` – full fusion pipeline, including Soroban mint call.
- `src/lib/ipfs/client.ts` – Filebase IPFS uploads (Blob + JSON).
- `src/app/mint/page.tsx` – UI for composing and uploading NFTs.

## Tests

Unit tests use [Vitest](https://vitest.dev). Run `pnpm test` to validate color blending, lineage, and metadata helpers. The suite does not touch the DOM.

