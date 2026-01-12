
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export interface ExtractionResult {
  vendor: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  confidence: number;
  suggestedGlCode: string;
  marketPriceEstimate?: number;
  isSubscription?: boolean;
  flags: Array<{
    type: string;
    reason: string;
    context: string;
  }>;
}

// 1. For Submitters: Enhanced Analysis with Coaching & Market Benchmarking
export const analyzeReceipt = async (base64Image: string): Promise<ExtractionResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: `Analyze this government purchase receipt. 
            
            1. Extract basic data: vendor, amount, date, description.
            2. Classify: Suggest a GL Code.
            
            3. "DOGE" Efficiency Audit (Critical):
               - MARKET CHECK: Estimate the fair commercial market price for the item/service described. If the receipt amount is >20% higher than market, flag as MARKET_DEVIATION.
               - ZOMBIE CHECK: Is this a recurring subscription (SaaS, Gym, News)? If yes, mark isSubscription=true. If it looks like a legacy auto-renewal (e.g. "Annual Renewal", "V3.0"), flag as ZOMBIE_SPEND.
            
            4. Calculate Confidence (0-100).
            
            Return JSON.`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vendor: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            date: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            suggestedGlCode: { type: Type.STRING },
            marketPriceEstimate: { type: Type.NUMBER, description: "Estimated fair market value of the item in USD" },
            isSubscription: { type: Type.BOOLEAN },
            flags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "DUPLICATE, PRICE_ANOMALY, RENEWAL, UNUSUAL_ITEM, MARKET_DEVIATION, ZOMBIE_SPEND" },
                  reason: { type: Type.STRING },
                  context: { type: Type.STRING },
                }
              }
            }
          },
          required: ["vendor", "amount", "date", "description", "category", "flags", "confidence", "suggestedGlCode"]
        },
      },
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as ExtractionResult;
    }
    return null;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};

// 2. For Reviewers: Rejection Email Drafter
export const generateRejectionDraft = async (
  vendor: string, 
  amount: number, 
  reason: string, 
  submitterName: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a professional, polite, but firm rejection email for a purchase request.
      
      Context:
      - Organization: NH Receipt Guard (Municipal Finance Dept)
      - Recipient: ${submitterName}
      - Vendor: ${vendor}
      - Amount: $${amount}
      - Rejection Reason: ${reason}
      
      Tone: Bureaucratic but helpful. Cite 'State Fiscal Statutes RSA 32' vaguely as the policy reason.
      Format: Plain text, ready to copy-paste. Keep it under 100 words.`
    });
    return response.text || "Could not generate draft.";
  } catch (error) {
    console.error("Draft Error:", error);
    return "Error generating draft.";
  }
};

// 3. For Viewers: Fiscal Oracle (Data Insights)
export const generateExecutiveInsight = async (query: string, dataSummary: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are the 'Fiscal Oracle', an AI analyst for New Hampshire municipal finance.

      User Query: "${query}"

      Current Data Context (JSON Summary):
      ${dataSummary}

      Instructions:
      1. Answer the user's question using the data provided.
      2. Be concise, executive-level, and actionable.
      3. If the data suggests waste, highlight it boldly.
      4. Do not use Markdown formatting (like ** or #), just plain text.`
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Insight Error:", error);
    return "Unable to analyze data at this time.";
  }
};

// 4. Impact Storyteller: Generate compelling savings narratives
export const generateImpactNarrative = async (
  savingsAmount: number,
  periodStart: string,
  periodEnd: string,
  audienceType: 'board' | 'parent' | 'state'
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a professional communications specialist for school district finance.

      Task: Generate a compelling narrative about fiscal savings for ${audienceType === 'board' ? 'school board members' : audienceType === 'parent' ? 'parents and community' : 'state education officials'}.

      Data:
      - Total Savings: $${savingsAmount.toLocaleString()}
      - Time Period: ${periodStart} to ${periodEnd}
      - Organization: NH School District

      ${audienceType === 'board' ?
        'For School Board: Focus on fiduciary responsibility, ROI, and strategic resource allocation. Be professional and data-driven. Emphasize how these savings can be redirected to educational priorities.' :
        audienceType === 'parent' ?
        'For Parents: Focus on how savings benefit students directly. Use accessible language and concrete examples of what the money can fund (teachers, technology, programs). Build trust through transparency.' :
        'For State Officials: Focus on compliance, best practices, and statewide impact potential. Emphasize process improvements and scalability. Include policy implications.'}

      Instructions:
      1. Write 2-3 paragraphs (150-200 words total)
      2. Include specific dollar amounts and tangible educational equivalents
      3. Use active voice and clear, confident language
      4. End with a forward-looking statement
      5. Do not use markdown formatting - plain text only
      6. Make it inspiring but grounded in facts`
    });
    return response.text || "Unable to generate narrative at this time.";
  } catch (error) {
    console.error("Narrative Generation Error:", error);
    return "Unable to generate narrative at this time.";
  }
};

// 5. Contract Constellation: Normalize item for price comparison
export const normalizeItemForPricing = async (
  vendor: string,
  description: string,
  amount: number
): Promise<{ normalizedId: string; itemName: string; confidence: number } | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            text: `Normalize this purchase into a standard product category for price comparison across school districts.

            Purchase Details:
            - Vendor: ${vendor}
            - Description: ${description}
            - Amount: $${amount}

            Task: Extract the core product/service being purchased and create:
            1. A normalized ID (lowercase, underscores, no special chars) - e.g., "TONER_HP_304A_BLACK", "CHROMEBOOK_HP_11_G9"
            2. A human-readable item name - e.g., "HP 304A Black Toner Cartridge", "HP Chromebook 11 G9"
            3. Confidence score (0-100) - how confident are you this can be price-compared across districts?

            Return JSON only.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            normalizedId: { type: Type.STRING },
            itemName: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          },
          required: ["normalizedId", "itemName", "confidence"]
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error("Item Normalization Error:", error);
    return null;
  }
};

