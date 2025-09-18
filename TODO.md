# WhisperrChat – Architecture-Aligned Implementation Roadmap (Reset)

Version: 0.2 (Architecture sync reset)
Updated: 2025-09-18
Owner: Engineering
Status Legend: [ ] pending  [~] in-progress  [x] done  [!] blocked  [-] dropped

---
## 0. Guiding Snapshot
Derived from ARCHITECTURE.md v0.1.0. Focus near-term on: secure baseline (identity + keys + encrypted messaging), cohesive single-page client shell, deterministic evolution hooks. Advanced domains (payments, notarization, plugins) deferred until core E2EE pipeline, event model, and policy scaffold exist.

---
## 1. Phase 1 – Bootstrap & Cleanup (Foundations)
Goals: Minimal viable encrypted chat shell, unified state, removal of legacy routing & Supabase remnants, scaffold for future backend (Appwrite or custom services).

Tasks:
- [x] 1.1 Purge Supabase integration (client/types + dependency) (ref: cleanup)
- [x] 1.2 Introduce `AppPlatform` root (replaces router) mounting providers + Chat experience
- [ ] 1.3 Create `ChatApp` state orchestrator (auth gate + encryption gate + chat shell)
- [ ] 1.4 Remove obsolete routed pages (`Landing`, `Auth`, `Index`, `NotFound`, legacy `Chat`)
- [ ] 1.5 Remove `ProtectedRoute` and update imports
- [ ] 1.6 Central UI state context: `{ activeChatId, setActiveChatId, showAuthOverlay }`
- [ ] 1.7 Add lightweight feature flag stub (in-memory map) for future toggles

Risks / Notes:
- Keep removal reversible by isolating new root mount point logic.

---
## 2. Phase 2 – Identity & Key Management (Arch §6)
Goals: Formalize device + key bootstrap; prepare for prekey & future double-ratchet integration.

Tasks:
- [ ] 2.1 Define machine-readable key bundle schema (JSON) aligning with spec (`keyBundle` fields)
- [ ] 2.2 Refactor current encryption hook to emit & persist a prekey bundle structure (local only)
- [ ] 2.3 Add key fingerprint registry index (per user, active/inactive tracking)
- [ ] 2.4 Manual key rotation UX action (already logic stubbed) – surface in UI settings
- [ ] 2.5 Design doc stub: planned X3DH-like handshake (placeholder file: `docs/handshake-spec.md`)
- [ ] 2.6 Add device revocation placeholder list (local simulation)

Backlog:
- [ ] 2.B1 One-time prekeys pool generation & consumption model
- [ ] 2.B2 Encrypted backup export (passphrase-derived) design stub

---
## 3. Phase 3 – Encrypted Messaging Pipeline (Arch §§7,14)
Goals: Structured encrypted payloads, unified send path, recipient resolution correctness, forward compatibility.

Immediate:
- [ ] 3.1 Fix recipient resolution (exclude sender; derive from member key registry)
- [ ] 3.2 Unify send path → only `useEncryption.sendEncryptedMessage`
- [ ] 3.3 Migrate encrypted content format to JSON envelope `{v, c, iv}`
- [ ] 3.4 Dual parser (legacy `cipher:iv` fallback)
- [ ] 3.5 Store `encryption_key_version` (or fingerprint alias) with message record

Enhancements:
- [ ] 3.6 In-memory decrypted message cache (LRU or simple Map) keyed by messageId
- [ ] 3.7 Decryption timeout guard + error isolation per message
- [ ] 3.8 Authenticity roadmap comment (future signatures) in code

Backlog:
- [ ] 3.B1 Double ratchet session state design stub
- [ ] 3.B2 Prekey consumption transition logic

---
## 4. Phase 4 – UI Shell & Interaction (Arch §§4,25)
Goals: Modular chat shell layout, responsive behavior, accessibility & basic offline readiness hooks.

Tasks:
- [ ] 4.1 Implement `ChatShell` layout container
- [ ] 4.2 Implement `ChatSidebar` (list, create placeholder, search stub)
- [ ] 4.3 Active chat header (encryption status badge + actions placeholder)
- [ ] 4.4 Messages list component (virtual scroll optional later) using decrypted cache
- [ ] 4.5 Composer (input, send, encryption indicator)
- [ ] 4.6 Empty states (no chats / no messages)
- [ ] 4.7 Scroll anchoring & auto-scroll only when near bottom
- [ ] 4.8 Mobile responsive collapse of sidebar

Backlog:
- [ ] 4.B1 Typing indicators (ephemeral events channel design)
- [ ] 4.B2 Read receipts (needs message delivery status abstraction)
- [ ] 4.B3 Media attachment UX placeholder

---
## 5. Phase 5 – State, Realtime & Event Model (Arch §§9,10)
Goals: Abstract event envelope, prepare for future server-sourced streams; replace polling.

