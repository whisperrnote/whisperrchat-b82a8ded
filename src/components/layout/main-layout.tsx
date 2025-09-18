import React, { useState } from 'react';
import { Settings, Shield, LogOut, Plus, Search } from 'lucide-react';
import { ConversationList } from '../messaging/conversation-list';
import { ChatInterface } from '../messaging/chat-interface';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import type { User, Conversation } from '../../types';
import { messagingService } from '../../services';

interface MainLayoutProps {
  currentUser: User;
  onLogout: () => void;
}

export function MainLayout({ currentUser, onLogout }: MainLayoutProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [newConversationRecipient, setNewConversationRecipient] = useState('');

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleNewConversation = () => {
    setShowNewConversationDialog(true);
  };

  const createNewConversation = async () => {
    if (!newConversationRecipient.trim()) return;

    try {
      const recipientId = newConversationRecipient.trim();
      
      const conversation = await messagingService.createConversation([
        currentUser.id,
        recipientId
      ]);

      setSelectedConversation(conversation);
      setShowNewConversationDialog(false);
      setNewConversationRecipient('');
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Card className="w-80 flex flex-col bg-card border-r border-border">
        {/* User header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(currentUser.displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {currentUser.displayName}
                </h2>
                <p className="text-sm text-muted-foreground">
                  @{currentUser.username}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-hidden">
          <ConversationList
            currentUser={currentUser}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            selectedConversationId={selectedConversation?.id}
          />
        </div>
      </Card>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatInterface
            conversation={selectedConversation}
            currentUser={currentUser}
            onClose={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">
                Welcome to WhisperrChat
              </h2>
              <p className="text-muted-foreground mb-6">
                Your messages are end-to-end encrypted and secured by design
              </p>
              <Button onClick={handleNewConversation} className="gap-2">
                <Plus className="w-4 h-4" />
                Start a Conversation
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New conversation dialog */}
      {showNewConversationDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Start New Conversation</h3>
            <div className="space-y-4">
              <Input
                placeholder="Enter username..."
                value={newConversationRecipient}
                onChange={(e) => setNewConversationRecipient(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowNewConversationDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={createNewConversation}
                  disabled={!newConversationRecipient.trim()}
                >
                  Start Chat
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}