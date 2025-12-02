import React from 'react';
import { Campaign, ClientViewConfig } from '../../types';
import { updateCampaignSettings } from '../../services/dataService';
import { GlassCard, Toggle } from '../../components/ui/Glass';
import { Eye, LayoutDashboard, Kanban, List, BarChart3 } from 'lucide-react';

interface VisibilityTabProps {
  campaign: Campaign;
  onUpdate: (newCampaign: Campaign) => void;
}

export const VisibilityTab: React.FC<VisibilityTabProps> = ({ campaign, onUpdate }) => {
  const clientView = campaign.settings.client_view || {
      show_dashboard: true,
      show_kanban: true,
      show_list: true,
      show_kpi: true
  };

  const updateVisibility = async (key: keyof ClientViewConfig, val: boolean) => {
      const newClientView = { ...clientView, [key]: val };
      const newSettings = { ...campaign.settings, client_view: newClientView };
      const updated = await updateCampaignSettings(campaign.id, newSettings);
      onUpdate(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <Eye className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Client Visibility</h2>
                <p className="text-zinc-500 dark:text-zinc-400">Control exactly what your client sees when they log in to the portal.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dashboard Access */}
            <GlassCard className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
                        <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white">Dashboard</h3>
                        <p className="text-xs text-zinc-500">Revenue charts & stats</p>
                    </div>
                </div>
                <Toggle checked={clientView.show_dashboard} onChange={(v) => updateVisibility('show_dashboard', v)} />
            </GlassCard>

            {/* Kanban Board */}
            <GlassCard className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
                        <Kanban className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white">Kanban Board</h3>
                        <p className="text-xs text-zinc-500">Drag & drop pipeline</p>
                    </div>
                </div>
                <Toggle checked={clientView.show_kanban} onChange={(v) => updateVisibility('show_kanban', v)} />
            </GlassCard>

            {/* List View */}
            <GlassCard className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
                        <List className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white">List View</h3>
                        <p className="text-xs text-zinc-500">Table data view</p>
                    </div>
                </div>
                <Toggle checked={clientView.show_list} onChange={(v) => updateVisibility('show_list', v)} />
            </GlassCard>

            {/* KPIs */}
            <GlassCard className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white">KPI Cards</h3>
                        <p className="text-xs text-zinc-500">Top metrics in views</p>
                    </div>
                </div>
                <Toggle checked={clientView.show_kpi} onChange={(v) => updateVisibility('show_kpi', v)} />
            </GlassCard>
        </div>
    </div>
  );
};