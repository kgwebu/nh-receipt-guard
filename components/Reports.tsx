
import React, { useMemo } from 'react';
import { PurchaseDocument, ReviewStatus, User, UserRole } from '../types';
import { Card, Badge, Button } from './Common';
import {
  TrendingUp,
  Calendar,
  ShieldCheck,
  FileDown,
  ChevronRight,
  Target,
  Users
} from 'lucide-react';

interface ReportsProps {
  purchases: PurchaseDocument[];
  user: User;
}

// Helper function to assign colors to flag types
const getColorForFlag = (flagType: string): string => {
  const colorMap: Record<string, string> = {
    'DUPLICATE': 'bg-gov-red',
    'PRICE_ANOMALY': 'bg-amber-500',
    'RENEWAL': 'bg-gov-blue',
    'UNUSUAL_ITEM': 'bg-slate-400',
    'MARKET_DEVIATION': 'bg-orange-500',
    'ZOMBIE_SPEND': 'bg-purple-500',
    'WASTE': 'bg-red-600',
    'POLICY_VIOLATION': 'bg-rose-500',
    'INSUFFICIENT_DOCS': 'bg-yellow-500',
    'UNAUTHORIZED': 'bg-red-500',
    'FRAUD_SUSPECTED': 'bg-red-700',
    'BUDGET_EXCEEDED': 'bg-orange-600',
    'OTHER': 'bg-gray-500'
  };
  return colorMap[flagType] || 'bg-slate-400';
};

