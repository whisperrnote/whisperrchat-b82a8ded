---
title: TenChat - Architecture Overview (Language & Stack Agnostic)
version: 0.1.0
status: draft
classification: public
lastUpdated: 2025-09-18
canonicalProductName: TenChat
internalCodeName: TenChat
summary:
  purpose: "Open, extensible, end-to-end encrypted real-time messaging & collaboration platform with optional native blockchain anchoring + micropayments."
  corePillars:
    - End-to-end confidentiality & forward secrecy
    - Modularity & evolutionary extensibility
    - Deterministic regeneration (spec-first)
    - Minimal metadata & privacy preservation
    - Horizontal scalability & graceful degradation
    - Backwards compatibility guarantees (schema + contract)
machineReadable:
  sectionIdentifiers: true
  stableAnchorsFormat: kebab-case
---

# 1. Purpose-and-Scope

TenChat is an open-source, end-to-end encrypted, extensible messaging and interaction system supporting:
- Secure 1:1 and group messaging (text, media, structured payloads)  
- Optional micropayments / value transfer and notarization (blockchain abstraction)  
- Plugin / bot ecosystem with policy-governed capabilities  
- Deterministic, specification-driven regeneration of UI, APIs, data schemas, and infra mappings

This document presents a stack-agnostic, implementation-neutral architecture blueprint intended for both human comprehension and machine parsing.

# 2. Architectural-Principles

| Principle | Description | Enforcement Mechanism |
|-----------|-------------|-----------------------|
| Modularity | Each responsibility isolated in a bounded context/service | Service contracts + dependency rules |
| Extensibility | New capabilities via additive extension points | Versioned plugin & event interfaces |
| Backwards Compatibility | Non-breaking evolution of public contracts | Semantic version policy + compatibility tests |
| Deterministic Regeneration | Artifacts reproducible from canonical specs | Spec repository + generation pipelines |
| Zero Plaintext Server Storage | Servers handle ciphertext + routing metadata only | Cryptographic policy enforcement layers |
| Privacy Minimization | Only strictly necessary metadata retained | Metadata classification registry |
| Observability with Guardrails | Measured while protecting privacy | Aggregation w/ redaction + differential privacy |
| Defense-in-Depth | Multiple layers of verification & isolation | Multi-tier policy + cryptographic gating |
| Failure Isolation | Degradation localized, not cascading | Circuit isolation + backpressure strategies |
| Transparent Governance | Clear change control & review trails | Signed proposals + audit ledger anchors |

# 3. Domain-Decomposition (Bounded-Contexts)

1. Identity & Enrollment  
2. Key Management & Cryptographic Provisioning  
3. Session & Access Control  
4. Conversation Topology (participants, roles, membership)  
5. Messaging (ingest, persistence, delivery, indexing)  
6. Media Handling (upload orchestration, encryption, caching)  
7. Reactions & Acknowledgments  
8. Search & Discovery (local-first augmentation + server index projections)  
9. Payments / Value Layer (micropayments, balance events)  
10. Notarization / Anchoring (content hash attestation)  
11. Bot / Plugin Runtime (sandboxed automation)  
12. Feature Flag & Capability Negotiation  
13. Audit & Compliance (append-only, privacy-filtered)  
14. Moderation & Governance (policy actions, appeals)  
15. Telemetry / Health (non-sensitive operational metrics)  
16. Notification & Presence Signaling  
17. Extensible Schema / Structured Message Payloads  
18. Migration & Version Orchestration

# 4. High-Level-Component-Map

Logical tiers (not tied to specific technologies):

- Client Tier (multi-platform):
  - UI Orchestrator
  - Offline State & Cache (local secure store + durable message index)
  - Cryptographic Engine (double ratchet, identity bootstrap)
  - Media Encrypt/Chunk Pipeline
  - Sync Coordinator (background incremental pull + subscription)
  - Plugin Container (restricted capability execution)
- Edge Interaction Layer:
  - API Gateway / Contract Router
  - WebSocket / Bidirectional Session Manager
  - Rate / Abuse Guard
  - Payload Shape Validator
- Core Service Mesh (logical services):
  - AuthN & Session
  - Key Registry (public prekeys + revocation / rotation ledger)
  - Conversation Service
  - Message Ingest & Ordering
  - Delivery Fanout / Subscription Distributor
  - Media Orchestrator
  - Search Projection Builder
  - Payments Orchestrator (abstraction over ledger/backends)
  - Notarization Scheduler (hash aggregation, anchoring)
  - Bot Runtime Supervisor
  - Feature Flag Distributor
  - Moderation Command Processor
  - Audit Logger (append-only, redacted views)
  - Event Stream Backbone (topics / subjects)
