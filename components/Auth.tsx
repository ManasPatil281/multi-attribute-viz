'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Mail, Lock, UserCircle } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        if (!name || !email) {
          setError('All fields are required');
          setIsLoading(false);
          return;
        }
        await signup(email, password, name, username);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-white text-center">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </CardTitle>
        <CardDescription className="text-slate-400 text-center">
          {isLogin ? 'Enter your credentials to access your account' : 'Sign up to get started with Streamline Analyst'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500"
                    required={!isLogin}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500"
                    required={!isLogin}
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-300">
              Username
            </Label>
            <div className="relative">
              <UserCircle className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500"
                required
                minLength={6}
              />
            </div>
            {!isLogin && (
              <p className="text-xs text-slate-400">Must be at least 6 characters</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
