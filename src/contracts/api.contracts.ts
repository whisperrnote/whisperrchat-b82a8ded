// @generated whisperrchat-tool: api-contracts@1.0.0 hash: initial DO NOT EDIT DIRECTLY
// API contract definitions for forward-compatible versioning

export const API_VERSION = {
  MAJOR: 1,
  MINOR: 0,
  PATCH: 0
} as const;

export interface ContractValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Authentication API contract
 */
export interface AuthContract {
  version: string;
  endpoints: {
    login: {
      method: 'POST';
      path: '/api/v1/auth/login';
      request: {
        username: string;
        password: string;
      };
      response: {
        success: boolean;
        user?: {
          id: string;
          username: string;
          displayName: string;
        };
        token?: string;
        error?: string;
      };
    };
    register: {
      method: 'POST';
      path: '/api/v1/auth/register';
      request: {
        username: string;
        password: string;
        displayName: string;
      };
      response: {
        success: boolean;
        user?: {
          id: string;
          username: string;
          displayName: string;
        };
        token?: string;
        error?: string;
      };
    };
    refresh: {
      method: 'POST';
      path: '/api/v1/auth/refresh';
      request: {};
      response: {
        token: string;
      };
    };
  };
}

/**
 * Messaging API contract
 */
export interface MessagingContract {
  version: string;
  endpoints: {
    sendMessage: {
      method: 'POST';
      path: '/api/v1/messages';
      request: {
        recipientId: string;
        ciphertext: string;
        nonce: string;
        ratchetHeader: string;
      };
      response: {
        success: boolean;
        messageId?: string;
        error?: string;
      };
    };
    getMessages: {
      method: 'GET';
      path: '/api/v1/conversations/{conversationId}/messages';
      request: {
        limit?: number;
        before?: string;
      };
      response: {
        messages: Array<{
          id: string;
          senderId: string;
          recipientId: string;
          ciphertext: string;
          nonce: string;
          timestamp: string;
          ratchetHeader: string;
        }>;
      };
    };
    createConversation: {
      method: 'POST';
      path: '/api/v1/conversations';
      request: {
        participants: string[];
        type: 'direct' | 'group';
      };
      response: {
        conversation: {
          id: string;
          participants: string[];
          type: 'direct' | 'group';
          createdAt: string;
        };
      };
    };
  };
}

/**
 * Key Management API contract
 */
export interface KeyManagementContract {
  version: string;
  endpoints: {
    publishPreKeys: {
      method: 'POST';
      path: '/api/v1/keys/prekeys';
      request: {
        signedPreKey: string;
        oneTimePreKeys: string[];
        signature: string;
      };
      response: {
        success: boolean;
      };
    };
    getPreKeys: {
      method: 'GET';
      path: '/api/v1/keys/prekeys/{userId}';
      request: {};
      response: {
        identityKey: string;
        signedPreKey: string;
        oneTimePreKey?: string;
      };
    };
  };
}

/**
 * Blockchain API contract
 */
export interface BlockchainContract {
  version: string;
  endpoints: {
    anchorMessages: {
      method: 'POST';
      path: '/api/v1/blockchain/anchor';
      request: {
        messageHashes: string[];
      };
      response: {
        anchors: Array<{
          merkleRoot: string;
          txHash: string;
          blockHeight: number;
          timestamp: string;
        }>;
      };
    };
    verifyAnchor: {
      method: 'GET';
      path: '/api/v1/blockchain/verify/{txHash}';
      request: {};
      response: {
        verified: boolean;
        anchor?: {
          merkleRoot: string;
          blockHeight: number;
          timestamp: string;
        };
      };
    };
  };
}

/**
 * Contract validation utilities
 */
export class ContractValidator {
  static validateAuthContract(data: any): ContractValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate version
    if (!data.version || typeof data.version !== 'string') {
      errors.push('Contract version is required and must be a string');
    }

    // Validate endpoints structure
    if (!data.endpoints || typeof data.endpoints !== 'object') {
      errors.push('Endpoints object is required');
    } else {
      const requiredEndpoints = ['login', 'register', 'refresh'];
      for (const endpoint of requiredEndpoints) {
        if (!data.endpoints[endpoint]) {
          errors.push(`Missing required endpoint: ${endpoint}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateMessagingContract(data: any): ContractValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.version) {
      errors.push('Contract version is required');
    }

    if (!data.endpoints?.sendMessage) {
      errors.push('sendMessage endpoint is required');
    }

    if (!data.endpoints?.getMessages) {
      errors.push('getMessages endpoint is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateKeyManagementContract(data: any): ContractValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.version) {
      errors.push('Contract version is required');
    }

    if (!data.endpoints?.publishPreKeys) {
      errors.push('publishPreKeys endpoint is required');
    }

    if (!data.endpoints?.getPreKeys) {
      errors.push('getPreKeys endpoint is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateBlockchainContract(data: any): ContractValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.version) {
      errors.push('Contract version is required');
    }

    if (!data.endpoints?.anchorMessages) {
      errors.push('anchorMessages endpoint is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Contract migration utilities
 */
export class ContractMigration {
  static migrateAuthContract(fromVersion: string, toVersion: string, data: any): any {
    // TODO(ai): Implement contract migration logic
    console.log(`Migrating auth contract from ${fromVersion} to ${toVersion}`);
    return data;
  }

  static migrateMessagingContract(fromVersion: string, toVersion: string, data: any): any {
    // TODO(ai): Implement contract migration logic
    console.log(`Migrating messaging contract from ${fromVersion} to ${toVersion}`);
    return data;
  }
}

/**
 * Version negotiation utilities
 */
export class VersionNegotiator {
  static isCompatible(clientVersion: string, serverVersion: string): boolean {
    const client = this.parseVersion(clientVersion);
    const server = this.parseVersion(serverVersion);

    // Major version must match
    if (client.major !== server.major) {
      return false;
    }

    // Client minor version must be <= server minor version
    return client.minor <= server.minor;
  }

  static parseVersion(version: string): { major: number; minor: number; patch: number } {
    const parts = version.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0
    };
  }

  static selectBestVersion(clientVersions: string[], serverVersions: string[]): string | null {
    // Find the highest compatible version
    for (const serverVersion of serverVersions.sort().reverse()) {
      for (const clientVersion of clientVersions) {
        if (this.isCompatible(clientVersion, serverVersion)) {
          return serverVersion;
        }
      }
    }
    return null;
  }
}

/**
 * Contract registry
 */
export const CONTRACT_REGISTRY = {
  auth: {
    version: '1.0.0',
    validator: ContractValidator.validateAuthContract
  },
  messaging: {
    version: '1.0.0',
    validator: ContractValidator.validateMessagingContract
  },
  keyManagement: {
    version: '1.0.0',
    validator: ContractValidator.validateKeyManagementContract
  },
  blockchain: {
    version: '1.0.0',
    validator: ContractValidator.validateBlockchainContract
  }
} as const;