// 6. Budget Guardian: Extract commitments from receipt
export const extractCommitments = async (
  vendor: string,
  description: string,
  amount: number
): Promise<{
  isRecurring: boolean;
  renewalDate?: string;
  cancellationDeadline?: string;
  escalationClause?: string;
} | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this purchase for future financial commitments.

      Purchase Details:
      - Vendor: ${vendor}
      - Description: ${description}
      - Amount: $${amount}

      Task: Identify if this creates any future financial obligations:
      1. Is this a recurring subscription/service? (true/false)
      2. When does it renew? (ISO date format YYYY-MM-DD, if applicable)
      3. When is the cancellation deadline? (ISO date format, if mentioned)
      4. Are there any price escalation clauses? (text description, if mentioned)

      Examples:
      - "Annual Zoom Pro License" → recurring: true, renewalDate: one year from purchase
      - "One-time floor cleaning" → recurring: false
      - "3-year copier lease with 5% annual increase" → recurring: true, escalationClause: "5% annual increase"

      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isRecurring: { type: Type.BOOLEAN },
            renewalDate: { type: Type.STRING },
            cancellationDeadline: { type: Type.STRING },
            escalationClause: { type: Type.STRING }
          },
          required: ["isRecurring"]
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error("Commitment Extraction Error:", error);
    return null;
  }
};

// 7. Rejection Fix-It: Suggest how to fix a rejected submission
export const suggestRejectionFix = async (
  vendor: string,
  amount: number,
  description: string,
  rejectionReason: string,
  rejectionFlags: string[]
): Promise<{
  suggestion: string;
  alternativeVendors: string[];
  estimatedSavings: number;
  learningTip: string;
} | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a helpful procurement advisor for a school district.

      A purchase request was REJECTED and the submitter needs help fixing it.

      Rejected Purchase:
      - Vendor: ${vendor}
      - Amount: $${amount}
      - Description: ${description}
      - Rejection Reason: ${rejectionReason}
      - Flags Applied: ${rejectionFlags.join(', ')}

      Task: Provide helpful guidance to get this purchase approved:
      1. A clear, actionable suggestion on how to fix the issue (2-3 sentences)
      2. Alternative vendors they could try (list 2-3 vendors if price is the issue)
      3. Estimated savings if they follow your advice (in dollars)
      4. A brief learning tip to prevent future rejections (1 sentence)

      Be specific and helpful. The submitter wants to get their work done.
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestion: { type: Type.STRING },
            alternativeVendors: { type: Type.ARRAY, items: { type: Type.STRING } },
            estimatedSavings: { type: Type.NUMBER },
            learningTip: { type: Type.STRING }
          },
          required: ["suggestion", "alternativeVendors", "estimatedSavings", "learningTip"]
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error("Rejection Fix Suggestion Error:", error);
    return null;
  }
};

// 8. Price Memory: Analyze vendor history for price intelligence
export const analyzeVendorHistory = async (
  vendor: string,
  itemDescription: string,
  currentPrice: number,
  historicalPurchases: Array<{ vendor: string; amount: number; date: string; description: string }>
): Promise<{
  priceAnalysis: string;
  recommendation: string;
  priceChangePercent: number;
  bestHistoricalPrice: { vendor: string; amount: number; date: string };
  averagePrice: number;
} | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a procurement intelligence analyst for a school district.

      Current Purchase Under Review:
      - Vendor: ${vendor}
      - Item: ${itemDescription}
      - Current Price: $${currentPrice}

      Historical Purchase Data (similar items):
      ${historicalPurchases.map(p => `- ${p.date}: $${p.amount} from ${p.vendor} (${p.description})`).join('\n')}

      Task: Analyze the pricing history and provide intelligence:
      1. A brief price analysis (is this a good deal, bad deal, or about average?)
      2. A specific recommendation (proceed, negotiate, or find alternative)
      3. The percentage change from average historical price (negative = savings, positive = overpaying)
      4. The best historical price found (vendor, amount, date)
      5. The average price from history

      Be direct and helpful. Focus on saving money.
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priceAnalysis: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            priceChangePercent: { type: Type.NUMBER },
            bestHistoricalPrice: {
              type: Type.OBJECT,
              properties: {
                vendor: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                date: { type: Type.STRING }
              }
            },
            averagePrice: { type: Type.NUMBER }
          },
          required: ["priceAnalysis", "recommendation", "priceChangePercent", "bestHistoricalPrice", "averagePrice"]
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text);
    }
    return null;
  } catch (error) {
    console.error("Vendor History Analysis Error:", error);
    return null;
  }
};
