# Whisperrchat – Foundation & Implementation Roadmap

Version: 0.1 (Initial consolidated plan)
Updated: 2025-09-18
Owner: Engineering
Status Legend: [ ] pending  [~] in-progress  [x] done  [!] blocked  [-] dropped

---
## 1. Core Architecture Consolidation

### Goals
Unify the application into a single-page chat experience with overlay-driven authentication and encryption initialization; remove page-routing complexity until multi-route needs emerge.

### Tasks
- [ ] 1.1 Replace router-based page model with state-driven `ChatApp` root component
  - Acceptance: `App.tsx` no longer mounts `<BrowserRouter>`; only providers + `<ChatApp />`
  - Side-effects: Remove `ProtectedRoute` usage
- [ ] 1.2 Introduce `ChatApp` composition layer
  - Contains: AuthOverlay, EncryptionSetup overlay gating, ChatShell layout
  - Acceptance: App boots to Connect state (unauth), then encryption setup (first-time), then chat
- [ ] 1.3 Central UI State (auth + encryption + active chat)
  - Provide hook or context for: `activeChatId`, `showAuthOverlay`
- [ ] 1.4 Remove obsolete pages (Landing, Auth, Index, NotFound, legacy Chat) after migration
  - Keep `EncryptionSetup` component (overlay usage)
- [ ] 1.5 Introduce design tokens / consolidate Tailwind utility drift (optional, light in this phase)

### Risks / Notes
- Minimize breaking removal of routing for future navigation; keep design reversible.

---
## 2. Auth System Overhaul

### Goals
Single overlay flow: Email first (identifier), then choose Passkey / Wallet / Email+Password path. Normalize resulting user session abstraction.

### Tasks
- [ ] 2.1 Create `AuthOverlay` (full-screen, dismissible only after auth success)
- [ ] 2.2 Step 1: Email capture + basic validation (store provisional email in context)
- [ ] 2.3 Step 2: Auth method selection: Passkey, Wallet, Email & Password (Sign In / Register toggle)
- [ ] 2.4 Refactor `usePasskeyAuth` to require email argument for both register + authenticate
  - Remove generation of internal placeholder email; pass captured email
  - Add TODO markers for real server-side WebAuthn verification
- [ ] 2.5 Refactor `useWalletAuth` to require email for continuity & potential future linking
  - Store email in `user_profiles` metadata if not present
- [ ] 2.6 Create `UnifiedAuthContext` facade
  - Normalized shape: `{ id, displayName, primaryAuthMethod, email?, walletAddress?, passkeyRegistered }`
- [ ] 2.7 Integrate Supabase session for email/password path only (for now) – mark others as pseudo-session
- [ ] 2.8 Add explicit warning banner in dev mode if user is using non-Supabase-authenticated session (passkey/wallet placeholder)
- [ ] 2.9 Sign-out should clear all local pseudo-session markers + encryption key references

### Deferred / Backlog
- [ ] 2.B1 Real server-mediated passkey challenge/response verification + session issuance
- [ ] 2.B2 Wallet SIWE (Sign-In with Ethereum) standard implementation

### Risks
- RLS policies may break for passkey / wallet operations without real Supabase auth user. Current design relies on custom tables; must isolate operations that require RLS. Mark clearly.

---
## 3. Encryption & Security Improvements

### Immediate Fixes
- [ ] 3.1 Fix recipient resolution bug (currently using chatId as recipient ID)
  - Use `getChatMemberKeys(chatId)` to determine member user IDs; exclude sender
- [ ] 3.2 Unify send path: remove UI usage of `useRealtimeMessages.sendMessage`; only call `useEncryption.sendEncryptedMessage`
- [ ] 3.3 Structured encrypted payload
  - Change `encrypted_content` from `cipher:iv` to JSON: `{"v":1,"c":"<base64>","iv":"<base64>"}`
  - Update decryption logic accordingly
- [ ] 3.4 Backward compatibility parser (handle legacy `cipher:iv` if present)
- [ ] 3.5 Add optional `encryption_key_version` (derive from active key fingerprint mapping) on message insert

### Enhancements
- [ ] 3.6 Add message authenticity design placeholder (signatures plan doc comment)
- [ ] 3.7 Add local caching for decrypted messages (in-memory Map keyed by messageId)
- [ ] 3.8 Add timeout / abort guard for decryption attempts (avoid UI lock on malformed messages)

### Backlog
- [ ] 3.B1 Forward secrecy via per-session ephemeral ECDH (replace RSA-OAEP) – design spec
- [ ] 3.B2 Key rotation automation scheduler
- [ ] 3.B3 Multi-device key sync + recovery flow

### Risks
- Modifying schema storage format requires ensuring no server code depends on parsing `:` delimiter.

---
## 4. Chat Application UI

### Layout & Components
- [ ] 4.1 Create `ChatShell` (parent flex container)
- [ ] 4.2 Create `ChatSidebar` (list + search + new chat)
- [ ] 4.3 Active chat header component (avatar, name, encryption badge, actions)
- [ ] 4.4 Messages list (reuse existing `ChatMessage` with minor prop adjustments)
- [ ] 4.5 Composer: input + send button + encryption status icon
- [ ] 4.6 Empty state UX (no chats, no messages)

### UX / Polish
- [ ] 4.7 Loading skeletons for sidebar + messages
- [ ] 4.8 Key fingerprint display relocated to settings dropdown
- [ ] 4.9 Responsive layout (sidebar collapsible on mobile)
- [ ] 4.10 Scroll anchoring & auto-scroll on new message (only if at bottom)

