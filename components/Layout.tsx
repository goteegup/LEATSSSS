
import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate, matchPath } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, PlusCircle, Globe, Sun, Moon, Shield, LogOut, Home, MonitorPlay } from 'lucide-react';
import { cycleTheme, getWorkspaceSettings, getSession, logoutClient, getClientById } from '../services/dataService';
import { Client, WorkspaceSettings } from '../types';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(true);
  const [session, setSession] = useState(getSession());
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);

  useEffect(() => {
    // Initial sync
    getWorkspaceSettings().then(s => {
        setSettings(s);
        setIsDark(s.theme === 'dark');
    });

    // Listen for theme changes
    const handleThemeChange = (e: CustomEvent) => {
        setIsDark(e.detail.theme === 'dark');
        // Also refresh settings in case logo changed
        getWorkspaceSettings().then(setSettings);
    };
    window.addEventListener('theme-change' as any, handleThemeChange as any);

    // Listen for session changes
    const handleSessionChange = () => {
        setSession(getSession());
    };
    window.addEventListener('session-change', handleSessionChange);

    return () => {
        window.removeEventListener('theme-change' as any, handleThemeChange as any);
        window.removeEventListener('session-change', handleSessionChange);
    };
  }, []);

  useEffect(() => {
      if (session.role === 'client' && session.clientId) {
          getClientById(session.clientId).then(c => setViewingClient(c || null));
      } else {
          setViewingClient(null);
      }
  }, [session]);

  const handleToggleTheme = () => {
      cycleTheme();
  };

  const handleExitClientView = async () => {
      await logoutClient();
      navigate('/portal');
  };

  // --- Dynamic Navigation based on Role ---
  const ALL_NAV_ITEMS = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin'] },
      { icon: Users, label: 'Clients', path: '/clients', roles: ['admin'] },
      // Client specific item
      { icon: Home, label: 'My Overview', path: session.clientId ? `/clients/${session.clientId}` : '/clients', roles: ['client'] },
      { icon: Shield, label: 'Portal', path: '/portal', roles: ['admin'] },
      { icon: Settings, label: 'Settings', path: '/settings', roles: ['admin'] },
      // Website Link
      { icon: MonitorPlay, label: 'Website', path: '/', roles: ['admin', 'client'] },
  ];

  const visibleNavItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(session.role));
  
  // Check if we are on a Campaign Detail page
  // logic: path starts with /campaign/
  const isCampaignPage = matchPath("/campaign/:id", location.pathname);

  // Logo Rendering Helper
  const renderLogo = (sizeClass = "w-8 h-8") => {
      if (settings?.logo_url) {
          return (
              <img 
                src={settings.logo_url} 
                alt={settings.agency_name} 
                className={`${sizeClass} object-contain rounded-lg`} 
              />
          );
      }
      // LeadTS Default Brand Fallback
      return (
        <div className={`${sizeClass} rounded-lg bg-[#14b8a6] flex items-center justify-center shadow-[0_0_12px_rgba(20,184,166,0.3)]`}>
            <Globe className="w-[60%] h-[60%] text-black stroke-[1.5]" />
        </div>
      );
  };

  return (
    <div className="min-h-[100dvh] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-teal-500/30 transition-colors duration-300">
      
      {/* GLOBAL MOBILE HEADER (Fixed Top) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 z-40 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {renderLogo("w-8 h-8")}
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">{settings?.agency_name || 'LeadTS'}</span>
          </div>
          <button 
            onClick={handleToggleTheme}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
      </div>

      {/* CLIENT VIEW BANNER */}
      {session.role === 'client' && viewingClient && (
          <div className="fixed top-16 md:top-0 left-0 md:left-64 right-0 bg-primary-500 text-white z-40 px-6 py-2 flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  Viewing Portal as: <span className="font-bold underline">{viewingClient.name}</span>
              </div>
              <button 
                onClick={handleExitClientView}
                className="bg-white/20 hover:bg-white/30 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
              >
                  <LogOut className="w-3 h-3" /> Exit View
              </button>
          </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed left-0 top-0 bottom-0 border-r border-zinc-200 dark:border-white/5 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl z-50">
        <div className="p-6 flex items-center gap-3">
          {renderLogo("w-8 h-8")}
          <span className="text-xl font-bold tracking-tight">{settings?.agency_name || 'LeadTS'}</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive || (item.path !== '/' && item.path !== '/dashboard' && location.pathname.startsWith(item.path))
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold' 
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-white/5 space-y-3">
           {/* Theme Toggle Desktop */}
           <button 
                onClick={handleToggleTheme}
                className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400 transition-colors"
           >
               <span className="text-sm font-medium">Theme</span>
               {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
           </button>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-400 overflow-hidden">
              {session.role === 'client' && viewingClient ? <img src={viewingClient.logo} alt="C" className="w-full h-full object-cover" /> : 'JD'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate">
                  {session.role === 'client' && viewingClient ? viewingClient.name : 'John Doe'}
              </p>
              <p className="text-xs text-zinc-500 truncate capitalize">{session.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      {/* Adjust padding top if banner is present */}
      <main className={`md:ml-64 min-h-[100dvh] pb-24 md:pb-8 pt-16 md:pt-0 ${session.role === 'client' ? 'mt-10 md:mt-10' : ''}`}>
        {children}
      </main>

      {/* Mobile Bottom Dock (Global) */}
      {/* HIDE this dock if we are on a campaign page, so the campaign tabs can take over */}
      {!isCampaignPage && (
          <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 p-2 flex justify-between items-center px-6">
              {visibleNavItems.map((item) => (
                 <NavLink
                 key={item.path}
                 to={item.path}
                 className={({ isActive }) =>
                   `flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                     isActive || (item.path !== '/' && item.path !== '/dashboard' && location.pathname.startsWith(item.path))
                       ? 'text-primary-500 transform -translate-y-2' 
                       : 'text-zinc-400'
                   }`
                 }
               >
                 <div className={`p-2 rounded-full ${location.pathname === item.path ? 'bg-primary-500/10' : ''}`}>
                    <item.icon className="w-6 h-6" />
                 </div>
               </NavLink>
              ))}
            </div>
          </div>
      )}

    </div>
  );
};
