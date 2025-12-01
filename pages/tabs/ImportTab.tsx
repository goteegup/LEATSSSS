


import React, { useState } from 'react';
import { GlassCard, GlassButton, Badge, GlassInput } from '../../components/ui/Glass';
import { UploadCloud, FileSpreadsheet, ArrowRight, CheckCircle2, Webhook, Copy, RefreshCw, Activity, Code2, Zap } from 'lucide-react';
import { Campaign } from '../../types';
import { updateCampaignSettings } from '../../services/dataService';
import { InfoTooltip } from '../../components/ui/Tooltip';

// --- MOCK DATA FOR WEBHOOK SIMULATION ---
const FAKE_PAYLOAD = {
  object: "page",
  entry: [{
    id: "1067280970047460",
    time: 1698665721,
    changes: [{
      field: "leadgen",
      value: {
        ad_id: "444455556666",
        form_id: "777788889999",
        leadgen_id: "111122223333",
        created_time: 1698665721,
        page_id: "1067280970047460",
        adgroup_id: "222233334444",
        full_name: "Sarah Connor",
        email: "sarah.connor@example.com",
        phone_number: "+15550987654",
        city: "Los Angeles",
        platform: "ig"
      }
    }]
  }]
};

interface ImportTabProps {
    campaign?: Campaign;
    onUpdate?: (c: Campaign) => void;
}

