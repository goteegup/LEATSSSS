import React, { useEffect, useState } from 'react';
import { useNavigate } from '../components/Layout';
import { getClients, loginAsClient, updateClient } from '../services/dataService';
import { Client } from '../types';
import { GlassCard, GlassButton, Badge, GlassInput, Toggle } from '../components/ui/Glass';
import { Modal } from '../components/ui/Modal';
import { Shield, ArrowRight, User, Search, Key, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export const Portal = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Access Management State
  const [manageAccessClient, setManageAccessClient] = useState<Client | null>(null);
  const [accessForm, setAccessForm] = useState({ email: '', password: '', is_enabled: false });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

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
      
      // Update local list
      setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
      setManageAccessClient(null);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                    <Shield className="w-8 h-8 text-primary-500" /> Client Portal Access
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">
                    Manage client login credentials and simulate client access. Clients can log in to view their dashboard and leads using the credentials you set here.
                </p>
            </div>
            
             <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Search clients..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-primary-500/50 transition-all"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map(client => (
                <GlassCard key={client.id} className="p-5 flex flex-col gap-4 group hover:border-primary-500/30 transition-all">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className="w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 overflow-hidden shrink-0">
                                 <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
                             </div>
                             <div>
                                 <h3 className="font-bold text-zinc-900 dark:text-white text-lg">{client.name}</h3>
                                 <div className="flex items-center gap-2 mt-1">
                                    <Badge color={client.status === 'active' ? 'primary' : 'zinc'}>{client.status}</Badge>
                                    {client.portal_access?.is_enabled && (
                                        <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase tracking-wide bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                                            <Shield className="w-3 h-3" /> Access
                                        </div>
                                    )}
                                 </div>
                             </div>
                         </div>
                         <button 
                            onClick={() => openManageAccess(client)}
                            className="p-2 text-zinc-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-colors"
                            title="Manage Portal Credentials"
                         >
                             <Key className="w-4 h-4" />
                         </button>
                    </div>

                    <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1 py-3 border-t border-b border-zinc-100 dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <User className="w-3 h-3" /> {client.contact_person || 'No contact'}
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="font-mono">{client.email || 'No email'}</span>
                        </div>
                    </div>

                    <GlassButton 
                        onClick={() => handleLoginAsClient(client.id)}
                        className="w-full justify-between mt-auto group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-500"
                    >
                        Login as Client <ArrowRight className="w-4 h-4" />
                    </GlassButton>
                </GlassCard>
            ))}
        </div>

        {/* MANAGE ACCESS MODAL */}
        <Modal isOpen={!!manageAccessClient} onClose={() => setManageAccessClient(null)} title="Manage Portal Access">
            {manageAccessClient && (
                <form onSubmit={handleSaveAccess} className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/5">
                        <div className="w-12 h-12 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-600 dark:text-primary-400">
                             <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-zinc-900 dark:text-white">{manageAccessClient.name}</h4>
                            <p className="text-xs text-zinc-500">Configure login credentials for this client.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border border-zinc-200 dark:border-white/10 rounded-xl">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-zinc-900 dark:text-white">Enable Portal Access</span>
                                <span className="text-xs text-zinc-500">Allow client to log in.</span>
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
                                placeholder="client@company.com"
                                required={accessForm.is_enabled}
                            />
                            
                             <div className="relative">
                                <GlassInput 
                                    label="Password"
                                    icon={<Lock className="w-4 h-4" />}
                                    type={showPassword ? "text" : "password"}
                                    value={accessForm.password}
                                    onChange={(e) => setAccessForm({...accessForm, password: e.target.value})}
                                    placeholder="••••••••"
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