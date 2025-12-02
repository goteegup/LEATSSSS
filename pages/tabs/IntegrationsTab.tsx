
import React, { useState } from 'react';
import { Campaign, IntegrationSettings, NotificationTemplate } from '../../types';
import { updateCampaignSettings } from '../../services/dataService';
import { GlassCard, GlassButton, Toggle, GlassInput, Badge } from '../../components/ui/Glass';
import { Modal } from '../../components/ui/Modal';
import { MessageSquare, Mail, Zap, Plug, Bell, Database, Hash, Edit3, Save, CheckCircle2, AlertCircle, XCircle, Calendar } from 'lucide-react';

interface IntegrationsTabProps {
  campaign: Campaign;
  onUpdate: (newCampaign: Campaign) => void;
}

// --- LOGOS ---
const SlackLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
    <svg className={className} viewBox="0 0 127 127" xmlns="http://www.w3.org/2000/svg">
        <path fill="#E01E5A" d="M29.6 22.8c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v13.2H42.8c-7.3 0-13.2-5.9-13.2-13.2zm17.6 13.2c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h13.2v13.2z"/>
        <path fill="#36C5F0" d="M29.6 84.4c-7.3 0-13.2 5.9-13.2 13.2 0 7.3 5.9 13.2 13.2 13.2 7.3 0 13.2-5.9 13.2-13.2V84.4H29.6zm13.2-17.6c-7.3 0-13.2 5.9-13.2 13.2 0 7.3 5.9 13.2 13.2 13.2 13.2V66.8h-13.2c7.3 0 13.2-5.9 13.2-13.2 0-7.3-5.9-13.2-13.2-13.2H42.8z"/>
        <path fill="#2EB67D" d="M84.4 84.4c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2-7.3 0-13.2-5.9-13.2-13.2V84.4h13.2zm-17.6-13.2c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H66.8v-13.2z"/>
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
        webhook_url: '',
        channel: '',
        events: {
            new_lead: { enabled: true, template: "🔥 New Lead: {full_name} ({phone}) via {source}" },
            won_deal: { enabled: true, template: "💰 BOOM! Deal closed: {full_name} just brought in {revenue}!" },
            appointment_booked: { enabled: true, template: "📅 Appointment confirmed with {full_name}." },
            lead_lost: { enabled: false, template: "❌ Lead lost: {full_name}. Reason: {notes}" },
            lead_unreachable: { enabled: false, template: "⚠️ Alert: {full_name} has not been reached after 2 attempts." }
        }
    },
    email: {
        enabled: false,
        recipients: [],
        events: {
            new_lead_alert: true,
            daily_digest: false,
            appointment_confirmation_customer: false,
            won_deal_alert: true
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

type EventType = 'new_lead' | 'won_deal' | 'appointment_booked' | 'lead_lost' | 'lead_unreachable';

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({ campaign, onUpdate }) => {
  const [activeSubTab, setActiveSubTab] = useState<'notifications' | 'meta'>('notifications');
  const [loading, setLoading] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{ type: EventType, template: string } | null>(null);

  const integrations = { ...DEFAULT_INTEGRATIONS, ...campaign.settings.integrations };
  integrations.slack.events = { ...DEFAULT_INTEGRATIONS.slack.events, ...integrations.slack.events };
  integrations.email.events = { ...DEFAULT_INTEGRATIONS.email.events, ...integrations.email.events };

  const updateSettings = async (newIntegrations: IntegrationSettings) => {
      setLoading(true);
      const newSettings = { ...campaign.settings, integrations: newIntegrations };
      const updated = await updateCampaignSettings(campaign.id, newSettings);
      onUpdate(updated);
      setLoading(false);
  };

  // --- HANDLERS ---

  const handleSlackConnect = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      const newSlack = {
          ...integrations.slack,
          enabled: true,
          webhook_url: "https://hooks.slack.com/services/mock",
          channel: "#leads"
      };
      await updateSettings({ ...integrations, slack: newSlack });
  };

  const handleSlackDisconnect = async () => {
      if(confirm('Disconnect Slack?')) {
          await updateSettings({ ...integrations, slack: { ...integrations.slack, enabled: false } });
      }
  };

  const updateSlackEvent = async (type: EventType, enabled: boolean) => {
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

  const handleEmailRecipientChange = async (val: string) => {
      const emails = val.split(',').map(e => e.trim()).filter(e => e);
      const newEmail = { ...integrations.email, recipients: emails };
      await updateSettings({ ...integrations, email: newEmail });
  };

  const toggleEmailFeature = async (key: keyof IntegrationSettings['email']['events'], val: boolean) => {
      const newEmail = { ...integrations.email };
      newEmail.events[key] = val;
      await updateSettings({ ...integrations, email: newEmail });
  };

  const updateMetaConfig = async (key: keyof IntegrationSettings['meta'], val: any) => {
      const newMeta = { ...integrations.meta, [key]: val };
      await updateSettings({ ...integrations, meta: newMeta });
  };

  const updateMetaEvent = async (key: keyof IntegrationSettings['meta']['events'], val: boolean) => {
      const newMeta = { ...integrations.meta };
      newMeta.events[key] = val;
      await updateSettings({ ...integrations, meta: newMeta });
  };

  const AVAILABLE_VARS = ['{full_name}', '{email}', '{phone}', '{revenue}', '{source}', '{notes}'];
  const insertVar = (v: string) => {
      if (editingTemplate) {
          setEditingTemplate({ ...editingTemplate, template: editingTemplate.template + ' ' + v });
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* Header & Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 dark:border-white/5 pb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary-500" />
                Integrations
            </h2>
            
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-white/5">
                <button
                    onClick={() => setActiveSubTab('notifications')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeSubTab === 'notifications' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                >
                    <Bell className="w-4 h-4" /> Notifications
                </button>
                <button
                    onClick={() => setActiveSubTab('meta')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeSubTab === 'meta' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}
                >
                    <Database className="w-4 h-4" /> Meta CAPI
                </button>
            </div>
        </div>

        {/* --- NOTIFICATIONS TAB (Slack & Email) --- */}
        {activeSubTab === 'notifications' && (
            <div className="space-y-8">
                
                {/* 1. SLACK SECTION */}
                <GlassCard className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white dark:bg-black/20 border border-zinc-200 dark:border-white/10 flex items-center justify-center p-2.5 shadow-sm">
                                <SlackLogo className="w-full h-full" />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Slack</h3>
                                <p className="text-sm text-zinc-500">Real-time team alerts</p>
                            </div>
                        </div>
                        {integrations.slack.enabled ? (
                            <button onClick={handleSlackDisconnect} className="text-xs text-rose-500 hover:underline">Disconnect</button>
                        ) : (
                            <GlassButton onClick={handleSlackConnect} disabled={loading}>{loading ? 'Connecting...' : 'Connect Workspace'}</GlassButton>
                        )}
                    </div>

                    {integrations.slack.enabled ? (
                        <div className="space-y-6">
                            {/* Channel Config */}
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Post to Channel</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                    <select 
                                        value={integrations.slack.channel || ''}
                                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-lg text-sm appearance-none focus:outline-none focus:border-primary-500"
                                    >
                                        <option>#general</option>
                                        <option>#leads-notifications</option>
                                        <option>#sales-wins</option>
                                    </select>
                                </div>
                            </div>

                            {/* Triggers List */}
                            <div className="space-y-1">
                                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Triggers</div>
                                {[
                                    { id: 'new_lead', label: 'New Lead Created', icon: Zap, color: 'text-blue-500' },
                                    { id: 'appointment_booked', label: 'Appointment Booked', icon: Calendar, color: 'text-purple-500' },
                                    { id: 'won_deal', label: 'Deal Won', icon: CheckCircle2, color: 'text-green-500' },
                                    { id: 'lead_lost', label: 'Lead Lost', icon: XCircle, color: 'text-rose-500' },
                                    { id: 'lead_unreachable', label: 'Unreachable Alert', icon: AlertCircle, color: 'text-amber-500' }
                                ].map(evt => (
                                    <div key={evt.id} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg group">
                                        <div className="flex items-center gap-3">
                                            <evt.icon className={`w-4 h-4 ${evt.color}`} />
                                            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{evt.label}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => setEditingTemplate({ type: evt.id as EventType, template: integrations.slack.events[evt.id as EventType].template })}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-primary-500 flex items-center gap-1"
                                            >
                                                <Edit3 className="w-3 h-3" /> Edit Msg
                                            </button>
                                            <Toggle 
                                                checked={integrations.slack.events[evt.id as EventType].enabled} 
                                                onChange={(val) => updateSlackEvent(evt.id as EventType, val)} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-white/5">
                            <p className="text-sm text-zinc-500">Connect Slack to enable notifications.</p>
                        </div>
                    )}
                </GlassCard>

                {/* 2. EMAIL SECTION */}
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center p-2.5">
                            <Mail className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-zinc-900 dark:text-white text-lg">Email Alerts</h3>
                            <p className="text-sm text-zinc-500">Internal & customer emails</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Recipients (Comma separated)</label>
                            <textarea 
                                className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary-500 min-h-[60px]"
                                placeholder="alice@agency.com, bob@client.com"
                                defaultValue={integrations.email.recipients.join(', ')}
                                onBlur={(e) => handleEmailRecipientChange(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Active Alerts</div>
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg">
                                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200">New Lead Alert</div>
                                <Toggle checked={integrations.email.events.new_lead_alert} onChange={(val) => toggleEmailFeature('new_lead_alert', val)} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg">
                                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Won Deal Alert</div>
                                <Toggle checked={integrations.email.events.won_deal_alert} onChange={(val) => toggleEmailFeature('won_deal_alert', val)} />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg opacity-75">
                                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Daily Digest Summary</div>
                                <Toggle checked={integrations.email.events.daily_digest} onChange={(val) => toggleEmailFeature('daily_digest', val)} />
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        )}

        {/* --- META CAPI TAB (THE BIG PLACE) --- */}
        {activeSubTab === 'meta' && (
            <GlassCard className="p-8 border-blue-500/20 shadow-lg shadow-blue-500/5">
                <div className="flex items-start gap-6 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-blue-600 shadow-md">
                        <MetaLogo className="w-10 h-10" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Meta Conversion API</h3>
                            <Toggle checked={integrations.meta.enabled} onChange={(val) => updateMetaConfig('enabled', val)} />
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1 max-w-xl">
                            Send server-side events directly to Meta to improve ad targeting and track real revenue (ROAS). This creates a feedback loop for the algorithm.
                        </p>
                    </div>
                </div>

                <div className={`space-y-8 transition-all duration-300 ${integrations.meta.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    
                    {/* 1. Authentication */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-white/10">
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
                        <div className="md:col-span-2">
                            <GlassInput 
                                label="Test Event Code (Optional)" 
                                placeholder="TEST12345" 
                                value={integrations.meta.test_code || ''}
                                onChange={(e) => updateMetaConfig('test_code', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 2. Events Configuration */}
                    <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">Event Syncing</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Lead Event */}
                            <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Zap className="w-4 h-4 text-blue-500" />
                                        <span className="font-bold text-zinc-900 dark:text-white">Lead Event</span>
                                    </div>
                                    <p className="text-xs text-zinc-500">Sent when a new lead is created.</p>
                                </div>
                                <Toggle 
                                    checked={integrations.meta.events.lead_on_create} 
                                    onChange={(val) => updateMetaEvent('lead_on_create', val)} 
                                />
                            </div>

                            {/* Purchase Event */}
                            <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="font-bold text-zinc-900 dark:text-white">Purchase Event</span>
                                    </div>
                                    <p className="text-xs text-zinc-500">Sent when stage is "Won". Value = Revenue.</p>
                                </div>
                                <Toggle 
                                    checked={integrations.meta.events.purchase_on_won} 
                                    onChange={(val) => updateMetaEvent('purchase_on_won', val)} 
                                />
                            </div>

                        </div>
                    </div>

                </div>
            </GlassCard>
        )}

        {/* TEMPLATE EDITOR MODAL */}
        <Modal isOpen={!!editingTemplate} onClose={() => setEditingTemplate(null)} title="Edit Notification Template">
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
