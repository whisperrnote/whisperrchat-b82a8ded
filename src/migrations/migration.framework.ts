// @generated tenchat-tool: migration-framework@1.0.0 hash: initial DO NOT EDIT DIRECTLY
// Database and schema migration framework

import type { Migration, MigrationState } from '../types';

export interface MigrationExecutor {
  execute(migration: Migration): Promise<void>;
  rollback(migration: Migration): Promise<void>;
}

export interface MigrationLog {
  version: string;
  description: string;
  appliedAt: Date;
  executionTime: number;
  checksum: string;
}

/**
 * localStorage-based migration executor for frontend
 */
export class LocalStorageMigrationExecutor implements MigrationExecutor {
  async execute(migration: Migration): Promise<void> {
    console.log(`Executing migration: ${migration.version} - ${migration.description}`);
    await migration.up();
  }

  async rollback(migration: Migration): Promise<void> {
    console.log(`Rolling back migration: ${migration.version} - ${migration.description}`);
    await migration.down();
  }
}

/**
 * Main migration manager
 */
export class MigrationManager {
  private executor: MigrationExecutor;
  private storageKey = 'whisperr_migration_state';

  constructor(executor: MigrationExecutor = new LocalStorageMigrationExecutor()) {
    this.executor = executor;
  }

  /**
   * Run pending migrations
   */
  async migrate(migrations: Migration[]): Promise<void> {
    const state = this.getMigrationState();
    const pendingMigrations = this.getPendingMigrations(migrations, state);

    console.log(`Found ${pendingMigrations.length} pending migrations`);

    for (const migration of pendingMigrations) {
      const startTime = Date.now();
      
      try {
        await this.executor.execute(migration);
        
        const executionTime = Date.now() - startTime;
        const checksum = await this.calculateChecksum(migration);
        
        // Record successful migration
        this.recordMigration({
          version: migration.version,
          description: migration.description,
          appliedAt: new Date(),
          executionTime,
          checksum
        });

        console.log(`Migration ${migration.version} completed in ${executionTime}ms`);
      } catch (error) {
        console.error(`Migration ${migration.version} failed:`, error);
        throw error;
      }
    }

    // Update current version
    if (pendingMigrations.length > 0) {
      const latestVersion = pendingMigrations[pendingMigrations.length - 1].version;
      this.updateCurrentVersion(latestVersion);
    }
  }

  /**
   * Rollback to specific version
   */
  async rollbackTo(targetVersion: string, migrations: Migration[]): Promise<void> {
    const state = this.getMigrationState();
    const appliedMigrations = this.getAppliedMigrations(migrations, state);
    
    // Find migrations to rollback (in reverse order)
    const migrationsToRollback = appliedMigrations
      .filter(m => this.compareVersions(m.version, targetVersion) > 0)
      .reverse();

    console.log(`Rolling back ${migrationsToRollback.length} migrations to version ${targetVersion}`);

    for (const migration of migrationsToRollback) {
      try {
        await this.executor.rollback(migration);
        this.removeMigrationRecord(migration.version);
        console.log(`Rolled back migration ${migration.version}`);
      } catch (error) {
        console.error(`Rollback of migration ${migration.version} failed:`, error);
        throw error;
      }
    }

    this.updateCurrentVersion(targetVersion);
  }

  /**
   * Get migration status
   */
  getMigrationStatus(migrations: Migration[]): {
    currentVersion: string;
    pendingMigrations: Migration[];
    appliedMigrations: MigrationLog[];
  } {
    const state = this.getMigrationState();
    const pending = this.getPendingMigrations(migrations, state);
    const applied = this.getAppliedMigrationLogs();

    return {
      currentVersion: state.currentVersion,
      pendingMigrations: pending,
      appliedMigrations: applied
    };
  }

  /**
   * Validate migration integrity
   */
  async validateMigrations(migrations: Migration[]): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    const appliedLogs = this.getAppliedMigrationLogs();

    // Check for version conflicts
    const versions = migrations.map(m => m.version);
    const duplicates = versions.filter((v, i) => versions.indexOf(v) !== i);
    if (duplicates.length > 0) {
      errors.push(`Duplicate migration versions: ${duplicates.join(', ')}`);
    }

