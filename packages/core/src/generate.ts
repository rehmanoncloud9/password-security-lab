/** Local cryptographic password generation using the platform Web Crypto source. */

export type GeneratorOptions =
  | {
      readonly mode: "random";
      readonly length: number;
      readonly lowercase?: boolean;
      readonly uppercase?: boolean;
      readonly numbers?: boolean;
      readonly symbols?: boolean;
      readonly excludeAmbiguous?: boolean;
    }
  | {
      readonly mode: "passphrase";
      readonly wordCount: number;
      readonly separator?: "-" | "_" | "." | " ";
    };

export interface GeneratedPassword {
  /** Plaintext is returned only because this function generates it; callers must not persist it. */
  readonly password: string;
  readonly mode: GeneratorOptions["mode"];
  readonly theoreticalSelectionBits: number;
  readonly source: string;
}

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!#$%&()*+,-./:;<=>?@[]^_{|}~";
const AMBIGUOUS = new Set(["i", "l", "o", "I", "L", "O", "0", "1"]);

// Curated for this educational generator; this list is not a standardized Diceware list.
const WORDS = [
  "acorn", "alder", "amber", "anchor", "apricot", "arcade", "arch", "arctic",
  "arrow", "artist", "ash", "atlas", "autumn", "badger", "bamboo", "barley",
  "basin", "beacon", "beaver", "birch", "bison", "bluebird", "blossom", "boulder",
  "breeze", "brook", "cabin", "cactus", "candle", "canvas", "caravan", "cedar",
  "celery", "cello", "cherry", "cinder", "citron", "clover", "comet", "copper",
  "coral", "cosmos", "cricket", "crystal", "dahlia", "dawn", "delta", "desert",
  "dolphin", "dove", "dragon", "drizzle", "drum", "eagle", "earth", "echo",
  "elm", "ember", "emerald", "falcon", "fern", "fiddle", "finch", "fjord",
  "flame", "flannel", "flint", "flower", "forest", "fossil", "fox", "frost",
  "galaxy", "garden", "garlic", "gazelle", "gecko", "glacier", "globe", "goblet",
  "granite", "grape", "harbor", "hazel", "heron", "honey", "horizon", "igloo",
  "indigo", "island", "ivory", "jasmine", "jigsaw", "juniper", "kettle", "kiwi",
  "lantern", "lava", "lemon", "lilac", "lotus", "maple", "marble", "meadow",
  "meteor", "mint", "mist", "monarch", "mosaic", "moss", "mountain", "nectar",
  "north", "oasis", "ocean", "olive", "onyx", "orbit", "orchard", "otter",
  "owl", "paddle", "palm", "panda", "papaya", "pebble", "pepper", "petal",
  "phoenix", "pine", "planet", "plum", "pocket", "prairie", "quartz", "rabbit",
  "rainbow", "raven", "river", "robin", "rocket", "saffron", "sailor", "sandal",
  "scarlet", "seagull", "shadow", "silver", "snow", "sparrow", "sphinx", "spruce",
  "squirrel", "star", "stone", "summit", "sunrise", "thistle", "thunder", "tiger",
  "timber", "topaz", "tulip", "tundra", "valley", "velvet", "violet", "walnut",
  "waterfall", "willow", "wind", "winter", "woodland", "zephyr", "zinnia", "zodiac",
] as const;

function secureIndex(size: number): number {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi || typeof cryptoApi.getRandomValues !== "function") {
    throw new Error("A cryptographically secure random source is unavailable in this runtime.");
  }
  if (!Number.isInteger(size) || size < 1 || size > 256) {
    throw new RangeError("Random selection size must be between 1 and 256.");
  }
  const acceptanceLimit = Math.floor(256 / size) * size;
  while (true) {
    const sample = cryptoApi.getRandomValues(new Uint8Array(1))[0];
    if (sample !== undefined && sample < acceptanceLimit) return sample % size;
  }
}

function characterAlphabet(options: Extract<GeneratorOptions, { mode: "random" }>): string {
  const pools = [
    options.lowercase === false ? "" : LOWER,
    options.uppercase === false ? "" : UPPER,
    options.numbers === false ? "" : NUMBERS,
    options.symbols === false ? "" : SYMBOLS,
  ].filter((pool) => pool.length > 0);
  const selected = pools.join("");
  const filtered = options.excludeAmbiguous
    ? Array.from(selected).filter((character) => !AMBIGUOUS.has(character)).join("")
    : selected;
  const alphabet = [...new Set(filtered)].join("");
  if (!alphabet) throw new RangeError("Select at least one non-empty character set.");
  return alphabet;
}

/** Generate a password with Web Crypto and rejection sampling; never uses Math.random. */
export function generatePassword(options: GeneratorOptions): GeneratedPassword {
  if (options.mode === "random") {
    if (!Number.isInteger(options.length) || options.length < 8 || options.length > 128) {
      throw new RangeError("Random password length must be an integer from 8 through 128.");
    }
    const alphabet = characterAlphabet(options);
    if (alphabet.length < 2 || alphabet.length > 256) {
      throw new RangeError("The selected character set must contain between 2 and 256 characters.");
    }
    const characters = Array.from({ length: options.length }, () => alphabet[secureIndex(alphabet.length)]!);
    return {
      password: characters.slice(0, options.length).join(""),
      mode: "random",
      theoreticalSelectionBits: options.length * Math.log2(alphabet.length),
      source: `Uniform selection from ${alphabet.length} characters using Web Crypto`,
    };
  }

  if (!Number.isInteger(options.wordCount) || options.wordCount < 4 || options.wordCount > 20) {
    throw new RangeError("Passphrase word count must be an integer from 4 through 20.");
  }
  const words = Array.from({ length: options.wordCount }, () => WORDS[secureIndex(WORDS.length)]!);
  return {
    password: words.join(options.separator ?? "-"),
    mode: "passphrase",
    theoreticalSelectionBits: options.wordCount * Math.log2(WORDS.length),
    source: `Independent uniform choices with replacement from a locally curated ${WORDS.length}-word educational list`,
  };
}

/** Number of entries in the generator's locally curated educational passphrase list. */
export const PASSPHRASE_WORD_COUNT = WORDS.length;
