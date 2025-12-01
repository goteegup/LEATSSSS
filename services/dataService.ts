
import { Campaign, Client, Lead, WorkspaceSettings, PipelineStage } from '../types';

// --- MOCK STATE ---

// Default Primary Color: Teal (RGB)
let WORKSPACE_SETTINGS: WorkspaceSettings = {
  agency_name: 'LeadTS', // UPDATED: Changed from 'LeadTS Agency' to match branding
  logo_url: '', // Empty by default, allows fallback to Icon. User can upload via Settings.
  primary_color: '20 184 166', 
  language: 'en',
  theme: 'dark',
  onboarding_complete: false // Start with onboarding
};

// --- SESSION STATE ---
interface Session {
    role: 'admin' | 'client';
    clientId?: string;
}

let CURRENT_SESSION: Session = {
    role: 'admin'
};

// Load session from local storage if exists (mock persistence)
try {
    const saved = localStorage.getItem('leadts_session');
    if (saved) CURRENT_SESSION = JSON.parse(saved);
    
    // Check if onboarding was done in prev session (mock)
    const onboarding = localStorage.getItem('leadts_onboarding');
    if (onboarding === 'true') WORKSPACE_SETTINGS.onboarding_complete = true;
} catch (e) {}


const MOCK_CLIENTS: Client[] = [
  { 
    id: 'c1', 
    name: 'Nexus Corp', 
    logo: 'https://picsum.photos/id/1/200/200',
    contact_person: 'Sarah Connor',
    email: 'sarah@nexus.com',
    website: 'nexus-corp.com',
    status: 'active',
    address: '123 Tech Blvd, Cyber City',
    portal_access: {
        email: 'portal@nexus.com',
        password: 'password123',
        is_enabled: true
    }
  },
  { 
    id: 'c2', 
    name: 'Stellar Auto', 
    logo: 'https://picsum.photos/id/2/200/200',
    contact_person: 'Mike Ross',
    email: 'mike@stellar.com',
    website: 'stellarauto.de',
    status: 'active',
    portal_access: {
        is_enabled: false
    }
  },
  { 
    id: 'c3', 
    name: 'Velvet Interiors', 
    logo: 'https://picsum.photos/id/3/200/200',
    contact_person: 'Jessica Pearson',
    email: 'jp@velvet.com',
    website: 'velvet-interiors.design',
    status: 'inactive',
    portal_access: {
        is_enabled: false
    }
  },
];

const DEFAULT_STAGES: PipelineStage[] = [
  { id: 's1', name: 'New Lead', color: 'bg-blue-500', order: 0, type: 'standard' },
  { id: 's2', name: 'Contacted', color: 'bg-yellow-500', order: 1, type: 'standard' },
  { id: 's3', name: 'Scheduled', color: 'bg-purple-500', order: 2, type: 'appointment' },
  { id: 's4', name: 'Won', color: 'bg-green-500', order: 3, type: 'won' },
  { id: 's5', name: 'Lost', color: 'bg-rose-500', order: 4, type: 'lost' },
];

// Helper to calculate ROAS consistently
const calcStats = (rev: number, spend: number, leads: number, appts: number, sales: number) => ({
    revenue: rev,
    spend: spend,
    leads: leads,
    appointments: appts,
    sales: sales,
    roas: spend > 0 ? Number((rev / spend).toFixed(2)) : 0
});

let MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'cam1',
    client_id: 'c1',
    name: 'Q3 Growth Initiative',
    status: 'active',
    budget: 50000,
    start_date: '2023-09-01',
    stats: calcStats(125000, 25000, 142, 45, 18),
    settings: {
      active_system_fields: ['full_name', 'email', 'phone', 'revenue', 'source'],
      public_system_fields: ['full_name', 'revenue'],
      custom_fields: [
        { key: 'industry', name: 'Industry', type: 'text', required: false, is_active: true, in_view: true, visibility: 'public', aliases: ['vertical', 'sector'] }
      ],
      pipeline_stages: [...DEFAULT_STAGES],
      card_field_order: ['revenue', 'phone', 'industry'],
      card_primary_field: 'full_name',
      discovered_fields: [] 
    }
  },
  {
    id: 'cam2',
    client_id: 'c2',
    name: 'Black Friday 2024',
    status: 'paused',
    budget: 20000,
    stats: calcStats(45000, 12000, 89, 22, 8),
    settings: {
      active_system_fields: ['full_name', 'email', 'phone'],
      public_system_fields: ['full_name'],
      custom_fields: [],
      pipeline_stages: [...DEFAULT_STAGES],
      card_field_order: ['email'],
      card_primary_field: 'full_name',
      discovered_fields: []
    }
  },
  {
    id: 'cam3',
    client_id: 'c1',
    name: 'Retargeting Alpha',
    status: 'active',
    budget: 10000,
    stats: calcStats(12000, 4000, 32, 12, 5),
    settings: {
      active_system_fields: ['full_name', 'email', 'phone'],
      public_system_fields: ['full_name'],
      custom_fields: [],
      pipeline_stages: [...DEFAULT_STAGES],
      card_field_order: ['email'],
      card_primary_field: 'full_name',
      discovered_fields: []
    }
  }
];

