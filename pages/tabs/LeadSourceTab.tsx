import React, { useState } from 'react';
import { Campaign } from '../../types';
import { GlassCard, GlassButton } from '../../components/ui/Glass';
import { Webhook, UploadCloud, Facebook, CheckCircle2, Copy } from 'lucide-react';

interface LeadSourceTabProps {
  campaign: Campaign;
  onUpdate: (c: Campaign) => void;
}

export const LeadSourceTab: React.FC<LeadSourceTabProps> = ({ campaign }) => {
  const [activeSource, setActiveSource] = useState<'facebook' | 'webhook' | 'csv' | 'manual'>('facebook');
  const webhookUrl = `https://api.leadts.app/v1/hooks/${campaign.id}/fb`;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* Source Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { id: 'facebook', label: 'Facebook Ads', icon: Facebook, color: 'text-blue-600' },
                { id: 'webhook', label: 'Webhook', icon: Webhook, color: 'text-amber-500' },
                { id: 'csv', label: 'CSV Upload', icon: UploadCloud, color: 'text-green-500' },
                { id: 'manual', label: 'Manual Entry', icon: CheckCircle2, color: 'text-zinc-400' }
            ].map(s => (
                <button
                    key={s.id}
                    onClick={() => setActiveSource(s.id as any)}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${activeSource === s.id ? 'bg-primary-500/10 border-primary-500 ring-1 ring-primary-500' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20'}`}
                >
                    <s.icon className={`w-8 h-8 ${s.color}`} />
                    <span className={`text-sm font-bold ${activeSource === s.id ? 'text-primary-600 dark:text-primary-400' : 'text-zinc-500'}`}>{s.label}</span>
                </button>
            ))}
        </div>

        {/* Configuration Area */}
        <GlassCard className="p-8">
            {activeSource === 'facebook' && (
                <div className="space-y-6 text-center max-w-lg mx-auto">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-900/20">
                        <Facebook className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Connect Meta Lead Ads</h3>
                    <p className="text-zinc-500 text-sm">Leads from your Facebook & Instagram forms will flow directly into the pipeline.</p>
                    <div className="pt-4">
                        <GlassButton className="w-full justify-center">Connect Facebook Account</GlassButton>
                    </div>
                </div>
            )}

            {activeSource === 'webhook' && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Webhook Endpoint</h3>
                        <p className="text-zinc-500 text-sm">Send JSON data to this URL.</p>
                    </div>
                    <div className="flex gap-2">
                        <input readOnly value={webhookUrl} className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-zinc-600 dark:text-zinc-400" />
                        <GlassButton onClick={() => navigator.clipboard.writeText(webhookUrl)}><Copy className="w-4 h-4" /></GlassButton>
                    </div>
                </div>
            )}

            {activeSource === 'csv' && (
                <div className="text-center py-10 space-y-4">
                    <UploadCloud className="w-12 h-12 text-zinc-300 mx-auto" />
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Upload CSV File</h3>
                    <GlassButton>Select File</GlassButton>
                </div>
            )}
            
            {activeSource === 'manual' && (
                <div className="text-center py-10 text-zinc-500">
                    Manual entry is always enabled via the "Add Lead" button.
                </div>
            )}
        </GlassCard>
    </div>
  );
};