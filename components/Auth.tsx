'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, Mail, Lock, UserCircle, CheckCircle } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newPasswordRequired, setNewPasswordRequired] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [session, setSession] = useState('');
  const { login, signup, confirmSignup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (showConfirmation) {
        await confirmSignup(username, confirmationCode);
        setSuccess('Account confirmed! You can now log in.');
        setShowConfirmation(false);
        setIsLogin(true);
      } else if (isLogin) {
        try {
          await login(username, password, newPassword, session);
        } catch (err: any) {
          if (err.message.includes('NEW_PASSWORD_REQUIRED') || err.challenge === 'NEW_PASSWORD_REQUIRED') {
            setNewPasswordRequired(true);
            setSession(err.session || '');
            setError('You need to set a new password');
          } else {
            throw err;
          }
        }
      } else {
        const result = await signup(email, password, name, username);
        setSuccess('Account created! Please check your email for confirmation code.');
        setShowConfirmation(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setShowConfirmation(false);
    setError('');
    setSuccess('');
    setConfirmationCode('');
  };

  return (
    <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-white text-center">
          {showConfirmation ? 'Confirm Account' : (isLogin ? 'Welcome Back' : 'Create Account')}
        </CardTitle>
        <CardDescription className="text-slate-400 text-center">
          {showConfirmation 
            ? 'Enter the confirmation code sent to your email'
            : (isLogin ? 'Enter your credentials to access your account' : 'Sign up to get started with Streamline Analyst')
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {showConfirmation ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="confirmationCode" className="text-slate-300">
                  Confirmation Code
                </Label>
                <Input
                  id="confirmationCode"
                  type="text"
                  placeholder="123456"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500"
                  required
                />
              </div>
            </>
          ) : (
            <>
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
                    minLength={8}
                  />
                </div>
                {!isLogin && (
                  <p className="text-xs text-slate-400">Must be at least 8 characters</p>
                )}
              </div>

              {newPasswordRequired && (
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-300">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-cyan-500 focus:ring-cyan-500"
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="text-xs text-slate-400">Must be at least 8 characters</p>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <p className="text-green-300 text-sm">{success}</p>
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
            ) : showConfirmation ? (
              'Confirm Account'
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        {!showConfirmation && (
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  resetForm();
                }}
                className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
