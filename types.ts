

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'email' | 'tel' | 'currency';

export type Visibility = 'internal' | 'public';

export interface CustomFieldDefinition {
  key: string;
  name: string;
  type: FieldType;
  required: boolean;
  is_active: boolean; // Is it enabled for collection (Forms)?
  in_view: boolean;   // Deprecated in favor of global "Admin Only" visibility, kept for backward comp if needed, but mostly unused now.
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
  onboarding_complete: boolean; // NEW: Track if user has finished setup
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  type?: 'standard' | 'won' | 'lost' | 'appointment';
}

export interface CampaignSettings {
  active_system_fields: string[]; 
  public_system_fields: string[]; // Fields visible to the client in their portal
  custom_fields: CustomFieldDefinition[];
  pipeline_stages: PipelineStage[];
  card_field_order: string[]; // Array of keys determining visual order on Kanban card body
  card_primary_field: string; // Key of the field used as the Card Title
  discovered_fields?: string[]; // NEW: Auto-detected keys from imports (Webhooks/CSV)
}

export interface Lead {
  id: string;
  campaign_id: string;
  stage_id: string;
  data: Record<string, any>; // Dynamic data based on fields
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  client_id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
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
  website?: string; // NEW: Domain / Website
  status: 'active' | 'inactive';
  notes?: string;
  // NEW: Portal Credentials
  portal_access?: {
      email?: string;
      password?: string;
      is_enabled: boolean;
  };
}

// Fixed System Fields Definition
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