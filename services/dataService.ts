import { Campaign, Client, Lead, WorkspaceSettings, PipelineStage, Session, User, IntegrationSettings, CustomFieldDefinition, ClientViewConfig } from '../types';

// --- MOCK STATE ---

let WORKSPACE_SETTINGS: WorkspaceSettings = {
  agency_name: 'LeadTS',
  logo_url: '',
  primary_color: '20 184 166', 
  language: 'en',
  theme: 'dark',
  onboarding_complete: false,
  tour_completed: false
};

// --- SESSION STATE ---
let CURRENT_SESSION: Session = {
    user: null,
    role: 'admin'
};

// Initialization: Load session from local storage
try {
    const savedSession = localStorage.getItem('leadts_session_v2');
    if (savedSession) {
        CURRENT_SESSION = JSON.parse(savedSession);
    }
    
    const savedSettings = localStorage.getItem('leadts_workspace_settings');
    if (savedSettings) {
        WORKSPACE_SETTINGS = { ...WORKSPACE_SETTINGS, ...JSON.parse(savedSettings) };
    }
} catch (e) {
    console.error("Failed to load session", e);
}


// --- DATA MOCKS ---

let MOCK_CLIENTS: Client[] = [
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
        is_enabled: true,
        can_view_dashboard: true
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
        is_enabled: false,
        can_view_dashboard: true
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
        is_enabled: false,
        can_view_dashboard: false
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

const DEFAULT_INTEGRATIONS: IntegrationSettings = {
    slack: {
        enabled: false,
        webhook_url: '',
        channel: '',
        events: {
            new_lead: { enabled: true, template: "🔥 New Lead: {full_name} ({phone}) via {source}" },
            won_deal: { enabled: true, template: "💰 BOOM! Deal closed: {full_name} just brought in {revenue}!" },
            appointment_booked: { enabled: true, template: "📅 Appointment confirmed with {full_name}." },
            lead_lost: { enabled: false, template: "❌ Lead lost: {full_name}. Reason: {notes}" },
            lead_unreachable: { enabled: false, template: "⚠️ Alert: {full_name} has not been reached after 2 attempts." }
        }
    },
    email: {
        enabled: false,
        recipients: [],
        events: {
            new_lead_alert: true,
            daily_digest: false,
            appointment_confirmation_customer: false,
            won_deal_alert: true
        }
    },
    meta: {
        enabled: false,
        events: {
            purchase_on_won: true,
            lead_on_create: false
        }
    }
};

const DEFAULT_CLIENT_VIEW: ClientViewConfig = {
    show_dashboard: true,
    show_kanban: true,
    show_list: true,
    show_kpi: true
};

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
      discovered_fields: [],
      integrations: { ...DEFAULT_INTEGRATIONS },
      client_view: { ...DEFAULT_CLIENT_VIEW }
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
      discovered_fields: [],
      integrations: { ...DEFAULT_INTEGRATIONS },
      client_view: { ...DEFAULT_CLIENT_VIEW }
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
      discovered_fields: [],
      integrations: { ...DEFAULT_INTEGRATIONS },
      client_view: { ...DEFAULT_CLIENT_VIEW }
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

// --- AUTOMATION ENGINE ---
const triggerAutomations = async (lead: Lead, oldLead: Lead | null) => {
    const campaign = MOCK_CAMPAIGNS.find(c => c.id === lead.campaign_id);
    if (!campaign) return;
    
    const settings = campaign.settings.integrations;
    if (!settings) return;

    // 1. New Lead
    if (!oldLead && settings.slack.enabled && settings.slack.events.new_lead.enabled) {
        console.log(`[Slack] Sending New Lead Alert: ${lead.data.full_name}`);
    }

    // Stage Change Detection
    if (oldLead && oldLead.stage_id !== lead.stage_id) {
        const newStage = campaign.settings.pipeline_stages.find(s => s.id === lead.stage_id);
        if (!newStage) return;

        // 2. Won Deal
        if (newStage.type === 'won') {
            if (settings.slack.enabled && settings.slack.events.won_deal.enabled) {
                console.log(`[Slack] 💰 Deal Won! ${lead.data.full_name} ($${lead.data.revenue})`);
            }
            if (settings.meta.enabled && settings.meta.events.purchase_on_won) {
                console.log(`[Meta CAPI] Sending Purchase Event: Value ${lead.data.revenue}`);
            }
        }

        // 3. Appointment Booked
        if (newStage.type === 'appointment') {
            if (settings.slack.enabled && settings.slack.events.appointment_booked.enabled) {
                console.log(`[Slack] 📅 Appointment Booked with ${lead.data.full_name}`);
            }
            if (settings.email.enabled && settings.email.events.appointment_confirmation_customer) {
                console.log(`[Email] Sending Confirmation to ${lead.data.email}`);
            }
        }

        // 4. Lost Lead
        if (newStage.type === 'lost') {
            if (settings.slack.enabled && settings.slack.events.lead_lost.enabled) {
                console.log(`[Slack] ❌ Lead Lost: ${lead.data.full_name}`);
            }
        }
    }
};

// --- BLUEPRINT GENERATOR (For Onboarding) ---

export const initializeDemoWorkspace = async (
    agencyName: string, 
    clientName: string, 
    industry: string,
    campaignName?: string,
    budget?: number
) => {
    // 1. Wipe existing data for fresh start
    MOCK_CLIENTS = [];
    MOCK_CAMPAIGNS = [];
    MOCK_LEADS = [];

    // 2. Create the Client
    const client: Client = {
        id: `c_${Date.now()}`,
        name: clientName,
        logo: `https://ui-avatars.com/api/?name=${clientName.replace(' ', '+')}&background=random`,
        contact_person: 'Demo User',
        email: 'client@example.com',
        website: `${clientName.toLowerCase().replace(' ', '')}.com`,
        status: 'active',
        portal_access: { 
            is_enabled: true, 
            email: 'client@portal.com', 
            password: 'demo',
            can_view_dashboard: true
        }
    };
    MOCK_CLIENTS.push(client);

    // 3. Define Industry Blueprints
    let customFields: CustomFieldDefinition[] = [];
    let stages: PipelineStage[] = [
        { id: 's1', name: 'New Lead', color: 'bg-blue-500', order: 0, type: 'standard' },
        { id: 's2', name: 'Contacted', color: 'bg-yellow-500', order: 1, type: 'standard' },
        { id: 's3', name: 'Scheduled', color: 'bg-purple-500', order: 2, type: 'appointment' },
        { id: 's4', name: 'Won', color: 'bg-green-500', order: 3, type: 'won' },
        { id: 's5', name: 'Lost', color: 'bg-rose-500', order: 4, type: 'lost' },
    ];
    let cardLayout: string[] = ['phone', 'revenue'];
    
    if (industry === 'real-estate') {
        customFields = [
            { key: 'property_type', name: 'Property Type', type: 'select', options: ['House', 'Condo', 'Land'], required: false, is_active: true, visibility: 'public', in_view: true },
            { key: 'budget_max', name: 'Max Budget', type: 'currency', required: false, is_active: true, visibility: 'public', in_view: true },
            { key: 'location', name: 'Location Interest', type: 'text', required: false, is_active: true, visibility: 'public', in_view: true }
        ];
        stages = [
            { id: 's1', name: 'New Inquiry', color: 'bg-blue-500', order: 0, type: 'standard' },
            { id: 's2', name: 'Viewing Scheduled', color: 'bg-purple-500', order: 1, type: 'appointment' },
            { id: 's3', name: 'Offer Made', color: 'bg-yellow-500', order: 2, type: 'standard' },
            { id: 's4', name: 'Sold / Closed', color: 'bg-green-500', order: 3, type: 'won' },
            { id: 's5', name: 'Not Interested', color: 'bg-zinc-500', order: 4, type: 'lost' }
        ];
        cardLayout = ['revenue', 'phone', 'property_type'];
    } else if (industry === 'roofer') {
        customFields = [
            { key: 'roof_age', name: 'Roof Age (Years)', type: 'number', required: false, is_active: true, visibility: 'public', in_view: true },
            { key: 'damage_type', name: 'Damage Type', type: 'select', options: ['Leak', 'Storm Damage', 'Old Age', 'Missing Shingles'], required: false, is_active: true, visibility: 'public', in_view: true },
            { key: 'address', name: 'Property Address', type: 'text', required: false, is_active: true, visibility: 'internal', in_view: true }
        ];
        stages = [
            { id: 's1', name: 'New Lead', color: 'bg-blue-500', order: 0, type: 'standard' },
            { id: 's2', name: 'Inspection Booked', color: 'bg-purple-500', order: 1, type: 'appointment' },
            { id: 's3', name: 'Estimate Sent', color: 'bg-yellow-500', order: 2, type: 'standard' },
            { id: 's4', name: 'Job Completed', color: 'bg-green-500', order: 3, type: 'won' },
            { id: 's5', name: 'Lost', color: 'bg-zinc-500', order: 4, type: 'lost' }
        ];
        cardLayout = ['damage_type', 'phone', 'roof_age'];
    } else if (industry === 'fitness') {
        customFields = [
            { key: 'goal', name: 'Fitness Goal', type: 'select', options: ['Weight Loss', 'Muscle', 'Endurance'], required: false, is_active: true, visibility: 'public', in_view: true },
            { key: 'current_gym', name: 'Current Gym', type: 'text', required: false, is_active: true, visibility: 'internal', in_view: true }
        ];
        stages = [
            { id: 's1', name: 'New Lead', color: 'bg-blue-500', order: 0, type: 'standard' },
            { id: 's2', name: 'Trial Booked', color: 'bg-purple-500', order: 1, type: 'appointment' },
            { id: 's3', name: 'Trial Attended', color: 'bg-yellow-500', order: 2, type: 'standard' },
            { id: 's4', name: 'Membership Signed', color: 'bg-green-500', order: 3, type: 'won' },
            { id: 's5', name: 'No Show', color: 'bg-rose-500', order: 4, type: 'lost' }
        ];
        cardLayout = ['goal', 'phone'];
    } else if (industry === 'automotive') {
        customFields = [
            { key: 'vehicle_interest', name: 'Vehicle Interest', type: 'text', required: false, is_active: true, visibility: 'public', in_view: true },
            { key: 'trade_in', name: 'Has Trade-in?', type: 'select', options: ['Yes', 'No'], required: false, is_active: true, visibility: 'public', in_view: true }
        ];
        stages = [
            { id: 's1', name: 'New Inquiry', color: 'bg-blue-500', order: 0, type: 'standard' },
            { id: 's2', name: 'Test Drive', color: 'bg-purple-500', order: 1, type: 'appointment' },
            { id: 's3', name: 'Financing', color: 'bg-yellow-500', order: 2, type: 'standard' },
            { id: 's4', name: 'Vehicle Sold', color: 'bg-green-500', order: 3, type: 'won' },
            { id: 's5', name: 'Lost', color: 'bg-zinc-500', order: 4, type: 'lost' }
        ];
        cardLayout = ['vehicle_interest', 'phone', 'revenue'];
    }

    // 4. Create the Campaign
    const campaignId = `cam_${Date.now()}`;
    const defaultCampaignName = industry === 'real-estate' ? 'Spring Listings' : industry === 'roofer' ? 'Storm Damage Leads' : industry === 'fitness' ? 'New Year Challenge' : 'Q4 Sales Event';
    
    const campaign: Campaign = {
        id: campaignId,
        client_id: client.id,
        name: campaignName || defaultCampaignName,
        status: 'active',
        budget: budget || 5000,
        start_date: new Date().toISOString().split('T')[0],
        settings: {
            active_system_fields: ['full_name', 'email', 'phone', 'revenue', 'source'],
            public_system_fields: ['full_name', 'phone', 'revenue'],
            custom_fields: customFields,
            pipeline_stages: stages,
            card_field_order: cardLayout,
            card_primary_field: 'full_name',
            integrations: { 
                slack: { 
                    enabled: false, 
                    webhook_url: '',
                    channel: '',
                    events: { 
                        new_lead: { enabled: true, template: "🔥 New Lead: {full_name} ({phone}) via {source}" }, 
                        won_deal: { enabled: true, template: "💰 BOOM! Deal closed: {full_name} just brought in {revenue}!" },
                        appointment_booked: { enabled: true, template: "📅 Appointment confirmed with {full_name}." },
                        lead_lost: { enabled: false, template: "❌ Lead lost: {full_name}. Reason: {notes}" },
                        lead_unreachable: { enabled: false, template: "⚠️ Alert: {full_name} has not been reached after 2 attempts." }
                    } 
                },
                email: { 
                    enabled: false, 
                    recipients: [], 
                    events: { 
                        new_lead_alert: true, 
                        daily_digest: false,
                        appointment_confirmation_customer: false,
                        won_deal_alert: true
                    } 
                },
                meta: { 
                    enabled: false, 
                    events: { purchase_on_won: true, lead_on_create: false } 
                }
            },
            client_view: { ...DEFAULT_CLIENT_VIEW }
        },
        stats: calcStats(0, 0, 0, 0, 0)
    };
    MOCK_CAMPAIGNS.push(campaign);

    // 5. Generate Mock Leads
    const leadCount = 8;
    let leadsCreated = 0;
    let revenue = 0;
    let wonCount = 0;
    let apptCount = 0;

    for (let i = 0; i < leadCount; i++) {
        const stage = stages[Math.floor(Math.random() * stages.length)];
        const leadRev = Math.floor(Math.random() * 5000) + 500;
        
        if (stage.type === 'won') { revenue += leadRev; wonCount++; }
        if (stage.type === 'appointment') { apptCount++; }

        const lead: Lead = {
            id: `l_${Date.now()}_${i}`,
            campaign_id: campaignId,
            stage_id: stage.id,
            created_at: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
            updated_at: new Date().toISOString(),
            data: {
                full_name: `Lead ${i + 1}`,
                email: `lead${i}@test.com`,
                phone: `+1555000${i}`,
                revenue: leadRev,
                source: Math.random() > 0.5 ? 'Facebook' : 'Google',
                [customFields[0]?.key]: industry === 'roofer' ? '15 Years' : 'Sample Data',
                [customFields[1]?.key]: industry === 'roofer' ? 'Storm Damage' : undefined
            }
        };
        MOCK_LEADS.push(lead);
        leadsCreated++;
    }

    // Update Campaign Stats
    campaign.stats = calcStats(revenue, campaign.budget || 5000, leadsCreated, apptCount, wonCount);

    return true;
};


// --- AUTH SERVICES ---

export const getSession = () => ({ ...CURRENT_SESSION });

export const loginUser = async (email: string, name?: string): Promise<{ success: boolean, isNewUser: boolean }> => {
    // Simulate API Call
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simple mock logic: 'demo' email is existing, others are new
    const isNewUser = !email.includes('demo');
    
    // Create Mock User
    const user: User = {
        id: `u_${Date.now()}`,
        email: email,
        name: name || email.split('@')[0],
        avatar: `https://ui-avatars.com/api/?name=${name || email}&background=0D9488&color=fff`,
        created_at: new Date().toISOString()
    };

    // Set Session
    CURRENT_SESSION = {
        user: user,
        role: 'admin'
    };
    localStorage.setItem('leadts_session_v2', JSON.stringify(CURRENT_SESSION));

    // IMPORTANT: Reset Workspace if New User to simulate onboarding flow properly
    if (isNewUser) {
        WORKSPACE_SETTINGS.onboarding_complete = false;
        WORKSPACE_SETTINGS.tour_completed = false; // Reset Tour
        WORKSPACE_SETTINGS.agency_name = ''; // Reset name
        WORKSPACE_SETTINGS.logo_url = ''; // Reset logo
        localStorage.setItem('leadts_workspace_settings', JSON.stringify(WORKSPACE_SETTINGS));
    } else {
        // Existing user has completed onboarding
        WORKSPACE_SETTINGS.onboarding_complete = true;
        // Ensure some defaults if they were cleared
        if (!WORKSPACE_SETTINGS.agency_name) WORKSPACE_SETTINGS.agency_name = 'Demo Agency';
        localStorage.setItem('leadts_workspace_settings', JSON.stringify(WORKSPACE_SETTINGS));
    }
    
    // Dispatch event so App.tsx and Layout.tsx can react
    window.dispatchEvent(new Event('session-change'));
    
    return { success: true, isNewUser };
};

export const loginAsClient = async (clientId: string) => {
    CURRENT_SESSION = { ...CURRENT_SESSION, role: 'client', clientId };
    // Keep user logged in but switch role context
    localStorage.setItem('leadts_session_v2', JSON.stringify(CURRENT_SESSION));
    window.dispatchEvent(new Event('session-change'));
    return Promise.resolve();
};

export const logoutClient = async () => {
    CURRENT_SESSION = { ...CURRENT_SESSION, role: 'admin', clientId: undefined };
    localStorage.setItem('leadts_session_v2', JSON.stringify(CURRENT_SESSION));
    window.dispatchEvent(new Event('session-change'));
    return Promise.resolve();
};

export const logout = async () => {
    CURRENT_SESSION = { user: null, role: 'admin' };
    localStorage.removeItem('leadts_session_v2');
    window.dispatchEvent(new Event('session-change'));
    return Promise.resolve();
};

// --- DATA SERVICES ---

export const getWorkspaceSettings = async (): Promise<WorkspaceSettings> => {
    return new Promise(resolve => setTimeout(() => resolve(WORKSPACE_SETTINGS), 50));
}

export const updateWorkspaceSettings = async (settings: WorkspaceSettings): Promise<WorkspaceSettings> => {
    WORKSPACE_SETTINGS = settings;
    localStorage.setItem('leadts_workspace_settings', JSON.stringify(settings));
    return new Promise(resolve => setTimeout(() => resolve({ ...WORKSPACE_SETTINGS }), 100));
}

export const cycleTheme = async (): Promise<void> => {
    const newTheme = WORKSPACE_SETTINGS.theme === 'dark' ? 'light' : 'dark';
    WORKSPACE_SETTINGS = { ...WORKSPACE_SETTINGS, theme: newTheme };
    const event = new CustomEvent('theme-change', { detail: { primary_color: WORKSPACE_SETTINGS.primary_color, theme: newTheme } });
    window.dispatchEvent(event);
    localStorage.setItem('leadts_workspace_settings', JSON.stringify(WORKSPACE_SETTINGS));
    return Promise.resolve();
}

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
        portal_access: { ...client.portal_access, is_enabled: false } 
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

export const createCampaign = async (campaignData: Partial<Campaign> & { client_id: string, name: string, templateCampaignId?: string }): Promise<Campaign> => {
    let settings = {
        active_system_fields: ['full_name', 'email', 'phone'],
        public_system_fields: ['full_name'],
        custom_fields: [],
        pipeline_stages: [...DEFAULT_STAGES],
        card_field_order: ['email'],
        card_primary_field: 'full_name',
        discovered_fields: [],
        integrations: { ...DEFAULT_INTEGRATIONS },
        client_view: { ...DEFAULT_CLIENT_VIEW }
    };

    // Use template settings if provided
    if (campaignData.templateCampaignId) {
        const template = MOCK_CAMPAIGNS.find(c => c.id === campaignData.templateCampaignId);
        if (template) {
            settings = JSON.parse(JSON.stringify(template.settings)); // Deep copy
        }
    }

    const newCampaign: Campaign = {
        id: `cam${Date.now()}`,
        client_id: campaignData.client_id,
        name: campaignData.name,
        status: campaignData.status || 'active',
        budget: campaignData.budget || 0,
        start_date: campaignData.start_date,
        end_date: campaignData.end_date,
        is_template: campaignData.is_template || false,
        stats: calcStats(0, 0, 0, 0, 0),
        settings: settings
    };
    MOCK_CAMPAIGNS.push(newCampaign);
    return new Promise(resolve => setTimeout(() => resolve({ ...newCampaign }), 200));
}

export const duplicateCampaign = async (campaignId: string, name?: string, isTemplate: boolean = false): Promise<Campaign | null> => {
    const source = MOCK_CAMPAIGNS.find(c => c.id === campaignId);
    if (!source) return null;

    // Deep copy everything
    const deepCopy = JSON.parse(JSON.stringify(source));

    // SANITIZATION: If making a template or copy, clear sensitive integration keys
    if (deepCopy.settings && deepCopy.settings.integrations) {
        if (deepCopy.settings.integrations.slack) {
            deepCopy.settings.integrations.slack.webhook_url = '';
            deepCopy.settings.integrations.slack.channel = '';
            // Note: We KEEP the event templates/enables (logic), just clear the connection
        }
        if (deepCopy.settings.integrations.email) {
            deepCopy.settings.integrations.email.recipients = []; 
        }
        if (deepCopy.settings.integrations.meta) {
            deepCopy.settings.integrations.meta.pixel_id = '';
            deepCopy.settings.integrations.meta.access_token = '';
            deepCopy.settings.integrations.meta.test_code = '';
        }
    }

    const newCampaign: Campaign = {
        ...deepCopy,
        id: `cam${Date.now()}`,
        name: name || `${source.name} (Copy)`,
        status: 'paused', // Default to paused when duplicating
        is_template: isTemplate,
        stats: calcStats(0, 0, 0, 0, 0), // Reset stats
    };
    
    MOCK_CAMPAIGNS.push(newCampaign);
    return new Promise(resolve => setTimeout(() => resolve(newCampaign), 200));
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
    triggerAutomations(lead, null); // Trigger new lead automation
    return new Promise(resolve => setTimeout(() => resolve(lead), 100));
};

export const updateLead = async (lead: Lead): Promise<Lead> => {
    const index = MOCK_LEADS.findIndex(l => l.id === lead.id);
    if (index !== -1) {
        const oldLead = MOCK_LEADS[index];
        MOCK_LEADS[index] = { ...lead };
        triggerAutomations(lead, oldLead); // Trigger update automations
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