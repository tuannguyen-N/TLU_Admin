# Plan: Role-Based Access Control (RBAC) System

## TL;DR
Build a comprehensive RBAC system with:
- **Backend modification**: Include user role in LoginResponse
- **Frontend config**: JSON permission rules file defining which roles can access which pages/features
- **Global Role Context**: Provide role info across the app via React Context
- **Route & Component Protection**: Enhance ProtectedRoute for role-based access + create usePermission hook for feature-level checks
- **Permission Management**: Simple config file that can be updated anytime without code changes

## Implementation Steps

### Phase 1: Backend Changes (Prerequisite)
1. Modify `LoginResponse` to include user role
   - Add `role: 'admin' | 'lecturer' | 'staff'` field to response data
   - Ensure role is persisted in localStorage along with token

### Phase 2: Frontend Permission Configuration
2. Create `src/config/permissions.ts` with JSON-based permission rules
   - Define role-permission matrix for pages and features
   - Structure: `{ pages: { "/dashboard": ["admin", "lecturer", "staff"], ... }, features: { "view_payments": [...], ... } }`
   - This file is the single source of truth for customization

### Phase 3: Global Role Context
3. Create `src/contexts/RoleContext.tsx` and provider
   - Store user role from localStorage
   - Expose `useRole()` hook for accessing role anywhere
   - Provide helper functions: `hasPermission()`, `hasPageAccess()`, `hasFeatureAccess()`

### Phase 4: Enhanced Route Protection
4. Modify `src/components/ProtectedRoute.tsx`
   - Check both authentication AND role-based page permissions
   - Redirect unauthorized users to `/dashboard` or `/access-denied` page
   - Maintain backward compatibility with existing authenticated check

### Phase 5: Feature-Level Permission Control
5. Create `src/hooks/usePermission.ts`
   - Custom hook for checking feature-level permissions within pages
   - Components can conditionally render based on `hasFeatureAccess('feature_name')`

### Phase 6: Dynamic Sidebar/Navigation
6. Update `src/components/Navbar/Navbar.tsx` and `NavbarSimple.tsx`
   - Filter navigation menu items based on current user role
   - Only show links to pages user has access to

### Phase 7: Testing & Documentation
7. Create implementation guide + test all 3 role scenarios

## Relevant Files
- `src/config/permissions.ts` — **New** — Permission rules config (easily editable)
- `src/contexts/RoleContext.tsx` — **New** — Global role provider + helpers
- `src/hooks/usePermission.ts` — **New** — Feature-level permission hook
- `src/components/ProtectedRoute.tsx` — **Modify** — Add role-based checks
- `src/components/Navbar/Navbar.tsx` — **Modify** — Filter nav by role
- `src/services/auth/AuthCallback.tsx` — **Modify** — Extract role from LoginResponse
- `src/main.tsx` — **Modify** — Wrap with RoleProvider
- `src/config/api.ts` — **Verify** — Ensure API endpoints are correct
- Backend API `/api/v1/oauth2/login` — **Modify** — Return role in response

## Verification
1. Test login flow — verify role is received from backend and stored
2. Test each role (admin, lecturer, staff) — verify correct pages are visible/hidden
3. Test unauthorized access — verify trying to access restricted page redirects
4. Test feature-level permissions — verify conditional rendering works
5. Test permission config changes — modify permissions.ts and verify changes take effect without rebuild (hot reload)
6. Test navigation filtering — verify navbar only shows accessible pages for each role

## Decisions & Assumptions
- **Permission storage**: Frontend config (easy to change) rather than hardcoded
- **Three roles only**: admin, lecturer, staff (easily extendable if needed)
- **Access denied page**: Optional `/access-denied` page or redirect to dashboard
- **Page structure**: Assumes React Router v6 with routes already in place
- **State persistence**: Role info persists in localStorage from LoginResponse
- **No real-time permission changes**: Permissions checked at component render time; permission config changes require page refresh

## Further Considerations
1. **Admin UI for Permissions**: Do you want to build an admin panel later to modify permissions via UI instead of editing config file?
2. **Permission Caching Strategy**: Should we cache permission checks in React Context to avoid repeated permission lookups?
3. **Feature flags vs Roles**: Should we also support feature flags (independent of roles) for gradual rollouts?
