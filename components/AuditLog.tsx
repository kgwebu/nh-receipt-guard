
import React, { useMemo, useState } from 'react';
import { PurchaseDocument, ReviewStatus, User, FlagType } from '../types';
import { Card, Badge } from './Common';
import {
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flag,
  Calendar,
  User as UserIcon,
  Filter,
  TrendingUp
} from 'lucide-react';

interface AuditLogProps {
  purchases: PurchaseDocument[];
  user: User;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  action: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'FLAGGED' | 'RESOLVED';
  purchaseId: string;
  vendor: string;
  amount: number;
  performedBy: string;
  details?: string;
  flags?: FlagType[];
}

export const AuditLog: React.FC<AuditLogProps> = ({ purchases, user }) => {
  const [filterAction, setFilterAction] = useState<string>('all');

  const auditEntries = useMemo(() => {
    const entries: AuditEntry[] = [];

    purchases.forEach(purchase => {
      // Submission entry
      entries.push({
        id: `${purchase.id}-submit`,
        timestamp: purchase.date,
        action: 'SUBMITTED',
        purchaseId: purchase.id,
        vendor: purchase.vendor,
        amount: purchase.amount,
        performedBy: purchase.submittedBy || 'System',
        details: `Submitted purchase for ${purchase.description}`
      });

      // Approval entry
      if (purchase.status === ReviewStatus.VALIDATED && purchase.resolvedBy) {
        entries.push({
          id: `${purchase.id}-approved`,
          timestamp: purchase.resolvedAt || purchase.date,
          action: 'APPROVED',
          purchaseId: purchase.id,
          vendor: purchase.vendor,
          amount: purchase.amount,
          performedBy: purchase.resolvedBy,
          details: purchase.reviewNotes || 'Payment approved'
        });
      }

      // Rejection entry
      if (purchase.status === ReviewStatus.REJECTED && purchase.rejectedBy) {
        entries.push({
          id: `${purchase.id}-rejected`,
          timestamp: purchase.rejectedAt || purchase.date,
          action: 'REJECTED',
          purchaseId: purchase.id,
          vendor: purchase.vendor,
          amount: purchase.amount,
          performedBy: purchase.rejectedBy,
          details: purchase.rejectionNotes || 'Payment rejected',
          flags: purchase.rejectionFlags
        });
      }

      // Flagged entry
      if (purchase.status === ReviewStatus.FLAGGED && purchase.flags && purchase.flags.length > 0) {
        entries.push({
          id: `${purchase.id}-flagged`,
          timestamp: purchase.flaggedAt || purchase.date,
          action: 'FLAGGED',
          purchaseId: purchase.id,
          vendor: purchase.vendor,
          amount: purchase.amount,
          performedBy: 'AI Analysis',
          details: `Flagged: ${purchase.flags.map(f => f.type).join(', ')}`,
          flags: purchase.flags.map(f => f.type as FlagType)
        });
      }

      // Resolved entry
      if (purchase.status === ReviewStatus.RESOLVED && purchase.resolvedBy) {
        entries.push({
          id: `${purchase.id}-resolved`,
          timestamp: purchase.resolvedAt || purchase.date,
          action: 'RESOLVED',
          purchaseId: purchase.id,
          vendor: purchase.vendor,
          amount: purchase.amount,
          performedBy: purchase.resolvedBy,
          details: purchase.resolutionNotes || 'Flag resolved'
        });
      }
    });

    // Sort by timestamp (newest first)
    entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return entries;
  }, [purchases]);

  const filteredEntries = useMemo(() => {
    if (filterAction === 'all') return auditEntries;
    return auditEntries.filter(entry => entry.action === filterAction);
  }, [auditEntries, filterAction]);

  const stats = useMemo(() => {
    return {
      total: auditEntries.length,
      approved: auditEntries.filter(e => e.action === 'APPROVED').length,
      rejected: auditEntries.filter(e => e.action === 'REJECTED').length,
      flagged: auditEntries.filter(e => e.action === 'FLAGGED').length,
    };
  }, [auditEntries]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'APPROVED': return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'REJECTED': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'FLAGGED': return <Flag className="w-4 h-4 text-amber-600" />;
      case 'RESOLVED': return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      case 'SUBMITTED': return <TrendingUp className="w-4 h-4 text-slate-600" />;
      default: return <History className="w-4 h-4 text-slate-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'APPROVED': return 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900';
      case 'REJECTED': return 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900';
      case 'FLAGGED': return 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900';
      case 'RESOLVED': return 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900';
      case 'SUBMITTED': return 'bg-slate-50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800';
      default: return 'bg-slate-50 dark:bg-slate-900/10 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gov-blue dark:text-white">Audit Logs</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Complete history of all review actions and decisions
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card className="p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Total Actions</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Approved</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Flagged</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.flagged}</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-6">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Filter:</span>
          {['all', 'APPROVED', 'REJECTED', 'FLAGGED', 'RESOLVED', 'SUBMITTED'].map(action => (
            <button
              key={action}
              onClick={() => setFilterAction(action)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                filterAction === action
                  ? 'bg-gov-blue text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {action === 'all' ? 'All' : action}
            </button>
          ))}
        </div>
      </header>

      {/* Audit Log Entries */}
      <div className="space-y-3">
        {filteredEntries.length > 0 ? (
          filteredEntries.map(entry => (
            <Card key={entry.id} className={`p-5 border ${getActionColor(entry.action)}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="mt-1">
                    {getActionIcon(entry.action)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {entry.action}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                        {entry.vendor}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        ${entry.amount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {entry.details}
                    </p>
                    {entry.flags && entry.flags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        {entry.flags.map((flag, idx) => (
                          <Badge key={idx} variant="warning" className="text-xs">
                            {flag.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-3 h-3" />
                        <span>{entry.performedBy}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(entry.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <History className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Audit Entries</h3>
            <p className="text-sm text-slate-500">
              {filterAction === 'all'
                ? 'Audit logs will appear as review actions are taken'
                : `No ${filterAction} actions found`}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