- Persistence Layer (logical):
  - Identity & Profile Store
  - Message Append Log (partitioned)
  - Message Metadata Index (secondary projections)
  - Conversation Membership Store
  - Media Metadata + Encrypted Blob Storage
  - Payment Ledger & Balance State
  - Notarization Batches + Proofs
  - Audit Log (write-once)
  - Policy & Feature Flag Registry
- Integration Layer:
  - Blockchain Adapter (anchor, balances, identity attest)
  - External Notification Channels (push, email fallback)
  - External Compliance / Key Backup (opt-in)
  - Plugin Package Registry
- Observability Plane:
  - Structured Event Aggregator
  - Privacy-Aware Metrics Transformer
  - Trace Propagation Coordinator
  - Anomaly Detection (behavioral heuristics)

# 5. Data-Classification & Privacy-Model

Classification Levels:
- C0 Public (schemas, version tags)
- C1 Pseudonymous (user numeric IDs, conversation IDs)
- C2 Encrypted User Content (message ciphertext, media ciphertext)
- C3 Sensitive Metadata (key material references, payment ledger internals)
- C4 Critical Security (identity private keys — client-side only)

Server-Side Storage Rules:
- C4 never leaves client environment
- C3 stored with hardened access controls + audited access
- All C2 stored only in encrypted form; length/padding strategy applied
- Minimal correlation retention (avoid cross-conversation linking)

# 6. Identity-&-Key-Lifecycle (Abstract)

Phases:
1. Enrollment: User selects handle; server assigns stable opaque internal user ID
2. Device Provisioning: Identity key pair generated client-side (never transmitted in plaintext)
3. Prekey Publication: Client publishes signed prekeys bundle
4. Session Establishment: X3DH-like handshake (identity + prekeys) resulting in root key
5. Message Ratcheting: Per-conversation double ratchet state maintained per device pair
6. Rotation: Scheduled or manual key rotation triggers new prekey bundle publication
7. Revocation: Compromised device marked; future session negotiations exclude revoked prekeys
8. Backup (opt-in): Encrypted export (passphrase-derived key) stored in remote vault (server opaque)

Machine-Readable Pseudo-Spec:
```json
{
  "keyBundle": {
    "identityPub": "Ed25519",
    "signedPrekeys": ["Curve25519", "..."],
    "oneTimePrekeys": ["Curve25519", "..."],
    "signature": "DetachedSignature"
  },
  "session": {
    "rootKey": "KDF(secret_material)",
    "chainKeys": { "sending": "...", "receiving": "..." },
    "messageIndex": { "sending": 42, "receiving": 41 }
  }
}
```

# 7. Message-Lifecycle (Abstract Flow)

1. Compose (client) → local draft (unencrypted plaintext only local)
2. Encrypt (client) → ciphertext + header (ratchet step)
3. Submit (client → edge) → transport-level auth token + metadata envelope
4. Validate (edge) → schema / size / rate limit
5. Persist Append (message log partition selection by conversation hash)
6. Fanout Schedule (enqueue delivery tasks)
7. Subscription Dispatch (live sessions receive event)
8. Client Receives → decrypt → render
9. Acknowledge (read receipts / delivery ack optional)
10. Retention / Tombstone (soft delete = tombstone marker + optional content redaction policies)

# 8. Conversation-Topology

Types:
- Direct (2 participants)
- Small Group (≤ configurable threshold)
- Large Group / Channel (broadcast with constrained sender roles)
- Ephemeral (time-bounded with TTL enforcement)
Attributes:
- ID (opaque stable)
- ParticipantSet (user/device references)
- Policy Profile (permissions, message retention strategy)
- Feature Flags (encryption algorithm variants, ephemeral mode)
- Version (schema evolution marker)
Derived Indices:
- Per-user membership index
- Active conversation recency index

# 9. Events-&-Streaming-Abstraction

Event Categories:
- Domain Events (message_persisted, conversation_created)
- Projection Update Signals (search_index_delta)
- Real-Time User Events (typing_started, presence_changed)
- Governance Events (moderation_action_applied)
- Ledger Events (payment_committed, balance_updated)
- Anchoring Events (anchor_batch_finalized)

