import React, { useState, useMemo } from 'react';
import { PurchaseDocument, ReviewStatus, User, UserRole, FlagType, SubmitterMetrics, Badge as BadgeType } from '../types';
import { Card, Badge, Button } from './Common';
import { ReviewQueue } from './ReviewQueue';
import { generateExecutiveInsight, generateImpactNarrative } from '../services/geminiService';
import {
  AlertCircle,
  ChevronRight,
  Receipt,
  FileCheck,
  Clock,
  PieChart,
  PlusCircle,
  Search,
  ArrowUpRight,
  Filter,
  Activity,
  BarChart3,
  Calendar,
  ShieldAlert,
  ArrowDownNarrowWide,
  CheckCircle,
  Building2,
  AlertTriangle,
  Bot,
  Sparkles,
  Loader2,
  Gauge,
  Zap,
  TrendingDown,
  TrendingUp,
  Info,
  Wallet,
  FileDown,
  GraduationCap,
  Laptop,
  BookOpen,
  Award,
  Target,
  Flame,
  DollarSign,
  Trophy,
  Star,
  Timer
} from 'lucide-react';

interface DashboardProps {
  purchases: PurchaseDocument[];
  onReview: (id: string) => void;
  onAdd: () => void;
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ purchases, onReview, onAdd, user }) => {
  if (user.role === UserRole.SUBMITTER) return <SubmitterDashboard purchases={purchases} onReview={onReview} onAdd={onAdd} user={user} />;
  if (user.role === UserRole.REVIEWER) return <ReviewQueue purchases={purchases} onReview={onReview} user={user} />;
  if (user.role === UserRole.VIEWER) return <ViewerDashboard purchases={purchases} user={user} />;
  return null;
};

