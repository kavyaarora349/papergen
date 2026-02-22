
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, User, School, GraduationCap, Mail, Lock, Loader2, Github, KeyRound } from 'lucide-react';
import { loginUser, registerUser, loginWithGoogle, loginWithGithub, sendPasswordResetOtp, resetPasswordWithOtp } from '../services/api';
import { useGoogleLogin } from '@react-oauth/google';

interface LoginProps {
  onLogin: (user: { name: string; email: string; university: string; semester: string }) => void | Promise<void>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'auth' | 'profile' | 'forgot'>('auth');
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    university: 'REVA University',
    semester: '1',
    otp: '',
    newPassword: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleGithubSuccess(code);
      // Clean up the URL so it doesn't try again on reload
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleGithubSuccess = async (code: string) => {
    try {
      setGithubLoading(true);
      setError(null);
      const user = await loginWithGithub(code);
      await onLogin({
        email: user.email,
        name: user.name,
        university: user.university,
        semester: user.semester
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'GitHub Login failed. Please try again.');
    } finally {
      setGithubLoading(false);
    }
  };

  const loginGoogleCustom = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        setError(null);
        // Send the Google access token to our backend for verification
        const user = await loginWithGoogle(undefined, tokenResponse.access_token);
        await onLogin({
          email: user.email,
          name: user.name,
          university: user.university,
          semester: user.semester
        });
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Google Login failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setError('Google Login popup failed or was closed.')
  });

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);
    if (isLogin) {
      try {
        const user = await loginUser({ email: formData.email, password: formData.password });
        await onLogin({
          email: user.email,
          name: user.name,
          university: user.university,
          semester: user.semester
        });
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Failed to sign in. Please check your password.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setStep('profile');
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      await sendPasswordResetOtp(formData.email);
      setSuccessMsg('OTP has been sent to your email.');
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);
    try {
      await resetPasswordWithOtp({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      setSuccessMsg('Password reset successfully! You can now log in.');
      setTimeout(() => {
        setStep('auth');
        setIsLogin(true);
        setOtpSent(false);
        setFormData(prev => ({ ...prev, password: '', otp: '', newPassword: '' }));
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await registerUser({
        email: formData.email,
        password: formData.password,
        name: formData.name || 'Student',
        university: formData.university,
        semester: formData.semester
      });
      onLogin({
        email: user.email,
        name: user.name,
        university: user.university,
        semester: user.semester
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 blur-[120px] rounded-full animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-24 h-24 text-white" />
          </div>

          <AnimatePresence mode="wait">
            {step === 'auth' ? (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold">{isLogin ? 'Welcome back' : 'Create an account'}</h2>
                  <p className="text-gray-400 mt-2">{isLogin ? 'Sign in to your PaperGen account' : 'Join PaperGen to start generating papers'}</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {error}
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
                    {successMsg}
                  </motion.div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email address
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="name@reva.edu.in"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                        <Lock className="w-4 h-4" /> Password
                      </label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => {
                            setStep('forgot');
                            setError(null);
                            setSuccessMsg(null);
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <input
                      required
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-200 transition-all active:scale-95 shadow-xl disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Sign Up')}
                    {!isLoading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-400">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-white hover:text-indigo-400 font-medium transition-colors"
                    >
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
                </div>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0b101c] px-2 text-gray-500">Or continue with</span></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <button
                    type="button"
                    onClick={() => loginGoogleCustom()}
                    disabled={googleLoading}
                    className="h-[40px] px-4 glass rounded-xl text-sm font-medium hover:bg-white/5 transition-colors border border-white/5 flex items-center justify-center gap-2 relative overflow-hidden"
                  >
                    {googleLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#0b101c]/80 z-10 backdrop-blur-sm">
                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                      </div>
                    )}
                    <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
                      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23lipfHjzQFeTqMUnJ';
                      window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;
                    }}
                    disabled={githubLoading}
                    className="h-[40px] px-4 glass rounded-xl text-sm font-medium hover:bg-white/5 transition-colors border border-white/5 flex items-center justify-center gap-2 relative overflow-hidden"
                  >
                    {githubLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#0b101c]/80 z-10 backdrop-blur-sm">
                        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                      </div>
                    )}
                    <Github className="w-4 h-4" /> GitHub
                  </button>
                </div>
              </motion.div>
            ) : step === 'forgot' ? (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
                    <KeyRound className="w-8 h-8 text-indigo-400" /> Reset Password
                  </h2>
                  <p className="text-gray-400 mt-2">
                    {otpSent ? 'Enter the 6-digit code sent to your email.' : "We'll send a recovery code to your email."}
                  </p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {error}
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
                    {successMsg}
                  </motion.div>
                )}

                <form onSubmit={otpSent ? handleResetPassword : handleSendOtp} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email address
                    </label>
                    <input
                      required
                      type="email"
                      disabled={otpSent}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all disabled:opacity-50"
                      placeholder="name@reva.edu.in"
                    />
                  </div>

                  {otpSent && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                          <Lock className="w-4 h-4" /> 6-Digit OTP
                        </label>
                        <input
                          required
                          type="text"
                          maxLength={6}
                          value={formData.otp}
                          onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-center tracking-[0.5em] font-mono text-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all focus:tracking-[0.7em]"
                          placeholder="000000"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                          <Lock className="w-4 h-4" /> New Password
                        </label>
                        <input
                          required
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (otpSent ? 'Reset Password' : 'Send Code')}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('auth');
                      setOtpSent(false);
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="w-full py-4 bg-transparent text-gray-400 hover:text-white font-medium rounded-2xl flex items-center justify-center transition-all"
                  >
                    Back to login
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold">Complete Profile</h2>
                  <p className="text-gray-400 mt-2">Help us personalize your papers</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <User className="w-4 h-4" /> Full Name
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Kavya S."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <School className="w-4 h-4" /> University
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="REVA University"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Current Semester
                    </label>
                    <select
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full bg-[#0b101c] border border-white/10 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s.toString()}>Semester {s}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-indigo-600/20"
                  >
                    Finish Setup <Sparkles className="w-5 h-5" />
                  </button>
                </form>

                <button
                  onClick={() => setStep('auth')}
                  className="w-full text-center text-sm text-gray-500 hover:text-white transition-colors"
                >
                  Back to login
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
