import React, { useState } from 'react';
import { Settings, Shield, LogOut, Plus, Search } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '../ui/resizable';
import { ConversationList } from '../messaging/conversation-list';
import { ChatInterface } from '../messaging/chat-interface';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import type { User, Conversation } from '../../types';
import { messagingService } from '../../services';

interface MainLayoutProps {
  currentUser: User | null;
  onLogin: () => void;
}

export function MainLayout({ currentUser, onLogin }: MainLayoutProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

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
    <ContextMenu>
      <ContextMenuTrigger>
        <ResizablePanelGroup direction="horizontal" className="h-screen bg-background">
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <Card className="h-full flex flex-col bg-card border-r border-border rounded-none">
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
                        <div>
                          <h2 className="text-lg font-semibold text-foreground">
                            {currentUser.displayName}
                          </h2>
                          <p className="text-sm text-muted-foreground">
                        {currentUser.id}
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
                      selectedConversationId={selectedConversation?.id}
                    />
                  </div>
                </>
              ) : (
                <div className="p-4 border-b border-border">
                  <Button className="w-full" onClick={onLogin}>Connect Wallet</Button>
                </div>
              )}
            </Card>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={75}>
            <div className="flex-1 flex flex-col h-full">
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
                      Welcome to TenChat
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
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => window.location.reload()}>
          Reload
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem disabled>
          TenChat v0.1.0
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}