import React, { useState, useMemo } from 'react';
import { PurchaseDocument, ReviewStatus, User, FlagType, RejectionFixSuggestion } from '../types';
import { Card, Badge, Button } from './Common';
import { suggestRejectionFix, analyzeVendorHistory } from '../services/geminiService';
import {
  Receipt,
  FileCheck,
  Clock,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Lightbulb,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  History,
  DollarSign,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface MySubmissionsProps {
  purchases: PurchaseDocument[];
  onReview: (id: string) => void;
  onAdd: () => void;
  user: User;
}

export const MySubmissions: React.FC<MySubmissionsProps> = ({ purchases, onReview, onAdd, user }) => {
  const myPurchases = purchases.filter(p => p.submittedBy === user.name || p.id.startsWith('temp-'));

  // State for expanded items (to show AI suggestions)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [fixSuggestions, setFixSuggestions] = useState<Record<string, RejectionFixSuggestion>>({});
  const [loadingFix, setLoadingFix] = useState<string | null>(null);

  // State for price memory
  const [priceAnalysis, setPriceAnalysis] = useState<Record<string, {
    priceAnalysis: string;
    recommendation: string;
    priceChangePercent: number;
    bestHistoricalPrice: { vendor: string; amount: number; date: string };
    averagePrice: number;
  }>>({});
  const [loadingPrice, setLoadingPrice] = useState<string | null>(null);

  // Toggle expansion
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Get AI fix suggestion for rejected item
  const getFixSuggestion = async (item: PurchaseDocument) => {
    if (fixSuggestions[item.id]) return;

    setLoadingFix(item.id);
    try {
      const result = await suggestRejectionFix(
        item.vendor,
        item.amount,
        item.description,
        item.rejectionNotes || 'No specific reason provided',
        item.rejectionFlags || []
      );

      if (result) {
        setFixSuggestions(prev => ({
          ...prev,
          [item.id]: result
        }));
      }
    } catch (error) {
      console.error('Failed to get fix suggestion:', error);
    } finally {
      setLoadingFix(null);
    }
  };

  // Get price history analysis
  const getPriceAnalysis = async (item: PurchaseDocument) => {
    if (priceAnalysis[item.id]) return;

    setLoadingPrice(item.id);
    try {
      // Find similar historical purchases
      const historicalPurchases = myPurchases
        .filter(p =>
          p.id !== item.id &&
          (p.vendor.toLowerCase().includes(item.vendor.toLowerCase().split(' ')[0]) ||
           p.description.toLowerCase().includes(item.description.toLowerCase().split(' ')[0]))
        )
        .map(p => ({
          vendor: p.vendor,
          amount: p.amount,
          date: p.date,
          description: p.description
        }));

      if (historicalPurchases.length > 0) {
        const result = await analyzeVendorHistory(
          item.vendor,
          item.description,
          item.amount,
          historicalPurchases
        );

        if (result) {
          setPriceAnalysis(prev => ({
            ...prev,
            [item.id]: result
          }));
        }
      }
    } catch (error) {
      console.error('Failed to get price analysis:', error);
    } finally {
      setLoadingPrice(null);
    }
  };

  // Auto-load suggestions for rejected items when expanded
  const handleExpand = async (item: PurchaseDocument) => {
    toggleExpand(item.id);

    if (!expandedItems.has(item.id)) {
      // Load fix suggestion for rejected items
      if (item.status === ReviewStatus.REJECTED && !fixSuggestions[item.id]) {
        getFixSuggestion(item);
      }

      // Load price analysis if there's historical data
      if (!priceAnalysis[item.id]) {
        getPriceAnalysis(item);
      }
    }
  };

  // Group purchases by status
  const groupedPurchases = useMemo(() => {
    const rejected = myPurchases.filter(p => p.status === ReviewStatus.REJECTED);
    const pending = myPurchases.filter(p => p.status === ReviewStatus.PENDING || p.status === ReviewStatus.FLAGGED);
    const approved = myPurchases.filter(p => p.status === ReviewStatus.VALIDATED);
    const resolved = myPurchases.filter(p => p.status === ReviewStatus.RESOLVED);

    return { rejected, pending, approved, resolved };
  }, [myPurchases]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gov-blue dark:text-white">My Submissions</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Track and manage your purchase requests</p>
        </div>
        <Button variant="primary" onClick={onAdd}>
          + New Request
        </Button>
      </header>

      {/* Rejected Items Section (with AI Fix-It) */}
      {groupedPurchases.rejected.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400">
              Needs Your Attention ({groupedPurchases.rejected.length})
            </h3>
          </div>
          <div className="space-y-3">
            {groupedPurchases.rejected.map(item => (
              <div key={item.id} className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg overflow-hidden">
                {/* Main Row */}
                <div
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  onClick={() => handleExpand(item)}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-10 h-10 rounded-md flex items-center justify-center bg-red-100 border border-red-200 text-red-600">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.vendor}</h4>
                      <p className="text-xs text-slate-500 font-medium">{item.date} • {item.description.slice(0, 50)}...</p>
                      {item.rejectionFlags && item.rejectionFlags.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          {item.rejectionFlags.map((flag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-red-200 dark:bg-red-800/30 text-red-700 dark:text-red-300 rounded text-[10px] font-semibold"
                            >
                              {flag.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white font-mono">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <span className="text-[10px] font-bold text-red-600 uppercase flex items-center gap-1 justify-end">
                        <AlertTriangle className="w-3 h-3" /> Rejected
                      </span>
                    </div>
                    {expandedItems.has(item.id) ? (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Content - AI Fix-It Flow */}
                {expandedItems.has(item.id) && (
                  <div className="border-t border-red-200 dark:border-red-800 p-5 bg-white dark:bg-slate-900 space-y-4">
                    {/* Rejection Reason */}
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase mb-1">Rejection Reason</p>
                      <p className="text-sm text-red-800 dark:text-red-300">{item.rejectionNotes || 'No specific reason provided by reviewer'}</p>
                    </div>

                    {/* AI Fix Suggestion */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        <span className="font-bold text-blue-900 dark:text-blue-300">AI Fix Suggestion</span>
                      </div>

                      {loadingFix === item.id ? (
                        <div className="flex items-center gap-3 py-4">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          <span className="text-sm text-blue-600">Analyzing rejection and finding solutions...</span>
                        </div>
                      ) : fixSuggestions[item.id] ? (
                        <div className="space-y-3">
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {fixSuggestions[item.id].suggestion}
                          </p>

                          {fixSuggestions[item.id].alternativeVendors && fixSuggestions[item.id].alternativeVendors.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-500">Try:</span>
                              {fixSuggestions[item.id].alternativeVendors.map((vendor, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                                  {vendor}
                                </span>
                              ))}
                            </div>
                          )}

                          {fixSuggestions[item.id].estimatedSavings > 0 && (
                            <div className="flex items-center gap-2 text-emerald-600">
                              <DollarSign className="w-4 h-4" />
                              <span className="text-sm font-bold">
                                Potential savings: ${fixSuggestions[item.id].estimatedSavings.toLocaleString()}
                              </span>
                            </div>
                          )}

                          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg mt-3">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Pro Tip: </span>
                                <span className="text-xs text-amber-700 dark:text-amber-400">{fixSuggestions[item.id].learningTip}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => getFixSuggestion(item)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Get AI suggestions to fix this
                        </button>
                      )}
                    </div>

                    {/* Price Memory Section */}
                    {priceAnalysis[item.id] && (
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-3">
                          <History className="w-5 h-5 text-purple-600" />
                          <span className="font-bold text-purple-900 dark:text-purple-300">Price Memory</span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-slate-700 dark:text-slate-300">{priceAnalysis[item.id].priceAnalysis}</p>

                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-2">
                              {priceAnalysis[item.id].priceChangePercent > 0 ? (
                                <TrendingUp className="w-4 h-4 text-red-500" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-emerald-500" />
                              )}
                              <span className={`text-sm font-bold ${priceAnalysis[item.id].priceChangePercent > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                {priceAnalysis[item.id].priceChangePercent > 0 ? '+' : ''}{priceAnalysis[item.id].priceChangePercent}% vs avg
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <span className="text-xs">Best: ${priceAnalysis[item.id].bestHistoricalPrice.amount} from {priceAnalysis[item.id].bestHistoricalPrice.vendor}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <Button variant="primary" size="sm" onClick={onAdd}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Resubmit with Fix
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onReview(item.id)}>
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pending Items Section */}
      {groupedPurchases.pending.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-amber-700 dark:text-amber-400">
              Awaiting Review ({groupedPurchases.pending.length})
            </h3>
          </div>
          <div className="space-y-3">
            {groupedPurchases.pending.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => handleExpand(item)}
              >
                <div className="flex items-center gap-5">
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center border ${
                    item.status === ReviewStatus.FLAGGED ? 'bg-amber-50 border-amber-100 text-amber-600' :
                    'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.vendor}</h4>
                    <p className="text-xs text-slate-500 font-medium">{item.date} • {item.description.slice(0, 50)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white font-mono">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <span className={`text-[10px] font-bold uppercase flex items-center gap-1 justify-end ${
                      item.status === ReviewStatus.FLAGGED ? 'text-amber-600' : 'text-slate-400'
                    }`}>
                      {item.status === ReviewStatus.FLAGGED ? (
                        <><AlertCircle className="w-3 h-3" /> In Review</>
                      ) : (
                        <><Clock className="w-3 h-3" /> Pending</>
                      )}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onReview(item.id); }}>
                    View <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Approved Items Section */}
      {groupedPurchases.approved.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
              Approved ({groupedPurchases.approved.length})
            </h3>
          </div>
          <div className="space-y-3">
            {groupedPurchases.approved.slice(0, 5).map(item => (
              <div
                key={item.id}
                className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-md flex items-center justify-center bg-emerald-100 border border-emerald-200 text-emerald-600">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.vendor}</h4>
                    <p className="text-xs text-slate-500 font-medium">{item.date} • {item.description.slice(0, 50)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white font-mono">${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1 justify-end">
                      <FileCheck className="w-3 h-3" /> Approved
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onReview(item.id)}>
                    View <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            ))}

            {groupedPurchases.approved.length > 5 && (
              <button className="w-full text-center py-3 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                View all {groupedPurchases.approved.length} approved items...
              </button>
            )}
          </div>
        </section>
      )}

      {/* Empty State */}
      {myPurchases.length === 0 && (
        <div className="text-center py-16">
          <Receipt className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No submissions yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Start by uploading your first receipt</p>
          <Button variant="primary" onClick={onAdd}>
            + Create First Request
          </Button>
        </div>
      )}
    </div>
  );
};
