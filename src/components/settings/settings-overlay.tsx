import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wallet, 
  Mail, 
  User, 
  Shield, 
  Bell, 
  Palette,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { useAppwrite } from '@/contexts/AppwriteContext';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface SettingsOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsOverlay({ open, onOpenChange }: SettingsOverlayProps) {
  const { currentAccount, currentProfile, logout } = useAppwrite();
  const [copied, setCopied] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);

  const walletAddress = currentAccount?.prefs?.walletEth || '0x...';
  const email = currentAccount?.email || '';
  const isVerified = currentAccount?.emailVerification || false;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success('Wallet address copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy address');
    }
  };

  const handleRequestVerification = async () => {
    setVerificationLoading(true);
    try {
      // In a real implementation, this would trigger email verification
      toast.info('Verification email will be sent (not yet implemented)');
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error?.message || 'Failed to send verification email');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onOpenChange(false);
      toast.success('Logged out successfully');
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error?.message || 'Failed to logout');
    }
  };

  const handleEditUsername = () => {
    setNewUsername(currentAccount?.name || '');
    setEditingUsername(true);
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    setSavingUsername(true);
    try {
      const { account } = await import('@/lib/appwrite/config/client');
      await account.updateName(newUsername.trim());
      
      toast.success('Username updated successfully!');
      setEditingUsername(false);
      
      // Refresh the page to show updated username everywhere
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      const error = err as { message?: string };
      toast.error(error?.message || 'Failed to update username');
    } finally {
      setSavingUsername(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUsername(false);
    setNewUsername('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-gray-900/95 backdrop-blur-xl border-gray-800 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            Settings & Profile
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Manage your account, wallet, and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* Profile Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Profile Information
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-gray-400">Username (Account Name)</Label>
                    {!editingUsername && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEditUsername}
                        className="h-6 text-xs text-purple-400 hover:text-purple-300"
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  {editingUsername ? (
                    <div className="space-y-2">
                      <Input
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="Enter username"
                        className="bg-gray-800 border-gray-700 text-white"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSaveUsername}
                          disabled={savingUsername}
                          className="bg-purple-600 hover:bg-purple-700 flex-1"
                        >
                          {savingUsername ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          disabled={savingUsername}
                          className="border-gray-700"
                        >
                          Cancel
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        This will be your display name and used for user discovery
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Input
                        value={currentAccount?.name || 'Not set'}
                        disabled
                        className="bg-gray-800/50 border-gray-700 text-white flex-1"
                      />
                      <Badge variant="outline" className="bg-purple-500/10 border-purple-500/30 text-purple-400">
                        @{currentAccount?.name || 'unnamed'}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400">Display Name</Label>
                  <Input
                    value={currentProfile?.displayName || currentAccount?.name || ''}
                    disabled
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-500">
                    Your display name is synced with your username
                  </p>
                </div>
              </div>

              <Separator className="bg-gray-800" />

              {/* Email Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email & Verification
                </h3>
                
                <div className="space-y-2">
                  <Label className="text-gray-400">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={email}
                      disabled
                      className="bg-gray-800/50 border-gray-700 text-white flex-1"
                    />
                    {isVerified ? (
                      <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Unverified
                      </Badge>
                    )}
                  </div>
                  {!isVerified && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRequestVerification}
                      disabled={verificationLoading}
                      className="mt-2 border-purple-600/50 text-purple-400 hover:bg-purple-600/10"
                    >
                      {verificationLoading ? 'Sending...' : 'Verify Email to Unlock Features'}
                    </Button>
                  )}
                </div>
              </div>

              <Separator className="bg-gray-800" />

              {/* Account Actions */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-300">Account Actions</h3>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* Wallet Address */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Connected Wallet
                </h3>
                
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/30">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-gray-400">Wallet Address</Label>
                      <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400">
                        Connected
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 font-mono text-sm text-white bg-black/30 p-3 rounded border border-gray-700 overflow-x-auto">
                        {walletAddress}
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleCopyAddress}
                        className="border-gray-700 hover:bg-gray-800"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Shield className="w-3 h-3" />
                      <span>Your identity is secured by blockchain signature</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-800" />

              {/* Wallet Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-300">About Web3 Auth</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full mt-2" />
                    <p>Your wallet address is your primary identity on WhisperChat</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full mt-2" />
                    <p>Email is linked for account recovery only</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full mt-2" />
                    <p>No passwords - authenticate with your wallet signature</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-purple-400 rounded-full mt-2" />
                    <p>Full control over your data and identity</p>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-800" />

              {/* View on Explorer */}
              <Button
                variant="outline"
                className="w-full border-gray-700 hover:bg-gray-800"
                asChild
              >
                <a
                  href={`https://etherscan.io/address/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Etherscan
                </a>
              </Button>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 mt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notification Preferences
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Message Notifications</Label>
                    <p className="text-xs text-gray-400">Get notified for new messages</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator className="bg-gray-800" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Token Gifts</Label>
                    <p className="text-xs text-gray-400">Notifications for received gifts</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator className="bg-gray-800" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Social Updates</Label>
                    <p className="text-xs text-gray-400">Story views, post reactions</p>
                  </div>
                  <Switch />
                </div>

                <Separator className="bg-gray-800" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Sound Effects</Label>
                    <p className="text-xs text-gray-400">Play sounds for notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Appearance Settings
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Theme</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="justify-start border-purple-600 bg-purple-600/20 text-white"
                    >
                      Dark (Active)
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-start border-gray-700"
                      disabled
                    >
                      Light (Coming Soon)
                    </Button>
                  </div>
                </div>

                <Separator className="bg-gray-800" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Compact Mode</Label>
                    <p className="text-xs text-gray-400">Reduce spacing in chat</p>
                  </div>
                  <Switch />
                </div>

                <Separator className="bg-gray-800" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-white">Animations</Label>
                    <p className="text-xs text-gray-400">Enable UI animations</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs text-center text-gray-500">
            WhisperChat v1.0.0 • Web3-First Messaging Platform
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
