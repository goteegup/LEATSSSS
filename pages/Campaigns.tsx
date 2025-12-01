
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Campaign, Client } from '../types';
import { getCampaigns, getClients } from '../services/dataService';
import { GlassCard, GlassButton, Badge } from '../components/ui/Glass';
import { Search, Plus, Filter, ArrowRight, DollarSign, Users, MousePointer2 } from 'lucide-react';

export const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    Promise.all([getCampaigns(), getClients()]).then(([campaignsData, clientsData]) => {
      setCampaigns(campaignsData);
      setClients(clientsData);
    });
  }, []);

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unknown Client';

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || c.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">Campaigns</h1>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">Monitor performance across all active initiatives.</p>
            </div>
            <GlassButton className="w-full md:w-auto">
                <Plus className="w-4 h-4" /> New Campaign
            </GlassButton>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Search campaigns..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 rounded-xl text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 transition-all placeholder:text-zinc-400"
                />
            </div>
            
            {/* Filter Tabs (Mobile Scrollable) */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                {(['all', 'active', 'paused', 'completed'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap capitalize ${
                            filter === f 
                            ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 shadow-sm' 
                            : 'bg-white dark:bg-zinc-900/40 text-zinc-500 border border-zinc-200 dark:border-white/5 hover:text-zinc-800 dark:hover:text-zinc-300'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-3">
            {filteredCampaigns.map(campaign => (
                <Link key={campaign.id} to={`/campaign/${campaign.id}`}>
                    <GlassCard className="p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 group hover:border-primary-500/30 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/80">
                        
                        {/* Status & Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${campaign.status === 'active' ? 'bg-primary-500 shadow-[0_0_6px_rgba(20,184,166,0.5)]' : 'bg-zinc-400'}`} />
                                <span className="text-xs text-zinc-500 font-medium uppercase tracking-wide">{getClientName(campaign.client_id)}</span>
                            </div>
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{campaign.name}</h3>
                        </div>

                        {/* Metrics Grid (Mobile: Grid 3, Desktop: Flex) */}
                        <div className="w-full md:w-auto grid grid-cols-3 gap-2 md:flex md:gap-8">
                            <div className="bg-zinc-50 dark:bg-white/5 md:bg-transparent p-2 md:p-0 rounded-lg text-center md:text-left">
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Leads</div>
                                <div className="text-sm md:text-base font-semibold text-zinc-700 dark:text-zinc-200">{campaign.stats.leads}</div>
                            </div>
                            <div className="bg-zinc-50 dark:bg-white/5 md:bg-transparent p-2 md:p-0 rounded-lg text-center md:text-left">
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">Revenue</div>
                                <div className="text-sm md:text-base font-semibold text-zinc-700 dark:text-zinc-200">${(campaign.stats.revenue / 1000).toFixed(1)}k</div>
                            </div>
                            <div className="bg-zinc-50 dark:bg-white/5 md:bg-transparent p-2 md:p-0 rounded-lg text-center md:text-left">
                                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">ROAS</div>
                                <div className={`text-sm md:text-base font-semibold ${campaign.stats.roas >= 4 ? 'text-primary-600 dark:text-primary-400' : 'text-zinc-700 dark:text-zinc-200'}`}>
                                    {campaign.stats.roas}x
                                </div>
                            </div>
                        </div>

                        {/* Action Arrow */}
                        <div className="hidden md:block text-zinc-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all">
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    </GlassCard>
                </Link>
            ))}

            {filteredCampaigns.length === 0 && (
                <div className="py-12 text-center">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-white/5">
                        <Filter className="w-6 h-6 text-zinc-400 dark:text-zinc-600" />
                    </div>
                    <h3 className="text-zinc-900 dark:text-zinc-300 font-medium">No campaigns found</h3>
                    <p className="text-zinc-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
                </div>
            )}
        </div>
    </div>
  );
};
