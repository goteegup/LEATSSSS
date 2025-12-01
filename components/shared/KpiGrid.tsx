
import React from 'react';
import { GlassCard } from '../ui/Glass';
import { Users, Calendar, CheckCircle2, DollarSign, Wallet, TrendingUp } from 'lucide-react';

interface KpiGridProps {
    stats: {
        leads: number;
        appointments: number;
        sales: number;
        revenue: number;
        spend: number;
        roas?: number;
    };
    showRoas?: boolean;
    columns?: 3 | 4 | 5;
}

export const KpiGrid: React.FC<KpiGridProps> = ({ stats, showRoas = false, columns = 5 }) => {
    
    // Derived Rates
    const conversionRate = stats.leads > 0 ? ((stats.sales / stats.leads) * 100).toFixed(1) : '0';
    const apptRate = stats.leads > 0 ? ((stats.appointments / stats.leads) * 100).toFixed(1) : '0';

    const gridClass = columns === 5 
        ? "grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4" 
        : columns === 4 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            : "grid grid-cols-1 md:grid-cols-3 gap-4";

    return (
        <div className={gridClass}>
            {/* Leads */}
            <GlassCard className="p-4 flex flex-col justify-between group" intensity="low">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
                            <Users className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider">Leads</span>
                    </div>
                </div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.leads}</p>
            </GlassCard>

            {/* Appointments */}
            <GlassCard className="p-4 flex flex-col justify-between group" intensity="low">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500">
                            <Calendar className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider">Appts</span>
                    </div>
                    <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded font-medium">
                        {apptRate}%
                    </span>
                </div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.appointments}</p>
            </GlassCard>

            {/* Sales */}
            <GlassCard className="p-4 flex flex-col justify-between group" intensity="low">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider">Sales</span>
                    </div>
                    <span className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded font-medium">
                        {conversionRate}%
                    </span>
                </div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.sales}</p>
            </GlassCard>

            {/* Revenue */}
            <GlassCard className="p-4 flex flex-col justify-between group" intensity="low">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-zinc-500">
                        <div className="p-1.5 rounded-lg bg-primary-500/10 text-primary-500">
                            <DollarSign className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider">Revenue</span>
                    </div>
                    <TrendingUp className="w-3 h-3 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-white">${stats.revenue.toLocaleString()}</p>
            </GlassCard>

            {/* Spend (or ROAS) */}
            {columns >= 4 && (
                <GlassCard className="p-4 flex flex-col justify-between group col-span-2 md:col-span-1" intensity="low">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-zinc-500">
                            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500">
                                <Wallet className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-semibold uppercase tracking-wider">Spend</span>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-white">${stats.spend.toLocaleString()}</p>
                </GlassCard>
            )}
        </div>
    );
};
