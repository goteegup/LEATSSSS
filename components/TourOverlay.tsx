import React, { useEffect, useState } from 'react';
import { getWorkspaceSettings, updateWorkspaceSettings, getCampaigns } from '../services/dataService';
import { useNavigate, useLocation } from './Layout';
import { GlassButton } from './ui/Glass';
import { Sparkles, ArrowRight, X, MousePointer2 } from 'lucide-react';

interface TourStep {
    id: string;
    targetId: string;
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right' | 'center';
    route?: string;
    action?: () => void;
}

export const TourOverlay = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Tour Definition
    const [steps, setSteps] = useState<TourStep[]>([
        {
            id: 'welcome',
            targetId: 'root', // Center fallback
            title: 'Welcome to LeadTS',
            content: "Let's take a quick tour of your new Agency OS. We'll set up your workflow in 60 seconds.",
            position: 'center'
        },
        {
            id: 'dashboard-kpi',
            targetId: 'dashboard-kpi',
            title: 'Live Analytics',
            content: "Track real-time Revenue, ROAS, and Sales. These numbers update instantly when leads move through your pipeline.",
            position: 'bottom',
            route: '/dashboard'
        },
        {
            id: 'nav-clients',
            targetId: 'nav-clients',
            title: 'Client Management',
            content: "Manage all your clients here. You can also impersonate their portal view.",
            position: 'right'
        }
        // Campaign specific steps added dynamically
    ]);

    useEffect(() => {
        // Check if we should start the tour
        const checkTourStatus = async () => {
            const settings = await getWorkspaceSettings();
            if (settings.onboarding_complete && !settings.tour_completed) {
                setIsOpen(true);
                
                // Fetch a campaign ID to build the dynamic steps
                const campaigns = await getCampaigns();
                if (campaigns.length > 0) {
                    const campaignId = campaigns[0].id;
                    const dynamicSteps: TourStep[] = [
                        {
                            id: 'campaign-view',
                            targetId: 'dashboard-campaigns', // Or list item
                            title: 'Active Campaigns',
                            content: "Click into any campaign to manage leads, pipelines, and integrations.",
                            position: 'top',
                            route: '/dashboard',
                            action: () => navigate(`/campaign/${campaignId}`)
                        },
                        {
                            id: 'tab-leads',
                            targetId: 'tab-leads',
                            title: 'Lead Management',
                            content: "View all leads in a List or Kanban board. Drag and drop to update status.",
                            position: 'bottom',
                            route: `/campaign/${campaignId}`,
                            action: () => document.getElementById('tab-leads')?.click()
                        },
                        {
                            id: 'leads-kanban',
                            targetId: 'leads-kanban',
                            title: 'Kanban Board',
                            content: "Move leads to 'Won' to trigger revenue tracking and Meta CAPI events.",
                            position: 'top',
                            route: `/campaign/${campaignId}`
                        },
                        {
                            id: 'tab-pipeline',
                            targetId: 'tab-pipeline',
                            title: 'Pipeline Editor',
                            content: "Customize your deal stages here. Add 'Appointment' or 'Won' stages to track conversions.",
                            position: 'bottom',
                            route: `/campaign/${campaignId}`,
                            action: () => document.getElementById('tab-pipeline')?.click()
                        },
                        {
                            id: 'tab-integrations',
                            targetId: 'tab-integrations',
                            title: 'Integrations',
                            content: "Connect Slack, Meta CAPI, and Email alerts to automate your workflow.",
                            position: 'bottom',
                            route: `/campaign/${campaignId}`,
                            action: () => document.getElementById('tab-integrations')?.click()
                        },
                        {
                            id: 'finish',
                            targetId: 'root',
                            title: "You're Ready!",
                            content: "That's the basics. You can access settings anytime from the sidebar.",
                            position: 'center'
                        }
                    ];
                    setSteps(prev => [...prev.slice(0, 3), ...dynamicSteps]);
                } else {
                    // Fallback if no campaign
                     setSteps(prev => [...prev, {
                        id: 'finish',
                        targetId: 'root',
                        title: "You're Ready!",
                        content: "Create your first campaign to get started.",
                        position: 'center'
                    }]);
                }
            }
        };
        
        checkTourStatus();
    }, []);

    // Effect to handle navigation and target finding
    useEffect(() => {
        if (!isOpen) return;
        
        const step = steps[currentStepIndex];
        if (!step) return;

        // Execute action (navigation or click)
        const executeStep = async () => {
            if (step.route && location.pathname !== step.route) {
                navigate(step.route);
                // Wait for Nav
                await new Promise(r => setTimeout(r, 500));
            }
            
            if (step.action) {
                step.action();
                // Wait for Action
                await new Promise(r => setTimeout(r, 300));
            }

            // Find Element
            const updateRect = () => {
                const el = document.getElementById(step.targetId);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    setTargetRect(rect);
                } else if (step.position === 'center') {
                    setTargetRect(null); // Center mode
                } else {
                    // Retry a few times if element not found yet
                    setTimeout(updateRect, 500);
                }
            };
            
            // Initial delay to allow rendering
            setTimeout(updateRect, 300);
            
            // Handle Resize
            window.addEventListener('resize', updateRect);
            return () => window.removeEventListener('resize', updateRect);
        };

        executeStep();

    }, [currentStepIndex, isOpen, steps]); // Removed location dependency to avoid loops

    const handleNext = async () => {
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(currentStepIndex + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        setIsOpen(false);
        const settings = await getWorkspaceSettings();
        await updateWorkspaceSettings({ ...settings, tour_completed: true });
    };

    if (!isOpen) return null;

    const currentStep = steps[currentStepIndex];
    const isCenter = currentStep.position === 'center' || !targetRect;

    // Calculate Tooltip Position
    let tooltipStyle: React.CSSProperties = {};
    if (targetRect && !isCenter) {
        const gap = 12;
        if (currentStep.position === 'top') {
            tooltipStyle = { top: targetRect.top - gap, left: targetRect.left + targetRect.width / 2, transform: 'translate(-50%, -100%)' };
        } else if (currentStep.position === 'bottom') {
            tooltipStyle = { top: targetRect.bottom + gap, left: targetRect.left + targetRect.width / 2, transform: 'translate(-50%, 0)' };
        } else if (currentStep.position === 'left') {
            tooltipStyle = { top: targetRect.top + targetRect.height / 2, left: targetRect.left - gap, transform: 'translate(-100%, -50%)' };
        } else if (currentStep.position === 'right') {
            tooltipStyle = { top: targetRect.top + targetRect.height / 2, left: targetRect.right + gap, transform: 'translate(0, -50%)' };
        }
    } else {
        tooltipStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'fixed' };
    }

    return (
        <div className="fixed inset-0 z-[9999] pointer-events-auto">
            {/* Backdrop with Hole (using clip-path or mixed-blend-mode tricky, simply using 4 divs for simplicity or just SVG overlay) */}
            {/* Simpler Approach: Full Dim overlay, Spotlight via SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                    <mask id="spotlight-mask">
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {targetRect && !isCenter && (
                            <rect 
                                x={targetRect.left - 4} 
                                y={targetRect.top - 4} 
                                width={targetRect.width + 8} 
                                height={targetRect.height + 8} 
                                rx="12" 
                                fill="black" 
                            />
                        )}
                    </mask>
                </defs>
                <rect x="0" y="0" width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#spotlight-mask)" />
                
                {/* Highlight Border */}
                {targetRect && !isCenter && (
                    <rect 
                        x={targetRect.left - 4} 
                        y={targetRect.top - 4} 
                        width={targetRect.width + 8} 
                        height={targetRect.height + 8} 
                        rx="12"
                        fill="none"
                        stroke="#20b8a6"
                        strokeWidth="2"
                        className="animate-pulse"
                    />
                )}
            </svg>

            {/* Tooltip Card */}
            <div 
                className="absolute z-[10000] w-full max-w-sm"
                style={tooltipStyle}
            >
                <div className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-300">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-full bg-primary-500/20 text-primary-500">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white">{currentStep.title}</h3>
                    </div>
                    
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                        {currentStep.content}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex gap-1">
                            {steps.map((_, i) => (
                                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === currentStepIndex ? 'bg-primary-500' : 'bg-zinc-700'}`} />
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={handleComplete} className="text-xs text-zinc-500 hover:text-white transition-colors">Skip</button>
                            <GlassButton onClick={handleNext} className="h-9 px-4 text-sm">
                                {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="w-3 h-3 ml-2" />
                            </GlassButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
