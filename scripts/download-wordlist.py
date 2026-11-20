import urllib.request
import json
import hashlib

url = "https://www.eff.org/files/2016/07/18/eff_large_wordlist.txt"
req = urllib.request.urlopen(url)
raw = req.read()
sha256 = hashlib.sha256(raw).hexdigest()

lines = raw.decode("utf-8").strip().split("\n")
words = [line.split("\t")[1].strip() for line in lines]
assert len(words) == 7776, f"Expected 7776 words, got {len(words)}"
assert len(set(words)) == 7776, "Duplicate words found"

content = f"""/**
 * Electronic Frontier Foundation (EFF) Large Wordlist for Passphrases.
 * Sourced: 2016-07-18 from https://www.eff.org/files/2016/07/18/eff_large_wordlist.txt
 * License: CC-BY-3.0-US (Electronic Frontier Foundation / Joseph Bonneau)
 * SHA-256: {sha256}
 * Count: {len(words)} distinct entries (6^5)
 */

export const WORDLIST_METADATA = {{
  name: "EFF Large Wordlist",
  version: "2016-07-18",
  license: "CC-BY-3.0-US",
  source: "{url}",
  sha256: "{sha256}",
  size: {len(words)},
  bitsPerWord: Math.log2({len(words)}),
}} as const;

export const EFF_LARGE_WORDLIST: readonly string[] = {json.dumps(words, indent=2)} as const;
"""

with open("packages/core/src/wordlist.ts", "w", encoding="utf-8") as f:
    f.write(content)

print(f"Generated packages/core/src/wordlist.ts with {len(words)} words. SHA-256: {sha256}")
