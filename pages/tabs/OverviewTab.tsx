
import React, { useEffect, useState, useMemo } from 'react';
import { Campaign, WorkspaceSettings } from '../../types';
import { getWorkspaceSettings } from '../../services/dataService';
import { GlassCard, GlassButton, Badge } from '../../components/ui/Glass';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell, ComposedChart, Line, Legend
} from 'recharts';
import { Activity, DollarSign, Calendar, TrendingUp, Users, Target, Zap, ArrowUpRight, Clock, Percent } from 'lucide-react';

type Timeframe = '7d' | '30d' | '90d' | 'lifetime';

export const OverviewTab: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');

  useEffect(() => {
    getWorkspaceSettings().then(setSettings);
  }, []);

  const isDark = settings?.theme === 'dark';
  const currency = settings?.currency || '€';
  
  // Dynamic Chart Styles
  const chartStyles = {
    textColor: isDark ? '#a1a1aa' : '#71717a',
    gridColor: isDark ? '#27272a' : '#e4e4e7',
    tooltipBg: isDark ? '#18181b' : '#ffffff',
    tooltipBorder: isDark ? '#27272a' : '#e4e4e7',
    tooltipColor: isDark ? '#fff' : '#18181b'
  };

  // --- CALCULATED INSIGHTS ---
  const stats = useMemo(() => {
      const scale = timeframe === '7d' ? 0.25 : timeframe === '30d' ? 1 : timeframe === '90d' ? 2.5 : 3.2;
      return {
          leads: Math.round(campaign.stats.leads * scale),
          appointments: Math.round(campaign.stats.appointments * scale),
          sales: Math.round(campaign.stats.sales * scale),
          revenue: Math.round(campaign.stats.revenue * scale),
          spend: Math.round(campaign.stats.spend * scale),
      };
  }, [campaign.stats, timeframe]);

  const financialMetrics = useMemo(() => {
      const cpl = stats.leads > 0 ? (stats.spend / stats.leads).toFixed(2) : '0';
      const cpa = stats.appointments > 0 ? (stats.spend / stats.appointments).toFixed(2) : '0';
      const cps = stats.sales > 0 ? (stats.spend / stats.sales).toFixed(2) : '0';
      const roas = stats.spend > 0 ? (stats.revenue / stats.spend).toFixed(2) : '0';
      
      return { cpl, cpa, cps, roas };
  }, [stats]);

  const funnelRates = useMemo(() => {
      const l2a = stats.leads > 0 ? ((stats.appointments / stats.leads) * 100).toFixed(1) : '0';
      const a2s = stats.appointments > 0 ? ((stats.sales / stats.appointments) * 100).toFixed(1) : '0';
      const l2s = stats.leads > 0 ? ((stats.sales / stats.leads) * 100).toFixed(1) : '0';
      return { l2a, a2s, l2s };
  }, [stats]);

  // --- CHART DATA GENERATION ---
  const trendData = useMemo(() => {
      const points = timeframe === '7d' ? 7 : timeframe === '30d' ? 10 : 14;
      const data = [];
      let cumulativeRevenue = 0;
      let cumulativeSpend = 0;

      for (let i = 0; i < points; i++) {
          const rev = Math.random() * (stats.revenue / points) * 1.5;
          const spend = (stats.spend / points);
          cumulativeRevenue += rev;
          cumulativeSpend += spend;
          data.push({
              name: timeframe === '7d' ? `Day ${i+1}` : `W${i+1}`,
              revenue: Math.round(rev),
              spend: Math.round(spend),
              profit: Math.round(cumulativeRevenue - cumulativeSpend)
          });
      }
      return data;
  }, [stats, timeframe]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* --- HEADER CONTROLS --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-500/10 rounded-xl text-primary-500">
                  <Calendar className="w-5 h-5" />
              </div>
              <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Performance Period</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                      {timeframe === 'lifetime' ? `Since ${new Date(campaign.start_date || Date.now()).toLocaleDateString()}` : `Showing last ${timeframe.replace('d', ' days')}`}
                  </p>
              </div>
          </div>

          <div className="flex bg-zinc-100 dark:bg-black/20 p-1 rounded-xl border border-zinc-200 dark:border-white/5">
              {(['7d', '30d', '90d', 'lifetime'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${timeframe === t ? 'bg-white dark:bg-zinc-800 text-primary-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                  >
                      {t === 'lifetime' ? 'Lifetime' : t}
                  </button>
              ))}
          </div>
      </div>

      {/* --- KPI OVERVIEW GRID --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard className="p-5 space-y-2 border-l-4 border-l-blue-500" intensity="low">
              <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Leads</span>
                  <Users className="w-4 h-4 text-blue-500 opacity-50" />
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.leads.toLocaleString()}</div>
              <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <Target className="w-3 h-3" /> CPL: <span className="text-zinc-900 dark:text-zinc-200 font-bold">{currency}{financialMetrics.cpl}</span>
              </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-2 border-l-4 border-l-purple-500" intensity="low">
              <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Appointments</span>
                  <Clock className="w-4 h-4 text-purple-500 opacity-50" />
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.appointments.toLocaleString()}</div>
              <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <Percent className="w-3 h-3" /> Conv: <span className="text-zinc-900 dark:text-zinc-200 font-bold">{funnelRates.l2a}%</span>
              </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-2 border-l-4 border-l-green-500" intensity="low">
              <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Sales</span>
                  <Zap className="w-4 h-4 text-green-500 opacity-50" />
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.sales.toLocaleString()}</div>
              <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> ROI: <span className="text-green-500 font-bold">{financialMetrics.roas}x</span>
              </div>
          </GlassCard>

          <GlassCard className="p-5 space-y-2 border-l-4 border-l-primary-500" intensity="low">
              <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Revenue</span>
                  <DollarSign className="w-4 h-4 text-primary-500 opacity-50" />
              </div>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white">{currency}{stats.revenue.toLocaleString()}</div>
              <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> Profit: <span className="text-primary-500 font-bold">{currency}{(stats.revenue - stats.spend).toLocaleString()}</span>
              </div>
          </GlassCard>
      </div>

      {/* --- MAIN CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue & Profit Trends */}
          <GlassCard className="lg:col-span-2 p-6 flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary-500" />
                      Revenue vs. Spend
                  </h3>
                  <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary-500" /> Revenue</div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-zinc-500" /> Spend</div>
                  </div>
              </div>
              <div className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={chartStyles.gridColor} vertical={false} />
                          <XAxis dataKey="name" stroke={chartStyles.textColor} fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis stroke={chartStyles.textColor} fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `${currency}${v}`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: chartStyles.tooltipBg, borderColor: chartStyles.tooltipBorder, borderRadius: '12px' }}
                            itemStyle={{ fontSize: '12px' }}
                          />
                          <Bar dataKey="revenue" fill="rgb(var(--color-primary-500))" radius={[4, 4, 0, 0]} barSize={20} />
                          <Bar dataKey="spend" fill="#71717a" radius={[4, 4, 0, 0]} barSize={20} />
                          <Line type="monotone" dataKey="profit" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} name="Cumulative Profit" />
                      </ComposedChart>
                  </ResponsiveContainer>
              </div>
          </GlassCard>

          {/* Funnel Efficiency */}
          <GlassCard className="p-6 flex flex-col h-[400px]">
              <h3 className="font-bold text-zinc-900 dark:text-white mb-6">Funnel Efficiency</h3>
              
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                  {[
                      { label: 'Lead to Appointment', rate: funnelRates.l2a, color: 'bg-purple-500' },
                      { label: 'Appointment to Sale', rate: funnelRates.a2s, color: 'bg-green-500' },
                      { label: 'Overall Conversion', rate: funnelRates.l2s, color: 'bg-primary-500' },
                  ].map((item, i) => (
                      <div key={i} className="space-y-2">
                          <div className="flex justify-between items-end">
                              <span className="text-xs font-medium text-zinc-500">{item.label}</span>
                              <span className="text-sm font-bold text-zinc-900 dark:text-white">{item.rate}%</span>
                          </div>
                          <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${item.color} transition-all duration-1000`} 
                                style={{ width: `${item.rate}%` }} 
                              />
                          </div>
                      </div>
                  ))}

                  <div className="mt-6 p-4 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-white/5">
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                          <Zap className="w-3 h-3 text-amber-500" />
                          Funnel Insight
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          {Number(funnelRates.l2a) < 15 
                            ? "Your appointment booking rate is below average. Consider optimizing your follow-up speed or lead quality."
                            : "Your funnel is performing well! Focus on increasing lead volume to scale revenue."}
                      </p>
                  </div>
              </div>
          </GlassCard>

      </div>

      {/* --- REVENUE BREAKDOWN --- */}
      <GlassCard className="p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-zinc-900 dark:text-white">Marketing ROI Breakdown</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-1">
                  <div className="text-xs text-zinc-500 font-medium">Cost per Result</div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="p-3 bg-zinc-50 dark:bg-white/5 rounded-xl">
                          <div className="text-[10px] text-zinc-500 uppercase">Per Lead</div>
                          <div className="text-lg font-bold">{currency}{financialMetrics.cpl}</div>
                      </div>
                      <div className="p-3 bg-zinc-50 dark:bg-white/5 rounded-xl">
                          <div className="text-[10px] text-zinc-500 uppercase">Per Appt</div>
                          <div className="text-lg font-bold">{currency}{financialMetrics.cpa}</div>
                      </div>
                  </div>
              </div>

              <div className="space-y-1">
                  <div className="text-xs text-zinc-500 font-medium">Efficiency Multiplier</div>
                  <div className="pt-2">
                      <div className="p-4 bg-primary-500/5 border border-primary-500/10 rounded-xl flex items-center justify-between">
                          <div>
                              <div className="text-[10px] text-primary-600 dark:text-primary-400 uppercase font-bold">ROAS (Return on Ad Spend)</div>
                              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{financialMetrics.roas}x</div>
                          </div>
                          <TrendingUp className="w-8 h-8 text-primary-500 opacity-20" />
                      </div>
                  </div>
              </div>

              <div className="space-y-1">
                  <div className="text-xs text-zinc-500 font-medium">Campaign Lifetime Stats</div>
                  <div className="pt-2 text-sm space-y-2">
                      <div className="flex justify-between border-b border-zinc-100 dark:border-white/5 pb-1">
                          <span className="text-zinc-500">Total Spend</span>
                          <span className="font-mono">{currency}{stats.spend.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-100 dark:border-white/5 pb-1">
                          <span className="text-zinc-500">Gross Revenue</span>
                          <span className="font-mono text-green-500 font-bold">{currency}{stats.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                          <span className="text-zinc-500 font-bold">Net Profit</span>
                          <span className="font-mono text-primary-500 font-bold">{currency}{(stats.revenue - stats.spend).toLocaleString()}</span>
                      </div>
                  </div>
              </div>
          </div>
      </GlassCard>
    </div>
  );
};