let MOCK_LEADS: Lead[] = [
  {
    id: 'l1', campaign_id: 'cam1', stage_id: 's1', created_at: '2023-10-01T10:00:00Z', updated_at: '2023-10-01T10:00:00Z',
    data: { full_name: 'Alice Freeman', email: 'alice@example.com', phone: '+15550101', revenue: 5000, industry: 'Tech' },
    notes: 'Interested in enterprise plan.'
  },
  {
    id: 'l2', campaign_id: 'cam1', stage_id: 's3', created_at: '2023-10-02T14:30:00Z', updated_at: '2023-10-03T09:15:00Z',
    data: { full_name: 'Bob Smith', email: 'bob@example.com', phone: '+15550102', revenue: 12000, industry: 'Finance' }
  },
  {
    id: 'l3', campaign_id: 'cam1', stage_id: 's4', created_at: '2023-10-05T09:00:00Z', updated_at: '2023-10-10T16:45:00Z',
    data: { full_name: 'Charlie Davis', email: 'charlie@example.com', phone: '+15550103', revenue: 3500, industry: 'Retail' }
  }
];

// --- SERVICE METHODS ---

export const getSession = () => ({ ...CURRENT_SESSION });

export const loginAsClient = async (clientId: string) => {
    CURRENT_SESSION = { role: 'client', clientId };
    localStorage.setItem('leadts_session', JSON.stringify(CURRENT_SESSION));
    window.dispatchEvent(new Event('session-change'));
    return Promise.resolve();
};

export const logoutClient = async () => {
    CURRENT_SESSION = { role: 'admin' };
    localStorage.removeItem('leadts_session');
    window.dispatchEvent(new Event('session-change'));
    return Promise.resolve();
};

export const getWorkspaceSettings = async (): Promise<WorkspaceSettings> => {
    return new Promise(resolve => setTimeout(() => resolve(WORKSPACE_SETTINGS), 50));
}

export const updateWorkspaceSettings = async (settings: WorkspaceSettings): Promise<WorkspaceSettings> => {
    WORKSPACE_SETTINGS = settings;
    if (settings.onboarding_complete) {
        localStorage.setItem('leadts_onboarding', 'true');
    }
    return new Promise(resolve => setTimeout(() => resolve({ ...WORKSPACE_SETTINGS }), 100));
}

export const cycleTheme = async (): Promise<void> => {
    const newTheme = WORKSPACE_SETTINGS.theme === 'dark' ? 'light' : 'dark';
    WORKSPACE_SETTINGS = { ...WORKSPACE_SETTINGS, theme: newTheme };
    // Dispatch global event for instant update
    const event = new CustomEvent('theme-change', { detail: { primary_color: WORKSPACE_SETTINGS.primary_color, theme: newTheme } });
    window.dispatchEvent(event);
    return Promise.resolve();
}

// Simulates File Upload by returning a base64 string
export const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
            } else {
                reject(new Error("Failed to convert image"));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const getClients = async (): Promise<Client[]> => {
  return new Promise(resolve => setTimeout(() => resolve([...MOCK_CLIENTS]), 100));
};

export const getClientById = async (id: string): Promise<Client | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_CLIENTS.find(c => c.id === id)), 50));
};

export const createClient = async (client: Omit<Client, 'id'>): Promise<Client> => {
    const newClient = { 
        ...client, 
        id: `c${Date.now()}`,
        portal_access: { is_enabled: false } 
    };
    MOCK_CLIENTS.push(newClient);
    return new Promise(resolve => setTimeout(() => resolve({ ...newClient }), 200));
}

