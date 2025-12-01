
import React, { useState, useEffect } from 'react';
import { getWorkspaceSettings, updateWorkspaceSettings, uploadImage, initializeDemoWorkspace } from '../services/dataService';
import { WorkspaceSettings } from '../types';
import { GlassButton, GlassInput } from './ui/Glass';
import { ArrowRight, CheckCircle2, Upload, ImageIcon, Globe, Rocket, Sun, Moon, LayoutDashboard, Shield, BarChart3, Building2, Dumbbell, Car, Stethoscope, Briefcase, Sparkles, Loader2, Play } from 'lucide-react';

export const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState(1);
    const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);
    
    // Form State
    const [clientName, setClientName] = useState('');
    const [industry, setIndustry] = useState('');
    
    // Loading State
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStatus, setLoadingStatus] = useState('Initializing...');

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
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const url = await uploadImage(file);
                setLogoPreview(url);
                updateSetting('logo_url', url);
            } catch (err) {
                console.error("Upload failed", err);
            }
        }
    };

    const runMagicSetup = async () => {
        // Step 4: Simulation
        const steps = [
            { msg: 'Creating database...', progress: 20 },
            { msg: 'Configuring pipeline stages...', progress: 45 },
            { msg: `Applying ${industry.replace('-', ' ')} blueprint...`, progress: 70 },
            { msg: 'Generating demo leads...', progress: 90 },
            { msg: 'Ready for launch.', progress: 100 },
        ];

        for (const s of steps) {
            setLoadingStatus(s.msg);
            setLoadingProgress(s.progress);
            await new Promise(r => setTimeout(r, 800));
        }

        // Actually generate data
        if (settings) {
            await initializeDemoWorkspace(settings.agency_name, clientName, industry);
            await updateWorkspaceSettings({ 
                ...settings, 
                logo_url: logoPreview, 
                onboarding_complete: true 
            });
        }
        
        setStep(5);
    };

    const handleNext = async () => {
        if (step === 3) {
            setStep(4);
            runMagicSetup();
        } else if (step === 5) {
            setIsAnimating(true);
            setTimeout(onComplete, 800);
        } else {
            setStep(step + 1);
        }
    };

    if (!settings) return null;

    const INDUSTRIES = [
        { id: 'real-estate', label: 'Real Estate', icon: Building2, desc: 'Property pipelines & budget tracking' },
        { id: 'fitness', label: 'Fitness / Gym', icon: Dumbbell, desc: 'Membership trials & goal tracking' },
        { id: 'automotive', label: 'Automotive', icon: Car, desc: 'Test drives & trade-in forms' },
        { id: 'medical', label: 'Medical / Dental', icon: Stethoscope, desc: 'Patient booking & consultations' },
        { id: 'other', label: 'General Service', icon: Briefcase, desc: 'Standard lead qualification flow' },
    ];

    return (
        <div className={`fixed inset-0 z-[100] bg-zinc-950 flex items-center justify-center p-4 transition-all duration-1000 ${isAnimating ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100'}`}>
            
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative w-full max-w-2xl">
                
                {/* Progress Indicators */}
                <div className="flex justify-between items-center mb-8 px-12">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary-500 w-full mx-1' : 'bg-zinc-800 w-full mx-1'}`} />
                    ))}
                </div>

                <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/50 overflow-hidden relative min-h-[500px] flex flex-col justify-between">
                    
                    {/* Step 1: Agency Identity */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-zinc-800 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                                    <Globe className="w-8 h-8 text-primary-500" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">Setup Your Workspace</h2>
                                <p className="text-zinc-400 mt-2">Create your agency headquarters.</p>
                            </div>

                            <div className="space-y-6 pt-4 max-w-sm mx-auto">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Agency Name</label>
                                    <input 
                                        autoFocus
                                        value={settings.agency_name}
                                        onChange={(e) => updateSetting('agency_name', e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors placeholder:text-zinc-600"
                                        placeholder="e.g. Apex Marketing"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Agency Logo</label>
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 rounded-2xl bg-black/20 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 relative group">
                                            {logoPreview ? (
                                                <img src={logoPreview} className="w-full h-full object-cover" alt="Logo" />
                                            ) : (
                                                <ImageIcon className="w-8 h-8 text-zinc-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 w-fit border border-white/5">
                                                <Upload className="w-4 h-4" /> Upload Image
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: First Client */}
                    {step === 2 && (
                         <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                             <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-zinc-800 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                                    <Shield className="w-8 h-8 text-purple-500" />
                                </div>
                                <h2 className="text-3xl font-bold text-white">Add First Client</h2>
                                <p className="text-zinc-400 mt-2">Who are we setting up this campaign for?</p>
                            </div>
                            
                            <div className="space-y-6 max-w-sm mx-auto">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Client Company Name</label>
                                    <input 
                                        autoFocus
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors placeholder:text-zinc-600"
                                        placeholder="e.g. Dr. Smile Dental"
                                    />
                                </div>
                                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                                    <div className="flex gap-3">
                                        <Shield className="w-5 h-5 text-purple-400 shrink-0" />
                                        <p className="text-sm text-purple-200">
                                            We'll automatically create a <strong>Client Portal</strong> for them so they can view their leads instantly.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Industry Blueprint */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                             <div className="text-center">
                                <h2 className="text-3xl font-bold text-white">Select Blueprint</h2>
                                <p className="text-zinc-400 mt-2">Choose an industry template to auto-configure pipelines.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin">
                                {INDUSTRIES.map(ind => (
                                    <button
                                        key={ind.id}
                                        onClick={() => setIndustry(ind.id)}
                                        className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-start gap-4 group ${industry === ind.id ? 'bg-primary-500/10 border-primary-500' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                    >
                                        <div className={`p-2.5 rounded-lg ${industry === ind.id ? 'bg-primary-500 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:text-white'}`}>
                                            <ind.icon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className={`font-bold ${industry === ind.id ? 'text-primary-400' : 'text-zinc-200'}`}>{ind.label}</h3>
                                            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{ind.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Magic Loading */}
                    {step === 4 && (
                        <div className="space-y-8 py-4 animate-in fade-in slide-in-from-right-8 duration-500 text-center flex flex-col items-center justify-center h-full">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary-500/20 blur-3xl animate-pulse" />
                                <div className="relative w-24 h-24 bg-zinc-900 rounded-full border-4 border-primary-500/30 mx-auto flex items-center justify-center">
                                    <Sparkles className="w-10 h-10 text-primary-500 animate-pulse" />
                                </div>
                            </div>
                            
                            <div className="w-full max-w-sm space-y-4">
                                <h2 className="text-2xl font-bold text-white animate-pulse">{loadingStatus}</h2>
                                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary-500 transition-all duration-500 ease-out" 
                                        style={{ width: `${loadingProgress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Launch */}
                    {step === 5 && (
                        <div className="space-y-8 py-4 animate-in fade-in slide-in-from-right-8 duration-500 text-center flex flex-col items-center justify-center h-full">
                            <div className="relative">
                                <div className="absolute inset-0 bg-green-500/20 blur-3xl" />
                                <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-green-500/40">
                                    <Rocket className="w-12 h-12 text-white" />
                                </div>
                            </div>
                            
                            <div>
                                <h2 className="text-4xl font-bold text-white">You're All Set!</h2>
                                <p className="text-zinc-400 mt-4 max-w-sm mx-auto text-lg">
                                    Your workspace <span className="text-white font-medium">{settings.agency_name}</span> has been configured with the <span className="text-primary-400">{industry}</span> blueprint.
                                </p>
                            </div>
                            
                            <div className="bg-white/5 rounded-2xl p-6 text-left border border-white/5 w-full max-w-sm mx-auto">
                                <div className="flex items-center gap-3 text-zinc-300 mb-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Database initialized
                                </div>
                                <div className="flex items-center gap-3 text-zinc-300 mb-3">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" /> <span className="font-bold text-white">{clientName}</span> added
                                </div>
                                <div className="flex items-center gap-3 text-zinc-300">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Demo leads generated
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer Buttons */}
                    {step !== 4 && (
                        <div className="mt-auto pt-6 border-t border-white/5 flex justify-end">
                            <GlassButton 
                                onClick={handleNext} 
                                disabled={step === 1 && !settings.agency_name || step === 2 && !clientName || step === 3 && !industry}
                                className="w-full justify-center group text-lg py-4 shadow-lg shadow-primary-500/20"
                            >
                                {step === 5 ? "Launch Dashboard" : "Continue"} 
                                {step === 5 ? <Play className="w-5 h-5 ml-2 fill-white" /> : <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                            </GlassButton>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};
