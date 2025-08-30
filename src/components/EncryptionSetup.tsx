import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Key, Info, AlertCircle } from 'lucide-react';
import { useEncryption } from '@/hooks/useEncryption';

interface EncryptionSetupProps {
  onSetupComplete: () => void;
}

const EncryptionSetup: React.FC<EncryptionSetupProps> = ({ onSetupComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { initializeDevice, loading } = useEncryption();

  const handleSetup = async () => {
    if (password !== confirmPassword) {
      return;
    }

    if (password.length < 12) {
      return;
    }

    const success = await initializeDevice(password);
    if (success) {
      onSetupComplete();
    }
  };

  const passwordsMatch = password === confirmPassword;
  const passwordValid = password.length >= 12;
  const canProceed = passwordsMatch && passwordValid && password;

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-gradient-security rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <CardTitle>Setup Encryption</CardTitle>
          <CardDescription>
            Secure your device with end-to-end encryption
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This password encrypts your private keys locally. It cannot be recovered if lost.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Encryption Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter a strong password (12+ characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={!passwordValid && password ? "border-destructive" : ""}
              />
              {!passwordValid && password && (
                <p className="text-sm text-destructive">
                  Password must be at least 12 characters long
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={!passwordsMatch && confirmPassword ? "border-destructive" : ""}
              />
              {!passwordsMatch && confirmPassword && (
                <p className="text-sm text-destructive">
                  Passwords do not match
                </p>
              )}
            </div>
          </div>

          <Button 
            className="w-full bg-gradient-primary hover:opacity-90 text-white"
            onClick={handleSetup}
            disabled={!canProceed || loading}
          >
            {loading ? (
              <>Setting up encryption...</>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                Setup Device Encryption
              </>
            )}
          </Button>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Information
            </Button>

            {showAdvanced && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Encryption Details:</strong><br />
                  • RSA-2048 keys for device authentication<br />
                  • AES-256-GCM for message encryption<br />
                  • PBKDF2 with 100,000 iterations for password derivation<br />
                  • Forward secrecy through key rotation<br />
                  • Zero-knowledge architecture
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="text-center text-xs text-muted-foreground">
            <p className="flex items-center justify-center gap-1">
              <Shield className="w-3 h-3 text-security" />
              Your encryption keys never leave this device
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EncryptionSetup;