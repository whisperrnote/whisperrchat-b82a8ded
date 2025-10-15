/**
 * Realtime Service
 * Minimal wrapper to subscribe to conversation and messages updates via Appwrite
 */
import { client } from '../config/client';
import { DATABASE_IDS, CHAT_TABLES } from '../config/constants';

export class RealtimeService {
  subscribeToConversation(conversationId: string, callback: (data: any) => void): () => void {
    try {
      const channel = `databases.${DATABASE_IDS.CHAT}.collections.${CHAT_TABLES.MESSAGES}.documents`;
      const unsubscribe = (client as any).subscribe(channel, (event: any) => {
        const doc = event?.payload;
        if (doc?.conversationId === conversationId) {
          callback(doc);
        }
      });
      return unsubscribe;
    } catch (e) {
      console.warn('RealtimeService: subscribe failed, returning noop', e);
      return () => {};
    }
  }
}

export const realtimeService = new RealtimeService();
