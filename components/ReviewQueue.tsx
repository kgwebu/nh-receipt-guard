import React, { useState, useMemo } from 'react';
import { PurchaseDocument, ReviewStatus, User, FlagType } from '../types';
import { Badge, Button } from './Common';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Calendar, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  Receipt,
  XCircle,
  History
} from 'lucide-react';

interface ReviewQueueProps {
  purchases: PurchaseDocument[];
  onReview: (id: string) => void;
  user: User;
}

type SortOrder = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
type QueueTab = 'priority' | 'standard' | 'history';

export const ReviewQueue: React.FC<ReviewQueueProps> = ({ purchases, onReview, user }) => {
  const [activeTab, setActiveTab] = useState<QueueTab>('priority');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');

  // Stats
  const stats = useMemo(() => {
    const resolved = purchases.filter(p => p.status === ReviewStatus.RESOLVED);
    const rejected = purchases.filter(p => p.status === ReviewStatus.REJECTED);
    const wastePrevented = [...resolved, ...rejected].reduce((acc, p) => acc + p.amount, 0);
    const approved = purchases.filter(p => p.status === ReviewStatus.VALIDATED);
    const totalProcessed = resolved.length + rejected.length + approved.length;
    return {
      wastePrevented,
      totalProcessed,
      flaggedCount: purchases.filter(p => p.status === ReviewStatus.FLAGGED).length,
      pendingCount: purchases.filter(p => p.status === ReviewStatus.PENDING).length,
      rejectedCount: rejected.length
    };
  }, [purchases]);

  const uniqueDepartments = useMemo(() => {
    const depts = new Set(purchases.map(p => p.department));
    return Array.from(depts).sort();
  }, [purchases]);

  const filteredPurchases = useMemo(() => {
    let filtered = purchases.filter(p => {
      // 1. Tab Filter
      if (activeTab === 'priority') {
        const isFlagged = p.status === ReviewStatus.FLAGGED;
        const isHighValue = p.amount > 5000 && p.status === ReviewStatus.PENDING;
        if (!isFlagged && !isHighValue) return false;
      } else if (activeTab === 'standard') {
        if (p.status !== ReviewStatus.PENDING) return false;
        // Exclude items already shown in priority (optional preference, keeping simple for now)
        if (p.amount > 5000) return false; 
      } else if (activeTab === 'history') {
        if (p.status !== ReviewStatus.VALIDATED && p.status !== ReviewStatus.RESOLVED && p.status !== ReviewStatus.REJECTED) return false;
      }

      // 2. Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!p.vendor.toLowerCase().includes(query) && 
            !p.description.toLowerCase().includes(query) &&
            !p.id.toLowerCase().includes(query)) return false;
      }

      // 3. Dept Filter
      if (departmentFilter !== 'all' && p.department !== departmentFilter) return false;

      return true;
    });

    // 4. Sort
    return filtered.sort((a, b) => {
      if (sortOrder === 'amount-desc') return b.amount - a.amount;
      if (sortOrder === 'amount-asc') return a.amount - b.amount;
      if (sortOrder === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      return new Date(b.date).getTime() - new Date(a.date).getTime(); // default date-desc
    });
  }, [purchases, activeTab, searchQuery, departmentFilter, sortOrder]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gov-blue dark:text-white">Review Queue</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Oversight for <span className="font-bold">{user.organization}</span></p>
        </div>
        <div className="flex flex-col items-end gap-2">
           <div className="bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-md border border-emerald-100 dark:border-emerald-900 text-right">
             <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Est. Savings</p>
             <p className="text-2xl font-serif font-bold text-emerald-700 dark:text-emerald-400">${stats.wastePrevented.toLocaleString()}</p>
           </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('priority')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'priority' 
              ? 'border-gov-red text-gov-red' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Priority Items
          <Badge color="red" className="ml-1 px-1.5 py-0.5 text-[10px]">{stats.flaggedCount}</Badge>
        </button>
        <button
          onClick={() => setActiveTab('standard')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'standard' 
              ? 'border-gov-blue text-gov-blue' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          Standard Queue
          <Badge color="blue" className="ml-1 px-1.5 py-0.5 text-[10px]">{stats.pendingCount}</Badge>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'history' 
              ? 'border-slate-800 text-slate-800 dark:border-white dark:text-white' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300 dark:text-slate-400'
          }`}
        >
          <History className="w-4 h-4" />
          Review History
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendor, ID, description..." 
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue transition-all text-sm"
          />
        </div>
        
        <div className="flex gap-2">
          {/* Department Filter */}
          <div className="relative">
             <select
               value={departmentFilter}
               onChange={(e) => setDepartmentFilter(e.target.value)}
               className="h-full appearance-none pl-9 pr-8 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-gov-blue cursor-pointer"
             >
               <option value="all">All Departments</option>
               {uniqueDepartments.map(d => (
                 <option key={d} value={d}>{d}</option>
               ))}
             </select>
             <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          {/* Sort Order */}
          <div className="relative">
             <select
               value={sortOrder}
               onChange={(e) => setSortOrder(e.target.value as SortOrder)}
               className="h-full appearance-none pl-9 pr-8 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-gov-blue cursor-pointer"
             >
               <option value="date-desc">Date (Newest)</option>
               <option value="date-asc">Date (Oldest)</option>
               <option value="amount-desc">Amount (Highest)</option>
               <option value="amount-asc">Amount (Lowest)</option>
             </select>
             <ArrowUpDown className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {filteredPurchases.length > 0 ? (
          filteredPurchases.map(item => (
            <div 
              key={item.id} 
              onClick={() => onReview(item.id)}
              className={`
                group bg-white dark:bg-slate-900 border rounded-lg p-5 flex items-center justify-between cursor-pointer transition-all hover:shadow-md
                ${item.status === ReviewStatus.FLAGGED ? 'border-l-4 border-l-gov-red border-y-slate-200 border-r-slate-200 dark:border-slate-800' : 'border-slate-200 dark:border-slate-800'}
              `}
            >
              <div className="flex items-center gap-5">
                <div className={`w-12 h-12 rounded-md flex items-center justify-center border ${
                  item.status === ReviewStatus.FLAGGED ? 'bg-red-50 dark:bg-red-900/20 text-gov-red border-red-100 dark:border-red-900' :
                  item.status === ReviewStatus.VALIDATED ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-900' :
                  item.status === ReviewStatus.RESOLVED ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200' :
                  item.status === ReviewStatus.REJECTED ? 'bg-red-100 dark:bg-red-900/30 text-red-600 border-red-200 dark:border-red-800' :
                  'bg-blue-50 dark:bg-blue-900/10 text-gov-blue border-blue-100 dark:border-blue-800'
                }`}>
                  {item.status === ReviewStatus.FLAGGED ? <AlertTriangle className="w-6 h-6" /> :
                   item.status === ReviewStatus.VALIDATED ? <CheckCircle className="w-6 h-6" /> :
                   item.status === ReviewStatus.RESOLVED ? <XCircle className="w-6 h-6" /> :
                   item.status === ReviewStatus.REJECTED ? <XCircle className="w-6 h-6" /> :
                   <Receipt className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-gov-blue transition-colors">{item.vendor}</h4>
                    {item.amount > 5000 && <Badge color="amber">High Value</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
                    <span>•</span>
                    <span>{item.department}</span>
                    <span>•</span>
                    <span>{item.submittedBy}</span>
                  </div>
                  {item.status === ReviewStatus.REJECTED && item.rejectionFlags && item.rejectionFlags.length > 0 && (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">Rejected:</span>
                      {item.rejectionFlags.slice(0, 3).map((flag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-[10px] font-semibold"
                        >
                          {flag.replace('_', ' ')}
                        </span>
                      ))}
                      {item.rejectionFlags.length > 3 && (
                        <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold">
                          +{item.rejectionFlags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  {item.status === ReviewStatus.RESOLVED && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 italic">
                      Flagged as wasteful spending
                    </p>
                  )}
                  {item.status === ReviewStatus.VALIDATED && activeTab === 'history' && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">
                      Approved for payment
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-8">
                 <div className="text-right">
                    <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">${item.amount.toLocaleString()}</p>
                    {item.status === ReviewStatus.FLAGGED && (
                      <p className="text-xs font-bold text-gov-red uppercase tracking-wider">{item.flags[0]?.type.replace('_', ' ') || 'FLAGGED'}</p>
                    )}
                    {item.status === ReviewStatus.REJECTED && (
                      <p className="text-xs font-bold text-red-600 uppercase tracking-wider">
                        {item.rejectionFlags?.[0]?.replace('_', ' ') || 'REJECTED'}
                      </p>
                    )}
                 </div>
                 <Button size="sm" variant={item.status === ReviewStatus.FLAGGED || item.status === ReviewStatus.REJECTED ? "danger" : "outline"} className="group-hover:translate-x-1 transition-transform">
                    {activeTab === 'history' ? 'View Record' : 'Review'} <ChevronRight className="w-4 h-4 ml-1" />
                 </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-700">
             <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
               <Search className="w-8 h-8" />
             </div>
             <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No transactions found</h3>
             <p className="text-slate-500">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
};
