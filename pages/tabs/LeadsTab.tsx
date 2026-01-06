
import React, { useEffect, useState, useMemo } from 'react';
import { Campaign, Lead, SYSTEM_FIELDS, WorkspaceSettings } from '../../types';
import { getLeadsByCampaign, getFieldValue, addLead, updateLead, deleteLead, getWorkspaceSettings } from '../../services/dataService';
import { GlassCard, GlassButton, Badge, GlassInput } from '../../components/ui/Glass';
import { Modal } from '../../components/ui/Modal';
import { Sheet } from '../../components/ui/Sheet';
import { 
    LayoutList, Kanban, User, Phone, Mail, Plus, Trash2, Calendar, 
    DollarSign, Save, ChevronDown, ChevronUp, GripVertical, Briefcase, 
    Clock, Tag, Globe, Activity, Lock, FileText, AlignLeft, Search, 
    ArrowUpDown, Filter, X, ExternalLink, MoreVertical, CheckCircle2,
    ChevronRight
} from 'lucide-react';

export const LeadsTab: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const permissions = campaign.settings.client_view || { show_kanban: true, show_list: true };
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>(permissions.show_kanban ? 'kanban' : 'list');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStageFilter, setActiveStageFilter] = useState<string | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'revenue_desc'>('newest');
  
  // Drag & Drop
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  useEffect(() => {
    getLeadsByCampaign(campaign.id).then(setLeads);
    getWorkspaceSettings().then(setSettings);
    // On mobile, expand the first stage by default
    if (campaign.settings.pipeline_stages.length > 0) {
        setExpandedStages({ [campaign.settings.pipeline_stages[0].id]: true });
    }
  }, [campaign.id]);

  const currency = settings?.currency || '€';

  const processedLeads = useMemo(() => {
      let result = [...leads];
      if (searchQuery) {
          const q = searchQuery.toLowerCase();
          result = result.filter(l => 
              (l.data.full_name || '').toLowerCase().includes(q) || 
              (l.data.email || '').toLowerCase().includes(q) ||
              (l.data.phone || '').toLowerCase().includes(q)
          );
      }
      if (activeStageFilter !== 'all') {
          result = result.filter(l => l.stage_id === activeStageFilter);
      }
      result.sort((a, b) => {
          if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          if (sortBy === 'revenue_desc') return (Number(b.data.revenue) || 0) - (Number(a.data.revenue) || 0);
          return 0;
      });
      return result;
  }, [leads, searchQuery, activeStageFilter, sortBy]);

  const toggleStage = (stageId: string) => {
      setExpandedStages(prev => ({
          ...prev,
          [stageId]: !prev[stageId]
      }));
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
      setDraggedLeadId(leadId);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
      e.preventDefault();
      setDragOverStageId(null);
      if (!draggedLeadId) return;
      const leadToMove = leads.find(l => l.id === draggedLeadId);
      if (!leadToMove || leadToMove.stage_id === stageId) return;
      const updatedLead = { ...leadToMove, stage_id: stageId, updated_at: new Date().toISOString() };
      setLeads(prev => prev.map(l => l.id === draggedLeadId ? updatedLead : l));
      await updateLead(updatedLead);
  };

  const openLeadEdit = (lead: Lead) => setSelectedLead(lead);

  const getStageColor = (stageId: string) => {
      const stage = campaign.settings.pipeline_stages.find(s => s.id === stageId);
      const map: Record<string, string> = {
          'bg-blue-500': 'text-blue-500 border-blue-500/20 bg-blue-500/5',
          'bg-yellow-500': 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5',
          'bg-purple-500': 'text-purple-500 border-purple-500/20 bg-purple-500/5',
          'bg-green-500': 'text-green-500 border-green-500/20 bg-green-500/5',
          'bg-rose-500': 'text-rose-500 border-rose-500/20 bg-rose-500/5',
          'bg-zinc-500': 'text-zinc-500 border-zinc-500/20 bg-zinc-500/5',
      };
      return map[stage?.color || ''] || map['bg-zinc-500'];
  };

  const renderFormInput = (key: string, label: string, type: string, value: any, onChange: (val: any) => void) => (
      <GlassInput 
        key={key} label={label}
        type={['number', 'currency'].includes(type) ? 'number' : type === 'date' ? 'date' : 'text'}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      />
  );

  return (
    <div className="space-y-6 h-full flex flex-col pb-20">
      
      {/* --- SMART FILTER BAR --- */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                    type="text" 
                    placeholder="Search name, email, or phone..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 transition-all outline-none"
                />
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-white/10">
                    <button onClick={() => setViewMode('kanban')} className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-zinc-800 text-primary-500 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}><Kanban className="w-4 h-4" /></button>
                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-primary-500 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}><LayoutList className="w-4 h-4" /></button>
                </div>
                <GlassButton onClick={() => setIsAddModalOpen(true)} className="px-5"><Plus className="w-4 h-4 mr-1.5" /> Add Lead</GlassButton>
            </div>
        </div>

        {/* Stage Pills (Quick Filter) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button 
                onClick={() => setActiveStageFilter('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${activeStageFilter === 'all' ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-transparent' : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-white/5 hover:border-zinc-300'}`}
            >
                All Leads <span className="ml-1.5 opacity-50">{leads.length}</span>
            </button>
            {campaign.settings.pipeline_stages.sort((a,b)=>a.order-b.order).map(stage => {
                const count = leads.filter(l => l.stage_id === stage.id).length;
                const isActive = activeStageFilter === stage.id;
                return (
                    <button 
                        key={stage.id}
                        onClick={() => setActiveStageFilter(stage.id)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border flex items-center gap-2 ${isActive ? 'bg-primary-500 text-white border-transparent' : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-white/5 hover:border-zinc-300'}`}
                    >
                        <div className={`w-1.5 h-1.5 rounded-full ${stage.color}`} />
                        {stage.name} <span className={`ml-0.5 opacity-50 ${isActive ? 'text-white' : ''}`}>{count}</span>
                    </button>
                )
            })}
        </div>
      </div>

      {/* --- CONTENT VIEW --- */}
      <div className="flex-1 min-h-0">
          {viewMode === 'kanban' ? (
              <div className="flex flex-col md:flex-row gap-4 md:gap-6 overflow-x-auto md:h-full pb-4 scrollbar-thin">
                  {campaign.settings.pipeline_stages.sort((a,b)=>a.order-b.order).map(stage => {
                      const stageLeads = processedLeads.filter(l => l.stage_id === stage.id);
                      const isExpanded = expandedStages[stage.id] ?? true;

                      return (
                          <div 
                            key={stage.id} 
                            className={`
                                flex-shrink-0 w-full md:w-80 flex flex-col gap-2 transition-all duration-300
                                ${dragOverStageId === stage.id ? 'bg-primary-500/5 rounded-2xl ring-2 ring-primary-500/20' : ''}
                                ${!isExpanded ? 'md:h-full' : ''}
                            `}
                            onDragOver={(e) => { e.preventDefault(); setDragOverStageId(stage.id); }}
                            onDragLeave={() => setDragOverStageId(null)}
                            onDrop={(e) => handleDrop(e, stage.id)}
                          >
                              {/* STAGE HEADER (Accordion Trigger on Mobile) */}
                              <button 
                                onClick={() => toggleStage(stage.id)}
                                className={`
                                    flex items-center justify-between px-4 py-3 rounded-xl border transition-all
                                    md:cursor-default md:pointer-events-none md:bg-transparent md:border-transparent md:px-2 md:py-1
                                    ${isExpanded 
                                        ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 shadow-sm' 
                                        : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-white/5'
                                    }
                                `}
                              >
                                  <div className="flex items-center gap-3">
                                      <div className={`w-1.5 h-1.5 rounded-full ${stage.color} shadow-[0_0_8px_rgba(var(--color-primary-500),0.4)]`} />
                                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">{stage.name}</h3>
                                      <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">{stageLeads.length}</span>
                                  </div>
                                  <div className="md:hidden">
                                      {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                                  </div>
                              </button>
                              
                              {/* STAGE CONTENT (Collapsible on Mobile) */}
                              <div className={`
                                  flex-1 space-y-3 overflow-y-auto pr-1 no-scrollbar transition-all duration-300
                                  ${isExpanded ? 'max-h-[2000px] opacity-100 visible mt-2' : 'max-h-0 opacity-0 invisible md:max-h-none md:opacity-100 md:visible'}
                              `}>
                                  {stageLeads.map(lead => (
                                      <div 
                                        key={lead.id} 
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, lead.id)}
                                        onClick={() => openLeadEdit(lead)}
                                        className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-primary-500/30 transition-all cursor-grab active:cursor-grabbing overflow-hidden"
                                      >
                                          {/* Visual Accent */}
                                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${stage.color} opacity-20 group-hover:opacity-100 transition-opacity`} />
                                          
                                          <div className="flex justify-between items-start mb-2">
                                              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                                                  {getFieldValue(lead, campaign.settings.card_primary_field || 'full_name')}
                                              </h4>
                                              <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                  <MoreVertical className="w-3.5 h-3.5" />
                                              </button>
                                          </div>
                                          
                                          <div className="space-y-1.5">
                                              {campaign.settings.card_field_order?.slice(0, 3).map(key => {
                                                  const val = getFieldValue(lead, key);
                                                  if (val === '-' || !val) return null;
                                                  return (
                                                      <div key={key} className="flex items-center gap-2 text-[11px] text-zinc-500 truncate">
                                                          {key === 'email' ? <Mail className="w-3 h-3 opacity-50" /> : key === 'phone' ? <Phone className="w-3 h-3 opacity-50" /> : <Tag className="w-3 h-3 opacity-50" />}
                                                          {val}
                                                      </div>
                                                  )
                                              })}
                                          </div>
                                          
                                          <div className="mt-3 pt-3 border-t border-zinc-50 dark:border-white/5 flex justify-between items-center">
                                              <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                                                  <Clock className="w-2.5 h-2.5" /> {new Date(lead.created_at).toLocaleDateString()}
                                              </div>
                                              {lead.data.revenue && (
                                                  <div className="text-xs font-bold text-green-500 flex items-center gap-0.5">
                                                      {currency}{lead.data.revenue.toLocaleString()}
                                                  </div>
                                              )}
                                          </div>
                                      </div>
                                  ))}
                                  {stageLeads.length === 0 && isExpanded && (
                                      <div className="py-8 text-center text-[11px] text-zinc-500 border border-dashed border-zinc-200 dark:border-white/5 rounded-2xl opacity-50">Drag leads here</div>
                                  )}
                              </div>
                          </div>
                      )
                  })}
              </div>
          ) : (
              <GlassCard className="overflow-hidden border-zinc-200 dark:border-white/5 h-full flex flex-col">
                  <div className="overflow-x-auto flex-1">
                      <table className="w-full text-sm text-left border-collapse">
                          <thead className="sticky top-0 z-20 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-white/5">
                              <tr>
                                  <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-[10px] tracking-widest">Name</th>
                                  <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-[10px] tracking-widest">Status</th>
                                  <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-[10px] tracking-widest">Contact Info</th>
                                  <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-[10px] tracking-widest">Revenue</th>
                                  <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-[10px] tracking-widest">Created</th>
                                  <th className="px-6 py-4 font-bold text-zinc-500 uppercase text-[10px] tracking-widest text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                              {processedLeads.map(lead => (
                                  <tr key={lead.id} onClick={() => openLeadEdit(lead)} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group">
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                              <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-600 font-bold text-xs uppercase">
                                                  {(lead.data.full_name || 'U').charAt(0)}
                                              </div>
                                              <span className="font-bold text-zinc-900 dark:text-zinc-100">{lead.data.full_name || 'Untitled'}</span>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4">
                                          <Badge className={getStageColor(lead.stage_id)}>
                                              {campaign.settings.pipeline_stages.find(s => s.id === lead.stage_id)?.name}
                                          </Badge>
                                      </td>
                                      <td className="px-6 py-4">
                                          <div className="flex flex-col gap-1 text-xs">
                                              <a href={`mailto:${lead.data.email}`} className="text-zinc-500 hover:text-primary-500 flex items-center gap-1.5"><Mail className="w-3 h-3" /> {lead.data.email}</a>
                                              <a href={`tel:${lead.data.phone}`} className="text-zinc-500 hover:text-primary-500 flex items-center gap-1.5"><Phone className="w-3 h-3" /> {lead.data.phone}</a>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4">
                                          {lead.data.revenue ? (
                                              <span className="font-bold text-green-500 font-mono">{currency}{Number(lead.data.revenue).toLocaleString()}</span>
                                          ) : <span className="text-zinc-400">-</span>}
                                      </td>
                                      <td className="px-6 py-4 text-zinc-500 text-xs font-mono">
                                          {new Date(lead.created_at).toLocaleDateString()}
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <button className="p-2 text-zinc-400 hover:text-primary-500 rounded-lg group-hover:bg-primary-500/10 transition-all"><ExternalLink className="w-4 h-4" /></button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
                  {processedLeads.length === 0 && (
                      <div className="py-20 text-center space-y-3">
                          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto"><X className="w-8 h-8 text-zinc-400" /></div>
                          <h3 className="font-bold text-zinc-900 dark:text-white">No matching leads</h3>
                          <p className="text-sm text-zinc-500">Try adjusting your filters or search terms.</p>
                          <GlassButton variant="secondary" onClick={() => { setSearchQuery(''); setActiveStageFilter('all'); }}>Clear Filters</GlassButton>
                      </div>
                  )}
              </GlassCard>
          )}
      </div>

      {/* --- ADD MODAL --- */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Quick Create Lead">
        <form onSubmit={async (e) => {
            e.preventDefault();
            const newLead: Lead = {
                id: `l${Date.now()}`,
                campaign_id: campaign.id,
                stage_id: campaign.settings.pipeline_stages[0].id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                data: formData
            };
            await addLead(newLead);
            setLeads([...leads, newLead]);
            setIsAddModalOpen(false);
            setFormData({});
        }} className="space-y-4">
            {campaign.settings.active_system_fields.map(key => {
                const f = SYSTEM_FIELDS.find(sf => sf.key === key);
                return renderFormInput(key, f?.name || key, f?.type || 'text', formData[key], (v)=>setFormData({...formData, [key]: v}));
            })}
            <GlassButton type="submit" className="w-full py-3">Create Lead</GlassButton>
        </form>
      </Modal>

      {/* --- EDIT SHEET --- */}
      <Sheet isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} title="Lead Record" width="max-w-xl">
          {selectedLead && (
              <div className="space-y-8">
                  <div className="flex items-center gap-4 p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl">
                      <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white text-xl font-bold uppercase">
                          {(selectedLead.data.full_name || 'U').charAt(0)}
                      </div>
                      <div>
                          <h3 className="text-xl font-bold text-white">{selectedLead.data.full_name || 'Untitled Lead'}</h3>
                          <p className="text-xs text-zinc-500 font-mono">ID: {selectedLead.id}</p>
                      </div>
                  </div>

                  {/* Stage Quick Switcher in Edit Sheet */}
                  <div className="space-y-3">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Current Status</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {campaign.settings.pipeline_stages.sort((a,b)=>a.order-b.order).map(stage => {
                              const isActive = selectedLead.stage_id === stage.id;
                              return (
                                  <button
                                    key={stage.id}
                                    onClick={() => setSelectedLead({...selectedLead, stage_id: stage.id})}
                                    className={`
                                        px-3 py-2 rounded-xl text-xs font-bold transition-all border text-left flex flex-col gap-1
                                        ${isActive 
                                            ? 'bg-zinc-900 border-zinc-700 ring-1 ring-primary-500 text-white' 
                                            : 'bg-zinc-950 border-white/5 text-zinc-500 hover:border-white/10'
                                        }
                                    `}
                                  >
                                      <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                                      {stage.name}
                                  </button>
                              )
                          })}
                      </div>
                  </div>

                  <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {campaign.settings.active_system_fields.map(key => {
                              const f = SYSTEM_FIELDS.find(sf => sf.key === key);
                              return (
                                  <div key={key} className="space-y-1.5">
                                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">{f?.name || key}</label>
                                      <input 
                                        className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary-500/50 outline-none"
                                        value={selectedLead.data[key] || ''}
                                        onChange={(e) => setSelectedLead({...selectedLead, data: {...selectedLead.data, [key]: e.target.value}})}
                                      />
                                  </div>
                              )
                          })}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Internal Notes</label>
                        <textarea 
                            className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-300 min-h-[120px] outline-none focus:border-primary-500/50"
                            placeholder="Add private team notes..."
                            value={selectedLead.notes || ''}
                            onChange={(e) => setSelectedLead({...selectedLead, notes: e.target.value})}
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                          <GlassButton onClick={async () => {
                              await updateLead(selectedLead);
                              setLeads(prev => prev.map(l => l.id === selectedLead.id ? selectedLead : l));
                              setSelectedLead(null);
                          }} className="flex-1 py-3"><CheckCircle2 className="w-4 h-4 mr-2" /> Update Record</GlassButton>
                          <button onClick={async () => {
                              if(confirm('Delete lead?')) {
                                  await deleteLead(selectedLead.id);
                                  setLeads(prev => prev.filter(l => l.id !== selectedLead.id));
                                  setSelectedLead(null);
                              }
                          }} className="p-3 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500/20 transition-all"><Trash2 className="w-5 h-5" /></button>
                      </div>
                  </div>
              </div>
          )}
      </Sheet>
    </div>
  );
};
