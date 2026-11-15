# Data Flow

## Browser analysis

1. The analysis input is held in React component memory.
2. `analyzePassword` passes it to local zxcvbn-ts; `evaluatePolicy` and `analyzeReuse`
   operate locally when those modules are selected. Password generation uses the
   browser Web Crypto API.
3. Analysis and reuse results contain findings/indexes and feedback, not the original
   password or matched token.
4. The core makes no request to the Python API or an external endpoint. The only
   intended local storage value is the color theme key `psl-theme`; no password or
   generated value is persisted by the app.
5. Clearing/resetting drops values from React state. Managed-language memory erasure
   is not guaranteed.

The browser also polls health from `http://127.0.0.1:8000/lab/health` while the
application is open. Health requests contain no candidate data and are not triggered
by typing.

## Reuse comparison

The sample fields remain in component memory only (the UI permits up to 20 entries).
On Compare, values are passed to `analyzeReuse`. Results contain indexes, similarity
percentages, and explanations, never values. Clear empties fields and result state.
No values are submitted to Python.

## Storage lab

After the user submits the separate synthetic lab field, the browser sends a JSON body to `POST /lab/hash`. The API creates a verifier and keeps verifier metadata in process memory under a random short-lived ID. The API returns the encoded verifier, algorithm parameters, salt metadata, and measured generation time. The browser submits a verify candidate and verifier ID to `POST /lab/verify`; neither value appears in a URL. Clear removes browser state and calls `DELETE /lab/hash/{id}`.

The API never logs request bodies. Input-validation errors omit Pydantic's `input` fields, so rejected bodies cannot be reflected into the response.

## Attack lab

The browser sends an experiment type, a fixed internal synthetic target ID,
allowlisted algorithm, and bounded settings. Python selects its in-code fixture,
creates the verifier internally, and checks candidates in deterministic order. Job
status contains state, attempts, elapsed time, measured candidate time/throughput,
settings, and whether a match occurred. It never includes target or candidate
plaintext. DELETE sets a cancellation event; the worker checks it between bounded
KDF operations.

## Measurements and exports

`POST /lab/benchmarks` (and `/lab/benchmark`) runs one warm-up and five actual
hash/verify operations per algorithm on a fixed educational sample held only by the
API. Responses include timings and environment details. The UI's JSON/CSV exports
use allowlisted measurement/result fields; they contain no entered sample or verifier.

## Exposure screening

Not implemented. The current UI displays `not checked` and does not transmit a password or hash prefix.
