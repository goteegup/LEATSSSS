
import React, { useState } from 'react';
import { Campaign, PipelineStage } from '../../types';
import { updateCampaignSettings } from '../../services/dataService';
import { GlassCard, GlassButton, Badge } from '../../components/ui/Glass';
import { Modal } from '../../components/ui/Modal';
import { GripVertical, Plus, Edit2, Trash2, CheckCircle2, XCircle, Calendar, Flag } from 'lucide-react';

interface PipelineTabProps {
  campaign: Campaign;
  onUpdate: (campaign: Campaign) => void;
}

export const PipelineTab: React.FC<PipelineTabProps> = ({ campaign, onUpdate }) => {
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  const handleDeleteStage = async (stageId: string) => {
      if(!confirm("Are you sure? Leads in this stage will be hidden.")) return;
      const newStages = campaign.settings.pipeline_stages.filter(s => s.id !== stageId);
      const updated = await updateCampaignSettings(campaign.id, { ...campaign.settings, pipeline_stages: newStages });
      onUpdate(updated);
  };

  const handleAddStage = async () => {
    if (!newStageName) return;
    
    // Auto-assign color based on type
    let color = 'bg-blue-500';
    if (newStageType === 'won') color = 'bg-green-500';
    if (newStageType === 'lost') color = 'bg-zinc-500';
    if (newStageType === 'appointment') color = 'bg-purple-500';
    if (newStageType === 'standard') color = 'bg-blue-500';

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

  const getTypeBadge = (type: string) => {
      switch(type) {
          case 'won': return <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-green-500/10 text-green-600 px-2 py-0.5 rounded border border-green-500/20"><CheckCircle2 className="w-3 h-3"/> Won</span>;
          case 'lost': return <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-zinc-500/10 text-zinc-500 px-2 py-0.5 rounded border border-zinc-500/20"><XCircle className="w-3 h-3"/> Lost</span>;
          case 'appointment': return <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded border border-purple-500/20"><Calendar className="w-3 h-3"/> Appt</span>;
          default: return <span className="flex items-center gap-1 text-[10px] font-bold uppercase bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded border border-blue-500/20"><Flag className="w-3 h-3"/> Std</span>;
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      <div className="flex justify-between items-start">
        <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Pipeline Stages</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                Define the steps of your sales process. <br/>
                <span className="text-xs opacity-70">Mark stages as "Won" or "Appointment" to track conversions automatically.</span>
            </p>
        </div>
        <GlassButton onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2"/> Add Stage
        </GlassButton>
      </div>

      <div className="space-y-3">
        {campaign.settings.pipeline_stages.sort((a,b) => a.order - b.order).map((stage) => (
            <GlassCard key={stage.id} className="p-4 flex items-center gap-4 group hover:bg-zinc-50 dark:hover:bg-zinc-900/80 transition-all">
                <div className="text-zinc-400 cursor-grab active:cursor-grabbing"><GripVertical className="w-5 h-5" /></div>
                
                {/* Color Dot */}
                <div className={`w-3 h-3 rounded-full ${stage.color} ring-2 ring-white dark:ring-zinc-900`} />
                
                <div className="flex-1">
                    {editingStage?.id === stage.id ? (
                        <div className="flex items-center gap-2">
                            <input 
                                autoFocus 
                                value={editingStage.name} 
                                onChange={(e) => setEditingStage({ ...editingStage, name: e.target.value })} 
                                className="bg-transparent border-b border-primary-500 outline-none text-zinc-900 dark:text-white font-medium w-full" 
                            />
                            <select 
                                value={editingStage.type || 'standard'}
                                onChange={(e) => setEditingStage({...editingStage, type: e.target.value as any})}
                                className="bg-zinc-100 dark:bg-zinc-800 border-none rounded text-xs py-1 px-2"
                            >
                                <option value="standard">Standard</option>
                                <option value="appointment">Appointment</option>
                                <option value="won">Won (Sale)</option>
                                <option value="lost">Lost</option>
                            </select>
                            <button onClick={() => handleUpdateStage(editingStage)} className="p-1 bg-green-500/20 text-green-500 rounded"><CheckCircle2 className="w-4 h-4"/></button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="font-medium text-zinc-900 dark:text-white text-lg">{stage.name}</span>
                            {getTypeBadge(stage.type || 'standard')}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingStage(stage)} className="p-2 text-zinc-400 hover:text-primary-500 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4"/>
                    </button>
                    <button onClick={() => handleDeleteStage(stage.id)} className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4"/>
                    </button>
                </div>
            </GlassCard>
        ))}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Stage">
         <div className="space-y-6">
            <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Stage Name</label>
                <input 
                    type="text" 
                    autoFocus
                    placeholder="e.g. Contract Sent" 
                    value={newStageName} 
                    onChange={e => setNewStageName(e.target.value)} 
                    className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:border-primary-500" 
                />
            </div>
            
            <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Stage Type</label>
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { id: 'standard', label: 'Standard', icon: Flag, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
                        { id: 'appointment', label: 'Appointment', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' },
                        { id: 'won', label: 'Won (Sale)', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
                        { id: 'lost', label: 'Lost', icon: XCircle, color: 'text-zinc-500', bg: 'bg-zinc-500/10 border-zinc-500/20' },
                    ].map(type => (
                        <button
                            key={type.id}
                            onClick={() => setNewStageType(type.id as any)}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${newStageType === type.id ? `${type.bg} ring-1 ring-offset-1 ring-offset-zinc-900 ring-${type.color.split('-')[1]}-500` : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 opacity-60 hover:opacity-100'}`}
                        >
                            <type.icon className={`w-5 h-5 ${type.color}`} />
                            <span className="text-sm font-medium text-zinc-900 dark:text-white">{type.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <GlassButton onClick={handleAddStage} className="w-full justify-center" disabled={!newStageName}>Create Stage</GlassButton>
         </div>
      </Modal>
    </div>
  );
};