/* --- SUBMITTER DASHBOARD (Enhanced with Personal Efficiency + Budget Tracker) --- */
const SubmitterDashboard: React.FC<{ purchases: PurchaseDocument[], onReview: (id: string) => void, onAdd: () => void, user: User }> = ({ purchases, onReview, onAdd, user }) => {
  const myPurchases = purchases.filter(p => p.submittedBy === user.name || p.id.startsWith('temp-'));
  const pendingCount = myPurchases.filter(p => p.status === ReviewStatus.PENDING || p.status === ReviewStatus.FLAGGED).length;

  // Calculate Submitter Metrics
  const metrics: SubmitterMetrics = useMemo(() => {
    const total = myPurchases.length;
    const approved = myPurchases.filter(p => p.status === ReviewStatus.VALIDATED).length;
    const rejected = myPurchases.filter(p => p.status === ReviewStatus.REJECTED).length;
    const pending = myPurchases.filter(p => p.status === ReviewStatus.PENDING || p.status === ReviewStatus.FLAGGED).length;

    // Calculate average review time (simulated based on data)
    let avgReviewTime = 2.1; // Default
    const reviewedPurchases = myPurchases.filter(p =>
      p.status === ReviewStatus.VALIDATED || p.status === ReviewStatus.REJECTED
    );
    if (reviewedPurchases.length > 0) {
      // Simulate review time based on complexity
      avgReviewTime = reviewedPurchases.reduce((sum, p) => {
        const complexity = p.flags.length > 0 ? 3 : 1.5;
        return sum + complexity;
      }, 0) / reviewedPurchases.length;
    }

    // Calculate current streak (days without rejection)
    const sortedByDate = [...myPurchases]
      .filter(p => p.status === ReviewStatus.VALIDATED || p.status === ReviewStatus.REJECTED)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let streak = 0;
    for (const purchase of sortedByDate) {
      if (purchase.status === ReviewStatus.REJECTED) break;
      streak++;
    }

    // Calculate monthly spend
    const now = new Date();
    const thisMonth = myPurchases.filter(p => {
      const purchaseDate = new Date(p.date);
      return purchaseDate.getMonth() === now.getMonth() &&
             purchaseDate.getFullYear() === now.getFullYear() &&
             p.status === ReviewStatus.VALIDATED;
    }).reduce((sum, p) => sum + p.amount, 0);

    return {
      approvalRate: total > 0 ? Math.round((approved / total) * 100) : 100,
      avgReviewTimeDays: Math.round(avgReviewTime * 10) / 10,
      totalSubmissions: total,
      approvedCount: approved,
      rejectedCount: rejected,
      pendingCount: pending,
      currentStreak: streak,
      monthlySpend: thisMonth
    };
  }, [myPurchases]);

  // Calculate earned badges
  const badges: BadgeType[] = useMemo(() => {
    const earnedBadges: BadgeType[] = [];

    // Perfect Week - 7+ approved without rejection
    if (metrics.currentStreak >= 7) {
      earnedBadges.push({
        id: 'perfect-week',
        name: 'Perfect Week',
        icon: 'trophy',
        description: '7+ submissions approved in a row',
        earned: true
      });
    }

    // Quick Learner - improved after rejection
    const hasImprovedAfterRejection = myPurchases.some((p, i) => {
      if (p.status !== ReviewStatus.REJECTED) return false;
      const laterPurchases = myPurchases.slice(i + 1);
      return laterPurchases.some(lp => lp.status === ReviewStatus.VALIDATED);
    });
    if (hasImprovedAfterRejection) {
      earnedBadges.push({
        id: 'quick-learner',
        name: 'Quick Learner',
        icon: 'star',
        description: 'Improved after a rejection',
        earned: true
      });
    }

    // Budget Pro - 10+ submissions all under budget
    if (metrics.totalSubmissions >= 10 && metrics.approvalRate >= 90) {
      earnedBadges.push({
        id: 'budget-pro',
        name: 'Budget Pro',
        icon: 'award',
        description: '90%+ approval rate with 10+ submissions',
        earned: true
      });
    }

    // Efficiency Expert - 95%+ approval rate
    if (metrics.approvalRate >= 95 && metrics.totalSubmissions >= 5) {
      earnedBadges.push({
        id: 'efficiency-expert',
        name: 'Efficiency Expert',
        icon: 'target',
        description: '95%+ approval rate achieved',
        earned: true
      });
    }

    return earnedBadges;
  }, [metrics, myPurchases]);

  // Mock Department Budget (would come from database in production)
  const departmentBudget = useMemo(() => {
    const totalBudget = 60000; // Annual budget
    const usedBudget = myPurchases
      .filter(p => p.status === ReviewStatus.VALIDATED)
      .reduce((sum, p) => sum + p.amount, 0);

    // Calculate spending by category
    const categoryMap: Record<string, number> = {};
    myPurchases.filter(p => p.status === ReviewStatus.VALIDATED).forEach(p => {
      categoryMap[p.category] = (categoryMap[p.category] || 0) + p.amount;
    });

    const categories = Object.entries(categoryMap).map(([name, amount]) => ({
      name,
      amount,
      percentage: Math.round((amount / usedBudget) * 100) || 0
    })).sort((a, b) => b.amount - a.amount);

    // Calculate projected exhaustion date
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const daysElapsed = Math.max(1, Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyRate = usedBudget / daysElapsed;
    const remainingBudget = totalBudget - usedBudget;
    const daysToExhaustion = dailyRate > 0 ? Math.floor(remainingBudget / dailyRate) : 365;
    const exhaustionDate = new Date(now.getTime() + daysToExhaustion * 24 * 60 * 60 * 1000);

    return {
      name: user.organization || 'IT Services',
      total: totalBudget,
      used: usedBudget,
      remaining: totalBudget - usedBudget,
      percentage: Math.round((usedBudget / totalBudget) * 100),
      projectedExhaustionDate: exhaustionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      categories
    };
  }, [myPurchases, user]);

  // Get budget status color
  const getBudgetColor = (percentage: number) => {
    if (percentage >= 90) return { bg: 'bg-red-500', text: 'text-red-600', label: 'Critical' };
    if (percentage >= 80) return { bg: 'bg-amber-500', text: 'text-amber-600', label: 'Warning' };
    if (percentage >= 60) return { bg: 'bg-yellow-500', text: 'text-yellow-600', label: 'On Track' };
    return { bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'Healthy' };
  };
  const budgetStatus = getBudgetColor(departmentBudget.percentage);

  // Get badge icon
  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy': return Trophy;
      case 'star': return Star;
      case 'award': return Award;
      case 'target': return Target;
      default: return Award;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gov-blue dark:text-white">My Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Your personal efficiency metrics and budget status</p>
        </div>
        <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-sm">
          <Activity className="w-4 h-4 text-gov-blue dark:text-blue-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">{pendingCount} Active Requests</span>
        </div>
      </header>

      {/* Initiate New Request CTA */}
      <div
        onClick={onAdd}
        className="group relative bg-gov-blue dark:bg-slate-900 rounded-lg p-6 text-white overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-all border border-blue-900 dark:border-slate-800"
      >
        <div className="relative z-10 flex flex-row items-center gap-6">
          <div className="w-14 h-14 bg-white/10 rounded-md flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
            <PlusCircle className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-serif font-bold">Initiate New Request</h2>
              <Badge color="green" className="bg-emerald-500/20 text-emerald-100 border-emerald-500/30">AI Enabled</Badge>
            </div>
            <p className="text-blue-100 max-w-xl text-sm leading-relaxed">Upload invoices with AI pre-validation and GL code suggestions.</p>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]" />
      </div>

      {/* Personal Efficiency Dashboard */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-md text-emerald-600">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Personal Efficiency Score</h3>
            <p className="text-xs text-slate-500">Track your submission performance and earn badges</p>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-emerald-600" />
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                metrics.approvalRate >= 90 ? 'bg-emerald-100 text-emerald-700' :
                metrics.approvalRate >= 70 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {metrics.approvalRate >= 90 ? 'Excellent' : metrics.approvalRate >= 70 ? 'Good' : 'Needs Work'}
              </span>
            </div>
            <p className="text-3xl font-bold font-mono text-emerald-700 dark:text-emerald-400">{metrics.approvalRate}%</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">Approval Rate</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <Timer className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold font-mono text-blue-700 dark:text-blue-400">{metrics.avgReviewTimeDays}d</p>
            <p className="text-xs text-blue-600 dark:text-blue-500 font-medium">Avg Review Time</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold font-mono text-purple-700 dark:text-purple-400">${metrics.monthlySpend.toLocaleString()}</p>
            <p className="text-xs text-purple-600 dark:text-purple-500 font-medium">This Month</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-5 h-5 text-orange-600" />
              {metrics.currentStreak >= 7 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700">Hot!</span>
              )}
            </div>
            <p className="text-3xl font-bold font-mono text-orange-700 dark:text-orange-400">{metrics.currentStreak}</p>
            <p className="text-xs text-orange-600 dark:text-orange-500 font-medium">Day Streak</p>
          </div>
        </div>

        {/* Badges Section */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Earned Badges</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {badges.length > 0 ? (
              badges.map(badge => {
                const IconComponent = getBadgeIcon(badge.icon);
                return (
                  <div
                    key={badge.id}
                    className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800"
                    title={badge.description}
                  >
                    <IconComponent className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{badge.name}</span>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                Keep submitting to earn badges! (7+ streak for Perfect Week, 90%+ rate for Budget Pro)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Department Budget Tracker */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-md text-indigo-600">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Department Budget</h3>
            <p className="text-xs text-slate-500">{departmentBudget.name}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            budgetStatus.label === 'Critical' ? 'bg-red-100 text-red-700' :
            budgetStatus.label === 'Warning' ? 'bg-amber-100 text-amber-700' :
            budgetStatus.label === 'On Track' ? 'bg-yellow-100 text-yellow-700' :
            'bg-emerald-100 text-emerald-700'
          }`}>
            {budgetStatus.label}
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-600 dark:text-slate-400">Budget Utilization</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              ${departmentBudget.used.toLocaleString()} / ${departmentBudget.total.toLocaleString()}
            </span>
          </div>
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${budgetStatus.bg} transition-all duration-500`}
              style={{ width: `${Math.min(departmentBudget.percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>{departmentBudget.percentage}% used</span>
            <span>${departmentBudget.remaining.toLocaleString()} remaining</span>
          </div>
        </div>

        {/* Velocity Warning */}
        {departmentBudget.percentage >= 60 && (
          <div className={`mt-4 p-4 rounded-lg border ${
            departmentBudget.percentage >= 90 ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
            departmentBudget.percentage >= 80 ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
            'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
          }`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                departmentBudget.percentage >= 90 ? 'text-red-600' :
                departmentBudget.percentage >= 80 ? 'text-amber-600' :
                'text-yellow-600'
              }`} />
              <div>
                <p className={`text-sm font-bold ${
                  departmentBudget.percentage >= 90 ? 'text-red-900 dark:text-red-300' :
                  departmentBudget.percentage >= 80 ? 'text-amber-900 dark:text-amber-300' :
                  'text-yellow-900 dark:text-yellow-300'
                }`}>
                  {departmentBudget.percentage >= 90 ? 'Budget Critical' :
                   departmentBudget.percentage >= 80 ? 'Budget Warning' :
                   'Budget Notice'}
                </p>
                <p className={`text-xs mt-1 ${
                  departmentBudget.percentage >= 90 ? 'text-red-700 dark:text-red-400' :
                  departmentBudget.percentage >= 80 ? 'text-amber-700 dark:text-amber-400' :
                  'text-yellow-700 dark:text-yellow-400'
                }`}>
                  At current spending pace, budget projected to exhaust by {departmentBudget.projectedExhaustionDate}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Category Breakdown */}
        {departmentBudget.categories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Spending by Category</p>
            <div className="space-y-2">
              {departmentBudget.categories.slice(0, 3).map(cat => (
                <div key={cat.name} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{cat.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${cat.percentage}%` }} />
                    </div>
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-400 w-16 text-right">
                      ${cat.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 text-center">
          <p className="text-2xl font-bold font-mono text-emerald-600">{metrics.approvedCount}</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Approved</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-200 dark:border-amber-800 text-center">
          <p className="text-2xl font-bold font-mono text-amber-600">{metrics.pendingCount}</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Pending</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-200 dark:border-red-800 text-center">
          <p className="text-2xl font-bold font-mono text-red-600">{metrics.rejectedCount}</p>
          <p className="text-xs text-red-700 dark:text-red-400 font-medium">Rejected</p>
        </div>
      </div>
    </div>
  );
};

// ReviewerDashboard replaced by ReviewQueue component

/* --- VIEWER DASHBOARD (Enhanced with Fiscal Oracle) --- */
const ViewerDashboard: React.FC<{ purchases: PurchaseDocument[], user: User }> = ({ purchases, user }) => {
  const [oracleQuery, setOracleQuery] = useState('');
  const [oracleResponse, setOracleResponse] = useState<string | null>(null);
  const [isOracleThinking, setIsOracleThinking] = useState(false);

  // Impact Storyteller state
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [activeAudience, setActiveAudience] = useState<'board' | 'parent' | 'state'>('board');
  const [narratives, setNarratives] = useState<Record<string, string>>({});

  const handleOracleSearch = async () => {
    if (!oracleQuery.trim()) return;
    setIsOracleThinking(true);
    setOracleResponse(null);

    // Prepare a summary of data for the AI context
    const summary = purchases.map(p => ({
      vendor: p.vendor,
      amount: p.amount,
      category: p.category,
      department: p.department,
      status: p.status,
      flags: p.flags.map(f => f.type).join(', ')
    })).slice(0, 50); // Limit context size

    const insight = await generateExecutiveInsight(oracleQuery, JSON.stringify(summary));
    setOracleResponse(insight);
    setIsOracleThinking(false);
  };

  // Impact Storyteller: Generate narrative
  const generateStory = async (audience: 'board' | 'parent' | 'state') => {
    setNarrativeLoading(true);
    setActiveAudience(audience);
    if (narratives[audience]) {
      setNarrativeLoading(false);
      return;
    }
    try {
      const today = new Date();
      const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
      const narrative = await generateImpactNarrative(
        totalSavings,
        quarterStart.toLocaleDateString(),
        today.toLocaleDateString(),
        audience
      );
      setNarratives(prev => ({ ...prev, [audience]: narrative }));
    } catch (error) {
      console.error('Failed to generate narrative:', error);
    } finally {
      setNarrativeLoading(false);
    }
  };

  // Calculate real metrics
  const zombieSpend = purchases.filter(p => p.flags.some(f => f.type === FlagType.ZOMBIE_SPEND)).length;
  const marketDeviation = purchases.filter(p => p.flags.some(f => f.type === FlagType.MARKET_DEVIATION)).length;

  // Calculate total savings from rejected/flagged purchases
  const totalSavings = useMemo(() => {
    return purchases
      .filter(p => p.status === ReviewStatus.REJECTED || p.flags.some(f =>
        f.type === FlagType.ZOMBIE_SPEND || f.type === FlagType.MARKET_DEVIATION
      ))
      .reduce((sum, p) => sum + p.amount, 0);
  }, [purchases]);

  // Calculate impact equivalents for Impact Storyteller
  const impactEquivalents = useMemo(() => {
    const teacherSalary = 50000;
    const chromebookCost = 300;
    const textbookCost = 75;
    return [
      {
        icon: GraduationCap,
        label: 'Teacher Salaries',
        value: Math.floor(totalSavings / teacherSalary),
        description: `full-time teachers for one year`
      },
      {
        icon: Laptop,
        label: 'Student Technology',
        value: Math.floor(totalSavings / chromebookCost),
        description: `new Chromebooks for students`
      },
      {
        icon: BookOpen,
        label: 'Educational Materials',
        value: Math.floor(totalSavings / textbookCost),
        description: `new textbooks`
      }
    ];
  }, [totalSavings]);

  // Calculate efficiency index based on waste prevention
  const totalPurchases = purchases.length;
  const resolvedAndRejected = purchases.filter(p =>
    p.status === ReviewStatus.RESOLVED || p.status === ReviewStatus.REJECTED
  ).length;
  const efficiencyIndex = totalPurchases > 0
    ? Math.round((resolvedAndRejected / totalPurchases) * 100)
    : 0;

  // Calculate category spend from real data
  const categorySpend = useMemo(() => {
    const catMap: Record<string, number> = {};
    purchases.forEach(p => {
      if (p.status === ReviewStatus.VALIDATED) {
        catMap[p.category] = (catMap[p.category] || 0) + p.amount;
      }
    });

    const sorted = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const maxAmount = sorted.length > 0 ? sorted[0][1] : 1;

    return sorted.map(([cat, amount]) => ({
      cat,
      val: `$${amount.toLocaleString()}`,
      pct: Math.round((amount / maxAmount) * 100),
      color: ['bg-gov-blue', 'bg-emerald-600', 'bg-slate-500', 'bg-amber-500'][sorted.indexOf([cat, amount]) % 4]
    }));
  }, [purchases]);

  // Calculate department activity from real data
  const departmentActivity = useMemo(() => {
    const deptMap: Record<string, { total: number; validated: number; pending: number; flagged: number }> = {};

    purchases.forEach(p => {
      if (!deptMap[p.department]) {
        deptMap[p.department] = { total: 0, validated: 0, pending: 0, flagged: 0 };
      }
      deptMap[p.department].total += p.amount;

      if (p.status === ReviewStatus.VALIDATED) deptMap[p.department].validated++;
      if (p.status === ReviewStatus.PENDING) deptMap[p.department].pending++;
      if (p.status === ReviewStatus.FLAGGED) deptMap[p.department].flagged++;
    });

    return Object.entries(deptMap)
      .map(([dept, stats]) => {
        let status = 'Validated';
        if (stats.flagged > 0) status = 'Flagged';
        else if (stats.pending > 0) status = 'Pending';

        return {
          dept,
          status,
          amount: `$${stats.total.toLocaleString()}`
        };
      })
      .sort((a, b) => {
        const aVal = parseFloat(a.amount.replace(/[$,]/g, ''));
        const bVal = parseFloat(b.amount.replace(/[$,]/g, ''));
        return bVal - aVal;
      })
      .slice(0, 5);
  }, [purchases]);

  // Calculate spending velocity (monthly spending over last 12 months)
  const spendingVelocity = useMemo(() => {
    const now = new Date();
    const monthlySpend: number[] = new Array(12).fill(0);

    purchases.forEach(p => {
      const purchaseDate = new Date(p.date);
      const monthsDiff = (now.getFullYear() - purchaseDate.getFullYear()) * 12 +
                        (now.getMonth() - purchaseDate.getMonth());

      if (monthsDiff >= 0 && monthsDiff < 12 && p.status === ReviewStatus.VALIDATED) {
        monthlySpend[11 - monthsDiff] += p.amount;
      }
    });

    const maxSpend = Math.max(...monthlySpend, 1);
    const percentages = monthlySpend.map(spend => Math.round((spend / maxSpend) * 100));

    // Check if current month (last in array) is significantly higher
    const currentMonthPct = percentages[11];
    const avgPrevMonths = percentages.slice(0, 11).reduce((a, b) => a + b, 0) / 11;
    const velocityStatus = currentMonthPct > avgPrevMonths * 1.4 ? 'High' :
                          currentMonthPct > avgPrevMonths * 1.2 ? 'Medium' : 'Normal';

    return { percentages, status: velocityStatus };
  }, [purchases]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-2 duration-500">
      <header className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gov-blue dark:text-white">District Insight</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Oversight for <span className="font-bold">{user.organization}</span></p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Calendar className="w-4 h-4 mr-2" /> Fiscal Year 2024</Button>
          <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter Depts</Button>
        </div>
      </header>

      {/* DOGE Efficiency Index */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 bg-gradient-to-r from-gov-blue to-gov-darkBlue rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Bot className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif">Fiscal Oracle</h3>
                <p className="text-xs text-blue-200 font-medium">AI-Powered Executive Analyst</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <input
                  value={oracleQuery}
                  onChange={(e) => setOracleQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleOracleSearch()}
                  placeholder="Ask me anything (e.g., 'What are the top 3 wasteful spending areas this month?')"
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pl-5 pr-14 text-white placeholder:text-blue-200/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all font-medium"
                />
                <button
                  onClick={handleOracleSearch}
                  disabled={isOracleThinking || !oracleQuery}
                  className="absolute right-2 top-2 p-2 bg-white text-gov-blue rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {isOracleThinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                </button>
              </div>

              {oracleResponse && (
                <div className="bg-white/10 border border-white/10 rounded-xl p-6 animate-in fade-in slide-in-from-top-2">
                  <p className="leading-relaxed text-blue-50 font-medium">{oracleResponse}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Efficiency Score Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Efficiency Index</p>
              <Gauge className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-mono font-bold text-slate-900 dark:text-white">{efficiencyIndex}/100</p>
            <p className="text-xs text-slate-400 mt-1">Based on waste reduction metrics</p>
          </div>

          <div className="space-y-4 mt-6">
            <div className="flex justify-between items-center bg-red-50 dark:bg-red-900/10 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gov-red" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Zombie Spend</span>
              </div>
              <span className="font-mono font-bold text-gov-red">{zombieSpend}</span>
            </div>
            <div className="flex justify-between items-center bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Market Deviation</span>
              </div>
              <span className="font-mono font-bold text-amber-600">{marketDeviation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spending Velocity Tracker (Use it or lose it) */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md text-purple-600">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Spending Velocity Tracker</h3>
            <p className="text-xs text-slate-500">Detecting end-of-year "Use it or lose it" spending spikes.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2">
            {/* Real Graph Visualization */}
            <div className="h-32 flex items-end gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
              {spendingVelocity.percentages.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end group relative">
                  <div
                    className={`w-full rounded-t-sm transition-all hover:opacity-80 ${h > 70 ? 'bg-red-500' : 'bg-gov-blue'}`}
                    style={{ height: `${Math.max(h, 5)}%` }}
                  />
                  {h > 70 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                      High Velocity
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
              <span>12 Mo Ago</span>
              <span>6 Mo Ago</span>
              <span className={spendingVelocity.status === 'High' ? 'text-red-500' : ''}>Current</span>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Current Velocity</p>
            <p className={`text-3xl font-mono font-bold mb-4 ${
              spendingVelocity.status === 'High' ? 'text-red-600' :
              spendingVelocity.status === 'Medium' ? 'text-amber-600' :
              'text-emerald-600'
            }`}>{spendingVelocity.status}</p>
            <div className="space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {spendingVelocity.status === 'High' ? (
                  <><span className="font-bold text-slate-900 dark:text-white">Alert:</span> Current spending significantly above average. Monitor for end-of-year rush.</>
                ) : spendingVelocity.status === 'Medium' ? (
                  <><span className="font-bold text-slate-900 dark:text-white">Notice:</span> Spending slightly elevated compared to recent months.</>
                ) : (
                  <><span className="font-bold text-slate-900 dark:text-white">Normal:</span> Spending patterns within expected range.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Guardian: 12-Month Forecast */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-md text-indigo-600">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Budget Guardian</h3>
            <p className="text-xs text-slate-500">Predictive spend forecasting with commitment tracking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 12-Month Forecast Bar */}
          <div className="col-span-2 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-700 dark:text-slate-300">Next 12 Months Projection</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">$1.2M projected</span>
              </div>
              <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 flex">
                  <div className="bg-indigo-600 h-full" style={{ width: '45%' }} title="Committed Spend" />
                  <div className="bg-indigo-400 h-full" style={{ width: '35%' }} title="Discretionary Spend" />
                  <div className="bg-amber-500 h-full" style={{ width: '15%' }} title="At-Risk Budget" />
                </div>
              </div>
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-600 rounded-sm" />
                  <span className="text-slate-600 dark:text-slate-400">Committed (45%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-400 rounded-sm" />
                  <span className="text-slate-600 dark:text-slate-400">Discretionary (35%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-500 rounded-sm" />
                  <span className="text-slate-600 dark:text-slate-400">At-Risk (15%)</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-300">Optimization Opportunity</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    Cancel 3 unused subscriptions before renewal ($15,200/year savings). Shift Q4 capital purchases to next fiscal year for better budget allocation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Commitments */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Upcoming Renewals</p>
            <div className="space-y-2">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Adobe Creative Cloud</span>
                  <span className="text-xs font-mono text-slate-700 dark:text-slate-300">$4,200</span>
                </div>
                <p className="text-[10px] text-slate-500">Renews: Feb 15, 2026</p>
                <p className="text-[10px] text-amber-600 font-bold mt-1">⚠️ Cancel by Feb 1 to avoid charge</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Zoom Enterprise</span>
                  <span className="text-xs font-mono text-slate-700 dark:text-slate-300">$6,800</span>
                </div>
                <p className="text-[10px] text-slate-500">Renews: Mar 1, 2026</p>
                <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ Active usage confirmed</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Gym Membership</span>
                  <span className="text-xs font-mono text-slate-700 dark:text-slate-300">$2,400</span>
                </div>
                <p className="text-[10px] text-slate-500">Renews: Jan 30, 2026</p>
                <p className="text-[10px] text-red-600 font-bold mt-1">🚨 Zombie spend - 0 usage</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Category Spend</h3>
            <Button variant="ghost" size="sm">Export <ArrowUpRight className="ml-2 w-3 h-3" /></Button>
          </div>
          <div className="p-6 space-y-5">
            {categorySpend.length > 0 ? (
              categorySpend.map(item => (
                <div key={item.cat} className="space-y-1.5">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{item.cat}</span>
                    <span className="text-slate-900 dark:text-white font-mono">{item.val}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} transition-all`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <p className="text-sm font-bold">No validated spending yet</p>
                <p className="text-xs mt-1">Category data will appear as purchases are approved</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Department Activity</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
              <input placeholder="Search dept..." className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-xs font-medium outline-none" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                <tr>
                  <th className="px-6 py-3">Department</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {departmentActivity.length > 0 ? (
                  departmentActivity.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-3.5 text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {row.dept}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge color={row.status === 'Validated' ? 'green' : row.status === 'Flagged' ? 'red' : 'blue'}>
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-sm font-bold text-slate-700 dark:text-slate-300 font-mono text-right">{row.amount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                      <p className="text-sm font-bold">No department data yet</p>
                      <p className="text-xs mt-1">Department activity will appear as purchases are submitted</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Impact Storyteller Section */}
      <Card className="p-0 overflow-hidden border-2 border-gov-blue/20">
        {/* Header with gradient */}
        <div className="p-6 border-b bg-gradient-to-r from-gov-blue/5 to-purple-500/5">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-gov-blue" />
            <h3 className="font-bold text-xl">Impact Storyteller</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Transform your savings into compelling narratives for stakeholders
          </p>
        </div>

        {/* Impact equivalents grid */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {impactEquivalents.map((item, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gov-blue/10 rounded-lg flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-gov-blue" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.value}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{item.label}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Total savings display */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">Total Savings This Quarter</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">From prevented waste, zombie spend, and market deviations</p>
              </div>
              <p className="text-4xl font-bold font-mono text-emerald-600 dark:text-emerald-400">${totalSavings.toLocaleString()}</p>
            </div>
          </div>

          {/* Audience selector buttons */}
          <div className="flex gap-3">
            <Button
              variant={activeAudience === 'board' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => generateStory('board')}
              disabled={narrativeLoading}
            >
              School Board
            </Button>
            <Button
              variant={activeAudience === 'parent' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => generateStory('parent')}
              disabled={narrativeLoading}
            >
              Parents
            </Button>
            <Button
              variant={activeAudience === 'state' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => generateStory('state')}
              disabled={narrativeLoading}
            >
              State Officials
            </Button>
          </div>

          {/* Generated narrative display */}
          {(narrativeLoading || narratives[activeAudience]) && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border-2 border-slate-200 dark:border-slate-700 min-h-[200px]">
              {narrativeLoading ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-gov-blue mb-3" />
                  <p className="text-sm text-slate-500">Generating narrative...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm text-gov-blue uppercase">
                      {activeAudience === 'board' ? 'Board Presentation' :
                       activeAudience === 'parent' ? 'Parent Newsletter' :
                       'State Report'}
                    </h5>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(narratives[activeAudience])}
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {narratives[activeAudience]}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};