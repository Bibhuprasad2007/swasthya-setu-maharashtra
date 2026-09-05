export type PortalType = 'hospital' | 'laboratory' | 'pharmacy' | 'admin';

export interface PortalConfig {
  id: PortalType;
  titleKey: string;
  descriptionKey: string;
  identifierLabelKey: string;
  identifierPlaceholder: string;
  codeLabelKey: string;
  codePlaceholder: string;
  dashboardRoute: string;
  badge: string;
  themeColor: 'blue' | 'teal' | 'emerald' | 'cyan';
  capabilities: string[];
}

export interface LoginCredentials {
  identifier: string;
  password: string;
  facilityCode: string;
  portal: PortalType;
  rememberMe?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: PortalType;
  roleTitle: string;
  facilityCode: string;
  facilityName: string;
  district: string;
  state: string;
  permissions: string[];
  lastLoginAt: string;
}

export interface AuthResponse {
  success: boolean;
  user: UserProfile;
  token?: string;
  expiresIn?: number;
  message?: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  selectedPortal: PortalType;
  sessionExpiryTime: number | null;
}

export interface LoginAuditLog {
  timestamp: string;
  portal: PortalType;
  identifier: string;
  status: 'SUCCESS' | 'FAILED' | 'EXPIRED';
  ipAddress?: string;
  facilityCode: string;
}
