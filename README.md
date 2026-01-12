# NH Receipt Guard

**AI-Powered Fiscal Transparency for K-12 Education**

[![Security](https://img.shields.io/badge/security-secrets%20protected-green)](SETUP.md)
[![License](https://img.shields.io/badge/license-Educational-blue)]()
[![Presidential AI Challenge 2026](https://img.shields.io/badge/Presidential%20AI%20Challenge-2026-gold)]()

---

## 🏆 Presidential AI Challenge 2026 Submission

**Track:** II - Technical/Implementation
**Category:** High School
**Live Demo:** [https://prime-5a75a.web.app](https://prime-5a75a.web.app)

This project addresses **all four major DOGE (Department of Government Efficiency) priorities**:
1. ✅ Government overspending detection
2. ✅ Zombie spend elimination (unused subscriptions)
3. ✅ Procurement transparency
4. ✅ Budget waste prevention

---

## 🔒 Security & Setup

**IMPORTANT**: This repository does NOT contain API keys or secrets.

To run this project locally:
1. Follow the **[SETUP.md](SETUP.md)** instructions
2. Create your own `.env.local` file with your API keys
3. **Never commit `.env.local` to git**

> All secrets are protected using environment variables. See [SETUP.md](SETUP.md) for detailed setup instructions.

---

## 🚀 Features

### AI-Powered Waste Detection
- **8 Custom Gemini AI Functions** for receipt analysis
- Real-time market deviation detection ("The $500 Hammer" problem)
- Zombie spend identification (unused subscriptions)
- Automatic price benchmarking across districts

### Complete Fiscal Transparency
- 100% auditable transaction history
- Role-based access control (Submitter, Reviewer, Viewer)
- Public accountability portal
- Exportable CSV reports for citizen oversight

### Proactive Budget Management
- 12-month budget forecasting
- Velocity predictions ("Budget exhausted by March 15")
- AI-powered fix suggestions for rejected purchases
- Personal efficiency dashboard with gamification

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript 5.8, Tailwind CSS
- **Build System:** Vite 6.2 with HMR
- **AI Engine:** Google Gemini (`gemini-3-flash-preview`)
- **Backend:** Firebase (Authentication + Firestore)
- **Hosting:** Firebase Hosting with CDN

---

## 📦 Quick Start

### Prerequisites
- Node.js 18+
- Firebase account
- Google AI Studio account (Gemini API)

### Installation

```bash
# Clone the repository
git clone [your-github-url]
cd nh-receipt-guard2

# Install dependencies
npm install

# Configure environment variables (see SETUP.md)
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Visit `http://localhost:5173` to see the app.

**For detailed setup instructions, see [SETUP.md](SETUP.md)**

---

## 🎭 Demo Accounts

After setting up Firebase Authentication:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Submitter** | `submitter@nhguard.gov` | `123456` | Upload receipts, personal dashboard |
| **Reviewer** | `reviewer@nhguard.gov` | `123456` | Approve/reject purchases, full audit |
| **Viewer** | `viewer@nhguard.gov` | `123456` | Executive reports, analytics |

---

## 📊 Impact Metrics

**Target Savings per District:**
- 15-30% average savings on flagged purchases
- $10K-$50K/year from cancelled zombie subscriptions
- 95% reduction in fiscal report preparation time
- 100% auditable transaction history

**Educational Impact:**
- Every $127,000 saved = 2.5 teacher salaries
- Savings redirected to students, not waste

---

## 🏗️ Project Structure

```
nh-receipt-guard2/
├── components/          # React components
│   ├── Dashboard.tsx    # Role-based dashboards
│   ├── Upload.tsx       # AI-powered receipt upload
│   ├── Review.tsx       # Purchase review workflow
│   ├── Reports.tsx      # Fiscal transparency reports
│   └── AuditLog.tsx     # Complete audit trail
├── services/
│   ├── firebase.ts      # Firebase configuration
│   └── geminiService.ts # 8 custom AI functions
├── types.ts             # TypeScript interfaces
├── constants.ts         # Demo accounts & mock data
├── .env.example         # Environment variable template
├── SETUP.md            # Detailed setup instructions
└── PRESIDENTIAL_AI_CHALLENGE_SUBMISSION.md
```

---

## 🔐 Security

- All API keys protected via environment variables
- Firebase Security Rules enforce access control
- Complete audit trail for accountability
- No secrets committed to version control
- `.gitignore` configured to exclude `.env*` files

---

## 🎯 DOGE Alignment

NH Receipt Guard directly addresses the four major government efficiency issues identified by DOGE:

### 1. Government Overspending
**Solution:** Contract Constellation + Market Deviation Detection
Real-time AI compares every purchase against fair market value and state contracts.

### 2. Zombie Spend
**Solution:** Budget Guardian + Subscription Tracking
AI identifies recurring charges and flags unused subscriptions for cancellation.

### 3. Procurement Transparency
**Solution:** Public Portal + Audit Logging
100% auditable transaction history with exportable reports for citizen oversight.

### 4. Budget Waste Prevention
**Solution:** AI-Powered Prevention + Predictive Analytics
Proactive alerts catch waste BEFORE spending, not after.

---

## 📄 Documentation

- **[SETUP.md](SETUP.md)** - Complete setup instructions
- **[PRESIDENTIAL_AI_CHALLENGE_SUBMISSION.md](PRESIDENTIAL_AI_CHALLENGE_SUBMISSION.md)** - Full competition submission

---

## 🤝 Competition Submission

**Competition:** Presidential AI Challenge 2026
**Track:** II - Technical/Implementation
**Category:** High School
**Repository:** [Insert GitHub URL]
**Live Demo:** https://prime-5a75a.web.app

---

## 📝 License

This project is submitted for the Presidential AI Challenge 2026 educational competition.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - AI-powered receipt analysis
- **Firebase** - Real-time backend infrastructure
- **React Team** - Modern UI framework
- **DOGE Initiative** - Government efficiency inspiration

---

*Rebuilding confidence through auditable financial transparency.*

*This isn't just receipt scanning. It's a movement toward fiscal transparency in education.*