Event Envelope (abstract):
```json
{
  "id": "ULID",
  "type": "message_persisted",
  "occurredAt": "RFC3339",
  "partitionKey": "conversation:{id}",
  "schemaVersion": "1",
  "payload": { "messageId": "...", "conversationId": "...", "ciphertextRef": "..."},
  "privacy": { "containsPII": false, "classification": "C2" }
}
```

# 10. Consistency-Model

- Strong consistency within single append operation (message log partition)
- Eventual consistency for derived projections (search, unread counters)
- Causal ordering preserved per conversation (sequence numbers or lamport hybrid)
- Delivery semantics: at-least-once to clients (idempotent dedupe by message ID)
- Idempotent operations for acknowledgments & payment submissions

# 11. Scaling-Strategies

Partitioning Keys:
- Conversation ID hash → message log shard
- User ID hash → presence state shard
- Payment ledger partitioned by account root
Horizontal Scale Units:
- Message Ingest Workers
- Fanout Dispatchers
- Index Builders
- Blockchain Anchor Batcher
Capacity Levers:
- Adaptive batching for fanout
- Backpressure (drop non-critical ephemeral signals first)
- Progressive sync (recent window first → historical pagination)

# 12. Performance-Optimizations (Abstract)

- Local-first read path for recent messages via client durable cache
- Batching small messages for network efficiency when idle window < threshold
- Compression of ciphertext frames (post-encryption allowed? Only if format-safe per negotiation — default off)
- Precomputed search tokens (client) optionally sent encrypted for local index augmentation only (not server)

# 13. Extension-&-Plugin-Architecture

Extension Types:
- Bot (reactive to message events within authorized conversations)
- Transport Bridge (federated or alternate channel ingestion)
- Value Service Adapter (additional settlement rails)
- Structured Payload Renderer (custom message subtype)

Sandbox Model:
- Isolated execution runtime
- Capability Manifest:
```json
{
  "manifestVersion": 1,
  "name": "example.bot",
  "capabilities": ["read.message.metadata", "emit.message", "receive.command"],
  "resourceScopes": ["conversation:abc123"],
  "limits": { "messagesPerMinute": 30 }
}
```
Policy Gate:
- Capability request → static analysis → approval workflow
Event Delivery:
- Filtered stream based on manifest scopes

# 14. Structured-Message-Payloads

Message Envelope Generic:
```json
{
  "messageId": "ULID",
  "conversationId": "opaque",
  "protocolVersion": "1",
  "contentType": "text/plain | application/custom+json",
  "ciphertext": "base64",
  "contentDescriptor": {
    "bodyFormat": "markdown|plain|custom",
    "attachments": [{ "id": "...", "type": "image", "encryption": "AES-GCM" }]
  },
  "meta": {
    "sentAt": "RFC3339",
    "clientSequence": 123
  }
}
```
Extension rule: New contentType MUST NOT break existing decrypt path; unknown types preserved and offered to extension renderers.

# 15. Payments-&-Value-Layer (Abstract)

Concepts:
- Account: logical balance container
- Transaction: signed intent, validated, recorded
- Settlement: may involve external chain or channel close
- Fee Policy: dynamic (percentage + floor)
Value Flow:
1. Client constructs unsigned payment intent referencing recipient
2. Client signs (local) with spend-authorized key
3. Submit → validate (balance, signature, anti-replay)
4. Ledger mutation → event emission → optional anchor (batch)
Reconciliation:
- Off-chain micro-ledger with periodic anchoring for integrity guarantees

# 16. Notarization-&-Anchoring

Batch Process:
- Collect content hashes (message or file digest)
- Build Merkle Tree → compute root
- Submit root to blockchain adapter (abstract)
- Store proof object:
```json
{
  "batchId": "ULID",
  "root": "hex",
  "leaves": "count",
  "anchorTxRef": "opaque",
  "timestamp": "RFC3339",
  "proofFormat": "merkle-path-v1"
}
```
Client Verification:
- Retrieve proof path + root
- Validate hashing chain
- Resolve anchor via provider abstraction

# 17. Moderation-&-Governance

Policy Layers:
- Automated Heuristics (spam / abuse detection on metadata patterns)
- Human / Trusted Roles (moderator actions)
Action Types:
- Message Tombstone
- Conversation Freeze
- Account Suspension
- Capability Revocation (bot/plugin)
Auditability:
- Every moderation action emits append-only audit record referencing justification artifact.

# 18. Audit-&-Compliance