export const Reports: React.FC<ReportsProps> = ({ purchases, user }) => {
  const isViewer = user.role === UserRole.VIEWER;

  // Filter purchases for Submitters to show only their own data
  const relevantPurchases = useMemo(() => {
    if (user.role === UserRole.SUBMITTER) {
      return purchases.filter(p => p.submittedBy === user.name || p.id.startsWith('temp-'));
    }
    return purchases;
  }, [purchases, user]);

  const stats = useMemo(() => {
    const total = relevantPurchases.length;
    const resolved = relevantPurchases.filter(p => p.status === ReviewStatus.RESOLVED);
    const rejected = relevantPurchases.filter(p => p.status === ReviewStatus.REJECTED);
    const validated = relevantPurchases.filter(p => p.status === ReviewStatus.VALIDATED);
    const savings = [...resolved, ...rejected].reduce((acc, p) => acc + p.amount, 0);
    const totalSpent = validated.reduce((acc, p) => acc + p.amount, 0);

    // Calculate efficiency increase (% of total spend that was prevented)
    const totalValue = savings + totalSpent;
    const efficiencyIncrease = totalValue > 0
      ? Math.round((savings / totalValue) * 100 * 10) / 10  // Round to 1 decimal
      : 0;

    // Vendor frequency
    const vendorFreq: Record<string, number> = {};
    relevantPurchases.forEach(p => {
      vendorFreq[p.vendor] = (vendorFreq[p.vendor] || 0) + 1;
    });
    const topVendors = Object.entries(vendorFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Calculate review throughput (reviews per day)
    const reviewedPurchases = relevantPurchases.filter(p =>
      p.status === ReviewStatus.RESOLVED ||
      p.status === ReviewStatus.REJECTED ||
      p.status === ReviewStatus.VALIDATED
    );

    // Calculate date range for throughput
    const dates = reviewedPurchases
      .map(p => p.resolvedAt || p.rejectedAt || p.date)
      .filter(Boolean)
      .map(d => new Date(d!).getTime());

    let reviewThroughput = 0;
    if (dates.length > 1) {
      const minDate = Math.min(...dates);
      const maxDate = Math.max(...dates);
      const daysDiff = Math.max(1, (maxDate - minDate) / (1000 * 60 * 60 * 24));
      reviewThroughput = reviewedPurchases.length / daysDiff;
    } else if (reviewedPurchases.length > 0) {
      reviewThroughput = reviewedPurchases.length;
    }

    // Calculate monthly goal progress (% of items reviewed)
    const monthlyGoalPct = total > 0
      ? Math.round((reviewedPurchases.length / total) * 100)
      : 0;

    // Flag category statistics
    const flagStats: Record<string, number> = {};
    relevantPurchases.forEach(p => {
      if (p.flags && p.flags.length > 0) {
        p.flags.forEach(flag => {
          const flagType = flag.type || 'UNKNOWN';
          flagStats[flagType] = (flagStats[flagType] || 0) + 1;
        });
      }
      // Also count rejection flags
      if (p.rejectionFlags && p.rejectionFlags.length > 0) {
        p.rejectionFlags.forEach(flag => {
          flagStats[flag] = (flagStats[flag] || 0) + 1;
        });
      }
    });

    const totalFlags = Object.values(flagStats).reduce((acc, count) => acc + count, 0);
    const flagCategories = Object.entries(flagStats)
      .map(([type, count]) => ({
        type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count,
        pct: totalFlags > 0 ? Math.round((count / totalFlags) * 100) : 0,
        color: getColorForFlag(type)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      total,
      savings,
      totalSpent,
      topVendors,
      reviewThroughput,
      monthlyGoalPct,
      flagCategories,
      efficiencyIncrease
    };
  }, [relevantPurchases]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gov-blue dark:text-white">Fiscal Reports</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {isViewer ? 'District-wide performance and cost avoidance.' : 'Departmental efficiency analysis.'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <FileDown className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" /> Q4 2024
          </Button>
        </div>
      </header>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Replaced Card with div to ensure background color application */}
        <div className="p-8 bg-gov-blue text-white shadow-md rounded-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <ShieldCheck className="w-8 h-8 opacity-80" />
              <div className="bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">Live Data</div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Total Cost Avoidance</p>
            <h3 className="text-4xl font-serif font-bold mt-2">${stats.savings.toLocaleString()}</h3>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-100">
              <TrendingUp className="w-4 h-4" />
              {stats.efficiencyIncrease > 0 ? `+${stats.efficiencyIncrease}%` : '0%'} Efficiency rate
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
        </div>

        <Card className="p-8 space-y-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Validated Spend</p>
            <h3 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mt-1">${stats.totalSpent.toLocaleString()}</h3>
          </div>
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-slate-600 dark:text-slate-400">Reviews Pending</span>
              <span className="text-gov-blue dark:text-blue-400">{relevantPurchases.filter(p => p.status === ReviewStatus.PENDING).length}</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span className="text-slate-600 dark:text-slate-400">Critical Alerts</span>
              <span className="text-gov-red">{relevantPurchases.filter(p => p.status === ReviewStatus.FLAGGED).length}</span>
            </div>
          </div>
        </Card>

        <Card className="p-8 space-y-6">
          <div>
             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Review Throughput</p>
             <h3 className="text-3xl font-serif font-bold text-slate-900 dark:text-white mt-1">
               {stats.reviewThroughput.toFixed(1)}
               <span className="text-sm text-slate-400 font-sans font-normal ml-2">avg/day</span>
             </h3>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
             <div className="flex items-center justify-between mb-2">
               <span className="text-xs font-bold text-slate-500">Review Progress</span>
               <span className="text-xs font-bold text-slate-900 dark:text-white">{stats.monthlyGoalPct}%</span>
             </div>
             <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gov-blue transition-all" style={{ width: `${stats.monthlyGoalPct}%` }} />
             </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
             <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
               <Target className="w-5 h-5 text-slate-500" />
               Flag Categories
             </h3>
          </div>
          <div className="p-6 space-y-6">
            {stats.flagCategories.length > 0 ? (
              stats.flagCategories.map((item, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between text-sm font-bold mb-2">
                    <span className="text-slate-700 dark:text-slate-300">{item.type}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 text-xs">{item.count} items</span>
                      <span className="text-slate-900 dark:text-white">{item.pct}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                     <div className={`h-full ${item.color} transition-all`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <p className="text-sm font-bold">No flags detected yet</p>
                <p className="text-xs mt-1">Flag data will appear as items are reviewed</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
             <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
               <Users className="w-5 h-5 text-slate-500" />
               Frequent Vendors
             </h3>
             <Button variant="ghost" size="sm">View All</Button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.topVendors.length > 0 ? (
              stats.topVendors.map(([vendor, count], idx) => (
                <div key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-600 dark:text-slate-300">
                         {idx + 1}
                      </div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{vendor}</span>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-500">{count} Transactions</span>
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                   </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                <p className="text-sm font-bold">No vendor data yet</p>
                <p className="text-xs mt-1">Vendor statistics will appear as purchases are added</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
