
import React, { useEffect, useState } from 'react';
import { getWorkspaceSettings, updateWorkspaceSettings } from '../services/dataService';
import { WorkspaceSettings } from '../types';
import { GlassCard, GlassButton } from '../components/ui/Glass';
import { Palette, Globe, Link as LinkIcon, Image as ImageIcon, Save, Moon, Sun, Monitor, RefreshCw, AlertTriangle } from 'lucide-react';

const PRESET_COLORS = [
    { name: 'Teal', value: '20 184 166', class: 'bg-teal-500' },
    { name: 'Blue', value: '59 130 246', class: 'bg-blue-500' },
    { name: 'Violet', value: '139 92 246', class: 'bg-violet-500' },
    { name: 'Rose', value: '244 63 94', class: 'bg-rose-500' },
    { name: 'Amber', value: '245 158 11', class: 'bg-amber-500' },
];

export const Settings = () => {
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getWorkspaceSettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setLoading(true);
    await updateWorkspaceSettings(settings);
    
    // Dispatch event for App.tsx to pick up changes instantly
    const event = new CustomEvent('theme-change', { detail: { primary_color: settings.primary_color, theme: settings.theme } });
    window.dispatchEvent(event);
    
    setLoading(false);
  };

  const handleRestartOnboarding = async () => {
      if (!settings) return;
      if (confirm('This will restart the setup wizard. Continue?')) {
        await updateWorkspaceSettings({ ...settings, onboarding_complete: false });
        window.location.reload();
      }
  };

  // Immediate preview when changing settings state
  const updateSetting = (key: keyof WorkspaceSettings, value: any) => {
      if (!settings) return;
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);
      
      // Live Preview
      if (key === 'primary_color' || key === 'theme') {
         const event = new CustomEvent('theme-change', { detail: { primary_color: newSettings.primary_color, theme: newSettings.theme } });
         window.dispatchEvent(event);
      }
  };

  if (!settings) return <div className="p-10 text-center text-zinc-500">Loading settings...</div>;

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 text-zinc-900 dark:text-white pb-24">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Workspace Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Manage branding, localization, and agency details.</p>
      </div>

      <GlassCard className="p-8 space-y-8">
        
        {/* Branding Section */}
        <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary-500" />
                Branding & Appearance
            </h2>
            
            {/* Theme & Color Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Theme Mode */}
                <div>
                     <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">Interface Theme</label>
                     <div className="flex bg-zinc-100 dark:bg-zinc-950/50 p-1 rounded-xl border border-zinc-200 dark:border-white/10 w-fit">
                        <button 
                            onClick={() => updateSetting('theme', 'light')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${settings.theme === 'light' ? 'bg-white shadow text-zinc-900' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                        >
                            <Sun className="w-4 h-4" /> Light
                        </button>
                        <button 
                             onClick={() => updateSetting('theme', 'dark')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${settings.theme === 'dark' ? 'bg-zinc-800 shadow text-white' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                        >
                            <Moon className="w-4 h-4" /> Dark
                        </button>
                     </div>
                </div>

                {/* Primary Color */}
                <div>
                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-3">Primary Color</label>
                    <div className="flex gap-3">
                         {PRESET_COLORS.map(color => (
                             <button
                                key={color.value}
                                onClick={() => updateSetting('primary_color', color.value)}
                                className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${settings.primary_color === color.value ? 'border-zinc-900 dark:border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                             >
                                 <div className={`w-full h-full rounded-full ${color.class}`} />
                             </button>
                         ))}
                    </div>
                </div>
            </div>

            <div className="h-px bg-zinc-200 dark:bg-white/5" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Agency Name</label>
                    <input 
                        type="text" 
                        value={settings.agency_name}
                        onChange={(e) => setSettings({ ...settings, agency_name: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Agency Logo URL</label>
                <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 flex items-center justify-center text-zinc-400 overflow-hidden shrink-0">
                        {settings.logo_url ? (
                            <img src={settings.logo_url} alt="Logo Preview" className="w-full h-full object-cover" />
                        ) : (
                             <ImageIcon className="w-8 h-8" />
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={settings.logo_url}
                                onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50 placeholder:text-zinc-400"
                                placeholder="https://example.com/logo.png"
                            />
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        </div>
                        <p className="text-xs text-zinc-500 mt-2">Paste a direct link to your logo image (PNG or JPG).</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="h-px bg-zinc-200 dark:bg-white/5" />

        {/* Localization Section */}
        <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Localization
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">Language</label>
                    <select 
                        value={settings.language}
                        onChange={(e) => setSettings({ ...settings, language: e.target.value as 'en' | 'de' })}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50 appearance-none"
                    >
                        <option value="en">English (US)</option>
                        <option value="de">German (Deutsch)</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="pt-4 flex flex-col md:flex-row justify-between gap-4">
            <GlassButton variant="secondary" onClick={handleRestartOnboarding} className="w-full md:w-auto text-zinc-500">
                <RefreshCw className="w-4 h-4" /> Restart Onboarding
            </GlassButton>

            <GlassButton onClick={handleSave} disabled={loading} className="w-full md:w-auto">
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
            </GlassButton>
        </div>

      </GlassCard>
    </div>
  );
};
