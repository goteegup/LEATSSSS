
import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';
import { cycleTheme, getWorkspaceSettings, getSession, logoutClient, getClientById, logout } from '../services/dataService';
import { Client, WorkspaceSettings, User as UserType } from '../types';
import { LayoutDashboard, Users, Settings, Globe, Sun, Moon, Shield, LogOut, Home, MonitorPlay, UserCircle, Layers } from 'lucide-react';
import { TourOverlay } from './TourOverlay';

// --- ROUTER SHIM ---

type Location = { pathname: string; search: string; hash: string };
type NavigateFunction = (to: string) => void;

const RouterContext = createContext<{ location: Location; navigate: NavigateFunction } | null>(null);
const RouteContext = createContext<{ params: Record<string, string> }>({ params: {} });

export const useLocation = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useLocation must be used within a Router");
  return ctx.location;
}

export const useNavigate = () => {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useNavigate must be used within a Router");
  return ctx.navigate;
}

export function useParams<T = Record<string, string>>(): T {
  const ctx = useContext(RouteContext);
  return ctx.params as unknown as T;
}

export const HashRouter: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location>({
      pathname: window.location.hash.substring(1).split('?')[0] || '/',
      search: window.location.hash.includes('?') ? '?' + window.location.hash.split('?')[1] : '',
      hash: window.location.hash
  });

  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash;
      const path = hash.substring(1) || '/';
      const [pathname, search] = path.split('?');
      setLocation({ pathname: pathname || '/', search: search ? '?' + search : '', hash });
    };
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate: NavigateFunction = (to) => {
    window.location.hash = to;
  };

  return <RouterContext.Provider value={{ location, navigate }}>{children}</RouterContext.Provider>;
};

export function matchPath(pattern: string, pathname: string) {
    if (!pattern || !pathname) return null;
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = pathname.split('/').filter(Boolean);
    
    // Exact match required for root
    if (pattern === '/' && pathname !== '/') return null;
    if (pattern === '/' && pathname === '/') return { params: {}, isExact: true };

    if (patternParts.length > pathParts.length) return null;
    
    const params: Record<string, string> = {};
    
    for (let i = 0; i < patternParts.length; i++) {
        const p = patternParts[i];
        const v = pathParts[i];
        if (p.startsWith(':')) {
            params[p.substring(1)] = v;
        } else if (p !== v && p !== '*') {
            return null;
        }
    }
    
    return { params, isExact: patternParts.length === pathParts.length };
}

export const Routes: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { pathname } = useLocation();
    let element: ReactNode = null;
    
    React.Children.forEach(children, child => {
        if (element) return;
        if (!React.isValidElement(child)) return;
        
        const { path, element: routeElem } = child.props as { path?: string, element: ReactNode };
        
        if (!path || path === '*') {
            if (path === '*') element = routeElem;
            return;
        }
        
        const match = matchPath(path, pathname);
        if (match) {
            if (match.isExact || path === '*') {
                element = <RouteContext.Provider value={{ params: match.params }}>{routeElem}</RouteContext.Provider>;
            }
        }
    });
    
    return <>{element}</>;
};

export const Route: React.FC<{ path?: string, element: ReactNode }> = () => null;

export const Link: React.FC<{ to: string, children: ReactNode, className?: string, onClick?: (e: React.MouseEvent) => void }> = ({ to, children, className, onClick }) => {
    const navigate = useNavigate();
    return (
        <a 
            href={`#${to}`} 
            className={className}
            onClick={(e) => {
                e.preventDefault();
                if (onClick) onClick(e);
                navigate(to);
            }}
        >
            {children}
        </a>
    );
}

// Robust NavLink that handles both string and function classNames safely
export const NavLink: React.FC<{ to: string, className: string | ((props: { isActive: boolean }) => string), children: ReactNode, id?: string }> = ({ to, className, children, id }) => {
    const { pathname } = useLocation();
    const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
    const navigate = useNavigate();
    
    const computedClass = typeof className === 'function' 
        ? className({ isActive }) 
        : className;

    return (
        <a 
            href={`#${to}`}
            id={id}
            className={computedClass}
            onClick={(e) => {
                e.preventDefault();
                navigate(to);
            }}
        >
            {children}
        </a>
    );
}

export const Navigate: React.FC<{ to: string, replace?: boolean }> = ({ to }) => {
    const navigate = useNavigate();
    useEffect(() => { navigate(to); }, [to]);
    return null;
}

export const Outlet: React.FC = () => null;

