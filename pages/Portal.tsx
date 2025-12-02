import React, { useEffect, useState } from 'react';
import { useNavigate } from '../components/Layout';
import { getClients, loginAsClient, updateClient } from '../services/dataService';
import { Client } from '../types';
import { GlassCard, GlassButton, Badge, GlassInput, Toggle } from '../components/ui/Glass';
import { Modal } from '../components/ui/Modal';
import { Shield, ArrowRight, User, Search, Key, Lock, Eye, EyeOff, LayoutDashboard } from 'lucide-react';

export const Portal = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  // Access Management State
  const [manageAccessClient, setManageAccessClient] = useState<Client | null>(null);
  const [accessForm, setAccessForm] = useState({ email: '', password: '', is_enabled: false });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    getClients().then(setClients);
  }, []);

  const handleLoginAsClient = async (clientId: string) => {
      await loginAsClient(clientId);
      navigate(`/clients/${clientId}`);
  };

  const openManageAccess = (client: Client) => {
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

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-5xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary-500" /> Client Portal Access
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Manage portal credentials and impersonate client views.</p>
            </div>
            
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Search clients..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:border-primary-500"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
            {filteredClients.map(client => (
                <GlassCard key={client.id} className="p-4 flex flex-col md:flex-row items-center gap-4 group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0 text-center md:text-left">
                        <h3 className="font-bold text-zinc-900 dark:text-white truncate">{client.name}</h3>
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                            {client.portal_access?.is_enabled ? (
                                <Badge color="primary">Portal Active</Badge>
                            ) : (
                                <Badge color="zinc">Portal Inactive</Badge>
                            )}
                            <span className="text-xs text-zinc-500">{client.email}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <GlassButton 
                            variant="secondary" 
                            onClick={() => openManageAccess(client)}
                            className="flex-1 md:flex-none justify-center text-xs h-9"
                        >
                            <Key className="w-3 h-3" /> Credentials
                        </GlassButton>
                        <GlassButton 
                            onClick={() => handleLoginAsClient(client.id)}
                            className="flex-1 md:flex-none justify-center text-xs h-9 shadow-lg shadow-primary-500/10"
                            disabled={!client.portal_access?.is_enabled}
                        >
                            <LayoutDashboard className="w-3 h-3" /> Login as Client
                        </GlassButton>
                    </div>

                </GlassCard>
            ))}

            {filteredClients.length === 0 && (
                <div className="text-center py-12 text-zinc-500">
                    No clients found.
                </div>
            )}
        </div>

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