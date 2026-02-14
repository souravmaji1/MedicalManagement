// utils/permissions.js

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard_view',
  DASHBOARD_EDIT: 'dashboard_edit',
  DASHBOARD_ADMIN: 'dashboard_admin',
  
  // Individuals
  INDIVIDUALS_VIEW: 'individuals_view',
  INDIVIDUALS_EDIT: 'individuals_edit',
  INDIVIDUALS_ADMIN: 'individuals_admin',
  
  // Medications
  MEDICATIONS_VIEW: 'medications_view',
  MEDICATIONS_EDIT: 'medications_edit',
  MEDICATIONS_ADMIN: 'medications_admin',
  MAR_CREATE: 'mar',
  MAR_APPROVE: 'approve_mar',
  MAR_FULL: 'mar_full',
  
  // Incidents
  INCIDENTS_VIEW: 'incidents_view',
  INCIDENTS_CREATE: 'incidents',
  INCIDENTS_EDIT: 'incidents_edit',
  INCIDENTS_ADMIN: 'incidents_admin',
  INCIDENTS_APPROVE: 'approve_incidents',
  INCIDENTS_REVIEW: 'review_incidents',
  
  // Billing Report
  BILLING_REPORT_VIEW: 'billing_report_view',
  BILLING_REPORT_EDIT: 'billing_report_edit',
  BILLING_REPORT_ADMIN: 'billing_report_admin',
  
  // Add Staff
  STAFF_ADMIN: 'staff_admin',
  
  // Data Privacy
  DATA_PRIVACY_VIEW: 'data_privacy_view',
  DATA_PRIVACY_EDIT: 'data_privacy_edit',
  DATA_PRIVACY_ADMIN: 'data_privacy_admin',
  
  // Report
  REPORT_VIEW: 'report_view',
  REPORT_EDIT: 'report_edit',
  REPORT_ADMIN: 'report_admin',
  
  // Foresight Engine
  FORESIGHT_ENGINE_VIEW: 'foresight_engine_view',
  FORESIGHT_ENGINE_EDIT: 'foresight_engine_edit',
  FORESIGHT_ENGINE_ADMIN: 'foresight_engine_admin',
  
  // User Foresight
  USER_FORESIGHT_VIEW: 'user_foresight_view',
  USER_FORESIGHT_EDIT: 'user_foresight_edit',
  USER_FORESIGHT_ADMIN: 'user_foresight_admin',
  
  // Billing
  BILLING_VIEW: 'billing_view',
  BILLING_EDIT: 'billing_edit',
  BILLING_ADMIN: 'billing_admin',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics_view',
  ANALYTICS_EDIT: 'analytics_edit',
  ANALYTICS_ADMIN: 'analytics_admin',
  
  // Legacy permissions (keeping for backward compatibility)
  DAILY_NOTES_CREATE: 'daily_notes',
  DAILY_NOTES_APPROVE: 'approve_notes',
  DAILY_NOTES_VIEW: 'view_notes',
  PLANS_CREATE: 'plans',
  PLANS_EDIT: 'edit_plans',
  PLANS_VIEW: 'view_plans',
  HCBS_DASHBOARD: 'hcbs_dashboard',
  
  // Full Access
  FULL_ACCESS: 'full_access',
  ADMIN: 'admin',
  
  // Discharge
  DISCHARGE_VIEW: 'discharge_view',
  DISCHARGE_EDIT: 'discharge_edit',
  DISCHARGE_ADMIN: 'discharge_admin'
};

