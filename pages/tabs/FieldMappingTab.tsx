import React from 'react';
import { Campaign, SYSTEM_FIELDS } from '../../types';
import { updateCampaignSettings } from '../../services/dataService';
import { GlassCard } from '../../components/ui/Glass';
import { ArrowRight, Sparkles, AlertTriangle } from 'lucide-react';

interface FieldMappingTabProps {
  campaign: Campaign;
  onUpdate: (c: Campaign) => void;
}

export const FieldMappingTab: React.FC<FieldMappingTabProps> = ({ campaign, onUpdate }) => {
  const discovered = campaign.settings.discovered_fields || ['full_name', 'email', 'phone_number', 'city']; // Mock defaults if empty

  const getMappedField = (externalKey: string) => {
      // Check system fields
      for (const sys of SYSTEM_FIELDS) {
          if (sys.aliases?.includes(externalKey)) return sys.name;
      }
      // Check custom fields
      for (const cust of campaign.settings.custom_fields) {
          if (cust.aliases?.includes(externalKey)) return cust.name;
      }
      return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Field Mapping</h2>
            <div className="text-xs text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                {discovered.length} Discovered Fields
            </div>
        </div>

        <GlassCard className="overflow-hidden p-0">
            <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-xs text-zinc-500 uppercase">
                    <tr>
                        <th className="px-6 py-4 font-semibold">Incoming Field (External)</th>
                        <th className="px-6 py-4 font-semibold"></th>
                        <th className="px-6 py-4 font-semibold">Mapped To (Internal)</th>
                        <th className="px-6 py-4 font-semibold text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                    {discovered.map((key) => {
                        const mappedTo = getMappedField(key);
                        return (
                            <tr key={key} className="group hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-mono text-zinc-600 dark:text-zinc-300">{key}</td>
                                <td className="px-6 py-4 text-center"><ArrowRight className="w-4 h-4 text-zinc-400 mx-auto" /></td>
                                <td className="px-6 py-4">
                                    {mappedTo ? (
                                        <span className="font-bold text-primary-600 dark:text-primary-400 bg-primary-500/10 px-2 py-1 rounded">{mappedTo}</span>
                                    ) : (
                                        <select className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded px-2 py-1 text-xs w-full">
                                            <option>Select Field...</option>
                                            {SYSTEM_FIELDS.map(f => <option key={f.key}>{f.name}</option>)}
                                            {campaign.settings.custom_fields.map(f => <option key={f.key}>{f.name}</option>)}
                                        </select>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {mappedTo ? <Sparkles className="w-4 h-4 text-green-500 ml-auto" /> : <AlertTriangle className="w-4 h-4 text-amber-500 ml-auto" />}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </GlassCard>
    </div>
  );
};