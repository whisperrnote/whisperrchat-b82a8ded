import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Shield, Wallet, Key, Mail, Lock, MessageCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useEmailAuth } from '@/hooks/useEmailAuth';
import { usePasskeyAuth } from '@/hooks/usePasskeyAuth';
import { useWalletAuth } from '@/hooks/useWalletAuth';

const emailFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().optional(),
});

const Auth = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [authType, setAuthType] = useState<'signin' | 'signup'>('signin');
  
  const { signIn, signUp, loading: emailLoading } = useEmailAuth();
  const { registerPasskey, authenticateWithPasskey, loading: passkeyLoading } = usePasskeyAuth();
  const { signInWithWallet, loading: walletLoading } = useWalletAuth();

  const form = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: '',
      password: '',
      displayName: '',
    },
  });

  // Redirect if already authenticated
  if (user && !authLoading) {
    return <Navigate to="/chat" replace />;
  }

  const onEmailSubmit = async (values: z.infer<typeof emailFormSchema>) => {
    if (authType === 'signup') {
      const result = await signUp(values.email, values.password, values.displayName);
      if (result.data?.user) {
        navigate('/chat');
      }
    } else {
      const result = await signIn(values.email, values.password);
      if (result.data?.user) {
        navigate('/chat');
      }
    }
  };

  const handlePasskeyAuth = async () => {
    if (authType === 'signup') {
      const email = form.getValues('email');
      const displayName = form.getValues('displayName');
      if (!email) {
        form.setError('email', { message: 'Email is required for passkey registration' });
        return;
      }
      const result = await registerPasskey(email, displayName);
      if (result.success) {
        navigate('/chat');
      }
    } else {
      const result = await authenticateWithPasskey();
      if (result.success) {
        navigate('/chat');
      }
    }
  };

  const handleWalletAuth = async () => {
    const displayName = form.getValues('displayName');
    const result = await signInWithWallet(displayName);
    if (result.success) {
      navigate('/chat');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-bg">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Welcome to Whisperrchat</h1>
          <p className="text-muted-foreground">Choose your secure authentication method</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-center gap-1 mb-2">
              <Shield className="w-4 h-4 text-security" />
              <span className="text-sm text-security font-medium">End-to-End Encrypted</span>
            </div>
            <CardTitle className="text-center">
              {authType === 'signin' ? 'Sign In' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-center">
              {authType === 'signin' 
                ? 'Access your secure chat account' 
                : 'Set up your secure chat account'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={authType} onValueChange={(value) => setAuthType(value as 'signin' | 'signup')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Password
                          </FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary hover:opacity-90 text-white"
                      disabled={emailLoading}
                    >
                      {emailLoading ? 'Signing in...' : 'Sign In with Email'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onEmailSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Anonymous User" {...field} />
                          </FormControl>
                          <FormDescription>
                            This is how others will see you (can be changed later)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Password
                          </FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormDescription>
                            Must be at least 8 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary hover:opacity-90 text-white"
                      disabled={emailLoading}
                    >
                      {emailLoading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handlePasskeyAuth}
                disabled={passkeyLoading}
              >
                <Key className="w-4 h-4 mr-2" />
                {passkeyLoading ? 'Processing...' : 
                  authType === 'signup' ? 'Register with Passkey' : 'Sign in with Passkey'
                }
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleWalletAuth}
                disabled={walletLoading}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {walletLoading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              <p className="flex items-center justify-center gap-1">
                <Shield className="w-3 h-3 text-security" />
                All authentication methods are equally secure and anonymous
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;