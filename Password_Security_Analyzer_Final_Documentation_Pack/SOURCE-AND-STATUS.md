# Source and status note

This documentation package was prepared using the uploaded Project Overview / Abstract PDF and the existing ZIP containing the prior PRD and Technical Plan.

The prior project documents already proposed a React/TypeScript core, a separate local Python lab API, policy presets, reuse demonstration, hashing laboratory, synthetic-only attack simulation, and benchmark reporting. This package preserves that architecture and strengthens the product requirements, privacy boundaries, release gates, threat model, acceptance criteria and open decisions.

This is a product baseline, not proof that features have been implemented. The team must reconcile every requirement with the actual repository and mark implementation status honestly.

External standards reviewed:
- NIST SP 800-63B-4 (July 2025): https://pages.nist.gov/800-63-4/sp800-63b.html
- OWASP Password Storage Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- Have I Been Pwned API documentation: https://haveibeenpwned.com/api/v3

Key standards decisions:
- Modern NIST guidance disallows composition requirements and requires a 15-character minimum for single-factor passwords; a minimum of 8 may be allowed where the password is only used as part of MFA. It also recommends permitting at least 64 characters.
- OWASP's current password-storage guidance provides parameter baselines for Argon2id, bcrypt and PBKDF2. Parameters must be benchmarked on the target environment and rechecked at release time.
- HIBP Pwned Passwords range search uses a five-character hash prefix; the full hash is matched locally.
