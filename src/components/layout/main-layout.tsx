import React, { useState } from 'react';
import { Settings, Shield, LogOut, Plus, Search, Gift, Users } from 'lucide-react';
import { ConversationList } from '../messaging/conversation-list';
import { ChatInterface } from '../messaging/chat-interface';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import type { User, Conversation } from '../../types';
import { messagingService } from '../../services';
import { NewSidebar } from '../ui/new-sidebar';
import { SecondarySidebar } from '../ui/secondary-sidebar';
import { BottomBar } from '../ui/bottom-bar';
import { cn } from '../ui/utils';

interface MainLayoutProps {
  currentUser: User | null;
}

export function MainLayout({ currentUser }: MainLayoutProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSecondarySidebarCollapsed, setIsSecondarySidebarCollapsed] = useState(true);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
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
    <div className="flex h-screen bg-background text-foreground violet">
      <NewSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className={cn(
          'h-full',
          'md:flex'
        )}
      >
        {currentUser ? (
          <>
            {/* User header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(currentUser.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  {!isSidebarCollapsed && (
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        {currentUser.displayName}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        @{currentUser.username}
                      </p>
                    </div>
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-hidden">
              <ConversationList
                currentUser={currentUser}
                onSelectConversation={handleSelectConversation}
                selectedConversationId={selectedConversation?.id}
              />
            </div>
          </>
        ) : (
          <div className="p-4 border-b border-border">
            <Button className="w-full">Connect Wallet</Button>
          </div>
        )}
      </NewSidebar>
      <main className="flex-1 flex flex-col h-full">
        {currentUser && selectedConversation ? (
          <ChatInterface
            conversation={selectedConversation}
            currentUser={currentUser}
            onClose={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-background p-8">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-12 h-12 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Welcome to WhisperrChat
              </h1>
              <p className="text-lg text-muted-foreground">
                A secure, private, and decentralized messaging application.
                Your conversations are end-to-end encrypted, ensuring that only you and your recipient can read them.
              </p>
              {currentUser ? (
                <p className="text-muted-foreground pt-4">
                  To get started, click the <Plus className="inline-block h-4 w-4 mx-1" /> icon in the sidebar to begin a new conversation.
                </p>
              ) : (
                <p className="text-muted-foreground pt-4">
                  Please connect your wallet to start chatting.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
      <SecondarySidebar
        isCollapsed={isSecondarySidebarCollapsed}
        onToggle={() => setIsSecondarySidebarCollapsed(!isSecondarySidebarCollapsed)}
        className="h-full hidden md:flex"
      >
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {isSecondarySidebarCollapsed ? <Gift /> : "Gifting & Discovery"}
          </h2>
        </div>
      </SecondarySidebar>
      <BottomBar className="md:hidden">
        <div className="flex justify-around">
          <Button variant="ghost" size="icon">
            <Search className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Plus className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Users className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Gift className="h-6 w-6" />
          </Button>
        </div>
      </BottomBar>
    </div>
  );
}