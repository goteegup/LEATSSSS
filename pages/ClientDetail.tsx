import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from '../components/Layout';
import { getClientById, getCampaignsByClientId, createCampaign, updateClient, updateCampaign, getSession, uploadImage, duplicateCampaign, getCampaigns } from '../services/dataService';
import { Client, Campaign } from '../types';
import { GlassCard, GlassButton, Badge, Toggle } from '../components/ui/Glass';
import { Modal } from '../components/ui/Modal';
import { KpiGrid } from '../components/shared/KpiGrid';
import { ChevronRight, LayoutDashboard, Plus, Edit2, Globe, User, Copy, Settings, MousePointer2 } from 'lucide-react';

export const ClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [allTemplates, setAllTemplates] = useState<Campaign[]>([]);
  const [session, setSession] = useState(getSession());
  
  // Modal States
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  
  // Forms
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignForm, setCampaignForm] = useState({ 
      name: '', budget: 0, status: 'active', templateId: ''
  });
  
  useEffect(() => {
    if (clientId) {
      getClientById(clientId).then(setClient);
      getCampaignsByClientId(clientId).then(setCampaigns);
    }
    setSession(getSession());
  }, [clientId]);

  // --- Campaign Handlers ---

  const openCreateCampaign = async () => {
      setEditingCampaign(null);
      setCampaignForm({ name: '', budget: 0, status: 'active', templateId: '' });
      const all = await getCampaigns();
      setAllTemplates(all.filter(c => c.is_template));
      setIsCampaignModalOpen(true);
  };

  const openEditCampaign = (e: React.MouseEvent, campaign: Campaign) => {
      e.preventDefault();
      e.stopPropagation();
      setEditingCampaign(campaign);
      setCampaignForm({
          name: campaign.name,
          budget: campaign.budget || 0,
          status: campaign.status,
          templateId: ''
      });
      setIsCampaignModalOpen(true);
  };

  const handleSimpleDuplicate = async (e: React.MouseEvent, campaign: Campaign) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm(`Create a copy of "${campaign.name}" for this client?`)) {
          const newCampaign = await duplicateCampaign(campaign.id, `${campaign.name} (Copy)`, false);
          if (newCampaign) {
              setCampaigns(prev => [...prev, newCampaign]);
          }
      }
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!clientId || !campaignForm.name) return;
      
      if (editingCampaign) {
          const updated = await updateCampaign({
              ...editingCampaign,
              name: campaignForm.name,
              budget: Number(campaignForm.budget),
              status: campaignForm.status as 'active' | 'paused',
          });
          setCampaigns(campaigns.map(c => c.id === updated.id ? updated : c));
      } else {
          const created = await createCampaign({
              client_id: clientId,
              name: campaignForm.name,
              budget: Number(campaignForm.budget),
              status: campaignForm.status as 'active' | 'paused',
              templateCampaignId: campaignForm.templateId,
          });
          setCampaigns([...campaigns, created]);
      }
      setIsCampaignModalOpen(false);
  };

  if (!client) return <div className="p-10 text-center text-zinc-500">Loading client...</div>;

  const isAdmin = session.role === 'admin';
  const displayedCampaigns = campaigns.filter(c => !c.is_template);
  
  const aggregateStats = {
      leads: displayedCampaigns.reduce((acc, c) => acc + c.stats.leads, 0),
      appointments: displayedCampaigns.reduce((acc, c) => acc + c.stats.appointments, 0),
      sales: displayedCampaigns.reduce((acc, c) => acc + c.stats.sales, 0),
      revenue: displayedCampaigns.reduce((acc, c) => acc + c.stats.revenue, 0),
      spend: displayedCampaigns.reduce((acc, c) => acc + c.stats.spend, 0),
  };

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {isAdmin && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link to="/clients" className="hover:text-zinc-800 dark:hover:text-zinc-300">Clients</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-zinc-900 dark:text-zinc-200 font-medium">{client.name}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 overflow-hidden shrink-0"><img src={client.logo} alt={client.name} className="w-full h-full object-cover" /></div>
            <div>
                <div className="flex items-center gap-3"><h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">{client.name}</h1></div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${client.status === 'active' ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'bg-zinc-100 text-zinc-500'}`}>{client.status}</span>
                    {client.contact_person && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {client.contact_person}</span>}
                    {client.website && <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"><Globe className="w-3 h-3" /> {client.website}</span>}
                </div>
            </div>
        </div>
        
        {isAdmin && (<GlassButton onClick={openCreateCampaign}><Plus className="w-4 h-4" /> New Campaign</GlassButton>)}
      </div>

      <KpiGrid stats={aggregateStats} columns={5} />

      <div>
        <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-semibold text-zinc-900 dark:text-white flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-primary-500" /> Campaigns</h2></div>
        <div className="space-y-4">
             {displayedCampaigns.map(campaign => (
                <Link key={campaign.id} to={`/campaign/${campaign.id}`} className="group block relative">
                    <GlassCard className="p-0 overflow-hidden hover:border-primary-500/30 transition-all flex flex-col md:flex-row">
                        <div className={`w-full md:w-1.5 h-1.5 md:h-auto ${campaign.status === 'active' ? 'bg-primary-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
                        <div className="p-5 flex-1 flex flex-col md:flex-row gap-6 md:items-center">
                            <div className="flex-1 min-w-[200px]"><h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-primary-600 dark:group-hover:text-primary-400">{campaign.name}</h3><div className="text-xs text-zinc-500 mt-1 flex items-center gap-2"><MousePointer2 className="w-3 h-3" /> Meta Ads</div></div>
                            <div className="flex items-center gap-2 md:gap-6 bg-zinc-50/50 dark:bg-black/20 p-2 md:p-3 rounded-xl border border-zinc-200/50 dark:border-white/5 w-full md:w-auto justify-between md:justify-start">
                                {/* Metrics... */}
                            </div>
                            {isAdmin && (
                                <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-white/5 md:ml-auto">
                                    <button onClick={(e) => handleSimpleDuplicate(e, campaign)} className="p-2.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg"><Copy className="w-4 h-4" /></button>
                                    <button onClick={(e) => openEditCampaign(e, campaign)} className="p-2.5 text-zinc-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg"><Settings className="w-4 h-4" /></button>
                                    <div className="hidden md:block w-px h-6 bg-zinc-200 dark:bg-white/10 mx-1" />
                                    <div className="p-2 text-zinc-300 group-hover:text-primary-500"><ChevronRight className="w-5 h-5" /></div>
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </Link>
             ))}
        </div>
      </div>

      {isAdmin && (
          <Modal isOpen={isCampaignModalOpen} onClose={() => setIsCampaignModalOpen(false)} title={editingCampaign ? "Edit Campaign" : "Create New Campaign"}>
            <form onSubmit={handleSaveCampaign} className="space-y-4">
                <div><label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Name</label><input type="text" required value={campaignForm.name} onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl" placeholder="e.g. Summer Sale 2024" /></div>
                {!editingCampaign && <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5 space-y-2"><label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Use Blueprint</label><select value={campaignForm.templateId} onChange={(e) => setCampaignForm({...campaignForm, templateId: e.target.value})} className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-lg text-sm"><option value="">Start from Scratch</option>{allTemplates.map(t => <option key={t.id} value={t.id}>★ {t.name}</option>)}</select></div>}
                <GlassButton type="submit" className="w-full justify-center mt-4">{editingCampaign ? "Save Changes" : "Create Campaign"}</GlassButton>
            </form>
          </Modal>
      )}
    </div>
  );
};
