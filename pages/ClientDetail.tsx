
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClientById, getCampaignsByClientId, createCampaign, updateClient, updateCampaign, getSession, uploadImage } from '../services/dataService';
import { Client, Campaign } from '../types';
import { GlassCard, GlassButton } from '../components/ui/Glass';
import { Modal } from '../components/ui/Modal';
import { KpiGrid } from '../components/shared/KpiGrid';
import { ChevronRight, LayoutDashboard, Plus, Edit2, Link as LinkIcon, Upload, Image as ImageIcon, Globe, User } from 'lucide-react';

export const ClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [session, setSession] = useState(getSession());
  
  // Modal States
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Forms
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignForm, setCampaignForm] = useState({ name: '', budget: 0, start_date: '', end_date: '', status: 'active' });
  
  const [clientForm, setClientForm] = useState({ name: '', contact_person: '', email: '', status: 'active', logo: '', address: '', website: '' });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (clientId) {
      getClientById(clientId).then(setClient);
      getCampaignsByClientId(clientId).then(setCampaigns);
    }
    setSession(getSession());
  }, [clientId]);

  // --- Campaign Handlers ---

  const openCreateCampaign = () => {
      setEditingCampaign(null);
      setCampaignForm({ name: '', budget: 0, start_date: '', end_date: '', status: 'active' });
      setIsCampaignModalOpen(true);
  };

  const openEditCampaign = (e: React.MouseEvent, campaign: Campaign) => {
      e.preventDefault();
      setEditingCampaign(campaign);
      setCampaignForm({
          name: campaign.name,
          budget: campaign.budget || 0,
          start_date: campaign.start_date || '',
          end_date: campaign.end_date || '',
          status: campaign.status
      });
      setIsCampaignModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!clientId || !campaignForm.name) return;
      
      if (editingCampaign) {
          const updated = await updateCampaign({
              ...editingCampaign,
              name: campaignForm.name,
              budget: Number(campaignForm.budget),
              start_date: campaignForm.start_date,
              end_date: campaignForm.end_date,
              status: campaignForm.status as 'active' | 'paused'
          });
          setCampaigns(campaigns.map(c => c.id === updated.id ? updated : c));
      } else {
          const created = await createCampaign({
              client_id: clientId,
              name: campaignForm.name,
              budget: Number(campaignForm.budget),
              start_date: campaignForm.start_date,
              end_date: campaignForm.end_date,
              status: campaignForm.status as 'active' | 'paused'
          });
          setCampaigns([...campaigns, created]);
      }
      setIsCampaignModalOpen(false);
  };

  // --- Client Handlers ---

  const openEditClient = () => {
      if (!client) return;
      setClientForm({
          name: client.name,
          contact_person: client.contact_person || '',
          email: client.email || '',
          status: client.status,
          logo: client.logo,
          address: client.address || '',
          website: client.website || ''
      });
      setIsClientModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
          const imageUrl = await uploadImage(file);
          setClientForm(prev => ({ ...prev, logo: imageUrl }));
      } catch (error) {
          console.error("Upload failed", error);
      } finally {
          setIsUploading(false);
      }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!client) return;
      const logoUrl = clientForm.logo.trim() !== '' 
        ? clientForm.logo 
        : `https://ui-avatars.com/api/?name=${clientForm.name}&background=random`;

      const updated = await updateClient({
          ...client,
          ...clientForm,
          logo: logoUrl,
          status: clientForm.status as 'active' | 'inactive'
      });
      setClient(updated);
      setIsClientModalOpen(false);
  };

  if (!client) return <div className="p-10 text-center text-zinc-500">Loading client...</div>;

  const isAdmin = session.role === 'admin';

  // Aggregate Stats
  const aggregateStats = {
      leads: campaigns.reduce((acc, c) => acc + c.stats.leads, 0),
      appointments: campaigns.reduce((acc, c) => acc + c.stats.appointments, 0),
      sales: campaigns.reduce((acc, c) => acc + c.stats.sales, 0),
      revenue: campaigns.reduce((acc, c) => acc + c.stats.revenue, 0),
      spend: campaigns.reduce((acc, c) => acc + c.stats.spend, 0),
  };

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
      {/* Breadcrumbs - Only for Admin */}
      {isAdmin && (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Link to="/clients" className="hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors">Clients</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-zinc-900 dark:text-zinc-200 font-medium">{client.name}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 overflow-hidden shrink-0">
                <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
            </div>
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">{client.name}</h1>
                    {isAdmin && (
                        <button onClick={openEditClient} className="p-1.5 text-zinc-400 hover:text-primary-500 bg-zinc-100 dark:bg-white/5 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${client.status === 'active' ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'bg-zinc-100 text-zinc-500'}`}>
                        {client.status}
                    </span>
                    {client.contact_person && (
                        <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {client.contact_person}
                        </span>
                    )}
                    {client.website && (
                         <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400 hover:underline cursor-pointer">
                             <Globe className="w-3 h-3" /> {client.website}
                         </span>
                    )}
                </div>
            </div>
        </div>
        
        {isAdmin && (
            <GlassButton onClick={openCreateCampaign}>
                <Plus className="w-4 h-4" /> New Campaign
            </GlassButton>
        )}
      </div>

      {/* Aggregate Stats Dashboard (Reusable) */}
      <KpiGrid stats={aggregateStats} columns={5} />

      {/* Campaigns Section */}
      <div>
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary-500" />
            Active Campaigns
        </h2>
        
        <div className="space-y-3">
             {campaigns.map(campaign => (
                <Link key={campaign.id} to={`/campaign/${campaign.id}`} className="group block relative">
                    <GlassCard className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 hover:border-primary-500/30 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/80 pr-12">
                        {/* Status Line */}
                        <div className="w-1 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full hidden md:block group-hover:bg-primary-500 transition-colors" />

                        <div className="flex-1 min-w-[200px]">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${campaign.status === 'active' ? 'bg-primary-500' : 'bg-yellow-500'}`} />
                                <span className="text-xs text-zinc-500 font-medium uppercase">{campaign.status}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate">{campaign.name}</h3>
                        </div>

                        {/* Full Metric Grid */}
                        <div className="w-full md:w-auto grid grid-cols-3 md:grid-cols-5 gap-4 text-sm flex-1">
                            <div className="p-2 md:p-0 bg-zinc-50 dark:bg-white/5 md:bg-transparent rounded-lg">
                                <span className="block text-zinc-500 text-[10px] uppercase">Leads</span>
                                <span className="font-semibold text-zinc-700 dark:text-zinc-200">{campaign.stats.leads}</span>
                            </div>
                            <div className="p-2 md:p-0 bg-zinc-50 dark:bg-white/5 md:bg-transparent rounded-lg">
                                <span className="block text-zinc-500 text-[10px] uppercase">Appts</span>
                                <span className="font-semibold text-purple-600 dark:text-purple-400">{campaign.stats.appointments}</span>
                            </div>
                            <div className="p-2 md:p-0 bg-zinc-50 dark:bg-white/5 md:bg-transparent rounded-lg">
                                <span className="block text-zinc-500 text-[10px] uppercase">Sales</span>
                                <span className="font-semibold text-green-600 dark:text-green-400">{campaign.stats.sales}</span>
                            </div>
                            <div className="p-2 md:p-0 bg-zinc-50 dark:bg-white/5 md:bg-transparent rounded-lg">
                                <span className="block text-zinc-500 text-[10px] uppercase">Rev</span>
                                <span className="font-semibold text-zinc-900 dark:text-white">${(campaign.stats.revenue/1000).toFixed(1)}k</span>
                            </div>
                             <div className="p-2 md:p-0 bg-zinc-50 dark:bg-white/5 md:bg-transparent rounded-lg">
                                <span className="block text-zinc-500 text-[10px] uppercase">Spend</span>
                                <span className="font-semibold text-rose-500">${(campaign.stats.spend/1000).toFixed(1)}k</span>
                            </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-primary-500 transition-colors hidden md:block" />
                        
                        {/* Edit Button Absolute */}
                        {isAdmin && (
                            <button 
                                onClick={(e) => openEditCampaign(e, campaign)}
                                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-primary-500 bg-white/50 dark:bg-black/20 rounded-lg opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                        )}
                    </GlassCard>
                </Link>
             ))}
             {campaigns.length === 0 && (
                 <div className="p-8 border border-dashed border-zinc-200 dark:border-white/10 rounded-2xl text-center text-zinc-500">
                     No campaigns found for this client.
                 </div>
             )}
        </div>
      </div>

      {/* CAMPAIGN MODAL (Create/Edit) - Admin Only */}
      {isAdmin && (
          <Modal isOpen={isCampaignModalOpen} onClose={() => setIsCampaignModalOpen(false)} title={editingCampaign ? "Edit Campaign" : "Create New Campaign"}>
            <form onSubmit={handleSaveCampaign} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Campaign Name</label>
                    <input 
                        type="text" 
                        required
                        value={campaignForm.name}
                        onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                        placeholder="e.g. Summer Sale 2024"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Budget ($)</label>
                        <input 
                            type="number" 
                            value={campaignForm.budget}
                            onChange={(e) => setCampaignForm({...campaignForm, budget: Number(e.target.value)})}
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                            placeholder="5000"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Status</label>
                        <select 
                            value={campaignForm.status}
                            onChange={(e) => setCampaignForm({...campaignForm, status: e.target.value})}
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                        >
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Start Date</label>
                        <input 
                            type="date" 
                            value={campaignForm.start_date}
                            onChange={(e) => setCampaignForm({...campaignForm, start_date: e.target.value})}
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">End Date (Opt)</label>
                        <input 
                            type="date" 
                            value={campaignForm.end_date}
                            onChange={(e) => setCampaignForm({...campaignForm, end_date: e.target.value})}
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                        />
                    </div>
                </div>

                <GlassButton type="submit" className="w-full justify-center mt-4">{editingCampaign ? "Save Changes" : "Create Campaign"}</GlassButton>
            </form>
          </Modal>
      )}

      {/* CLIENT MODAL - Admin Only */}
      {isAdmin && (
          <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Edit Client Details">
            <form onSubmit={handleUpdateClient} className="space-y-4">
                {/* Logo Upload */}
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Company Logo</label>
                    <div className="flex items-start gap-4">
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-20 h-20 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 flex items-center justify-center text-zinc-400 overflow-hidden shrink-0 cursor-pointer hover:border-primary-500 hover:text-primary-500 transition-all relative group"
                        >
                            {clientForm.logo ? (
                                <img src={clientForm.logo} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="w-8 h-8" />
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-3">
                             <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept="image/*"
                            />
                            
                            <GlassButton type="button" onClick={() => fileInputRef.current?.click()} variant="secondary" className="w-full justify-center text-xs h-8">
                                <Upload className="w-3 h-3" /> Choose File
                            </GlassButton>

                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={clientForm.logo}
                                    onChange={(e) => setClientForm({...clientForm, logo: e.target.value})}
                                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50 placeholder:text-zinc-400"
                                    placeholder="Or paste image URL"
                                />
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Company Name</label>
                    <input 
                        type="text" 
                        required
                        value={clientForm.name}
                        onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                    />
                </div>
                
                {/* Website Input */}
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Website Domain</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            value={clientForm.website}
                            onChange={(e) => setClientForm({...clientForm, website: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                            placeholder="example.com"
                        />
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Primary Contact</label>
                        <input 
                            type="text" 
                            value={clientForm.contact_person}
                            onChange={(e) => setClientForm({...clientForm, contact_person: e.target.value})}
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Email Address</label>
                        <input 
                            type="email" 
                            value={clientForm.email}
                            onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
                            className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Address</label>
                    <input 
                        type="text" 
                        value={clientForm.address}
                        onChange={(e) => setClientForm({...clientForm, address: e.target.value})}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Status</label>
                    <select 
                        value={clientForm.status}
                        onChange={(e) => setClientForm({...clientForm, status: e.target.value})}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <GlassButton type="submit" className="w-full justify-center mt-4" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Update Client'}
                </GlassButton>
            </form>
          </Modal>
      )}

    </div>
  );
};