Audit Record Template:
```json
{
  "auditId": "ULID",
  "actor": "system|user:{id}|admin:{id}",
  "action": "moderation.freeze.conversation",
  "target": "conversation:{id}",
  "occurredAt": "RFC3339",
  "rationaleRef": "policy:{version}",
  "redactionLevel": "none|partial",
  "signature": "optional"
}
```
Immutable Append Strategy; no in-place mutation (tombstone = new record referencing prior).

# 19. Versioning-&-Evolution

Dimensions:
- Protocol (encryption framing / handshake)
- API Contract (OpenAPI / GraphQL)
- Event Schemas
- Data Model Schema
- Token / UI Model (design tokens)
Policy:
- Additive-first; deprecations flagged with sunset timestamps
- Compatibility tests: (N, N-1) MUST co-exist for defined grace window
- Migrations: forward-only scripts + reversible snapshot plan
Version Negotiation:
- Clients declare Supported: { protocol: [1], features: ["structured-payload-v2"] }
- Server selects compatible subset and returns capability decision matrix.

# 20. Deterministic-Regeneration-Model

Canonical Sources:
- Domain Model DSL
- API Contract Spec
- Event Schema Registry
- Auth Policy & Role Matrix
- UI Blueprint + Token JSON
Generation Targets:
- Schema artifacts
- Stub service contracts
- Policy enforcement templates
- Type-safe client bindings
Integrity:
- Artifact fingerprint map referencing source spec digests
- Regeneration pipeline ensures no drift (CI verification).

# 21. Security-&-Threat-Model (Condensed)

Primary Threat Vectors:
- Key exfiltration (mitigated by client-side storage + optional hardware enclave)
- Metadata correlation (mitigated by minimization & optional padding)
- Replay / ordering attacks (per-conversation counters / nonces)
- Malicious extension behavior (capability gating + rate isolation)
- Supply chain spec tampering (signed spec digests)
Attack Surface Minimization:
- No plaintext persistence
- Strict content-type allow list + size quotas
- Defense logs separated from message storage to reduce correlation risk

# 22. Reliability-&-Resilience

Strategies:
- Circuit breakers around value & anchoring adapters
- Priority queues (chat messages > presence > analytics)
- Idempotent consumers for fanout + projection build
- Graceful degradation tiers:
  1. Core messaging
  2. Attachments / media
  3. Search
  4. Payments / notarization
  5. Bot automation
Replay / Recovery:
- Durable event log replays projections
- Snapshot + incremental delta rebuild model for large indices

# 23. Observability-&-Telemetry (Privacy Aware)

Signals:
- Health (service up/down, error rates)
- Latency distributions per operation
- Fanout backlog depth
- Partition skew metrics
Sensitive Controls:
- Redaction of user identifiers (hash salt rotation)
- Aggregation thresholding (k-anonymity for reporting)
- Differential privacy noise injection for aggregate analytics

# 24. Presence-&-Real-Time-Signals

Categories:
- Typing indicators
- Online / last-active coarse signals
- Read receipts (optional user-level feature flag)
Privacy:
- Presence can be disabled or fuzzed (time-bucketed)
Delivery:
- Low-latency ephemeral channel (not persisted except optional receipt ack)

# 25. Client-Side-Offline-Model

Local Data Sets:
- Conversation index (summaries)
- Message windows (recent N + pinned older)
- Key ratchet states
- Drafts & media queue
Conflict Resolution:
- Last-writer-wins for ephemeral fields
- Logical clock ordering for message timeline
- Attachment retry with exponential backoff
Resync Modes:
- Fast (metadata only)
- Full (historical segments on demand)
- Integrity Verification (hash chain sampling)

# 26. Media-Pipeline (Encrypted)

Flow:
1. Client chunk + encrypt (per-chunk symmetric key)
2. Upload each chunk with integrity tag
3. Server stores opaque blobs + metadata (size, content-type guess)
4. Reference manifest stored alongside message metadata
5. Download path: manifest → selective range retrieval → decrypt → reassemble

# 27. Policy-&-Authorization-Model

Abstract Policy Entry:
```json
{
  "resource": "conversation",
  "action": "write",
  "effect": "allow|deny",
  "roles": ["user","bot"],
  "conditions": ["participant(user,conversation)=true", "rateLimit.ok"]
}
```
Evaluation Pipeline:
1. Gather principal roles
2. Evaluate deny rules first
3. Evaluate allow + condition predicates
4. Cache short-lived decision (context-sensitive)

