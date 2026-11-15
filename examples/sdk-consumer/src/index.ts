import { analyzePassword, analyzeReuse, evaluatePolicy } from "@psa/core";

// This value is deliberately synthetic. Never replace it with a real credential.
const example = "harbor violet maple 47";
const analysis = analyzePassword(example);
const policy = evaluatePolicy(example, "modern_single_factor");
const reuse = analyzeReuse(["harbor violet maple 47", "harbor violet maple 48"]);

// The API results contain findings and indexes, never the input string.
console.log(JSON.stringify({ analysis, policy, reuse }, null, 2));