// Access Levels
export const ACCESS_LEVELS = {
  NONE: 'none',
  VIEW: 'view',
  EDIT: 'edit',
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

// Check module access level
export const getModuleAccessLevel = (userPermissions, modulePermissions) => {
  if (!userPermissions || !Array.isArray(userPermissions)) return ACCESS_LEVELS.NONE;
  if (userPermissions.includes('full_access')) return ACCESS_LEVELS.ADMIN;
  
  if (userPermissions.includes(modulePermissions.admin)) return ACCESS_LEVELS.ADMIN;
  if (userPermissions.includes(modulePermissions.edit)) return ACCESS_LEVELS.EDIT;
  if (userPermissions.includes(modulePermissions.view)) return ACCESS_LEVELS.VIEW;
  
  return ACCESS_LEVELS.NONE;
};

// Module permissions mapping
export const MODULE_PERMISSIONS = {
  dashboard: {
    view: PERMISSIONS.DASHBOARD_VIEW,
    edit: PERMISSIONS.DASHBOARD_EDIT,
    admin: PERMISSIONS.DASHBOARD_ADMIN
  },
  individuals: {
    view: PERMISSIONS.INDIVIDUALS_VIEW,
    edit: PERMISSIONS.INDIVIDUALS_EDIT,
    admin: PERMISSIONS.INDIVIDUALS_ADMIN
  },
  medications: {
    view: PERMISSIONS.MEDICATIONS_VIEW,
    edit: PERMISSIONS.MEDICATIONS_EDIT,
    admin: PERMISSIONS.MEDICATIONS_ADMIN
  },
  incidents: {
    view: PERMISSIONS.INCIDENTS_VIEW,
    edit: PERMISSIONS.INCIDENTS_EDIT,
    admin: PERMISSIONS.INCIDENTS_ADMIN
  },
  billing_report: {
    view: PERMISSIONS.BILLING_REPORT_VIEW,
    edit: PERMISSIONS.BILLING_REPORT_EDIT,
    admin: PERMISSIONS.BILLING_REPORT_ADMIN
  },
  report: {
    view: PERMISSIONS.REPORT_VIEW,
    edit: PERMISSIONS.REPORT_EDIT,
    admin: PERMISSIONS.REPORT_ADMIN
  },
  foresight_engine: {
    view: PERMISSIONS.FORESIGHT_ENGINE_VIEW,
    edit: PERMISSIONS.FORESIGHT_ENGINE_EDIT,
    admin: PERMISSIONS.FORESIGHT_ENGINE_ADMIN
  },
  user_foresight: {
    view: PERMISSIONS.USER_FORESIGHT_VIEW,
    edit: PERMISSIONS.USER_FORESIGHT_EDIT,
    admin: PERMISSIONS.USER_FORESIGHT_ADMIN
  },
  billing: {
    view: PERMISSIONS.BILLING_VIEW,
    edit: PERMISSIONS.BILLING_EDIT,
    admin: PERMISSIONS.BILLING_ADMIN
  },
  analytics: {
    view: PERMISSIONS.ANALYTICS_VIEW,
    edit: PERMISSIONS.ANALYTICS_EDIT,
    admin: PERMISSIONS.ANALYTICS_ADMIN
  },
  data_privacy: {
    view: PERMISSIONS.DATA_PRIVACY_VIEW,
    edit: PERMISSIONS.DATA_PRIVACY_EDIT,
    admin: PERMISSIONS.DATA_PRIVACY_ADMIN
  },
  discharge: {
    view: PERMISSIONS.DISCHARGE_VIEW,
    edit: PERMISSIONS.DISCHARGE_EDIT,
    admin: PERMISSIONS.DISCHARGE_ADMIN
  },
  staff: {
  view: PERMISSIONS.STAFF_ADMIN,  // There's only admin level for staff
  edit: PERMISSIONS.STAFF_ADMIN,
  admin: PERMISSIONS.STAFF_ADMIN
},
   // ADD THIS - Plans module for HCBS Dashboard
  plans: {
    view: PERMISSIONS.PLANS_VIEW,
    edit: PERMISSIONS.PLANS_EDIT,
    admin: PERMISSIONS.PLANS_EDIT  // Use PLANS_EDIT as the highest level since there's no PLANS_ADMIN
  }
};