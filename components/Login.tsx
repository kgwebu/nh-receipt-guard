import React, { useState } from 'react';
import { Button, Card } from './Common';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { User, UserRole } from '../types';
import { DEMO_ACCOUNTS, LOGO_URL } from '../constants';

interface LoginProps {
  onSuccess: (user: User) => void;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Perform Firebase Auth Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      let appUser: User;
      const demoProfile = DEMO_ACCOUNTS[email];

      try {
        // Attempt to fetch from Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          appUser = userDoc.data() as User;
        } else {
          // Fallback construction
          appUser = {
            id: firebaseUser.uid,
            name: demoProfile?.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Unknown Staff',
            email: firebaseUser.email || '',
            role: demoProfile?.role || UserRole.SUBMITTER,
            organization: demoProfile?.organization || 'NH School District Office',
            avatar: demoProfile?.avatar || `https://picsum.photos/80/80?random=${firebaseUser.uid}`
          };
          // Try to persist, but don't fail if permissions are missing
          await setDoc(userDocRef, appUser);
        }
      } catch (firestoreErr) {
        console.warn("Firestore access restricted, using demo profile fallback.", firestoreErr);
        // Fallback to local session if DB is locked
        appUser = {
          id: firebaseUser.uid,
          name: demoProfile?.name || firebaseUser.email?.split('@')[0] || 'Staff User',
          email: firebaseUser.email || '',
          role: demoProfile?.role || UserRole.SUBMITTER,
          organization: demoProfile?.organization || 'Demo Environment',
          avatar: `https://picsum.photos/80/80?random=${firebaseUser.uid}`
        };
      }

      onSuccess(appUser);
    } catch (err: any) {
      console.error("Login Error:", err);

      // Fallback for Demo Accounts if Firebase is not configured or user missing
      const demoUser = DEMO_ACCOUNTS[email];
      if (demoUser && password === '123456') {
        console.warn("Firebase Auth failed, but valid credentials for demo account provided. Logging in locally.");
        onSuccess(demoUser);
        return;
      }

      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Login failed. Please ensure this account exists in your Firebase Console and the password is correct.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(`System Error: ${err.message || 'Check Firebase configuration.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <Button variant="ghost" onClick={onBack} className="absolute top-8 left-8 text-slate-500 dark:text-slate-400">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Return to Home
      </Button>

      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center space-y-4">
          <img
            src={LOGO_URL}
            alt="Official Seal"
            className="w-20 h-20 rounded-full object-contain bg-white border-4 border-white dark:border-slate-800 shadow-lg p-0.5"
          />
          <div className="text-center">
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Staff Authentication</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Sign in to the NH Receipt Guard Portal</p>
          </div>
        </div>

        <Card className="p-8 space-y-6 shadow-md border-t-4 border-t-gov-blue">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Official Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@dept.nh.gov"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue transition-all font-medium text-sm"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue transition-all font-medium text-sm"
                  required
                />
              </div>
            </div>

            {error && <div className="bg-red-50 text-gov-red p-3 rounded text-xs font-bold text-center border border-red-100">{error}</div>}

            <Button size="lg" className="w-full h-11 text-base bg-gov-blue hover:bg-gov-darkBlue shadow-sm" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Access Portal"}
            </Button>
          </form>

        </Card>

        <p className="text-center text-xs text-slate-400 leading-relaxed max-w-[280px] mx-auto">
          Unauthorized access is prohibited. All activity is logged and monitored for security compliance.
        </p>
      </div>
    </div>
  );
};