// --- LAYOUT ---

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
        getWorkspaceSettings().then(setSettings);
    };
    window.addEventListener('theme-change' as any, handleThemeChange as any);

    // Listen for session changes
    const handleSessionChange = () => {
        const current = getSession();
        setSession(current);
        if (!current.user) {
             navigate('/auth');
        }
    };
    window.addEventListener('session-change', handleSessionChange);
    
    // Initial Auth Check
    if (!session.user) {
        navigate('/auth');
    }

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

  const handleToggleTheme = () => cycleTheme();
  
  const handleExitClientView = async () => {
      await logoutClient();
      navigate('/portal');
  };
  
  const handleLogout = async () => {
      await logout();
      navigate('/auth');
  }

  // Safe role check
  const currentRole = session?.role || 'admin';

  // Define navigation items
  const ALL_NAV_ITEMS = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin'], id: 'nav-dashboard' },
      { icon: Users, label: 'Clients', path: '/clients', roles: ['admin'], id: 'nav-clients' },
      { icon: Home, label: 'My Overview', path: session.clientId ? `/clients/${session.clientId}` : '/clients', roles: ['client'], id: 'nav-overview' },
      { icon: Shield, label: 'Portal', path: '/portal', roles: ['admin'], id: 'nav-portal' },
      { icon: Layers, label: 'Templates', path: '/templates', roles: ['admin'], id: 'nav-templates' },
      { icon: Settings, label: 'Settings', path: '/settings', roles: ['admin'], id: 'nav-settings' },
      { icon: MonitorPlay, label: 'Website', path: '/', roles: ['admin', 'client'], id: 'nav-website' },
  ];

  const visibleNavItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(currentRole));
  
  // Route check for campaign view to hide mobile dock
  const isCampaignPage = location.pathname.startsWith('/campaign/');

  const renderLogo = (sizeClass = "w-8 h-8") => {
      if (settings?.logo_url) {
          return <img src={settings.logo_url} alt="Logo" className={`${sizeClass} object-contain rounded-lg`} />;
      }
      return (
        <div className={`${sizeClass} rounded-lg bg-[#14b8a6] flex items-center justify-center shadow-[0_0_12px_rgba(20,184,166,0.3)]`}>
            <Globe className="w-[60%] h-[60%] text-black stroke-[1.5]" />
        </div>
      );
  };

  if (!session.user) return null; 

  return (
    <div className="min-h-[100dvh] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-teal-500/30 transition-colors duration-300">
      
      {/* --- TOUR OVERLAY --- */}
      {session.role === 'admin' && <TourOverlay />}

      {/* GLOBAL MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 z-40 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {renderLogo("w-8 h-8")}
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">{settings?.agency_name || 'LeadTS'}</span>
          </div>
          <button onClick={handleToggleTheme} className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
      </div>

      {/* CLIENT VIEW BANNER */}
      {currentRole === 'client' && viewingClient && (
          <div className="fixed top-16 md:top-0 left-0 md:left-64 right-0 bg-primary-500 text-white z-40 px-6 py-2 flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-2 text-sm font-medium">
                  <Shield className="w-4 h-4" />
                  Viewing Portal as: <span className="font-bold underline">{viewingClient.name}</span>
              </div>
              <button onClick={handleExitClientView} className="bg-white/20 hover:bg-white/30 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
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
              id={item.id}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
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
           <button onClick={handleToggleTheme} className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-transparent hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-500 dark:text-zinc-400 transition-colors">
               <span className="text-sm font-medium">Theme</span>
               {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
           </button>

          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 relative group">
            <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-500 dark:text-zinc-400 overflow-hidden">
              {currentRole === 'client' && viewingClient ? (
                  <img src={viewingClient.logo} alt="C" className="w-full h-full object-cover" />
              ) : session.user.avatar ? (
                  <img src={session.user.avatar} alt="U" className="w-full h-full object-cover" />
              ) : (
                  <UserCircle className="w-6 h-6" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate">
                  {currentRole === 'client' && viewingClient ? viewingClient.name : session.user.name}
              </p>
              <p className="text-xs text-zinc-500 truncate capitalize">{currentRole}</p>
            </div>
            
            <button onClick={handleLogout} className="absolute right-2 p-1.5 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all" title="Log Out">
                <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`md:ml-64 min-h-[100dvh] pb-24 md:pb-8 pt-16 md:pt-0 ${currentRole === 'client' ? 'mt-10 md:mt-10' : ''}`}>
        {children}
      </main>

      {/* Mobile Bottom Dock */}
      {!isCampaignPage && (
          <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 p-2 flex justify-between items-center px-6">
              {visibleNavItems.map((item) => (
                 <NavLink
                 key={item.path}
                 to={item.path}
                 id={item.id}
                 className={({ isActive }) =>
                   `flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                     isActive
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
