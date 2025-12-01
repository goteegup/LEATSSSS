
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCampaignById, getClientById, getSession } from '../services/dataService';
import { Campaign, Client } from '../types';
import { LayoutDashboard, Users, GitPullRequest, Database, UploadCloud, ChevronRight, LayoutTemplate, Eye } from 'lucide-react';
import { OverviewTab } from './tabs/OverviewTab';
import { LeadsTab } from './tabs/LeadsTab';
import { DataFieldsTab } from './tabs/DataFieldsTab';
import { PipelineTab } from './tabs/PipelineTab';
import { ImportTab } from './tabs/ImportTab';
import { ViewConfigTab } from './tabs/ViewConfigTab';

const ALL_TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'pipeline', label: 'Pipeline', icon: GitPullRequest },
  { id: 'fields', label: 'Data Schema', icon: Database },
  { id: 'view-config', label: 'View', icon: Eye },
  { id: 'import', label: 'Import', icon: UploadCloud },
];

export const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [session, setSession] = useState(getSession());

  useEffect(() => {
    if (id) {
      getCampaignById(id).then(c => {
        setCampaign(c);
        if (c) {
            getClientById(c.client_id).then(setClient);
        }
      });
    }
    setSession(getSession());
  }, [id]);

  if (!campaign) return <div className="p-10 text-center text-zinc-500">Loading campaign...</div>;

  const isClientRole = session.role === 'client';
  
  // Filter tabs: Clients see only Dashboard & Leads
  const visibleTabs = isClientRole 
    ? ALL_TABS.filter(t => ['dashboard', 'leads'].includes(t.id)) 
    : ALL_TABS;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <OverviewTab campaign={campaign} />;
      case 'leads': return <LeadsTab campaign={campaign} />;
      case 'pipeline': return <PipelineTab campaign={campaign} onUpdate={setCampaign} />;
      case 'fields': return <DataFieldsTab campaign={campaign} onUpdate={setCampaign} />;
      case 'view-config': return <ViewConfigTab campaign={campaign} onUpdate={setCampaign} />;
      case 'import': return <ImportTab campaign={campaign} onUpdate={setCampaign} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen">
      {/* Header Area */}
      {/* 
          Mobile Layout:
          - If Admin: Show Sticky Header with scrollable tabs.
          - If Client: Show simple header. Navigation is handled by Bottom Fixed Tabs.
      */}
      <div className={`bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 sticky top-16 md:top-0 z-30 transition-colors duration-300 ${isClientRole ? 'hidden md:block' : ''}`}>
        <div className="px-4 md:px-8 pt-4">
            
            {/* Breadcrumbs - Only for Admin */}
            {!isClientRole && (
                <div className="flex items-center gap-2 text-xs md:text-sm text-zinc-500 mb-4">
                    <Link to="/clients" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">Clients</Link>
                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                    {client ? (
                        <Link to={`/clients/${client.id}`} className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">{client.name}</Link>
                    ) : (
                        <span>...</span>
                    )}
                    <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-zinc-900 dark:text-zinc-200 font-medium truncate max-w-[150px] md:max-w-none">{campaign.name}</span>
                </div>
            )}
            
            {/* Header Title Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{campaign.name}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${campaign.status === 'active' ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'}`}>
                            {campaign.status}
                        </span>
                        {campaign.budget && <span className="text-xs text-zinc-500">Budget: ${campaign.budget.toLocaleString()}</span>}
                    </div>
                </div>
            </div>

            {/* Desktop Tabs (or Admin Mobile Tabs) */}
            <div className="flex gap-6 overflow-x-auto no-scrollbar">
                {visibleTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group flex items-center gap-2 pb-3 px-1 border-b-2 transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
                            : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-800'
                        }`}
                    >
                        <div className={`p-1.5 rounded-lg transition-colors ${activeTab === tab.id ? 'bg-primary-500/10' : 'group-hover:bg-zinc-100 dark:group-hover:bg-white/5'}`}>
                             <tab.icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* MOBILE CLIENT HEADER (Simple) - Only visible for Clients on Mobile */}
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
      {/* Add padding-bottom for the fixed mobile tabs if client */}
      <div className={`flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto ${isClientRole ? 'pb-24' : ''}`}>
        {renderContent()}
      </div>

      {/* MOBILE BOTTOM TABS - CONTEXTUAL (CLIENT ONLY) */}
      {isClientRole && (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 animate-in slide-in-from-bottom-6 duration-500">
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 p-2 grid grid-cols-2 gap-2">
                {visibleTabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all duration-200 ${
                            activeTab === tab.id 
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                            : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5'
                        }`}
                    >
                        <tab.icon className="w-5 h-5 mb-0.5" />
                        <span className="text-[10px] font-medium">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
      )}

    </div>
  );
};
