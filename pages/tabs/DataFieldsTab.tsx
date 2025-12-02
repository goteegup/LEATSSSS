
import React, { useState } from 'react';
import { Campaign, SYSTEM_FIELDS, CustomFieldDefinition, FieldType } from '../../types';
import { updateCampaignSettings } from '../../services/dataService';
import { GlassButton, Toggle, GlassInput, GlassCard } from '../../components/ui/Glass';
import { Modal } from '../../components/ui/Modal';
import { Database, Plus, Trash2, Type, GripVertical, Heading, MousePointer2, XCircle, LayoutTemplate, DollarSign, Mail, Phone, Activity } from 'lucide-react';

interface DataFieldsTabProps {
  campaign: Campaign;
  onUpdate: (newCampaign: Campaign) => void;
}

export const DataFieldsTab: React.FC<DataFieldsTabProps> = ({ campaign, onUpdate }) => {
  // Field State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newField, setNewField] = useState<{name: string, key: string, type: FieldType, isActive: boolean}>({
      name: '', key: '', type: 'text', isActive: true,
  });

  // Card Designer State
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // --- Field Handlers ---

  const toggleActive = async (idx: number, isSystem: boolean, key: string) => {
      let newSettings = { ...campaign.settings };
      if (isSystem) {
          if (newSettings.active_system_fields.includes(key)) {
              newSettings.active_system_fields = newSettings.active_system_fields.filter(k => k !== key);
          } else {
              newSettings.active_system_fields.push(key);
          }
      } else {
          newSettings.custom_fields[idx].is_active = !newSettings.custom_fields[idx].is_active;
      }
      const updated = await updateCampaignSettings(campaign.id, newSettings);
      onUpdate(updated);
  };

  const handleAddField = async (e: React.FormEvent) => {
      e.preventDefault();
      const fieldDef: CustomFieldDefinition = { 
          ...newField, 
          required: false, 
          is_active: newField.isActive, 
          in_view: false, 
          visibility: 'internal',
          aliases: []
      };
      const newSettings = { ...campaign.settings, custom_fields: [...campaign.settings.custom_fields, fieldDef] };
      const updated = await updateCampaignSettings(campaign.id, newSettings);
      onUpdate(updated);
      setIsModalOpen(false);
  };

  // --- Card Designer Handlers ---

  const handlePrimaryFieldChange = async (key: string) => {
      const newSettings = { ...campaign.settings, card_primary_field: key };
      const updated = await updateCampaignSettings(campaign.id, newSettings);
      onUpdate(updated);
  };

  const toggleCardVisibility = async (key: string, shouldShow: boolean) => {
    let newOrder = [...(campaign.settings.card_field_order || [])];
    if (shouldShow) {
        if (!newOrder.includes(key)) newOrder.push(key);
    } else {
        newOrder = newOrder.filter(k => k !== key);
    }
    const newSettings = { ...campaign.settings, card_field_order: newOrder };
    const updated = await updateCampaignSettings(campaign.id, newSettings);
    onUpdate(updated);
  };

  const handleDragStart = (e: React.DragEvent, key: string) => {
      setDraggedItem(key);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', key);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (!draggedItem) return;
      const currentOrder = [...(campaign.settings.card_field_order || [])];
      const draggedIndex = currentOrder.indexOf(draggedItem);
      if (draggedIndex === -1) return;
      currentOrder.splice(draggedIndex, 1);
      currentOrder.splice(dropIndex, 0, draggedItem);
      const newSettings = { ...campaign.settings, card_field_order: currentOrder };
      const updated = await updateCampaignSettings(campaign.id, newSettings);
      onUpdate(updated);
      setDraggedItem(null);
  };

  // --- Helpers & Derived State ---

  const getFieldDetail = (key: string) => {
      const sys = SYSTEM_FIELDS.find(f => f.key === key);
      if (sys) return { ...sys, isSystem: true };
      const custom = campaign.settings.custom_fields.find(f => f.key === key);
      return custom ? { ...custom, isSystem: false } : null;
  };

  const allActiveKeys = [
      ...campaign.settings.active_system_fields,
      ...campaign.settings.custom_fields.filter(f => f.is_active).map(f => f.key)
  ];

  const cardOrder = campaign.settings.card_field_order || [];
  const primaryField = campaign.settings.card_primary_field || 'full_name';
  const visibleCardFields = cardOrder.filter(key => allActiveKeys.includes(key));
  const hiddenCardFields = allActiveKeys.filter(key => !cardOrder.includes(key) && key !== primaryField);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        
        {/* COLUMN 1: FIELD DEFINITION */}
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Fields</h2>
                    <p className="text-sm text-zinc-500">Define what data you collect.</p>
                </div>
                <GlassButton onClick={() => setIsModalOpen(true)} className="px-3 h-9 text-xs"><Plus className="w-3 h-3 mr-1"/> Create</GlassButton>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2">System Fields</div>
                {SYSTEM_FIELDS.map(f => (
                    <div key={f.key} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg"><Database className="w-4 h-4 text-zinc-500"/></div>
                            <div><div className="font-medium text-zinc-900 dark:text-white text-sm">{f.name}</div></div>
                        </div>
                        <Toggle checked={campaign.settings.active_system_fields.includes(f.key)} onChange={() => toggleActive(0, true, f.key)} />
                    </div>
                ))}

                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2 mt-4">Custom Fields</div>
                {campaign.settings.custom_fields.map((f, i) => (
                    <div key={f.key} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-500/10 rounded-lg"><Type className="w-4 h-4 text-primary-500"/></div>
                            <div>
                                <div className="font-medium text-zinc-900 dark:text-white text-sm">{f.name}</div>
                                <div className="text-[10px] text-zinc-500">{f.type}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Toggle checked={f.is_active} onChange={() => toggleActive(i, false, f.key)} />
                            <button className="text-zinc-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* COLUMN 2: CARD DESIGNER */}
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <LayoutTemplate className="w-5 h-5 text-purple-500" /> Card Designer
                </h2>
                <p className="text-sm text-zinc-500">Drag fields to customize the Kanban card.</p>
            </div>

            <div className="bg-zinc-50 dark:bg-black/20 rounded-2xl border border-zinc-200 dark:border-white/5 p-6 space-y-6">
                
                {/* 1. Live Preview */}
                <div className="flex justify-center mb-6">
                    <div className="w-full max-w-[280px] bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-white/5 p-4 relative">
                        <div className="absolute top-2 right-2 p-1 opacity-20"><Database className="w-4 h-4" /></div>
                        
                        {/* Header */}
                        <div className="mb-3">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Headline</label>
                            <div className="font-bold text-lg text-zinc-900 dark:text-white">{getFieldDetail(primaryField)?.name || 'Title'}</div>
                        </div>

                        {/* Body Preview */}
                        <div className="space-y-2">
                            {visibleCardFields.filter(k => k !== primaryField).map(key => {
                                const d = getFieldDetail(key);
                                if (!d) return null;
                                if (key === 'revenue') return <div key={key} className="flex gap-2 items-center text-sm font-bold text-green-500 border-t border-dashed border-zinc-200 dark:border-white/10 pt-2 mt-2"><DollarSign className="w-3 h-3"/> $5,000</div>;
                                return (
                                    <div key={key} className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                        <Activity className="w-3 h-3 opacity-30" />
                                        <span>{d.name}: ...</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* 2. Controls */}
                <div className="space-y-4">
                    {/* Primary Selector */}
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-white/10">
                        <div className="flex items-center gap-2 mb-1">
                            <Heading className="w-3 h-3 text-primary-500" />
                            <label className="text-xs font-bold text-zinc-500">Headline Field</label>
                        </div>
                        <select 
                            value={primaryField}
                            onChange={(e) => handlePrimaryFieldChange(e.target.value)}
                            className="w-full bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
                        >
                            {allActiveKeys.map(key => <option key={key} value={key}>{getFieldDetail(key)?.name || key}</option>)}
                        </select>
                    </div>

                    {/* Drag List */}
                    <div className="space-y-2">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1"><MousePointer2 className="w-3 h-3"/> Visible Body Fields</div>
                        <div className="space-y-2">
                            {visibleCardFields.filter(k => k !== primaryField).map((key, index) => {
                                const details = getFieldDetail(key);
                                if (!details) return null;
                                return (
                                    <div 
                                        key={key}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, key)}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => handleDrop(e, index)}
                                        className="flex items-center justify-between p-2 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-white/10 cursor-move"
                                    >
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="w-3 h-3 text-zinc-400" />
                                            <span className="text-xs font-medium">{details.name}</span>
                                        </div>
                                        <button onClick={() => toggleCardVisibility(key, false)} className="text-zinc-400 hover:text-rose-500"><XCircle className="w-3 h-3"/></button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Hidden Fields */}
                    <div className="pt-2">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Available to Add</div>
                        <div className="flex flex-wrap gap-2">
                            {hiddenCardFields.map(key => {
                                const d = getFieldDetail(key);
                                if (!d) return null;
                                return (
                                    <button 
                                        key={key} 
                                        onClick={() => toggleCardVisibility(key, true)}
                                        className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] font-medium border border-zinc-200 dark:border-white/10 hover:border-primary-500 transition-colors"
                                    >
                                        + {d.name}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Field">
            <form onSubmit={handleAddField} className="space-y-4">
                <GlassInput label="Name" value={newField.name} onChange={e => {
                    setNewField({...newField, name: e.target.value, key: e.target.value.toLowerCase().replace(/\s+/g, '_')});
                }} />
                <GlassButton type="submit" className="w-full justify-center">Create</GlassButton>
            </form>
        </Modal>
    </div>
  );
};