import React, { useState, useRef, useMemo } from 'react';
import { Button, Card, Badge } from './Common';
import {
  Upload as UploadIcon,
  X,
  Loader2,
  FileText,
  FileSearch,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertOctagon,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Clock,
  Info
} from 'lucide-react';
import { analyzeReceipt, ExtractionResult, normalizeItemForPricing, extractCommitments } from '../services/geminiService';
import { PurchaseDocument } from '../types';

interface UploadProps {
  onComplete: (data: ExtractionResult, imageData: string) => void;
  existingPurchases: PurchaseDocument[];
}

export const Upload: React.FC<UploadProps> = ({ onComplete, existingPurchases }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Contract Constellation state
  const [priceIntelligence, setPriceIntelligence] = useState<{
    normalizedId: string;
    itemName: string;
    confidence: number;
    stateAverage?: number;
    savingsOpportunity?: number;
  } | null>(null);

  // Budget Guardian state
  const [commitmentData, setCommitmentData] = useState<{
    isRecurring: boolean;
    renewalDate?: string;
    cancellationDeadline?: string;
    escalationClause?: string;
  } | null>(null);

  // Duplicate detection
  const duplicateMatches = useMemo(() => {
    if (!result) return [];

    const matches: Array<{ purchase: PurchaseDocument; score: number; reasons: string[] }> = [];
    const DUPLICATE_WINDOW_DAYS = 60;

    existingPurchases.forEach(purchase => {
      const reasons: string[] = [];
      let score = 0;

      // Check vendor match
      if (purchase.vendor.toLowerCase() === result.vendor.toLowerCase()) {
        reasons.push('Same vendor');
        score += 30;
      }

      // Check amount match (within 1%)
      const amountDiff = Math.abs(purchase.amount - result.amount);
      const amountThreshold = result.amount * 0.01;
      if (amountDiff <= amountThreshold) {
        reasons.push('Same amount');
        score += 40;
      }

      // Check date proximity (within duplicate window)
      const purchaseDate = new Date(purchase.date);
      const resultDate = new Date(result.date);
      const daysDiff = Math.abs((purchaseDate.getTime() - resultDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= DUPLICATE_WINDOW_DAYS) {
        reasons.push(`Within ${Math.round(daysDiff)} days`);
        score += 30;
      }

      // If score is high enough, it's a potential duplicate
      if (score >= 60 && reasons.length >= 2) {
        matches.push({ purchase, score, reasons });
      }
    });

    // Sort by score (highest first)
    return matches.sort((a, b) => b.score - a.score);
  }, [result, existingPurchases]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selectedFile);
      setResult(null); // Reset result on new file
    }
  };

  const handleProcess = async () => {
    if (!preview) return;
    setIsProcessing(true);
    setShowDuplicateWarning(false);
    setPriceIntelligence(null);
    setCommitmentData(null);

    const base64 = preview.split(',')[1];
    const extractedData = await analyzeReceipt(base64);

    if (extractedData) {
      setResult(extractedData);

      // Contract Constellation: Normalize item for price comparison
      try {
        const normalized = await normalizeItemForPricing(
          extractedData.vendor,
          extractedData.description,
          extractedData.amount
        );

        if (normalized) {
          // Simulate state average (in real app, this would come from Firestore)
          // For demo: create realistic price comparison
          const mockStateAverage = extractedData.amount * (0.7 + Math.random() * 0.4);
          const savingsOpportunity = extractedData.amount - mockStateAverage;

          setPriceIntelligence({
            ...normalized,
            stateAverage: mockStateAverage,
            savingsOpportunity: savingsOpportunity > 0 ? savingsOpportunity : undefined
          });
        }
      } catch (error) {
        console.error('Price normalization failed:', error);
      }

      // Budget Guardian: Extract commitment data
      try {
        const commitments = await extractCommitments(
          extractedData.vendor,
          extractedData.description,
          extractedData.amount
        );

        if (commitments) {
          setCommitmentData(commitments);
        }
      } catch (error) {
        console.error('Commitment extraction failed:', error);
      }
    } else {
      alert("AI Analysis failed. Please try again.");
    }
    setIsProcessing(false);
  };

  const handleConfirm = () => {
    if (!result || !preview) return;

    // Check for duplicates before submission
    if (duplicateMatches.length > 0 && !showDuplicateWarning) {
      setShowDuplicateWarning(true);
      return;
    }

    // Proceed with submission
    onComplete(result, preview);
  };

  const handleCancelSubmission = () => {
    setShowDuplicateWarning(false);
  };

  const handleForceSubmit = () => {
    if (result && preview) {
      onComplete(result, preview);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setShowDuplicateWarning(false);
    setPriceIntelligence(null);
    setCommitmentData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Upload Purchase</h1>
        <p className="text-slate-600 dark:text-slate-400">Submit a receipt or invoice. The AI Coach will review quality before submission.</p>
      </div>

      <Card className="p-1">
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 p-8 min-h-[320px] flex flex-col items-center justify-center text-center relative">
          {!preview ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer flex flex-col items-center w-full h-full py-12"
            >
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-sm flex items-center justify-center mb-6 text-gov-blue dark:text-blue-400">
                <UploadIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Drag and drop or browse</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                Supports PDF, JPG, or PNG. Max file size 10MB.
              </p>
              <Button variant="outline" className="mt-8 bg-white dark:bg-slate-800" size="sm">
                Select File
              </Button>
            </div>
          ) : (
            <div className="w-full space-y-6">
              <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900 max-h-[400px]">
                <img src={preview} alt="Preview" className="w-full h-full object-contain p-4" />
                <button 
                  onClick={reset}
                  className="absolute top-2 right-2 p-1 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {!result && (
                <div className="flex items-center space-x-3 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <FileText className="w-8 h-8 text-slate-400" />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{file?.name}</p>
                    <p className="text-xs text-slate-500">{(file?.size || 0 / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Badge color="blue">Ready to Analyze</Badge>
                </div>
              )}
            </div>
          )}
          <input 
            ref={fileInputRef} 
            type="file" 
            className="hidden" 
            accept="image/*,application/pdf"
            onChange={handleFileChange} 
          />
        </div>
      </Card>

      {/* Result Card: The AI Coach Section */}
      {result && (
        <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-gov-blue p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-yellow-400" />
                 <span className="font-bold">AI Coach Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold bg-white/10 px-3 py-1 rounded-full">
                <span>Confidence: {result.confidence}%</span>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
               {/* Quick Validation Stats */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                     <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Detected Amount</p>
                     <p className="text-xl font-mono font-bold text-slate-900 dark:text-white">${result.amount.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                     <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Detected Vendor</p>
                     <p className="text-lg font-bold text-slate-900 dark:text-white truncate">{result.vendor}</p>
                  </div>
               </div>

               {/* AI Suggestion */}
               <div className="flex items-start gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Suggested GL Code</h4>
                    <p className="text-sm text-emerald-700 dark:text-emerald-500 mt-1">
                       Based on the items, we recommend filing under <strong>{result.suggestedGlCode}</strong>.
                    </p>
                  </div>
               </div>

               {/* Contract Constellation: Price Intelligence */}
               {priceIntelligence && priceIntelligence.stateAverage && (
                 <div className={`flex items-start gap-4 p-4 border rounded-lg ${
                   priceIntelligence.savingsOpportunity && priceIntelligence.savingsOpportunity > result.amount * 0.15
                     ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900'
                     : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900'
                 }`}>
                   {priceIntelligence.savingsOpportunity && priceIntelligence.savingsOpportunity > result.amount * 0.15 ? (
                     <>
                       <TrendingUp className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                       <div className="flex-1">
                         <h4 className="font-bold text-red-800 dark:text-red-400 text-sm">Better Deal Alert</h4>
                         <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                           You're paying <strong className="font-mono">${result.amount.toFixed(2)}</strong>, but the state average for <strong>{priceIntelligence.itemName}</strong> is <strong className="font-mono">${priceIntelligence.stateAverage.toFixed(2)}</strong>.
                         </p>
                         <div className="mt-2 p-3 bg-white dark:bg-slate-900 rounded-md border border-red-200 dark:border-red-800">
                           <p className="text-xs font-bold text-red-900 dark:text-red-300">
                             💡 Potential savings: ${priceIntelligence.savingsOpportunity.toFixed(2)} ({((priceIntelligence.savingsOpportunity / result.amount) * 100).toFixed(0)}% higher than average)
                           </p>
                         </div>
                       </div>
                     </>
                   ) : (
                     <>
                       <TrendingDown className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                       <div className="flex-1">
                         <h4 className="font-bold text-blue-800 dark:text-blue-400 text-sm">Price Check: Competitive</h4>
                         <p className="text-sm text-blue-700 dark:text-blue-500 mt-1">
                           Your price of <strong className="font-mono">${result.amount.toFixed(2)}</strong> for <strong>{priceIntelligence.itemName}</strong> is competitive with the state average of <strong className="font-mono">${priceIntelligence.stateAverage.toFixed(2)}</strong>.
                         </p>
                       </div>
                     </>
                   )}
                 </div>
               )}

               {/* Budget Guardian: Commitment Alert */}
               {commitmentData && commitmentData.isRecurring && (
                 <div className="flex items-start gap-4 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900 rounded-lg">
                   <Clock className="w-6 h-6 text-purple-600 flex-shrink-0 mt-0.5" />
                   <div className="flex-1">
                     <h4 className="font-bold text-purple-800 dark:text-purple-400 text-sm">Recurring Commitment Detected</h4>
                     <p className="text-sm text-purple-700 dark:text-purple-500 mt-1">
                       This appears to be a <strong>recurring subscription or service</strong>.
                     </p>
                     <div className="mt-2 space-y-1">
                       {commitmentData.renewalDate && (
                         <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-400">
                           <Info className="w-3 h-3" />
                           <span>Renewal: {new Date(commitmentData.renewalDate).toLocaleDateString()}</span>
                         </div>
                       )}
                       {commitmentData.cancellationDeadline && (
                         <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-400">
                           <Info className="w-3 h-3" />
                           <span>Cancel by: {new Date(commitmentData.cancellationDeadline).toLocaleDateString()}</span>
                         </div>
                       )}
                       {commitmentData.escalationClause && (
                         <div className="flex items-center gap-2 text-xs text-purple-700 dark:text-purple-400">
                           <Info className="w-3 h-3" />
                           <span>Price escalation: {commitmentData.escalationClause}</span>
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               )}

               {/* Warnings */}
               {result.confidence < 80 && (
                 <div className="flex items-start gap-4 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900 rounded-lg">
                    <AlertOctagon className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">Low Confidence Warning</h4>
                      <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                         The image is slightly blurry or incomplete. This might cause rejection. Consider retaking for faster approval.
                      </p>
                    </div>
                 </div>
               )}

               {/* Duplicate Warning */}
               {showDuplicateWarning && duplicateMatches.length > 0 && (
                 <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-900 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-bold text-red-800 dark:text-red-400 text-sm mb-2">Possible Duplicate Detected</h4>
                      <p className="text-sm text-red-700 dark:text-red-500 mb-3">
                         This purchase appears similar to {duplicateMatches.length} existing {duplicateMatches.length === 1 ? 'submission' : 'submissions'}:
                      </p>
                      <div className="space-y-2 mb-4">
                        {duplicateMatches.slice(0, 3).map((match, idx) => (
                          <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-md">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">{match.purchase.vendor}</span>
                              <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">${match.purchase.amount.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                              <span>{match.purchase.date}</span>
                              <span>•</span>
                              <span className="text-red-600 dark:text-red-400">{match.reasons.join(', ')}</span>
                            </div>
                          </div>
                        ))}
                        {duplicateMatches.length > 3 && (
                          <p className="text-xs text-slate-500 italic">+{duplicateMatches.length - 3} more potential matches</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={handleCancelSubmission}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={reset}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Retake Photo
                        </Button>
                        <Button
                          onClick={handleForceSubmit}
                          size="sm"
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          Submit Anyway
                        </Button>
                      </div>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center space-y-4">
        {!result ? (
          <Button 
            size="lg" 
            className="w-full max-w-sm h-12 shadow-md bg-gov-blue hover:bg-blue-900" 
            disabled={!preview || isProcessing}
            onClick={handleProcess}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5 mr-2" />
                Scan & Verify
              </>
            )}
          </Button>
        ) : (
           <div className="flex gap-4 w-full max-w-md">
             <Button variant="outline" onClick={reset} className="flex-1 h-12">Retake</Button>
             <Button onClick={handleConfirm} className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white">
               Confirm Submission
             </Button>
           </div>
        )}
      </div>
    </div>
  );
};