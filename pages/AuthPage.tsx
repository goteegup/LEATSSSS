import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '../components/Layout';
import { loginUser } from '../services/dataService';
import { Mail, ArrowRight, Globe, Zap, BarChart3, Layers, User, Lock, Play, TrendingUp, MoreHorizontal, Bell, CheckCircle, UserPlus, UserCheck } from 'lucide-react';
import { GlassButton } from '../components/ui/Glass';

// --- ASSETS & ICONS ---
const GoogleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
);

// --- "LIVE" MOCK COMPONENTS FOR SLIDER ---
const MockPipeline = ({ active }: { active: boolean }) => (
    <div className="w-full h-full bg-zinc-900/50 p-4 flex flex-col gap-2 relative overflow-hidden">
        <div className="flex justify-between items-center"><div className="h-2 w-16 bg-zinc-700 rounded" /><div className="h-4 w-8 bg-zinc-800 rounded" /></div>
        <div className="flex-1 space-y-2">
            <div className={`p-2 rounded-lg bg-zinc-800/80 border border-white/5 relative transition-all duration-700 ${active ? 'translate-x-0' : '-translate-x-4'}`}><div className="h-2 w-20 bg-zinc-600 rounded" /></div>
            <div className={`p-2 rounded-lg bg-zinc-800/80 border border-white/5 relative transition-all duration-700 delay-100 ${active ? 'translate-x-0' : '-translate-x-4'}`}><div className="h-2 w-24 bg-zinc-600 rounded" /></div>
            <div className={`p-2 rounded-lg bg-primary-900/50 border border-primary-500/20 relative shadow-lg shadow-primary-500/10 transition-all duration-700 delay-200 ${active ? 'translate-x-0' : '-translate-x-4'}`}><div className="h-2 w-16 bg-primary-700 rounded" /></div>
        </div>
    </div>
);
const MockSlack = ({ active }: { active: boolean }) => (
    <div className="w-full h-full bg-zinc-900/50 p-4 flex items-center justify-center relative"><div className={`bg-zinc-800 border border-white/10 rounded-lg p-3 w-full shadow-2xl transition-all duration-500 ${active ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}><div className="flex gap-2"><div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center shrink-0"><Zap className="w-4 h-4 text-green-500" /></div><div className="flex-1 space-y-1"><div className="h-2 w-20 bg-zinc-600 rounded" /><div className="h-1.5 w-full bg-zinc-700 rounded" /><div className="h-1.5 w-1/2 bg-zinc-700 rounded" /></div></div></div></div>
);
const MockRevenue = ({ active }: { active: boolean }) => {
    const [count, setCount] = useState(38400);
    useEffect(() => {
        if(active) {
            let start = 38400;
            const end = 42500;
            const duration = 1000;
            const startTime = Date.now();
            const animate = () => {
                const elapsed = Date.now() - startTime;
                if(elapsed < duration) {
                    setCount(Math.ceil(start + (end - start) * (elapsed / duration)));
                    requestAnimationFrame(animate);
                } else {
                    setCount(end);
                }
            };
            requestAnimationFrame(animate);
        } else {
            setCount(38400);
        }
    }, [active]);
    return <div className="w-full h-full bg-zinc-900/50 p-4 flex flex-col justify-center items-center relative"><div className="text-center space-y-1"><div className="text-xs text-zinc-500 font-bold uppercase">Revenue</div><div className="text-3xl font-bold text-white tracking-tight">${count.toLocaleString()}</div><div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full transition-all duration-500 ${active ? 'bg-green-500/10 text-green-400' : 'bg-zinc-800 text-zinc-500'}`}><TrendingUp className="w-3 h-3" /><span className="text-xs font-medium">+12.5%</span></div></div></div>
};

