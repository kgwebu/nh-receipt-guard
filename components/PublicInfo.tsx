
import React from 'react';
import { Button, Card, Badge } from './Common';
import { 
  ArrowLeft, 
  BookOpen, 
  Scale, 
  FileText, 
  Video, 
  Download, 
  ExternalLink, 
  Shield, 
  CheckCircle2, 
  Landmark, 
  Target, 
  Users, 
  TrendingUp,
  AlertTriangle,
  Search,
  PieChart,
  Building2,
  ArrowRight,
  Lock,
  Globe
} from 'lucide-react';
import { APP_NAME, LOGO_URL } from '../constants';

type PageType = 'documentation' | 'statutes' | 'accessibility' | 'training' | 'mission' | 'compliance' | 'impact';

interface PublicInfoProps {
  page: PageType;
  onBack: () => void;
}

export const PublicInfo: React.FC<PublicInfoProps> = ({ page, onBack }) => {
  const renderContent = () => {
    switch (page) {
      case 'documentation':
        return <DocumentationContent />;
      case 'statutes':
        return <StatutesContent />;
      case 'accessibility':
        return <AccessibilityContent />;
      case 'training':
        return <TrainingContent />;
      case 'mission':
        return <MissionContent />;
      case 'compliance':
        return <ComplianceContent />;
      case 'impact':
        return <ImpactContent />;
      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Header */}
      <nav className="sticky top-0 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onBack}>
             <img 
              src={LOGO_URL} 
              alt="Seal" 
              className="w-10 h-10 rounded-full object-contain bg-white border border-slate-200 dark:border-slate-700 p-0.5" 
            />
            <span className="font-serif font-bold text-lg text-gov-blue dark:text-white">{APP_NAME}</span>
          </div>
          <Button variant="ghost" onClick={onBack} className="text-slate-600 dark:text-slate-400">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {renderContent()}
      </main>
      
      {/* Simple Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 text-center">
         <p className="text-xs text-slate-500">
            &copy; 2024 NH Receipt Guard. Official State Business.
         </p>
      </footer>
    </div>
  );
};

/* --- EXISTING PAGES --- */

const DocumentationContent = () => (
  <div className="space-y-8">
    <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
      <div className="flex items-center gap-3 text-gov-blue dark:text-blue-400 mb-2">
        <BookOpen className="w-6 h-6" />
        <span className="text-xs font-bold uppercase tracking-widest">User Guides & Resources</span>
      </div>
      <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">System Documentation</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
        Comprehensive guides for school district reviewers, submitters, and administrators.
        Learn how to utilize the automated waste prevention tools effectively.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
        <FileText className="w-8 h-8 text-slate-400 group-hover:text-gov-blue mb-4 transition-colors" />
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Quick Start Guide v1.4</h3>
        <p className="text-sm text-slate-500 mb-4">Essential steps for first-time login, submission, and review workflows.</p>
        <div className="flex items-center text-xs font-bold text-gov-blue">
          Download PDF <Download className="w-3 h-3 ml-2" />
        </div>
      </Card>

      <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
        <Shield className="w-8 h-8 text-slate-400 group-hover:text-gov-blue mb-4 transition-colors" />
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Administrator Protocol</h3>
        <p className="text-sm text-slate-500 mb-4">Configuration settings for duplicate window thresholds and approval routing.</p>
        <div className="flex items-center text-xs font-bold text-gov-blue">
          Download PDF <Download className="w-3 h-3 ml-2" />
        </div>
      </Card>
      
      <Card className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
         <ExternalLink className="w-8 h-8 text-slate-400 group-hover:text-gov-blue mb-4 transition-colors" />
         <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">API Integration Docs</h3>
         <p className="text-sm text-slate-500 mb-4">Technical specifications for connecting ERP systems (Munis, Tyler, etc).</p>
         <div className="flex items-center text-xs font-bold text-gov-blue">
            View Online
         </div>
      </Card>
    </div>
  </div>
);

const StatutesContent = () => (
  <div className="space-y-8">
    <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
      <div className="flex items-center gap-3 text-gov-blue dark:text-blue-400 mb-2">
        <Scale className="w-6 h-6" />
        <span className="text-xs font-bold uppercase tracking-widest">Legal Framework</span>
      </div>
      <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">State Statutes & Compliance</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
        The NH Receipt Guard system is designed to assist school districts in adhering to the following New Hampshire Revised Statutes Annotated (RSA).
      </p>
    </div>

    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-lg border-l-4 border-l-gov-blue border-y border-r border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-start">
           <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white mb-2">RSA 32: School District Budget Law</h3>
           <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2 py-1 rounded uppercase">Chapter 32</span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-serif italic">
          "Appropriations voted by a school district shall be spent only for the purposes for which they were voted... No money shall be spent unless there is a specific appropriation."
        </p>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-bold text-slate-500">
           <CheckCircle2 className="w-4 h-4 text-emerald-600" />
           System enforces budget category matching automatically.
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-lg border-l-4 border-l-gov-blue border-y border-r border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-start">
           <h3 className="font-serif font-bold text-xl text-slate-900 dark:text-white mb-2">RSA 91-A: Access to Public Records</h3>
           <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2 py-1 rounded uppercase">Right to Know</span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-serif italic">
          "Public records shall be kept for 5 years... and made available for public inspection upon request."
        </p>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs font-bold text-slate-500">
           <CheckCircle2 className="w-4 h-4 text-emerald-600" />
           Digital archiving maintains immutable logs for audit requests.
        </div>
      </div>
    </div>
  </div>
);

const AccessibilityContent = () => (
  <div className="space-y-8">
    <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
      <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Accessibility Statement</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
        The NH Receipt Guard initiative is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.
      </p>
    </div>

    <div className="space-y-6">
       <h3 className="font-bold text-lg text-slate-900 dark:text-white">Conformance Status</h3>
       <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
          The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA. NH Receipt Guard is partially conformant with <span className="font-bold">WCAG 2.1 level AA</span>.
       </p>

       <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-8">Accessibility Features</h3>
       <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
          <li><strong>Keyboard Navigation:</strong> All interactive elements are navigable using standard keyboard inputs.</li>
          <li><strong>Contrast Ratios:</strong> We utilize 'Federal Blue' and high-contrast text to accommodate visual impairments.</li>
          <li><strong>Screen Reader Compatibility:</strong> Semantic HTML5 tags (ARIA) are used throughout the dashboard.</li>
          <li><strong>Text Resizing:</strong> The interface supports browser-based zoom up to 200% without loss of content.</li>
       </ul>

       <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-lg mt-8">
          <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Feedback</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
             We welcome your feedback on the accessibility of NH Receipt Guard. Please let us know if you encounter accessibility barriers:<br/><br/>
             E-mail: <a href="#" className="text-gov-blue underline">accessibility@nhguard.gov</a><br/>
             Phone: (603) 555-0192
          </p>
       </div>
    </div>
  </div>
);

const TrainingContent = () => (
  <div className="space-y-8">
    <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
      <div className="flex items-center gap-3 text-gov-blue dark:text-blue-400 mb-2">
        <Video className="w-6 h-6" />
        <span className="text-xs font-bold uppercase tracking-widest">Education Center</span>
      </div>
      <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Training Modules</h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
        Mandatory and optional training videos for fiscal officers and staff. Certification is required for "Reviewer" role access.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {[
          { title: "Module 1: Interface Basics", duration: "12 min", level: "Beginner", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=400" },
          { title: "Module 2: Flag Resolution", duration: "25 min", level: "Intermediate", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400" },
          { title: "Module 3: Audit Preparation", duration: "40 min", level: "Advanced", image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400" },
          { title: "Security Best Practices", duration: "15 min", level: "All Roles", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=400" },
          { title: "Mobile Capture Tips", duration: "8 min", level: "Submitter", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=400" },
          { title: "Reporting & Analytics", duration: "20 min", level: "Admin", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400" }
       ].map((mod, i) => (
          <div key={i} className="group bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all cursor-pointer">
             <div className="relative aspect-video bg-slate-200">
                <img src={mod.image} alt={mod.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                   <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[16px] border-l-gov-blue border-b-8 border-b-transparent ml-1" />
                   </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded">
                   {mod.duration}
                </div>
             </div>
             <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                   <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${mod.level === 'Beginner' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {mod.level}
                   </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-gov-blue transition-colors">{mod.title}</h3>
             </div>
          </div>
       ))}
    </div>
  </div>
);

/* --- BUILT-OUT PAGES --- */

const MissionContent = () => (
  <div className="space-y-12 animate-in fade-in duration-500">
    <div className="text-center max-w-3xl mx-auto space-y-6 pb-6 border-b border-slate-200 dark:border-slate-800">
       <div className="inline-flex items-center justify-center p-4 bg-gov-blue/5 dark:bg-blue-500/10 rounded-full text-gov-blue dark:text-blue-400 mb-4 ring-1 ring-gov-blue/20">
          <Landmark className="w-10 h-10" />
       </div>
       <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white leading-tight">
         Empowering Fiscal Integrity
       </h1>
       <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
          To provide New Hampshire's school districts with the digital infrastructure necessary to ensure every educational dollar is stewarded with absolute precision, transparency, and accountability.
       </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
       {[
         { icon: Shield, title: "Public Trust", desc: "Rebuilding confidence through auditable financial transparency.", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
         { icon: Target, title: "Precision", desc: "Eliminating error with state-of-the-art AI verification.", color: "text-gov-blue", bg: "bg-blue-50 dark:bg-blue-900/20" },
         { icon: Users, title: "Community", desc: "Supporting school administrators with modern, efficient tools.", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" }
       ].map((item, i) => (
         <div key={i} className="flex flex-col items-center text-center p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
            <div className={`w-14 h-14 ${item.bg} rounded-xl flex items-center justify-center mb-6`}>
              <item.icon className={`w-7 h-7 ${item.color}`} />
            </div>
            <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-white">{item.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
         </div>
       ))}
    </div>

    <div className="bg-slate-100 dark:bg-slate-900/50 p-8 md:p-10 rounded-3xl border border-slate-200 dark:border-slate-800">
       <div className="flex items-center gap-4 mb-8">
         <div className="w-2 h-8 bg-gov-red rounded-full" />
         <h3 className="font-bold text-2xl font-serif text-slate-900 dark:text-white">Strategic Roadmap 2025</h3>
       </div>
       <div className="grid gap-6">
          {[
             "Deployment of automated auditing to all NH school districts.",
             "Target reduction of statewide educational procurement waste by 15%.",
             "Standardization of digital receipt archival for Department of Education."
          ].map((goal, i) => (
             <div key={i} className="flex gap-5 items-start bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold font-serif">{i+1}</span>
                <p className="text-lg font-medium text-slate-700 dark:text-slate-300 pt-0.5">{goal}</p>
             </div>
          ))}
       </div>
    </div>
  </div>
);

const ComplianceContent = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
       <div className="flex items-center gap-3 text-gov-blue dark:text-blue-400 mb-2">
         <CheckCircle2 className="w-6 h-6" />
         <span className="text-xs font-bold uppercase tracking-widest">System Standards</span>
       </div>
       <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Compliance Protocols</h1>
       <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
          How NH Receipt Guard ensures your school district meets state and federal financial regulations through automated enforcement.
       </p>
    </div>

    <div className="space-y-8">
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm h-full">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-md text-gov-red">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Automated Flagging Logic</h3>
             </div>
             <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-gov-red rounded-full mt-2" />
                  <span><strong className="text-slate-900 dark:text-white">Duplicate Detection:</strong> Flags transactions with identical amounts/vendors within a 60-day rolling window.</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-gov-red rounded-full mt-2" />
                  <span><strong className="text-slate-900 dark:text-white">Split Purchases:</strong> Identifies multiple small transactions attempting to bypass bid thresholds (structuring).</span>
                </li>
                <li className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-gov-red rounded-full mt-2" />
                  <span><strong className="text-slate-900 dark:text-white">Sales Tax:</strong> Flags invoices that erroneously include sales tax (school districts are exempt).</span>
                </li>
             </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm h-full">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-md text-emerald-600">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Data Sovereignty & Security</h3>
             </div>
             <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                All financial data is encrypted at rest (AES-256) and in transit (TLS 1.3). Data residency is strictly enforced within the continental United States (GovCloud) to meet federal standards.
             </p>
             <div className="flex gap-2">
                <Badge color="green">SOC 2 Type II</Badge>
                <Badge color="blue">FedRAMP Ready</Badge>
             </div>
          </div>
       </div>

       <div className="p-8 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <h3 className="font-serif font-bold text-xl mb-2 text-slate-900 dark:text-white">Immutable Audit Trail</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Every action taken on a purchase record—from initial upload to final approval—is logged with a cryptographic hash. This ensures that the history of a transaction cannot be altered, providing a reliable chain of custody for state auditors.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
             <Badge color="slate" className="bg-white dark:bg-slate-800">SHA-256 Hashing</Badge>
             <Badge color="slate" className="bg-white dark:bg-slate-800">Timestamped</Badge>
             <Badge color="slate" className="bg-white dark:bg-slate-800">User Attributed</Badge>
          </div>
       </div>
    </div>
  </div>
);

const ImpactContent = () => (
  <div className="space-y-10 animate-in fade-in duration-500">
    <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
       <div className="flex items-center gap-3 text-gov-blue dark:text-blue-400 mb-2">
         <TrendingUp className="w-6 h-6" />
         <span className="text-xs font-bold uppercase tracking-widest">Fiscal Performance</span>
       </div>
       <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">Fiscal Impact Report</h1>
       <p className="text-lg text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
          Measuring the tangible return on investment for New Hampshire school districts through reduced waste and improved efficiency.
       </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
       {[
          { label: "Cost Avoidance", val: "$1,245,000", sub: "FY 2024 Total", icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
          { label: "Active Districts", val: "34", sub: "School Districts", icon: Landmark, color: "text-gov-blue", bg: "bg-blue-50 dark:bg-blue-900/10" },
          { label: "Admin Hours Saved", val: "14,500+", sub: "Est. $450k Value", icon: Users, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/10" },
          { label: "ROI", val: "840%", sub: "Per Dollar Spent", icon: PieChart, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/10" }
       ].map((stat, i) => (
          <Card key={i} className="p-6 border-slate-200 dark:border-slate-800">
             <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
             </div>
             <p className="text-3xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">{stat.val}</p>
             <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-2">{stat.label}</p>
             <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-400">
               {stat.sub}
             </div>
          </Card>
       ))}
    </div>

    <div className="space-y-6">
       <div className="flex items-center justify-between">
         <h3 className="font-bold text-2xl font-serif text-slate-900 dark:text-white">Success Stories</h3>
         <Button variant="outline" size="sm">
            <Globe className="w-4 h-4 mr-2" /> View All Regions
         </Button>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
             <div className="flex items-center gap-4 mb-6">
               <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-slate-400 group-hover:text-gov-blue transition-colors" />
               </div>
               <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">Dover School District</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase">Strafford County</p>
               </div>
             </div>
             <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Identified <span className="font-bold text-slate-900 dark:text-white">$24,000</span> in duplicate software subscriptions in the first 30 days of implementation, allowing funds to be redirected to classroom technology.
             </p>
             <div className="flex items-center text-sm font-bold text-gov-blue cursor-pointer hover:underline">
                Read Full Case Study <ArrowRight className="w-4 h-4 ml-2" />
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
             <div className="flex items-center gap-4 mb-6">
               <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-slate-400 group-hover:text-gov-blue transition-colors" />
               </div>
               <div>
                  <h4 className="font-bold text-lg text-slate-900 dark:text-white">Hanover School District</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase">Grafton County</p>
               </div>
             </div>
             <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Reduced purchase order processing time by <span className="font-bold text-slate-900 dark:text-white">65%</span> using the automated AI verification workflow. The district finance director reported saving 12 hours per week on manual review.
             </p>
             <div className="flex items-center text-sm font-bold text-gov-blue cursor-pointer hover:underline">
                Read Full Case Study <ArrowRight className="w-4 h-4 ml-2" />
             </div>
          </div>
       </div>
    </div>
  </div>
);
