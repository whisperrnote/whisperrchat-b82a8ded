# WhisperrChat Project Guidelines
System & Contributor Handbook for Humans, Automated Tools, and AI Agents

Version: 1.0.0 (Living Document)  
Last Updated: 2025-09-18  
Applies To: all repositories under the WhisperrChat ecosystem (frontend, backend, infra, crypto, bots, docs)


## 0. Purpose
WhisperrChat is an open-source, end-to-end encrypted (E2EE) messaging platform with optional native blockchain anchoring (notarization, micro‑payments, identity attestations). This document encodes architectural constraints and behavioral rules to ensure:
* Flexibility (pluggable modules, graceful degradation)
* Modularity (clear boundaries, minimal coupling)
* Backwards compatibility (schema + protocol stability, additive evolution)
* Security & privacy (never regress cryptographic guarantees)
* Deterministic regeneration (infrastructure & contracts can be reconstructed from specs)

All automated contributors (AI code generators, refactor bots, CI autocorrectors) MUST treat this file as authoritative. When in conflict with inferred heuristics—defer to these rules.

---

## 1. Core Architectural Principles
1. Local-first where feasible: latency-critical flows (drafts, scrollback) use local persistence + background sync.
2. Encryption by default: plaintext user content MUST never cross process boundaries unencrypted.
3. Layered contracts: UI → State Model → API → Domain → Persistence. No leapfrogging.
4. Explicit versioning: All externally consumed artifacts carry a version (OpenAPI, GraphQL schema, AsyncAPI, design tokens, CSS theme).
5. Additive evolution: removal only after deprecation window with telemetry showing <1% usage unless critical security fix.
6. Deterministic builds: lockfiles mandatory; infra descriptors pinned (hash or digest).
7. Capability isolation: cryptographic, payment, notarization, search, and messaging subsystems encapsulated behind narrow interfaces.
8. Observability with privacy: no logging of ciphertext, keys, or user PII; structured, redactable logs.
9. Composability over inheritance: prefer small functional utilities, not deep class hierarchies.
10. Failure containment: partial outages degrade features (e.g., notarization queue paused) without blocking core messaging.

---

## 2. Repository Structure (Canonical High-Level)
```
/specs          -> machine-first specs (frontend.json, backend.json, asyncapi, schemas)
/apps           -> user-facing applications (web, mobile, desktop shell)
/packages       -> shared libraries (crypto, ui-kit, state, transport, protocol)
/services       -> backend micro & mini-services (auth, messaging, fanout, ledger, anchor, search)
/infrastructure -> IaC (Terraform/Pulumi), k8s manifests, DB migrations
/scripts        -> deterministic generation & release utilities
/.well-known    -> public metadata endpoints (security.txt, openapi.json copies)
```

---

## 3. Branching & Versioning
* Main branches: `main` (stable), `develop` (integration), feature branches `feat/<slug>`, fixes `fix/<slug>`.
* Release tags: `vMAJOR.MINOR.PATCH`.
* API contract versions DO NOT skip semver—breaking changes only in MAJOR.
* Protocol / cryptographic versioning uses `X.Y` (minor backward-compatible evolutions allowed; Y increments on optional features).
* Database migrations must be forward-only; never edit old migration files—add a new one.

---

## 4. Commit Message Convention
Format:
```
<type>(<scope>): <short summary>

<body - optional>
BREAKING CHANGE: <description - if applicable>
Refs: <issue/PR>
```
Types: feat, fix, perf, refactor, docs, chore, test, build, ci, security.

Examples:
* feat(messages): add ephemeral media retention policy
* security(crypto): rotate default X3DH prekey count

---

## 5. Code Generation & Automation Boundaries
| Area | Allowed Automation | Prohibited |
|------|--------------------|------------|
| UI components | Scaffolding, story generation | Silent removal of accessibility props |
| Crypto layer | None beyond formatting | Changing algorithms, parameter sets |
| Migrations | Template generation | Reordering historical migrations |
| API handlers | Boilerplate wiring | Altering auth checks |
| CSS tokens | Adding new tokens (namespaced) | Overwriting existing token semantics |
| Tests | Generating baseline | Whitelisting failing tests automatically |

Automation MUST annotate generated files with a header:
```
// @generated whisperrchat-tool:<name>@<version> hash:<content-hash> DO NOT EDIT DIRECTLY
```

---

