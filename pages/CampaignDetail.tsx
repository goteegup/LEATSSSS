
import React, { useEffect, useState } from 'react';
import { useParams, Link } from '../components/Layout';
import { getCampaignById, getClientById, getSession, getCampaigns } from '../services/dataService';
import { Campaign, Client } from '../types';
import { LayoutDashboard, Users, GitPullRequest, Database, UploadCloud, ChevronRight, Eye, Zap, Settings, BarChart2, MousePointer2 } from 'lucide-react';
import { OverviewTab } from './tabs/OverviewTab';
import { LeadsTab } from './tabs/LeadsTab';
import { DataFieldsTab } from './tabs/DataFieldsTab';
import { PipelineTab } from './tabs/PipelineTab';
import { LeadSourceTab } from './tabs/LeadSourceTab';
import { FieldMappingTab } from './tabs/FieldMappingTab';
import { IntegrationsTab } from './tabs/IntegrationsTab'; // Renamed to Automations in UI
import { VisibilityTab } from './tabs/VisibilityTab';

const ADMIN_TABS = [
  // 1. Pipeline
  { id: 'pipeline', label: 'Pipeline', icon: GitPullRequest },
  // 2. Lead Fields
  { id: 'fields', label: 'Lead Fields', icon: Database },
  // 3. Lead Source
  { id: 'source', label: 'Lead Source', icon: UploadCloud },
  // 4. Field Mapping
  { id: 'mapping', label: 'Field Mapping', icon: Settings },
  // 5. Automations (Integrations)
  { id: 'automations', label: 'Automations', icon: Zap },
  // 6. Visibility
  { id: 'visibility', label: 'Visibility', icon: Eye },
];

export const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('leads'); 
  const [session, setSession] = useState(getSession());

  useEffect(() => {
    if (id) {
      getCampaignById(id).then(c => {
        setCampaign(c);
        if (c) {
            // If it's a template, maybe client_id is not set or generic, but getClientById handles it safely
            getClientById(c.client_id).then(cData => {
                setClient(cData);
                const role = getSession().role;
                if (role === 'client') {
                    // Check granular permission
                    const canViewDash = c.settings.client_view?.show_dashboard ?? true;
                    setActiveTab(canViewDash ? 'dashboard' : 'leads');
                } else {
                    // If it is a template, admin might want to see configuration first
                    if (c.is_template) {
                        setActiveTab('pipeline');
                    } else {
                        setActiveTab('dashboard');
                    }
                }
            });
        }
      });
    }
    setSession(getSession());
  }, [id]);

  if (!campaign) return <div className="p-10 text-center text-zinc-500">Loading campaign...</div>;

  const isClientRole = session.role === 'client';
  const clientView = campaign.settings.client_view || { show_dashboard: true, show_kanban: true, show_list: true, show_kpi: true };

  const renderContent = () => {
    switch (activeTab) {
      // User & Admin Views
      case 'dashboard': return <OverviewTab campaign={campaign} />;
      case 'leads': return <LeadsTab campaign={campaign} />;
      
      // Admin Only Configuration
      case 'pipeline': return <PipelineTab campaign={campaign} onUpdate={setCampaign} />;
      case 'fields': return <DataFieldsTab campaign={campaign} onUpdate={setCampaign} />;
      case 'source': return <LeadSourceTab campaign={campaign} onUpdate={setCampaign} />;
      case 'mapping': return <FieldMappingTab campaign={campaign} onUpdate={setCampaign} />;
      case 'automations': return <IntegrationsTab campaign={campaign} onUpdate={setCampaign} />;
      case 'visibility': return <VisibilityTab campaign={campaign} onUpdate={setCampaign} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* Header Area */}
      <div className={`bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 sticky top-16 md:top-0 z-30 transition-colors duration-300 ${isClientRole ? 'hidden md:block' : ''}`}>
        <div className="px-4 md:px-8 pt-4">
            
            {!isClientRole && (
                <div className="flex items-center gap-2 text-xs md:text-sm text-zinc-500 mb-4">
                    {campaign.is_template ? (
                        <>
                            <Link to="/templates" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">Templates</Link>
                            <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="text-zinc-900 dark:text-zinc-200 font-medium">{campaign.name}</span>
                        </>
                    ) : (
                        <>
                            <Link to="/clients" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">Clients</Link>
                            <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                            {client ? <Link to={`/clients/${client.id}`} className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">{client.name}</Link> : <span>...</span>}
                            <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="text-zinc-900 dark:text-zinc-200 font-medium truncate max-w-[150px] md:max-w-none">{campaign.name}</span>
                        </>
                    )}
                </div>
            )}
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{campaign.name}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        {campaign.is_template && (
                             <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">Template Mode</span>
                        )}
                        {!campaign.is_template && (
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${campaign.status === 'active' ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'}`}>{campaign.status}</span>
                        )}
                        {!campaign.is_template && campaign.budget > 0 && <span className="text-xs text-zinc-500">Budget: ${campaign.budget.toLocaleString()}</span>}
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-6 overflow-x-auto no-scrollbar" id="campaign-tabs">
                
                {/* 1. Operational Tabs (Always Visible if Permitted) */}
                {/* Hide Dashboard/Leads for Templates usually, but useful for previewing */}
                {(isClientRole ? clientView.show_dashboard : true) && (
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`group flex items-center gap-2 pb-3 px-1 border-b-2 transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </button>
                )}
                
                <button
                    onClick={() => setActiveTab('leads')}
                    className={`group flex items-center gap-2 pb-3 px-1 border-b-2 transition-all whitespace-nowrap ${activeTab === 'leads' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                    <Users className="w-4 h-4" /> Leads
                </button>

                {/* Separator for Admin Config */}
                {!isClientRole && <div className="w-px h-6 bg-zinc-300 dark:bg-white/10 mx-2 self-center mb-3" />}

                {/* 2. Admin Configuration Tabs */}
                {!isClientRole && ADMIN_TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group flex items-center gap-2 pb-3 px-1 border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* MOBILE CLIENT HEADER */}
      {isClientRole && (
          <div className="md:hidden sticky top-16 z-30 bg-zinc-50/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 px-4 py-4">
               <h1 className="text-lg font-bold text-zinc-900 dark:text-white truncate">{campaign.name}</h1>
               <div className="flex items-center gap-2 mt-1">
                   <Link to={`/clients/${campaign.client_id}`} className="text-xs text-zinc-500 flex items-center gap-1 hover:text-primary-500">
                      <ChevronRight className="w-3 h-3 rotate-180" /> Back to Overview
                   </Link>
               </div>
          </div>
      )}

      {/* Body */}
      <div className={`flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto ${isClientRole ? 'pb-24' : ''}`}>
        {renderContent()}
      </div>

      {/* MOBILE BOTTOM TABS (CLIENT ONLY) */}
      {isClientRole && (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 p-2 grid grid-cols-2 gap-2">
                {clientView.show_dashboard && (
                    <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center justify-center py-2 rounded-xl ${activeTab === 'dashboard' ? 'bg-primary-500 text-white' : 'text-zinc-400'}`}>
                        <LayoutDashboard className="w-5 h-5 mb-0.5" /> <span className="text-[10px]">Dashboard</span>
                    </button>
                )}
                <button onClick={() => setActiveTab('leads')} className={`flex flex-col items-center justify-center py-2 rounded-xl ${activeTab === 'leads' ? 'bg-primary-500 text-white' : 'text-zinc-400'}`}>
                    <Users className="w-5 h-5 mb-0.5" /> <span className="text-[10px]">Leads</span>
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
