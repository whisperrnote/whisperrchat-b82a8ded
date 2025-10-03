/**
 * Appwrite Client Configuration
 */

import { Client, Account, Databases, Storage, Functions, Realtime } from 'appwrite';

// Get environment variables
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'tenchat';

// Initialize Appwrite Client
export const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

// Export service instances
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const realtime = new Realtime(client);

// Export client for advanced usage
export { Client };

// Helper to check if Appwrite is configured
export const isConfigured = () => {
  return Boolean(ENDPOINT && PROJECT_ID);
};

// Helper to get current configuration
export const getConfig = () => ({
  endpoint: ENDPOINT,
  projectId: PROJECT_ID,
});
