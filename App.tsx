
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CampaignDetail } from './pages/CampaignDetail';
import { Clients } from './pages/Clients';
import { ClientDetail } from './pages/ClientDetail';
import { Settings } from './pages/Settings';
import { Portal } from './pages/Portal';
import { LandingPage } from './pages/LandingPage';
import { getWorkspaceSettings } from './services/dataService';
import { Onboarding } from './components/Onboarding';

// --- THEME ENGINE ---
const applyTheme = (primaryRgb: string, theme: 'dark' | 'light') => {
    const root = document.documentElement;
    const [r, g, b] = primaryRgb.split(' ').map(Number);
    const shift = (amt: number) => `${Math.max(0, Math.min(255, r + amt))} ${Math.max(0, Math.min(255, g + amt))} ${Math.max(0, Math.min(255, b + amt))}`;

    root.style.setProperty('--color-primary-50', shift(200));
    root.style.setProperty('--color-primary-100', shift(160));
    root.style.setProperty('--color-primary-200', shift(120));
    root.style.setProperty('--color-primary-300', shift(80));
    root.style.setProperty('--color-primary-400', shift(40));
    root.style.setProperty('--color-primary-500', primaryRgb); // Base
    root.style.setProperty('--color-primary-600', shift(-20));
    root.style.setProperty('--color-primary-700', shift(-40));
    root.style.setProperty('--color-primary-800', shift(-60));
    root.style.setProperty('--color-primary-900', shift(-80));

    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
};

// Wrapper to apply the Dashboard Layout to app routes
const AppLayoutWrapper = () => (
    <Layout>
        <Outlet />
    </Layout>
);

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const initTheme = async () => {
        const settings = await getWorkspaceSettings();
        applyTheme(settings.primary_color, settings.theme);
        if (!settings.onboarding_complete) {
            setShowOnboarding(true);
        }
    };
    initTheme();
    
    const handleThemeChange = (e: CustomEvent) => {
        const { primary_color, theme } = e.detail;
        applyTheme(primary_color, theme);
    };
    
    window.addEventListener('theme-change' as any, handleThemeChange as any);
    return () => window.removeEventListener('theme-change' as any, handleThemeChange as any);
  }, []);

  return (
    <HashRouter>
      {showOnboarding && <Onboarding onComplete={() => setShowOnboarding(false)} />}
      
      <Routes>
        {/* MARKETING SITE (Root) */}
        <Route path="/" element={<LandingPage />} />

        {/* MAIN APPLICATION (With Sidebar Layout) */}
        <Route element={<AppLayoutWrapper />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:clientId" element={<ClientDetail />} />
          <Route path="/campaign/:id" element={<CampaignDetail />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
