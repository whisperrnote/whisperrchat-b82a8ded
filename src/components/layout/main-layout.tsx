// @generated whisperrchat-tool: main-layout hash: initial DO NOT EDIT DIRECTLY
// Main application layout

import React, { useState } from 'react';
import { Settings, Shield, LogOut, Plus, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ConversationList } from '../messaging/conversation-list';
import { ChatInterface } from '../messaging/chat-interface';
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

  const handleLogout = () => {
    onLogout();
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const handleNewConversation = () => {
    setShowNewConversationDialog(true);
  };

  const createNewConversation = async () => {
    if (!newConversationRecipient.trim()) return;

    try {
      // TODO(ai): Validate recipient exists and get their ID
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
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-gray-900 border-r flex flex-col">
        {/* User header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>
                  {getInitials(currentUser.displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2>{currentUser.displayName}</h2>
                <p className="text-sm text-gray-500">@{currentUser.username}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Shield className="w-4 h-4 mr-2" />
                  Security Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1">
          <ConversationList
            currentUser={currentUser}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            selectedConversationId={selectedConversation?.id}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ChatInterface
            conversation={selectedConversation}
            currentUser={currentUser}
            onClose={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl mb-2">Welcome to WhisperrChat</h2>
              <p className="text-gray-500 mb-4">
                Your messages are end-to-end encrypted and secured by design
              </p>
              <Button onClick={handleNewConversation}>
                <Plus className="w-4 h-4 mr-2" />
                Start a Conversation
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* New conversation dialog */}
      <Dialog 
        open={showNewConversationDialog} 
        onOpenChange={setShowNewConversationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Username</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="recipient"
                  placeholder="Enter username..."
                  value={newConversationRecipient}
                  onChange={(e) => setNewConversationRecipient(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
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
        </DialogContent>
      </Dialog>
    </div>
  );
}