## 6. Security & Privacy Requirements
1. Zero plaintext persistence for messages or attachments server-side.
2. Ephemeral keys: session keys rotate on device triggers (app cold start, manual rotation, suspicious patterns).
3. Key backup (optional): must use user-supplied passphrase, NEVER server-managed recovery.
4. Logging: redact patterns matching base64 ciphertext, hex keys, 32/64-byte sequences where ambiguous.
5. Rate limiting: applied per user, per IP bucket, per conversation for mutation endpoints.
6. No dynamic code evaluation (eval, new Function) in any runtime.
7. Dependencies: security scan gating (Snyk/OSV/Trivy) blocking HIGH severity unless approved by security owner.

---

## 7. Cryptography Guidelines
| Concern | Standard |
|---------|----------|
| Identity keys | X25519 for DH; Ed25519 for signatures |
| Session establishment | X3DH (libsignal-style) |
| Message ratchet | Double Ratchet (X25519 + AES-256-GCM / ChaCha20-Poly1305) |
| PRNG | OS-provided CSPRNG only |
| Hashing (anchoring) | BLAKE3 (internal), SHA-256 (chain compatibility) |
| Password hashing | Argon2id (t>=3, m>=64MB, p=1) |
| Key derivation | HKDF (SHA-256) |
| Attachment encryption | Streaming chunked AES-256-GCM, 4MB chunk size default |

NEVER:
* Roll your own primitive.
* Reuse nonces across distinct keys.
* Downcast cryptographic errors to generic 500 without a structured code.

---

## 8. Blockchain Integration
1. Optional: user can disable anchoring and payment features (must degrade gracefully).
2. Write batching: Merkle root of message ciphertext hashes anchored periodically (target: every 10 min or threshold N=5000 messages).
3. Payment microtransactions: off-chain ledger + periodic settlement; require explicit signature (Ed25519 spend key).
4. Attestations: decoupled service; uses content hash (not plaintext) + owner signature.
5. Node abstraction: provider interface `IChainClient` (supports fallback providers, circuit breaker).
6. Gas / fee estimation cached per block height for 30s max.

---

## 9. API Evolution & Backwards Compatibility
1. Additive schema changes only (new fields, optional inputs) in MINOR.
2. Deletions require: deprecation notice (OpenAPI `x-deprecated: true`), telemetry <1%, minimum 2 version lag.
3. Version negotiation via `Accept-Version` or `X-Whisperr-Api-Version`.
4. GraphQL: only add new nullable fields; never repurpose field types.
5. Async topics versioned by suffix (`.v1`, `.v2`) when breaking.

---

## 10. Data Model Change Protocol
1. Propose: create `design/<date>-<slug>.md` with ER delta & migration notes.
2. Generate migration (deterministic timestamp ordering).
3. Add integration test seeding old schema + upgrade path.
4. Bump domain model version reference in `backend.json`.

---

## 11. Testing Strategy
| Layer | Tools | Target |
|-------|-------|--------|
| Crypto property tests | fast-check / proptest | invariant adherence |
| Unit | Jest / Vitest / Go test / Rust cargo test | 90% critical packages |
| Contract | Dredd / Prism / custom harness | 100% endpoints smoke |
| Integration | k6/gatling scenario | realistic concurrency |
| E2E | Playwright / Detox | core flows + regression |
| Fuzzing | cargo-fuzz / libFuzzer wrappers | parsers, protocol frames |
| Load | k6 | SLA enforcement |

All new features need: unit + contract tests; refactors need non-regression tests.

---

## 12. Performance Budgets (Representative)
| Metric | Budget |
|--------|--------|
| P95 message send round trip (same region) | < 800ms |
| P99 message fanout lag | < 2500ms |
| P95 cold start (mobile) | < 1800ms |
| Bundle initial JS (web, compressed) | < 280KB |
| DB query P95 (hot path) | < 40ms |
| Max ratchet session re-init frequency | < 2% messages |

Failing budgets triggers CI warning; persistent (3 merges) => blocker.

---

## 13. UI / Design System Guidelines
* Base font size: 16px; scale uses fluid tokens (`--text-sm`, `--text-base`, etc.).
* Minimum tap size: 44px.
* Theming: only change component visuals via CSS custom properties; NEVER inline hard-coded colors.
* Dark mode: `.dark` parent or `[data-theme="dark"]`.
* High contrast mode: future variant `.hc`; reserve tokens `--hc-*`.
* Motion: respect `prefers-reduced-motion`; wrap non-essential animations with media query.

### Component Rules
Button:
* Uses `--radius-md` for default, `--radius-lg` for primary large.
* Loading spinner must not shift layout.

Input:
* Must expose `aria-invalid` on validation errors.
* Avoid placeholder as label; always explicit `<label>`.

Message Bubble:
* Outgoing vs incoming use opacity and accent borders, not pure hue shift only (accessibility).

---

