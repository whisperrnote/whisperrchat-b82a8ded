import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquarePlus,
  UserPlus,
  Users,
  Search,
  AtSign,
  Wallet,
  QrCode,
  Loader2,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface NewChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewChatModal({ open, onOpenChange }: NewChatModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('username');

  const handleStartChat = async (identifier: string, type: 'username' | 'wallet' | 'group') => {
    setLoading(true);
    try {
      // TODO: Implement chat initiation logic
      console.log('Starting chat with:', identifier, 'type:', type);
      // Close modal after successful chat creation
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to start chat:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gray-900/95 backdrop-blur-xl border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-violet-400" />
            Start New Chat
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Search for users by username, wallet address, or create a group chat
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="username" className="data-[state=active]:bg-violet-600">
              <AtSign className="w-4 h-4 mr-1" />
              Username
            </TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-violet-600">
              <Wallet className="w-4 h-4 mr-1" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="group" className="data-[state=active]:bg-violet-600">
              <Users className="w-4 h-4 mr-1" />
              Group
            </TabsTrigger>
          </TabsList>

          <TabsContent value="username" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">
                Search by Username
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="username"
                  placeholder="@username"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>

            {searchQuery && (
              <div className="space-y-2">
                <Label className="text-gray-400 text-xs">Results</Label>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {/* Mock results */}
                  {['alice.eth', 'bob.eth', 'charlie.crypto'].map((user) => (
                    <Button
                      key={user}
                      variant="ghost"
                      className="w-full justify-start hover:bg-gray-800"
                      onClick={() => handleStartChat(user, 'username')}
                    >
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className="bg-violet-600">
                          {user[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-white">@{user}</span>
                      <Badge className="ml-auto bg-green-900/30 text-green-400 border-green-700/30">
                        Online
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => handleStartChat(searchQuery, 'username')}
              disabled={!searchQuery || loading}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting Chat...
                </>
              ) : (
                <>
                  <MessageSquarePlus className="w-4 h-4 mr-2" />
                  Start Chat
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="wallet" className="text-gray-300">
                Wallet Address
              </Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  id="wallet"
                  placeholder="0x..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white font-mono text-sm"
                />
              </div>
              <p className="text-xs text-gray-500">
                Enter an Ethereum wallet address
              </p>
            </div>

            <Button
              onClick={() => handleStartChat(searchQuery, 'wallet')}
              disabled={!searchQuery || loading}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting Chat...
                </>
              ) : (
                <>
                  <MessageSquarePlus className="w-4 h-4 mr-2" />
                  Start Chat
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 py-2">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-xs text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>

            <Button
              variant="outline"
              className="w-full border-gray-700 hover:bg-gray-800"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR Code
            </Button>
          </TabsContent>

          <TabsContent value="group" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="groupName" className="text-gray-300">
                Group Name
              </Label>
              <Input
                id="groupName"
                placeholder="Enter group name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <Button
              onClick={() => handleStartChat(searchQuery, 'group')}
              disabled={!searchQuery || loading}
              className="w-full bg-violet-600 hover:bg-violet-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Group...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4 mr-2" />
                  Create Group
                </>
              )}
            </Button>

            <div className="space-y-2 pt-2">
              <Label className="text-gray-400 text-xs">Add Members</Label>
              <p className="text-xs text-gray-500">
                You'll be able to add members after creating the group
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
