
import React, { useState } from 'react';
import { Campaign, PipelineStage } from '../../types';
import { updateCampaignSettings } from '../../services/dataService';
import { GlassCard, GlassButton, Badge } from '../../components/ui/Glass';
import { Modal } from '../../components/ui/Modal';
import { GripVertical, Plus, Trash2, Edit2, Check, X, Calendar, Flag, XCircle } from 'lucide-react';

interface PipelineTabProps {
  campaign: Campaign;
  onUpdate: (campaign: Campaign) => void;
}

export const PipelineTab: React.FC<PipelineTabProps> = ({ campaign, onUpdate }) => {
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New Stage State
  const [newStageName, setNewStageName] = useState('');
  const [newStageType, setNewStageType] = useState<PipelineStage['type']>('standard');

  const handleUpdateStage = async (updatedStage: PipelineStage) => {
    const newStages = campaign.settings.pipeline_stages.map(s => 
        s.id === updatedStage.id ? updatedStage : s
    );
    const updated = await updateCampaignSettings(campaign.id, { ...campaign.settings, pipeline_stages: newStages });
    onUpdate(updated);
    setEditingStage(null);
  };

  const handleAddStage = async () => {
    if (!newStageName) return;
    
    // Auto-assign color based on type
    let color = 'bg-zinc-500';
    if (newStageType === 'won') color = 'bg-green-500';
    if (newStageType === 'lost') color = 'bg-rose-500';
    if (newStageType === 'appointment') color = 'bg-purple-500';

    const newStage: PipelineStage = {
        id: `s${Date.now()}`,
        name: newStageName,
        color: color,
        order: campaign.settings.pipeline_stages.length,
        type: newStageType
    };
    const newStages = [...campaign.settings.pipeline_stages, newStage];
    const updated = await updateCampaignSettings(campaign.id, { ...campaign.settings, pipeline_stages: newStages });
    onUpdate(updated);
    setIsAddModalOpen(false);
    setNewStageName('');
    setNewStageType('standard');
  };

  const handleDeleteStage = async (id: string) => {
      // In a real app, check for existing leads before delete
      const newStages = campaign.settings.pipeline_stages.filter(s => s.id !== id);
      const updated = await updateCampaignSettings(campaign.id, { ...campaign.settings, pipeline_stages: newStages });
      onUpdate(updated);
  };

  const moveStage = async (index: number, direction: 'up' | 'down') => {
      const stages = [...campaign.settings.pipeline_stages];
      if (direction === 'up' && index > 0) {
          [stages[index], stages[index - 1]] = [stages[index - 1], stages[index]];
      } else if (direction === 'down' && index < stages.length - 1) {
          [stages[index], stages[index + 1]] = [stages[index + 1], stages[index]];
      }
      // Update orders
      stages.forEach((s, i) => s.order = i);
      const updated = await updateCampaignSettings(campaign.id, { ...campaign.settings, pipeline_stages: stages });
      onUpdate(updated);
  };

  const getTypeIcon = (type: string | undefined) => {
      switch(type) {
          case 'won': return <Flag className="w-3 h-3" />;
          case 'lost': return <XCircle className="w-3 h-3" />;
          case 'appointment': return <Calendar className="w-3 h-3" />;
          default: return null;
      }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-100 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-white/5 backdrop-blur-md">
        <div>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Pipeline Stages</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Configure deal flow and conversion points.</p>
        </div>
        <GlassButton onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4" /> Add Stage
        </GlassButton>
      </div>

      <div className="space-y-3">
        {campaign.settings.pipeline_stages.sort((a,b) => a.order - b.order).map((stage, index) => (
            <GlassCard key={stage.id} className="p-4 flex items-center gap-4 group hover:bg-zinc-50 dark:hover:bg-zinc-900/80 transition-all">
                {/* Drag Handle (Visual) */}
                <div className="text-zinc-400 dark:text-zinc-600 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-5 h-5" />
                </div>

                {/* Color Dot */}
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />

                {/* Content */}
                <div className="flex-1">
                    {editingStage?.id === stage.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <input 
                                autoFocus
                                type="text" 
                                value={editingStage.name}
                                onChange={(e) => setEditingStage({ ...editingStage, name: e.target.value })}
                                className="bg-white dark:bg-zinc-950 border border-primary-500/50 rounded px-3 py-1 text-zinc-900 dark:text-white text-sm focus:outline-none"
                            />
                            
                            {/* Type Selector Inline */}
                            <select 
                                value={editingStage.type || 'standard'}
                                onChange={(e) => setEditingStage({...editingStage, type: e.target.value as any})}
                                className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded px-2 py-1 text-xs text-zinc-600 dark:text-zinc-400 focus:border-primary-500/50 outline-none"
                            >
                                <option value="standard">Standard</option>
                                <option value="appointment">Appointment</option>
                                <option value="won">Won</option>
                                <option value="lost">Lost</option>
                            </select>

                            <button onClick={() => handleUpdateStage(editingStage)} className="p-1 text-primary-500 hover:bg-primary-500/10 rounded">
                                <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingStage(null)} className="p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/10 rounded">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="font-medium text-zinc-900 dark:text-white">{stage.name}</span>
                            {stage.type && stage.type !== 'standard' && (
                                <Badge color={stage.type === 'won' ? 'primary' : stage.type === 'lost' ? 'rose' : 'purple'}>
                                    <span className="flex items-center gap-1 capitalize">
                                        {getTypeIcon(stage.type)} {stage.type}
                                    </span>
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => moveStage(index, 'up')} 
                        disabled={index === 0}
                        className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30"
                    >
                        ▲
                    </button>
                    <button 
                        onClick={() => moveStage(index, 'down')}
                        disabled={index === campaign.settings.pipeline_stages.length - 1}
                        className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30"
                    >
                        ▼
                    </button>
                    <div className="w-px h-4 bg-zinc-300 dark:bg-white/10 mx-2" />
                    <button onClick={() => setEditingStage(stage)} className="p-2 text-zinc-400 hover:text-primary-500">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteStage(stage.id)} className="p-2 text-zinc-400 hover:text-rose-500">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </GlassCard>
        ))}
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Stage">
        <div className="space-y-4">
            <div>
                <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-2">Stage Name</label>
                <input 
                    type="text" 
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500/50"
                    placeholder="e.g. Negotiation"
                />
            </div>
            
            <div>
                <label className="block text-sm text-zinc-500 dark:text-zinc-400 mb-2">Stage Type (Affects Stats)</label>
                <div className="grid grid-cols-2 gap-3">
                    {['standard', 'appointment', 'won', 'lost'].map((type) => (
                        <div 
                            key={type}
                            onClick={() => setNewStageType(type as any)}
                            className={`
                                cursor-pointer p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all
                                ${newStageType === type 
                                    ? 'bg-primary-500/10 border-primary-500 text-primary-600 dark:text-primary-400' 
                                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-500 hover:border-zinc-300 dark:hover:border-white/20'
                                }
                            `}
                        >
                            <span className="capitalize text-sm font-medium">{type}</span>
                        </div>
                    ))}
                </div>
            </div>

            <GlassButton onClick={handleAddStage} className="w-full justify-center">Add Stage</GlassButton>
        </div>
      </Modal>

    </div>
  );
};