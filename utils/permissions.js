// utils/permissions.js

export const PERMISSIONS = {
  // Daily Notes
  DAILY_NOTES_CREATE: 'daily_notes',
  DAILY_NOTES_APPROVE: 'approve_notes',
  DAILY_NOTES_VIEW: 'view_notes',
  
  // Incidents
  INCIDENTS_CREATE: 'incidents',
  INCIDENTS_APPROVE: 'approve_incidents',
  INCIDENTS_REVIEW: 'review_incidents',
  
  // MAR
  MAR_CREATE: 'mar',
  MAR_APPROVE: 'approve_mar',
  MAR_FULL: 'mar_full',
  
  // Plans
  PLANS_CREATE: 'plans',
  PLANS_EDIT: 'edit_plans',
  PLANS_VIEW: 'view_plans',
  
  // Full Access
  FULL_ACCESS: 'full_access',
  
  // Reports
  REPORTS_VIEW: 'reports',
  REPORTS_LIMITED: 'reports_limited',
  
  // HCBS Dashboard
  HCBS_DASHBOARD: 'hcbs_dashboard',
  
  // Admin
  ADMIN: 'admin'
};

export const checkPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  
  // Full access overrides everything
  if (userPermissions.includes('full_access')) return true;
  
  return userPermissions.includes(requiredPermission);
};

export const checkAnyPermission = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  if (userPermissions.includes('full_access')) return true;
  
  return requiredPermissions.some(perm => userPermissions.includes(perm));
};

export const checkAllPermissions = (userPermissions, requiredPermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return false;
  if (userPermissions.includes('full_access')) return true;
  
  return requiredPermissions.every(perm => userPermissions.includes(perm));
};