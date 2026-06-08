import { useRole } from '../contexts/RoleContext';

export function usePermission() {
  const { role, hasFeatureAccess, hasPageAccess } = useRole();

  return {
    role,
    canAccessPage: (path: string) => hasPageAccess(path),
    canAccessFeature: (feature: string) => hasFeatureAccess(feature),
  };
}

export default usePermission;
