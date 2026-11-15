# SDK Guide

The reusable SDK is the `@psa/core` workspace package. It exports `analyzePassword`, `evaluatePolicy`, `analyzeReuse`, result types, and `InputLimitError`. It has no React or Python dependency and intentionally has no attack/hash API.

```ts
import { analyzePassword, evaluatePolicy } from "@psa/core";

// Keep this synthetic. Avoid analytics, logs, or persistence for real integration inputs.
const result = analyzePassword("harbor violet maple 47");
const policy = evaluatePolicy("harbor violet maple 47", "modern_single_factor");
renderFeedback(result, policy);
```

The result omits the input. `analyzePassword` and policy evaluation accept up to 256 Unicode code points; reuse accepts up to 20 values of at most 128 code points. Inputs over the limit throw `InputLimitError` rather than being truncated.

`examples/sdk-consumer/` is the non-React integration sample. It is source-complete but not yet built because npm dependencies were unavailable locally. Do not publish this package without explicit authorization, a generated lockfile, package/data license review, CI, and stable API review.
