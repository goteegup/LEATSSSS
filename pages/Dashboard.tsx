import React, { useEffect, useState } from 'react';
import { Link } from '../components/Layout';
import { GlassCard, GlassButton } from '../components/ui/Glass';
import { KpiGrid } from '../components/shared/KpiGrid';
import { ArrowRight, BarChart3, TrendingUp, Users, DollarSign, Calendar, CheckCircle2, Sparkles } from 'lucide-react';
import { getCampaigns, getWorkspaceSettings } from '../services/dataService';
import { Campaign, WorkspaceSettings } from '../types';
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid, ComposedChart, Line, Legend } from 'recharts';

export const Dashboard = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);

  useEffect(() => {
    getCampaigns().then(setCampaigns);
    getWorkspaceSettings().then(setSettings);
  }, []);

  // Aggregate Stats
  const stats = {
      revenue: campaigns.reduce((acc, c) => acc + c.stats.revenue, 0),
      leads: campaigns.reduce((acc, c) => acc + c.stats.leads, 0),
      appointments: campaigns.reduce((acc, c) => acc + c.stats.appointments, 0),
      sales: campaigns.reduce((acc, c) => acc + c.stats.sales, 0),
      spend: campaigns.reduce((acc, c) => acc + c.stats.spend, 0),
  };

  // Chart Data: Trends
  const trendData = campaigns.map(c => ({
    name: c.name.split(' ')[0],
    revenue: c.stats.revenue,
    spend: c.stats.spend,
    roas: c.stats.roas
  }));

  // Chart Data: Funnel
  const funnelData = [
      { name: 'Total Leads', value: stats.leads, fill: '#3b82f6' }, // Blue
      { name: 'Appointments', value: stats.appointments, fill: '#a855f7' }, // Purple
      { name: 'Sales (Won)', value: stats.sales, fill: '#22c55e' }, // Green
  ];

  const isDark = settings?.theme === 'dark';

  // Dynamic Chart Styles based on Theme
  const chartStyles = {
    textColor: isDark ? '#a1a1aa' : '#71717a',
    gridColor: isDark ? '#52525b' : '#e4e4e7',
    tooltipBg: isDark ? '#18181b' : '#ffffff',
    tooltipBorder: isDark ? '#27272a' : '#e4e4e7',
    tooltipColor: isDark ? '#fff' : '#18181b'
  };

  // Time-based Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="relative min-h-screen pb-20 overflow-hidden">
      
      {/* --- AMBIENT BACKGROUND GLOWS --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top Left Primary Glow */}
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-[100px] animate-pulse" />
          {/* Bottom Right Purple Glow */}
          <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[100px]" />
           {/* Center Subtle Glow */}
          <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 p-4 md:p-6 lg:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Cinematic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-zinc-200/50 dark:border-white/5">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400 mb-1">
                <Sparkles className="w-4 h-4" />
                <span>{currentDate}</span>
            </div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
                {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">{settings?.agency_name || 'Admin'}</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-lg text-lg">
                Here's what's happening across your agency today.
            </p>
          </div>
          <div className="flex gap-3">
             <GlassButton variant="secondary" className="backdrop-blur-md bg-white/50 dark:bg-white/5">
                Last 30 Days
             </GlassButton>
             <GlassButton className="shadow-lg shadow-primary-500/20">
                <BarChart3 className="w-4 h-4" />
                Download Report
             </GlassButton>
          </div>
        </div>

        {/* KPI Grid (Reusable Component) */}
        <div className="relative" id="dashboard-kpi">
             <KpiGrid stats={stats} columns={4} />
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Revenue Trend */}
            <GlassCard className="lg:col-span-2 p-6 h-[420px] flex flex-col relative overflow-hidden border-zinc-200/60 dark:border-white/10" intensity="medium">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                             <TrendingUp className="w-5 h-5 text-primary-500" />
                             Revenue Analysis
                        </h3>
                        <p className="text-sm text-zinc-500">Revenue vs Spend per Campaign</p>
                    </div>
                </div>
                <div className="flex-1 w-full min-h-0 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} opacity={0.4} vertical={false} />
                            <XAxis dataKey="name" stroke={chartStyles.textColor} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                            <YAxis yAxisId="left" stroke={chartStyles.textColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                            <YAxis yAxisId="right" orientation="right" stroke={chartStyles.textColor} fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: chartStyles.tooltipBg, borderColor: chartStyles.tooltipBorder, color: chartStyles.tooltipColor, borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                itemStyle={{ color: chartStyles.tooltipColor }}
                                cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="rgb(var(--color-primary-500))" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar yAxisId="left" dataKey="spend" name="Spend" fill={isDark ? '#3f3f46' : '#a1a1aa'} radius={[4, 4, 0, 0]} barSize={20} />
                            <Line yAxisId="right" type="monotone" dataKey="roas" name="ROAS" stroke="#fbbf24" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, stroke: isDark ? '#000' : '#fff' }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            {/* Right: Funnel */}
            <GlassCard className="p-6 h-[420px] flex flex-col relative overflow-hidden border-zinc-200/60 dark:border-white/10" intensity="medium">
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
                
                 <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 relative z-10">Conversion Funnel</h3>
                 <p className="text-sm text-zinc-500 mb-6 relative z-10">Lead to Sale Efficiency</p>
                 
                 <div className="flex-1 w-full min-h-0 relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{fill: chartStyles.textColor, fontSize: 11, fontWeight: 600}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ backgroundColor: chartStyles.tooltipBg, borderColor: chartStyles.tooltipBorder, color: chartStyles.tooltipColor, borderRadius: '8px' }}
                                itemStyle={{ color: chartStyles.tooltipColor }}
                            />
                            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={36}>
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

        {/* Active Campaigns List */}
        <GlassCard className="overflow-hidden border-zinc-200/60 dark:border-white/10" intensity="medium" id="dashboard-campaigns">
            <div className="p-6 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/5">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Active Campaigns</h3>
                <Link to="/clients" className="text-sm text-primary-500 hover:text-primary-400 font-medium flex items-center gap-1 transition-all hover:gap-2">
                    View All <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/80 dark:bg-zinc-900/50">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Campaign Name</th>
                            <th className="px-6 py-4 font-semibold">Leads</th>
                            <th className="px-6 py-4 font-semibold">Appointments</th>
                            <th className="px-6 py-4 font-semibold">Sales</th>
                            <th className="px-6 py-4 font-semibold text-right">Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                        {campaigns.slice(0, 5).map(campaign => (
                            <tr key={campaign.id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4 font-medium text-zinc-900 dark:text-white group-hover:text-primary-500 transition-colors">{campaign.name}</td>
                                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{campaign.stats.leads}</td>
                                <td className="px-6 py-4 text-purple-600 dark:text-purple-400 font-medium bg-purple-50/50 dark:bg-purple-500/5 rounded-lg">{campaign.stats.appointments}</td>
                                <td className="px-6 py-4 text-green-600 dark:text-green-400 font-medium">{campaign.stats.sales}</td>
                                <td className="px-6 py-4 text-right font-bold text-zinc-900 dark:text-white">${campaign.stats.revenue.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </GlassCard>
      </div>
    </div>
  );
};