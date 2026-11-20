import type { ExposureCheckState } from "../types.js";

export interface HibpCheckOptions {
  readonly userConsented: boolean;
  readonly fetchFn?: typeof fetch;
  readonly timeoutMs?: number;
}

export interface HibpCheckResult {
  readonly state: ExposureCheckState;
  readonly breachCount?: number;
  readonly message: string;
  readonly prefixSent?: string;
}

/**
 * Compute uppercase SHA-1 hexadecimal digest using standard Web Crypto.
 */
async function sha1Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.subtle && typeof cryptoApi.subtle.digest === "function") {
    const hashBuffer = await cryptoApi.subtle.digest("SHA-1", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  }
  throw new Error("SHA-1 cryptographic digest (crypto.subtle.digest) is unavailable in this environment.");
}

/**
 * Query Have I Been Pwned Pwned Passwords range API using the k-anonymity protocol.
 * Only runs if userConsented is explicitly true.
 * Computes SHA-1 locally and transmits only the first 5 hexadecimal characters.
 * Matches returned suffixes locally.
 */
export async function checkExposureHibp(
  password: string,
  options: HibpCheckOptions,
): Promise<HibpCheckResult> {
  if (!options.userConsented) {
    return {
      state: "not_checked",
      message: "External breach range check is disabled by default and requires explicit user consent.",
    };
  }

  if (typeof password !== "string" || password.length === 0) {
    return {
      state: "not_checked",
      message: "Empty input not checked against breach service.",
    };
  }

  const fetchClient = options.fetchFn ?? globalThis.fetch;
  if (typeof fetchClient !== "function") {
    return {
      state: "unavailable",
      message: "Network fetch client is unavailable in this runtime.",
    };
  }

  let fullHash: string;
  try {
    fullHash = await sha1Hex(password);
  } catch (err) {
    return {
      state: "unavailable",
      message: err instanceof Error ? err.message : "Failed to calculate SHA-1 digest.",
    };
  }

  const prefix = fullHash.slice(0, 5);
  const suffix = fullHash.slice(5);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs ?? 5000);

  try {
    const response = await fetchClient(`https://api.pwnedpasswords.com/range/${prefix}`, {
      method: "GET",
      headers: {
        "Add-Padding": "true", // Mitigate response-size side-channel leaks
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        state: "unavailable",
        message: `Breach service returned HTTP ${response.status}.`,
        prefixSent: prefix,
      };
    }

    const text = await response.text();
    const lines = text.split("\r\n").flatMap((line) => line.split("\n"));

    let foundCount = 0;
    for (const line of lines) {
      const [entrySuffix, countStr] = line.split(":");
      if (entrySuffix?.trim().toUpperCase() === suffix) {
        foundCount = parseInt(countStr?.trim() || "0", 10);
        break;
      }
    }

    if (foundCount > 0) {
      return {
        state: "found_in_provider_corpus",
        breachCount: foundCount,
        message: `Found ${foundCount.toLocaleString()} occurrence(s) in the Have I Been Pwned breach corpus.`,
        prefixSent: prefix,
      };
    }

    return {
      state: "not_found_in_provider_corpus",
      breachCount: 0,
      message: "Not found in the Have I Been Pwned database for this hash prefix range.",
      prefixSent: prefix,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    return {
      state: "unavailable",
      message: err instanceof Error ? `Breach service request failed: ${err.message}` : "Breach service network error.",
      prefixSent: prefix,
    };
  }
}
