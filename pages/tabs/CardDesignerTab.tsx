

import React, { useState } from 'react';
import { Campaign, SYSTEM_FIELDS } from '../../types';
import { updateCampaignSettings } from '../../services/dataService';
import { GlassButton } from '../../components/ui/Glass';
import { Modal } from '../../components/ui/Modal';
import { GripVertical, Plus, XCircle, Database, DollarSign, Mail, Phone, Activity, LayoutTemplate, MousePointer2, Heading, Trash2, AlertTriangle } from 'lucide-react';

interface CardDesignerTabProps {
  campaign: Campaign;
  onUpdate: (newCampaign: Campaign) => void;
}

export const CardDesignerTab: React.FC<CardDesignerTabProps> = ({ campaign, onUpdate }) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{key: string, name: string} | null>(null);

  // --- Handlers ---

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

    const newSettings = { 
        ...campaign.settings, 
        card_field_order: newOrder
    };
    const updated = await updateCampaignSettings(campaign.id, newSettings);
    onUpdate(updated);
  };

  // HTML5 Drag Handlers
  const handleDragStart = (e: React.DragEvent, key: string) => {
      setDraggedItem(key);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', key);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (!draggedItem) return;
      
      const currentOrder = [...(campaign.settings.card_field_order || [])];
      const draggedIndex = currentOrder.indexOf(draggedItem);
      
      if (draggedIndex === -1) return;

      // Remove dragged item
      currentOrder.splice(draggedIndex, 1);
      // Insert at new position
      currentOrder.splice(dropIndex, 0, draggedItem);

      const newSettings = { ...campaign.settings, card_field_order: currentOrder };
      const updated = await updateCampaignSettings(campaign.id, newSettings);
      onUpdate(updated);
      setDraggedItem(null);
  };

  const confirmDeleteField = async () => {
    if (!deleteConfirmation) return;
    
    const keyToDelete = deleteConfirmation.key;
    
    // 1. Remove from Custom Fields
    const newCustomFields = campaign.settings.custom_fields.filter(f => f.key !== keyToDelete);
    
    // 2. Remove from Card Order
    const newCardOrder = (campaign.settings.card_field_order || []).filter(k => k !== keyToDelete);
    
    // 3. Remove from Active/View System lists (if it happened to be there, though unlikely for custom)
    const newActiveSys = campaign.settings.active_system_fields.filter(k => k !== keyToDelete);
    const newPublicSys = campaign.settings.public_system_fields.filter(k => k !== keyToDelete);

    const newSettings = {
        ...campaign.settings,
        custom_fields: newCustomFields,
        card_field_order: newCardOrder,
        active_system_fields: newActiveSys,
        public_system_fields: newPublicSys
    };

    const updated = await updateCampaignSettings(campaign.id, newSettings);
    onUpdate(updated);
    setDeleteConfirmation(null);
  };

  // Helper to resolve field details
  const getFieldDetail = (key: string) => {
      const sys = SYSTEM_FIELDS.find(f => f.key === key);
      if (sys) return { ...sys, isSystem: true };
      const custom = campaign.settings.custom_fields.find(f => f.key === key);
      return custom ? { ...custom, isSystem: false } : null;
  };

  // --- Derived Lists ---
  const cardOrder = campaign.settings.card_field_order || [];
  const primaryField = campaign.settings.card_primary_field || 'full_name';
  
  // All ACTIVE keys (Enabled in Schema)
  const allActiveKeys = [
      ...campaign.settings.active_system_fields,
      ...campaign.settings.custom_fields.filter(f => f.is_active).map(f => f.key)
  ];

  // Shown on Card (Excluding primary, as it's the header)
  const visibleFields = cardOrder.filter(key => allActiveKeys.includes(key));
  
  // Hidden fields are active fields that are NOT in order AND NOT primary
  const hiddenFields = allActiveKeys.filter(key => !cardOrder.includes(key) && key !== primaryField);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-200 dark:border-white/5 pb-4">
        <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <LayoutTemplate className="w-6 h-6 text-primary-500" />
                Card Designer
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Configure the look and feel of your Kanban cards.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 1. The Sorter */}
        <div className="space-y-6">
            
            {/* Primary Field Selection */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-white/10 shadow-sm">
                 <div className="flex items-center gap-2 mb-3">
                    <Heading className="w-4 h-4 text-primary-500" />
                    <label className="text-sm font-bold text-zinc-900 dark:text-white">Card Title (Headline)</label>
                 </div>
                 <select 
                    value={primaryField}
                    onChange={(e) => handlePrimaryFieldChange(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:border-primary-500/50"
                 >
                     {allActiveKeys.map(key => (
                         <option key={key} value={key}>{getFieldDetail(key)?.name || key}</option>
                     ))}
                 </select>
                 <p className="text-xs text-zinc-500 mt-2">This field appears bold at the top of every card.</p>
            </div>

            {/* Draggable Area */}
            <div className="space-y-2">
                 <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-t-xl border border-zinc-200 dark:border-white/5 border-b-0">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <MousePointer2 className="w-4 h-4 text-zinc-400" /> 
                        Body Fields
                    </h3>
                </div>
                
                <div className="bg-zinc-100/50 dark:bg-zinc-900/30 rounded-b-xl p-2 min-h-[100px] border border-zinc-200/50 dark:border-white/5 space-y-2">
                    {visibleFields.map((key, index) => {
                        const details = getFieldDetail(key);
                        if (!details || key === primaryField) return null; // Don't show primary in body list
                        const isDragging = draggedItem === key;

                        return (
                            <div 
                                key={key} 
                                draggable
                                onDragStart={(e) => handleDragStart(e, key)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                className={`
                                    flex items-center justify-between p-3 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-zinc-200 dark:border-white/5 group select-none cursor-move transition-all
                                    ${isDragging ? 'opacity-50 scale-95 border-primary-500 border-dashed' : 'hover:border-zinc-300 dark:hover:border-white/20'}
                                `}
                            >
                                <div className="flex items-center gap-3 pointer-events-none">
                                    <div className="text-zinc-300"><GripVertical className="w-4 h-4" /></div>
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{details.name}</span>
                                </div>
                                <button 
                                    onClick={() => toggleCardVisibility(key, false)} 
                                    className="p-1 text-zinc-400 hover:text-rose-500 transition-colors pointer-events-auto"
                                    title="Remove from card"
                                >
                                    <XCircle className="w-4 h-4" />
                                </button>
                            </div>
                        )
                    })}
                    {visibleFields.filter(k => k !== primaryField).length === 0 && (
                        <div className="text-xs text-center text-zinc-400 py-6 italic border border-dashed border-zinc-200 dark:border-white/10 rounded-lg">
                            Card body is empty. Drag or click items from below to add.
                        </div>
                    )}
                </div>
            </div>

            {/* HIDDEN / AVAILABLE LIST */}
            <div className="space-y-2">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1">Available Fields (Hidden)</div>
                <div className="flex flex-wrap gap-2">
                        {hiddenFields.map(key => {
                        const details = getFieldDetail(key);
                        if (!details) return null;
                        return (
                            <div key={key} className="group flex items-center gap-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg pr-1 hover:border-zinc-300 dark:hover:border-white/20 transition-all">
                                <button 
                                    onClick={() => toggleCardVisibility(key, true)}
                                    className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-primary-500"
                                    title="Add to Card"
                                >
                                    <Plus className="w-3 h-3" /> {details.name}
                                </button>
                                
                                {/* Allow deleting CUSTOM fields entirely from here */}
                                {!details.isSystem && (
                                    <button 
                                        onClick={() => setDeleteConfirmation({ key, name: details.name })}
                                        className="p-1 text-zinc-300 hover:text-rose-500 border-l border-zinc-200 dark:border-white/5"
                                        title="Delete Field Permanently"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        )
                        })}
                        {hiddenFields.length === 0 && (
                        <div className="text-xs text-zinc-400 italic pl-1">All active fields are currently shown on the card.</div>
                    )}
                </div>
            </div>
        </div>

        {/* 2. The Live Preview */}
        <div className="flex flex-col">
            <div className="bg-zinc-100 dark:bg-black/20 rounded-2xl border border-dashed border-zinc-300 dark:border-white/10 p-8 flex flex-col items-center justify-center min-h-[400px] sticky top-24">
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-4">Live Card Preview</div>
                
                {/* Mock Card */}
                <div className="w-full max-w-[280px] bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-white/5 p-4 relative overflow-hidden transition-all duration-300">
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                        <Database className="w-24 h-24" />
                    </div>

                    <div className="flex justify-between items-start mb-3 relative">
                        <div className="space-y-1 w-full">
                            {/* Primary Field */}
                            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-lg">
                                {getFieldDetail(primaryField)?.name || 'Title'}
                            </h4>
                            <div className="h-2 w-16 bg-zinc-200 dark:bg-zinc-800 rounded mt-1" />
                        </div>
                    </div>
                    
                    <div className="space-y-2 relative">
                        {visibleFields.filter(k => k !== primaryField).map(key => {
                            const details = getFieldDetail(key);
                            if (!details) return null;
                            
                            if (key === 'revenue') return (
                                <div key={key} className="mt-2 pt-2 border-t border-dashed border-zinc-200 dark:border-white/10 flex items-center gap-1 text-primary-600 dark:text-primary-400 font-bold text-sm">
                                    <DollarSign className="w-3 h-3" /> $5,000
                                </div>
                            );
                            if (key === 'email') return (
                                <div key={key} className="flex items-center gap-2 text-xs text-zinc-500"><Mail className="w-3 h-3 opacity-50"/> user@example.com</div>
                            );
                            if (key === 'phone') return (
                                <div key={key} className="flex items-center gap-2 text-xs text-zinc-500"><Phone className="w-3 h-3 opacity-50"/> +1 555 0000</div>
                            );

                            return (
                                <div key={key} className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                    <Activity className="w-3 h-3 opacity-30" />
                                    <span className="opacity-70">{details.name}: ...</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
      </div>

       {/* Delete Confirmation Modal */}
       <Modal isOpen={!!deleteConfirmation} onClose={() => setDeleteConfirmation(null)} title="Delete Field Permanently?">
        <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-600 dark:text-rose-200">
                    Are you sure you want to delete <span className="font-bold">{deleteConfirmation?.name}</span>? 
                    This will remove it from the database and all forms. This cannot be undone.
                </p>
            </div>
            <div className="flex gap-3 pt-2">
                <GlassButton variant="secondary" onClick={() => setDeleteConfirmation(null)} className="flex-1 justify-center">Cancel</GlassButton>
                <GlassButton variant="danger" onClick={confirmDeleteField} className="flex-1 justify-center">Delete Field</GlassButton>
            </div>
        </div>
      </Modal>

    </div>
  );
};