Tasks:
- [ ] 5.1 Define internal event envelope TS type mirroring spec (`id,type,occurredAt,partitionKey,payload,privacy`)
- [ ] 5.2 Refactor message/chats polling hooks to consume a local EventBus abstraction
- [ ] 5.3 Introduce subscription manager interface (future WebSocket / SSE adapter)
- [ ] 5.4 Active chat subscription lifecycle cleanup (unsubscribe on change)
- [ ] 5.5 Error boundary wrapping message list (isolate decryption failures)

Backlog:
- [ ] 5.B1 Event persistence replay strategy (local log ring buffer)
- [ ] 5.B2 Causal ordering metadata (sequence or lamport stub)

---
## 6. Phase 6 – Data Classification & Privacy (Arch §5)
Goals: Start labeling in code and preparing metadata minimization.

Tasks:
- [ ] 6.1 Introduce classification enum (C0–C4) & annotate message payload generation
- [ ] 6.2 Redact high-level logs (no plaintext, classification label only)
- [ ] 6.3 Add developer console warnings when plaintext would be logged

Backlog:
- [ ] 6.B1 Length padding strategy design note

---
## 7. Phase 7 – Policy & Authorization Scaffold (Arch §27)
Goals: Prepare policy evaluation model (client simulation) ahead of server integration.

Tasks:
- [ ] 7.1 Define policy rule interface (`resource, action, effect, roles, conditions[]`)
- [ ] 7.2 Add evaluator stub (deny-first, allow evaluation) with tests (optional)
- [ ] 7.3 Tag chat actions with required capability constant

Backlog:
- [ ] 7.B1 Condition predicate parser (safe subset)

---
## 8. Phase 8 – Observability & Telemetry (Arch §§23,22)
Goals: Minimal instrumentation respecting privacy.

Tasks:
- [ ] 8.1 Add lightweight metrics facade (counters: sendMessage, decryptFail)
- [ ] 8.2 Add error boundary global + structured error object
- [ ] 8.3 Anonymize user IDs in debug logs (hash + salt placeholder)

Backlog:
- [ ] 8.B1 Differential privacy noise injection design note

---
## 9. Phase 9 – Future (Deferred Domains)
(Do NOT implement yet; placeholders for sequencing)
- Payments & Value Layer (Arch §15)
- Notarization / Anchoring (Arch §16)
- Plugin / Bot Runtime (Arch §13)
- Media Chunk Pipeline (Arch §26)
- Governance / Moderation UI (Arch §§17,18)
- Deterministic regeneration pipeline tooling (Arch §20)

---
## 10. Security & Hardening (Arch §§21,5)
Tasks:
- [ ] 10.1 Security notes banner (dev mode: non-production cryptography warning)
- [ ] 10.2 Console warning when using placeholder auth
- [ ] 10.3 Document current cryptographic limitations (no signatures, no forward secrecy yet)

Backlog:
- [ ] 10.B1 Threat model expansion document stub

---
## 11. Deterministic Regeneration Hooks (Arch §20)
Tasks:
- [ ] 11.1 Create `spec/` directory placeholders (domain-model.json, events.json, policy.json)
- [ ] 11.2 Add integrity file with SHA256 of spec placeholders
- [ ] 11.3 Script stub (npm) to verify digests (`spec:verify`)

Backlog:
- [ ] 11.B1 Codegen prototype for types from event schema

---
## 12. Sprint Candidate (Initial Focus Set)
Recommended first execution order:
1. (1.2,1.3,1.4,1.5) Root consolidation
2. (4.1–4.5) UI shell baseline
3. (3.1–3.5) Messaging encryption correctness
4. (5.1–5.3) Event abstraction
5. (2.1–2.3,2.4) Key bundle formalization + rotation UX
6. (10.1–10.3) Security visibility
7. (11.1–11.3) Regeneration scaffolding

---
## 13. Tracking Table (Roll-Up)
| ID | Title | Status | Depends |
|----|-------|--------|---------|
|1.2|AppPlatform root|pending| |
|1.3|ChatApp orchestrator|pending|1.2|
|1.4|Remove pages|pending|1.2|
|3.1|Fix recipient resolution|pending|1.3|
|3.3|Payload JSON envelope|pending|3.1|
|4.2|ChatSidebar|pending|1.3|
|4.4|Messages list|pending|3.3|
|5.2|EventBus abstraction|pending|5.1|
|2.2|Prekey bundle persist|pending|2.1|
|10.1|Dev security banner|pending|1.3|
|11.2|Spec integrity hashes|pending|11.1|

(Non-exhaustive; see full sections.)

---
## 14. Notes for Contributors
- Keep PRs vertically scoped (e.g., "Phase3: payload envelope + dual parser").
- Include architecture section references in PR descriptions.
- Do not introduce new encryption algorithms without design stub referencing Arch §21.
- Maintain dual-read strategy during format transitions.

---
## 15. Changelog (Starts After First Task Completion)
(Empty – populate once initial Phase 1 tasks merge.)

---
## 16. Update Procedure
1. Implement task.
2. Update status here (or follow-up PR if large).
3. Append Changelog entry for structural or protocol-affecting changes.
4. Preserve IDs; add new with incremental suffix.

---
END OF RESET ROADMAP
