'use client';
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { useUserProfile } from '../../contexts/userProfileContext';
import { ScrollArea } from "../../components/ui/scroll-area";
import { createClient } from '@supabase/supabase-js';
import {
  Home, Users, Pill, AlertTriangle, Shield, FileText, User2Icon,Heart,Settings,
  CreditCard, TrendingUp, NetworkIcon, Activity, Search, Bell, Hospital,
  ChevronDown, ChevronRight, Menu, X, RefreshCw, CheckCircle, Stethoscope,
  Briefcase, UserCheck, ClipboardList
} from 'lucide-react';


const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

// Privileged users who can switch roles regardless of their current role
const PRIVILEGED_USERS = [
  'user_2x28eQAIUeOQZCEiGyzv9Fru9tD',
  'user_37njudBcKIDE3UjP05EIwMfJCD0'
];

// Complete rolesByDivision object
const rolesByDivision = {
  DD: [
    
     { 
      id: 'IntakeCoordinator', 
      name: 'Intake Coordinator', 
      permissions: [
        'dashboard_view', 'dashboard_edit',
        'individuals_admin',
        'incidents_view',
        'billing_report_view', 'billing_report_edit',
        'data_privacy_view', 'data_privacy_edit',
        'report_view', 'report_edit',
        'billing_view', 'billing_edit',
        'analytics_view'
      ]
    },
   { 
  id: 'DSP_DD', 
  name: 'Direct Support Professional (DSP)', 
  permissions: [
    'dashboard_view',
    'individuals_view', 'individuals_edit',
   'daily_notes_view', 'daily_notes_create', 'daily_notes_edit', 'daily_notes_delete',  // ✅ ADDED
    'medications_view', 'medications_edit', 'mar',
    'incidents_view', 'incidents_edit', 'incidents',
    'view_plans'
  ]
},
{ 
  id: 'HouseManager_DD', 
  name: 'House Manager', 
  permissions: [
    'dashboard_view', 'dashboard_edit',
    'individuals_view', 'individuals_edit',
    'daily_notes_view', 'daily_notes_create', 'daily_notes_edit', 'daily_notes_delete',  // ✅ ADDED
    'medications_view', 'medications_edit',
    'incidents_view', 'incidents_edit',
    'staff_admin',
    'report_view', 'report_edit',
    'analytics_view',
    'view_plans'
  ]
},
{ 
  id: 'MAS_Nurse', 
  name: 'MAS Nurse', 
  permissions: [
    'dashboard_view', 'dashboard_edit',
    'individuals_view', 'individuals_edit',
    'daily_notes_view', 'daily_notes_create', 'daily_notes_edit', 'daily_notes_delete',  // ✅ ADDED
    'medications_admin', 'mar_full', 'approve_mar',
    'incidents_view', 'incidents_edit',
    'report_view', 'report_edit',
    'analytics_view',
    'view_plans'
  ]
},
{ 
  id: 'BillingStaff', 
  name: 'Billing Staff', 
  permissions: [
    'dashboard_view',
    'individuals_view',
    'daily_notes_view',  // ✅ ADDED - view only, no create/edit/delete
    'incidents_view',
    'billing_report_admin',
    'report_admin',
    'billing_admin',
    'analytics_admin',
    'view_plans'
  ]
},
{ 
  id: 'QDDP', 
  name: 'QDDP/Program Director', 
  permissions: [
    'dashboard_admin',
    'individuals_admin',
    'daily_notes_view', 'daily_notes_create', 'daily_notes_edit', 'daily_notes_delete', 'daily_notes_approve',  // ✅ ADDED
    'medications_admin',
    'incidents_admin',
    'billing_report_admin',
    'staff_admin',
    'data_privacy_admin',
    'report_admin',
    'foresight_engine_admin',
    'user_foresight_admin',
    'billing_admin',
    'analytics_admin',
    'plans', 'edit_plans', 'view_plans',
    'hcbs_dashboard'
  ]
},
  
    { 
      id: 'IntakeCoordinator', 
      name: 'Intake Coordinator', 
      permissions: [
        'dashboard_view', 'dashboard_edit',
        'individuals_admin',
        'incidents_view',
        'billing_report_view', 'billing_report_edit',
        'data_privacy_view', 'data_privacy_edit',
        'report_view', 'report_edit',
        'billing_view', 'billing_edit',
        'analytics_view'
      ]
    },
   
 
    
    
    
    { 
      id: 'SystemAdmin', 
      name: 'System Administrator', 
      permissions: ['full_access', 'admin', 'system_admin']
    },
    { 
      id: 'ExecDirector', 
      name: 'Executive Director', 
      permissions: ['full_access', 'admin', 'all_divisions', 'system_oversight']
    }
  ],
  MI: [
    { 
      id: 'MI_Staff', 
      name: 'Residential MI Staff', 
      permissions: [
        'dashboard_view',
        'individuals_view', 'individuals_edit',
        'medications_view',
        'incidents_view', 'incidents_edit'
      ]
    },
    { 
      id: 'Therapist_MI', 
      name: 'Therapist/Clinician', 
      permissions: [
        'dashboard_view', 'dashboard_edit',
        'individuals_view', 'individuals_edit',
        'plans', 'edit_plans', 'view_plans',
        'incidents_view',
        'report_view', 'report_edit'
      ]
    },
    { 
      id: 'Psychiatrist', 
      name: 'Psychiatrist', 
      permissions: [
        'dashboard_view', 'dashboard_edit',
        'individuals_view', 'individuals_edit',
        'medications_admin', 'mar_full',
        'plans', 'edit_plans', 'view_plans',
        'incidents_view',
        'report_view', 'report_edit'
      ]
    },
    { 
      id: 'MI_Supervisor', 
      name: 'Clinical Supervisor', 
      permissions: [
        'dashboard_admin',
        'individuals_admin',
        'medications_view', 'medications_edit',
        'incidents_admin', 'approve_incidents', 'review_incidents',
        'report_admin',
        'analytics_view', 'analytics_edit'
      ]
    },
    { 
      id: 'MI_PeerSupport', 
      name: 'Certified Peer Specialist', 
      permissions: [
        'dashboard_view',
        'individuals_view', 'individuals_edit',
        'incidents_view',
        'report_view'
      ]
    },
    { 
      id: 'ExecDirector', 
      name: 'Executive Director', 
      permissions: ['full_access', 'admin', 'all_divisions', 'system_oversight']
    }
  ],
  SUD: [
    { 
      id: 'SUD_Counselor', 
      name: 'SUD Counselor', 
      permissions: [
        'dashboard_view', 'dashboard_edit',
        'individuals_view', 'individuals_edit',
        'plans', 'edit_plans', 'view_plans',
        'incidents_view',
        'report_view', 'report_edit'
      ]
    },
    { 
      id: 'SUD_PeerSupport', 
      name: 'Recovery Coach', 
      permissions: [
        'dashboard_view',
        'individuals_view', 'individuals_edit',
        'incidents_view',
        'report_view'
      ]
    },
    { 
      id: 'Nurse_SUD', 
      name: 'SUD Nurse', 
      permissions: [
        'dashboard_view', 'dashboard_edit',
        'individuals_view', 'individuals_edit',
        'medications_admin', 'mar_full',
        'incidents_view', 'incidents_edit',
        'report_view', 'report_edit'
      ]
    },
    { 
      id: 'MAT_Staff', 
      name: 'MAT Clinic Staff', 
      permissions: [
        'dashboard_view', 'dashboard_edit',
        'individuals_view', 'individuals_edit',
        'medications_admin', 'mar_full',
        'report_view', 'report_edit'
      ]
    },
    { 
      id: 'SUD_Director', 
      name: 'Program Director', 
      permissions: [
        'dashboard_admin',
        'individuals_admin',
        'medications_admin',
        'incidents_admin',
        'billing_report_admin',
        'report_admin',
        'billing_admin',
        'analytics_admin'
      ]
    },
    { 
      id: 'ExecDirector', 
      name: 'Executive Director', 
      permissions: ['full_access', 'admin', 'all_divisions', 'system_oversight']
    }
  ],
  PEER: [
    { 
      id: 'DD_PeerMentor', 
      name: 'DD Peer Mentor', 
      permissions: [
        'dashboard_view',
        'individuals_view', 'individuals_edit',
        'report_view'
      ]
    },
    { 
      id: 'MI_CPS', 
      name: 'MI Certified Peer Specialist', 
      permissions: [
        'dashboard_view',
        'individuals_view', 'individuals_edit',
        'incidents_view',
        'report_view'
      ]
    },
    { 
      id: 'SUD_PeerRecovery', 
      name: 'SUD Peer Recovery Specialist', 
      permissions: [
        'dashboard_view',
        'individuals_view', 'individuals_edit',
        'incidents_view',
        'report_view'
      ]
    },
    { 
      id: 'ExecDirector', 
      name: 'Executive Director', 
      permissions: ['full_access', 'admin', 'all_divisions', 'system_oversight']
    }
  ]
};

