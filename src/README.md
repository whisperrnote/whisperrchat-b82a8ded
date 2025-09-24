# TenChat - Privacy-First E2EE Messaging Platform

> **⚠️ Important**: This is a development prototype. Not intended for production use with sensitive data.

TenChat is an extensible, privacy-first end-to-end encrypted messaging platform built with modular service boundaries, forward-compatible versioning, and optional blockchain anchoring capabilities.

## 🔐 Core Security Features

- **End-to-End Encryption**: Signal Protocol implementation with X3DH key agreement and Double Ratchet
- **Client-Side Key Generation**: All cryptographic keys generated and stored locally
- **Forward Secrecy**: Messages remain secure even if long-term keys are compromised
- **Post-Compromise Security**: Automatic key rotation and healing
- **Zero Server-Side Plaintext**: No decrypted messages ever leave your device

## 🏗️ Architecture

### Modular Service Boundaries
- **Authentication Service**: Identity management with local key generation
- **Messaging Service**: E2EE message handling with real-time capabilities
- **Cryptography Service**: Signal Protocol implementation (X25519, Ed25519, AES-256-GCM)
- **Key Management Service**: Secure key lifecycle and session management
- **Blockchain Service**: Optional message anchoring with provider abstraction
- **Plugin Service**: Extensible framework with sandboxing and policy enforcement

### Technology Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Cryptography**: Web Crypto API with Signal Protocol
- **Storage**: Browser localStorage (encrypted)
- **Architecture**: Service-oriented with contract-based APIs

## 🚀 Getting Started

### Prerequisites
- Modern browser with Web Crypto API support
- Node.js 18+ (for development)

### Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd whisperrchat
   npm install
   ```

2. **Development Server**
   ```bash
   npm run dev
   ```

3. **Create Account**
   - Open the application in your browser
   - Click "Sign Up" to create a new account
   - Your encryption keys will be generated automatically

4. **Start Messaging**
   - Click "New Chat" to start a conversation
   - Enter a recipient username
   - All messages are automatically encrypted

## 🔧 Key Components

### Cryptographic Implementation
```typescript
// Signal Protocol with X3DH and Double Ratchet
const identity = await cryptoService.generateIdentity();
const session = await cryptoService.initializeSession(sharedSecret);
const { ciphertext, nonce } = await cryptoService.encryptMessage(plaintext, messageKey);
```

### Plugin Framework
```typescript
// Extensible plugin system with security policy
const plugin = await pluginService.installPlugin(manifest, code);
await pluginService.executeHooks(event, context);
```

### Blockchain Anchoring
```typescript
// Optional message notarization
const anchor = await notarizationService.anchorMessages(messageHashes);
const verified = await notarizationService.verifyAnchor(anchor);
```

## 📋 Features

### ✅ Implemented
- [x] Signal Protocol E2EE (X25519, Ed25519, AES-256-GCM)
- [x] X3DH key agreement protocol
- [x] Double Ratchet message encryption
- [x] Local identity and key management
- [x] Real-time messaging interface
- [x] Conversation management
- [x] Plugin framework with sandboxing
- [x] Blockchain anchoring abstraction
- [x] Forward-compatible API contracts
- [x] Database migration framework
- [x] Comprehensive crypto testing

### 🚧 Planned
- [ ] Group messaging with member management
- [ ] File and media encryption
- [ ] Voice/video call encryption
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] Server infrastructure
- [ ] Production blockchain integration

## 🧪 Testing

### Run Crypto Tests
```typescript
// In browser console or test environment
import { runCryptoTests } from './tests/crypto.test';
await runCryptoTests();
```

### Test Coverage
- **Cryptography**: Property-based testing with 50+ test cases
- **Key Management**: Session lifecycle and rotation testing
- **Messaging**: E2EE roundtrip and protocol testing
- **Contracts**: API compatibility and migration testing

## 🔐 Security Model

### Threat Model
- **Trusted**: Client devices, user's browser
- **Semi-Trusted**: Application code, CDN
- **Untrusted**: Network, servers, third parties

### Cryptographic Primitives
- **Identity Keys**: X25519 (ECDH) + Ed25519 (Signatures)
- **Session Establishment**: X3DH protocol
- **Message Encryption**: Double Ratchet + AES-256-GCM
- **Key Derivation**: HKDF with SHA-256
- **Random Generation**: Crypto.getRandomValues()

### Privacy Guarantees
- No plaintext messages stored server-side
- Minimal metadata collection
- Optional blockchain anchoring
- Client-side key generation and storage

## 📡 API Contracts

### Forward-Compatible Versioning
```typescript
// API contract with version negotiation
const contract: AuthContract = {
  version: '1.0.0',
  endpoints: {
    login: { method: 'POST', path: '/api/v1/auth/login', ... },
    register: { method: 'POST', path: '/api/v1/auth/register', ... }
  }
};
```

### Migration Framework
```typescript
// Database schema evolution
const migration: Migration = {
  version: '1.0.1',
  description: 'Add conversation settings',
  up: async () => { /* forward migration */ },
  down: async () => { /* rollback logic */ }
};
```

## 🔌 Plugin Development

### Plugin Manifest
```typescript
const manifest: PluginManifest = {
  permissions: [
    { type: 'messaging', description: 'Send messages', required: true }
  ],
  hooks: [
    { event: 'message:received', handler: 'onMessage', priority: 10 }
  ]
};
```

### Security Policy
- Sandboxed execution environment
- Permission-based access control
- Policy enforcement at runtime
- Audit logging for plugin actions

## 🌐 Blockchain Integration

### Provider Abstraction
```typescript
interface BlockchainProvider {
  estimateGas(operation: string): Promise<string>;
  submitTransaction(tx: any): Promise<string>;
  getTransactionStatus(txHash: string): Promise<string>;
}
```

### Circuit Breaker Pattern
- Automatic failover between providers
- Rate limiting and retry logic
- Gas price caching and optimization

## 📚 Documentation

### Key Files
- `/guidelines/Guidelines.md` - Comprehensive development guidelines
- `/specs/frontend.json` - Frontend architecture specification
- `/contracts/api.contracts.ts` - API contract definitions
- `/migrations/migration.framework.ts` - Database migration system
- `/tests/crypto.test.ts` - Cryptographic test suite

### Guidelines Compliance
This implementation follows the comprehensive guidelines in `/guidelines/Guidelines.md`, including:
- E2EE boundaries and security requirements
- Modular architecture patterns
- Forward-compatible versioning
- Plugin framework design
- Migration and contract strategies

## 🤝 Contributing

1. Read the guidelines in `/guidelines/Guidelines.md`
2. Follow the commit message convention
3. Ensure all tests pass
4. Maintain API contract compatibility
5. Document security implications

## ⚖️ License

MIT License - See LICENSE file for details

## 🔍 Security Audit

This is a development prototype. Before production use:
- Conduct comprehensive security audit
- Penetration testing of crypto implementation
- Code review by cryptography experts
- Formal verification of protocol correctness

## 📞 Support

For questions or issues:
- Check the documentation in `/guidelines/`
- Review the architecture in `/specs/`
- Run the test suite for validation
- Open an issue with detailed context

---

**Remember**: TenChat prioritizes privacy and security by design. All encryption happens on your device, and no one else can read your messages.