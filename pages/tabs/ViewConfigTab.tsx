



import React, { useState } from 'react';
import { Campaign, SYSTEM_FIELDS } from '../../types';
import { updateCampaignSettings } from '../../services/dataService';
import { Eye, Heading, MousePointer2, GripVertical, XCircle, Plus, Database, DollarSign, Lock } from 'lucide-react';
import { InfoTooltip } from '../../components/ui/Tooltip';

interface ViewConfigTabProps {
  campaign: Campaign;
  onUpdate: (newCampaign: Campaign) => void;
}

export const ViewConfigTab: React.FC<ViewConfigTabProps> = ({ campaign, onUpdate }) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  // --- Helpers ---
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

  // --- Handlers: Visibility Matrix ---

  const toggleAdminOnly = async (e: React.ChangeEvent<HTMLInputElement>, key: string, isCurrentlyAdminOnly: boolean) => {
      e.stopPropagation();
      let newSettings = { ...campaign.settings };
      const field = getFieldDetail(key);
      if (!field) return;

      // Logic: 
      // If currently Admin Only (Internal) -> Uncheck -> Make Public
      // If currently Public -> Check -> Make Internal (Admin Only)
      const shouldBePublic = isCurrentlyAdminOnly; // If it WAS admin only, and we toggle, it becomes public

      if (field.isSystem) {
          const publicFields = newSettings.public_system_fields || [];
          if (!shouldBePublic) {
              // Make Internal: Remove from public list
              newSettings.public_system_fields = publicFields.filter(k => k !== key);
          } else {
              // Make Public: Add to public list
              if (!publicFields.includes(key)) {
                  newSettings.public_system_fields = [...publicFields, key];
              }
          }
      } else {
          // Custom
          const customIdx = newSettings.custom_fields.findIndex(f => f.key === key);
          if (customIdx !== -1) {
              const newCustom = [...newSettings.custom_fields];
              newCustom[customIdx] = { 
                  ...newCustom[customIdx], 
                  visibility: shouldBePublic ? 'public' : 'internal' 
              };
              newSettings.custom_fields = newCustom;
          }
      }
      const updated = await updateCampaignSettings(campaign.id, newSettings);
      onUpdate(updated);
  };

  // Returns TRUE if the field is NOT visible to the client (Internal/Admin Only)
  const isAdminOnly = (key: string) => {
      const field = getFieldDetail(key);
      if (!field) return true; // Default to safe/internal if unknown
      if (field.isSystem) return !(campaign.settings.public_system_fields || []).includes(key);
      const custom = campaign.settings.custom_fields.find(f => f.key === key);
      return custom ? custom.visibility !== 'public' : true;
  };


  // --- Handlers: Kanban Designer ---

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

  // Drag Handlers
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


  // --- Derived Layout State ---
  const cardOrder = campaign.settings.card_field_order || [];
  const primaryField = campaign.settings.card_primary_field || 'full_name';
  const visibleCardFields = cardOrder.filter(key => allActiveKeys.includes(key));
  const hiddenCardFields = allActiveKeys.filter(key => !cardOrder.includes(key) && key !== primaryField);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-200 dark:border-white/5 pb-4">
        <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Eye className="w-6 h-6 text-primary-500" />
                View Layout
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Configure Privacy and Kanban Layout. All active fields are shown in the Admin Table.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* COLUMN 1: VISIBILITY MATRIX */}
          <div className="space-y-6">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-white">Client Privacy</h3>
                      <InfoTooltip content="Fields marked 'Admin Only' will be hidden from clients in the Portal." />
                  </div>
                  <p className="text-xs text-zinc-500">Check "Admin Only" to hide fields from the client portal.</p>
              </div>

              <div className="space-y-1">
                  {/* Headers */}
                   <div className="flex items-center justify-between px-3 pb-2 border-b border-zinc-100 dark:border-white/5">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Field Name</span>
                        <div className="flex gap-4 justify-end w-24">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider text-center flex items-center justify-center gap-1"><Lock className="w-3 h-3"/> Admin Only</span>
                        </div>
                   </div>
                   
                   {/* Rows */}
                   {allActiveKeys.map(key => {
                       const details = getFieldDetail(key);
                       if (!details) return null;
                       const adminOnlyChecked = isAdminOnly(key);

                       return (
                           <div key={key} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg">
                               <div className="flex items-center gap-3">
                                   <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${key === 'revenue' ? 'bg-amber-500/10 text-amber-500' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                                       {details.type === 'currency' ? <DollarSign className="w-4 h-4"/> : <Database className="w-4 h-4"/>}
                                   </div>
                                   <div>
                                       <div className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{details.name}</div>
                                       <div className="text-[10px] text-zinc-400 font-mono">{key}</div>
                                   </div>
                               </div>
                               <div className="flex gap-4 justify-end w-24">
                                   <div className="flex justify-center">
                                       <input 
                                            type="checkbox" 
                                            checked={adminOnlyChecked} 
                                            onChange={(e) => toggleAdminOnly(e, key, adminOnlyChecked)}
                                            className="w-5 h-5 rounded border-zinc-300 dark:border-white/20 text-rose-500 focus:ring-rose-500 cursor-pointer accent-rose-500"
                                        />
                                   </div>
                               </div>
                           </div>
                       );
                   })}
              </div>
          </div>

          {/* COLUMN 2: KANBAN DESIGNER */}
          <div className="space-y-6">
              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
                  <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-zinc-900 dark:text-white">Kanban Card Layout</h3>
                      <InfoTooltip content="Customize what information appears on the cards in the Kanban board. Drag to reorder." />
                  </div>
                  <p className="text-xs text-zinc-500">Drag fields to reorder. Set the headline.</p>
              </div>

               {/* Primary Field Selection */}
                <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl">
                     <div className="flex items-center gap-2 mb-2">
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
                </div>

                {/* Draggable Area */}
                <div className="space-y-2">
                     <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1"><MousePointer2 className="w-3 h-3"/> Body Fields</span>
                     </div>
                     
                     <div className="bg-zinc-100/50 dark:bg-zinc-900/30 rounded-xl p-2 min-h-[100px] border border-zinc-200/50 dark:border-white/5 space-y-2">
                        {visibleCardFields.filter(k => k !== primaryField).map((key, index) => {
                            const details = getFieldDetail(key);
                            if (!details) return null;
                            const isDragging = draggedItem === key;

                            return (
                                <div 
                                    key={key} 
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, key)}
                                    onDragOver={(e) => handleDragOver(e)}
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
                                    >
                                        <XCircle className="w-4 h-4" />
                                    </button>
                                </div>
                            )
                        })}
                     </div>

                     {/* Hidden Fields */}
                     <div className="pt-4">
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-1 mb-2">Available to Add</div>
                        <div className="flex flex-wrap gap-2">
                            {hiddenCardFields.map(key => {
                                const details = getFieldDetail(key);
                                if (!details) return null;
                                return (
                                    <button 
                                        key={key}
                                        onClick={() => toggleCardVisibility(key, true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-primary-500 hover:border-primary-500/30 transition-all"
                                    >
                                        <Plus className="w-3 h-3" /> {details.name}
                                    </button>
                                )
                            })}
                        </div>
                     </div>
                </div>

          </div>
      </div>
    </div>
  );
};