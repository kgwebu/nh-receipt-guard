# NH Receipt Guard - Setup Instructions

## Prerequisites
- Node.js 18+ installed
- Firebase account (free tier works)
- Google AI Studio account (for Gemini API)

## Environment Setup

### 1. Clone the Repository
```bash
git clone [your-github-url]
cd nh-receipt-guard2
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:
```bash
cp .env.example .env.local
```

### 4. Get Your API Keys

#### Google Gemini AI API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste into `.env.local` as `VITE_GEMINI_API_KEY`

#### Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Navigate to **Project Settings** > **General**
4. Scroll to **Your apps** section
5. Click the **Web app** (`</>`) icon
6. Register your app with a nickname (e.g., "NH Receipt Guard")
7. Copy all configuration values to `.env.local`:
   - `apiKey` → `VITE_FIREBASE_API_KEY`
   - `authDomain` → `VITE_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `VITE_FIREBASE_PROJECT_ID`
   - `storageBucket` → `VITE_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `VITE_FIREBASE_APP_ID`

### 5. Firebase Setup

#### Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** sign-in method
4. Go to the **Users** tab
5. Click **Add User** and create these demo accounts:
   - Email: `submitter@nhguard.gov` | Password: `123456`
   - Email: `reviewer@nhguard.gov` | Password: `123456`
   - Email: `viewer@nhguard.gov` | Password: `123456`

#### Enable Firestore Database
1. In Firebase Console, go to **Firestore Database**
2. Click **Create Database**
3. Choose **Start in test mode** (for development)
   - **Note**: For production, configure proper security rules
4. Select your preferred region
5. Click **Enable**

### 6. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see the app running locally.

### 7. Build for Production
```bash
npm run build
```

The production build will be created in the `dist/` directory.

## Demo Accounts

After setting up Firebase Authentication, you can log in with these accounts:

| Role | Email | Password | Capabilities |
|------|-------|----------|--------------|
| **Submitter** | submitter@nhguard.gov | 123456 | Upload receipts, view personal submissions |
| **Reviewer** | reviewer@nhguard.gov | 123456 | Review and approve/reject purchases |
| **Viewer** | viewer@nhguard.gov | 123456 | Executive dashboard, reports, analytics |

## Security Notes

- **Never commit `.env.local` to git** - it contains your API keys
- All environment variables are prefixed with `VITE_` to be accessible in the browser
- Firebase client-side API keys are safe to use in browser apps when properly secured with Firebase Security Rules
- The `.gitignore` file is configured to exclude all `.env*` files

## Troubleshooting

### "Missing Firebase configuration" Error
- Verify all `VITE_FIREBASE_*` variables are set in `.env.local`
- Check for typos in environment variable names
- Restart the development server after changing `.env.local`

### "Gemini API Error"
- Verify `VITE_GEMINI_API_KEY` is correctly set in `.env.local`
- Check your Gemini AI quota at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Ensure you've enabled the Gemini API in your Google Cloud project

### Firebase Connection Issues
- Verify your Firebase project is active
- Check that Authentication and Firestore are enabled
- Ensure your API key is correct

### Build Errors
- Delete `node_modules/` and run `npm install` again
- Clear Vite cache: `rm -rf node_modules/.vite`
- Ensure Node.js version is 18 or higher: `node --version`

## Deployment

### Firebase Hosting (Recommended)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Hosting
firebase init hosting

# Build and deploy
npm run build
firebase deploy --only hosting
```

### Other Platforms
The production build in `dist/` can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- Any static hosting service

## Competition Submission

This project is submitted to the **Presidential AI Challenge 2026** (Track II: Technical Implementation).

**Live Demo**: [Insert deployed URL]

**Key Features**:
- 8 custom Google Gemini AI functions for waste detection
- Real-time Firebase sync
- DOGE-compliant government efficiency features
- Complete audit trail and transparency

## Support

For issues or questions about this implementation, please refer to:
- `PRESIDENTIAL_AI_CHALLENGE_SUBMISSION.md` - Complete project documentation
- `README.md` - Project overview
- GitHub Issues (if applicable)
