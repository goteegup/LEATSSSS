
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    ArrowRight, BarChart3, Shield, Zap, CheckCircle2, Globe, LayoutDashboard, 
    ChevronRight, Play, Users, DollarSign, TrendingUp, MoreHorizontal, 
    Workflow, Code2, Mail, XCircle, ChevronDown, Check, 
    Briefcase, Utensils, Sparkles, Activity, MessageSquare, 
    Bell, AlertCircle, Lock, Wrench, Car, ShoppingBag, Server, Flag, Database, Key,
    Linkedin, Instagram, Sheet, FileText, Smartphone, Star
} from 'lucide-react';
import { GlassButton, GlassCard, Badge } from '../components/ui/Glass';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { getWorkspaceSettings } from '../services/dataService';
import { WorkspaceSettings } from '../types';

// --- BRAND ICONS ---

const SlackLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 127 127" xmlns="http://www.w3.org/2000/svg">
        <path fill="#E01E5A" d="M29.6 22.8c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v13.2H42.8c-7.3 0-13.2-5.9-13.2-13.2zm17.6 13.2c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h13.2v13.2z"/>
        <path fill="#36C5F0" d="M29.6 84.4c-7.3 0-13.2 5.9-13.2 13.2 0 7.3 5.9 13.2 13.2 13.2 7.3 0 13.2-5.9 13.2-13.2V84.4H29.6zm13.2-17.6c-7.3 0-13.2 5.9-13.2 13.2 0 7.3 5.9 13.2 13.2 13.2V66.8h-13.2c7.3 0 13.2-5.9 13.2-13.2 0-7.3-5.9-13.2-13.2-13.2H42.8z"/>
        <path fill="#2EB67D" d="M84.4 84.4c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V84.4h13.2zm-17.6-13.2c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H66.8v-13.2z"/>
        <path fill="#ECB22E" d="M84.4 22.8c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v13.2H84.4c-7.3 0-13.2-5.9-13.2-13.2zm-13.2 17.6c7.3 0 13.2-5.9 13.2-13.2 0-7.3-5.9-13.2-13.2v13.2h13.2c-7.3 0-13.2 5.9-13.2 13.2 0 7.3 5.9 13.2 13.2 13.2H71.2z"/>
    </svg>
);

const MetaLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.924 5.568c-.76-1.56-2.193-3.033-4.912-3.068-2.614.076-4.137 1.55-4.912 3.068-.797 1.558-1.326 3.73-2.673 6.966-1.347 3.237-2.73 4.393-4.407 4.393-1.636 0-2.317-1.127-2.317-2.227 0-1.28.84-2.632 2.317-2.632.757 0 1.295.342 1.635.632l.243-2.435C1.196 10.36 0 11.97 0 14.7c0 3.21 2.382 5.3 5.403 5.3 2.614-.075 4.137-1.55 4.912-3.068.796-1.558 1.326-3.73 2.673-6.966 1.347-3.237 2.73-4.394 4.407-4.394 1.636 0 2.317 1.128 2.317 2.228 0 1.28-.84 2.632-2.317 2.632-.757 0-1.295-.342-1.635-.632l-.243 2.435c.703-.095 1.898.17 2.483.17 3.02 0 5.403-2.09 5.403-5.3 0-3.21-2.382-5.3-5.403-5.3z"/>
    </svg>
);

// --- ANIMATION UTILS ---

const useScrollReveal = (threshold = 0.05) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); 
      }
    }, { threshold });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isVisible] as const;
};

const CountUp = ({ end, duration = 2000, prefix = '', suffix = '' }: { end: number, duration?: number, prefix?: string, suffix?: string }) => {
    const [count, setCount] = useState(0);
    const [ref, isVisible] = useScrollReveal();

    useEffect(() => {
        if (!isVisible) return;
        let start = 0;
        const increment = end / (duration / 16); 
        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [end, duration, isVisible]);

    return <span ref={ref}>{prefix}{Math.floor(count).toLocaleString()}{suffix}</span>;
};

const SectionSeparator = () => (
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />
);

// --- COMPONENTS ---

const ReviewCard = ({ name, role, company, image, text }: { name: string, role: string, company: string, image: string, text: string }) => (
    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-md shadow-xl hover:bg-zinc-900 hover:border-white/10 transition-all duration-300 group hover:-translate-y-1 cursor-default">
        <div className="flex gap-1 mb-4">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />)}
        </div>
        <p className="text-zinc-300 text-sm leading-relaxed mb-6">"{text}"</p>
        <div className="flex items-center gap-3">
            <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
            <div>
                <div className="text-sm font-bold text-white">{name}</div>
                <div className="text-xs text-zinc-500">{role}, {company}</div>
            </div>
        </div>
    </div>
);

const SlackNotificationCard = () => (
    <div className="relative w-full max-w-sm mx-auto group cursor-default">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-500" />
        <div className="relative bg-[#1A1D21] rounded-md border border-zinc-700/50 shadow-2xl overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500/80" />
            <div className="p-4 pl-5">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-white flex items-center justify-center shrink-0 border border-white/10 p-1.5">
                        <SlackLogo className="w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0 font-sans">
                        <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="font-bold text-zinc-100 text-[15px]">LeadTS Bot</span>
                            <span className="bg-zinc-700 text-zinc-300 text-[10px] px-1 rounded uppercase tracking-wider font-bold">APP</span>
                            <span className="text-zinc-500 text-xs">10:24 AM</span>
                        </div>
                        <div className="text-zinc-300 text-sm leading-relaxed">
                            🚀 <span className="font-semibold text-white">New High-Value Lead!</span> <br/>
                            <span className="text-zinc-400">Campaign:</span> Summer Promo <br/>
                            <span className="text-zinc-400">Value:</span> $5,000
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <button className="px-3 py-1 bg-transparent border border-zinc-600 hover:bg-zinc-700 text-green-400 text-sm font-semibold rounded-[4px] transition-colors">
                                View in CRM
                            </button>
                            <button className="px-3 py-1 bg-[#007a5a] hover:bg-[#006c4f] text-white text-sm font-semibold rounded-[4px] border border-transparent transition-colors">
                                Call Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg animate-[bounce_3s_infinite]">
            1
        </div>
    </div>
);