// Icon mapping for different roles
const getRoleIcon = (roleId) => {
  const iconMap = {
    'DSP_DD': Users,
    'HouseManager_DD': Home,
    'QDDP': Shield,
    'MAS_Nurse': Activity,
     'IntakeCoordinator': ClipboardList,
    'IntakeCoordinator': ClipboardList,
    'BillingStaff': CreditCard,
    'SystemAdmin': Settings,
    'ExecDirector': Shield,
    'MI_Staff': Users,
    'Therapist_MI': Stethoscope,
    'Psychiatrist': Activity,
    'MI_Supervisor': Shield,
    'MI_PeerSupport': UserCheck,
    'SUD_Counselor': Briefcase,
    'SUD_PeerSupport': UserCheck,
    'Nurse_SUD': Activity,
    'MAT_Staff': Pill,
    'SUD_Director': Shield,
    'DD_PeerMentor': UserCheck,
    'MI_CPS': UserCheck,
    'SUD_PeerRecovery': UserCheck
  };
  return iconMap[roleId] || Users;
};

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const { userProfile, refreshProfile, getModuleAccess } = useUserProfile();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState('DD');

  // Check if user has role switching privileges
  const canSwitchRoles = user && (
    PRIVILEGED_USERS.includes(user.id) || 
    userProfile?.role_id === 'ExecDirector' || 
    userProfile?.permissions?.includes('system_oversight')
  );

 

  const handleRoleSwitch = async (newRoleId, division) => {
    try {
      setSwitchingRole(true);
      
      // Find the role data from rolesByDivision
      const roleData = rolesByDivision[division]?.find(r => r.id === newRoleId);
      
      if (!roleData) {
        alert('Role configuration not found');
        return;
      }

      // Update user profile with new role
      const { error } = await supabase
        .from('user_profiles')
        .update({
          role_id: newRoleId,
          role_name: roleData.name,
          permissions: roleData.permissions,
          division: division,
          updated_at: new Date().toISOString()
        })
        .eq('clerk_user_id', user.id);

      if (error) throw error;

      // Refresh the profile
      await refreshProfile();
      
      setShowRoleSwitcher(false);
      alert(`Successfully switched to ${roleData.name} (${division} Division)`);
      
      // Refresh the page to apply new permissions
      window.location.reload();
    } catch (error) {
      console.error('Error switching role:', error);
      alert('Error switching role. Please try again.');
    } finally {
      setSwitchingRole(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null, path: '/dashboard', module: 'dashboard' },
    { id: 'individual', icon: Users, label: 'Individuals', badge: null, path: '/dashboard/individual', module: 'individuals' },
    { id: 'medicine', icon: Pill, label: 'Medications', badge: null, path: '/dashboard/medicine', module: 'medications' },
    { id: 'discharge', icon: Hospital, label: 'Discharge', badge: null, path: '/dashboard/discharge', module: 'discharge' },
    { id: 'incident', icon: AlertTriangle, label: 'Incidents', badge: '3', path: '/dashboard/incident', module: 'incidents' },
    { id: 'bill', icon: Shield, label: 'Billing Report', badge: 'NEW', path: '/dashboard/bill', module: 'billing_report' },
    { id: 'staff', icon: User2Icon, label: 'Add Staff', badge: 'NEW', path: '/dashboard/staff', module: 'staff' },
    { id: 'privacy', icon: Shield, label: 'Data Privacy', badge: 'NEW', path: '/dashboard/privacy', module: 'data_privacy' },
    { id: 'report', icon: FileText, label: 'Report', badge: 'NEW', path: '/dashboard/report', module: 'report' },
    { id: 'engine', icon: Pill, label: 'Foresight Engine', badge: 'NEW', path: '/dashboard/engine', module: 'foresight_engine' },
    { id: 'intelligence', icon: NetworkIcon, label: 'User Foresight', badge: 'NEW', path: '/dashboard/intelligence', module: 'user_foresight' },
    { id: 'billing', icon: CreditCard, label: 'Billing', badge: null, path: '/dashboard/billing', module: 'billing' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', badge: null, path: '/dashboard/analytics', module: 'analytics' }
  ];


  


  const NavBar = () => (
    <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-900/20 backdrop-blur-xl border-b border-slate-800/50 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-2xl">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-pulse">
              <Activity className="text-white" size={26} />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
              CareBridge Pro
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">IPMS Aligned EMR</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm rounded-2xl px-5 py-2.5 w-96 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
          <Search size={18} className="text-emerald-400" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
          />
          <kbd className="px-2 py-0.5 text-xs bg-slate-700 rounded text-slate-400 font-mono">⌘K</kbd>
        </div>
        
        <button className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105 group">
          <Bell size={20} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-lime-500 to-green-600 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
        </button>
        
        <div className="relative flex items-center gap-3 pl-4 border-l border-slate-700/50">
          <div 
            onClick={() => canSwitchRoles && setShowRoleSwitcher(!showRoleSwitcher)}
            className={`flex items-center gap-3 ${canSwitchRoles ? 'cursor-pointer hover:bg-white/5' : ''} rounded-xl p-2 transition-all duration-300 group`}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                {userProfile?.fullname || 'User'}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-400 font-medium">
                  {userProfile?.role_name || 'Staff'}
                </p>
                {canSwitchRoles && (
                  <RefreshCw size={12} className="text-emerald-400" />
                )}
              </div>
            </div>
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/50">
                <UserButton afterSignOutUrl="/" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
            </div>
            {canSwitchRoles && (
              <ChevronDown size={16} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
            )}
          </div>

          {/* Enhanced Role Switcher Dropdown with All Roles */}
          {canSwitchRoles && showRoleSwitcher && (
            <div className="absolute top-full right-0 mt-2 w-[450px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border-b border-slate-700">
                <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                  <Shield size={16} className="text-purple-400" />
                  {PRIVILEGED_USERS.includes(user?.id) ? 'Privileged Role Switcher' : 'Executive Role Switcher'}
                </h3>
                <p className="text-slate-400 text-xs">View the system as any role across all divisions</p>
              </div>

              {/* Division Tabs */}
              <div className="flex border-b border-slate-700 bg-slate-800/50">
                {Object.keys(rolesByDivision).map((division) => (
                  <button
                    key={division}
                    onClick={() => setSelectedDivision(division)}
                    className={`flex-1 px-4 py-3 text-xs font-bold transition-all ${
                      selectedDivision === division
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    {division}
                  </button>
                ))}
              </div>

              {/* Roles List */}
              <ScrollArea className="w-full">
                <div className="p-4 space-y-2 max-h-[400px]">
                  {rolesByDivision[selectedDivision]?.map((role) => {
                    const Icon = getRoleIcon(role.id);
                    const isCurrentRole = userProfile?.role_id === role.id && userProfile?.division === selectedDivision;
                    
                    return (
                      <button
                        key={role.id}
                        onClick={() => !isCurrentRole && handleRoleSwitch(role.id, selectedDivision)}
                        disabled={isCurrentRole || switchingRole}
                        className={`w-full p-3 rounded-lg transition-all text-left flex items-center justify-between ${
                          isCurrentRole
                            ? 'bg-emerald-600 text-white cursor-default'
                            : switchingRole
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-800 hover:bg-slate-700 text-white hover:scale-[1.02]'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isCurrentRole ? 'bg-white/20' : 'bg-slate-700'
                          }`}>
                            <Icon size={18} className={isCurrentRole ? 'text-white' : 'text-emerald-400'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{role.name}</p>
                            <p className="text-xs text-slate-400 truncate">
                              {role.permissions.length} permissions • {selectedDivision}
                            </p>
                          </div>
                        </div>
                        {isCurrentRole && (
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs bg-white/20 px-2 py-1 rounded">Active</span>
                            <CheckCircle size={16} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* Footer */}
              <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Current Role: </span>
                    <span className="text-emerald-400 font-semibold">{userProfile?.role_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Division: </span>
                    <span className="text-purple-400 font-semibold">{userProfile?.division}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-900/10 border-r border-slate-800/50 transition-all duration-300 flex flex-col backdrop-blur-xl h-screen`}>
      <div className="p-6 border-b border-slate-800/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="text-slate-300 font-semibold">System Online</span>
          </div>
          <div className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
            <span className="text-emerald-400 text-xs font-bold">v2.0</span>
          </div>
        </div>
        
        {/* Role Badge */}
        {canSwitchRoles && (
          <div className="mb-4 p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Shield className="text-purple-400" size={14} />
              <span className="text-xs text-purple-300 font-bold">
                {PRIVILEGED_USERS.includes(user?.id) ? 'PRIVILEGED ACCESS' : 'EXEC ACCESS'}
              </span>
            </div>
          </div>
        )}
        
        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Daily Progress</span>
            <span className="text-xs text-emerald-400 font-bold">87%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-1000" style={{width: '87%'}}></div>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="mb-2 px-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Main Menu</span>
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path || 
            (item.path !== '/dashboard' && pathname.startsWith(item.path + '/'));
          
          // Get access level for this module
          const accessLevel = getModuleAccess ? getModuleAccess(item.module) : 'none';
          const hasAccess = accessLevel !== 'none';
          
          if (!hasAccess) return null; // Hide menu items without access
          
          return (
            <button
              key={item.id}
              onClick={() => {
                router.push(item.path);
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-2 transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/50 scale-105' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white hover:scale-105'
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-500/20 animate-pulse"></div>
              )}
              <Icon size={20} className={`relative z-10 ${isActive ? 'animate-pulse' : ''}`} />
              <span className="font-semibold relative z-10 flex-1 text-left">{item.label}</span>
              
              {/* Access Level Indicator */}
              {!isActive && accessLevel && (
                <span className="relative z-10 px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-400">
                  {accessLevel.toUpperCase()}
                </span>
              )}
              
              {item.badge && (
                <span className={`relative z-10 px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive 
                    ? 'bg-white/20 text-white' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight size={16} className="relative z-10 animate-pulse" />}
            </button>
          );
        })}
      </ScrollArea>
      
      <div className="p-4 border-t border-slate-800/50 space-y-3 flex-shrink-0">
        <div className="bg-gradient-to-br from-emerald-900/30 via-teal-900/30 to-green-900/30 rounded-xl p-4 border border-emerald-500/30 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-emerald-400" size={18} />
              <p className="text-sm font-bold text-white">IPMS Certified</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">Alabama DD Compliant System</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}

