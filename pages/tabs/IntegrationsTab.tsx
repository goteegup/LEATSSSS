import React, { useState } from 'react';
import { Campaign, IntegrationSettings, NotificationTemplate } from '../../types';
import { updateCampaignSettings } from '../../services/dataService';
import { GlassCard, GlassButton, Toggle, GlassInput, Badge } from '../../components/ui/Glass';
import { Modal } from '../../components/ui/Modal';
import { InfoTooltip } from '../../components/ui/Tooltip';
import { MessageSquare, Mail, DownloadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Edit3, Save, X, RefreshCw, Hash, Play, Zap, Plug, Workflow, Link } from 'lucide-react';

interface IntegrationsTabProps {
  campaign: Campaign;
  onUpdate: (newCampaign: Campaign) => void;
}

// Slack Logo Component
const SlackLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 127 127" xmlns="http://www.w3.org/2000/svg">
        <path fill="#E01E5A" d="M29.6 22.8c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v13.2H42.8c-7.3 0-13.2-5.9-13.2-13.2zm17.6 13.2c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h13.2v13.2z"/>
        <path fill="#36C5F0" d="M29.6 84.4c-7.3 0-13.2 5.9-13.2 13.2 0 7.3 5.9 13.2 13.2 13.2 7.3 0 13.2-5.9 13.2-13.2V84.4H29.6zm13.2-17.6c-7.3 0-13.2 5.9-13.2 13.2 0 7.3 5.9 13.2 13.2 13.2 13.2V66.8h-13.2c7.3 0 13.2-5.9 13.2-13.2 0-7.3-5.9-13.2-13.2-13.2H42.8z"/>
        <path fill="#2EB67D" d="M84.4 84.4c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V84.4h13.2zm-17.6-13.2c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H66.8v-13.2z"/>
        <path fill="#ECB22E" d="M84.4 22.8c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v13.2H84.4c-7.3 0-13.2-5.9-13.2-13.2zm-13.2 17.6c7.3 0 13.2-5.9 13.2-13.2 0-7.3-5.9-13.2-13.2v13.2h13.2c-7.3 0-13.2 5.9-13.2 13.2 0 7.3 5.9 13.2 13.2 13.2H71.2z"/>
    </svg>
);

const MetaLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M16.924 5.568c-.76-1.56-2.193-3.033-4.912-3.068-2.614.076-4.137 1.55-4.912 3.068-.797 1.558-1.326 3.73-2.673 6.966-1.347 3.237-2.73 4.393-4.407 4.393-1.636 0-2.317-1.127-2.317-2.227 0-1.28.84-2.632 2.317-2.632.757 0 1.295.342 1.635.632l.243-2.435C1.196 10.36 0 11.97 0 14.7c0 3.21 2.382 5.3 5.403 5.3 2.614-.075 4.137-1.55 4.912-3.068.796-1.558 1.326-3.73 2.673-6.966 1.347-3.237 2.73-4.394 4.407-4.394 1.636 0 2.317 1.128 2.317 2.228 0 1.28-.84 2.632-2.317 2.632-.757 0-1.295-.342-1.635-.632l-.243 2.435c.703-.095 1.898.17 2.483.17 3.02 0 5.403-2.09 5.403-5.3 0-3.21-2.382-5.3-5.403-5.3z"/>
    </svg>
);

