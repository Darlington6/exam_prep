/**
 * useAuth Hook
 *
 * Convenience hook for consuming the AuthContext. Must be called within
 * a component wrapped by <AuthProvider>. Returns the full auth state
 * including user, login, register, logout, and loading status.
 */
import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from './AuthContext';

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
