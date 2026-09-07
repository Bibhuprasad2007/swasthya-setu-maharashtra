import { AuthResponse, LoginAuditLog, LoginCredentials, UserProfile } from '../types/auth';
import { ApiError } from './api';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AUDIT_LOGS_KEY = 'swasthya_audit_logs';

/**
 * Service to record authentication audit logs (stub for backend integration)
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
    // Also log in dev console for visibility
    if (import.meta.env.DEV) {
      console.info('[SwasthyaSetu Audit]', newLog);
    }
  } catch {
    // Gracefully handle storage errors
  }
}

/**
 * Main Authentication Service using Firebase
 */
export const authService = {
  /**
   * Authenticate user against Firebase Auth and verify details in Firestore
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { identifier, password, facilityCode, portal } = credentials;

    try {
      // 1. Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, identifier, password);
      const firebaseUser = userCredential.user;

      // 2. Verify Role and Facility in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await signOut(auth);
        recordAuditLog({ portal, identifier, facilityCode, status: 'FAILED' });
        throw new ApiError('User profile not found in database.', 404);
      }

      const userData = userDocSnap.data();

      // Verify active status
      if (userData.active === false || userData.isActive === false) {
        await signOut(auth);
        recordAuditLog({ portal, identifier, facilityCode, status: 'FAILED' });
        throw new ApiError('Account is deactivated. Please contact administration.', 403);
      }

      const normalizePortal = (p: string = '') => {
        const cleaned = p.trim().toUpperCase();
        if (cleaned === 'DOCTOR' || cleaned === 'HOSPITAL') return 'hospital';
        if (cleaned === 'LAB_TECH' || cleaned === 'LAB' || cleaned === 'LABORATORY') return 'laboratory';
        if (cleaned === 'PHARMACIST' || cleaned === 'PHARMACY') return 'pharmacy';
        if (cleaned === 'STATE_ADMIN' || cleaned === 'ADMIN') return 'admin';
        return cleaned.toLowerCase();
      };

      const userRoleRaw = userData.role || userData.portal || '';
      const userPortalNorm = normalizePortal(userRoleRaw);
      const reqPortalNorm = normalizePortal(portal);

      // Verify portal authorization
      if (userPortalNorm !== reqPortalNorm) {
        await signOut(auth);
        recordAuditLog({ portal, identifier, facilityCode, status: 'FAILED' });
        throw new ApiError(
          `Access Denied: Account is authorized for ${userRoleRaw.toUpperCase()} portal, not ${portal.toUpperCase()}.`,
          403,
          'ROLE_MISMATCH'
        );
      }

      // Verify facility code
      const rawUserFacility = 
        userData.facilityCode || 
        userData.facilityId ||
        userData.code || 
        userData.storeCode || 
        userData.deptCode || 
        '';

      const cleanCode = (s: string) => s.replace(/[\s\-_]/g, '').toUpperCase();
      const userFacility = cleanCode(rawUserFacility);
      const inputFacility = cleanCode(facilityCode);

      if (userFacility && inputFacility && userFacility !== inputFacility) {
        await signOut(auth);
        recordAuditLog({ portal, identifier, facilityCode, status: 'FAILED' });
        throw new ApiError(`Invalid facility or department code. Registered: "${rawUserFacility}"`, 401);
      }

      // Login success
      recordAuditLog({
        portal,
        identifier,
        facilityCode,
        status: 'SUCCESS'
      });

      const token = await firebaseUser.getIdToken();

      const resolvedFacility = rawUserFacility || facilityCode.trim().toUpperCase();

      const userProfile: UserProfile = {
        id: firebaseUser.uid,
        uid: firebaseUser.uid,
        name: userData.displayName || userData.name || firebaseUser.email?.split('@')[0] || 'User',
        displayName: userData.displayName || userData.name,
        email: firebaseUser.email || userData.email || '',
        role: reqPortalNorm as any,
        systemRole: (userRoleRaw.toUpperCase() as any),
        roleTitle: userData.roleTitle || userData.displayName || 'Authorized Officer',
        facilityId: resolvedFacility,
        facilityCode: resolvedFacility,
        facilityName: userData.facilityName || `${resolvedFacility} Facility`,
        district: userData.district || 'Maharashtra',
        state: userData.state || 'Maharashtra',
        permissions: userData.permissions || ['READ', 'WRITE'],
        lastLoginAt: new Date().toISOString()
      };

      return {
        success: true,
        user: userProfile,
        token,
        expiresIn: 3600,
        message: 'Authentication successful'
      };
    } catch (err: any) {
      recordAuditLog({
        portal,
        identifier,
        facilityCode,
        status: 'FAILED'
      });

      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        throw new ApiError('Invalid email or password. Please check your credentials.', 401);
      }

      throw err instanceof ApiError ? err : new ApiError(err.message || 'Login failed', 500);
    }
  },

  /**
   * Log out current session
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Firebase logout failed:', err);
    }
  },

  /**
   * Check active session
   */
  async getSession(): Promise<UserProfile | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const userRoleRaw = userData.role || userData.portal || '';
        const cleaned = userRoleRaw.trim().toUpperCase();
        let role = 'hospital';
        if (cleaned === 'DOCTOR' || cleaned === 'HOSPITAL') role = 'hospital';
        else if (cleaned === 'LAB_TECH' || cleaned === 'LAB' || cleaned === 'LABORATORY') role = 'laboratory';
        else if (cleaned === 'PHARMACIST' || cleaned === 'PHARMACY') role = 'pharmacy';
        else if (cleaned === 'STATE_ADMIN' || cleaned === 'ADMIN') role = 'admin';

        const rawUserFacility = userData.facilityCode || userData.facilityId || '';

        return {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          name: userData.displayName || userData.name || firebaseUser.email?.split('@')[0] || 'User',
          displayName: userData.displayName || userData.name,
          email: firebaseUser.email || '',
          role: role as any,
          facilityId: rawUserFacility,
          facilityCode: rawUserFacility,
          facilityName: userData.facilityName || 'Facility',
          district: userData.district || 'Maharashtra',
          state: userData.state || 'Maharashtra',
          permissions: userData.permissions || ['READ', 'WRITE'],
          lastLoginAt: new Date().toISOString()
        };
      }
      return null;
    } catch {
      return null;
    }
  }
};