const MockKanbanCard = ({ title, value, stage, color }: { title: string, value: string, stage: string, color: string }) => (
    <div className="bg-zinc-800/80 backdrop-blur-md border border-white/5 p-3 rounded-lg shadow-lg mb-3 cursor-default group hover:bg-zinc-800 transition-colors">
        <div className="flex justify-between items-start mb-2">
            <div className="h-1.5 w-8 rounded-full bg-zinc-700/50 group-hover:bg-primary-500/50 transition-colors" />
            <MoreHorizontal className="w-4 h-4 text-zinc-600" />
        </div>
        <div className="font-medium text-sm text-zinc-200 mb-1">{title}</div>
        <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-zinc-500">{value}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${color} text-white`}>{stage}</span>
        </div>
    </div>
);

const MockPipeline = () => (
    <div className="grid grid-cols-3 gap-3 h-full p-4 bg-zinc-900/50 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-500/5 to-transparent opacity-0 animate-[scan_4s_linear_infinite] pointer-events-none" />
        <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">New</span>
            </div>
            <div className="animate-[pulse_4s_infinite]">
                <MockKanbanCard title="Acme Corp" value="$12k" stage="New" color="bg-blue-500/20 text-blue-400" />
            </div>
            <MockKanbanCard title="Stark Ind" value="$45k" stage="New" color="bg-blue-500/20 text-blue-400" />
        </div>
         <div className="space-y-3 pt-8">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Call</span>
            </div>
            <MockKanbanCard title="Wayne Ent" value="$85k" stage="Call" color="bg-purple-500/20 text-purple-400" />
        </div>
         <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Won</span>
            </div>
            <div className="animate-[float_5s_ease-in-out_infinite]">
                <MockKanbanCard title="Cyberdyne" value="$120k" stage="Won" color="bg-green-500/20 text-green-400" />
            </div>
        </div>
    </div>
);

