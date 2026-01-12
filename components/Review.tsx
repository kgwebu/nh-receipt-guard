import React, { useState, useMemo } from 'react';
import { PurchaseDocument, ReviewStatus, FlagType, User, UserRole } from '../types';
import { Button, Card, Badge } from './Common';
import { generateRejectionDraft } from '../services/geminiService';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info,
  Calendar,
  Tag,
  ShieldAlert,
  History,
  TrendingDown,
  FileText,
  MessageSquare,
  Copy,
  Loader2,
  Send,
  Scale,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface ReviewProps {
  item: PurchaseDocument;
  purchases: PurchaseDocument[]; // Added to calculate history from real data
  onBack: () => void;
  onUpdate: (id: string, updates: Partial<PurchaseDocument>) => void;
  user: User;
}

// Rejection flag options with labels
const REJECTION_FLAGS = [
  { type: FlagType.WASTE, label: 'Wasteful Spending', description: 'Unnecessary or excessive expenditure' },
  { type: FlagType.POLICY_VIOLATION, label: 'Policy Violation', description: 'Violates procurement policies' },
  { type: FlagType.INSUFFICIENT_DOCS, label: 'Insufficient Documentation', description: 'Missing required documents' },
  { type: FlagType.UNAUTHORIZED, label: 'Unauthorized Purchase', description: 'Not properly authorized' },
  { type: FlagType.FRAUD_SUSPECTED, label: 'Suspected Fraud', description: 'Potential fraudulent activity' },
  { type: FlagType.BUDGET_EXCEEDED, label: 'Budget Exceeded', description: 'Over department budget limits' },
  { type: FlagType.DUPLICATE, label: 'Duplicate Payment', description: 'Already paid or duplicate request' },
  { type: FlagType.PRICE_ANOMALY, label: 'Price Anomaly', description: 'Pricing significantly above market' },
  { type: FlagType.OTHER, label: 'Other', description: 'Other rejection reason' },
];

