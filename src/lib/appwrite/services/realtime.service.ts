/**
 * Realtime Service (Stub)
 * TODO: Implement realtime subscriptions when needed
 */

export class RealtimeService {
  subscribeToConversation(_conversationId: string, _callback: (data: any) => void): () => void {
    console.warn('RealtimeService: subscribeToConversation not implemented');
    return () => {};
  }
}

export const realtimeService = new RealtimeService();
