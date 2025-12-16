// CR AudioViz AI - Mortgage Rate Monitor
// Auth Context - Re-exports from CentralAuthContext for backward compatibility
// December 16, 2025

'use client';

// Re-export everything from CentralAuthContext
export { 
  CentralAuthProvider,
  CentralAuthProvider as AuthProvider,
  useCentralAuth,
  useCentralAuth as useAuth,
  useRequireAuth,
  useRequirePremium
} from './CentralAuthContext';