## 14. Accessibility & Internationalization
* WCAG AA minimum; AAA for text contrast in messaging area.
* Use semantic landmarks (header, nav, main, aside).
* Directionality: support `dir="rtl"`; ensure bubble alignment logic not hard-coded to LTR.
* Translations: keys stable; NEVER embed dynamic variables outside placeholders (`{{username}} joined`).

---

## 15. Observability
* OpenTelemetry instrumentation at service edges.
* Trace sampling dynamic; security-sensitive spans truncated.
* Log schema versioned: `log.version=1`.
* PII classification tags: `redact=true` enforced in processor.

---

## 16. AI / Automated Tool Directives
MUST:
* Read `frontend.json` / `backend.json` for structural constraints before generating code.
* Preserve existing exported public function signatures unless version bump documented.
* Insert TODOs with context: `// TODO(ai): <action> (reason)`.

MUST NOT:
* Introduce new runtime dependencies without justification comment.
* Auto-fix cryptographic error handling by swallowing errors.
* Remove manual security comments.

---

## 17. File & Naming Conventions
| Type | Convention |
|------|------------|
| React component | `PascalCase.tsx` |
| Hooks | `useX.ts` |
| State atoms/selectors | `*.state.ts` |
| Protobuf / schema ID | snake_case |
| Env variables | `WHISPERR_<DOMAIN>_<NAME>` |
| CSS component block | `wc-<component>` prefix (for raw classes) |

---

## 18. CSS & Theming (See globals.css)
* Only modify tokens in new major theming version or add namespaced tokens: `--ext-<feature>-<token>`.
* Shadows: define via tokens, not inline.
* Transition durations: use token scale `--motion-fast (120ms)`, `--motion-medium (200ms)`, `--motion-slow (320ms)`.

---

## 19. Secrets & Configuration
* NEVER commit `.env`; provide `.env.example`.
* Use sealed secrets or SOPS for production.
* Client feature flags fetched via signed manifest; no secret gates in frontend code.

---

## 20. Dependency Policy
* License allowlist: MIT, Apache-2.0, BSD-2/3, MPL-2.0 (GMPL/LGPL need review).
* New cryptographic libs require security review & reproducible build verification.

---

## 21. Quality Gates
* Lint: zero errors (ESLint, biome, rustfmt, gofmt).
* Type errors: fail build.
* Test coverage (critical packages): ≥85% lines, ≥80% branches.
* Dead code scanner (ts-prune / cargo-udeps): no new unused exports.

---

## 22. Release Process
1. Merge candidate to `develop`.
2. Tag RC: `vX.Y.Z-rc.N`.
3. Run full test + load profile.
4. Security diff scan from previous stable.
5. Promote: tag final; generate SBOM; attach artifacts.

---

## 23. Decommissioning / Deprecation
* Announce in `DEPRECATIONS.md`.
* Add runtime warning (one per session).
* Provide replacement mapping.
* Remove no earlier than N+2 minor releases unless CVE.

---

## 24. Incident Response
* Severity classification (SEV1 blocking messaging, SEV2 feature partial, SEV3 degraded).
* On SEV1: freeze deploys; create `incident-<timestamp>.md`; post-mortem within 72h.

---

## 25. Glossary (Excerpt)
* E2EE: End-to-end encryption (device-to-device confidentiality).
* Anchoring: Publishing Merkle root of ciphertext hashes to blockchain for tamper-evidence.
* Fanout: Distribution of a message to each participant’s delivery queue.
* Ratchet: Cryptographic forward secrecy + post-compromise security mechanism.

---

## 26. Non-Negotiables (Hard Fails)
* Plaintext user message leaving device (except ephemeral pre-encryption, in-memory).
* Silent cryptographic downgrade.
* Hard-coded secrets.
* Removing explicit authorization checks.
* Logging private keys / seeds.

---

## 27. Updating This Document
1. Open PR with rationale section.
2. Tag reviewers: `@security`, `@architecture`.
3. If accepted, increment minor (1.0.0 → 1.1.0) in header and commit.

---

## 28. Acknowledgements
Inspired by principles from Signal, Matrix, and modern zero-trust architectures, adapted for modular extensibility + deterministic regeneration.

---

## 29. Quick Checklist (For PR Authors)
- [ ] Follows commit convention
- [ ] No plaintext secrets
- [ ] Added/updated tests
- [ ] Docs/spec updated
- [ ] Performance budget unaffected or improved
- [ ] Backwards compatible
- [ ] Accessibility preserved
- [ ] Observability hooks intact

---

## 30. AI Short Directive (Embed This Where Needed)
```
Respect E2EE boundaries. Never store plaintext. Maintain additive evolution. Do not alter crypto primitives. Preserve public APIs. Use tokens for styling. Provide tests for new logic. Abort on ambiguity—ask for clarification.
```

End of guidelines.