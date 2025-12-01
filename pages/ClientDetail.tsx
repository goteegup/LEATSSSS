import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from '../components/Layout';
import { getClientById, getCampaignsByClientId, createCampaign, updateClient, updateCampaign, getSession, uploadImage, duplicateCampaign, getCampaigns } from '../services/dataService';
import { Client, Campaign } from '../types';
import { GlassCard, GlassButton, Badge, Toggle } from '../components/ui/Glass';
import { Modal } from '../components/ui/Modal';
import { KpiGrid } from '../components/shared/KpiGrid';
import { ChevronRight, LayoutDashboard, Plus, Edit2, Link as LinkIcon, Upload, Image as ImageIcon, Globe, User, Copy, Settings, Calendar, DollarSign, Users, MousePointer2, Layers, Database } from 'lucide-react';

export const ClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [allTemplates, setAllTemplates] = useState<Campaign[]>([]); // For template selection
  const [session, setSession] = useState(getSession());
  
  // View State (Tabs)
  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates'>('campaigns');

  // Modal States
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  
  // Duplicate Modal State
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateSourceId, setDuplicateSourceId] = useState<string | null>(null);
  const [duplicateForm, setDuplicateForm] = useState({ name: '', isTemplate: false });

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Forms
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [campaignForm, setCampaignForm] = useState({ 
      name: '', 
      budget: 0, 
      start_date: '', 
      end_date: '', 
      status: 'active', 
      templateId: '',
      is_template: false // Track if we are creating a template
  });
  
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

  const openCreateCampaign = async () => {
      setEditingCampaign(null);
      // Default is_template to true if we are in the templates tab
      setCampaignForm({ 
          name: '', 
          budget: 0, 
          start_date: '', 
          end_date: '', 
          status: 'active', 
          templateId: '',
          is_template: activeTab === 'templates' 
      });
      
      // Load all campaigns to allow using them as templates
      const all = await getCampaigns();
      setAllTemplates(all);
      
      setIsCampaignModalOpen(true);
  };

  const openEditCampaign = (e: React.MouseEvent, campaign: Campaign) => {
      e.preventDefault();
      e.stopPropagation();
      setEditingCampaign(campaign);
      setCampaignForm({
          name: campaign.name,
          budget: campaign.budget || 0,
          start_date: campaign.start_date || '',
          end_date: campaign.end_date || '',
          status: campaign.status,
          templateId: '',
          is_template: campaign.is_template || false
      });
      setIsCampaignModalOpen(true);
  };

  const openDuplicateCampaign = (e: React.MouseEvent, campaign: Campaign) => {
      e.preventDefault();
      e.stopPropagation();
      setDuplicateSourceId(campaign.id);
      setDuplicateForm({ 
          name: `${campaign.name} (Copy)`, 
          isTemplate: campaign.is_template || false 
      });
      setIsDuplicateModalOpen(true);
  };

  const handleDuplicateSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!duplicateSourceId) return;

      const newCampaign = await duplicateCampaign(
          duplicateSourceId, 
          duplicateForm.name, 
          duplicateForm.isTemplate
      );
      
      if (newCampaign) {
          setCampaigns([...campaigns, newCampaign]);
      }
      setIsDuplicateModalOpen(false);
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
              status: campaignForm.status as 'active' | 'paused',
              is_template: campaignForm.is_template
          });
          setCampaigns(campaigns.map(c => c.id === updated.id ? updated : c));
      } else {
          const created = await createCampaign({
              client_id: clientId,
              name: campaignForm.name,
              budget: Number(campaignForm.budget),
              start_date: campaignForm.start_date,
              end_date: campaignForm.end_date,
              status: campaignForm.status as 'active' | 'paused',
              templateCampaignId: campaignForm.templateId, // Pass template ID
              is_template: campaignForm.is_template
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

  // Aggregate Stats (Only calculate from non-template campaigns)
  const realCampaigns = campaigns.filter(c => !c.is_template);
  const aggregateStats = {
      leads: realCampaigns.reduce((acc, c) => acc + c.stats.leads, 0),
      appointments: realCampaigns.reduce((acc, c) => acc + c.stats.appointments, 0),
      sales: realCampaigns.reduce((acc, c) => acc + c.stats.sales, 0),
      revenue: realCampaigns.reduce((acc, c) => acc + c.stats.revenue, 0),
      spend: realCampaigns.reduce((acc, c) => acc + c.stats.spend, 0),
  };

  // Filter List based on Tab
  const displayedCampaigns = activeTab === 'campaigns' 
    ? campaigns.filter(c => !c.is_template)
    : campaigns.filter(c => c.is_template);

  // Group templates for dropdown
  const templateCampaigns = allTemplates.filter(t => t.is_template);
  const otherCampaigns = allTemplates.filter(t => !t.is_template);

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
                <Plus className="w-4 h-4" /> {activeTab === 'templates' ? 'New Template' : 'New Campaign'}
            </GlassButton>
        )}
      </div>

      {/* Aggregate Stats Dashboard (Reusable) - Only show for Active Campaigns view */}
      {activeTab === 'campaigns' && (
          <KpiGrid stats={aggregateStats} columns={5} />
      )}

      {/* Campaigns Section with Tabs */}
      <div>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                    {activeTab === 'campaigns' ? <LayoutDashboard className="w-5 h-5 text-primary-500" /> : <Layers className="w-5 h-5 text-purple-500" />}
                    {activeTab === 'campaigns' ? 'Active Campaigns' : 'Templates'}
                </h2>
                
                {/* Tabs Switcher */}
                <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-white/5">
                    <button
                        onClick={() => setActiveTab('campaigns')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'campaigns' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                    >
                        Campaigns
                    </button>
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeTab === 'templates' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                    >
                        Templates
                    </button>
                </div>
            </div>
        </div>
        
        <div className="space-y-4">
             {displayedCampaigns.map(campaign => (
                <Link key={campaign.id} to={`/campaign/${campaign.id}`} className="group block relative">
                    <GlassCard className="p-0 overflow-hidden hover:border-primary-500/30 transition-all hover:bg-zinc-50/50 dark:hover:bg-zinc-900/80 flex flex-col md:flex-row relative z-0">
                        
                        {/* Status Strip */}
                        <div className={`w-full md:w-1.5 h-1.5 md:h-auto ${campaign.status === 'active' ? 'bg-primary-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />

                        {/* Content Body */}
                        <div className="p-5 flex-1 flex flex-col md:flex-row gap-6 md:items-center">
                            
                            {/* Campaign Info */}
                            <div className="flex-1 min-w-[200px]">
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge color={campaign.status === 'active' ? 'primary' : 'zinc'}>
                                        {campaign.status}
                                    </Badge>
                                    {campaign.is_template && (
                                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20">
                                            <Layers className="w-3 h-3" /> Template
                                        </div>
                                    )}
                                    <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">ID: {campaign.id.slice(0,6)}</span>
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {campaign.name}
                                </h3>
                                <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                                    <MousePointer2 className="w-3 h-3" /> Meta Ads
                                    {campaign.budget > 0 && <span>• ${campaign.budget.toLocaleString()} Budget</span>}
                                </div>
                            </div>

                            {/* THE BIG 3 METRICS (Only show real values for campaigns, not templates usually) */}
                            {!campaign.is_template && (
                                <div className="flex items-center gap-2 md:gap-6 bg-zinc-50/50 dark:bg-black/20 p-2 md:p-3 rounded-xl border border-zinc-200/50 dark:border-white/5 w-full md:w-auto justify-between md:justify-start">
                                    
                                    {/* 1. Revenue (Highlighted) */}
                                    <div className="flex flex-col px-2 md:px-4 border-r border-zinc-200 dark:border-white/5 last:border-0">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                                            <DollarSign className="w-3 h-3 text-green-500" /> Revenue
                                        </span>
                                        <span className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white">
                                            ${(campaign.stats.revenue/1000).toFixed(1)}k
                                        </span>
                                    </div>

                                    {/* 2. Appointments */}
                                    <div className="flex flex-col px-2 md:px-4 border-r border-zinc-200 dark:border-white/5 last:border-0">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                                            <Calendar className="w-3 h-3 text-purple-500" /> Appts
                                        </span>
                                        <span className="text-base md:text-lg font-bold text-zinc-700 dark:text-zinc-200">
                                            {campaign.stats.appointments}
                                        </span>
                                    </div>

                                    {/* 3. Leads */}
                                    <div className="flex flex-col px-2 md:px-4 last:border-0">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                                            <Users className="w-3 h-3 text-blue-500" /> Leads
                                        </span>
                                        <span className="text-base md:text-lg font-bold text-zinc-700 dark:text-zinc-200">
                                            {campaign.stats.leads}
                                        </span>
                                    </div>
                                </div>
                            )}

                             {/* Templates get a simpler info block */}
                            {campaign.is_template && (
                                <div className="hidden md:flex items-center gap-4 text-xs text-zinc-500 bg-zinc-50 dark:bg-white/5 px-4 py-2 rounded-lg border border-zinc-200 dark:border-white/5">
                                    <div className="flex items-center gap-1"><Layers className="w-3 h-3"/> {campaign.settings.pipeline_stages.length} Stages</div>
                                    <div className="flex items-center gap-1"><Database className="w-3 h-3"/> {campaign.settings.custom_fields.length} Custom Fields</div>
                                </div>
                            )}

                            {/* Actions (Isolated) */}
                            {isAdmin && (
                                <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-white/5 md:ml-auto">
                                    <button 
                                        onClick={(e) => openDuplicateCampaign(e, campaign)}
                                        className="p-2.5 text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                        title="Duplicate / Use as Template"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={(e) => openEditCampaign(e, campaign)}
                                        className="p-2.5 text-zinc-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
                                        title="Edit Settings"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>
                                    
                                    <div className="hidden md:block w-px h-6 bg-zinc-200 dark:bg-white/10 mx-1" />
                                    
                                    <div className="p-2 text-zinc-300 group-hover:text-primary-500 transition-colors">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            )}
                            
                            {/* Mobile Chevron (If not admin or just visual) */}
                            {!isAdmin && (
                                <div className="flex items-center justify-end md:hidden">
                                     <ChevronRight className="w-5 h-5 text-zinc-400" />
                                </div>
                            )}
                        </div>
                    </GlassCard>
                </Link>
             ))}
             
             {displayedCampaigns.length === 0 && (
                 <div className="p-12 border border-dashed border-zinc-200 dark:border-white/10 rounded-2xl text-center flex flex-col items-center gap-4">
                     <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center">
                        {activeTab === 'campaigns' ? <LayoutDashboard className="w-6 h-6 text-zinc-400" /> : <Layers className="w-6 h-6 text-zinc-400" />}
                     </div>
                     <div>
                        <h3 className="text-zinc-900 dark:text-white font-medium">
                            {activeTab === 'campaigns' ? 'No active campaigns' : 'No templates found'}
                        </h3>
                        <p className="text-zinc-500 text-sm">
                            {activeTab === 'campaigns' ? 'Create a new campaign to start tracking metrics.' : 'Create a template to standardise your workflows.'}
                        </p>
                     </div>
                 </div>
             )}
        </div>
      </div>

      {/* CAMPAIGN MODAL (Create/Edit) - Admin Only */}
      {isAdmin && (
          <Modal isOpen={isCampaignModalOpen} onClose={() => setIsCampaignModalOpen(false)} title={editingCampaign ? "Edit Campaign" : (activeTab === 'templates' ? "Create New Template" : "Create New Campaign")}>
            <form onSubmit={handleSaveCampaign} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Name</label>
                    <input 
                        type="text" 
                        required
                        value={campaignForm.name}
                        onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                        placeholder={activeTab === 'templates' ? "e.g. Dental Audit Template" : "e.g. Summer Sale 2024"}
                    />
                </div>

                {!editingCampaign && (
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5 space-y-4">
                        
                        {/* 1. Template Selection */}
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Copy className="w-3 h-3" /> Copy Settings from...
                            </label>
                            <select 
                                value={campaignForm.templateId}
                                onChange={(e) => setCampaignForm({...campaignForm, templateId: e.target.value})}
                                className="w-full px-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                            >
                                <option value="">Start from Scratch (Default)</option>
                                
                                {templateCampaigns.length > 0 && (
                                    <optgroup label="Saved Templates">
                                        {templateCampaigns.map(t => (
                                            <option key={t.id} value={t.id}>★ {t.name}</option>
                                        ))}
                                    </optgroup>
                                )}

                                {otherCampaigns.length > 0 && (
                                    <optgroup label="Other Campaigns">
                                        {otherCampaigns.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </optgroup>
                                )}
                            </select>
                        </div>
                        
                        {/* 2. Save as Template Option */}
                        <div className="flex items-center justify-between border-t border-zinc-200 dark:border-white/10 pt-4">
                             <div>
                                <label className="text-sm font-semibold text-zinc-900 dark:text-white block">Mark as Template</label>
                                <p className="text-[10px] text-zinc-500">Will appear in the 'Templates' tab.</p>
                             </div>
                             <Toggle 
                                checked={campaignForm.is_template} 
                                onChange={(val) => setCampaignForm({...campaignForm, is_template: val})} 
                             />
                        </div>
                    </div>
                )}
                
                {/* Editing mode: allow toggling template status */}
                {editingCampaign && (
                    <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/10">
                             <div>
                                <label className="text-sm font-semibold text-zinc-900 dark:text-white block">Is Template?</label>
                             </div>
                             <Toggle 
                                checked={campaignForm.is_template} 
                                onChange={(val) => setCampaignForm({...campaignForm, is_template: val})} 
                             />
                    </div>
                )}
                
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

                <GlassButton type="submit" className="w-full justify-center mt-4">
                    {editingCampaign ? "Save Changes" : (campaignForm.is_template ? "Create Template" : "Create Campaign")}
                </GlassButton>
            </form>
          </Modal>
      )}

      {/* DUPLICATE MODAL - Admin Only */}
      {isAdmin && (
          <Modal isOpen={isDuplicateModalOpen} onClose={() => setIsDuplicateModalOpen(false)} title="Duplicate Campaign">
              <form onSubmit={handleDuplicateSubmit} className="space-y-6">
                  <div>
                      <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">New Name</label>
                      <input 
                          type="text" 
                          autoFocus
                          required
                          value={duplicateForm.name}
                          onChange={(e) => setDuplicateForm({...duplicateForm, name: e.target.value})}
                          className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                      />
                  </div>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/5 flex items-start gap-3">
                      <div className="flex-1">
                          <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
                               <Layers className="w-4 h-4 text-purple-500" /> Save as Template
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                              If enabled, this copy will be marked as a template. It will appear in the 'Templates' tab for easy reuse.
                          </p>
                      </div>
                      <Toggle 
                          checked={duplicateForm.isTemplate} 
                          onChange={(val) => setDuplicateForm({...duplicateForm, isTemplate: val})} 
                      />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-500 bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                      <Settings className="w-4 h-4 text-blue-500" />
                      <span>Pipelines, Custom Fields, and Card Layouts will be copied. Leads will NOT be copied.</span>
                  </div>

                  <GlassButton type="submit" className="w-full justify-center">Duplicate Campaign</GlassButton>
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