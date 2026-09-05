import { AuthResponse, LoginAuditLog, LoginCredentials, UserProfile } from '../types/auth';
import { ApiError, request, USE_MOCK_AUTH } from './api';
import { MOCK_ACCOUNTS } from './mockAuthData';

const AUDIT_LOGS_KEY = 'swasthya_audit_logs';

/**
 * Service to record authentication audit logs (stub for SIH demo / backend integration)
 */
export function recordAuditLog(log: Omit<LoginAuditLog, 'timestamp'>): void {
  try {
    const existing = JSON.parse(sessionStorage.getItem(AUDIT_LOGS_KEY) || '[]');
    const newLog: LoginAuditLog = {
      ...log,
      timestamp: new Date().toISOString()
    };
    existing.unshift(newLog);
    sessionStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(existing.slice(0, 50)));
    // Also log in dev console for prototype visibility
    if (import.meta.env.DEV) {
      console.info('[SwasthyaSetu Audit]', newLog);
    }
  } catch {
    // Gracefully handle storage errors
  }
}

/**
 * Main Authentication Service
 */
export const authService = {
  /**
   * Authenticate user against selected healthcare portal
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { identifier, password, facilityCode, portal } = credentials;

    // Use mock auth simulation in prototype mode
    if (USE_MOCK_AUTH) {
      // Simulate network latency (400ms - 800ms) for realistic UX
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Sanitize inputs
      const cleanId = identifier.trim();
      const cleanCode = facilityCode.trim().toUpperCase();

      // Find matching mock account
      const matchedAccount = MOCK_ACCOUNTS.find(
        (acc) => acc.identifier.toUpperCase() === cleanId.toUpperCase()
      );

      if (!matchedAccount) {
        recordAuditLog({
          portal,
          identifier: cleanId,
          facilityCode: cleanCode,
          status: 'FAILED'
        });
        throw new ApiError('Invalid identification credentials or facility code.', 401);
      }

      // Check portal role authorization (Backend role verification simulation)
      if (matchedAccount.portal !== portal) {
        recordAuditLog({
          portal,
          identifier: cleanId,
          facilityCode: cleanCode,
          status: 'FAILED'
        });
        throw new ApiError(
          `Access Denied: Account is authorized for ${matchedAccount.portal.toUpperCase()} portal, not ${portal.toUpperCase()}.`,
          403,
          'ROLE_MISMATCH'
        );
      }

      // Check facility code
      if (matchedAccount.facilityCode.toUpperCase() !== cleanCode) {
        recordAuditLog({
          portal,
          identifier: cleanId,
          facilityCode: cleanCode,
          status: 'FAILED'
        });
        throw new ApiError('Invalid facility or department code for this account.', 401);
      }

      // Check password
      if (matchedAccount.password !== password) {
        recordAuditLog({
          portal,
          identifier: cleanId,
          facilityCode: cleanCode,
          status: 'FAILED'
        });
        throw new ApiError('Invalid password. Please check your credentials.', 401);
      }

      // Login success
      recordAuditLog({
        portal,
        identifier: cleanId,
        facilityCode: cleanCode,
        status: 'SUCCESS'
      });

      const userProfile: UserProfile = {
        ...matchedAccount.profile,
        lastLoginAt: new Date().toISOString()
      };

      return {
        success: true,
        user: userProfile,
        token: 'mock_jwt_session_' + Date.now(),
        expiresIn: 1800, // 30 minutes in seconds
        message: 'Authentication successful'
      };
    }

    // Production / Real Backend Endpoint: POST /api/auth/login
    try {
      const response = await request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: identifier.trim(),
          password,
          facilityCode: facilityCode.trim(),
          portal
        })
      });

      recordAuditLog({
        portal,
        identifier: identifier.trim(),
        facilityCode: facilityCode.trim(),
        status: 'SUCCESS'
      });

      return response;
    } catch (err: unknown) {
      recordAuditLog({
        portal,
        identifier: identifier.trim(),
        facilityCode: facilityCode.trim(),
        status: 'FAILED'
      });
      throw err;
    }
  },

  /**
   * Log out current session
   */
  async logout(): Promise<void> {
    if (USE_MOCK_AUTH) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return;
    }
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
  },

  /**
   * Check active session
   */
  async getSession(): Promise<UserProfile | null> {
    if (USE_MOCK_AUTH) {
      // Handled via AuthContext state / session store
      return null;
    }
    try {
      const response = await request<{ user: UserProfile }>('/auth/me');
      return response.user;
    } catch {
      return null;
    }
  }
};
