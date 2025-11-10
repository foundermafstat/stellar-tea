"use client";

/**
 * A typed wrapper around localStorage adapted for environments where
 * window/localStorage may be unavailable (e.g. during Next.js SSR).
 */
type Schema = {
  walletId: string;
  walletAddress: string;
  walletNetwork: string;
  networkPassphrase: string;
};

const isBrowser = typeof window !== "undefined";

class TypedStorage<T> {
  private readonly storage: Storage | null;

  constructor() {
    this.storage = isBrowser ? window.localStorage : null;
  }

  public get length(): number {
    return this.storage?.length ?? 0;
  }

  public key<U extends keyof T>(index: number): U | null {
    return (this.storage?.key(index) as U | null) ?? null;
  }

  public getItem<U extends keyof T>(
    key: U,
    retrievalMode: "fail" | "raw" | "safe" = "fail",
  ): T[U] | null {
    if (!this.storage) return null;
    const item = this.storage.getItem(key.toString());

    if (item == null) {
      return item;
    }

    try {
      return JSON.parse(item) as T[U];
    } catch (error) {
      switch (retrievalMode) {
        case "safe":
          return null;
        case "raw":
          return item as unknown as T[U];
        default:
          throw error;
      }
    }
  }

  public setItem<U extends keyof T>(key: U, value: T[U]): void {
    if (!this.storage) return;
    this.storage.setItem(key.toString(), JSON.stringify(value));
  }

  public removeItem<U extends keyof T>(key: U): void {
    if (!this.storage) return;
    this.storage.removeItem(key.toString());
  }

  public clear(): void {
    if (!this.storage) return;
    this.storage.clear();
  }
}

const storage = new TypedStorage<Schema>();

export default storage;
