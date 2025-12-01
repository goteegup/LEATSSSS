import React, { useEffect, useState } from 'react';
import { Campaign, Lead, SYSTEM_FIELDS } from '../../types';
import { getLeadsByCampaign, getFieldValue, addLead, updateLead, deleteLead } from '../../services/dataService';
import { GlassCard, GlassButton, Badge, GlassInput } from '../../components/ui/Glass';
import { Modal } from '../../components/ui/Modal';
import { Sheet } from '../../components/ui/Sheet';
import { LayoutList, Kanban, User, Phone, Mail, Plus, Trash2, Calendar, DollarSign, Save, ChevronDown, ChevronUp, GripVertical, Briefcase, Clock, Tag, Globe, Activity } from 'lucide-react';

export const LeadsTab: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Mobile Accordion State
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  
  // New Lead Form State
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getLeadsByCampaign(campaign.id).then(setLeads);
    if (campaign.settings.pipeline_stages.length > 0) {
        setExpandedStage(campaign.settings.pipeline_stages[0].id);
    }
  }, [campaign.id]);

  const validateForm = () => {
      // Basic validation: check if at least one active field has a value
      const hasValue = Object.keys(formData).length > 0;
      if (!hasValue) {
          setError('Please fill in at least one field.');
          return false;
      }
      return true;
  };

  const handleAddLead = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!validateForm()) return;

      const newLead: Lead = {
          id: `l${Date.now()}`,
          campaign_id: campaign.id,
          stage_id: campaign.settings.pipeline_stages[0].id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          data: formData,
          notes: ''
      };

      await addLead(newLead);
      setLeads([...leads, newLead]);
      setIsAddModalOpen(false);
      setFormData({});
  };

  const handleUpdateLead = async () => {
      if (!selectedLead) return;
      const updated = { ...selectedLead, updated_at: new Date().toISOString() };
      await updateLead(updated);
      setLeads(leads.map(l => l.id === updated.id ? updated : l));
      setSelectedLead(null);
  };

  const handleDeleteLead = async () => {
      if (!selectedLead) return;
      if (window.confirm('Are you sure you want to delete this lead?')) {
          await deleteLead(selectedLead.id);
          setLeads(leads.filter(l => l.id !== selectedLead.id));
          setSelectedLead(null);
      }
  };

  // Helper to get Icon for field
  const getFieldIcon = (key: string) => {
      if (key.includes('name')) return <User className="w-4 h-4" />;
      if (key.includes('email')) return <Mail className="w-4 h-4" />;
      if (key.includes('phone')) return <Phone className="w-4 h-4" />;
      if (key.includes('revenue')) return <DollarSign className="w-4 h-4" />;
      if (key.includes('date')) return <Calendar className="w-4 h-4" />;
      return <Briefcase className="w-4 h-4" />;
  };

  const renderFormInput = (key: string, label: string, type: string, value: any, onChange: (val: any) => void) => {
      return (
          <GlassInput 
            key={key}
            label={label}
            icon={getFieldIcon(key)}
            type={type === 'number' || type === 'currency' ? 'number' : type === 'date' ? 'date' : 'text'}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={type === 'currency' ? '0.00' : ''}
          />
      );
  };

  const toggleAccordion = (stageId: string) => {
      setExpandedStage(expandedStage === stageId ? null : stageId);
  };

  // Helper to resolve field name from config
  const getFieldName = (key: string) => {
      const sys = SYSTEM_FIELDS.find(f => f.key === key);
      if (sys) return sys.name;
      const custom = campaign.settings.custom_fields.find(f => f.key === key);
      return custom ? custom.name : key;
  };

  const renderKanbanCard = (lead: Lead) => {
      const primaryKey = campaign.settings.card_primary_field || 'full_name';
      const bodyKeys = campaign.settings.card_field_order?.filter(k => k !== primaryKey) || [];
      
      return (
        <GlassCard 
            key={lead.id} 
            onClick={() => setSelectedLead(lead)}
            className="p-3 md:p-4 cursor-pointer hover:border-primary-500/50 group active:scale-[0.98] transition-all bg-white dark:bg-zinc-900 shadow-sm" 
            intensity="low"
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 truncate pr-2">{getFieldValue(lead, primaryKey) || 'Untitled'}</h4>
                <span className="text-[10px] text-zinc-500 font-mono">{new Date(lead.created_at).toLocaleDateString()}</span>
            </div>
            
            <div className="space-y-1.5">
                {bodyKeys.map(key => {
                    const value = getFieldValue(lead, key);
                    if (value === '-' || value === '') return null;

                    if (key === 'email') return (
                        <div key={key} className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            <Mail className="w-3 h-3 text-zinc-400 dark:text-zinc-600 opacity-50" /> {value}
                        </div>
                    );
                    if (key === 'phone') return (
                        <div key={key} className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            <Phone className="w-3 h-3 text-zinc-400 dark:text-zinc-600 opacity-50" /> {value}
                        </div>
                    );
                    if (key === 'revenue') return (
                        <div key={key} className="mt-2 flex items-center justify-between border-t border-dashed border-zinc-200 dark:border-white/10 pt-2">
                             <div className="flex items-center gap-1 text-primary-600 dark:text-primary-400 text-sm font-semibold">
                                <DollarSign className="w-3 h-3" /> {value}
                             </div>
                        </div>
                    );
                    
                    return (
                        <div key={key} className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 truncate">
                             <Activity className="w-3 h-3 text-zinc-300 opacity-50" />
                             <span className="opacity-75">{getFieldName(key)}: {value}</span>
                        </div>
                    );
                })}
            </div>
        </GlassCard>
      );
  };

  const getStageColorStyle = (stageId: string) => {
    const stage = campaign.settings.pipeline_stages.find(s => s.id === stageId);
    if (!stage) return {};
    
    const colorMap: Record<string, string> = {
        'bg-blue-500': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        'bg-yellow-500': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
        'bg-purple-500': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        'bg-green-500': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
        'bg-rose-500': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        'bg-zinc-500': 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20',
    };
    return colorMap[stage.color] || colorMap['bg-zinc-500'];
  };

  // Determine Table Columns based on "Active" Settings (Show ALL active fields)
  const primaryKey = campaign.settings.card_primary_field || 'full_name';
  const listColumns = [
      ...campaign.settings.active_system_fields,
      ...campaign.settings.custom_fields.filter(f => f.is_active).map(f => f.key)
  ].filter(k => k !== primaryKey); // Exclude primary as it's the first col

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Controls */}
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900/50 p-3 rounded-2xl border border-zinc-200 dark:border-white/5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white px-2">Leads</h2>
        <div className="flex items-center gap-2">
             <div className="hidden md:flex gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-white/5">
                <button 
                    onClick={() => setViewMode('kanban')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white dark:bg-zinc-800 text-primary-500 shadow-sm' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>
                    <Kanban className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-800 text-primary-500 shadow-sm' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}>
                    <LayoutList className="w-4 h-4" />
                </button>
            </div>
            <GlassButton onClick={() => setIsAddModalOpen(true)} id="leads-add-btn">
                <Plus className="w-4 h-4" /> <span className="hidden md:inline">Add Lead</span>
            </GlassButton>
        </div>
      </div>

      {/* Views */}
      {viewMode === 'kanban' ? (
        <>
            {/* Desktop Kanban */}
            <div className="hidden md:flex gap-4 overflow-x-auto pb-4 h-full" id="leads-kanban">
                {campaign.settings.pipeline_stages.sort((a,b) => a.order - b.order).map(stage => (
                    <div key={stage.id} className="min-w-[320px] w-[320px] flex-shrink-0 flex flex-col gap-3">
                        <div className={`flex items-center justify-between px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-white/5 border-t-4 ${stage.color.replace('bg-', 'border-')}`}>
                            <span className="font-semibold text-sm text-zinc-700 dark:text-zinc-200">{stage.name}</span>
                            <Badge>{leads.filter(l => l.stage_id === stage.id).length}</Badge>
                        </div>
                        <div className="h-full space-y-3 p-1 overflow-y-auto max-h-[calc(100vh-250px)] scrollbar-thin">
                            {leads.filter(l => l.stage_id === stage.id).map(lead => renderKanbanCard(lead))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile Kanban */}
            <div className="md:hidden space-y-3 pb-24" id="leads-kanban-mobile">
                 {campaign.settings.pipeline_stages.sort((a,b) => a.order - b.order).map(stage => {
                     const stageLeads = leads.filter(l => l.stage_id === stage.id);
                     const isOpen = expandedStage === stage.id;
                     
                     return (
                        <div key={stage.id} className={`rounded-xl border transition-all duration-300 overflow-hidden ${isOpen ? 'bg-zinc-50/50 dark:bg-zinc-900/30 border-primary-500/30 shadow-md' : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-white/5'}`}>
                            <button 
                                onClick={() => toggleAccordion(stage.id)}
                                className="w-full flex items-center justify-between p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                                    <span className="font-semibold text-zinc-900 dark:text-white">{stage.name}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge>{stageLeads.length}</Badge>
                                    {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                                </div>
                            </button>
                            
                            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-4' : 'grid-rows-[0fr] opacity-0'}`}>
                                <div className="overflow-hidden px-4 space-y-3">
                                    {stageLeads.length === 0 && (
                                        <p className="text-center text-sm text-zinc-500 py-2">No leads in this stage.</p>
                                    )}
                                    {stageLeads.map(lead => renderKanbanCard(lead))}
                                </div>
                            </div>
                        </div>
                     )
                 })}
            </div>
        </>
      ) : (
        <GlassCard className="overflow-hidden p-0">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-white/5">
                        <tr>
                            <th className="px-6 py-4 font-semibold">{getFieldName(primaryKey)}</th>
                            {listColumns.map(f => (
                                <th key={f} className="px-6 py-4 font-semibold">{getFieldName(f)}</th>
                            ))}
                            <th className="px-6 py-4 font-semibold">Stage</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                        {leads.map(lead => (
                            <tr key={lead.id} className="hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4 font-bold text-zinc-900 dark:text-white">{getFieldValue(lead, primaryKey)}</td>
                                {listColumns.map(f => (
                                    <td key={f} className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{getFieldValue(lead, f)}</td>
                                ))}
                                <td className="px-6 py-4">
                                    <Badge color="primary">
                                        {campaign.settings.pipeline_stages.find(s => s.id === lead.stage_id)?.name}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => setSelectedLead(lead)} className="text-zinc-400 hover:text-primary-500">
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </GlassCard>
      )}

      {/* ADD LEAD MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Lead">
        <form onSubmit={handleAddLead} className="space-y-6">
            {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 dark:text-rose-400 text-xs font-medium">
                    {error}
                </div>
            )}
            
            {/* 1. Identity */}
            <div className="space-y-3">
                 <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3 h-3" /> Identity
                 </h4>
                 {/* Always show active fields grouped by purpose */}
                 {campaign.settings.active_system_fields.filter(k => ['full_name', 'title'].includes(k)).map(key => (
                     renderFormInput(key, SYSTEM_FIELDS.find(f => f.key === key)?.name || key, 'text', formData[key], (val) => setFormData({...formData, [key]: val}))
                 ))}
            </div>

             {/* 2. Contact */}
             <div className="space-y-3">
                 <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Contact Info
                 </h4>
                 {campaign.settings.active_system_fields.filter(k => ['email', 'phone', 'source'].includes(k)).map(key => (
                     renderFormInput(key, SYSTEM_FIELDS.find(f => f.key === key)?.name || key, SYSTEM_FIELDS.find(f => f.key === key)?.type || 'text', formData[key], (val) => setFormData({...formData, [key]: val}))
                 ))}
            </div>

            {/* 3. Deal Info */}
            <div className="space-y-3">
                 <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-3 h-3" /> Deal Value
                 </h4>
                 {campaign.settings.active_system_fields.filter(k => ['revenue', 'due_date'].includes(k)).map(key => (
                     renderFormInput(key, SYSTEM_FIELDS.find(f => f.key === key)?.name || key, SYSTEM_FIELDS.find(f => f.key === key)?.type || 'text', formData[key], (val) => setFormData({...formData, [key]: val}))
                 ))}
            </div>

            {/* 4. Custom Fields */}
            {campaign.settings.custom_fields.some(f => f.is_active) && (
                <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-white/10">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Additional Data</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {campaign.settings.custom_fields.filter(f => f.is_active).map(field => (
                            renderFormInput(field.key, field.name, field.type, formData[field.key], (val) => setFormData({...formData, [field.key]: val}))
                        ))}
                    </div>
                </div>
            )}

            <GlassButton type="submit" className="w-full justify-center mt-6">Create Lead</GlassButton>
        </form>
      </Modal>

      {/* LEAD DETAILS SHEET */}
      <Sheet 
        isOpen={!!selectedLead} 
        onClose={() => setSelectedLead(null)} 
        title="Edit Lead"
        width="max-w-2xl"
        footer={
            <div className="flex justify-between w-full">
                <button onClick={handleDeleteLead} className="flex items-center gap-2 text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors text-sm font-medium">
                    <Trash2 className="w-4 h-4" /> Delete Lead
                </button>
                <GlassButton onClick={handleUpdateLead}>
                    <Save className="w-4 h-4" /> Save Changes
                </GlassButton>
            </div>
        }
      >
        {selectedLead && (
            <div className="space-y-8 pb-10">
                {/* 1. Header Metadata */}
                <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/5">
                     <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>Created: {new Date(selectedLead.created_at).toLocaleDateString()}</span>
                     </div>
                     <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                        <Activity className="w-3 h-3" />
                        <span>Updated: {new Date(selectedLead.updated_at).toLocaleDateString()}</span>
                     </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                    {/* Column 1 */}
                    <div className="space-y-6">
                         {/* Stage Selector with Dynamic Color */}
                         <div className="space-y-2">
                             <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ml-1">Current Stage</label>
                             <div className={`p-1 rounded-xl border transition-colors ${getStageColorStyle(selectedLead.stage_id)}`}>
                                 <select 
                                    value={selectedLead.stage_id}
                                    onChange={(e) => setSelectedLead({...selectedLead, stage_id: e.target.value})}
                                    className="w-full bg-transparent font-semibold text-sm py-2 px-2 focus:outline-none cursor-pointer"
                                 >
                                     {campaign.settings.pipeline_stages.sort((a,b) => a.order - b.order).map(stage => (
                                         <option key={stage.id} value={stage.id} className="text-zinc-900 bg-white dark:text-white dark:bg-zinc-900">{stage.name}</option>
                                     ))}
                                 </select>
                             </div>
                         </div>

                         <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-white/10 pb-2">
                                <User className="w-4 h-4 text-primary-500" /> Identity
                            </h4>
                            {campaign.settings.active_system_fields.filter(k => ['full_name', 'title'].includes(k)).map(fieldKey => {
                                const def = SYSTEM_FIELDS.find(f => f.key === fieldKey);
                                return def ? renderFormInput(fieldKey, def.name, def.type, selectedLead.data[fieldKey], (val) => setSelectedLead({...selectedLead, data: { ...selectedLead.data, [fieldKey]: val }})) : null;
                            })}
                         </div>
                         <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-white/10 pb-2">
                                <Globe className="w-4 h-4 text-blue-500" /> Contact
                            </h4>
                             {campaign.settings.active_system_fields.filter(k => ['email', 'phone', 'source'].includes(k)).map(fieldKey => {
                                const def = SYSTEM_FIELDS.find(f => f.key === fieldKey);
                                return def ? renderFormInput(fieldKey, def.name, def.type, selectedLead.data[fieldKey], (val) => setSelectedLead({...selectedLead, data: { ...selectedLead.data, [fieldKey]: val }})) : null;
                            })}
                         </div>
                    </div>

                    {/* Column 2 */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-white/10 pb-2">
                                <DollarSign className="w-4 h-4 text-green-500" /> Deal Value
                            </h4>
                             {campaign.settings.active_system_fields.filter(k => ['revenue', 'due_date'].includes(k)).map(fieldKey => {
                                const def = SYSTEM_FIELDS.find(f => f.key === fieldKey);
                                return def ? renderFormInput(fieldKey, def.name, def.type, selectedLead.data[fieldKey], (val) => setSelectedLead({...selectedLead, data: { ...selectedLead.data, [fieldKey]: val }})) : null;
                            })}
                         </div>

                        {campaign.settings.custom_fields.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="flex items-center gap-2 text-sm font-bold text-zinc-900 dark:text-white border-b border-zinc-200 dark:border-white/10 pb-2">
                                    <Briefcase className="w-4 h-4 text-purple-500" /> Custom Data
                                </h4>
                                <div className="space-y-3">
                                    {campaign.settings.custom_fields.filter(f => f.is_active).map(field => (
                                        renderFormInput(field.key, field.name, field.type, selectedLead.data[field.key], (val) => setSelectedLead({...selectedLead, data: { ...selectedLead.data, [field.key]: val }}))
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider ml-1">Internal Notes</label>
                    <textarea 
                        className="w-full h-32 bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl p-4 text-sm text-zinc-900 dark:text-zinc-300 focus:outline-none focus:border-primary-500/50 resize-none shadow-sm"
                        value={selectedLead.notes || ''}
                        onChange={(e) => setSelectedLead({...selectedLead, notes: e.target.value})}
                    />
                </div>
            </div>
        )}
      </Sheet>
    </div>
  );
};