### Backlog
- [ ] 4.B1 Typing indicators
- [ ] 4.B2 Read receipts (requires message delivery status design)
- [ ] 4.B3 File / media messages pipeline

---
## 5. Data Layer & Realtime Integration

### Tasks
- [ ] 5.1 Ensure `useRealtimeChats` supports selecting first chat automatically when available
- [ ] 5.2 Centralize active chat selection state in context
- [ ] 5.3 Optimize message subscription lifecycle (unsubscribe when chat changes)
- [ ] 5.4 Add defensive null checks for chat membership before sending
- [ ] 5.5 Add minimal error boundary around encryption failure to avoid blocking entire list

### Backlog
- [ ] 5.B1 Paginated message loading (infinite scroll / cursor-based)
- [ ] 5.B2 Server-side computed last_message field updates

---
## 6. Cleanup & Deprecation

### Tasks
- [ ] 6.1 Remove obsolete pages: `Landing.tsx`, `Auth.tsx`, `Index.tsx`, `NotFound.tsx`, legacy `Chat.tsx`
- [ ] 6.2 Remove `ProtectedRoute.tsx`
- [ ] 6.3 Update imports & dead code references (ESLint pass)
- [ ] 6.4 Adjust `components.json` / shadcn not needed pages if any dynamic references
- [ ] 6.5 Update README quickstart to reflect single-page model

### Backlog
- [ ] 6.B1 Introduce feature flags for future multi-route expansions

---
## 7. Quality, Tooling & Verification

### Immediate
- [ ] 7.1 Type-safe refactor after structural changes (TS errors = fail criteria)
- [ ] 7.2 Add lightweight unit tests: encryption round-trip (if test infra practical)
- [ ] 7.3 Run `bun / npm run build` smoke test
- [ ] 7.4 Lint & format (existing eslint + any prettier if configured)

### Backlog
- [ ] 7.B1 Add vitest config & CI placeholder
- [ ] 7.B2 Introduce storybook or component harness (optional)

---
## 8. Security & Compliance Notes

### Immediate Warnings
- [ ] 8.1 Label passkey & wallet flows as non-production (no server verification) – UI banner dev mode only
- [ ] 8.2 Add console warning if sending message without authentic Supabase session
- [ ] 8.3 Document current cryptography limitations (no signatures, RSA-OAEP overhead)

### Planned
- [ ] 8.4 Choose ECDH + X25519 or P-256 for future key agreement
- [ ] 8.5 Plan signature layer (Ed25519 preferred) – design doc stub

---
## 9. Open Questions / Decisions Required
(Track as issues; unblock tasks referencing them)
- [ ] 9.1 Confirm retention of `chats` schema vs migrating to `conversations`
- [ ] 9.2 Define max participant size expectation (affects encryption scaling strategy)
- [ ] 9.3 Clarify product priority: forward secrecy vs feature expansion (scheduling)
- [ ] 9.4 Decide if pseudo-sessions should be disabled in production builds until real auth

---
## 10. Backlog / Future Enhancements (Not in current sprint)
- [ ] 10.B1 Offline queue & resend
- [ ] 10.B2 Push notifications integration
- [ ] 10.B3 Message search (encrypted index strategy required)
- [ ] 10.B4 Profile & avatar management
- [ ] 10.B5 Device management UI (list & revoke)
- [ ] 10.B6 Key transparency / public audit log

---
## 11. Implementation Order (Suggested Sequence)
1. (1.1–1.3) Core architecture shell
2. (2.1–2.3) Auth overlay baseline (email + selection) – placeholder passkey/wallet
3. (3.1–3.4) Encryption fixes (recipient bug + payload format)
4. (4.1–4.5) Chat UI extraction & integration
5. (6.1–6.3) Cleanup removed pages
6. (5.1–5.4) Data layer robustness
7. (7.1–7.3) Quality gates, smoke build
8. (8.1–8.3) Security warning surfaces
9. (Docs) README update & TODO refresh

---
## 12. Tracking Table (Roll-Up Summary)
| ID | Title | Status | Owner | Depends |
|----|-------|--------|-------|---------|
|1.1|Remove router|pending| | |
|1.2|Add ChatApp|pending| |1.1|
|2.1|AuthOverlay|pending| |1.2|
|3.1|Fix recipients|pending| |1.2,2.x|
|3.3|Payload JSON|pending| |3.1|
|4.2|ChatSidebar|pending| |1.2,5.1|
|4.4|Messages list|pending| |3.1|
|6.1|Remove pages|pending| |4.x|
|7.3|Smoke build|pending| |All above|
|8.1|Warn pseudo auth|pending| |2.x|

(Non-exhaustive; full details above.)

---
## 13. Notes for Contributors
- Keep PRs narrow: group by vertical slice (e.g., Auth Overlay in one PR, Encryption send fix in another) – reference task IDs.
- When modifying encryption format: DO NOT retro-migrate existing rows yet; implement dual-read parse first.
- Avoid adding new dependencies without justification in TODO file update.

---
## 14. Changelog (After First Updates Begin)
(Initialize after first task completion.)

---
## 15. Update Procedure
1. Implement task
2. Update status tag in this file (or separate PR if large)
3. Add note to Changelog section for notable architectural shifts
4. Keep sections stable; append rather than rewrite to preserve history

---
END OF PLAN
