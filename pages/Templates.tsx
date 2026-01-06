import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from '../components/Layout';
import { Campaign, Client } from '../types';
import { getCampaigns, createCampaign, getClients, duplicateCampaign } from '../services/dataService';
import { GlassCard, GlassButton, Badge, GlassInput } from '../components/ui/Glass';
import { Modal } from '../components/ui/Modal';
import { Layers, Plus, Database, GitPullRequest, ArrowRight, Zap, Check, ChevronRight, User, Copy, Save } from 'lucide-react';

export const Templates = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState<Campaign[]>([]);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    
    // Wizard State
    const [clients, setClients] = useState<Client[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
    const [newTemplateName, setNewTemplateName] = useState('');
    
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        getCampaigns().then(all => setTemplates(all.filter(c => c.is_template)));
    };

    const openWizard = async () => {
        setLoading(true);
        const allClients = await getClients();
        setClients(allClients);
        setWizardStep(1);
        setSelectedClientId(null);
        setSelectedCampaignId(null);
        setNewTemplateName('');
        setIsWizardOpen(true);
        setLoading(false);
    };

    useEffect(() => {
        if (selectedClientId) {
            getCampaigns().then(all => {
                setCampaigns(all.filter(c => c.client_id === selectedClientId && !c.is_template));
                setSelectedCampaignId(null);
            });
        }
    }, [selectedClientId]);

    const handleCreateFromBlueprint = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCampaignId || !newTemplateName) return;
        
        setLoading(true);
        const newTemplate = await duplicateCampaign(selectedCampaignId, newTemplateName, true);
        
        if (newTemplate) {
            setTemplates(prev => [...prev, newTemplate]);
            navigate(`/campaign/${newTemplate.id}`);
        }

        setIsWizardOpen(false);
        setLoading(false);
    };

    const countAutomations = (settings: Campaign['settings']) => {
        const integrations = settings.integrations;
        if (!integrations) return 0;
        let count = 0;
        if (integrations.slack.events.new_lead.enabled) count++;
        if (integrations.slack.events.won_deal.enabled) count++;
        if (integrations.meta.events.purchase_on_won) count++;
        return count;
    };

    return (
        <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Blueprint Library</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Create new campaigns from proven, successful blueprints.</p>
                </div>
                <GlassButton onClick={openWizard} disabled={loading}>
                    <Plus className="w-4 h-4 mr-2" /> New Blueprint
                </GlassButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(t => {
                    const automations = countAutomations(t.settings);
                    return (
                        <Link key={t.id} to={`/campaign/${t.id}`} className="group block h-full">
                            <GlassCard className="p-0 overflow-hidden h-full flex flex-col hover:border-primary-500/30 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/80 group-hover:-translate-y-1 relative">
                                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
                                <div className="p-6 flex flex-col h-full">
                                    <h3 className="font-bold text-xl text-zinc-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">{t.name}</h3>
                                    <div className="space-y-2 mb-6 mt-auto">
                                        <div className="flex items-center justify-between text-xs text-zinc-500"><span className="flex items-center gap-2"><GitPullRequest className="w-3.5 h-3.5"/> Pipeline Stages</span><span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">{t.settings.pipeline_stages.length}</span></div>
                                        <div className="flex items-center justify-between text-xs text-zinc-500"><span className="flex items-center gap-2"><Database className="w-3.5 h-3.5"/> Data Fields</span><span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">{t.settings.custom_fields.length + t.settings.active_system_fields.length}</span></div>
                                        <div className="flex items-center justify-between text-xs text-zinc-500"><span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5"/> Automations</span><span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">{automations}</span></div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-sm font-medium text-zinc-500"><span className="group-hover:text-primary-500 transition-colors">Edit Blueprint</span><ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" /></div>
                                </div>
                            </GlassCard>
                        </Link>
                    );
                })}
            </div>

            <Modal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} title="Create New Blueprint">
                <form onSubmit={handleCreateFromBlueprint} className="space-y-6 min-h-[300px]">
                    
                    {/* STEP 1: Select Client */}
                    {wizardStep === 1 && (
                        <div className="space-y-4">
                            <div className="text-sm font-medium text-zinc-300">Select a client with a successful campaign to use as a base.</div>
                            <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                                {clients.map(c => (
                                    <button type="button" key={c.id} onClick={() => { setSelectedClientId(c.id); setWizardStep(2); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors border border-white/5 text-left">
                                        <img src={c.logo} className="w-8 h-8 rounded-full" />
                                        <span className="font-medium text-white">{c.name}</span>
                                        <ChevronRight className="w-4 h-4 text-zinc-500 ml-auto" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* STEP 2: Select Campaign */}
                    {wizardStep === 2 && (
                        <div className="space-y-4">
                            <button type="button" onClick={() => setWizardStep(1)} className="text-xs text-zinc-400 hover:text-white">&larr; Back to Clients</button>
                            <div className="text-sm font-medium text-zinc-300">Now, select the campaign to use as a blueprint.</div>
                            <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                                {campaigns.map(c => (
                                    <button type="button" key={c.id} onClick={() => { setSelectedCampaignId(c.id); setNewTemplateName(`${c.name} Blueprint`); setWizardStep(3); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors border border-white/5 text-left">
                                        <Copy className="w-4 h-4 text-primary-500" />
                                        <span className="font-medium text-white">{c.name}</span>
                                        <ChevronRight className="w-4 h-4 text-zinc-500 ml-auto" />
                                    </button>
                                ))}
                                {campaigns.length === 0 && <div className="text-center text-xs text-zinc-500 py-8">No campaigns found for this client.</div>}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Name & Save */}
                    {wizardStep === 3 && (
                        <div className="space-y-6">
                            <button type="button" onClick={() => setWizardStep(2)} className="text-xs text-zinc-400 hover:text-white">&larr; Back to Campaigns</button>
                            <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl space-y-2">
                                <div className="text-xs font-bold text-primary-400">Blueprint Source</div>
                                <div className="text-white font-medium">{clients.find(c=>c.id === selectedClientId)?.name} &rarr; {campaigns.find(c=>c.id === selectedCampaignId)?.name}</div>
                            </div>
                            <GlassInput 
                                label="Blueprint Name" 
                                value={newTemplateName} 
                                onChange={e => setNewTemplateName(e.target.value)} 
                                autoFocus
                            />
                            <GlassButton type="submit" className="w-full justify-center" disabled={!newTemplateName || loading}>
                                {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Blueprint</>}
                            </GlassButton>
                        </div>
                    )}

                </form>
            </Modal>
        </div>
    )
}
