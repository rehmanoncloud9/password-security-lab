# Privacy Verification

## Data flows reviewed

| Data | Intended handling | Evidence/status |
|---|---|---|
| Analyzer input | Passed to TypeScript core locally; absent from result shape | Source boundary lint passed; browser network canary NOT RUN |
| Policy/reuse samples | Evaluated locally/in memory and cleared by reset/session cleanup | Source inspection only; no browser lifecycle run |
| Generated password | Produced locally with Web Crypto; returned to caller for immediate display/copy | Generator test source exists; tests/browser clipboard journey NOT RUN |
| Theme choice | `psl-theme` only in local storage | Preferences source reviewed and boundary lint passed; browser storage inspection NOT RUN |
| Hashing lab input | Explicitly submitted to fixed loopback API on user action; not returned in result/history | Python API tests cover secret-safe validation; browser network/console inspection NOT RUN |
| Attack targets | Fixed target ID sent; target secret remains internal to API | API schema/tests restrict choices; no arbitrary credential/hash import route exists |
| Benchmark and report | Actual measurement fields and safe result summaries only | Python measurement tests pass; browser export inspection NOT RUN |

## Verification performed

- `npm run lint` passed and inspected seven core and fourteen web source files for
  network/persistence boundary rules. It permits local storage only in the theme
  preference helper and verifies the designated theme key.
- Python API tests exercise body size, strict fields, disallowed Host/Origin, and
  sanitized validation response behavior. The route launcher disables access-body
  logging; the app has no analytics or telemetry service.
- Python API suite passed 49 behavior tests (latest run: 2026-11-15, 38.22 seconds).

## Not verified

No browser runtime was available because npm packages could not be installed. Thus
we did not capture network traffic while entering a synthetic analyzer value; inspect
console output, URLs, local/session storage, clipboard behavior, or exported files in
a rendered app. No live web-server proxy configuration or extension interference
was tested. Do not report browser privacy acceptance as complete until these checks
are run.

The test procedure and evidence status are listed in [UI Verification](UI-VERIFICATION.md)
and [Test Results](TEST-RESULTS.md).