export const ImportTab: React.FC<ImportTabProps> = ({ campaign, onUpdate }) => {
  const [activeMethod, setActiveMethod] = useState<'webhook' | 'csv'>('webhook');

  // --- CSV STATE ---
  const [csvStep, setCsvStep] = useState(1);
  const [isCsvProcessing, setIsCsvProcessing] = useState(false);

  // --- WEBHOOK STATE ---
  const [webhookUrl] = useState(`https://api.leadts.app/v1/hooks/cam_${Math.floor(Math.random() * 10000)}/fb`);
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'listening' | 'received'>('idle');
  const [receivedEvents, setReceivedEvents] = useState<any[]>([]);

  // --- HELPER TO SAVE DISCOVERED FIELDS ---
  const saveDiscoveredFields = async (keys: string[]) => {
      if (!campaign || !onUpdate) return;
      
      const current = campaign.settings.discovered_fields || [];
      const newFields = keys.filter(k => !current.includes(k));
      
      if (newFields.length > 0) {
          const updatedSettings = {
              ...campaign.settings,
              discovered_fields: [...current, ...newFields]
          };
          const updatedCampaign = await updateCampaignSettings(campaign.id, updatedSettings);
          onUpdate(updatedCampaign);
      }
  };

  // --- CSV HANDLERS ---
  const handleCsvUpload = () => {
      setIsCsvProcessing(true);
      setTimeout(() => { 
          setIsCsvProcessing(false); 
          setCsvStep(2); 
          // Simulate extracting CSV headers
          saveDiscoveredFields(['Full Name', 'Email Address', 'Phone Number', 'Revenue Value']);
      }, 1500);
  };

  const handleCsvMap = () => {
      setCsvStep(3);
  };

  // --- WEBHOOK HANDLERS ---
  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    // In a real app we'd show a toast here
  };

  const simulateWebhookEvent = () => {
      setWebhookStatus('listening');
      
      // Simulate network delay
      setTimeout(() => {
          setWebhookStatus('received');
          const newEvent = {
              id: `evt_${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              source: 'Facebook Lead Ads',
              payload: FAKE_PAYLOAD
          };
          setReceivedEvents([newEvent, ...receivedEvents]);
          
          // Auto-discover keys from payload
          try {
              const leadData = newEvent.payload.entry[0].changes[0].value;
              const keys = Object.keys(leadData);
              saveDiscoveredFields(keys);
          } catch(e) { console.error('Failed to extract keys', e) }

      }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* METHOD TOGGLE */}
        <div className="flex justify-center">
            <div className="bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-xl border border-zinc-200 dark:border-white/10 flex gap-1">
                <button
                    onClick={() => setActiveMethod('webhook')}
                    className={`
                        flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all
                        ${activeMethod === 'webhook' 
                            ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' 
                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                        }
                    `}
                >
                    <Webhook className="w-4 h-4" />
                    Real-time (Webhook)
                </button>
                <button
                    onClick={() => setActiveMethod('csv')}
                    className={`
                        flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all
                        ${activeMethod === 'csv' 
                            ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' 
                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                        }
                    `}
                >
                    <UploadCloud className="w-4 h-4" />
                    CSV Upload
                </button>
            </div>
        </div>

        {/* --- WEBHOOK VIEW --- */}
        {activeMethod === 'webhook' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Configuration Card */}
                <GlassCard className="p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary-500" />
                            Connection Details
                        </h3>
                        <p className="text-sm text-zinc-500 mt-1">Configure your external source to send leads to this endpoint.</p>
                    </div>

                    <div className="space-y-4">
                        {/* Source Selector (Mock) */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Source Platform</label>
                                <InfoTooltip content="Select the type of data source. This helps detect field mappings automatically." />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 flex items-center gap-3 cursor-pointer ring-1 ring-blue-500">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">f</div>
                                    <div>
                                        <div className="text-sm font-bold text-zinc-900 dark:text-white">Facebook</div>
                                        <div className="text-[10px] text-zinc-500">Meta Lead Ads</div>
                                    </div>
                                    <CheckCircle2 className="w-4 h-4 text-blue-500 ml-auto" />
                                </div>
                                <div className="p-3 rounded-xl border border-zinc-200 dark:border-white/10 opacity-60 hover:opacity-100 cursor-pointer flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                                        <Zap className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-zinc-900 dark:text-white">Zapier</div>
                                        <div className="text-[10px] text-zinc-500">Generic Hook</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* URL Display */}
                        <div>
                             <div className="flex items-center gap-2 mb-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Webhook URL</label>
                                <InfoTooltip content="This is your unique endpoint. Paste this into your external tool to start sending data." />
                             </div>
                             <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input 
                                        readOnly 
                                        value={webhookUrl}
                                        className="w-full pl-4 pr-10 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-600 dark:text-zinc-300 font-mono text-sm focus:outline-none"
                                    />
                                </div>
                                <GlassButton onClick={copyToClipboard} variant="secondary">
                                    <Copy className="w-4 h-4" />
                                </GlassButton>
                             </div>
                             <p className="text-[10px] text-zinc-400 mt-2">
                                Paste this URL into your Facebook Lead Ad settings or Zapier "Webhooks by Zapier" step.
                             </p>
                        </div>

                        <div className="pt-4 border-t border-zinc-200 dark:border-white/5">
                            <GlassButton 
                                onClick={simulateWebhookEvent} 
                                disabled={webhookStatus === 'listening'}
                                className="w-full justify-center"
                            >
                                {webhookStatus === 'listening' ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" /> Waiting for event...
                                    </>
                                ) : (
                                    <>
                                        <Activity className="w-4 h-4" /> Send Test Event
                                    </>
                                )}
                            </GlassButton>
                        </div>
                    </div>
                </GlassCard>

                {/* Live Log Card */}
                <GlassCard className="p-6 flex flex-col h-full min-h-[400px]">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-zinc-500" />
                            Event Log
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${webhookStatus === 'listening' ? 'bg-amber-500 animate-pulse' : webhookStatus === 'received' ? 'bg-green-500' : 'bg-zinc-300'}`} />
                            <span className="text-xs font-mono text-zinc-500 uppercase">
                                {webhookStatus === 'listening' ? 'Listening' : webhookStatus === 'received' ? 'Active' : 'Idle'}
                            </span>
                        </div>
                     </div>

                     <div className="flex-1 bg-zinc-900 rounded-xl border border-white/10 p-4 font-mono text-xs overflow-y-auto max-h-[400px]">
                        {receivedEvents.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-3">
                                <Webhook className="w-8 h-8 opacity-20" />
                                <p>No events received yet.</p>
                                <p>Click "Send Test Event" to simulate.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {receivedEvents.map((evt) => (
                                    <div key={evt.id} className="animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center justify-between text-zinc-500 mb-2 pb-2 border-b border-white/5">
                                            <span className="text-green-400 font-bold">POST /hooks/fb</span>
                                            <span>{evt.timestamp}</span>
                                        </div>
                                        <pre className="text-blue-300 overflow-x-auto">
                                            {JSON.stringify(evt.payload, null, 2)}
                                        </pre>
                                        
                                        {/* Auto-Mapping visualizer */}
                                        <div className="mt-3 p-2 bg-white/5 rounded border border-white/5">
                                            <p className="text-zinc-500 mb-2">Mapped Fields:</p>
                                            <div className="grid grid-cols-2 gap-2 text-zinc-400">
                                                <div>full_name <ArrowRight className="inline w-3 h-3 mx-1"/> <span className="text-white">Sarah Connor</span></div>
                                                <div>email <ArrowRight className="inline w-3 h-3 mx-1"/> <span className="text-white">sarah...</span></div>
                                                <div>phone <ArrowRight className="inline w-3 h-3 mx-1"/> <span className="text-white">+1555...</span></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>
                </GlassCard>
            </div>
        )}

        {/* --- CSV VIEW --- */}
        {activeMethod === 'csv' && (
            <div className="max-w-3xl mx-auto">
                 {/* Progress Stepper */}
                <div className="flex items-center justify-between mb-10 px-10">
                    {[1, 2, 3].map(s => (
                        <div key={s} className="relative flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${csvStep >= s ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-white/10 text-zinc-500'}`}>
                                {csvStep > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                            </div>
                            <span className={`absolute -bottom-8 text-xs font-medium ${csvStep >= s ? 'text-primary-600 dark:text-primary-400' : 'text-zinc-500'}`}>
                                {s === 1 ? 'Upload' : s === 2 ? 'Map Columns' : 'Finish'}
                            </span>
                        </div>
                    ))}
                    <div className="absolute left-0 right-0 top-5 h-0.5 bg-zinc-200 dark:bg-zinc-800 -z-10 mx-20" />
                    <div 
                        className="absolute left-0 top-5 h-0.5 bg-primary-500/50 -z-10 mx-20 transition-all duration-500" 
                        style={{ width: csvStep === 1 ? '0%' : csvStep === 2 ? '50%' : '80%' }} 
                    />
                </div>

                <GlassCard className="p-10 min-h-[400px] flex flex-col items-center justify-center">
                    {csvStep === 1 && (
                        <div className="text-center space-y-6">
                            <div className="w-24 h-24 bg-zinc-100 dark:bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto border border-dashed border-zinc-300 dark:border-zinc-700 group cursor-pointer hover:border-primary-500 transition-colors">
                                <UploadCloud className="w-10 h-10 text-zinc-400 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Upload CSV File</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm mx-auto">Drag and drop your lead list here, or click to browse. Max 5MB.</p>
                            </div>
                            <GlassButton onClick={handleCsvUpload} disabled={isCsvProcessing} className="w-48 justify-center mx-auto">
                                {isCsvProcessing ? 'Uploading...' : 'Select File'}
                            </GlassButton>
                        </div>
                    )}

                    {csvStep === 2 && (
                        <div className="w-full space-y-6">
                            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/5 pb-4">
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Map Columns</h3>
                                <span className="text-sm text-zinc-500">leads_export_q3.csv</span>
                            </div>
                            
                            <div className="space-y-3">
                                {['Full Name', 'Email Address', 'Phone Number', 'Revenue Value'].map((header, i) => (
                                    <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-3 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5">
                                        <div className="text-sm text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                            <FileSpreadsheet className="w-4 h-4 text-zinc-400" />
                                            {header}
                                        </div>
                                        <div className="hidden md:flex justify-center">
                                            <ArrowRight className="w-4 h-4 text-zinc-400" />
                                        </div>
                                        <select className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-primary-600 dark:text-primary-400 font-medium focus:outline-none focus:border-primary-500">
                                            <option>Select Field...</option>
                                            <option selected>Matched: {header.split(' ')[0].toLowerCase()}</option>
                                        </select>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-4">
                                <GlassButton onClick={handleCsvMap}>
                                    Process Import <ArrowRight className="w-4 h-4" />
                                </GlassButton>
                            </div>
                        </div>
                    )}

                    {csvStep === 3 && (
                        <div className="text-center space-y-6 animate-in zoom-in-95 duration-300">
                            <div className="w-24 h-24 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto border border-primary-500/30">
                                <CheckCircle2 className="w-12 h-12 text-primary-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Import Complete!</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 mt-2">Successfully imported 42 leads into the "New Lead" stage.</p>
                            </div>
                            <GlassButton variant="secondary" onClick={() => setCsvStep(1)} className="w-48 justify-center mx-auto">
                                Import Another
                            </GlassButton>
                        </div>
                    )}
                </GlassCard>
            </div>
        )}
    </div>
  );
};