const FEATURES = [
    { id: 1, title: "Visual Pipelines", component: MockPipeline, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { id: 2, title: "Instant Alerts", component: MockSlack, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
    { id: 3, title: "Revenue Tracking", component: MockRevenue, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" }
];

const FeatureSlider = () => {
    const [active, setActive] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => setActive(prev => (prev + 1) % FEATURES.length), 5000);
        return () => clearInterval(interval);
    }, []);

    return <div className="w-full max-w-sm mx-auto mt-auto">
        {FEATURES.map((feature, i) => (
            <div key={feature.id} className={`relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group mb-6 bg-zinc-950 transition-opacity duration-500 ${active === i ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}>
                <feature.component active={active === i} />
            </div>
        ))}
        <div className="space-y-3 px-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-1 border ${FEATURES[active].bg} ${FEATURES[active].color}`}>{FEATURES[active].title}</div>
            <div className="flex gap-2 pt-2">{FEATURES.map((_, i) => <button key={i} onClick={() => setActive(i)} className={`h-1 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-white' : 'w-2 bg-zinc-700 hover:bg-zinc-600'}`} />)}</div>
        </div>
    </div>;
};

// Bento Grid background
const BentoBackground = () => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if(ref.current) {
                const { clientX, clientY } = e;
                const { offsetWidth, offsetHeight } = ref.current;
                const x = (clientX / offsetWidth - 0.5) * 30;
                const y = (clientY / offsetHeight - 0.5) * 30;
                ref.current.style.transform = `perspective(1000px) rotateY(${x}deg) rotateX(${-y}deg) scale3d(1.05, 1.05, 1.05)`;
            }
        };
        window.addEventListener('mousemove', handler);
        return () => window.removeEventListener('mousemove', handler);
    }, []);
    return (
        <div ref={ref} className="absolute inset-0 transition-transform duration-500 ease-out">
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-4 p-4 opacity-10">
                <div className="col-span-2 row-span-2 rounded-xl bg-zinc-800 animate-in fade-in zoom-in-95 duration-1000" />
                <div className="rounded-xl bg-zinc-800 animate-in fade-in zoom-in-95 duration-1000 delay-100" />
                <div className="rounded-xl bg-primary-900/50 animate-in fade-in zoom-in-95 duration-1000 delay-200" />
                <div className="row-span-2 rounded-xl bg-zinc-800 animate-in fade-in zoom-in-95 duration-1000 delay-300" />
                <div className="col-span-2 rounded-xl bg-zinc-800 animate-in fade-in zoom-in-95 duration-1000 delay-400" />
                <div className="rounded-xl bg-primary-900/50 animate-in fade-in zoom-in-95 duration-1000 delay-500" />
                <div className="rounded-xl bg-zinc-800 animate-in fade-in zoom-in-95 duration-1000 delay-600" />
            </div>
        </div>
    );
}

export const AuthPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault(); if (!email) return; setIsLoading(true);
        try {
            const { isNewUser } = await loginUser(email);
            setTimeout(() => navigate(isNewUser ? '/setup' : '/dashboard'), 1000);
        } catch (e) { setIsLoading(false); }
    };
    
    const testLogin = async (type: 'new' | 'existing') => {
        setIsLoading(true);
        if (type === 'new') {
            localStorage.removeItem('leadts_workspace_settings');
            const testEmail = `new_agency_${Date.now()}@test.com`;
            const { isNewUser } = await loginUser(testEmail);
            setTimeout(() => { navigate('/setup'); }, 800);
        } else {
            const { isNewUser } = await loginUser('demo@leadts.com');
            setTimeout(() => { navigate('/dashboard'); }, 800);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row relative overflow-hidden font-sans">
            <div className="absolute inset-0 opacity-50"><BentoBackground /></div>
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-950/50 via-zinc-950 to-zinc-950" />

            {/* LEFT/TOP: FORM */}
            <div className="w-full md:w-1/2 lg:w-[45%] flex flex-col justify-center p-6 md:p-12 relative z-10">
                <div className="max-w-sm mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20"><Globe className="w-6 h-6 text-white" /></div>
                        <span className="text-2xl font-bold text-white tracking-tight">LeadTS</span>
                    </div>
                    <div className="space-y-2"><h2 className="text-3xl font-bold text-white">Sign in to your workspace</h2><p className="text-zinc-400 text-sm">Enter your email to get a magic link.</p></div>
                    <div className="space-y-5">
                        <button className="w-full flex items-center justify-center gap-3 bg-white text-zinc-900 font-medium py-3 px-4 rounded-xl hover:bg-zinc-200 transition-all shadow-sm border border-zinc-300"><GoogleIcon /> Sign in with Google</button>
                        <div className="relative py-1"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div><div className="relative flex justify-center text-xs uppercase font-bold"><span className="bg-zinc-950 px-3 text-zinc-600">Or</span></div></div>
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div className="relative group">
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 pl-11 placeholder:text-zinc-600 transition-all group-hover:border-white/20" placeholder="name@company.com" />
                                <Mail className="w-5 h-5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-primary-500" />
                            </div>
                            <GlassButton type="submit" disabled={isLoading} className="w-full justify-center py-4 text-sm font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40">{isLoading ? 'Sending...' : 'Continue with Email'}{!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}</GlassButton>
                        </form>
                    </div>

                    {/* Quick Test Buttons */}
                    <div className="pt-4 border-t border-white/5 space-y-3">
                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">For Quick Demo</label>
                        <div className="flex gap-3">
                            <button onClick={() => testLogin('new')} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 text-xs text-zinc-400 bg-zinc-900/50 border border-white/10 rounded-lg py-2 hover:bg-white/5 transition-colors disabled:opacity-50">
                                <UserPlus className="w-4 h-4" /> New User (Onboarding)
                            </button>
                            <button onClick={() => testLogin('existing')} disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 text-xs text-zinc-400 bg-zinc-900/50 border border-white/10 rounded-lg py-2 hover:bg-white/5 transition-colors disabled:opacity-50">
                                <UserCheck className="w-4 h-4" /> Existing User (Dashboard)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT/BOTTOM: VISUALS */}
            <div className="w-full md:w-1/2 lg:w-[55%] flex items-center justify-center p-6 md:p-12 bg-zinc-900/30 border-l border-white/5 relative">
                <div className="animate-in fade-in zoom-in-95 duration-1000 w-full"><FeatureSlider /></div>
            </div>
        </div>
    );
};
