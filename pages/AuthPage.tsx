
import React, { useState } from 'react';
import { useNavigate } from '../components/Layout';
import { loginUser } from '../services/dataService';
import { GlassButton } from '../components/ui/Glass';
import { Mail, ArrowRight, Globe, Play, UserCheck, UserPlus } from 'lucide-react';

const GoogleIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

export const AuthPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // Mock Login Handlers
    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        // Simulate default existing user
        try {
            const { isNewUser } = await loginUser('demo@leadts.com', 'Demo User');
            setTimeout(() => {
                navigate(isNewUser ? '/setup' : '/dashboard');
            }, 1000);
        } catch (e) {
            setIsGoogleLoading(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsLoading(true);
        
        // Use the entered email to simulate a real user session
        try {
            const { isNewUser } = await loginUser(email);
            setTimeout(() => {
                navigate(isNewUser ? '/setup' : '/dashboard');
            }, 1000);
        } catch (e) {
            setIsLoading(false);
        }
    };

    // Quick Test Helper
    const testLogin = async (type: 'new' | 'existing') => {
        setIsLoading(true);
        
        if (type === 'new') {
            // Force Clear for new user experience
            localStorage.removeItem('leadts_workspace_settings');
            const testEmail = `new_agency_${Date.now()}@test.com`;
            const { isNewUser } = await loginUser(testEmail);
            setTimeout(() => {
                navigate('/setup');
            }, 800);
        } else {
            const { isNewUser } = await loginUser('demo@leadts.com');
            setTimeout(() => {
                navigate('/dashboard');
            }, 800);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col md:flex-row relative overflow-hidden">
            
            {/* Visual Side (Left) */}
            <div className="hidden md:flex w-1/2 lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden border-r border-white/5">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900/40 via-zinc-950 to-zinc-950 -z-10" />
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 -z-10" />

                 <div className="relative z-10">
                     <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center mb-6 shadow-lg shadow-primary-500/20">
                        <Globe className="w-6 h-6 text-black" />
                     </div>
                     <h1 className="text-4xl font-bold text-white tracking-tight leading-tight max-w-lg">
                        Turn traffic into <span className="text-primary-400">Revenue</span>.
                        <br />Automatically.
                     </h1>
                 </div>

                 <div className="relative z-10 space-y-6">
                     <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-md max-w-md">
                         <div className="flex gap-4 items-start">
                             <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0 border border-white/5 overflow-hidden">
                                <img src="https://ui-avatars.com/api/?name=Alex+H&background=random" className="w-full h-full object-cover" />
                             </div>
                             <div>
                                 <p className="text-zinc-300 text-sm italic mb-2">"We used to lose 30% of our leads in emails. With LeadTS, my team calls everyone instantly. It paid for itself in day one."</p>
                                 <div className="text-xs font-bold text-white">Alex Hormozi</div>
                                 <div className="text-[10px] text-zinc-500 uppercase font-medium">Founder, Acquisition.com</div>
                             </div>
                         </div>
                     </div>
                 </div>
            </div>

            {/* Login Form Side (Right) */}
            <div className="w-full md:w-1/2 lg:w-[45%] flex items-center justify-center p-6 md:p-12 relative">
                <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold text-white">Log in to LeadTS</h2>
                        <p className="text-zinc-400 text-sm mt-2">Enter your email below to access your workspace.</p>
                    </div>

                    {/* DEV: QUICK TEST BUTTONS */}
                    <div className="p-3 bg-zinc-900 border border-white/10 rounded-xl space-y-2">
                        <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Developer Quick Access</div>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => testLogin('new')} className="flex items-center justify-center gap-2 py-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 text-xs font-medium rounded-lg border border-primary-500/20 transition-colors">
                                <UserPlus className="w-3 h-3" /> New User (Onboarding)
                            </button>
                            <button onClick={() => testLogin('existing')} className="flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg border border-white/5 transition-colors">
                                <UserCheck className="w-3 h-3" /> Existing User (Dash)
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button 
                            onClick={handleGoogleLogin}
                            disabled={isGoogleLoading || isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-white text-zinc-900 font-semibold py-3 px-4 rounded-xl hover:bg-zinc-100 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isGoogleLoading ? (
                                <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <GoogleIcon />
                            )}
                            Continue with Google
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-zinc-950 px-2 text-zinc-500">Or continue with email</span>
                            </div>
                        </div>

                        <form onSubmit={handleEmailLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400 ml-1">Work Email</label>
                                <div className="relative">
                                    <input 
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 pl-10 placeholder:text-zinc-600 transition-all"
                                        placeholder="name@company.com"
                                    />
                                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                            <GlassButton 
                                type="submit" 
                                disabled={isLoading || isGoogleLoading}
                                className="w-full justify-center py-3.5 text-base"
                            >
                                {isLoading ? 'Sending Magic Link...' : 'Continue with Email'}
                                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                            </GlassButton>
                        </form>
                    </div>

                    <p className="text-center text-xs text-zinc-500">
                        By clicking continue, you agree to our <a href="#" className="underline hover:text-zinc-400">Terms of Service</a> and <a href="#" className="underline hover:text-zinc-400">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};
