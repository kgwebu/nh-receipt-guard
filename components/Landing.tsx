
import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Common';
import { ShieldCheck, ArrowRight, Building2, Landmark, Scale, FileCheck, CheckCircle2, Flag } from 'lucide-react';
import { LOGO_URL } from '../constants';

interface LandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onNavigate: (page: string) => void;
}

const AnimatedStat = ({ target, duration = 2000, prefix = "", suffix = "", decimals = 0 }: { target: number, duration?: number, prefix?: string, suffix?: string, decimals?: number }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      const ease = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      
      setCount(target * ease);

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration, isVisible]);

  return (
    <span ref={elementRef} className="tabular-nums">
      {prefix}{count.toFixed(decimals)}{suffix}
    </span>
  );
};

export const Landing: React.FC<LandingProps> = ({ onGetStarted, onLogin, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      
      {/* Official Government Banner */}
      <div className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          <Flag className="w-3 h-3 sm:w-4 sm:h-4 text-gov-blue dark:text-blue-400 fill-current" />
          <span>An official initiative of the NH Regional Procurement Office</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm z-50 border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img 
              src={LOGO_URL} 
              alt="NH Receipt Guard Seal" 
              className="w-12 h-12 rounded-full object-contain bg-white border-2 border-slate-100 dark:border-slate-700 shadow-md p-0.5" 
            />
            <div className="leading-tight">
              <span className="block font-serif font-bold text-lg sm:text-xl text-gov-blue dark:text-white tracking-tight">NH Receipt Guard</span>
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fiscal Oversight Portal</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-600 dark:text-slate-300">
            <button onClick={() => onNavigate('mission')} className="hover:text-gov-blue dark:hover:text-blue-400 transition-colors">Our Mission</button>
            <button onClick={() => onNavigate('compliance')} className="hover:text-gov-blue dark:hover:text-blue-400 transition-colors">Compliance</button>
            <button onClick={() => onNavigate('impact')} className="hover:text-gov-blue dark:hover:text-blue-400 transition-colors">Fiscal Impact</button>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={onLogin} 
              className="text-sm font-bold text-gov-blue dark:text-blue-400 hover:underline underline-offset-4 px-4 py-2"
            >
              Staff Login
            </button>
            <button 
              onClick={onGetStarted}
              className="bg-gov-red hover:bg-red-800 text-white px-5 py-2.5 rounded-md text-sm font-bold shadow-sm transition-colors flex items-center"
            >
              Start Review
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gov-blue dark:bg-slate-900 text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541872703-74c5963631df?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Government Building Architecture" 
            className="w-full h-full object-cover opacity-20 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gov-blue/95 via-gov-blue/80 to-gov-blue/60 dark:from-slate-950 dark:via-slate-900/90 dark:to-slate-900/70" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 md:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-block bg-white/10 border border-white/20 backdrop-blur-md px-4 py-1.5 rounded-sm">
              <span className="text-xs font-bold tracking-widest uppercase">Spending Waste Prevention System v1.4</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-tight">
              Stop waste before <br/>it's spent.
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100 max-w-xl leading-relaxed font-light">
              Modernizing school district finance through automated auditing. We provide districts with the tools to identify duplicates, ensure compliance, and protect educational funding.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onGetStarted} 
                className="bg-white text-gov-blue hover:bg-slate-100 px-8 py-4 rounded-md text-base font-bold shadow-lg transition-colors flex items-center justify-center"
              >
                Launch Audit Tool <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button onClick={() => onNavigate('documentation')} className="bg-transparent border border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-md text-base font-bold transition-colors">
                View Documentation
              </button>
            </div>
          </div>

          <div className="hidden lg:block relative">
             <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl overflow-hidden border border-white/10">
                <div className="bg-slate-100 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center space-x-2">
                   <div className="w-3 h-3 rounded-full bg-red-500" />
                   <div className="w-3 h-3 rounded-full bg-amber-500" />
                   <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <img 
                   src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800" 
                   alt="Financial Audit Dashboard" 
                   className="w-full h-auto opacity-90"
                />
                <div className="absolute bottom-6 right-6 bg-gov-red text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                   <ShieldCheck className="w-6 h-6" />
                   <div>
                      <p className="text-xs font-medium opacity-90 uppercase tracking-wider">Potential Savings</p>
                      <p className="text-xl font-serif font-bold">$12,450.00</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Official Stats Bar - ID: Impact */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 scroll-mt-20">
         <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200 dark:divide-slate-800">
            <div className="py-8 text-center px-4">
              <p className="text-3xl font-serif font-bold text-gov-blue dark:text-white mb-1">
                <AnimatedStat target={34} />
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">School Districts</p>
            </div>
            <div className="py-8 text-center px-4">
              <p className="text-3xl font-serif font-bold text-gov-blue dark:text-white mb-1">
                <AnimatedStat target={1.2} prefix="$" suffix="M+" decimals={1} />
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Educational Funding Saved</p>
            </div>
            <div className="py-8 text-center px-4">
              <p className="text-3xl font-serif font-bold text-gov-blue dark:text-white mb-1">
                <AnimatedStat target={12} suffix="k" />
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Audits Completed</p>
            </div>
            <div className="py-8 text-center px-4">
              <p className="text-3xl font-serif font-bold text-gov-blue dark:text-white mb-1">
                <AnimatedStat target={99.9} suffix="%" decimals={1} />
              </p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Compliance Rate</p>
            </div>
         </div>
      </section>

      {/* Mission Section (Summary) */}
      <section className="py-24 px-6 bg-slate-50 dark:bg-slate-950 scroll-mt-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">Strengthening Financial Integrity</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
             NH Receipt Guard empowers school administrators to uphold the highest standards of fiscal stewardship using advanced automated verification.
          </p>
          <div className="w-24 h-1 bg-gov-red mx-auto mt-8" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card
             icon={Building2}
             title="Departmental Oversight"
             desc="Centralized dashboards provide superintendents and school administrators with real-time visibility into spending across all departments."
          />
          <Card 
             icon={Scale}
             title="Regulatory Compliance"
             desc="Automatically checks purchases against local ordinances and state statutes to ensure every dollar is spent according to regulation."
          />
          <Card 
             icon={FileCheck}
             title="Automated Auditing"
             desc="Reduces the administrative burden on staff by instantly flagging duplicates, sales tax errors, and unapproved vendors."
          />
        </div>
      </section>

      {/* Quote / Break */}
      <section className="bg-gov-blue dark:bg-slate-900 py-20 px-6 text-center text-white relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div className="max-w-4xl mx-auto relative z-10">
            <span className="text-6xl font-serif opacity-30">“</span>
            <h3 className="text-2xl md:text-4xl font-serif font-medium leading-relaxed mb-8">
               "Transparency isn't just a buzzword. It's the foundation of public trust. This tool gives us the capability to protect that trust with every transaction."
            </h3>
            <div className="flex items-center justify-center gap-4">
               <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-serif font-bold text-xl">S</div>
               <div className="text-left">
                  <p className="font-bold text-lg">Sarah Jenkins</p>
                  <p className="text-sm opacity-70 uppercase tracking-widest">Finance Director, Keene School District</p>
               </div>
            </div>
         </div>
      </section>

      {/* How It Works (Steps) */}
      <section className="py-24 px-6 bg-white dark:bg-slate-950 scroll-mt-20">
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2 space-y-12">
               <h2 className="text-4xl font-serif font-bold text-slate-900 dark:text-white">A Standardized Workflow</h2>
               <div className="space-y-8">
                  {[
                     { title: "Submission", text: "Staff upload receipts via secure portal or mobile." },
                     { title: "Verification", text: "System validates vendor, amount, and checks for duplicates." },
                     { title: "Review", text: "Finance officers receive flagged items for final approval." },
                     { title: "Archival", text: "Records are securely stored for state auditing requirements." }
                  ].map((step, i) => (
                     <div key={i} className="flex gap-6">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-gov-blue dark:text-blue-400">
                           {i + 1}
                        </div>
                        <div>
                           <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h4>
                           <p className="text-slate-600 dark:text-slate-400">{step.text}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
            <div className="lg:w-1/2">
               <div className="relative rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-2">
                  <img 
                     src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
                     alt="Meeting" 
                     className="rounded border border-slate-200 dark:border-slate-700 grayscale hover:grayscale-0 transition-all duration-700"
                  />
                  <div className="absolute -left-6 -bottom-6 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 max-w-xs">
                     <div className="flex items-center gap-3 mb-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        <span className="font-bold text-slate-900 dark:text-white">Audit Ready</span>
                     </div>
                     <p className="text-sm text-slate-500">All transactions are logged with immutable timestamps for complete accountability.</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src={LOGO_URL} 
                  alt="NH Receipt Guard Seal" 
                  className="w-10 h-10 rounded-full object-contain bg-white border border-slate-300 dark:border-slate-700 p-0.5" 
                />
                <span className="font-serif font-bold text-xl text-slate-900 dark:text-white">NH Receipt Guard</span>
              </div>
              <p className="text-slate-500 max-w-sm mb-6 leading-relaxed">
                Dedicated to modernizing public sector finance through technology, transparency, and trust.
              </p>
              <div className="flex gap-4">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/320px-Flag_of_the_United_States.svg.png" alt="US Flag" className="h-6 w-auto border border-slate-200" />
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest self-center">Made in USA</span>
              </div>
            </div>
            
            <div>
               <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Resources</h4>
               <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                  <li><button onClick={() => onNavigate('documentation')} className="hover:text-gov-blue hover:underline text-left">Documentation</button></li>
                  <li><button onClick={() => onNavigate('statutes')} className="hover:text-gov-blue hover:underline text-left">State Statutes</button></li>
                  <li><button onClick={() => onNavigate('accessibility')} className="hover:text-gov-blue hover:underline text-left">Accessibility</button></li>
                  <li><button onClick={() => onNavigate('training')} className="hover:text-gov-blue hover:underline text-left">Training Modules</button></li>
               </ul>
            </div>

            <div>
               <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider text-sm">Contact</h4>
               <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                  <li>helpdesk@nhguard.gov</li>
                  <li>(603) 555-0192</li>
                  <li>107 N Main St, Concord, NH</li>
               </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
             <p>© 2024 NH Receipt Guard. All rights reserved.</p>
             <div className="flex gap-6">
                <a href="#" className="hover:text-gov-blue">Privacy Policy</a>
                <a href="#" className="hover:text-gov-blue">Terms of Service</a>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Card: React.FC<{ icon: React.ElementType, title: string, desc: string }> = ({ icon: Icon, title, desc }) => (
   <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 text-left hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center text-gov-blue dark:text-blue-400 mb-6">
         <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold font-serif text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
   </div>
);
