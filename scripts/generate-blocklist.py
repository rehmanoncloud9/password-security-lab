import json
import hashlib
import os

with open("node_modules/@zxcvbn-ts/language-common/src/passwords.json", "r", encoding="utf-8") as f:
    passwords = json.load(f)

top1000 = passwords[:1000]
raw = json.dumps(top1000).encode("utf-8")
sha256 = hashlib.sha256(raw).hexdigest()

os.makedirs("packages/core/src/blocklist", exist_ok=True)

content = f"""/**
 * Top 1,000 Common Passwords Blocklist for local screening.
 * Provenance: Derived from zxcvbn common password corpus / SecLists top passwords.
 * License: MIT
 * SHA-256: {sha256}
 * Total entries: {len(top1000)}
 */

export const BLOCKLIST_METADATA = {{
  name: "Local Top 1,000 Common Passwords",
  version: "1.0.0",
  license: "MIT",
  sha256: "{sha256}",
  count: {len(top1000)},
}} as const;

export const COMMON_PASSWORDS_1000: readonly string[] = {json.dumps(top1000, indent=2)} as const;
"""

with open("packages/core/src/blocklist/data.ts", "w", encoding="utf-8") as f:
    f.write(content)

print(f"Generated packages/core/src/blocklist/data.ts: {len(top1000)} entries. SHA-256: {sha256}")