    // Validate applied migrations still exist
    for (const log of appliedLogs) {
      const migration = migrations.find(m => m.version === log.version);
      if (!migration) {
        errors.push(`Applied migration ${log.version} not found in migration list`);
        continue;
      }

      // Validate checksum
      const currentChecksum = await this.calculateChecksum(migration);
      if (currentChecksum !== log.checksum) {
        errors.push(`Migration ${log.version} checksum mismatch - migration may have been modified`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get migration state from storage
   */
  private getMigrationState(): MigrationState {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const state = JSON.parse(stored);
        return {
          currentVersion: state.currentVersion || '0.0.0',
          pendingMigrations: [],
          appliedMigrations: state.appliedMigrations || []
        };
      }
    } catch (error) {
      console.error('Failed to load migration state:', error);
    }

    return {
      currentVersion: '0.0.0',
      pendingMigrations: [],
      appliedMigrations: []
    };
  }

  /**
   * Get pending migrations
   */
  private getPendingMigrations(allMigrations: Migration[], state: MigrationState): Migration[] {
    return allMigrations
      .filter(m => this.compareVersions(m.version, state.currentVersion) > 0)
      .sort((a, b) => this.compareVersions(a.version, b.version));
  }

  /**
   * Get applied migrations
   */
  private getAppliedMigrations(allMigrations: Migration[], state: MigrationState): Migration[] {
    return allMigrations
      .filter(m => this.compareVersions(m.version, state.currentVersion) <= 0)
      .sort((a, b) => this.compareVersions(b.version, a.version));
  }

  /**
   * Record successful migration
   */
  private recordMigration(log: MigrationLog): void {
    try {
      const state = this.getMigrationState();
      const logs = this.getAppliedMigrationLogs();
      
      logs.push(log);
      
      const updatedState = {
        currentVersion: state.currentVersion,
        appliedMigrations: logs.map(l => l.version)
      };

      localStorage.setItem(this.storageKey, JSON.stringify(updatedState));
      localStorage.setItem(`${this.storageKey}_logs`, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to record migration:', error);
    }
  }

  /**
   * Remove migration record
   */
  private removeMigrationRecord(version: string): void {
    try {
      const logs = this.getAppliedMigrationLogs().filter(l => l.version !== version);
      const state = this.getMigrationState();
      
      const updatedState = {
        currentVersion: state.currentVersion,
        appliedMigrations: logs.map(l => l.version)
      };

      localStorage.setItem(this.storageKey, JSON.stringify(updatedState));
      localStorage.setItem(`${this.storageKey}_logs`, JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to remove migration record:', error);
    }
  }

  /**
   * Update current version
   */
  private updateCurrentVersion(version: string): void {
    try {
      const state = this.getMigrationState();
      const updatedState = {
        ...state,
        currentVersion: version
      };

      localStorage.setItem(this.storageKey, JSON.stringify(updatedState));
    } catch (error) {
      console.error('Failed to update current version:', error);
    }
  }

  /**
   * Get applied migration logs
   */
  private getAppliedMigrationLogs(): MigrationLog[] {
    try {
      const stored = localStorage.getItem(`${this.storageKey}_logs`);
      if (stored) {
        const logs = JSON.parse(stored);
        return logs.map((log: any) => ({
          ...log,
          appliedAt: new Date(log.appliedAt)
        }));
      }
    } catch (error) {
      console.error('Failed to load migration logs:', error);
    }
    return [];
  }

  /**
   * Compare version strings
   */
  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;

      if (aPart > bPart) return 1;
      if (aPart < bPart) return -1;
    }

    return 0;
  }

  /**
   * Calculate migration checksum
   */
  private async calculateChecksum(migration: Migration): Promise<string> {
    const content = `${migration.version}:${migration.description}:${migration.up.toString()}:${migration.down.toString()}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

/**
 * Pre-defined migrations
 */
export const INITIAL_MIGRATIONS: Migration[] = [
  {
    version: '1.0.0',
    description: 'Initialize application schema',
    up: async () => {
      // Initialize application data structures
      const initialData = {
        version: '1.0.0',
        initialized: true,
        timestamp: Date.now()
      };
      localStorage.setItem('whisperr_app_data', JSON.stringify(initialData));
    },
    down: async () => {
      localStorage.removeItem('whisperr_app_data');
    }
  },
  {
    version: '1.0.1',
    description: 'Add conversation settings schema',
    up: async () => {
      // Migration to add settings to existing conversations
      const conversations = localStorage.getItem('whisperr_messaging_data');
      if (conversations) {
        const data = JSON.parse(conversations);
        // Add default settings to conversations without them
        data.conversations = data.conversations.map(([id, conv]: [string, any]) => [
          id,
          {
            ...conv,
            metadata: {
              ...conv.metadata,
              settings: conv.metadata.settings || {
                ephemeralEnabled: false,
                notificationsEnabled: true,
                blockchainAnchoringEnabled: false
              }
            }
          }
        ]);
        localStorage.setItem('whisperr_messaging_data', JSON.stringify(data));
      }
    },
    down: async () => {
      // Remove settings from conversations
      const conversations = localStorage.getItem('whisperr_messaging_data');
      if (conversations) {
        const data = JSON.parse(conversations);
        data.conversations = data.conversations.map(([id, conv]: [string, any]) => [
          id,
          {
            ...conv,
            metadata: {
              name: conv.metadata.name,
              avatar: conv.metadata.avatar,
              description: conv.metadata.description
            }
          }
        ]);
        localStorage.setItem('whisperr_messaging_data', JSON.stringify(data));
      }
    }
  }
];

// Export singleton instance
export const migrationManager = new MigrationManager();