import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Send, 
  Plus, 
  Search, 
  MoreVertical, 
  Shield, 
  Lock,
  Phone,
  Video,
  Settings,
  LogOut,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Chat = () => {
  const [message, setMessage] = useState("");
  const { user, signOut } = useAuth();

  const conversations = [
    {
      id: 1,
      name: "Alice Cooper",
      lastMessage: "The files are encrypted and ready...",
      time: "2m",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150",
      online: true,
      encrypted: true
    },
    {
      id: 2,
      name: "Security Team",
      lastMessage: "New protocol implemented successfully",
      time: "15m",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      online: false,
      encrypted: true,
      isGroup: true
    },
    {
      id: 3,
      name: "Bob Johnson",
      lastMessage: "Thanks for the secure connection",
      time: "1h",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      online: true,
      encrypted: true
    }
  ];

  const messages = [
    {
      id: 1,
      text: "Hey! How's the new encryption protocol working?",
      sender: "Alice Cooper",
      time: "10:30 AM",
      sent: false
    },
    {
      id: 2,
      text: "It's working perfectly! The end-to-end encryption is seamless.",
      sender: "You",
      time: "10:32 AM",
      sent: true
    },
    {
      id: 3,
      text: "That's great to hear. The blockchain integration really makes a difference in security.",
      sender: "Alice Cooper",
      time: "10:33 AM",
      sent: false
    },
    {
      id: 4,
      text: "Absolutely! No more worrying about message interception.",
      sender: "You",
      time: "10:35 AM",
      sent: true
    }
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-sidebar flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-sidebar-foreground">Whisperrchat</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-10 bg-sidebar-accent border-sidebar-border"
            />
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-colors"
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={conversation.avatar} />
                    <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-security rounded-full border-2 border-sidebar"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sidebar-foreground truncate">
                        {conversation.name}
                      </span>
                      {conversation.encrypted && (
                        <Lock className="w-3 h-3 text-security" />
                      )}
                      {conversation.isGroup && (
                        <Badge variant="secondary" className="text-xs">Group</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{conversation.time}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* New Chat Button */}
        <div className="p-4 border-t border-sidebar-border">
          <Button className="w-full bg-gradient-primary hover:opacity-90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150" />
                <AvatarFallback>AC</AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">Alice Cooper</h2>
                  <Shield className="w-4 h-4 text-security" />
                </div>
                <p className="text-sm text-muted-foreground">Online • End-to-end encrypted</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    msg.sent
                      ? 'bg-chat-bubble-sent text-chat-bubble-sent-foreground'
                      : 'bg-chat-bubble-received text-chat-bubble-received-foreground'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sent 
                      ? 'text-chat-bubble-sent-foreground/70' 
                      : 'text-chat-bubble-received-foreground/70'
                  }`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Type a secure message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="pr-12"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      // Handle send message
                      setMessage("");
                    }
                  }}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Lock className="w-4 h-4 text-security" />
                </div>
              </div>
              <Button 
                size="icon" 
                className="bg-gradient-primary hover:opacity-90 text-white"
                onClick={() => setMessage("")}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Shield className="w-3 h-3 text-security" />
              Messages are end-to-end encrypted and secured by blockchain
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;