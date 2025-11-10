import type { NextConfig } from "next";

const defaultGateway = "https://ipfs.filebase.io";

type RemotePattern = {
  protocol: "http" | "https";
  hostname: string;
};

const remotePatterns: RemotePattern[] = [];

const appendPattern = (pattern: RemotePattern) => {
  if (!remotePatterns.some((entry) => entry.hostname === pattern.hostname && entry.protocol === pattern.protocol)) {
    remotePatterns.push(pattern);
  }
};

appendPattern({
  protocol: "https",
  hostname: new URL(defaultGateway).hostname,
});

const envGateway = process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL;
if (envGateway) {
  try {
    const parsed = new URL(envGateway);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      appendPattern({
        protocol: parsed.protocol.replace(":", "") as RemotePattern["protocol"],
        hostname: parsed.hostname,
      });
    }
  } catch (error) {
    console.warn("Failed to parse NEXT_PUBLIC_IPFS_GATEWAY_URL for image config:", error);
  }
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns,
  },
};

export default nextConfig;