# 28. Governance-&-Change-Control

Proposal Stages:
- Draft → Review → Approved → Implemented → Archived
Artifacts:
- Proposal ID
- Rationale
- Impact Matrix (contract, storage schema, migration)
Verification:
- Automated diff classification (breaking / additive / metadata-only)
- Signed approval ledger entry (optional anchor)

# 29. Naming-&-Identifiers

ID Types:
- ULID / monotonic lexicographic for messages
- Opaque numeric or hash for users (avoid leaking sequence)
- Namespaced composite keys for events (type + partition)
Consistency:
- kebab-case for file/spec anchors
- snake_case for internal field names (if generated; abstract guideline)
- camelCase for client property access (mapping layer handles adaptation)

# 30. Migration-Strategy (Abstract)

Lifecycle:
1. Design: schema delta proposed
2. Annotate: classify fields (new, deprecated, transitional)
3. Dual-Write (if necessary) during deprecation window
4. Read-Path Adaptation (fallback to legacy representation)
5. Finalize: remove legacy after expiry
Safety Tools:
- Shadow reads (compare old/new)
- Data checksum sampling
- Rollback plan (snapshot + reversible transformation script)

# 31. Open-Interoperability (Optional Future)

Foundations laid for:
- Federation gateway (protocol translation boundary)
- Import/export encrypted archives (portable conversation package)
Archive Package Skeleton:
```json
{
  "packageVersion": 1,
  "conversations": [{ "id": "...", "messages": ["ciphertextRef"...] }],
  "keys": { "exportFormat": "encrypted-passphrase-v1" }
}
```

# 32. Non-Goals (Current Phase)

- Full decentralized storage (future research)
- End-to-end searchable encrypted server index (client-only search for now)
- Cross-platform binary plugin distribution (source or WASM-like limited scope only)
- Real-time federated bridging with third-party networks (deferred)

# 33. Risks-&-Mitigations (Selected)

| Risk | Impact | Mitigation |
|------|--------|------------|
| Metadata correlation attacks | Privacy erosion | Padding, delayed indexing, aggregation thresholds |
| Plugin abuse | Spam / resource drain | Capability scoping + quotas |
| Large fanout spikes | Latency / backlog | Prioritized queues + sharding strategy |
| Key rotation failure | Message decryption issues | Grace period + fallback prekey set |
| Ledger divergence | Financial inconsistency | Periodic reconciliation + anchored batch proofs |

# 34. Future-Evolution Hooks

Reserved Concepts:
- Multi-party computation enhancements (group key optimization)
- Post-quantum key negotiation variant (protocolVersion increment)
- Advanced ephemeral rooms (zero-retention guarantees)
- Adaptive trust scoring (mitigation of spam without full metadata exposure)

# 35. Machine-Readable-Index (Section Registry)

```json
{
  "sections": [
    "purpose-and-scope",
    "architectural-principles",
    "domain-decomposition",
    "high-level-component-map",
    "data-classification-and-privacy-model",
    "identity-and-key-lifecycle",
    "message-lifecycle",
    "conversation-topology",
    "events-and-streaming-abstraction",
    "consistency-model",
    "scaling-strategies",
    "performance-optimizations",
    "extension-and-plugin-architecture",
    "structured-message-payloads",
    "payments-and-value-layer",
    "notarization-and-anchoring",
    "moderation-and-governance",
    "audit-and-compliance",
    "versioning-and-evolution",
    "deterministic-regeneration-model",
    "security-and-threat-model",
    "reliability-and-resilience",
    "observability-and-telemetry",
    "presence-and-real-time-signals",
    "client-side-offline-model",
    "media-pipeline-encrypted",
    "policy-and-authorization-model",
    "governance-and-change-control",
    "naming-and-identifiers",
    "migration-strategy",
    "open-interoperability",
    "non-goals",
    "risks-and-mitigations",
    "future-evolution-hooks"
  ],
  "version": "0.1.0"
}
```

# 36. Appendices

A. Glossary (Excerpt):
- Conversation: Logical container for ordered encrypted messages.
- Fanout: Distribution of stored message events to active subscribers.
- Anchor: Blockchain-settled attestation of batched hashes.
- Capability: Explicit rights granted to extension or principal.
- Projection: Derived, query-optimized view from primary append log.

B. Change Log (Initial):
- 0.1.0: Initial architecture baseline established.

---

End of ARCHITECTURE.md (machine and human readable baseline).