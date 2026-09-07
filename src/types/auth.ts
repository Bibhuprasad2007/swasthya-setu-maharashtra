import { Timestamp } from 'firebase/firestore';

export type PortalType = 'hospital' | 'laboratory' | 'pharmacy' | 'admin';

export type UserRole = 'PATIENT' | 'DOCTOR' | 'LAB_TECH' | 'PHARMACIST' | 'STATE_ADMIN';

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
  uid?: string;
  name: string;
  displayName?: string;
  email: string;
  role: PortalType | UserRole;
  systemRole?: UserRole;
  roleTitle?: string;
  facilityId?: string;
  facilityCode: string;
  facilityName?: string;
  district?: string;
  state?: string;
  active?: boolean;
  permissions?: string[];
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

export interface FirestoreUserDocument {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  role: UserRole | string;
  facilityId?: string;
  facilityCode?: string;
  facilityName?: string;
  district?: string;
  department?: string;
  active?: boolean;
  isActive?: boolean;
  createdAt?: Timestamp | any;
  updatedAt?: Timestamp | any;
}
