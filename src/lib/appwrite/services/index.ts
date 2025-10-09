/**
 * Appwrite Services
 * Central export for all service modules
 */

export * from './auth.service';
export * from './user.service';
export * from './messaging.service';
export * from './contacts.service';
export * from './storage.service';

// Export service instances for direct use
export { authService } from './auth.service';
export { userService } from './user.service';
export { messagingService } from './messaging.service';
export { contactsService } from './contacts.service';
export { storageService } from './storage.service';
