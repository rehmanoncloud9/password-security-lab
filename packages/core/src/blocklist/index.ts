import { BLOCKLIST_METADATA, COMMON_PASSWORDS_1000 } from "./data.js";
import type { BlocklistCheckState } from "../types.js";

export { BLOCKLIST_METADATA, COMMON_PASSWORDS_1000 };

const EXACT_SET = new Set<string>(COMMON_PASSWORDS_1000);
const LOWER_SET = new Set<string>(COMMON_PASSWORDS_1000.map((w) => w.toLowerCase()));

export interface BlocklistResult {
  readonly state: BlocklistCheckState;
  readonly message: string;
  readonly metadata: typeof BLOCKLIST_METADATA;
}

/**
 * Screen candidate against the bundled local common-password blocklist.
 * Evaluates the candidate as a complete whole value.
 * Never echoes the matched token in the output result.
 */
export function checkLocalBlocklist(password: string): BlocklistResult {
  if (typeof password !== "string") {
    throw new TypeError("Password input must be a string.");
  }

  if (password.length === 0) {
    return {
      state: "not_found_in_local_list",
      message: "Empty input not found in local blocklist.",
      metadata: BLOCKLIST_METADATA,
    };
  }

  const isExactMatch = EXACT_SET.has(password);
  const isLowerMatch = !isExactMatch && LOWER_SET.has(password.toLowerCase());

  if (isExactMatch || isLowerMatch) {
    return {
      state: "found_in_local_list",
      message: "The complete entry matches a known record in the bundled common blocklist.",
      metadata: BLOCKLIST_METADATA,
    };
  }

  return {
    state: "not_found_in_local_list",
    message: "Not found in this local common blocklist. This check only tests against the bundled high-frequency list and is not proof that the value has never appeared in a data breach.",
    metadata: BLOCKLIST_METADATA,
  };
}
