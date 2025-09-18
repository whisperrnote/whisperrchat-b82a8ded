// @generated whisperrchat-tool: main-layout hash: initial DO NOT EDIT DIRECTLY
// Main application layout

import { useState } from 'react';
import { Settings, Shield, LogOut, Plus, Search } from 'lucide-react';
import { ConversationList } from '../messaging/conversation-list';
import { ChatInterface } from '../messaging/chat-interface';
import { Paper, Box, Typography, IconButton, Avatar as MuiAvatar, Button as MuiButton, Dialog, DialogTitle, DialogContent, TextField } from '@mui/material';
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
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Paper 
        sx={{ 
          width: 320, 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* User header */}
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <MuiAvatar sx={{ bgcolor: '#8b5cf6' }}>
                {getInitials(currentUser.displayName)}
              </MuiAvatar>
              <Box>
                <Typography variant="h6" sx={{ color: 'white' }}>
                  {currentUser.displayName}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  @{currentUser.username}
                </Typography>
              </Box>
            </Box>
            <IconButton sx={{ color: '#8b5cf6' }}>
              <Settings />
            </IconButton>
          </Box>
        </Box>

        {/* Conversation list */}
        <Box sx={{ flex: 1 }}>
          <ConversationList
            currentUser={currentUser}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            selectedConversationId={selectedConversation?.id}
          />
        </Box>
      </Paper>

      {/* Main content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (
          <ChatInterface
            conversation={selectedConversation}
            currentUser={currentUser}
            onClose={() => setSelectedConversation(null)}
          />
        ) : (
          <Box 
            sx={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <Box>
              <Box 
                sx={{ 
                  width: 64, 
                  height: 64, 
                  bgcolor: 'rgba(139, 92, 246, 0.2)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mx: 'auto', 
                  mb: 2 
                }}
              >
                <Shield style={{ color: '#8b5cf6', fontSize: 32 }} />
              </Box>
              <Typography variant="h5" sx={{ mb: 1, color: 'white' }}>
                Welcome to WhisperrChat
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                Your messages are end-to-end encrypted and secured by design
              </Typography>
              <MuiButton 
                variant="contained" 
                onClick={handleNewConversation}
                sx={{ 
                  bgcolor: '#8b5cf6', 
                  '&:hover': { bgcolor: '#7c3aed' },
                  textTransform: 'none'
                }}
              >
                <Plus style={{ marginRight: 8, fontSize: 16 }} />
                Start a Conversation
              </MuiButton>
            </Box>
          </Box>
        )}
      </Box>

      {/* New conversation dialog */}
      <Dialog 
        open={showNewConversationDialog} 
        onClose={() => setShowNewConversationDialog(false)}
      >
        <DialogContent sx={{ bgcolor: 'rgba(139, 92, 246, 0.1)', backdropFilter: 'blur(10px)' }}>
          <DialogTitle sx={{ color: 'white' }}>Start New Conversation</DialogTitle>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Recipient Username"
              placeholder="Enter username..."
              value={newConversationRecipient}
              onChange={(e) => setNewConversationRecipient(e.target.value)}
              sx={{
                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.5)' },
                  '&:hover fieldset': { borderColor: '#8b5cf6' },
                }
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
              <MuiButton 
                onClick={() => setShowNewConversationDialog(false)}
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                Cancel
              </MuiButton>
              <MuiButton 
                variant="contained"
                onClick={createNewConversation}
                disabled={!newConversationRecipient.trim()}
                sx={{ 
                  bgcolor: '#8b5cf6', 
                  '&:hover': { bgcolor: '#7c3aed' }
                }}
              >
                Start Chat
              </MuiButton>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}