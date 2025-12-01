import React, { useState, useEffect } from 'react';
import { Campaign, SYSTEM_FIELDS, FACEBOOK_PRESETS, CustomFieldDefinition, FieldType } from '../../types';
import { updateCampaignSettings } from '../../services/dataService';
import { GlassButton, Toggle, GlassInput } from '../../components/ui/Glass';
import { Modal } from '../../components/ui/Modal';
import { InfoTooltip } from '../../components/ui/Tooltip';
import { Database, Plus, Trash2, Facebook, AlertTriangle, DollarSign, Type, Calendar, Hash, Mail, Phone, List, FileSpreadsheet, Edit3, FormInput, Sparkles, Globe, DownloadCloud, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DataFieldsTabProps {
  campaign: Campaign;
  onUpdate: (newCampaign: Campaign) => void;
}

const PLATFORM_MAPPINGS = {
    'Facebook / Meta': ['full_name', 'email', 'phone_number', 'city', 'ad_id', 'form_id', 'campaign_name', 'platform', 'created_time'],
    'Google Ads': ['gclid', 'keyword', 'match_type', 'adgroup_id', 'campaign_id'],
    'TikTok': ['ad_id', 'ad_name', 'campaign_name', 'creative_name', 'form_id'],
    'LinkedIn': ['linkedinProfile', 'jobTitle', 'company', 'workEmail'],
};

interface SchemaRowProps {
  name: string;
  fieldKey: string;
  type: string;
  isActive: boolean;
  aliases?: string[];
  onToggleActive: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  loading?: boolean;
}

// Minimal Row for Schema Definition
const SchemaRow: React.FC<SchemaRowProps> = ({
  name,
  fieldKey,
  type,
  isActive,
  aliases,
  onToggleActive,
  onDelete,
  onEdit,
  loading = false,
}) => {
  const isRevenue = fieldKey === 'revenue';

  const getIcon = () => {
      if (isRevenue) return <DollarSign className="w-4 h-4 text-amber-500" />;
      if (type === 'date') return <Calendar className="w-4 h-4" />;
      if (type === 'number') return <Hash className="w-4 h-4" />;
      if (type === 'email') return <Mail className="w-4 h-4" />;
      if (type === 'tel') return <Phone className="w-4 h-4" />;
      if (type === 'select') return <List className="w-4 h-4" />;
      return <Type className="w-4 h-4" />;
  };

  return (
    <div className={`
        group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border transition-all duration-200 gap-3
        ${isActive 
            ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 shadow-sm' 
            : 'bg-zinc-50/50 dark:bg-white/5 border-transparent opacity-70 grayscale'
        }
    `}>
      <div className="flex items-center gap-3 flex-1">
        <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0
            ${isRevenue 
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                : isActive 
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400' 
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
            }
        `}>
            {getIcon()}
        </div>
        <div className="flex flex-col min-w-0">
            <span className={`text-sm font-medium truncate ${isActive ? 'text-zinc-900 dark:text-zinc-200' : 'text-zinc-500'}`}>{name}</span>
            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                <span>{fieldKey}</span>
                {aliases && aliases.length > 0 && (
                    <span className="hidden sm:inline-flex items-center gap-1 bg-zinc-100 dark:bg-white/10 px-1.5 rounded text-zinc-500 dark:text-zinc-400">
                        <FileSpreadsheet className="w-3 h-3" /> {aliases.length} mapped
                    </span>
                )}
            </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 min-w-[140px]">
        {/* Toggle: Collect (Form) */}
        <div className="flex items-center gap-3">
             <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider hidden sm:block">Collect</span>
             <Toggle checked={isActive} onChange={onToggleActive} disabled={loading} />
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 pl-4 border-l border-zinc-100 dark:border-white/5 h-8">
            {onEdit && isActive && (
                <button 
                    onClick={onEdit}
                    disabled={loading}
                    className="p-2 rounded-lg text-zinc-400 hover:text-primary-500 hover:bg-primary-500/10 transition-colors"
                    title="Edit Aliases / Mapping"
                >
                    <Edit3 className="w-4 h-4" />
                </button>
            )}
            
            {onDelete && (
                <button 
                    onClick={onDelete}
                    disabled={loading}
                    className={`p-2 rounded-lg transition-colors ${isActive ? 'text-zinc-300 hover:text-rose-500 hover:bg-rose-500/10' : 'text-transparent group-hover:text-zinc-400 group-hover:hover:text-rose-500'}`}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export const DataFieldsTab: React.FC<DataFieldsTabProps> = ({ campaign, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{index: number, name: string} | null>(null);
  const [editMappingField, setEditMappingField] = useState<{key: string, name: string, aliases: string[], isSystem: boolean} | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('Facebook / Meta');
  
  const [newField, setNewField] = useState<{name: string, key: string, type: FieldType, isActive: boolean}>({
      name: '',
      key: '',
      type: 'text',
      isActive: true,
  });

  // --- Handlers ---

  const toggleSystemFieldActive = async (fieldKey: string, currentActive: boolean) => {
    if (loading) return;
    setLoading(true);
    let newActive = [...campaign.settings.active_system_fields];
    
    if (currentActive) {
      newActive = newActive.filter(k => k !== fieldKey);
    } else {
      newActive.push(fieldKey);
    }
    
    const newSettings = { ...campaign.settings, active_system_fields: newActive };
    const updated = await updateCampaignSettings(campaign.id, newSettings);
    onUpdate(updated);
    setLoading(false);
  };

  const toggleCustomFieldActive = async (index: number) => {
    if (loading) return;
    setLoading(true);
    const newCustom = [...campaign.settings.custom_fields];
    newCustom[index] = { ...newCustom[index], is_active: !newCustom[index].is_active };
    const newSettings = { ...campaign.settings, custom_fields: newCustom };
    const updated = await updateCampaignSettings(campaign.id, newSettings);
    onUpdate(updated);
    setLoading(false);
  };

  const handleAddField = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newField.name || !newField.key) return;
      setLoading(true);
      const fieldDef: CustomFieldDefinition = { 
          ...newField, 
          required: false, 
          is_active: newField.isActive, 
          in_view: false, // Default View Configs to false, user sets in "Ansicht" tab
          visibility: 'internal',
          aliases: []
      };
      
      const newSettings = { 
          ...campaign.settings, 
          custom_fields: [...campaign.settings.custom_fields, fieldDef],
      };
      const updated = await updateCampaignSettings(campaign.id, newSettings);
      onUpdate(updated);
      setLoading(false);
      setIsModalOpen(false);
      setNewField({ name: '', key: '', type: 'text', isActive: true });
  };

  const confirmDelete = async () => {
      if (deleteConfirmation === null) return;
      setLoading(true);
      const newCustom = [...campaign.settings.custom_fields];
      newCustom.splice(deleteConfirmation.index, 1);
      
      const newSettings = { ...campaign.settings, custom_fields: newCustom };
      const updated = await updateCampaignSettings(campaign.id, newSettings);
      onUpdate(updated);
      setLoading(false);
      setDeleteConfirmation(null);
  };

  const handleSaveMapping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMappingField) return;
    setLoading(true);

    let newSettings = { ...campaign.settings };
    
    if (!editMappingField.isSystem) {
        const newCustom = [...campaign.settings.custom_fields];
        const idx = newCustom.findIndex(f => f.key === editMappingField.key);
        if (idx !== -1) {
            newCustom[idx] = { ...newCustom[idx], aliases: editMappingField.aliases };
            newSettings.custom_fields = newCustom;
        }
    }
    
    const updated = await updateCampaignSettings(campaign.id, newSettings);
    onUpdate(updated);
    setLoading(false);
    setEditMappingField(null);
  };
  
  const addAlias = (alias: string) => {
      if (!editMappingField) return;
      if (!editMappingField.aliases.includes(alias)) {
          setEditMappingField({
              ...editMappingField,
              aliases: [...editMappingField.aliases, alias]
          });
      }
  };
  
  const removeAlias = (alias: string) => {
      if (!editMappingField) return;
      setEditMappingField({
          ...editMappingField,
          aliases: editMappingField.aliases.filter(a => a !== alias)
      });
  };

  const addFBPresets = async () => {
      if (loading) return;
      setLoading(true);
      const existingKeys = new Set(campaign.settings.custom_fields.map(f => f.key));
      const newFields: CustomFieldDefinition[] = [];
      FACEBOOK_PRESETS.forEach(key => {
          if (!existingKeys.has(key)) {
              newFields.push({ key, name: key.replace(/_/g, ' ').toUpperCase(), type: 'text', required: false, is_active: true, in_view: false, visibility: 'internal', aliases: [] });
          }
      });
      if (newFields.length > 0) {
          const newSettings = { ...campaign.settings, custom_fields: [...campaign.settings.custom_fields, ...newFields] };
          const updated = await updateCampaignSettings(campaign.id, newSettings);
          onUpdate(updated);
      }
      setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-200 dark:border-white/5 pb-4">
        <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Database className="w-6 h-6 text-primary-500" />
                Data Schema
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Define which data points are collected. View settings are in "Ansicht".</p>
        </div>
      </div>

      <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border border-zinc-200 dark:border-white/5">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Active Fields</h3>
                    <InfoTooltip content="Active fields will appear in the 'Add Lead' form and can be mapped from CSV/Webhook imports." />
                </div>
                <div className="flex gap-2">
                    <GlassButton variant="secondary" onClick={addFBPresets} disabled={loading} className="text-xs">
                        <Facebook className="w-3 h-3 text-blue-500" /> FB Presets
                    </GlassButton>
                    <GlassButton onClick={() => setIsModalOpen(true)} disabled={loading} className="text-xs">
                        <Plus className="w-3 h-3" /> Add Field
                    </GlassButton>
                </div>
            </div>

            <div className="space-y-2">
                <div className="px-1 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">System Fields</div>
                {SYSTEM_FIELDS.map(field => (
                    <SchemaRow
                        key={field.key}
                        name={field.name}
                        fieldKey={field.key}
                        type={field.type}
                        aliases={field.aliases}
                        isActive={campaign.settings.active_system_fields.includes(field.key)}
                        onToggleActive={() => toggleSystemFieldActive(field.key, campaign.settings.active_system_fields.includes(field.key))}
                        onEdit={() => setEditMappingField({ key: field.key, name: field.name, aliases: field.aliases || [], isSystem: true })}
                        loading={loading}
                    />
                ))}

                <div className="px-1 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-4">Custom Fields</div>
                {campaign.settings.custom_fields.map((field, idx) => (
                    <SchemaRow
                        key={field.key + idx}
                        name={field.name}
                        fieldKey={field.key}
                        type={field.type}
                        aliases={field.aliases}
                        isActive={field.is_active}
                        onToggleActive={() => toggleCustomFieldActive(idx)}
                        onDelete={() => setDeleteConfirmation({ index: idx, name: field.name })}
                        onEdit={() => setEditMappingField({ key: field.key, name: field.name, aliases: field.aliases || [], isSystem: false })}
                        loading={loading}
                    />
                ))}
            </div>
      </div>

      {/* Create Field Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Custom Field">
        <form onSubmit={handleAddField} className="space-y-4">
            <GlassInput 
                label="Field Name" 
                autoFocus
                required
                value={newField.name} 
                onChange={(e) => {
                    const val = e.target.value;
                    const key = val.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    setNewField({...newField, name: val, key});
                }}
                placeholder="e.g. Lead Score"
            />
            
            <GlassInput 
                label="Database Key" 
                value={newField.key} 
                onChange={(e) => setNewField({...newField, key: e.target.value})}
                className="font-mono text-sm text-zinc-500"
            />

            <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">Type</label>
                <select 
                    value={newField.type}
                    onChange={(e) => setNewField({...newField, type: e.target.value as FieldType})}
                    className="w-full px-4 py-2.5 bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500"
                >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Dropdown</option>
                    <option value="email">Email</option>
                    <option value="tel">Phone</option>
                </select>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/5">
                <div className="flex flex-col gap-2">
                    <span className="text-xs font-medium text-zinc-500">Collect Data (Form)</span>
                    <div className="flex items-center gap-2">
                            <Toggle checked={newField.isActive} onChange={(val) => setNewField({...newField, isActive: val})} />
                            <span className="text-xs">{newField.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                </div>
            </div>

            <GlassButton type="submit" className="w-full justify-center mt-4">Create Field</GlassButton>
        </form>
      </Modal>

       {/* Edit Mapping Modal - RESTRICTED */}
       <Modal isOpen={!!editMappingField} onClose={() => setEditMappingField(null)} title="Field Mapping">
        {editMappingField && (
             <form onSubmit={handleSaveMapping} className="space-y-6">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/5">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-zinc-900 dark:text-white">{editMappingField.name}</p>
                            <p className="text-xs text-zinc-500 font-mono">{editMappingField.key}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-primary-500/10 text-primary-500 px-2 py-1 rounded text-[10px] font-bold uppercase">
                                Strict Mode
                            </div>
                            <InfoTooltip content="Mapping is restricted to prevent database errors. You can only select fields that have been detected in previous imports." side="left" />
                        </div>
                    </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-600/80 dark:text-amber-400/80 leading-relaxed">
                        To ensure data consistency, you can only map aliases that have been 
                        <strong> detected from imports</strong> or defined in platform presets. Manual entry is disabled.
                    </p>
                </div>

                {/* Aliases Section */}
                <div>
                    <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 ml-1">Mapped Aliases</label>
                    <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-zinc-950/50 border border-zinc-200 dark:border-white/10 rounded-xl min-h-[60px]">
                        {editMappingField.aliases.map(alias => (
                            <div key={alias} className="flex items-center gap-1 bg-primary-500/10 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-lg text-xs font-medium border border-primary-500/20">
                                {alias}
                                <button type="button" onClick={() => removeAlias(alias)} className="hover:text-primary-800 dark:hover:text-primary-200 ml-1"><Trash2 className="w-3 h-3"/></button>
                            </div>
                        ))}
                         {editMappingField.aliases.length === 0 && (
                            <span className="text-xs text-zinc-400 italic flex items-center h-full">No active mappings. Select from below to add.</span>
                         )}
                    </div>
                </div>

                {/* Detected / Presets Section */}
                <div className="space-y-4 border-t border-zinc-200 dark:border-white/10 pt-4">
                    
                    {/* Discovered from Import */}
                    <div>
                        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Detected from Import
                        </div>
                        
                        {campaign.settings.discovered_fields && campaign.settings.discovered_fields.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {campaign.settings.discovered_fields.filter(k => !editMappingField.aliases.includes(k)).map(key => (
                                    <button 
                                        type="button" 
                                        key={key} 
                                        onClick={() => addAlias(key)}
                                        className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded text-xs hover:bg-primary-500 hover:text-white transition-colors flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> {key}
                                    </button>
                                ))}
                                {campaign.settings.discovered_fields.every(k => editMappingField.aliases.includes(k)) && (
                                     <span className="text-xs text-zinc-400 italic">All detected fields already mapped.</span>
                                )}
                            </div>
                        ) : (
                             <div className="flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-white/5 rounded-xl border border-dashed border-zinc-200 dark:border-white/10 gap-2">
                                <span className="text-xs text-zinc-500">No import data found yet.</span>
                                <Link to={`/campaign/${campaign.id}`} onClick={() => setIsModalOpen(false)} className="text-xs text-primary-500 hover:underline flex items-center gap-1">
                                    Go to Import Tab <ArrowRight className="w-3 h-3" />
                                </Link>
                             </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                     <GlassButton variant="secondary" onClick={() => setEditMappingField(null)} type="button">Cancel</GlassButton>
                     <GlassButton type="submit" disabled={editMappingField.isSystem}>Save Mapping</GlassButton>
                </div>
             </form>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteConfirmation} onClose={() => setDeleteConfirmation(null)} title="Delete Field?">
        <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-sm text-rose-600 dark:text-rose-200">
                    Are you sure you want to delete <span className="font-bold">{deleteConfirmation?.name}</span>? 
                    This action cannot be undone.
                </p>
            </div>
            <div className="flex gap-3 pt-2">
                <GlassButton variant="secondary" onClick={() => setDeleteConfirmation(null)} className="flex-1 justify-center">Cancel</GlassButton>
                <GlassButton variant="danger" onClick={confirmDelete} className="flex-1 justify-center">Delete</GlassButton>
            </div>
        </div>
      </Modal>
    </div>
  );
};
