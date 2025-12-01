




import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from '../components/Layout';
import { 
    ArrowRight, BarChart3, Shield, Zap, CheckCircle2, Globe, LayoutDashboard, 
    ChevronRight, Play, Users, DollarSign, TrendingUp, MoreHorizontal, 
    Workflow, Code2, Mail, XCircle, ChevronDown, Check, 
    Briefcase, Utensils, Sparkles, Activity, MessageSquare, 
    Bell, AlertCircle, Lock, Wrench, Car, ShoppingBag, Server, Flag, Database, Key,
    Linkedin, Instagram, Sheet, FileText, Smartphone, Star, CreditCard,
    Dumbbell, Stethoscope, Home, Scissors, Hammer, Layers
} from 'lucide-react';
import { GlassButton, GlassCard, Badge } from '../components/ui/Glass';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { getWorkspaceSettings } from '../services/dataService';
import { WorkspaceSettings } from '../types';

// --- BRAND ICONS ---

const SlackLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 127 127" xmlns="http://www.w3.org/2000/svg">
        <path fill="#E01E5A" d="M29.6 22.8c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v13.2H42.8c-7.3 0-13.2-5.9-13.2-13.2zm17.6 13.2c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h13.2v13.2z"/>
        <path fill="#36C5F0" d="M29.6 84.4c-7.3 0-13.2 5.9-13.2 13.2 0 7.3 5.9 13.2 13.2 13.2 7.3 0 13.2-5.9 13.2-13.2V84.4H29.6zm13.2-17.6c-7.3 0-13.2 5.9-13.2 13.2 0 7.3 5.9 13.2 13.2 13.2 13.2V66.8h-13.2c7.3 0 13.2-5.9 13.2-13.2 0-7.3-5.9-13.2-13.2-13.2H42.8z"/>
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

const SectionSeparator = () => (
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />
);

// --- COMPONENTS ---

const VerticalCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: string }) => (
    <div 
        className="relative p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-md shadow-2xl group hover:-translate-y-2 transition-all duration-500"
        style={{ animationDelay: delay }}
    >
        {/* Glow Gradient on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-primary-500/10 group-hover:border-primary-500/20 transition-colors">
                <Icon className="w-7 h-7 text-zinc-300 group-hover:text-primary-500 transition-colors" />
            </div>
            
            <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
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
                            <span className="text-zinc-400">Status:</span> 🚨 Needs Call
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
                <MockKanbanCard title="John Doe" value="Interested" stage="New" color="bg-blue-500/20 text-blue-400" />
            </div>
            <MockKanbanCard title="Sarah Smith" value="Quote Req" stage="New" color="bg-blue-500/20 text-blue-400" />
        </div>
         <div className="space-y-3 pt-8">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Appt</span>
            </div>
            <MockKanbanCard title="Mike Ross" value="$1.5k" stage="Booked" color="bg-purple-500/20 text-purple-400" />
        </div>
         <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Won</span>
            </div>
            <div className="animate-[float_5s_ease-in-out_infinite]">
                <MockKanbanCard title="Emily Blunt" value="$5k" stage="Won" color="bg-green-500/20 text-green-400" />
            </div>
        </div>
    </div>
);

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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const navigate = useNavigate();
  
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
  const [verticalsRef, verticalsVisible] = useScrollReveal(0.1);
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

  // Pricing Calculations
  const SOLO_PRICE = billingCycle === 'yearly' ? 29 : 35;
  const AGENCY_PRICE = billingCycle === 'yearly' ? 65 : 78;
  
  // Explicitly navigate to auth
  const handleCtaClick = () => {
      navigate('/auth');
  };

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
            <GlassButton 
                onClick={handleCtaClick}
                className="shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 border-primary-500/50 bg-primary-500 hover:bg-primary-400 text-white"
            >
                Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
            </GlassButton>
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
                
                {/* Headline */}
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-white drop-shadow-2xl">
                    The Performance CRM for <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-teal-200 to-purple-400 animate-gradient-x">Real Local Revenue.</span>
                </h1>
                
                <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed pt-4 font-medium">
                    Leads are not the goal. Appointments & Sales are.<br/>
                    <span className="text-zinc-500 font-normal">LeadTS turns marketing results into business results — by making sure every lead gets contacted, booked, and closed.</span>
                </p>

                {/* Vertical Ticker */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <span className="text-sm font-semibold text-white mr-2">👉 Designed for Local Service Sales:</span>
                    {['Fitness', 'Beauty', 'Clinics', 'Auto', 'Trades', 'Real Estate', 'Repair'].map(v => (
                        <span key={v} className="px-3 py-1 rounded-full bg-zinc-900 border border-white/10 text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                            {v}
                        </span>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8">
                    <button 
                        onClick={handleCtaClick}
                        className="px-10 py-4 rounded-2xl bg-primary-500 hover:bg-primary-400 text-white font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(20,184,166,0.5)] hover:shadow-[0_0_60px_-15px_rgba(20,184,166,0.6)] hover:-translate-y-1 flex items-center gap-2 border border-primary-400 relative overflow-hidden group"
                    >
                        <span className="relative z-10 flex items-center gap-2">Start Free Trial <ChevronRight className="w-5 h-5" /></span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </button>
                    <button 
                        onClick={handleCtaClick}
                        className="px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg transition-all flex items-center gap-2 group backdrop-blur-md"
                    >
                        <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" /> Watch Live Demo
                    </button>
                </div>
                
                <div className="flex items-center justify-center gap-6 pt-6 text-xs text-zinc-500 font-medium uppercase tracking-wide">
                    <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-primary-500"/> No credit card required</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-primary-500"/> Live in minutes</span>
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
                         <div className="bg-zinc-900 border border-white/5 px-3 py-1 rounded text-[10px] text-zinc-500 font-mono">Live Performance Dashboard</div>
                     </div>
                     <div className="col-span-1 md:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                         {[
                             { label: 'Total Revenue', val: '$45,231', col: 'text-white' },
                             { label: 'Booked Appointments', val: '142', col: 'text-white' },
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
                         <div className="text-xs font-bold text-zinc-500 uppercase">Live Activity</div>
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
                    <GlassButton onClick={handleCtaClick} className="scale-125 shadow-2xl">Enter Live Demo</GlassButton>
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
                  <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Your ads work. Your clients just don’t always follow up. We fix that.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Without */}
                  <GlassCard className="p-8 border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40 group hover:bg-rose-500/10 transition-colors">
                      <div className="flex items-center gap-3 mb-6">
                          <XCircle className="w-8 h-8 text-rose-500 group-hover:scale-110 transition-transform" />
                          <h3 className="text-xl font-bold text-white">Without LeadTS</h3>
                      </div>
                      <ul className="space-y-4 text-zinc-400">
                          <li className="flex items-start gap-3"><XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 opacity-70" /> Leads lost in email inboxes</li>
                          <li className="flex items-start gap-3"><XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 opacity-70" /> Clients forget to call → you take the blame</li>
                          <li className="flex items-start gap-3"><XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 opacity-70" /> “We got clicks… what now?”</li>
                          <li className="flex items-start gap-3"><XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 opacity-70" /> Churn because clients don’t see value</li>
                      </ul>
                  </GlassCard>

                  {/* With */}
                  <GlassCard className="p-8 border-primary-500/20 bg-primary-500/5 hover:border-primary-500/40 group hover:bg-primary-500/10 transition-colors">
                      <div className="flex items-center gap-3 mb-6">
                          <CheckCircle2 className="w-8 h-8 text-primary-500 group-hover:scale-110 transition-transform" />
                          <h3 className="text-xl font-bold text-white">With LeadTS</h3>
                      </div>
                      <ul className="space-y-4 text-zinc-300">
                          <li className="flex items-start gap-3"><Check className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" /> Leads delivered directly into a clean pipeline</li>
                          <li className="flex items-start gap-3"><Check className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" /> Instant follow-up alerts → clients take action</li>
                          <li className="flex items-start gap-3"><Check className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" /> Revenue clarity for every campaign</li>
                          <li className="flex items-start gap-3"><Check className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" /> High retention → High margins</li>
                      </ul>
                  </GlassCard>
              </div>
              
              <div className="text-center mt-12 text-zinc-300 font-medium">
                  LeadTS makes your clients close more deals → so you keep clients longer.
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
                <h2 className="text-3xl md:text-5xl font-bold">Pipelines built for sales — not for CRM nerds.</h2>
                <p className="text-lg text-zinc-400 leading-relaxed">
                    Drag new leads into Appointment and watch revenue projections update instantly.
                </p>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Custom stages & colors</div>
                    <div className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Revenue per stage</div>
                    <div className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="w-5 h-5 text-blue-500" /> Zero training required</div>
                </div>
                <div className="pt-4 text-blue-400 font-bold flex items-center gap-2">
                    → Because local teams want fast. Not complicated.
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
                <h2 className="text-3xl md:text-5xl font-bold">Transparency that Wins Trust</h2>
                <p className="text-lg text-zinc-400 leading-relaxed">
                    Clients get their own login. They see leads. They see wins. They understand your value instantly.
                </p>
                <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="w-5 h-5 text-purple-500" /> White-label branding & custom domain</li>
                    <li className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="w-5 h-5 text-purple-500" /> Show only the metrics that matter</li>
                    <li className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="w-5 h-5 text-purple-500" /> Everything updates live while they work</li>
                </ul>
            </div>
        </div>
      </section>

      {/* --- FEATURE: SLACK --- */}
      <section className="py-32 px-6 border-t border-white/5 bg-zinc-950 relative overflow-hidden" ref={slackRef}>
          <SectionSeparator />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          
          <div className={`max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center transition-all duration-1000 relative z-10 ${slackVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="space-y-8 order-2 md:order-1">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                      <MessageSquare className="w-6 h-6 text-green-500" />
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold">Stop hoping they follow up. Make it happen.</h2>
                  <p className="text-lg text-zinc-400 leading-relaxed">
                      Slack alerts turn leads into conversations right now.
                  </p>
                  
                  <div className="space-y-4">
                      <div className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-green-500/30 transition-colors"><Bell className="w-5 h-5 text-zinc-400 group-hover:text-green-400"/></div>
                          <div>
                              <h4 className="font-bold text-white group-hover:text-green-400 transition-colors">Instant new lead pings</h4>
                          </div>
                      </div>
                      <div className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-rose-500/30 transition-colors"><AlertCircle className="w-5 h-5 text-zinc-400 group-hover:text-rose-400"/></div>
                          <div>
                              <h4 className="font-bold text-white group-hover:text-rose-400 transition-colors">Follow-up reminders if untouched</h4>
                          </div>
                      </div>
                      <div className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-blue-500/30 transition-colors"><Smartphone className="w-5 h-5 text-zinc-400 group-hover:text-blue-400"/></div>
                          <div>
                              <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">One tap → “Call Now”</h4>
                          </div>
                      </div>
                  </div>
                  <div className="font-bold text-green-400 pt-2">More speed = More appointments = More sales</div>
              </div>

              <div className="relative flex justify-center order-1 md:order-2 perspective-1000">
                  <div className="absolute inset-0 bg-green-500/10 blur-[100px] -z-10" />
                  <div className="animate-[float_6s_ease-in-out_infinite]">
                      <SlackNotificationCard />
                  </div>
              </div>
          </div>
      </section>

      {/* --- METHODOLOGY (3-Step How It Works) --- */}
      <section id="how-it-works" className="py-32 px-6 border-t border-white/5 bg-zinc-950" ref={methodRef}>
          <div className={`max-w-4xl mx-auto transition-all duration-1000 ${methodVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How it works — The Revenue Machine</h2>
              </div>

              <div className="space-y-12 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent opacity-20 hidden md:block" />

                  {[
                      { 
                          icon: <Workflow className="w-6 h-6 text-blue-400"/>, 
                          title: "1. Centralize", 
                          text: "All leads flow into LeadTS from Meta, Funnels, Webhooks",
                          bg: "bg-blue-500/10", border: "border-blue-500/20"
                      },
                      { 
                          icon: <MessageSquare className="w-6 h-6 text-green-400"/>, 
                          title: "2. Accountability", 
                          text: "Slack ensures lightning-fast follow-ups",
                          bg: "bg-green-500/10", border: "border-green-500/20"
                      },
                      { 
                          icon: <TrendingUp className="w-6 h-6 text-purple-400"/>, 
                          title: "3. Optimize", 
                          text: "You scale campaigns based on offline revenue, not vanity metrics",
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
                  <p className="text-lg text-zinc-400 leading-relaxed">
                      LeadTS ingests leads from:
                      <br/>
                      Meta Lead Ads, Webflow, WordPress, Shopify, Typeform, Webhook sources.
                  </p>
                  
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-amber-500/30 rounded-xl text-amber-400 text-sm font-bold shadow-xl shadow-amber-900/10">
                        <Zap className="w-4 h-4 text-amber-500" /> Future-proof: No Zapier required.
                  </div>
              </div>

              <div className="relative h-[400px] flex items-center justify-center order-1 lg:order-2 perspective-1000">
                  <div className="absolute w-[350px] h-[350px] rounded-full border border-white/5 animate-[spin-slow_20s_linear_infinite_reverse]" />
                  <div className="relative z-20 w-24 h-24 bg-zinc-900 rounded-full border-4 border-zinc-800 shadow-[0_0_50px_rgba(20,184,166,0.3)] flex items-center justify-center">
                      <Globe className="w-10 h-10 text-primary-500 animate-pulse" />
                  </div>
                  {/* Icons */}
                  {[
                      { Icon: LayoutDashboard, color: 'text-blue-400', label: 'Webflow', delay: '0s', orbit: 'orbit-1' },
                      { Icon: ShoppingBag, color: 'text-green-400', label: 'Shopify', delay: '-5s', orbit: 'orbit-2' },
                      { Icon: Linkedin, color: 'text-blue-600', label: 'LinkedIn', delay: '-2s', orbit: 'orbit-3' },
                      { Icon: FileText, color: 'text-zinc-200', label: 'Typeform', delay: '-8s', orbit: 'orbit-1' },
                      { Icon: Sheet, color: 'text-green-500', label: 'Excel', delay: '-12s', orbit: 'orbit-2' },
                      { Icon: Instagram, color: 'text-pink-500', label: 'IG', delay: '-15s', orbit: 'orbit-3' },
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
                    Feed the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Algorithm</span> — automatically.
                 </h2>
                 <p className="text-lg text-zinc-400 leading-relaxed">
                    Server-side revenue + appointment signals sent back to Meta.
                 </p>
                 <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-zinc-300">
                     <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400"/> Better targeting</span>
                     <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400"/> Cheaper leads</span>
                     <span className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400"/> Higher quality demand</span>
                 </div>
                 <div className="text-blue-400 font-bold tracking-wide uppercase text-sm pt-2">Bidirectional sync = performance loop unlocked</div>
             </div>
          </div>
      </section>

      {/* --- VERTICALS / BUILT FOR LOCAL BUSINESS --- */}
      <section className="py-32 px-6 border-t border-white/5 bg-zinc-950 relative overflow-hidden" ref={verticalsRef}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary-500/20 to-transparent" />
          
          <div className={`max-w-7xl mx-auto transition-all duration-1000 ${verticalsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              <div className="text-center mb-16 space-y-4">
                  <h2 className="text-3xl md:text-5xl font-bold text-white">Built for Local Business Revenue</h2>
                  <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
                      Not SaaS leads. Not E-Commerce. Not theory.<br/>
                      Real offline revenue. Real customers.
                  </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  <VerticalCard icon={Dumbbell} title="Gyms" description="& Personal Training" delay="0s" />
                  <VerticalCard icon={Stethoscope} title="Clinics" description="& Dentists" delay="0.1s" />
                  <VerticalCard icon={Scissors} title="Beauty" description="& Aesthetics" delay="0.2s" />
                  <VerticalCard icon={Car} title="Auto" description="Sales & Repair" delay="0.3s" />
                  <VerticalCard icon={Hammer} title="Trades" description="Roofing, Plumbing" delay="0.4s" />
                  <VerticalCard icon={Home} title="Real Estate" description="& Construction" delay="0.5s" />
              </div>
          </div>
      </section>

      {/* --- SECURITY --- */}
      <section className="py-24 px-6 border-t border-white/5 bg-zinc-950 relative overflow-hidden" ref={privacyRef}>
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/20 via-zinc-950 to-zinc-950 pointer-events-none" />
         
         <div className={`max-w-7xl mx-auto relative z-10 transition-all duration-1000 ${privacyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="text-center mb-16">
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 mb-4 shadow-lg">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span>Made in Germany 🇩🇪 | GDPR as a core feature</span>
               </div>
               <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Enterprise-Grade Security</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <GlassCard className="p-6 text-center hover:bg-zinc-900/80 transition-colors border-zinc-800">
                  <Server className="w-8 h-8 text-zinc-400 mx-auto mb-4" />
                  <h3 className="font-bold text-white mb-2">Hosted in Frankfurt</h3>
                  <p className="text-xs text-zinc-500">Data never leaves DE/EU</p>
               </GlassCard>
               <GlassCard className="p-6 text-center hover:bg-zinc-900/80 transition-colors border-zinc-800">
                  <Key className="w-8 h-8 text-zinc-400 mx-auto mb-4" />
                  <h3 className="font-bold text-white mb-2">Bank-level encryption</h3>
                  <p className="text-xs text-zinc-500">Secure at rest & transit</p>
               </GlassCard>
               <GlassCard className="p-6 text-center hover:bg-zinc-900/80 transition-colors border-zinc-800">
                  <FileText className="w-8 h-8 text-zinc-400 mx-auto mb-4" />
                  <h3 className="font-bold text-white mb-2">Full AVV contracts</h3>
                  <p className="text-xs text-zinc-500">Ready for agencies</p>
               </GlassCard>
               <GlassCard className="p-6 text-center hover:bg-zinc-900/80 transition-colors border-zinc-800">
                  <Shield className="w-8 h-8 text-zinc-400 mx-auto mb-4" />
                  <h3 className="font-bold text-white mb-2">Zero-trust architecture</h3>
                  <p className="text-xs text-zinc-500">Maximum protection</p>
               </GlassCard>
            </div>
            
            <div className="text-center mt-12 text-zinc-400 font-medium">Your clients sleep well → so do you.</div>
         </div>
      </section>

      {/* --- PRICING --- */}
      <section id="pricing" className="py-32 px-6 border-t border-white/5 bg-zinc-950" ref={pricingRef}>
         <SectionSeparator />
         <div className={`max-w-6xl mx-auto transition-all duration-1000 ${pricingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white">Simple. Transparent. Scalable.</h2>
                <p className="text-xl text-zinc-400">Choose the plan that fits your business stage.</p>
                
                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 pt-4">
                    <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-zinc-500'}`}>Monthly</span>
                    <button 
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                        className="relative w-14 h-7 bg-zinc-800 rounded-full border border-white/10 transition-colors focus:outline-none"
                    >
                        <div className={`absolute top-1 left-1 w-5 h-5 bg-primary-500 rounded-full transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-7' : ''}`} />
                    </button>
                    <span className={`text-sm font-medium flex items-center gap-2 ${billingCycle === 'yearly' ? 'text-white' : 'text-zinc-500'}`}>
                        Yearly <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-bold uppercase">Save 20%</span>
                    </span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                
                {/* PLAN 1: LOCAL BUSINESS */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-zinc-700 to-zinc-800 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-500" />
                    <div className="relative p-10 bg-zinc-900 rounded-[2.5rem] border border-white/10 h-full flex flex-col hover:border-zinc-500/30 transition-colors">
                        <div className="mb-6">
                            <Badge color="zinc"><span className="px-2 uppercase tracking-wider text-xs font-bold">Local Business Edition</span></Badge>
                            <h3 className="text-3xl font-bold text-white mt-4">Solo</h3>
                            <p className="text-zinc-400 text-sm mt-2">Perfect for business owners managing leads themselves.</p>
                        </div>
                        
                        <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-bold text-white">€{SOLO_PRICE}</span>
                                <span className="text-zinc-500 font-medium">/mo</span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-2">Cancel anytime.</p>
                        </div>

                        <div className="space-y-4 flex-1 border-t border-white/5 pt-8">
                            <div className="flex items-center gap-3 text-zinc-300">
                                <div className="p-1 rounded-full bg-zinc-800 text-white"><CheckCircle2 className="w-3 h-3" /></div>
                                <span className="font-medium">Unlimited leads</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-300">
                                <div className="p-1 rounded-full bg-zinc-800 text-white"><Zap className="w-3 h-3" /></div>
                                <span className="font-medium">Direct Meta Sync</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-300">
                                <div className="p-1 rounded-full bg-zinc-800 text-white"><Shield className="w-3 h-3" /></div>
                                <span className="font-medium">White-Label Client Portal</span>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button 
                                onClick={handleCtaClick}
                                className="w-full py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm border border-white/10 transition-all hover:scale-[1.02]"
                            >
                                Start 14-Day Free Trial
                            </button>
                            <p className="text-[10px] text-zinc-500 mt-3 text-center">No credit card required.</p>
                        </div>
                    </div>
                </div>

                {/* PLAN 2: AGENCY (Essential) */}
                <div className="relative group transform md:-translate-y-4">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-[2.5rem] blur opacity-40 group-hover:opacity-60 transition duration-500" />
                    
                    <div className="relative p-10 bg-zinc-900 rounded-[2.5rem] border border-white/10 h-full flex flex-col shadow-2xl">
                        <div className="mb-6">
                            <Badge color="primary"><span className="px-2 uppercase tracking-wider text-xs font-bold">Most Popular</span></Badge>
                            <h3 className="text-3xl font-bold text-white mt-4">Agency Starter</h3>
                            <p className="text-zinc-400 text-sm mt-2">For agencies managing leads with clients.</p>
                        </div>
                        
                        <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-bold text-white">€{AGENCY_PRICE}</span>
                                <span className="text-zinc-500 font-medium">/mo</span>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                                <div className="text-xs text-primary-400 bg-primary-500/10 px-3 py-1.5 rounded-full inline-block font-bold border border-primary-500/20">
                                    5 Client Slots included
                                </div>
                                <div className="text-xs text-zinc-400">
                                    Just €13 per client.
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1 border-t border-white/5 pt-8">
                             <div className="flex items-center gap-3 text-white">
                                <div className="p-1 rounded-full bg-primary-500 text-white shadow-lg shadow-primary-500/30"><CheckCircle2 className="w-3 h-3" /></div>
                                <span className="font-bold">Unlimited Leads & Campaigns</span>
                            </div>
                             <div className="flex items-center gap-3 text-zinc-300">
                                <div className="p-1 rounded-full bg-primary-500/20 text-primary-500"><Shield className="w-3 h-3" /></div>
                                <span className="font-medium">White-Label Client Portal</span>
                            </div>
                             <div className="flex items-center gap-3 text-zinc-300">
                                <div className="p-1 rounded-full bg-primary-500/20 text-primary-500"><MessageSquare className="w-3 h-3" /></div>
                                <span className="font-medium">Slack Follow-up Alerts</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-300">
                                <div className="p-1 rounded-full bg-primary-500/20 text-primary-500"><BarChart3 className="w-3 h-3" /></div>
                                <span className="font-medium">Revenue & ROAS Dashboard</span>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <button 
                                onClick={handleCtaClick}
                                className="w-full py-4 rounded-2xl bg-primary-500 hover:bg-primary-400 text-white font-bold text-lg shadow-lg shadow-primary-500/20 transition-all hover:-translate-y-1 hover:shadow-primary-500/40 relative overflow-hidden group"
                            >
                                <span className="relative z-10">Start 14-Day Free Trial</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                            </button>
                            <p className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1.5">
                                <CreditCard className="w-3 h-3"/> No credit card required.
                            </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-dashed border-white/10 text-center">
                            <p className="text-xs text-zinc-400">
                                Need more? <span className="text-white font-semibold">Scale up for just €10/client.</span>
                                <br/>Turn them into profit centers.
                            </p>
                        </div>
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
                  <FaqItem question="How fast can I get started?" answer="Live and connected to Meta in under 10 minutes." />
                  <FaqItem question="Do my clients need training?" answer="No. 3 buttons. Drag and drop. That’s it." />
                  <FaqItem question="How do I prove revenue?" answer="Track appointments + sales per lead → ROAS and ROI calculated automatically." />
                  <FaqItem question="What if my client doesn’t follow up?" answer="Slack alerts and reminders make sure they do." />
                  <FaqItem question="Is this white-label?" answer="100%. Your logo. Your brand. Your domain." />
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
                 <button 
                    onClick={handleCtaClick}
                    className="px-12 py-5 rounded-2xl bg-white text-zinc-950 font-bold text-xl hover:bg-zinc-200 transition-colors shadow-xl hover:scale-105 transform duration-200"
                 >
                    Start Free
                 </button>
                 <button className="px-12 py-5 rounded-2xl bg-transparent border border-white/10 text-white font-bold text-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2"><Play className="w-5 h-5"/> Watch Demo</button>
            </div>
            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-zinc-500 font-medium">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary-500"/> No credit card needed</span>
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
              <div><h4 className="font-bold text-white mb-6">Company</h4><ul className="space-y-4 text-sm text-zinc-400"><li><a href="#" className="hover:text-primary-400 transition-colors">About</a></li><li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li><li><a href="#" className="hover:text-primary-400 transition-colors">Careers</a></li></ul></div>
              <div><h4 className="font-bold text-white mb-6">Legal</h4><ul className="space-y-4 text-sm text-zinc-400"><li><a href="#" className="hover:text-primary-400 transition-colors">Privacy</a></li><li><a href="#" className="hover:text-primary-400 transition-colors">Terms</a></li><li><a href="#" className="hover:text-primary-400 transition-colors">Imprint</a></li></ul></div>
          </div>
          <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
              <p>&copy; 2024 LeadTS GmbH. Made with ❤️ in Germany.</p>
              <div className="flex gap-6"><a href="#" className="hover:text-white transition-colors">Status</a><a href="#" className="hover:text-white transition-colors">Docs</a><a href="#" className="hover:text-white transition-colors">Contact</a></div>
          </div>
      </footer>
    </div>
  );
};
