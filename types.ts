export type FieldType = 'text' | 'number' | 'date' | 'select' | 'email' | 'tel' | 'currency';

export type Visibility = 'internal' | 'public';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  created_at: string;
}

export interface Session {
    user: User | null;
    role: 'admin' | 'client';
    clientId?: string;
}

export interface CustomFieldDefinition {
  key: string;
  name: string;
  type: FieldType;
  required: boolean;
  is_active: boolean; // Is it enabled for collection (Forms)?
  in_view: boolean;   // Deprecated in favor of global "Admin Only" visibility
  visibility: Visibility;
  options?: string[]; // For select type
  aliases?: string[]; // For CSV/Form Mapping (e.g. 'phone_number', 'mobile')
}

export interface SystemFieldDefinition {
  key: string;
  name: string;
  type: FieldType;
  aliases?: string[]; // For CSV/Form Mapping
}

export interface WorkspaceSettings {
  agency_name: string;
  logo_url: string;
  primary_color: string; // RGB string "20 184 166"
  language: 'en' | 'de';
  theme: 'dark' | 'light';
  onboarding_complete: boolean;
  tour_completed: boolean; 
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  type?: 'standard' | 'won' | 'lost' | 'appointment';
}

// --- INTEGRATION TYPES ---

export interface NotificationTemplate {
    enabled: boolean;
    template: string; // e.g. "New Lead: {full_name} - {phone}"
}

export interface SlackConfig {
    enabled: boolean;
    webhook_url?: string;
    channel?: string;
    events: {
        new_lead: NotificationTemplate;
        won_deal: NotificationTemplate;
        appointment_booked: NotificationTemplate; // NEW
        lead_lost: NotificationTemplate; // NEW
        lead_unreachable: NotificationTemplate; // NEW
    };
}

export interface EmailConfig {
    enabled: boolean;
    recipients: string[]; // List of emails
    events: {
        new_lead_alert: boolean;
        daily_digest: boolean;
        appointment_confirmation_customer: boolean; // NEW
        won_deal_alert: boolean; // NEW
    };
}

export interface MetaCapiConfig {
    enabled: boolean;
    pixel_id?: string;
    access_token?: string;
    test_code?: string; // For testing events in Events Manager
    events: {
        purchase_on_won: boolean; // Send 'Purchase' event when stage becomes 'won'
        lead_on_create: boolean; // Send 'Lead' event on creation
    };
}

export interface IntegrationSettings {
    slack: SlackConfig;
    email: EmailConfig;
    meta: MetaCapiConfig;
}

export interface ClientViewConfig {
    show_dashboard: boolean;
    show_kanban: boolean;
    show_list: boolean;
    show_kpi: boolean;
}

// -------------------------

export interface CampaignSettings {
  active_system_fields: string[]; 
  public_system_fields: string[]; 
  custom_fields: CustomFieldDefinition[];
  pipeline_stages: PipelineStage[];
  card_field_order: string[]; 
  card_primary_field: string; 
  discovered_fields?: string[]; 
  integrations?: IntegrationSettings;
  client_view: ClientViewConfig; // NEW: Controls what the client user sees
}

export interface Lead {
  id: string;
  campaign_id: string;
  stage_id: string;
  data: Record<string, any>; 
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  client_id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  is_template?: boolean;
  start_date?: string;
  end_date?: string;
  budget?: number;
  settings: CampaignSettings;
  stats: {
    revenue: number;
    spend: number;
    leads: number;
    appointments: number;
    sales: number;
    roas: number;
  };
}

export interface Client {
  id: string;
  name: string;
  logo: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  status: 'active' | 'inactive';
  notes?: string;
  portal_access?: {
      email?: string;
      password?: string;
      is_enabled: boolean;
      can_view_dashboard?: boolean; // Controls dashboard visibility for this client
  };
}

export const SYSTEM_FIELDS: SystemFieldDefinition[] = [
  { key: 'title', name: 'Title', type: 'text', aliases: ['job_title', 'position'] },
  { key: 'full_name', name: 'Full Name', type: 'text', aliases: ['name', 'customer_name', 'client', 'full_name'] },
  { key: 'email', name: 'Email', type: 'email', aliases: ['e-mail', 'mail_address', 'email_address'] },
  { key: 'phone', name: 'Phone', type: 'tel', aliases: ['mobile', 'cell', 'phone_number', 'telephone'] },
  { key: 'revenue', name: 'Revenue', type: 'currency', aliases: ['value', 'deal_value', 'amount'] },
  { key: 'source', name: 'Source', type: 'text', aliases: ['utm_source', 'referrer', 'platform'] },
  { key: 'due_date', name: 'Due Date', type: 'date', aliases: ['closing_date'] },
];

export const FACEBOOK_PRESETS = [
  'id', 'created_time', 'ad_id', 'ad_name', 'adset_id', 'adset_name', 
  'campaign_id', 'campaign_name', 'form_id', 'form_name', 'is_organic', 'platform', 'lead_status'
];