const MockChart = () => {
    const data = [{v: 4000}, {v: 3000}, {v: 5500}, {v: 8000}, {v: 6000}, {v: 9500}, {v: 12000}];
    return (
        <div className="w-full h-full p-6 bg-zinc-900/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl flex flex-col hover:border-white/20 transition-colors relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                    <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Total Revenue</div>
                    <div className="text-3xl font-bold text-white tracking-tight"><CountUp end={45231} prefix="$" /></div>
                </div>
                <div className="text-green-400 text-xs font-bold bg-green-500/10 px-2 py-1 rounded border border-green-500/20 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +24.5%
                </div>
            </div>
            <div className="flex-1 min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorV)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-white/5 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-5 text-left group hover:bg-white/5 px-2 rounded-lg transition-colors"
            >
                <span className={`font-medium transition-colors ${isOpen ? 'text-primary-400' : 'text-zinc-300 group-hover:text-white'}`}>
                    {question}
                </span>
                <ChevronDown className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-500' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48 opacity-100 pb-4 px-2' : 'max-h-0 opacity-0'}`}>
                <p className="text-zinc-400 text-sm leading-relaxed pr-4">
                    {answer}
                </p>
            </div>
        </div>
    )
}

// --- MAIN COMPONENT ---

export const LandingPage = () => {
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  
  // Animation Refs
  const [heroRef, heroVisible] = useScrollReveal();
  const [dashboardRef, dashboardVisible] = useScrollReveal();
  const [comparisonRef, comparisonVisible] = useScrollReveal(0.1);
  const [pipelineRef, pipelineVisible] = useScrollReveal(0.1);
  const [portalRef, portalVisible] = useScrollReveal(0.1);
  const [slackRef, slackVisible] = useScrollReveal(0.1);
  const [methodRef, methodVisible] = useScrollReveal(0.1);
  const [integrationsRef, integrationsVisible] = useScrollReveal(0.1);
  const [metaRef, metaVisible] = useScrollReveal(0.1);
  const [reviewsRef, reviewsVisible] = useScrollReveal(0.1);
  const [pricingRef, pricingVisible] = useScrollReveal(0.1);
  const [privacyRef, privacyVisible] = useScrollReveal(0.1);
  const [faqRef, faqVisible] = useScrollReveal(0.1);

  useEffect(() => {
      getWorkspaceSettings().then(setSettings);
  }, []);

  const renderLogo = (sizeClass = "w-8 h-8") => (
    <div className={`${sizeClass} rounded-lg bg-[#14b8a6] flex items-center justify-center shadow-[0_0_15px_rgba(20,184,166,0.3)]`}>
        <Globe className="w-[60%] h-[60%] text-black stroke-[1.5]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-primary-500/30 overflow-x-hidden font-sans">
      
      {/* --- NAVIGATION --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             {renderLogo("w-9 h-9")}
             <span className="text-xl font-bold tracking-tight text-white">LeadTS</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                <a href="#features" className="hover:text-white transition-colors">Features</a>
                <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
                <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            </div>
            <Link to="/dashboard">
                <GlassButton className="shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 border-primary-500/50 bg-primary-500 hover:bg-primary-400 text-white">
                    Launch App <ArrowRight className="w-4 h-4 ml-2" />
                </GlassButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] animate-[spin_60s_linear_infinite]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] -z-10" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8" ref={heroRef}>
            <div className={`transition-all duration-1000 transform ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                
                {/* Badges */}
                <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                    <span className="px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2 shadow-lg backdrop-blur-md">
                        <CheckCircle2 className="w-3 h-3 text-primary-500"/> Mobile-First
                    </span>
                    <span className="px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2 shadow-lg backdrop-blur-md">
                        <Zap className="w-3 h-3 text-blue-500"/> Direct Meta Sync
                    </span>
                    <span className="px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-[10px] font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2 shadow-lg backdrop-blur-md">
                        <Shield className="w-3 h-3 text-purple-500"/> White-Label
                    </span>
                </div>
                
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-white drop-shadow-2xl">
                    The Performance CRM for <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-teal-200 to-purple-400 animate-gradient-x">Real Revenue.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed pt-4">
                    Leads are not the goal. Revenue is. <br/>
                    LeadTS turns marketing results into business results — by ensuring every lead gets worked, tracked, and closed.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8">
                    <Link to="/dashboard">
                        <button className="px-10 py-4 rounded-2xl bg-primary-500 hover:bg-primary-400 text-white font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(20,184,166,0.5)] hover:shadow-[0_0_60px_-15px_rgba(20,184,166,0.6)] hover:-translate-y-1 flex items-center gap-2 border border-primary-400 relative overflow-hidden group">
                            <span className="relative z-10 flex items-center gap-2">Start Free Trial <ChevronRight className="w-5 h-5" /></span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </button>
                    </Link>
                    <button className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg transition-all flex items-center gap-2 group backdrop-blur-md">
                        <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" /> Watch Live Demo
                    </button>
                </div>
                
                <div className="flex items-center justify-center gap-6 pt-6 text-xs text-zinc-500 font-medium uppercase tracking-wide">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-600"/> No credit card required</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-600"/> Live in minutes</span>
                </div>
            </div>
        </div>

        {/* 3D Dashboard Preview */}
        <div 
            ref={dashboardRef}
            className={`mt-24 max-w-6xl mx-auto transition-all duration-1000 delay-200 transform perspective-1000 ${dashboardVisible ? 'opacity-100 rotate-x-6 scale-100' : 'opacity-0 translate-y-20 scale-95'}`}
            style={{ perspective: '2000px' }}
        >
            <div className="relative rounded-2xl border border-white/10 shadow-2xl bg-zinc-900/80 backdrop-blur-xl overflow-hidden group hover:scale-[1.01] transition-transform duration-700 ease-out p-1 ring-1 ring-white/5">
                {/* Fallback Mock UI directly */}
                <div className="bg-zinc-950 p-6 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div className="col-span-1 md:col-span-4 flex justify-between items-center mb-4">
                         <div className="flex gap-2">
                             <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"/>
                             <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"/>
                             <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"/>
                         </div>
                         <div className="bg-zinc-900 border border-white/5 px-3 py-1 rounded text-[10px] text-zinc-500 font-mono">app.leadts.com</div>
                     </div>
                     <div className="col-span-1 md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                         {[
                             { label: 'Total Revenue', val: '$45,231', col: 'text-white' },
                             { label: 'Leads', val: '142', col: 'text-white' },
                             { label: 'Sales', val: '18', col: 'text-green-400' },
                             { label: 'ROAS', val: '4.2x', col: 'text-primary-400' },
                         ].map((s, i) => (
                             <div key={i} className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                 <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{s.label}</div>
                                 <div className={`text-xl font-bold ${s.col}`}>{s.val}</div>
                             </div>
                         ))}
                     </div>
                     <div className="col-span-1 md:col-span-3 h-64 bg-zinc-900/50 rounded-xl border border-white/5 relative overflow-hidden">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[{v:30},{v:50},{v:45},{v:70},{v:60},{v:90},{v:100}]}>
                                <defs>
                                    <linearGradient id="colorHero" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="v" stroke="#14b8a6" strokeWidth={3} fill="url(#colorHero)" />
                            </AreaChart>
                         </ResponsiveContainer>
                     </div>
                     <div className="col-span-1 h-64 bg-zinc-900/50 rounded-xl border border-white/5 p-4 space-y-3">
                         <div className="text-xs font-bold text-zinc-500 uppercase">Activity</div>
                         {[1,2,3,4].map(i => (
                             <div key={i} className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-full bg-zinc-800" />
                                 <div className="h-2 w-16 bg-zinc-800 rounded"/>
                             </div>
                         ))}
                     </div>
                </div>

                {/* Overlay CTA */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <Link to="/dashboard">
                    <GlassButton className="scale-125 shadow-2xl">Enter Live Demo</GlassButton>
                    </Link>
                </div>
            </div>
            
            {/* Reflection Effect */}
            <div className="absolute -bottom-20 left-4 right-4 h-20 bg-gradient-to-b from-primary-500/10 to-transparent blur-3xl opacity-30 pointer-events-none" />
        </div>
      </section>

      {/* --- WHY LEADTS (Comparison) --- */}
      <section className="py-24 px-6 relative bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" ref={comparisonRef}>
          <SectionSeparator />
          <div className={`max-w-6xl mx-auto transition-all duration-1000 ${comparisonVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Why LeadTS?</h2>
                  <p className="text-zinc-400 max-w-2xl mx-auto">LeadTS makes your clients better — so you keep clients longer.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Without */}
                  <GlassCard className="p-8 border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40 group hover:bg-rose-500/10 transition-colors">
                      <div className="flex items-center gap-3 mb-6">
                          <XCircle className="w-8 h-8 text-rose-500 group-hover:scale-110 transition-transform" />
                          <h3 className="text-xl font-bold text-white">Without LeadTS</h3>
                      </div>
                      <ul className="space-y-4 text-zinc-400">
                          <li className="flex items-start gap-3"><XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 opacity-70" /> Leads land in email inboxes & get lost</li>
                          <li className="flex items-start gap-3"><XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 opacity-70" /> Customers forget to call → You take the blame</li>
                          <li className="flex items-start gap-3"><XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 opacity-70" /> No revenue visibility, only vanity metrics</li>
                          <li className="flex items-start gap-3"><XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 opacity-70" /> Low trust → High churn</li>
                      </ul>
                  </GlassCard>

                  {/* With */}
                  <GlassCard className="p-8 border-primary-500/20 bg-primary-500/5 hover:border-primary-500/40 group hover:bg-primary-500/10 transition-colors">
                      <div className="flex items-center gap-3 mb-6">
                          <CheckCircle2 className="w-8 h-8 text-primary-500 group-hover:scale-110 transition-transform" />
                          <h3 className="text-xl font-bold text-white">With LeadTS</h3>
                      </div>
                      <ul className="space-y-4 text-zinc-300">
                          <li className="flex items-start gap-3"><Check className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" /> Leads instantly in one clean pipeline</li>
                          <li className="flex items-start gap-3"><Check className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" /> Every lead status tracked → nothing falls through</li>
                          <li className="flex items-start gap-3"><Check className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" /> Sales metrics that prove your value</li>
                          <li className="flex items-start gap-3"><Check className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" /> Clients see you deliver → you keep the contract</li>
                      </ul>
                  </GlassCard>
              </div>
          </div>
      </section>

      {/* --- FEATURE: PIPELINE --- */}
      <section id="features" className="py-24 px-6 border-t border-white/5 bg-zinc-950 relative" ref={pipelineRef}>
        <SectionSeparator />
        <div className={`max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center transition-all duration-1000 ${pipelineVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="space-y-6">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <LayoutDashboard className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold">Deal pipelines built for people who hate CRMs.</h2>
                <p className="text-lg text-zinc-400 leading-relaxed">
                    Stop losing leads in messy tables. Drag-and-drop deals through customizable stages and see your revenue update in real time.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="p-3 rounded-lg bg-zinc-900 border border-white/5">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 mb-2" />
                        <div className="font-bold text-white text-sm">Drag & Drop</div>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900 border border-white/5">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 mb-2" />
                        <div className="font-bold text-white text-sm">Instant Calculations</div>
                    </div>
                </div>
            </div>
            <div className="relative group perspective-1000">
                <div className="absolute inset-0 bg-blue-500/10 blur-[100px] -z-10 transition-opacity duration-700 group-hover:opacity-75" />
                <div className="rounded-2xl border border-white/10 bg-zinc-950 p-2 shadow-2xl rotate-2 group-hover:rotate-0 transition-transform duration-500">
                    <MockPipeline />
                </div>
            </div>
        </div>
      </section>

      {/* --- FEATURE: PORTAL --- */}
      <section className="py-24 px-6 border-t border-white/5 bg-gradient-to-b from-zinc-950 to-zinc-900" ref={portalRef}>
        <div className={`max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center transition-all duration-1000 ${portalVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative order-2 md:order-1 group">
                <div className="absolute inset-0 bg-purple-500/10 blur-[100px] -z-10 transition-opacity duration-700 group-hover:opacity-75" />
                <GlassCard className="p-6 relative z-10 -rotate-2 group-hover:rotate-0 transition-transform duration-500 border-white/10 bg-zinc-900/80">
                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                         <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/5" />
                             <div><div className="text-sm font-bold">Client View</div><div className="text-xs text-zinc-500">Acme Corp</div></div>
                         </div>
                         <Badge color="primary">Portal Mode</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-xl text-center"><div className="text-2xl font-bold text-white">142</div><div className="text-xs text-zinc-500 uppercase">Leads</div></div>
                        <div className="p-4 bg-zinc-50 dark:bg-white/5 rounded-xl text-center"><div className="text-2xl font-bold text-green-400">$12.5k</div><div className="text-xs text-zinc-500 uppercase">Revenue</div></div>
                    </div>
                    <div className="space-y-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-zinc-700" /><div className="h-2 w-24 bg-zinc-600 rounded" /></div>
                                <div className="h-2 w-12 bg-zinc-700 rounded" />
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
            
            <div className="space-y-6 order-1 md:order-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <Shield className="w-6 h-6 text-purple-500" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold">Transparency that makes you irreplaceable.</h2>
                <p className="text-lg text-zinc-400 leading-relaxed">
                    Clients log in — see their leads & performance — and understand your value instantly. Build trust → build retention → build revenue.
                </p>
                <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="w-5 h-5 text-purple-500" /> Custom branding & domain</li>
                    <li className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="w-5 h-5 text-purple-500" /> Show what matters — hide what doesn’t</li>
                    <li className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="w-5 h-5 text-purple-500" /> Every update in real-time</li>
                </ul>
            </div>
        </div>
      </section>

      {/* --- NEW: SLACK ACCOUNTABILITY --- */}
      <section className="py-32 px-6 border-t border-white/5 bg-zinc-950 relative overflow-hidden" ref={slackRef}>
          <SectionSeparator />
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          
          <div className={`max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center transition-all duration-1000 relative z-10 ${slackVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="space-y-8 order-2 md:order-1">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                      <MessageSquare className="w-6 h-6 text-green-500" />
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold">Stop hoping clients follow up. Make sure they do.</h2>
                  <p className="text-lg text-zinc-400 leading-relaxed">
                      LeadTS sends instant alerts via Slack so your clients respond immediately. No more lost leads in email inboxes.
                  </p>
                  
                  <div className="space-y-4">
                      <div className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-green-500/30 transition-colors"><Bell className="w-5 h-5 text-zinc-400 group-hover:text-green-400"/></div>
                          <div>
                              <h4 className="font-bold text-white group-hover:text-green-400 transition-colors">Instant Alerts</h4>
                              <p className="text-sm text-zinc-400">Leads hit Slack the second they sign up.</p>
                          </div>
                      </div>
                      <div className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-rose-500/30 transition-colors"><AlertCircle className="w-5 h-5 text-zinc-400 group-hover:text-rose-400"/></div>
                          <div>
                              <h4 className="font-bold text-white group-hover:text-rose-400 transition-colors">Follow-up Reminders</h4>
                              <p className="text-sm text-zinc-400">Automated nudges if a lead sits in "New" too long.</p>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="relative flex justify-center order-1 md:order-2 perspective-1000">
                  <div className="absolute inset-0 bg-green-500/10 blur-[100px] -z-10" />
                  <div className="animate-[float_6s_ease-in-out_infinite]">
                      <SlackNotificationCard />
                  </div>
              </div>
          </div>
      </section>

      {/* --- NEW: METHODOLOGY (3-Step How It Works) --- */}
      <section id="how-it-works" className="py-32 px-6 border-t border-white/5 bg-zinc-950" ref={methodRef}>
          <div className={`max-w-4xl mx-auto transition-all duration-1000 ${methodVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How it works</h2>
                  <p className="text-zinc-400">The proven system to convert traffic into revenue.</p>
              </div>

              <div className="space-y-12 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent opacity-20 hidden md:block" />

                  {[
                      { 
                          icon: <Workflow className="w-6 h-6 text-blue-400"/>, 
                          title: "1. Centralize", 
                          text: "Leads flow in from Meta, Webforms, or Webhooks instantly.",
                          bg: "bg-blue-500/10", border: "border-blue-500/20"
                      },
                      { 
                          icon: <MessageSquare className="w-6 h-6 text-green-400"/>, 
                          title: "2. Accountability", 
                          text: "Slack keeps clients accountable to act fast. No more 'I didn't see it'.",
                          bg: "bg-green-500/10", border: "border-green-500/20"
                      },
                      { 
                          icon: <TrendingUp className="w-6 h-6 text-purple-400"/>, 
                          title: "3. Optimize", 
                          text: "You optimize campaigns based on real revenue, not just clicks.",
                          bg: "bg-purple-500/10", border: "border-purple-500/20"
                      }
                  ].map((step, i) => (
                      <div key={i} className="flex gap-8 items-start group relative z-10">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border ${step.bg} ${step.border} shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-300`}>
                              {step.icon}
                          </div>
                          <div className="pt-2">
                              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">{step.title}</h3>
                              <p className="text-zinc-400 leading-relaxed max-w-lg">{step.text}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* --- INTEGRATIONS --- */}
      <section id="integrations" className="py-32 px-6 border-t border-white/5 bg-zinc-950 overflow-hidden" ref={integrationsRef}>
          <SectionSeparator />
          <div className={`max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center transition-all duration-1000 ${integrationsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              <div className="space-y-8 order-2 lg:order-1">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Workflow className="w-6 h-6 text-amber-500" />
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold leading-tight">Connect anything.<br/>Manage everything.</h2>
                  <p className="text-lg text-zinc-400 leading-relaxed">LeadTS ingests leads from any source via webhook: Meta Lead Ads, Webflow, WordPress, Shopify, Typeform & more.</p>
                  
                  <div className="bg-zinc-900 rounded-2xl border border-white/10 p-6 relative overflow-hidden group hover:border-primary-500/30 transition-colors">
                      <div className="absolute top-0 right-0 p-2 opacity-10"><Code2 className="w-20 h-20" /></div>
                      <h4 className="font-bold text-white mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Smart Mapping Engine</h4>
                      <div className="flex items-center gap-4 text-xs font-mono">
                          <div className="flex-1 bg-black/40 p-3 rounded-lg border border-white/5 text-zinc-500">
                              <div className="mb-1 text-red-400">{"{"}</div>
                              <div className="pl-2"><span className="text-blue-300">"q3_email"</span>: <span className="text-amber-200">"s@gmail.com"</span></div>
                              <div className="text-red-400">{"}"}</div>
                          </div>
                          <div className="text-zinc-600 animate-pulse"><ArrowRight className="w-5 h-5" /></div>
                          <div className="flex-1 bg-primary-900/10 p-3 rounded-lg border border-primary-500/20 text-white relative">
                              <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-0.5 border-2 border-zinc-900"><CheckCircle2 className="w-3 h-3 text-white"/></div>
                              <div className="mb-1 text-zinc-400 font-sans font-bold uppercase text-[10px]">CRM Lead</div>
                              <div className="flex items-center gap-2"><Globe className="w-3 h-3 text-blue-400"/> s@gmail.com</div>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="relative h-[500px] flex items-center justify-center order-1 lg:order-2 perspective-1000">
                  {/* Orbit Rings - 3D Effect */}
                  <div className="absolute w-[450px] h-[450px] rounded-full border border-white/5 animate-[spin-slow_25s_linear_infinite]" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(60deg)' }} />
                  <div className="absolute w-[350px] h-[350px] rounded-full border border-white/5 animate-[spin-slow_20s_linear_infinite_reverse]" style={{ transformStyle: 'preserve-3d', transform: 'rotateY(60deg)' }} />
                  <div className="absolute w-[250px] h-[250px] rounded-full border border-white/5 animate-[spin-slow_15s_linear_infinite]" />

                  {/* Core */}
                  <div className="relative z-20 w-24 h-24 bg-zinc-900 rounded-full border-4 border-zinc-800 shadow-[0_0_50px_rgba(20,184,166,0.3)] flex items-center justify-center">
                      <Globe className="w-10 h-10 text-primary-500 animate-pulse" />
                  </div>

                  {/* Orbiting Icons (Swarm) */}
                  {[
                      { Icon: LayoutDashboard, color: 'text-blue-400', label: 'Webflow', delay: '0s', orbit: 'orbit-1' },
                      { Icon: ShoppingBag, color: 'text-green-400', label: 'Shopify', delay: '-5s', orbit: 'orbit-2' },
                      { Icon: Linkedin, color: 'text-blue-600', label: 'LinkedIn', delay: '-2s', orbit: 'orbit-3' },
                      { Icon: FileText, color: 'text-zinc-200', label: 'Typeform', delay: '-8s', orbit: 'orbit-1' },
                      { Icon: Sheet, color: 'text-green-500', label: 'Excel', delay: '-12s', orbit: 'orbit-2' },
                      { Icon: Instagram, color: 'text-pink-500', label: 'IG', delay: '-15s', orbit: 'orbit-3' },
                      { Icon: Mail, color: 'text-yellow-500', label: 'Email', delay: '-3s', orbit: 'orbit-2' },
                      { Icon: Smartphone, color: 'text-purple-400', label: 'SMS', delay: '-9s', orbit: 'orbit-1' },
                  ].map((item, i) => (
                      <div 
                        key={i}
                        className="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6 flex items-center justify-center bg-zinc-900 border border-white/10 rounded-xl shadow-lg z-10"
                        style={{
                            animation: `${item.orbit} 20s linear infinite`,
                            animationDelay: item.delay
                        }}
                      >
                          <item.Icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                  ))}

                  {/* Data Packets */}
                  {[1,2,3,4,5,6].map(i => (
                      <div 
                        key={i} 
                        className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-primary-400 rounded-full shadow-[0_0_10px_#2dd4bf] z-0" 
                        style={{ 
                            animation: `packet-flow 3s ease-in infinite`, 
                            animationDelay: `${i * 0.5}s`, 
                            transformOrigin: '0 0' 
                        }} 
                      />
                  ))}
              </div>
          </div>
      </section>

      {/* --- META CAPI --- */}
      <section id="capi" className="py-32 px-6 border-t border-white/5 bg-zinc-900 text-white overflow-hidden relative" ref={metaRef}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className={`max-w-7xl mx-auto text-center space-y-12 transition-all duration-1000 ${metaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
             <div className="max-w-3xl mx-auto space-y-6">
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold tracking-wider uppercase mb-2">
                    <Zap className="w-4 h-4 fill-blue-500" /> Meta Conversion API
                 </div>
                 <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                    Feed the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Algorithm</span>.
                 </h2>
                 <p className="text-lg text-zinc-400 leading-relaxed">
                    LeadTS sends server-side sales signals back to Meta to improve campaign performance. Bidirectional sync = Better results with less spend.
                 </p>
             </div>
             
             {/* Data Flow Animation */}
             <div className="relative py-16">
                 <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-24">
                     
                     {/* Meta Node */}
                     <div className="relative z-10 p-6 bg-zinc-900 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-4 w-48">
                        <div className="w-16 h-16 rounded-full bg-[#0668E1] flex items-center justify-center shadow-lg shadow-blue-600/30">
                            <MetaLogo className="w-8 h-8 text-white" />
                        </div>
                        <div className="font-bold text-zinc-200">Meta Ads</div>
                     </div>

                     {/* Connection Lines */}
                     <div className="relative w-full md:w-64 h-24 md:h-2 flex items-center justify-center">
                         <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-primary-500/20 rounded-full" />
                         
                         {/* Leads -> CRM */}
                         <div className="absolute w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6] animate-[moveRight_2s_linear_infinite]" style={{ top: '50%', transform: 'translateY(-50%)' }} />
                         
                         {/* Events -> Meta */}
                         <div className="absolute w-3 h-3 bg-green-400 rounded-full shadow-[0_0_15px_#4ade80] animate-[moveLeft_2s_linear_infinite]" style={{ top: '50%', transform: 'translateY(-50%)', animationDelay: '1s' }} />
                         
                         <div className="absolute -top-8 text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-black/50 px-2 py-1 rounded backdrop-blur">Bidirectional Sync</div>
                     </div>

                     {/* LeadTS Node */}
                     <div className="relative z-10 p-6 bg-zinc-900 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-4 w-48 border-t-4 border-t-primary-500">
                        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center relative"><div className="absolute inset-0 bg-primary-500/20 animate-pulse rounded-full" /><Globe className="w-8 h-8 text-primary-500" /></div>
                        <div className="font-bold text-zinc-200">LeadTS CRM</div>
                     </div>
                 </div>
                 
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-24 md:mt-28">
                     <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-green-500/30 rounded-xl text-green-400 text-xs font-mono font-bold shadow-xl shadow-green-900/10">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> SERVER-SIDE TRACKING ACTIVE
                     </div>
                 </div>
             </div>
          </div>
      </section>

      {/* --- NEW: REVIEWS (Added Back) --- */}
      <section className="py-32 px-6 border-t border-white/5 bg-zinc-950 relative overflow-hidden" ref={reviewsRef}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
          
          <div className={`max-w-7xl mx-auto transition-all duration-1000 ${reviewsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              <div className="text-center mb-16 space-y-4">
                  <h2 className="text-3xl md:text-5xl font-bold text-white">Trusted by High-Performers</h2>
                  <p className="text-zinc-400 max-w-2xl mx-auto">Agencies and local businesses use LeadTS to stop guessing and start scaling.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <ReviewCard 
                    name="Alex Hormozi" 
                    role="Founder" 
                    company="GymLaunch" 
                    image="https://ui-avatars.com/api/?name=Alex+Hormozi&background=random" 
                    text="Finally a CRM that focuses on what matters: Revenue. My clients actually use this because it's simple and the Slack alerts are a game changer."
                  />
                  <ReviewCard 
                    name="Sarah Jenkins" 
                    role="Owner" 
                    company="Prestige Auto" 
                    image="https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random" 
                    text="We used to lose leads in email chains. Now my sales team gets a Slack ping, calls instantly, and we track every dollar. ROI went up 3x."
                  />
                  <ReviewCard 
                    name="Marcus Weber" 
                    role="CEO" 
                    company="Weber Media" 
                    image="https://ui-avatars.com/api/?name=Marcus+Weber&background=random" 
                    text="The white-label portal makes us look like a million-dollar agency. Clients log in, see their leads, and stop asking 'where is my money going?'."
                  />
                  <ReviewCard 
                    name="Elena Rodriguez" 
                    role="Marketing Dir." 
                    company="Smile Dental" 
                    image="https://ui-avatars.com/api/?name=Elena+Rodriguez&background=random" 
                    text="Direct Meta sync + Server-side tracking meant our ad targeting got smarter within weeks. Lead quality improved significantly."
                  />
              </div>
          </div>
      </section>

      {/* --- NEW: PRIVACY & SECURITY --- */}
      <section className="py-24 px-6 border-t border-white/5 bg-zinc-950 relative overflow-hidden" ref={privacyRef}>
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950 to-zinc-950 pointer-events-none" />
         
         <div className={`max-w-7xl mx-auto relative z-10 transition-all duration-1000 ${privacyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="text-center mb-16">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 mb-4 shadow-lg">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span>Enterprise Grade Protection</span>
               </div>
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Uncompromising Security.<br/>Made in Germany.</h2>
               <p className="text-zinc-400 max-w-2xl mx-auto">
                  Your data privacy is not a feature, it's our foundation. We host strictly on ISO-certified servers in Frankfurt.
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Card 1 */}
               <GlassCard className="p-8 flex flex-col items-center text-center gap-4 hover:bg-zinc-900/80 transition-colors border-zinc-800">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5 text-white shadow-inner">
                     <Server className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Hosted in Frankfurt</h3>
                  <p className="text-sm text-zinc-400">Data never leaves Germany. Hosted on high-performance, carbon-neutral AWS Frankfurt servers.</p>
               </GlassCard>
               
               {/* Card 2 */}
               <GlassCard className="p-8 flex flex-col items-center text-center gap-4 hover:bg-zinc-900/80 transition-colors border-zinc-800">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5 text-white shadow-inner">
                     <Database className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">100% GDPR Compliant</h3>
                  <p className="text-sm text-zinc-400">Built with privacy by design. Full data processing agreements (AVV) available for all agency plans.</p>
               </GlassCard>

               {/* Card 3 */}
               <GlassCard className="p-8 flex flex-col items-center text-center gap-4 hover:bg-zinc-900/80 transition-colors border-zinc-800">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/5 text-white shadow-inner">
                     <Key className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Bank-Level Encryption</h3>
                  <p className="text-sm text-zinc-400">AES-256 encryption at rest and TLS 1.3 in transit. Your client data is locked tight.</p>
               </GlassCard>
            </div>
         </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-32 px-6 border-t border-white/5 bg-zinc-950" ref={pricingRef}>
         <SectionSeparator />
         <div className={`max-w-6xl mx-auto transition-all duration-1000 ${pricingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white">Simple. Transparent. Scalable.</h2>
                <p className="text-xl text-zinc-400">Choose the plan that fits your business stage.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                
                {/* PLAN 1: LOCAL BUSINESS */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-500" />
                    <div className="relative p-10 bg-zinc-900 rounded-[2.5rem] border border-white/10 h-full flex flex-col hover:border-zinc-500/30 transition-colors">
                        <div className="mb-6">
                            <Badge color="zinc"><span className="px-2 uppercase tracking-wider text-xs font-bold">Local Business Edition</span></Badge>
                            <h3 className="text-3xl font-bold text-white mt-4">Solo Version</h3>
                            <p className="text-zinc-400 text-sm mt-2">Perfect for owners managing their own leads.</p>
                        </div>
                        
                        <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-bold text-white">€29</span>
                                <span className="text-zinc-500 font-medium">/mo</span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-2">Pause or cancel anytime.</p>
                        </div>

                        <div className="space-y-4 flex-1 border-t border-white/5 pt-8">
                            <div className="flex items-center gap-3 text-zinc-300">
                                <div className="p-1 rounded-full bg-zinc-800 text-white"><Users className="w-3 h-3" /></div>
                                <span className="font-medium">1 Admin User</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-300">
                                <div className="p-1 rounded-full bg-zinc-800 text-white"><CheckCircle2 className="w-3 h-3" /></div>
                                <span className="font-medium">Unlimited Leads</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-300">
                                <div className="p-1 rounded-full bg-zinc-800 text-white"><Zap className="w-3 h-3" /></div>
                                <span className="font-medium">Direct Meta Sync</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-500 line-through decoration-zinc-600 opacity-50">
                                <div className="p-1 rounded-full bg-zinc-800/50"><Lock className="w-3 h-3" /></div>
                                <span className="font-medium">White-Label Portal</span>
                            </div>
                        </div>

                        <Link to="/dashboard" className="mt-8">
                            <button className="w-full py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm border border-white/10 transition-all hover:scale-[1.02]">
                                Get Started
                            </button>
                        </Link>
                    </div>
                </div>

                {/* PLAN 2: AGENCY (Essential) */}
                <div className="relative group transform md:-translate-y-4">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-[2.5rem] blur opacity-40 group-hover:opacity-60 transition duration-500" />
                    
                    <div className="relative p-10 bg-zinc-900 rounded-[2.5rem] border border-white/10 h-full flex flex-col shadow-2xl">
                        <div className="mb-6">
                            <Badge color="primary"><span className="px-2 uppercase tracking-wider text-xs font-bold">Most Popular</span></Badge>
                            <h3 className="text-3xl font-bold text-white mt-4">Agency Starter</h3>
                            <p className="text-zinc-400 text-sm mt-2">Manage leads together with your clients.</p>
                        </div>
                        
                        <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-bold text-white">€65</span>
                                <span className="text-zinc-500 font-medium">/mo</span>
                            </div>
                            <div className="text-xs text-primary-400 bg-primary-500/10 px-3 py-1.5 rounded-full inline-block font-medium mt-3 border border-primary-500/20">
                                Just €13.00 per client slot
                            </div>
                        </div>

                        <div className="space-y-4 flex-1 border-t border-white/5 pt-8">
                             <div className="flex items-center gap-3 text-white">
                                <div className="p-1 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/30"><CheckCircle2 className="w-3 h-3" /></div>
                                <span className="font-bold">5 Client Slots Included</span>
                            </div>
                             <div className="flex items-center gap-3 text-zinc-300">
                                <div className="p-1 rounded-full bg-primary-500/20 text-primary-500"><CheckCircle2 className="w-3 h-3" /></div>
                                <span className="font-medium">Unlimited Leads & Campaigns</span>
                            </div>
                             <div className="flex items-center gap-3 text-zinc-300">
                                <div className="p-1 rounded-full bg-primary-500/20 text-primary-500"><Shield className="w-3 h-3" /></div>
                                <span className="font-medium">Full White-Label Branding</span>
                            </div>
                             <div className="flex items-center gap-3 text-zinc-300">
                                <div className="p-1 rounded-full bg-primary-500/20 text-primary-500"><Users className="w-3 h-3" /></div>
                                <span className="font-medium">Mobile Client Portals</span>
                            </div>
                        </div>

                        <Link to="/dashboard" className="mt-8">
                            <button className="w-full py-4 rounded-2xl bg-primary-500 hover:bg-primary-400 text-white font-bold text-lg shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-1 hover:shadow-primary-500/40">
                                Start Agency Trial
                            </button>
                        </Link>
                        <p className="text-[10px] text-zinc-500 mt-4 text-center">14-day money-back guarantee.</p>
                    </div>
                </div>

            </div>
         </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-24 px-6 border-t border-white/5 bg-zinc-950" ref={faqRef}>
          <div className={`max-w-3xl mx-auto transition-all duration-1000 ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h2 className="text-3xl font-bold text-white mb-10 text-center">Frequently Asked Questions</h2>
              <div className="space-y-2">
                  <FaqItem question="How fast can I get started?" answer="In minutes. Connect Meta → leads flow instantly. We built LeadTS for speed." />
                  <FaqItem question="Do my clients need training?" answer="No. They already know how to use a phone. We built LeadTS for the real world, not for tech teams." />
                  <FaqItem question="How do I track revenue and results?" answer="Full visibility into leads, calls, appointments & sales. No more 'We called them all' stories." />
                  <FaqItem question="What if my client doesn’t follow up?" answer="You see exactly what happens via the pipeline and Slack alerts. Accountability = retention." />
                  <FaqItem question="Do you integrate with other tools?" answer="Yes. LeadTS works on its own but is forever extendable with Webhooks and APIs." />
                  <FaqItem question="Is this white-label?" answer="Yes. Your brand, your story, your client success. They see your logo, not ours." />
              </div>
          </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-32 px-6 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-primary-900/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="relative max-w-4xl mx-auto text-center space-y-8 bg-zinc-900/80 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] shadow-2xl">
            <Zap className="w-16 h-16 text-primary-400 mx-auto fill-primary-400/20" />
            <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight">You bring the leads. <br/> We make sure they become business.</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                 <Link to="/dashboard"><button className="px-12 py-5 rounded-2xl bg-white text-zinc-950 font-bold text-xl hover:bg-zinc-200 transition-colors shadow-xl hover:scale-105 transform duration-200">Start Free</button></Link>
                 <button className="px-12 py-5 rounded-2xl bg-transparent border border-white/10 text-white font-bold text-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2"><Play className="w-5 h-5"/> Watch Demo</button>
            </div>
            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-zinc-500 font-medium">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary-500"/> No credit card required</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary-500"/> Live in minutes</span>
            </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative bg-zinc-950 pt-24 pb-12 border-t border-white/5 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary-900/10 blur-[120px] rounded-full pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="space-y-6">
                  <div className="flex items-center gap-2">
                      {renderLogo("w-8 h-8")}
                      <span className="text-xl font-bold text-white tracking-tight">LeadTS</span>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">LeadTS gives you what every agent dreams of: Clients who take action. Results you can prove.</p>
                  <div className="flex gap-4">{['Twitter', 'GitHub', 'LinkedIn'].map(social => (<a key={social} href="#" className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:border-primary-500/50 transition-all"><span className="sr-only">{social}</span><div className="w-4 h-4 bg-current rounded-sm" /></a>))}</div>
              </div>
              <div><h4 className="font-bold text-white mb-6">Product</h4><ul className="space-y-4 text-sm text-zinc-400"><li><a href="#features" className="hover:text-primary-400 transition-colors">Features</a></li><li><a href="#method" className="hover:text-primary-400 transition-colors">Methodology</a></li><li><a href="#pricing" className="hover:text-primary-400 transition-colors">Pricing</a></li></ul></div>
              <div><h4 className="font-bold text-white mb-6">Company</h4><ul className="space-y-4 text-sm text-zinc-400"><li><a href="#" className="hover:text-primary-400 transition-colors">About</a></li><li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li><li><a href="#" className="hover:text-primary-400 transition-colors">Privacy</a></li></ul></div>
              <div>
                  <h4 className="font-bold text-white mb-6">Stay Updated</h4>
                  <p className="text-xs text-zinc-500 mb-4">Join 2,000+ agency owners getting our weekly tips.</p>
                  <div className="flex gap-2"><div className="relative flex-1"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" /><input type="email" placeholder="Enter email" className="bg-zinc-900 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500 w-full placeholder:text-zinc-600" /></div><button className="bg-primary-500 hover:bg-primary-400 text-white rounded-lg px-3 py-2 transition-colors"><ArrowRight className="w-4 h-4" /></button></div>
              </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500"><p>&copy; 2024 LeadTS Inc. All rights reserved.</p></div>
      </footer>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes moveRight { 0% { left: 0; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { left: 100%; opacity: 0; } }
        @keyframes moveLeft { 0% { left: 100%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { left: 0; opacity: 0; } }
        @keyframes spin-slow { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes packet-flow { 0% { transform: translate(-50%, -50%) rotate(0deg) translateX(200px) scale(0); opacity: 0; } 10% { opacity: 1; scale: 1; } 100% { transform: translate(-50%, -50%) rotate(120deg) translateX(40px) scale(0.5); opacity: 0; } }
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
        @keyframes orbit-1 { 
            0% { transform: rotateZ(0deg) translateX(180px) rotateZ(0deg) rotateY(0deg); }
            100% { transform: rotateZ(360deg) translateX(180px) rotateZ(-360deg) rotateY(0deg); }
        }
        @keyframes orbit-2 { 
            0% { transform: rotateZ(120deg) translateX(130px) rotateZ(-120deg); }
            100% { transform: rotateZ(480deg) translateX(130px) rotateZ(-480deg); }
        }
        @keyframes orbit-3 { 
            0% { transform: rotateZ(240deg) translateX(200px) rotateZ(-240deg); }
            100% { transform: rotateZ(600deg) translateX(200px) rotateZ(-600deg); }
        }
      `}} />
    </div>
  );
};
