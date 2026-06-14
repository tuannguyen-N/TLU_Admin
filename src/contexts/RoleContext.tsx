import React, { createContext, useContext, useEffect, useState } from 'react';
import permissions from '../config/permissions';

type Role = 'ADMIN' | 'LECTURER' | 'STAFF' | null;

interface RoleContextValue {
  role: Role;
  setRole: (r: Role) => void;
  hasPageAccess: (path: string) => boolean;
  hasFeatureAccess: (feature: string) => boolean;
  initialized: boolean;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<Role>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('userInfo');
      if (raw) {
        const parsed = JSON.parse(raw as string);
        if (parsed) {
          if (parsed.role) {
            const normalizedRole = String(parsed.role).toUpperCase() as Role;
            setRoleState(normalizedRole);
            setInitialized(true);
            return;
          }
        }
      }
    } catch (err) {
      // ignore
    }
    setRoleState(null);
    setInitialized(true);
  }, []);

  const setRole = (r: Role) => {
    const normalized = r ? String(r).toUpperCase() as Role : null;
    setRoleState(normalized);
    try {
      const raw = localStorage.getItem('userInfo');
      if (raw) {
        const parsed = JSON.parse(raw as string);
        parsed.role = normalized;
        localStorage.setItem('userInfo', JSON.stringify(parsed));
      }
    } catch (err) {
      // ignore
    }
  };

  const normalize = (p: string) => p.replace(/\\/g, '/');

  const hasPageAccess = (path: string) => {
    if (!role) return false;
    const p = normalize(path);
    // match by longest prefix key: check if path starts with key
    const entries = Object.entries(permissions.pages).sort((a, b) => b[0].length - a[0].length);
    for (const [key, roles] of entries) {
      if (p === key || p.startsWith(key + '/') || p.startsWith(key + '?')) {
        return roles.includes(role);
      }
    }
    // default deny
    return false;
  };

  const hasFeatureAccess = (feature: string) => {
    if (!role) return false;
    if (!(feature in permissions.features)) return false;
    const allowed = permissions.features[feature as keyof typeof permissions.features];
    return allowed.includes(role);
  };

  return (
    <RoleContext.Provider value={{ role, setRole, hasPageAccess, hasFeatureAccess, initialized }}>
      {children}
    </RoleContext.Provider>
  );
};

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
