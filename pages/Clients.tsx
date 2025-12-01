import React, { useEffect, useState, useRef } from 'react';
import { Link } from '../components/Layout';
import { Client, Campaign } from '../types';
import { getClients, getCampaigns, createClient, updateClient, uploadImage } from '../services/dataService';
import { GlassCard, GlassButton, Badge, GlassInput, Toggle } from '../components/ui/Glass';
import { Modal } from '../components/ui/Modal';
import { Search, Plus, User, Globe, Edit2, Upload, Link as LinkIcon, Image as ImageIcon, Briefcase, TrendingUp, MapPin, Key, Shield, Lock, Eye, EyeOff, X } from 'lucide-react';

export const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Client Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({ name: '', contact_person: '', email: '', status: 'active', logo: '', address: '', website: '' });
  const [isUploading, setIsUploading] = useState(false);

  // Access Modal
  const [manageAccessClient, setManageAccessClient] = useState<Client | null>(null);
  const [accessForm, setAccessForm] = useState({ email: '', password: '', is_enabled: false });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    Promise.all([getClients(), getCampaigns()]).then(([clientsData, campaignsData]) => {
      setClients(clientsData);
      setCampaigns(campaignsData);
    });
  }, []);

  // --- Client CRUD Handlers ---

  const openCreateModal = () => {
      setEditingClient(null);
      setFormData({ name: '', contact_person: '', email: '', status: 'active', logo: '', address: '', website: '' });
      setIsModalOpen(true);
  };

  const openEditModal = (e: React.MouseEvent, client: Client) => {
      e.preventDefault(); 
      e.stopPropagation();
      setEditingClient(client);
      setFormData({
          name: client.name,
          contact_person: client.contact_person || '',
          email: client.email || '',
          status: client.status,
          logo: client.logo,
          address: client.address || '',
          website: client.website || ''
      });
      setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
          // Simulate upload delay for realism
          const imageUrl = await uploadImage(file);
          setTimeout(() => {
              setFormData(prev => ({ ...prev, logo: imageUrl }));
              setIsUploading(false);
          }, 600);
      } catch (error) {
          console.error("Upload failed", error);
          setIsUploading(false);
      }
  };

  const handleSaveClient = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name) return;
      
      const logoUrl = formData.logo.trim() !== '' 
        ? formData.logo 
        : `https://ui-avatars.com/api/?name=${formData.name}&background=random`;

      if (editingClient) {
          // Update
          const updated = await updateClient({
              ...editingClient,
              ...formData,
              logo: logoUrl,
              status: formData.status as 'active' | 'inactive'
          });
          setClients(clients.map(c => c.id === updated.id ? updated : c));
      } else {
          // Create
          const created = await createClient({
              ...formData,
              logo: logoUrl,
              status: formData.status as 'active' | 'inactive'
          });
          setClients([...clients, created]);
      }
      setIsModalOpen(false);
  };

  // --- Portal Access Handlers ---

  const openManageAccess = (e: React.MouseEvent, client: Client) => {
      e.preventDefault();
      e.stopPropagation();
      setManageAccessClient(client);
      setAccessForm({
          email: client.portal_access?.email || client.email || '',
          password: client.portal_access?.password || '',
          is_enabled: client.portal_access?.is_enabled || false
      });
      setShowPassword(false);
  };

  const handleSaveAccess = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!manageAccessClient) return;

      const updatedClient = {
          ...manageAccessClient,
          portal_access: {
              email: accessForm.email,
              password: accessForm.password,
              is_enabled: accessForm.is_enabled
          }
      };

      await updateClient(updatedClient);
      setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
      setManageAccessClient(null);
  };


  const getClientStats = (clientId: string) => {
    const clientCampaigns = campaigns.filter(c => c.client_id === clientId);
    const revenue = clientCampaigns.reduce((acc, c) => acc + c.stats.revenue, 0);
    const activeCount = clientCampaigns.filter(c => c.status === 'active').length;
    return { revenue, activeCount, totalCampaigns: clientCampaigns.length };
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Clients</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Select a client to view their campaigns.</p>
        </div>
        <GlassButton onClick={openCreateModal} className="w-full md:w-auto">
            <Plus className="w-4 h-4" /> Add Client
        </GlassButton>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input 
            type="text" 
            placeholder="Search clients..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all placeholder:text-zinc-400"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => {
            const stats = getClientStats(client.id);
            return (
                <Link key={client.id} to={`/clients/${client.id}`} className="group relative block h-full">
                  <GlassCard className="p-5 flex flex-col gap-4 hover:border-primary-500/30 transition-all h-full relative overflow-hidden">
                      
                      {/* Top Row */}
                      <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden border border-zinc-200 dark:border-white/5 shrink-0">
                                  <img src={client.logo} alt={client.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              </div>
                              <div className="min-w-0">
                                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">{client.name}</h3>
                                  <div className="flex items-center gap-2 mt-0.5">
                                      <Badge color={client.status === 'active' ? 'primary' : 'zinc'}>{client.status}</Badge>
                                      {client.portal_access?.is_enabled && (
                                          <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase tracking-wide bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                                              <Shield className="w-3 h-3" /> Portal
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </div>
                          
                          <div className="flex gap-1 z-10">
                              <button 
                                onClick={(e) => openManageAccess(e, client)}
                                className="p-2 text-zinc-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
                                title="Manage Portal Access"
                              >
                                 <Key className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => openEditModal(e, client)}
                                className="p-2 text-zinc-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
                                title="Edit Client"
                              >
                                 <Edit2 className="w-4 h-4" />
                              </button>
                          </div>
                      </div>

                      {/* Contact Info Preview */}
                      <div className="space-y-1.5">
                          {client.website && (
                              <div className="text-xs text-zinc-500 flex items-center gap-2 truncate">
                                  <Globe className="w-3 h-3 text-zinc-400" /> 
                                  <span className="text-primary-600 dark:text-primary-400 hover:underline">{client.website}</span>
                              </div>
                          )}
                          {(client.contact_person || client.address) && (
                            <div className="text-xs text-zinc-500 space-y-1">
                                {client.contact_person && (
                                    <div className="flex items-center gap-2">
                                        <User className="w-3 h-3 text-zinc-400" /> {client.contact_person}
                                    </div>
                                )}
                                {client.address && (
                                    <div className="flex items-center gap-2 truncate">
                                        <MapPin className="w-3 h-3 text-zinc-400" /> {client.address}
                                    </div>
                                )}
                            </div>
                          )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mt-auto pt-3 border-t border-zinc-100 dark:border-white/5">
                          <div>
                              <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                                  <Briefcase className="w-3 h-3" />
                                  <span>Campaigns</span>
                              </div>
                              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-200">
                                  {stats.activeCount} <span className="text-xs text-zinc-500 font-normal">/ {stats.totalCampaigns}</span>
                              </p>
                          </div>
                          <div>
                              <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
                                  <TrendingUp className="w-3 h-3" />
                                  <span>Revenue</span>
                              </div>
                              <p className="text-lg font-medium text-primary-600 dark:text-primary-400">
                                  ${(stats.revenue / 1000).toFixed(1)}k
                              </p>
                          </div>
                      </div>
                  </GlassCard>
                </Link>
            );
        })}
        
        {filteredClients.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-500">
                No clients found.
            </div>
        )}
      </div>

      {/* CREATE/EDIT CLIENT MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? "Edit Client" : "Create New Client"}>
        <form onSubmit={handleSaveClient} className="space-y-4">
            {/* Logo Upload Section - Fixed */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5 space-y-3">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Client Logo</label>
                
                <div className="flex items-center gap-4">
                    {/* Visual Preview Box */}
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            relative w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden shrink-0 cursor-pointer border-2 border-dashed transition-all group
                            ${formData.logo ? 'border-primary-500/50 bg-black/10' : 'border-zinc-300 dark:border-white/10 hover:border-primary-500 hover:bg-white/5'}
                        `}
                    >
                        {isUploading ? (
                            <div className="animate-spin w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full" />
                        ) : formData.logo ? (
                            <img src={formData.logo} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="w-8 h-8 text-zinc-400 group-hover:text-primary-500 transition-colors" />
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Upload className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                            <GlassButton type="button" onClick={() => fileInputRef.current?.click()} variant="secondary" className="text-xs h-8 flex-1 justify-center">
                                Upload File
                            </GlassButton>
                             {formData.logo && (
                                <button type="button" onClick={() => setFormData({...formData, logo: ''})} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20">
                                    <X className="w-4 h-4" />
                                </button>
                             )}
                        </div>
                        
                        {/* Hidden Input */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*"
                        />
                        
                        {/* URL Fallback */}
                        <div className="relative">
                            <input 
                                type="text" 
                                value={formData.logo}
                                onChange={(e) => setFormData({...formData, logo: e.target.value})}
                                className="w-full pl-7 pr-2 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-lg text-xs text-zinc-500 focus:outline-none focus:border-primary-500/50 placeholder:text-zinc-400"
                                placeholder="https://..."
                            />
                            <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Company Name</label>
                <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                    placeholder="e.g. Acme Corp"
                />
            </div>

            {/* Website / Domain Input */}
            <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Website Domain</label>
                <div className="relative">
                    <input 
                        type="text" 
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
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
                        value={formData.contact_person}
                        onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                        placeholder="John Smith"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Email Address</label>
                    <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                        placeholder="john@acme.com"
                    />
                </div>
            </div>
            
             <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Address</label>
                <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                    placeholder="123 Business St."
                />
            </div>
            
            <div>
                 <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5">Status</label>
                 <select 
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                 >
                     <option value="active">Active</option>
                     <option value="inactive">Inactive</option>
                 </select>
            </div>

            <GlassButton type="submit" className="w-full justify-center mt-4" disabled={isUploading}>
                {isUploading ? 'Uploading...' : (editingClient ? 'Save Changes' : 'Create Client')}
            </GlassButton>
        </form>
      </Modal>

      {/* MANAGE ACCESS MODAL */}
      <Modal isOpen={!!manageAccessClient} onClose={() => setManageAccessClient(null)} title="Portal Access">
            {manageAccessClient && (
                <form onSubmit={handleSaveAccess} className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/5">
                        <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400">
                             <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-zinc-900 dark:text-white">{manageAccessClient.name}</h4>
                            <p className="text-xs text-zinc-500">Login credentials for client portal.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-zinc-200 dark:border-white/10 rounded-xl">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-zinc-900 dark:text-white">Enable Access</span>
                            </div>
                            <Toggle 
                                checked={accessForm.is_enabled} 
                                onChange={(val) => setAccessForm({...accessForm, is_enabled: val})} 
                            />
                        </div>

                        <div className={`space-y-4 transition-all duration-300 ${accessForm.is_enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                            <GlassInput 
                                label="Login Email"
                                icon={<User className="w-4 h-4" />}
                                type="email"
                                value={accessForm.email}
                                onChange={(e) => setAccessForm({...accessForm, email: e.target.value})}
                                required={accessForm.is_enabled}
                            />
                            
                             <div className="relative">
                                <GlassInput 
                                    label="Password"
                                    icon={<Lock className="w-4 h-4" />}
                                    type={showPassword ? "text" : "password"}
                                    value={accessForm.password}
                                    onChange={(e) => setAccessForm({...accessForm, password: e.target.value})}
                                    required={accessForm.is_enabled}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[34px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                             </div>
                        </div>
                    </div>

                    <GlassButton type="submit" className="w-full justify-center">Save Credentials</GlassButton>
                </form>
            )}
        </Modal>
    </div>
  );
};