/**
 * Settings Modal Component
 * Allows users to view and edit their profile settings
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Wallet, 
  Bell, 
  Shield, 
  Loader2, 
  Check,
  Upload,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { profileService, storageService } from '@/lib/appwrite';
import { toast } from 'sonner';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { 
    currentUser, 
    currentProfile, 
    updateUserName,
    updateUserPreferences,
    refreshProfile,
    getShortWalletAddress,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Profile form state
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');

  // Load current profile data
  useEffect(() => {
    if (currentProfile) {
      setUsername(currentProfile.username || '');
      setDisplayName(currentProfile.displayName || '');
      setBio(currentProfile.bio || '');
      setEmail(currentProfile.email || '');
    }
  }, [currentProfile]);

  const walletAddress = currentUser?.prefs?.walletEth as string | undefined;
  const shortWallet = getShortWalletAddress();

  const handleSaveProfile = async () => {
    if (!currentProfile) return;
    
    setLoading(true);
    try {
      // Update profile in database
      await profileService.updateProfile(currentProfile.$id, {
        username: username || undefined,
        displayName: displayName || undefined,
        bio: bio || undefined,
        email: email || undefined,
      });

      // Update user name if displayName changed
      if (displayName && displayName !== currentUser?.name) {
        await updateUserName(displayName);
      }

      await refreshProfile();
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyWallet = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success('Wallet address copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentProfile) return;

    setLoading(true);
    try {
      // Upload to storage
      const uploadedFile = await storageService.uploadFile(
        'avatars',
        file,
        ['read("any")']
      );

      // Get file URL
      const fileUrl = storageService.getFileUrl('avatars', uploadedFile.$id);

      // Update profile
      await profileService.updateProfile(currentProfile.$id, {
        avatarUrl: fileUrl,
        avatarFileId: uploadedFile.$id,
      });

      await refreshProfile();
      toast.success('Avatar updated!');
    } catch (error: any) {
      toast.error('Failed to upload avatar');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-gray-900/95 backdrop-blur-xl border-gray-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" />
            Account Settings
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Manage your profile and account preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="profile" className="data-[state=active]:bg-purple-600">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="wallet" className="data-[state=active]:bg-purple-600">
              <Wallet className="w-4 h-4 mr-2" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="privacy" className="data-[state=active]:bg-purple-600">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 mt-4">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
              <Avatar className="h-20 w-20 border-2 border-purple-500/40">
                <AvatarImage src={currentProfile?.avatarUrl} />
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white text-xl">
                  {displayName ? getInitials(displayName) : '??'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm text-gray-300 mb-2">Profile Picture</p>
                <label htmlFor="avatar-upload">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={loading}
                    className="cursor-pointer"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New
                  </Button>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  disabled={loading}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-500">
                  Your unique username for others to find you
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-gray-300">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Display Name"
                  disabled={loading}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-300">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  disabled={loading}
                  rows={4}
                  className="bg-gray-800 border-gray-700 text-white resize-none"
                />
                <p className="text-xs text-gray-500">
                  {bio.length}/500 characters
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="bg-gray-800 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-gray-300">Connected Wallet</Label>
                  <Badge variant="secondary" className="bg-green-900/30 text-green-300">
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm text-purple-400 font-mono bg-gray-900 px-3 py-2 rounded">
                    {walletAddress || 'No wallet connected'}
                  </code>
                  {walletAddress && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyWallet}
                      className="bg-gray-800 hover:bg-gray-700"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-lg space-y-3">
                <Label className="text-gray-300">Account ID</Label>
                <code className="block text-sm text-gray-400 font-mono bg-gray-900 px-3 py-2 rounded">
                  {currentUser?.$id}
                </code>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-300 flex items-start gap-2">
                  <ExternalLink className="w-4 h-4 mt-0.5" />
                  <span>
                    Your wallet is your primary identity on Tenchat. 
                    Keep your private keys secure and never share them with anyone.
                  </span>
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <Label className="text-gray-300 mb-3 block">Profile Visibility</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-300">Allow others to find me by username</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-300">Show online status</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-300">Allow profile views</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-gray-800/50 rounded-lg">
                <Label className="text-gray-300 mb-3 block">Message Privacy</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-300">Allow messages from anyone</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm text-gray-300">Only contacts can message me</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" defaultChecked />
                    <span className="text-sm text-gray-300">Read receipts</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-300">
                  <strong>Note:</strong> These privacy settings are currently for display only. 
                  Full privacy controls will be implemented in a future update.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