export const Review: React.FC<ReviewProps> = ({ item, purchases, onBack, onUpdate, user }) => {
  const [isResolving, setIsResolving] = useState(false);
  const [showDraft, setShowDraft] = useState(false);
  const [draftText, setDraftText] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectionFlags, setSelectedRejectionFlags] = useState<FlagType[]>([]);
  const [rejectionNotes, setRejectionNotes] = useState('');

  const isReviewer = user.role === UserRole.REVIEWER;

  // Calculate history from the real database list
  const similarTransactions = useMemo(() => {
    return (purchases || []).filter(p => p.vendor === item.vendor && p.id !== item.id);
  }, [item.vendor, item.id, purchases]);

  // Calculate market deviation percentage if estimate exists
  const marketDiff = item.marketPriceEstimate 
    ? ((item.amount - item.marketPriceEstimate) / item.marketPriceEstimate) * 100 
    : 0;

  const handleAction = async (status: ReviewStatus) => {
    if (!isReviewer) return;
    setIsResolving(true);
    await onUpdate(item.id, { status });
    setIsResolving(false);
    onBack();
  };

  const toggleRejectionFlag = (flagType: FlagType) => {
    setSelectedRejectionFlags(prev =>
      prev.includes(flagType)
        ? prev.filter(f => f !== flagType)
        : [...prev, flagType]
    );
  };

  const handleReject = async () => {
    if (!isReviewer || selectedRejectionFlags.length === 0) return;
    setIsResolving(true);
    await onUpdate(item.id, {
      status: ReviewStatus.REJECTED,
      rejectionFlags: selectedRejectionFlags,
      rejectionNotes: rejectionNotes.trim() || undefined,
      rejectedBy: user.name,
      rejectedAt: new Date().toISOString(),
    });
    setIsResolving(false);
    setShowRejectModal(false);
    onBack();
  };

  const openRejectModal = () => {
    setSelectedRejectionFlags([]);
    setRejectionNotes('');
    setShowRejectModal(true);
  };

  const handleDraftRejection = async () => {
    setIsDrafting(true);
    setShowDraft(true);
    const reason = item.flags.map(f => f.reason).join(', ') || "Non-compliance with policy";
    const draft = await generateRejectionDraft(item.vendor, item.amount, reason, item.submittedBy);
    setDraftText(draft);
    setIsDrafting(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(draftText);
    alert("Draft copied to clipboard");
  };

  const isPdf = item.fileUrl?.startsWith('data:application/pdf');

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in slide-in-from-bottom-2 duration-500 pb-20">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <Button variant="ghost" onClick={onBack} className="-ml-2 text-slate-600 dark:text-slate-400">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return to Queue
        </Button>
        <div className="flex space-x-3">
          {item.status === ReviewStatus.FLAGGED && (
            <Badge color="red" className="px-3 py-1">Action Required</Badge>
          )}
          {item.status === ReviewStatus.VALIDATED && (
            <Badge color="green" className="px-3 py-1">Validated</Badge>
          )}
          {item.status === ReviewStatus.RESOLVED && (
            <Badge color="slate" className="px-3 py-1">Flagged as Waste</Badge>
          )}
          {item.status === ReviewStatus.REJECTED && (
            <Badge color="red" className="px-3 py-1">Rejected</Badge>
          )}
          {item.status === ReviewStatus.PENDING && (
            <Badge color="blue" className="px-3 py-1">Pending Review</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Document Preview (Column 1-5) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">
          <div className={`bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center relative shadow-inner overflow-hidden ${isZoomed ? 'fixed inset-4 z-50 h-auto bg-white/95 backdrop-blur-md' : 'aspect-[3/4]'}`}>
            {item.fileUrl ? (
              <div className="w-full h-full relative group">
                {isPdf ? (
                  <iframe 
                    src={item.fileUrl} 
                    className="w-full h-full" 
                    title="Receipt PDF"
                  />
                ) : (
                  <div className="w-full h-full overflow-auto flex items-start justify-center p-4">
                    <img 
                      src={item.fileUrl} 
                      alt="Receipt Document" 
                      className={`max-w-none transition-all ${isZoomed ? 'w-auto' : 'w-full object-contain h-full'}`}
                    />
                  </div>
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors shadow-lg"
                    title={isZoomed ? "Minimize" : "Full Screen"}
                  >
                    {isZoomed ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 flex flex-col items-center p-8 text-center">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4 text-slate-300">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-sm text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">No Document Attached</h4>
                <p className="text-xs text-slate-400 italic">This record was submitted without a visual copy.</p>
              </div>
            )}
            <div className="absolute bottom-4 left-4 bg-slate-200/80 dark:bg-slate-800/80 backdrop-blur text-[10px] font-bold px-2 py-1 rounded text-slate-500 uppercase">
              AI Confidence: {item.aiConfidence || 'N/A'}%
            </div>
          </div>

          <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
             <h3 className="font-bold text-sm flex items-center gap-2 mb-4 text-slate-800 dark:text-white">
               <History className="w-4 h-4 text-gov-blue" />
               Real-Time Vendor History
             </h3>
             <div className="space-y-3">
                {similarTransactions.length > 0 ? similarTransactions.map(st => (
                  <div key={st.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-100 dark:border-slate-700">
                     <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{st.date}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">${st.amount.toLocaleString()}</p>
                     </div>
                     <Badge color={st.status === ReviewStatus.VALIDATED ? 'green' : st.status === ReviewStatus.FLAGGED ? 'red' : 'slate'}>
                        {st.status.toLowerCase()}
                     </Badge>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 font-medium italic p-2">No other transactions found for this vendor in the database.</p>
                )}
             </div>
          </Card>
        </div>

        {/* Right: Analysis (Column 6-12) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-8 border-t-4 border-t-gov-blue">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge color="blue">{item.category}</Badge>
                {item.suggestedGlCode && (
                   <Badge color="slate" className="bg-slate-100 text-slate-500 border-slate-200">GL: {item.suggestedGlCode}</Badge>
                )}
                {item.isSubscription && (
                   <Badge color="amber" className="flex items-center gap-1"><History className="w-3 h-3" /> Recurring</Badge>
                )}
                <span className="text-slate-300">|</span>
                <span className="text-sm font-bold text-slate-500">{item.department}</span>
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">{item.vendor}</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{item.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center">
                     <Tag className="w-3 h-3 mr-1" /> Total Amount
                   </p>
                   <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">${item.amount.toLocaleString()}</p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center">
                     <Calendar className="w-3 h-3 mr-1" /> Transaction Date
                   </p>
                   <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{item.date}</p>
                </div>
              </div>
            </div>
          </Card>

          {item.marketPriceEstimate > 0 && (
             <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
               <div className="flex items-center gap-2 mb-4">
                  <Scale className="w-5 h-5 text-gov-blue" />
                  <h3 className="font-bold text-slate-900 dark:text-white">Fair Market Value Benchmark</h3>
               </div>
               
               <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Estimated Rate</p>
                    <p className="text-xl font-mono font-bold text-slate-700 dark:text-slate-300">${item.marketPriceEstimate.toLocaleString()}</p>
                  </div>
                  <div className="h-8 w-px bg-slate-300 dark:bg-slate-600" />
                  <div>
                     <p className="text-xs text-slate-500 font-bold uppercase">Deviation</p>
                     <p className={`text-xl font-mono font-bold ${marketDiff > 20 ? 'text-gov-red' : 'text-emerald-600'}`}>
                        {marketDiff > 0 ? '+' : ''}{marketDiff.toFixed(1)}%
                     </p>
                  </div>
                  <div className="flex-1 text-right">
                    {marketDiff > 20 ? (
                      <Badge color="red">Overpaying</Badge>
                    ) : (
                      <Badge color="green">Fair Price</Badge>
                    )}
                  </div>
               </div>
             </div>
          )}

          {item.flags.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center text-sm uppercase tracking-wide border-b border-slate-200 dark:border-slate-800 pb-2">
                <AlertTriangle className="w-4 h-4 mr-2 text-gov-red" />
                Compliance Intelligence Report
              </h3>
              {item.flags.map((flag, idx) => (
                <div key={idx} className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900 p-5 rounded-lg space-y-3">
                  <span className="text-[10px] font-bold text-gov-red dark:text-red-400 uppercase tracking-widest bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900 px-2 py-1 rounded inline-block">
                    {flag.type.replace('_', ' ')}
                  </span>
                  <p className="text-slate-900 dark:text-white font-bold text-lg">{flag.reason}</p>
                  {flag.context && (
                    <div className="flex items-start">
                      <Info className="w-4 h-4 mr-2 text-gov-red mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">"{flag.context}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Rejection Details - shown for rejected items */}
          {item.status === ReviewStatus.REJECTED && item.rejectionFlags && item.rejectionFlags.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-red-800 dark:text-red-400 flex items-center text-sm uppercase tracking-wide">
                  <XCircle className="w-4 h-4 mr-2" />
                  Payment Rejected
                </h3>
                {item.rejectedAt && (
                  <span className="text-xs text-red-600 dark:text-red-400">
                    {new Date(item.rejectedAt).toLocaleDateString()} by {item.rejectedBy}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {item.rejectionFlags.map((flag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold"
                  >
                    {flag.replace('_', ' ')}
                  </span>
                ))}
              </div>
              {item.rejectionNotes && (
                <div className="mt-3 p-3 bg-white dark:bg-slate-900 rounded border border-red-100 dark:border-red-800">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Rejection Notes</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{item.rejectionNotes}</p>
                </div>
              )}
            </div>
          )}

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
            {isReviewer ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-slate-900 dark:text-white text-lg">Administrative Determination</h3>
                  <div className="flex gap-2 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-1.5 rounded border border-emerald-100 dark:border-emerald-800">
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Potential Avoidance: ${item.amount.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleAction(ReviewStatus.VALIDATED)}
                    disabled={isResolving}
                    className="h-14 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm flex items-center justify-center gap-2 rounded-lg"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Approve Payment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openRejectModal}
                    disabled={isResolving}
                    className="h-14 border-red-300 text-gov-red bg-red-50 hover:bg-red-100 hover:border-red-400 flex items-center justify-center gap-2 rounded-lg"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject Payment
                  </Button>
                </div>

                <div className="mt-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                       <MessageSquare className="w-4 h-4 text-gov-blue" />
                       AI Communication Assistant
                    </h4>
                    {!showDraft && (
                      <Button variant="ghost" size="sm" onClick={handleDraftRejection} className="text-xs text-gov-blue">
                         Draft Rejection Email
                      </Button>
                    )}
                  </div>
                  {showDraft && (
                    <div className="animate-in fade-in duration-300">
                       {isDrafting ? (
                          <div className="py-8 flex justify-center text-slate-400">
                             <Loader2 className="w-6 h-6 animate-spin" />
                          </div>
                       ) : (
                          <div className="space-y-3">
                             <textarea 
                                className="w-full h-32 p-3 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-1 focus:ring-gov-blue outline-none resize-none"
                                value={draftText}
                                onChange={(e) => setDraftText(e.target.value)}
                             />
                             <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setShowDraft(false)}>Cancel</Button>
                                <Button size="sm" variant="outline" onClick={copyToClipboard}>
                                   <Copy className="w-3 h-3 mr-2" /> Copy Text
                                </Button>
                                <Button size="sm" onClick={() => { alert("Draft copied to clipboard for your email client."); setShowDraft(false); }}>
                                   <Send className="w-3 h-3 mr-2" /> Send via Client
                                </Button>
                             </div>
                          </div>
                       )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                {/* Show reviewer decision for non-reviewers */}
                {item.status === ReviewStatus.VALIDATED && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 p-6 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-emerald-900 dark:text-emerald-400 text-lg mb-2">Payment Approved</h3>
                        <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                          This payment has been reviewed and approved by a fiscal officer. Processing will proceed as scheduled.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {item.status === ReviewStatus.REJECTED && (
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900 p-6 rounded-lg space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <XCircle className="w-6 h-6 text-gov-red" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-red-900 dark:text-red-400 text-lg mb-2">Payment Rejected</h3>
                        <p className="text-red-700 dark:text-red-300 text-sm mb-3">
                          This payment has been rejected by a fiscal officer. Please review the details below.
                        </p>

                        {item.rejectionFlags && item.rejectionFlags.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wide">Rejection Reasons:</p>
                            <div className="flex flex-wrap gap-2">
                              {item.rejectionFlags.map((flag, idx) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-semibold border border-red-200 dark:border-red-800"
                                >
                                  {flag.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {item.rejectionNotes && (
                          <div className="mt-4 p-3 bg-white dark:bg-slate-900 rounded border border-red-100 dark:border-red-800">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Reviewer Notes:</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{item.rejectionNotes}</p>
                          </div>
                        )}

                        {item.rejectedBy && item.rejectedAt && (
                          <div className="mt-4 pt-3 border-t border-red-100 dark:border-red-800">
                            <p className="text-xs text-red-600 dark:text-red-400">
                              Rejected on {new Date(item.rejectedAt).toLocaleDateString()} at {new Date(item.rejectedAt).toLocaleTimeString()} by {item.rejectedBy}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {item.status === ReviewStatus.RESOLVED && (
                  <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-lg">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <XCircle className="w-6 h-6 text-slate-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-slate-200 text-lg mb-2">Flagged as Waste</h3>
                        <p className="text-slate-700 dark:text-slate-400 text-sm">
                          This payment has been flagged as wasteful spending and will not be processed.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {(item.status === ReviewStatus.PENDING || item.status === ReviewStatus.FLAGGED) && (
                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-800">
                    <ShieldAlert className="w-5 h-5 mr-3 text-slate-400" />
                    <div className="text-center md:text-left">
                      <p className="text-slate-900 dark:text-white font-bold text-sm">Awaiting Review</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs">A fiscal officer will make a final determination shortly.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="mt-6 text-center">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                 Database Record ID: {item.id}
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <XCircle className="w-5 h-5 text-gov-red" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Reject Payment</h2>
                    <p className="text-sm text-slate-500">{item.vendor} - ${item.amount.toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <XCircle className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-gov-red" />
                    Select Rejection Reason(s) <span className="text-gov-red">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {REJECTION_FLAGS.map((flag) => (
                      <label
                        key={flag.type}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedRejectionFlags.includes(flag.type)
                            ? 'border-gov-red bg-red-50 dark:bg-red-900/20'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedRejectionFlags.includes(flag.type)}
                          onChange={() => toggleRejectionFlag(flag.type)}
                          className="mt-0.5 w-4 h-4 text-gov-red border-slate-300 rounded focus:ring-gov-red"
                        />
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${
                            selectedRejectionFlags.includes(flag.type)
                              ? 'text-gov-red'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}>
                            {flag.label}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{flag.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    placeholder="Provide additional context for this rejection..."
                    className="w-full h-24 p-3 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-gov-red focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 h-12"
                  disabled={isResolving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isResolving || selectedRejectionFlags.length === 0}
                  className={`flex-1 h-12 flex items-center justify-center gap-2 ${
                    selectedRejectionFlags.length === 0
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-gov-red hover:bg-red-700 text-white'
                  }`}
                >
                  {isResolving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      Confirm Rejection
                    </>
                  )}
                </Button>
              </div>
              {selectedRejectionFlags.length === 0 && (
                <p className="text-xs text-center text-slate-500 mt-2">
                  Please select at least one rejection reason
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};