export const updateClient = async (client: Client): Promise<Client> => {
    const index = MOCK_CLIENTS.findIndex(c => c.id === client.id);
    if (index !== -1) {
        MOCK_CLIENTS[index] = { ...client };
        return new Promise(resolve => setTimeout(() => resolve({ ...MOCK_CLIENTS[index] }), 100));
    }
    return new Promise(resolve => setTimeout(() => resolve(client), 100));
}

export const getCampaigns = async (): Promise<Campaign[]> => {
  return new Promise(resolve => setTimeout(() => resolve([...MOCK_CAMPAIGNS]), 100));
};

export const createCampaign = async (campaignData: Partial<Campaign> & { client_id: string, name: string }): Promise<Campaign> => {
    const newCampaign: Campaign = {
        id: `cam${Date.now()}`,
        client_id: campaignData.client_id,
        name: campaignData.name,
        status: campaignData.status || 'active',
        budget: campaignData.budget || 0,
        start_date: campaignData.start_date,
        end_date: campaignData.end_date,
        stats: calcStats(0, 0, 0, 0, 0),
        settings: {
            active_system_fields: ['full_name', 'email', 'phone'],
            public_system_fields: ['full_name'],
            custom_fields: [],
            pipeline_stages: [...DEFAULT_STAGES],
            card_field_order: ['email'],
            card_primary_field: 'full_name',
            discovered_fields: []
        }
    };
    MOCK_CAMPAIGNS.push(newCampaign);
    return new Promise(resolve => setTimeout(() => resolve({ ...newCampaign }), 200));
}

export const updateCampaign = async (campaign: Campaign): Promise<Campaign> => {
    const index = MOCK_CAMPAIGNS.findIndex(c => c.id === campaign.id);
    if (index !== -1) {
        MOCK_CAMPAIGNS[index] = { ...campaign };
        return new Promise(resolve => setTimeout(() => resolve({ ...MOCK_CAMPAIGNS[index] }), 100));
    }
    return new Promise(resolve => setTimeout(() => resolve(campaign), 100));
}

export const getCampaignsByClientId = async (clientId: string): Promise<Campaign[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_CAMPAIGNS.filter(c => c.client_id === clientId)), 100));
};

export const getCampaignById = async (id: string): Promise<Campaign | undefined> => {
  return new Promise(resolve => setTimeout(() => resolve(MOCK_CAMPAIGNS.find(c => c.id === id)), 50));
};

export const getLeadsByCampaign = async (campaignId: string): Promise<Lead[]> => {
  return new Promise(resolve => setTimeout(() => resolve(MOCK_LEADS.filter(l => l.campaign_id === campaignId)), 100));
};

// CRITICAL FIX: Return new object reference to trigger React re-renders
export const updateCampaignSettings = async (campaignId: string, newSettings: any): Promise<Campaign> => {
  const index = MOCK_CAMPAIGNS.findIndex(c => c.id === campaignId);
  if (index !== -1) {
    const updatedCampaign = { 
        ...MOCK_CAMPAIGNS[index], 
        settings: { ...newSettings } 
    };
    MOCK_CAMPAIGNS[index] = updatedCampaign;
    return new Promise(resolve => setTimeout(() => resolve(updatedCampaign), 50));
  }
  return new Promise(resolve => setTimeout(() => resolve(MOCK_CAMPAIGNS.find(c => c.id === campaignId)!), 50));
};

export const addLead = async (lead: Lead): Promise<Lead> => {
    MOCK_LEADS.push(lead);
    return new Promise(resolve => setTimeout(() => resolve(lead), 100));
};

export const updateLead = async (lead: Lead): Promise<Lead> => {
    const index = MOCK_LEADS.findIndex(l => l.id === lead.id);
    if (index !== -1) {
        MOCK_LEADS[index] = { ...lead };
    }
    return new Promise(resolve => setTimeout(() => resolve(lead), 100));
};

export const deleteLead = async (leadId: string): Promise<void> => {
    MOCK_LEADS = MOCK_LEADS.filter(l => l.id !== leadId);
    return new Promise(resolve => setTimeout(() => resolve(), 100));
};

export const getFieldValue = (lead: Lead, key: string) => {
    return lead.data[key] || '-';
};
