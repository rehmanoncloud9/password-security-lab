import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import * as common from "@zxcvbn-ts/language-common";
import * as english from "@zxcvbn-ts/language-en";

const estimator = new ZxcvbnFactory({
  translations: english.translations,
  graphs: common.adjacencyGraphs,
  dictionary: { ...common.dictionary, ...english.dictionary },
  maxLength: 256,
});

export const ESTIMATOR_VERSION = "4.2.0" as const;
export const MAX_PASSWORD_CODE_POINTS = 256;
export { estimator };
