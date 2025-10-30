import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { apiRequest } from '@/lib/queryClient';
import { is } from '@/i18n/is';
import { ShoppingBag } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { setAuthUser } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/v1/auth/login', { email, password });
    },
    onSuccess: (data) => {
      setAuthUser(data);
      toast({
        title: 'Innskráning tókst',
        description: `Velkomin ${data.user.email}`,
      });
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Villa',
        description: error.message || is.auth.errors.invalidCredentials,
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/v1/auth/register-store', {
        email,
        password,
        storeName,
      });
    },
    onSuccess: (data) => {
      setAuthUser(data);
      toast({
        title: 'Nýskráning tókst',
        description: `Verslunin ${storeName} hefur verið skráð`,
      });
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Villa',
        description: error.message || is.auth.errors.emailExists,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      registerMutation.mutate();
    } else {
      loginMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-4 rounded-2xl">
              <ShoppingBag size={32} />
            </div>
          </div>
          <h1 className="text-2xl font-bold" data-testid="text-title">
            {isRegister ? is.auth.registerTitle : is.auth.loginTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            {is.common.appName}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-2">
              <Label htmlFor="storeName">{is.auth.storeName}</Label>
              <Input
                id="storeName"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
                data-testid="input-store-name"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{is.auth.email}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              data-testid="input-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{is.auth.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              data-testid="input-password"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending || registerMutation.isPending}
            data-testid="button-submit"
          >
            {isRegister ? is.auth.registerButton : is.auth.loginButton}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm text-primary hover:underline"
            data-testid="button-toggle-mode"
          >
            {isRegister ? is.auth.hasAccount : is.auth.noAccount}
          </button>
        </div>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            data-testid="button-home"
          >
            {is.errors.goHome}
          </Button>
        </div>
      </Card>
    </div>
  );
}
