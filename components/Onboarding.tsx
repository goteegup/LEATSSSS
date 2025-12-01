
import React, { useState, useEffect } from 'react';
import { getWorkspaceSettings, updateWorkspaceSettings, uploadImage } from '../services/dataService';
import { WorkspaceSettings } from '../types';
import { GlassButton, GlassInput } from './ui/Glass';
import { ArrowRight, CheckCircle2, Upload, ImageIcon, Palette, Globe, Rocket, Sun, Moon, LayoutDashboard, Shield, BarChart3, Users } from 'lucide-react';

const PRESET_COLORS = [
    { name: 'Teal', value: '20 184 166', class: 'bg-teal-500' },
    { name: 'Blue', value: '59 130 246', class: 'bg-blue-500' },
    { name: 'Violet', value: '139 92 246', class: 'bg-violet-500' },
    { name: 'Rose', value: '244 63 94', class: 'bg-rose-500' },
    { name: 'Amber', value: '245 158 11', class: 'bg-amber-500' },
];

export const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState(1);
    const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        getWorkspaceSettings().then(s => {
            setSettings(s);
            if (s.logo_url) setLogoPreview(s.logo_url);
        });
    }, []);

    const updateSetting = (key: keyof WorkspaceSettings, value: any) => {
        if (!settings) return;
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        
        // Live Preview for Theme
        if (key === 'primary_color' || key === 'theme') {
            const event = new CustomEvent('theme-change', { detail: { primary_color: newSettings.primary_color, theme: newSettings.theme } });
            window.dispatchEvent(event);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const url = await uploadImage(file);
                // Force state update immediately
                setLogoPreview(url);
                updateSetting('logo_url', url);
            } catch (err) {
                console.error("Upload failed", err);
            }
        }
    };

    const handleNext = async () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            // Finish
            setIsAnimating(true);
            if (settings) {
                // Save final settings
                await updateWorkspaceSettings({ 
                    ...settings, 
                    logo_url: logoPreview, // Ensure logo is saved
                    onboarding_complete: true 
                });
            }
            setTimeout(onComplete, 1000);
        }
    };

    if (!settings) return null;

    return (
        <div className={`fixed inset-0 z-[100] bg-zinc-950 flex items-center justify-center p-4 transition-all duration-1000 ${isAnimating ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'}`}>
            
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-2xl">
                
                {/* Progress Indicators */}
                <div className="flex justify-between items-center mb-8 px-12">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary-500 w-full mx-1' : 'bg-zinc-800 w-full mx-1'}`} />
                    ))}
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/50 overflow-hidden relative min-h-[500px] flex flex-col justify-between">
                    
                    {/* Step 1: Identity */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-zinc-800 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                                    <Globe className="w-8 h-8 text-primary-500" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">Welcome to LeadTS</h2>
                                <p className="text-zinc-400 mt-2">Let's set up your digital headquarters.</p>
                            </div>

                            <div className="space-y-6 pt-4 max-w-sm mx-auto">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Agency Name</label>
                                    <input 
                                        autoFocus
                                        value={settings.agency_name}
                                        onChange={(e) => updateSetting('agency_name', e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                        placeholder="e.g. Apex Marketing"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Agency Logo</label>
                                    <div className="flex gap-4">
                                        <div className="w-24 h-24 rounded-2xl bg-black/20 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative group">
                                            {logoPreview ? (
                                                <img src={logoPreview} className="w-full h-full object-cover" alt="Logo" />
                                            ) : (
                                                <ImageIcon className="w-8 h-8 text-zinc-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <label className="cursor-pointer bg-primary-500 hover:bg-primary-400 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 w-fit shadow-lg shadow-primary-500/20">
                                                <Upload className="w-4 h-4" /> Upload Image
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                            <p className="text-xs text-zinc-500 mt-3">Supports JPG, PNG, WEBP.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Features (Capabilities) */}
                    {step === 2 && (
                         <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                             <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-white">Your New Operating System</h2>
                                <p className="text-zinc-400 mt-2">Everything you need to scale your agency.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Feature 1 */}
                                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                                        <LayoutDashboard className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <h3 className="text-white font-semibold mb-1">CRM & Kanban</h3>
                                    <p className="text-xs text-zinc-400">Drag & drop leads, customize pipelines, and track revenue.</p>
                                </div>

                                {/* Feature 2 */}
                                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                                        <Shield className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <h3 className="text-white font-semibold mb-1">Client Portal</h3>
                                    <p className="text-xs text-zinc-400">Give clients a VIP login to view their own live dashboards.</p>
                                </div>

                                {/* Feature 3 */}
                                <div className="bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                                        <BarChart3 className="w-5 h-5 text-green-500" />
                                    </div>
                                    <h3 className="text-white font-semibold mb-1">Real-time ROAS</h3>
                                    <p className="text-xs text-zinc-400">Track spend vs revenue automatically across all campaigns.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Aesthetics */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                             <div className="text-center">
                                <div className="w-16 h-16 bg-zinc-800 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                                    <Palette className="w-8 h-8 text-purple-500" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">Make it Yours</h2>
                                <p className="text-zinc-400 mt-2">Choose the look and feel of your workspace.</p>
                            </div>

                            <div className="space-y-8 pt-4 max-w-sm mx-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => updateSetting('theme', 'light')}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${settings.theme === 'light' ? 'bg-white text-zinc-900 border-white scale-105 shadow-xl' : 'bg-black/20 border-white/5 text-zinc-500 hover:bg-white/5'}`}
                                    >
                                        <Sun className="w-6 h-6" />
                                        <span className="text-sm font-medium">Light Mode</span>
                                    </button>
                                    <button 
                                        onClick={() => updateSetting('theme', 'dark')}
                                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${settings.theme === 'dark' ? 'bg-zinc-800 text-white border-zinc-600 scale-105 shadow-xl' : 'bg-black/20 border-white/5 text-zinc-500 hover:bg-white/5'}`}
                                    >
                                        <Moon className="w-6 h-6" />
                                        <span className="text-sm font-medium">Dark Mode</span>
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block text-center">Primary Accent</label>
                                    <div className="flex justify-center gap-4">
                                        {PRESET_COLORS.map(color => (
                                            <button
                                                key={color.value}
                                                onClick={() => updateSetting('primary_color', color.value)}
                                                className={`w-12 h-12 rounded-full border-4 transition-all flex items-center justify-center ${settings.primary_color === color.value ? 'border-white scale-125 shadow-lg shadow-white/20' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                            >
                                                <div className={`w-full h-full rounded-full ${color.class}`} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Launch */}
                    {step === 4 && (
                        <div className="space-y-8 py-4 animate-in fade-in slide-in-from-right-8 duration-500 text-center flex flex-col items-center justify-center h-full">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary-500/20 blur-3xl animate-pulse" />
                                <div className="relative w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-primary-500/40">
                                    <Rocket className="w-12 h-12 text-white" />
                                </div>
                            </div>
                            
                            <div>
                                <h2 className="text-4xl font-bold text-white">You're All Set!</h2>
                                <p className="text-zinc-400 mt-4 max-w-sm mx-auto text-lg">
                                    Your workspace <span className="text-white font-medium">{settings.agency_name}</span> is ready for takeoff.
                                </p>
                            </div>
                            
                            <div className="bg-white/5 rounded-2xl p-6 text-left border border-white/5 w-full max-w-sm">
                                <div className="flex items-center gap-3 text-zinc-300 mb-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Database initialized
                                </div>
                                <div className="flex items-center gap-3 text-zinc-300 mb-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Branding applied
                                </div>
                                <div className="flex items-center gap-3 text-zinc-300">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Portal configured
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Buttons */}
                    <div className="mt-auto pt-6 border-t border-white/5 flex justify-end">
                        <GlassButton onClick={handleNext} className="w-full justify-center group text-lg py-4">
                            {step === 4 ? "Launch Dashboard" : "Continue"} 
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </GlassButton>
                    </div>

                </div>
            </div>
        </div>
    );
};
