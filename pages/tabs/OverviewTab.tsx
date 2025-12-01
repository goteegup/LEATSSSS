

import React, { useEffect, useState } from 'react';
import { Campaign, WorkspaceSettings } from '../../types';
import { getWorkspaceSettings } from '../../services/dataService';
import { GlassCard } from '../../components/ui/Glass';
import { KpiGrid } from '../../components/shared/KpiGrid';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell, ComposedChart, Line 
} from 'recharts';
import { Activity, DollarSign } from 'lucide-react';

export const OverviewTab: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);

  useEffect(() => {
    getWorkspaceSettings().then(setSettings);
  }, []);

  const isDark = settings?.theme === 'dark';
  
  // Dynamic Chart Styles
  const chartStyles = {
    textColor: isDark ? '#a1a1aa' : '#71717a',
    gridColor: isDark ? '#52525b' : '#e4e4e7',
    tooltipBg: isDark ? '#18181b' : '#ffffff',
    tooltipBorder: isDark ? '#27272a' : '#e4e4e7',
    tooltipColor: isDark ? '#fff' : '#18181b'
  };

  // CONSISTENT MOCK DATA GENERATION
  // Distributed so the sum approximates the total stats
  const distribute = (total: number, parts: number) => {
      let remaining = total;
      const result = [];
      for (let i = 0; i < parts - 1; i++) {
          const val = Math.round(Math.random() * (remaining / (parts - i)) * 1.5);
          result.push(val);
          remaining -= val;
      }
      result.push(remaining); // Ensure the last one creates the exact sum
      return result.sort(() => Math.random() - 0.5); // Randomize days
  };

  // Generate consistent trend data
  const dailyLeads = distribute(campaign.stats.leads, 7);
  const dailyRev = distribute(campaign.stats.revenue, 7);
  
  const trendData = [
    { name: 'Mon', leads: dailyLeads[0], revenue: dailyRev[0] },
    { name: 'Tue', leads: dailyLeads[1], revenue: dailyRev[1] },
    { name: 'Wed', leads: dailyLeads[2], revenue: dailyRev[2] },
    { name: 'Thu', leads: dailyLeads[3], revenue: dailyRev[3] },
    { name: 'Fri', leads: dailyLeads[4], revenue: dailyRev[4] },
    { name: 'Sat', leads: dailyLeads[5], revenue: dailyRev[5] },
    { name: 'Sun', leads: dailyLeads[6], revenue: dailyRev[6] },
  ];

  // Funnel Data
  const funnelData = [
      { name: 'Leads', value: campaign.stats.leads, fill: '#3b82f6' },        // Blue
      { name: 'Appts', value: campaign.stats.appointments, fill: '#a855f7' }, // Purple
      { name: 'Sales', value: campaign.stats.sales, fill: '#22c55e' },        // Green
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* SECTION 1: KEY METRICS */}
      <div>
        <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Performance Metrics
        </h3>
        
        {/* Reusable KPI Grid */}
        <KpiGrid stats={campaign.stats} columns={3} showRoas={true} />

      </div>

      {/* SECTION 3: VISUALIZATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
        {/* Trend Chart */}
        <GlassCard className="lg:col-span-2 p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Performance Trend (7 Days)</h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={trendData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="rgb(var(--color-primary-500))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="rgb(var(--color-primary-500))" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} opacity={0.3} vertical={false} />
                        <XAxis dataKey="name" stroke={chartStyles.textColor} axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                        <YAxis yAxisId="left" stroke={chartStyles.textColor} axisLine={false} tickLine={false} fontSize={12} tickFormatter={(val) => `${val}`} />
                        <YAxis yAxisId="right" orientation="right" stroke={chartStyles.textColor} axisLine={false} tickLine={false} fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: chartStyles.tooltipBg, borderColor: chartStyles.tooltipBorder, color: chartStyles.tooltipColor, borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                            itemStyle={{ color: chartStyles.tooltipColor }}
                            cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                        />
                        <Area yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="rgb(var(--color-primary-500))" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                        <Line yAxisId="left" type="monotone" dataKey="leads" name="Leads" stroke="#3b82f6" strokeWidth={2} dot={{r:4, fill: isDark ? '#18181b' : '#fff', strokeWidth:2}} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </GlassCard>

        {/* Funnel Chart */}
        <GlassCard className="p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Efficiency</h3>
            <p className="text-xs text-zinc-500 mb-6">Visualizing volume drop-off</p>
            <div className="flex-1 w-full min-h-0">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={40} tick={{fill: chartStyles.textColor, fontSize: 11, fontWeight: 600}} axisLine={false} tickLine={false} />
                        <Tooltip 
                             cursor={{fill: 'transparent'}}
                             contentStyle={{ backgroundColor: chartStyles.tooltipBg, borderColor: chartStyles.tooltipBorder, color: chartStyles.tooltipColor, borderRadius: '8px' }}
                             itemStyle={{ color: chartStyles.tooltipColor }}
                        />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={32}>
                             {
                                funnelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))
                             }
                        </Bar>
                    </BarChart>
                 </ResponsiveContainer>
            </div>
        </GlassCard>
      </div>
    </div>
  );
};