const DEFAULT_INTEGRATIONS: IntegrationSettings = {
    slack: {
        enabled: false,
        events: {
            new_lead: { enabled: true, template: "🔥 New Lead: {full_name} ({phone}) via {source}" },
            won_deal: { enabled: true, template: "💰 BOOM! Deal closed: {full_name} just brought in {revenue}!" }
        }
    },
    email: {
        enabled: false,
        recipients: [],
        events: {
            new_lead_alert: true,
            daily_digest: false
        }
    },
    meta: {
        enabled: false,
        events: {
            purchase_on_won: true,
            lead_on_create: false
        }
    }
};

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({ campaign, onUpdate }) => {
  const [activeSubTab, setActiveSubTab] = useState<'connections' | 'automations'>('connections');
  const [loading, setLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{ type: 'new_lead' | 'won_deal', template: string } | null>(null);
  const [isTestSending, setIsTestSending] = useState(false);

  // Initialize if missing
  const integrations = campaign.settings.integrations || DEFAULT_INTEGRATIONS;

  const updateSettings = async (newIntegrations: IntegrationSettings) => {
      setLoading(true);
      const newSettings = { ...campaign.settings, integrations: newIntegrations };
      const updated = await updateCampaignSettings(campaign.id, newSettings);
      onUpdate(updated);
      setLoading(false);
  };

  // --- SLACK HANDLERS ---

  const handleSlackConnect = async () => {
      setLoading(true);
      // Simulate OAuth Window
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newSlack = {
          ...integrations.slack,
          enabled: true,
          webhook_url: "https://hooks.slack.com/services/T000/B000/XXXX",
          channel: "#leads-notifications"
      };
      await updateSettings({ ...integrations, slack: newSlack });
  };

  const handleSlackDisconnect = async () => {
      if(confirm('Are you sure you want to disconnect Slack?')) {
          await updateSettings({ ...integrations, slack: { ...integrations.slack, enabled: false } });
      }
  };

  const updateSlackEvent = async (type: 'new_lead' | 'won_deal', enabled: boolean) => {
      const newSlack = { ...integrations.slack };
      newSlack.events[type].enabled = enabled;
      await updateSettings({ ...integrations, slack: newSlack });
  };

  const saveTemplate = async () => {
      if (!editingTemplate) return;
      const newSlack = { ...integrations.slack };
      newSlack.events[editingTemplate.type].template = editingTemplate.template;
      await updateSettings({ ...integrations, slack: newSlack });
      setEditingTemplate(null);
  };

  const sendSlackTest = async () => {
      setIsTestSending(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Test notification sent to Slack!");
      setIsTestSending(false);
  };

  // --- EMAIL HANDLERS ---

  const handleEmailRecipientChange = async (val: string) => {
      const emails = val.split(',').map(e => e.trim()).filter(e => e);
      const newEmail = { ...integrations.email, recipients: emails };
      await updateSettings({ ...integrations, email: newEmail });
  };

  const toggleEmailFeature = async (key: 'new_lead_alert' | 'daily_digest', val: boolean) => {
      const newEmail = { ...integrations.email };
      newEmail.events[key] = val;
      await updateSettings({ ...integrations, email: newEmail });
  };

  // --- META CAPI HANDLERS ---
  
  const updateMetaConfig = async (key: keyof IntegrationSettings['meta'], val: any) => {
      const newMeta = { ...integrations.meta, [key]: val };
      await updateSettings({ ...integrations, meta: newMeta });
  };

  const updateMetaEvent = async (key: keyof IntegrationSettings['meta']['events'], val: boolean) => {
      const newMeta = { ...integrations.meta };
      newMeta.events[key] = val;
      await updateSettings({ ...integrations, meta: newMeta });
  };

  // --- VARIABLES ---
  const AVAILABLE_VARS = ['{full_name}', '{email}', '{phone}', '{revenue}', '{source}'];

  const insertVar = (v: string) => {
      if (editingTemplate) {
          setEditingTemplate({ ...editingTemplate, template: editingTemplate.template + ' ' + v });
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* Header & Sub-Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 dark:border-white/5 pb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary-500" />
                Integrations & Automation
            </h2>
            
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-white/5">
                <button
                    onClick={() => setActiveSubTab('connections')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeSubTab === 'connections' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                >
                    <Plug className="w-4 h-4" /> Connections
                </button>
                <button
                    onClick={() => setActiveSubTab('automations')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeSubTab === 'automations' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                >
                    <Workflow className="w-4 h-4" /> Automations
                </button>
            </div>
        </div>

        {/* --- CONNECTIONS VIEW --- */}
        {activeSubTab === 'connections' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="integrations-grid">
                
                {/* 1. Slack Connection */}
                <div className={`rounded-2xl border transition-all duration-300 flex flex-col ${integrations.slack.enabled ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10' : 'bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-white/5'}`}>
                    <div className="p-6 flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/10 flex items-center justify-center p-2.5 shadow-sm">
                                <SlackLogo className="w-full h-full" />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Slack</h3>
                                <p className="text-sm text-zinc-500">Messaging</p>
                            </div>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Connect your workspace to receive real-time alerts and daily digests.</p>
                        
                        {integrations.slack.enabled ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-sm text-green-500 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Connected
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Post to Channel</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                        <select 
                                            value={integrations.slack.channel || ''}
                                            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-lg text-sm appearance-none focus:outline-none focus:border-primary-500"
                                        >
                                            <option>#general</option>
                                            <option>#leads-notifications</option>
                                            <option>#sales-wins</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <GlassButton onClick={handleSlackConnect} disabled={loading} className="w-full justify-center shadow-lg shadow-primary-500/10">
                                {loading ? 'Connecting...' : 'Connect Workspace'}
                            </GlassButton>
                        )}
                    </div>
                    {integrations.slack.enabled && (
                        <div className="p-4 border-t border-zinc-100 dark:border-white/5 flex justify-end">
                            <button onClick={handleSlackDisconnect} className="text-xs text-rose-500 hover:underline">Disconnect</button>
                        </div>
                    )}
                </div>

                {/* 2. Meta CAPI Connection */}
                <div className={`rounded-2xl border transition-all duration-300 flex flex-col ${integrations.meta.enabled ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10' : 'bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-white/5'}`}>
                    <div className="p-6 flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/10 flex items-center justify-center p-2.5 shadow-sm text-blue-600">
                                <MetaLogo className="w-full h-full" />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Meta CAPI</h3>
                                <p className="text-sm text-zinc-500">Advertising</p>
                            </div>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Send server-side events to optimize ad delivery and track real revenue.</p>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-zinc-900 dark:text-white">Enable Integration</span>
                                <Toggle checked={integrations.meta.enabled} onChange={(val) => updateMetaConfig('enabled', val)} />
                            </div>
                            
                            {integrations.meta.enabled && (
                                <div className="space-y-3 pt-2 animate-in slide-in-from-top-2">
                                    <GlassInput 
                                        label="Pixel ID" 
                                        placeholder="1234567890" 
                                        value={integrations.meta.pixel_id || ''}
                                        onChange={(e) => updateMetaConfig('pixel_id', e.target.value)}
                                    />
                                    <GlassInput 
                                        label="Access Token" 
                                        type="password"
                                        placeholder="EAA..." 
                                        value={integrations.meta.access_token || ''}
                                        onChange={(e) => updateMetaConfig('access_token', e.target.value)}
                                    />
                                    <GlassInput 
                                        label="Test Event Code (Optional)" 
                                        placeholder="TEST12345" 
                                        value={integrations.meta.test_code || ''}
                                        onChange={(e) => updateMetaConfig('test_code', e.target.value)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Email Config */}
                <div className="rounded-2xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 flex flex-col">
                    <div className="p-6 flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center p-2.5">
                                <Mail className="w-6 h-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Email Alerts</h3>
                                <p className="text-sm text-zinc-500">Notifications</p>
                            </div>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Configure who receives automated email alerts and daily digests.</p>
                        
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Recipients</label>
                            <textarea 
                                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary-500 min-h-[80px]"
                                placeholder="alice@agency.com, bob@client.com"
                                defaultValue={integrations.email.recipients.join(', ')}
                                onBlur={(e) => handleEmailRecipientChange(e.target.value)}
                            />
                            <p className="text-[10px] text-zinc-400 mt-1">Comma separated list of emails.</p>
                        </div>
                    </div>
                </div>

                {/* 4. Data Export */}
                <div className="rounded-2xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 flex flex-col">
                    <div className="p-6 flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center p-2.5">
                                <DownloadCloud className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Data Export</h3>
                                <p className="text-sm text-zinc-500">Utilities</p>
                            </div>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">Download your entire lead database including custom fields.</p>
                        <GlassButton className="w-full justify-between group">
                            <span className="flex items-center gap-2"><FileSpreadsheet className="w-4 h-4"/> Export CSV</span>
                            <DownloadCloud className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                        </GlassButton>
                    </div>
                </div>

            </div>
        )}

        {/* --- AUTOMATIONS VIEW --- */}
        {activeSubTab === 'automations' && (
            <div className="space-y-6">
                
                {/* Trigger: New Lead */}
                <GlassCard className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Zap className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Trigger: New Lead Created</h3>
                            <p className="text-sm text-zinc-500">Actions to run when a new lead enters the system.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Action: Slack */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border ${integrations.slack.enabled ? 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5' : 'bg-zinc-50/50 border-transparent opacity-50'}`}>
                            <div className="flex items-center gap-4">
                                <SlackLogo className="w-6 h-6 grayscale opacity-80" />
                                <div>
                                    <div className="text-sm font-medium text-zinc-900 dark:text-white">Send Slack Notification</div>
                                    {integrations.slack.enabled && integrations.slack.events.new_lead.enabled && (
                                        <button onClick={() => setEditingTemplate({ type: 'new_lead', template: integrations.slack.events.new_lead.template })} className="text-xs text-primary-500 hover:underline flex items-center gap-1 mt-0.5">
                                            <Edit3 className="w-3 h-3" /> Edit Template
                                        </button>
                                    )}
                                </div>
                            </div>
                            <Toggle 
                                checked={integrations.slack.enabled && integrations.slack.events.new_lead.enabled} 
                                onChange={(val) => updateSlackEvent('new_lead', val)} 
                                disabled={!integrations.slack.enabled}
                            />
                        </div>

                        {/* Action: Email */}
                        <div className="flex items-center justify-between p-4 rounded-xl border bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5">
                            <div className="flex items-center gap-4">
                                <Mail className="w-6 h-6 text-zinc-400" />
                                <div className="text-sm font-medium text-zinc-900 dark:text-white">Send Email Alert</div>
                            </div>
                            <Toggle 
                                checked={integrations.email.events.new_lead_alert} 
                                onChange={(val) => toggleEmailFeature('new_lead_alert', val)} 
                            />
                        </div>

                        {/* Action: Meta CAPI */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border ${integrations.meta.enabled ? 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5' : 'bg-zinc-50/50 border-transparent opacity-50'}`}>
                            <div className="flex items-center gap-4">
                                <MetaLogo className="w-6 h-6 text-blue-600 grayscale opacity-80" />
                                <div>
                                    <div className="text-sm font-medium text-zinc-900 dark:text-white">Send 'Lead' Event to Meta</div>
                                    <div className="text-xs text-zinc-500 mt-0.5">Useful for tracking CPL in Ads Manager.</div>
                                </div>
                            </div>
                            <Toggle 
                                checked={integrations.meta.enabled && integrations.meta.events.lead_on_create} 
                                onChange={(val) => updateMetaEvent('lead_on_create', val)} 
                                disabled={!integrations.meta.enabled}
                            />
                        </div>
                    </div>
                </GlassCard>

                {/* Trigger: Deal Won */}
                <GlassCard className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Trigger: Deal Won</h3>
                            <p className="text-sm text-zinc-500">Actions when a lead is moved to a "Won" stage.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Action: Slack */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border ${integrations.slack.enabled ? 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5' : 'bg-zinc-50/50 border-transparent opacity-50'}`}>
                            <div className="flex items-center gap-4">
                                <SlackLogo className="w-6 h-6 grayscale opacity-80" />
                                <div>
                                    <div className="text-sm font-medium text-zinc-900 dark:text-white">Send Team Celebration</div>
                                    {integrations.slack.enabled && integrations.slack.events.won_deal.enabled && (
                                        <button onClick={() => setEditingTemplate({ type: 'won_deal', template: integrations.slack.events.won_deal.template })} className="text-xs text-primary-500 hover:underline flex items-center gap-1 mt-0.5">
                                            <Edit3 className="w-3 h-3" /> Edit Template
                                        </button>
                                    )}
                                </div>
                            </div>
                            <Toggle 
                                checked={integrations.slack.enabled && integrations.slack.events.won_deal.enabled} 
                                onChange={(val) => updateSlackEvent('won_deal', val)} 
                                disabled={!integrations.slack.enabled}
                            />
                        </div>

                        {/* Action: Meta CAPI */}
                        <div className={`flex items-center justify-between p-4 rounded-xl border ${integrations.meta.enabled ? 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5' : 'bg-zinc-50/50 border-transparent opacity-50'}`}>
                            <div className="flex items-center gap-4">
                                <MetaLogo className="w-6 h-6 text-blue-600 grayscale opacity-80" />
                                <div>
                                    <div className="text-sm font-medium text-zinc-900 dark:text-white">Send 'Purchase' Event to Meta</div>
                                    <div className="text-xs text-green-500 font-bold mt-0.5">Value = Lead Revenue</div>
                                </div>
                            </div>
                            <Toggle 
                                checked={integrations.meta.enabled && integrations.meta.events.purchase_on_won} 
                                onChange={(val) => updateMetaEvent('purchase_on_won', val)} 
                                disabled={!integrations.meta.enabled}
                            />
                        </div>
                    </div>
                </GlassCard>

                {/* Scheduled */}
                <GlassCard className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-white/10">
                            <RefreshCw className="w-5 h-5 text-zinc-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Scheduled: Daily Digest</h3>
                            <p className="text-sm text-zinc-500">Sent every morning at 8:00 AM.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 rounded-xl border bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5">
                            <div className="flex items-center gap-4">
                                <Mail className="w-6 h-6 text-zinc-400" />
                                <div className="text-sm font-medium text-zinc-900 dark:text-white">Send Summary Email</div>
                            </div>
                            <Toggle 
                                checked={integrations.email.events.daily_digest} 
                                onChange={(val) => toggleEmailFeature('daily_digest', val)} 
                            />
                        </div>
                    </div>
                </GlassCard>

            </div>
        )}

        {/* TEMPLATE EDITOR MODAL */}
        <Modal isOpen={!!editingTemplate} onClose={() => setEditingTemplate(null)} title={editingTemplate?.type === 'new_lead' ? 'Edit New Lead Alert' : 'Edit Won Deal Alert'}>
            {editingTemplate && (
                <div className="space-y-4">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/5">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Available Variables</div>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_VARS.map(v => (
                                <button key={v} onClick={() => insertVar(v)} className="px-2 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded text-xs font-mono text-primary-600 dark:text-primary-400 hover:border-primary-500 transition-colors">
                                    {v}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Message Template</label>
                        <textarea 
                            value={editingTemplate.template}
                            onChange={(e) => setEditingTemplate({ ...editingTemplate, template: e.target.value })}
                            className="w-full h-32 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-sm font-mono text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-primary-500/50 resize-none"
                        />
                    </div>

                    <GlassButton onClick={saveTemplate} className="w-full justify-center">
                        <Save className="w-4 h-4 mr-2" /> Save Template
                    </GlassButton>
                </div>
            )}
        </Modal>

    </div>
  );
};
