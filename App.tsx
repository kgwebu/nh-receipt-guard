
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { MySubmissions } from './components/MySubmissions';
import { Review } from './components/Review';
import { Upload } from './components/Upload';
import { Landing } from './components/Landing';
import { Login } from './components/Login';
import { Reports } from './components/Reports';
import { AuditLog } from './components/AuditLog';
import { PublicInfo } from './components/PublicInfo';
import { DEMO_ACCOUNTS, MOCK_PURCHASES } from './constants';
import { PurchaseDocument, ReviewStatus, FlagType, User, UserRole } from './types';
import { ExtractionResult } from './services/geminiService';
import { ShieldAlert, Zap } from 'lucide-react';
import { auth, db } from './services/firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [purchases, setPurchases] = useState<PurchaseDocument[]>([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [usingMockData, setUsingMockData] = useState(false);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as User);
          } else {
            const userEmail = firebaseUser.email || '';
            const demoProfile = DEMO_ACCOUNTS[userEmail];

            const defaultUser: User = {
              id: firebaseUser.uid,
              name: demoProfile?.name || firebaseUser.displayName || userEmail.split('@')[0] || 'NH Staff',
              email: userEmail,
              role: demoProfile?.role || UserRole.SUBMITTER,
              organization: demoProfile?.organization || 'NH Municipal Office',
              avatar: demoProfile?.avatar || firebaseUser.photoURL || `https://picsum.photos/80/80?random=${firebaseUser.uid}`
            };

            try {
              await setDoc(userDocRef, defaultUser);
            } catch (e) {
              console.warn("Could not save user profile to Firestore, likely due to rules.", e);
            }
            setCurrentUser(defaultUser);
          }
        } catch (e) {
          console.warn("Firestore error during user fetch, using local profile.", e);
          const userEmail = firebaseUser.email || '';
          const demoProfile = DEMO_ACCOUNTS[userEmail];

          setCurrentUser({
            id: firebaseUser.uid,
            name: demoProfile?.name || userEmail.split('@')[0] || 'Staff User',
            email: userEmail,
            role: demoProfile?.role || UserRole.SUBMITTER,
            organization: demoProfile?.organization || 'NH Municipal Office',
            avatar: demoProfile?.avatar || `https://picsum.photos/80/80?random=${firebaseUser.uid}`
          });
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Firestore Purchases Listener - with Robust Permission Fallback
  useEffect(() => {
    if (!currentUser) return;

    let unsubscribe: () => void;

    try {
      const q = query(collection(db, "purchases"), orderBy("date", "desc"));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const realDocs = snapshot.docs.map(d => {
          const data = d.data();
          return {
            ...data,
            id: d.id,
            date: typeof data.date === 'string' ? data.date : new Date().toISOString().split('T')[0]
          } as PurchaseDocument;
        });
        setPurchases(realDocs);
        setUsingMockData(false);
      }, (error) => {
        console.error("Firestore live updates error (falling back to mock data):", error);
        // On permission error, use mock data so the app remains interactive
        setPurchases(MOCK_PURCHASES);
        setUsingMockData(true);
      });
    } catch (e) {
      console.error("Failed to establish database connection (falling back to mock data):", e);
      setPurchases(MOCK_PURCHASES);
      setUsingMockData(true);
    }

    return () => unsubscribe?.();
  }, [currentUser]);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const activePurchase = useMemo(() =>
    purchases.find(p => p.id === reviewingId),
    [purchases, reviewingId]
  );

  const handleUpdatePurchase = useCallback(async (id: string, updates: Partial<PurchaseDocument>) => {
    try {
      // Optimistic update
      setPurchases(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

      if (!usingMockData) {
        const purchaseRef = doc(db, "purchases", id);
        // Remove undefined values from updates (Firestore doesn't allow undefined)
        const cleanedUpdates = Object.fromEntries(
          Object.entries(updates).filter(([_, value]) => value !== undefined)
        );
        await updateDoc(purchaseRef, cleanedUpdates);
      }
    } catch (e) {
      console.error("Persistence Update Error:", e);
      if (!usingMockData) {
        setUsingMockData(true);
      }
    }
  }, [usingMockData]);

  const handleReview = useCallback((id: string) => {
    setReviewingId(id);
    setActiveTab('review');
  }, []);

  const handleAddPurchase = useCallback(() => {
    setIsAdding(true);
    setActiveTab('upload');
  }, []);

  const handleUploadComplete = useCallback(async (data: ExtractionResult, imageData: string) => {
    const newPurchase: Omit<PurchaseDocument, 'id'> = {
      vendor: data.vendor || 'Unknown Vendor',
      amount: data.amount || 0,
      date: data.date || new Date().toISOString().split('T')[0],
      description: data.description || 'No description provided',
      category: data.category || 'General',
      flags: (data.flags || []).map(f => ({
        type: f.type as FlagType,
        reason: f.reason,
        context: f.context
      })),
      status: (data.flags && data.flags.length > 0) ? ReviewStatus.FLAGGED : ReviewStatus.PENDING,
      department: currentUser?.organization || 'General',
      submittedBy: currentUser?.name || 'Anonymous',
      aiConfidence: data.confidence || 0,
      suggestedGlCode: data.suggestedGlCode || 'N/A',
      marketPriceEstimate: data.marketPriceEstimate || 0,
      isSubscription: !!data.isSubscription,
      fileUrl: imageData
    };

    try {
      // Local optimistic update
      const tempId = `uploading-${Date.now()}`;
      setPurchases(prev => [{ ...newPurchase, id: tempId } as PurchaseDocument, ...prev]);

      if (!usingMockData) {
        const docRef = await addDoc(collection(db, "purchases"), newPurchase);
        console.log("Purchase document successfully saved to Firestore with ID:", docRef.id);
      }
    } catch (e) {
      console.warn("Could not save to remote database. Continuing in local-only mode.", e);
      setUsingMockData(true);
    }

    setIsAdding(false);
    setActiveTab('dashboard');
  }, [currentUser, usingMockData]);

  const handleLogout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setActiveTab('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Zap className="w-12 h-12 text-gov-blue animate-pulse" />
          <p className="font-serif font-bold text-slate-500 text-lg">Authenticating Session...</p>
        </div>
      </div>
    );
  }

  const renderAuthOrMain = () => {
    if (!currentUser) {
      if (showLogin) {
        return <Login onSuccess={(user) => {
          setCurrentUser(user);
          setShowLogin(false);
        }} onBack={() => setShowLogin(false)} />;
      }
      if (['documentation', 'statutes', 'accessibility', 'training', 'mission', 'compliance', 'impact'].includes(activeTab)) {
        return (
          <PublicInfo
            page={activeTab as any}
            onBack={() => setActiveTab('landing')}
          />
        );
      }
      return (
        <Landing
          onGetStarted={() => setShowLogin(true)}
          onLogin={() => setShowLogin(true)}
          onNavigate={(page) => setActiveTab(page)}
        />
      );
    }

    const renderContent = () => {
      if (isAdding && activeTab === 'upload') {
        return <Upload onComplete={handleUploadComplete} existingPurchases={purchases} />;
      }

      switch (activeTab) {
        case 'dashboard':
          return (
            <div className="relative">
              {usingMockData && (
                <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg flex items-center gap-3 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Database Access Restricted: Using sandbox records. Changes will be local-only.</span>
                </div>
              )}
              <Dashboard
                purchases={purchases}
                onReview={handleReview}
                onAdd={handleAddPurchase}
                user={currentUser}
              />
            </div>
          );
        case 'purchases':
          // For Submitters: Show MySubmissions with rejection fix-it and price memory
          // For other roles: Show Dashboard (their submissions view)
          return (
            <div className="relative">
              {usingMockData && (
                <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-lg flex items-center gap-3 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Database Access Restricted: Using sandbox records. Changes will be local-only.</span>
                </div>
              )}
              {currentUser.role === UserRole.SUBMITTER ? (
                <MySubmissions
                  purchases={purchases}
                  onReview={handleReview}
                  onAdd={handleAddPurchase}
                  user={currentUser}
                />
              ) : (
                <Dashboard
                  purchases={purchases}
                  onReview={handleReview}
                  onAdd={handleAddPurchase}
                  user={currentUser}
                />
              )}
            </div>
          );
        case 'review':
          return activePurchase ? (
            <Review
              item={activePurchase}
              purchases={purchases}
              onBack={() => setActiveTab('dashboard')}
              onUpdate={handleUpdatePurchase}
              user={currentUser}
            />
          ) : <Dashboard purchases={purchases} onReview={handleReview} onAdd={handleAddPurchase} user={currentUser} />;
        case 'history':
          return <AuditLog purchases={purchases} user={currentUser} />;
        case 'reports':
          return <Reports purchases={purchases} user={currentUser} />;
        case 'settings':
          return (
            <div className="max-w-3xl mx-auto space-y-12 py-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="space-y-2 text-center md:text-left">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Configuration</h1>
                <p className="text-slate-500 font-medium">Manage district-wide AI guardrails and preferences.</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[3xl] p-8 md:p-12 border border-slate-100 dark:border-slate-800 shadow-sm space-y-12">
                <section className="space-y-8">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-blue-500" />
                    <h3 className="font-bold text-2xl text-slate-900 dark:text-white">AI Sensitivity</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-black uppercase tracking-widest text-slate-400">Duplicate Window</label>
                      </div>
                      <div className="flex items-center gap-4">
                        <input type="number" defaultValue={60} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500/20 text-lg font-bold" />
                        <span className="text-slate-400 font-bold">Days</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          );
        default:
          return <Dashboard purchases={purchases} onReview={handleReview} onAdd={handleAddPurchase} user={currentUser} />;
      }
    };

    return (
      <Layout
        activeTab={activeTab}
        onTabChange={(tab) => {
          setIsAdding(false);
          setActiveTab(tab);
        }}
        onAdd={handleAddPurchase}
        onLogout={handleLogout}
        darkMode={darkMode}
        toggleDarkMode={() => setDarkMode(!darkMode)}
        user={currentUser}
      >
        {renderContent()}
      </Layout>
    );
  };

  return renderAuthOrMain();
};

export default App;
