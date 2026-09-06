import { AuthResponse, LoginAuditLog, LoginCredentials, UserProfile } from '../types/auth';
import { ApiError } from './api';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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

      // Verify portal authorization
      if (userData.portal !== portal) {
        await signOut(auth);
        recordAuditLog({ portal, identifier, facilityCode, status: 'FAILED' });
        throw new ApiError(
          `Access Denied: Account is authorized for ${userData.portal.toUpperCase()} portal, not ${portal.toUpperCase()}.`,
          403,
          'ROLE_MISMATCH'
        );
      }

      // Verify facility code
      if (userData.facilityCode?.toUpperCase() !== facilityCode.trim().toUpperCase()) {
        await signOut(auth);
        recordAuditLog({ portal, identifier, facilityCode, status: 'FAILED' });
        throw new ApiError('Invalid facility or department code for this account.', 401);
      }

      // Login success
      recordAuditLog({
        portal,
        identifier,
        facilityCode,
        status: 'SUCCESS'
      });

      const token = await firebaseUser.getIdToken();

      const userProfile: UserProfile = {
        ...userData.profile,
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        lastLoginAt: new Date().toISOString()
      };

      return {
        success: true,
        user: userProfile,
        token,
        expiresIn: 3600, // Firebase tokens typically last 1 hour
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
        return {
          ...userData.profile,
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          lastLoginAt: new Date().toISOString()
        };
      }
      return null;
    } catch {
      return null;
    }
  }
};
