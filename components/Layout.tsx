
import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings as SettingsIcon,
  LogOut,
  ShieldCheck,
  Plus,
  Sun,
  Moon,
  FolderOpen,
  History,
  Landmark
} from 'lucide-react';
import { Button } from './Common';
import { APP_NAME, LOGO_URL } from '../constants';
import { User, UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAdd: () => void;
  onLogout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  user: User;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  onTabChange, 
  onAdd, 
  onLogout,
  darkMode,
  toggleDarkMode,
  user
}) => {
  const isSubmitter = user.role === UserRole.SUBMITTER;
  const isReviewer = user.role === UserRole.REVIEWER;
  const isViewer = user.role === UserRole.VIEWER;

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: isReviewer ? 'Review Queue' : isViewer ? 'Overview' : 'Dashboard' },
    ...(isSubmitter ? [{ id: 'purchases', icon: FolderOpen, label: 'My Submissions' }] : []),
    ...(isReviewer ? [{ id: 'history', icon: History, label: 'Audit Logs' }] : []),
    { id: 'reports', icon: BarChart3, label: isViewer ? 'District Analytics' : 'Reports' },
    { id: 'settings', icon: SettingsIcon, label: 'Configuration' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed inset-y-0 z-40">
        <div className="p-6 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8 px-2">
            <img 
              src={LOGO_URL} 
              alt="Seal" 
              className="w-10 h-10 rounded-full object-contain bg-white border border-slate-200 dark:border-slate-700 shadow-sm p-0.5" 
            />
            <div>
              <h1 className="font-serif font-bold text-lg text-gov-blue dark:text-white leading-tight">
                {APP_NAME}
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Official Portal</p>
            </div>
          </div>
          
          {!isViewer && (
            <Button 
              onClick={onAdd} 
              className="w-full justify-start h-12 mb-8 bg-gov-red hover:bg-red-800 text-white shadow-md"
            >
              <Plus className="w-4 h-4 mr-3" />
              {isReviewer ? 'New Record' : 'Start Submission'}
            </Button>
          )}

          <div className="px-2 mb-2">
             <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">Main Menu</p>
          </div>

          <nav className="space-y-1 flex-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-md text-sm font-bold transition-all group ${
                  activeTab === item.id 
                    ? 'bg-slate-100 dark:bg-slate-800 text-gov-blue dark:text-white border-l-4 border-gov-blue dark:border-blue-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border-l-4 border-transparent'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 transition-colors ${
                  activeTab === item.id ? 'text-gov-blue dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button 
              onClick={toggleDarkMode}
              className="w-full flex items-center px-4 py-2 rounded-md text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {darkMode ? <Sun className="w-4 h-4 mr-3" /> : <Moon className="w-4 h-4 mr-3" />}
              {darkMode ? 'Light Theme' : 'Dark Theme'}
            </button>

            <div className="flex items-center space-x-3 px-2">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 overflow-hidden">
                <img src={user.avatar || `https://picsum.photos/80/80?random=${user.id}`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate uppercase font-bold tracking-wider">{user.role}</p>
              </div>
              <button 
                onClick={onLogout}
                className="text-slate-400 hover:text-gov-red transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72 p-8 lg:p-12 min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
