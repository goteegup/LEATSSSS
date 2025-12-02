import React, { useEffect, useState } from 'react';
import { Link } from '../components/Layout';
import { Campaign, IntegrationSettings } from '../types';
import { getCampaigns, createCampaign, getClients } from '../services/dataService';
import { GlassCard, GlassButton, Badge, GlassInput } from '../components/ui/Glass';
import { Modal } from '../components/ui/Modal';
import { Layers, Plus, Database, GitPullRequest, Settings, ArrowRight, LayoutTemplate, Zap, Check } from 'lucide-react';

export const Templates = () => {
    const [templates, setTemplates] = useState<Campaign[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getCampaigns().then(all => setTemplates(all.filter(c => c.is_template)));
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // For prototype, assign to first client since data model requires it
        const clients = await getClients();
        if (clients.length === 0) {
            setLoading(false);
            alert("Please create a client first to attach templates to (Internal requirement).");
            return;
        }
        
        const newTemplate = await createCampaign({
            client_id: clients[0].id,
            name: newTemplateName,
            is_template: true,
            status: 'paused'
        });
        setTemplates([...templates, newTemplate]);
        setIsModalOpen(false);
        setNewTemplateName('');
        setLoading(false);
    };

    const countAutomations = (settings: IntegrationSettings | undefined) => {
        if (!settings) return 0;
        let count = 0;
        if (settings.slack.events.new_lead.enabled) count++;
        if (settings.slack.events.won_deal.enabled) count++;
        if (settings.meta.events.purchase_on_won) count++;
        return count;
    };

    return (
        <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">Blueprint Library</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">Standardized configurations for rapid deployment.</p>
                </div>
                <GlassButton onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> New Blueprint
                </GlassButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(t => {
                    const automations = countAutomations(t.settings.integrations);
                    return (
                        <Link key={t.id} to={`/campaign/${t.id}`} className="group block h-full">
                            <GlassCard className="p-0 overflow-hidden h-full flex flex-col hover:border-primary-500/30 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/80 group-hover:-translate-y-1 relative">
                                
                                <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 to-purple-500" />
                                
                                <div className="p-6 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-500 border border-zinc-200 dark:border-white/5 group-hover:bg-primary-500/10 group-hover:text-primary-500 group-hover:border-primary-500/20 transition-all duration-300">
                                            <Layers className="w-6 h-6" />
                                        </div>
                                    </div>
                                    
                                    <h3 className="font-bold text-xl text-zinc-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">{t.name}</h3>
                                    <p className="text-xs text-zinc-500 line-clamp-2 mb-6">
                                        Pre-configured pipeline and data schema ready for deployment.
                                    </p>
                                    
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center justify-between text-xs text-zinc-500">
                                            <span className="flex items-center gap-2"><GitPullRequest className="w-3.5 h-3.5"/> Pipeline Stages</span>
                                            <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">{t.settings.pipeline_stages.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-zinc-500">
                                            <span className="flex items-center gap-2"><Database className="w-3.5 h-3.5"/> Data Fields</span>
                                            <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">{t.settings.custom_fields.length + t.settings.active_system_fields.length}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-zinc-500">
                                            <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5"/> Automations</span>
                                            <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">{automations}</span>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-sm font-medium text-zinc-500">
                                        <span className="group-hover:text-primary-500 transition-colors">Edit Blueprint</span>
                                        <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </GlassCard>
                        </Link>
                    );
                })}
                
                {templates.length === 0 && (
                    <div className="col-span-full py-16 text-center border-2 border-dashed border-zinc-200 dark:border-white/10 rounded-3xl bg-zinc-50/50 dark:bg-white/5">
                        <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400">
                            <Layers className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Library Empty</h3>
                        <p className="text-zinc-500 text-sm mt-1 mb-6">Create your first blueprint to standardize your campaigns.</p>
                        <GlassButton onClick={() => setIsModalOpen(true)}>Create Blueprint</GlassButton>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Blueprint">
                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white mb-1">Blueprint Logic</h4>
                            <p className="text-xs text-blue-200/80 leading-relaxed">
                                This will create a master template. Integration credentials (API keys) are stripped for security, but automation logic is preserved.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Blueprint Name</label>
                        <GlassInput 
                            value={newTemplateName} 
                            onChange={e => setNewTemplateName(e.target.value)} 
                            autoFocus 
                            placeholder="e.g. Real Estate Lead Gen v2" 
                        />
                    </div>
                    <GlassButton type="submit" className="w-full justify-center" disabled={!newTemplateName || loading}>
                        {loading ? 'Creating...' : 'Create Blueprint'}
                    </GlassButton>
                </form>
            </Modal>
        </div>
    )
}