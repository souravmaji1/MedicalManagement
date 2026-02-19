'use client'

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Users, Shield, Edit2, Trash2, Save, X, Search, Filter,
  ChevronDown, Loader2, UserCog, CheckCircle, AlertCircle,
  Mail, Phone, Building2, Award, RefreshCw, Plus, Eye,
  Activity, Zap, Star, TrendingUp, Lock, Unlock,
  UserPlus, Settings, BarChart3, Globe, Sparkles, MapPin, Home
} from 'lucide-react';
import { ScrollArea } from "../../components/ui/scroll-area";

const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const rolesByDivision = {
  DD: [
    { 
      id: 'DSP_DD', 
      name: 'Direct Support Professional (DSP)', 
      permissions: [
        'dashboard_view',
        'individuals_view', 'individuals_edit',
        'medications_view', 'medications_edit', 'mar',
        'incidents_view', 'incidents_edit', 'incidents'
      ]
    },
    { 
      id: 'HouseManager_DD', 
      name: 'House Manager', 
      permissions: [
        'dashboard_view', 'dashboard_edit',
        'individuals_view', 'individuals_edit',
        'medications_view', 'medications_edit',
        'incidents_view', 'incidents_edit',
        'staff_admin',
        'report_view', 'report_edit',
        'analytics_view'
      ]
    },
    { 
      id: 'QDDP', 
      name: 'QDDP/Program Director', 
      permissions: [
        'dashboard_admin',
        'individuals_admin',
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
      id: 'MAS_Nurse', 
      name: 'MAS Nurse', 
      permissions: [
        'dashboard_view', 'dashboard_edit',
        'individuals_view', 'individuals_edit',
        'medications_admin', 'mar_full', 'approve_mar',
        'incidents_view', 'incidents_edit',
        'report_view', 'report_edit',
        'analytics_view'
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
      id: 'BillingStaff', 
      name: 'Billing Staff', 
      permissions: [
        'dashboard_view',
        'individuals_view',
        'incidents_view',
        'billing_report_admin',
        'report_admin',
        'billing_admin',
        'analytics_admin'
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

const allPermissionsCategories = {
  'Dashboard': [
    { id: 'dashboard_view', label: 'View Dashboard', level: 'view' },
    { id: 'dashboard_edit', label: 'Edit Dashboard', level: 'edit' },
    { id: 'dashboard_admin', label: 'Admin Dashboard', level: 'admin' }
  ],
  'Individuals': [
    { id: 'individuals_view', label: 'View Individuals', level: 'view' },
    { id: 'individuals_edit', label: 'Edit Individuals', level: 'edit' },
    { id: 'individuals_admin', label: 'Admin Individuals', level: 'admin' }
  ],
  'Medications': [
    { id: 'medications_view', label: 'View Medications', level: 'view' },
    { id: 'medications_edit', label: 'Edit Medications', level: 'edit' },
    { id: 'medications_admin', label: 'Admin Medications', level: 'admin' },
    { id: 'mar', label: 'MAR Create', level: 'edit' },
    { id: 'mar_full', label: 'MAR Full Access', level: 'admin' },
    { id: 'approve_mar', label: 'Approve MAR', level: 'admin' }
  ],
  'Incidents': [
    { id: 'incidents_view', label: 'View Incidents', level: 'view' },
    { id: 'incidents', label: 'Create Incidents', level: 'edit' },
    { id: 'incidents_edit', label: 'Edit Incidents', level: 'edit' },
    { id: 'incidents_admin', label: 'Admin Incidents', level: 'admin' },
    { id: 'approve_incidents', label: 'Approve Incidents', level: 'admin' },
    { id: 'review_incidents', label: 'Review Incidents', level: 'admin' }
  ],
  'Billing & Reports': [
    { id: 'billing_report_view', label: 'View Billing Reports', level: 'view' },
    { id: 'billing_report_edit', label: 'Edit Billing Reports', level: 'edit' },
    { id: 'billing_report_admin', label: 'Admin Billing Reports', level: 'admin' },
    { id: 'billing_view', label: 'View Billing', level: 'view' },
    { id: 'billing_edit', label: 'Edit Billing', level: 'edit' },
    { id: 'billing_admin', label: 'Admin Billing', level: 'admin' }
  ],
  'Reports & Analytics': [
    { id: 'report_view', label: 'View Reports', level: 'view' },
    { id: 'report_edit', label: 'Edit Reports', level: 'edit' },
    { id: 'report_admin', label: 'Admin Reports', level: 'admin' },
    { id: 'analytics_view', label: 'View Analytics', level: 'view' },
    { id: 'analytics_edit', label: 'Edit Analytics', level: 'edit' },
    { id: 'analytics_admin', label: 'Admin Analytics', level: 'admin' }
  ],
  'Staff & Privacy': [
    { id: 'staff_admin', label: 'Staff Administration', level: 'admin' },
    { id: 'data_privacy_view', label: 'View Data Privacy', level: 'view' },
    { id: 'data_privacy_edit', label: 'Edit Data Privacy', level: 'edit' },
    { id: 'data_privacy_admin', label: 'Admin Data Privacy', level: 'admin' }
  ],
  'Advanced Features': [
    { id: 'foresight_engine_view', label: 'View Foresight Engine', level: 'view' },
    { id: 'foresight_engine_edit', label: 'Edit Foresight Engine', level: 'edit' },
    { id: 'foresight_engine_admin', label: 'Admin Foresight Engine', level: 'admin' },
    { id: 'user_foresight_view', label: 'View User Foresight', level: 'view' },
    { id: 'user_foresight_edit', label: 'Edit User Foresight', level: 'edit' },
    { id: 'user_foresight_admin', label: 'Admin User Foresight', level: 'admin' }
  ],
  'Plans & HCBS': [
    { id: 'plans', label: 'Create Plans', level: 'edit' },
    { id: 'edit_plans', label: 'Edit Plans', level: 'edit' },
    { id: 'view_plans', label: 'View Plans', level: 'view' },
    { id: 'hcbs_dashboard', label: 'HCBS Dashboard', level: 'admin' }
  ],
  'System Access': [
    { id: 'full_access', label: 'Full Access', level: 'admin' },
    { id: 'admin', label: 'Admin Rights', level: 'admin' },
    { id: 'system_admin', label: 'System Admin', level: 'admin' },
    { id: 'all_divisions', label: 'All Divisions', level: 'admin' },
    { id: 'system_oversight', label: 'System Oversight', level: 'admin' }
  ],
  'Discharge': [
    { id: 'discharge_view', label: 'View Discharge', level: 'view' },
    { id: 'discharge_edit', label: 'Edit Discharge', level: 'edit' },
    { id: 'discharge_admin', label: 'Admin Discharge', level: 'admin' }
  ]
};

// Quick facility inline edit component
const FacilityQuickEdit = ({ userId, currentFacility, onUpdated }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(currentFacility || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('user_profiles')
        .update({ facility: value, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;
      setEditing(false);
      onUpdated(value);
    } catch (err) {
      console.error('Error updating facility:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(currentFacility || '');
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter facility name..."
          autoFocus
          className="flex-1 bg-slate-900 border border-emerald-500 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="text-white animate-spin" /> : <CheckCircle size={14} className="text-white" />}
        </button>
        <button
          onClick={handleCancel}
          className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          <X size={14} className="text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group/facility mt-1">
      <p className="text-white font-semibold text-sm">
        {currentFacility || <span className="text-slate-500 italic">Not assigned</span>}
      </p>
      <button
        onClick={() => setEditing(true)}
        className="opacity-0 group-hover/facility:opacity-100 p-1 bg-slate-700 hover:bg-emerald-600 rounded transition-all duration-200"
        title="Quick edit facility"
      >
        <Edit2 size={11} className="text-white" />
      </button>
    </div>
  );
};

const UserProfilesAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDivision, setFilterDivision] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterFacility, setFilterFacility] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedDivisionForEdit, setSelectedDivisionForEdit] = useState('DD');
  const [expandedCategories, setExpandedCategories] = useState({});

  const divisions = ['DD', 'MI', 'SUD', 'PEER'];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showMessage('Error loading users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Get unique facilities for filter dropdown
  const uniqueFacilities = [...new Set(users.map(u => u.facility).filter(Boolean))].sort();

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setSelectedDivisionForEdit(user.division || 'DD');
    setEditForm({
      fullname: user.fullname || '',
      email: user.email || '',
      phone: user.phone || '',
      facility: user.facility || '',
      certification: user.certification || '',
      division: user.division || 'DD',
      role_id: user.role_id || '',
      role_name: user.role_name || '',
      permissions: user.permissions || []
    });
    const expanded = {};
    Object.keys(allPermissionsCategories).forEach(cat => { expanded[cat] = true; });
    setExpandedCategories(expanded);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm(null);
    setExpandedCategories({});
  };

  const togglePermission = (permissionId) => {
    setEditForm(prev => {
      const currentPermissions = prev.permissions || [];
      const hasPermission = currentPermissions.includes(permissionId);
      return {
        ...prev,
        permissions: hasPermission
          ? currentPermissions.filter(p => p !== permissionId)
          : [...currentPermissions, permissionId]
      };
    });
  };

  const handleRoleSelect = (roleId) => {
    const role = rolesByDivision[selectedDivisionForEdit]?.find(r => r.id === roleId);
    if (role) {
      setEditForm(prev => ({
        ...prev,
        role_id: roleId,
        role_name: role.name,
        permissions: [...role.permissions]
      }));
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSave = async (userId) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('user_profiles')
        .update({
          fullname: editForm.fullname,
          email: editForm.email,
          phone: editForm.phone,
          facility: editForm.facility,
          certification: editForm.certification,
          division: selectedDivisionForEdit,
          role_id: editForm.role_id,
          role_name: editForm.role_name,
          permissions: editForm.permissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      if (error) throw error;
      await fetchUsers();
      setEditingUser(null);
      setEditForm(null);
      setExpandedCategories({});
      showMessage('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      showMessage('Error updating user', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) return;
    try {
      const { error } = await supabase.from('user_profiles').delete().eq('id', userId);
      if (error) throw error;
      await fetchUsers();
      showMessage('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      showMessage('Error deleting user', 'error');
    }
  };

  // Handle quick facility update from inline editor
  const handleFacilityQuickUpdate = (userId, newFacility) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, facility: newFacility } : u));
    showMessage('Facility updated successfully');
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.facility?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision = filterDivision === 'all' || user.division === filterDivision;
    const matchesRole = filterRole === 'all' || user.role_id === filterRole;
    const matchesFacility = filterFacility === 'all' || user.facility === filterFacility;
    return matchesSearch && matchesDivision && matchesRole && matchesFacility;
  });

  const getDivisionColor = (division) => {
    const colors = {
      DD: 'from-emerald-600 to-teal-500',
      MI: 'from-green-500 to-emerald-600',
      SUD: 'from-teal-600 to-green-500',
      PEER: 'from-lime-600 to-emerald-500'
    };
    return colors[division] || 'from-slate-600 to-slate-700';
  };

  const getPermissionLevelColor = (level) => {
    const colors = {
      'view': 'bg-green-500/20 text-green-400 border-green-500/30',
      'edit': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      'admin': 'bg-teal-500/20 text-teal-400 border-teal-500/30'
    };
    return colors[level] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-20 h-20 text-emerald-500 animate-spin mx-auto mb-6" />
            <div className="absolute inset-0 w-20 h-20 mx-auto bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
          </div>
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 mb-2">
            Loading Admin Panel
          </h3>
          <p className="text-slate-400 text-lg">Fetching user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay:'1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay:'2s'}}></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                    <Shield className="text-white" size={32} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 mb-1">
                    Admin Control Center
                  </h1>
                  <p className="text-slate-400 text-lg font-medium flex items-center gap-2">
                    <Sparkles size={16} className="text-emerald-400" />
                    Comprehensive user, facility and permission management
                  </p>
                </div>
              </div>
              <button
                onClick={fetchUsers}
                className="group flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-500 hover:border-emerald-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/50"
              >
                <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                <span className="font-bold">Refresh</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <div className="group relative overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Users</p>
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="text-white" size={18} />
                    </div>
                  </div>
                  <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">{users.length}</p>
                  <p className="text-xs text-slate-500 mt-1">Active accounts</p>
                </div>
              </div>

              {divisions.map(div => (
                <div key={div} className="group relative overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105">
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getDivisionColor(div)} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{div} Division</p>
                      <div className={`w-10 h-10 bg-gradient-to-br ${getDivisionColor(div)} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Shield className="text-white" size={18} />
                      </div>
                    </div>
                    <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                      {users.filter(u => u.division === div).length}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{uniqueFacilities.filter(f => users.some(u => u.division === div && u.facility === f)).length} facilities</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Facility Summary Bar */}
            {uniqueFacilities.length > 0 && (
              <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <Home className="text-emerald-400" size={20} />
                  <h3 className="text-lg font-bold text-white">Facilities Overview</h3>
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg border border-emerald-500/30 font-bold">
                    {uniqueFacilities.length} Total
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {uniqueFacilities.map(facility => {
                    const count = users.filter(u => u.facility === facility).length;
                    return (
                      <button
                        key={facility}
                        onClick={() => setFilterFacility(filterFacility === facility ? 'all' : facility)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 border ${
                          filterFacility === facility
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-emerald-500/50 hover:text-white'
                        }`}
                      >
                        <Building2 size={14} />
                        {facility}
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                          filterFacility === facility ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
                        }`}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Filter className="text-emerald-400" size={20} />
                <h3 className="text-lg font-bold text-white">Filter & Search</h3>
                {(searchTerm || filterDivision !== 'all' || filterRole !== 'all' || filterFacility !== 'all') && (
                  <button
                    onClick={() => { setSearchTerm(''); setFilterDivision('all'); setFilterRole('all'); setFilterFacility('all'); }}
                    className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-semibold transition-all"
                  >
                    <X size={12} /> Clear Filters
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search name, email, facility..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                  />
                </div>
                <select
                  value={filterDivision}
                  onChange={(e) => setFilterDivision(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer text-sm"
                >
                  <option value="all">All Divisions</option>
                  {divisions.map(div => (
                    <option key={div} value={div}>{div} Division</option>
                  ))}
                </select>
                <select
                  value={filterFacility}
                  onChange={(e) => setFilterFacility(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer text-sm"
                >
                  <option value="all">All Facilities</option>
                  {uniqueFacilities.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer text-sm"
                >
                  <option value="all">All Roles</option>
                  {Object.entries(rolesByDivision).flatMap(([div, roles]) =>
                    roles.map(role => (
                      <option key={`${div}-${role.id}`} value={role.id}>{role.name} ({div})</option>
                    ))
                  )}
                </select>
              </div>
              {filteredUsers.length !== users.length && (
                <p className="text-slate-400 text-xs mt-3">
                  Showing <span className="text-emerald-400 font-bold">{filteredUsers.length}</span> of <span className="text-white font-bold">{users.length}</span> users
                </p>
              )}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-5 rounded-xl flex items-center gap-3 backdrop-blur-sm border ${
              message.type === 'error' ? 'bg-red-900/30 border-red-500/50' : 'bg-emerald-900/30 border-emerald-500/50'
            }`}>
              {message.type === 'error'
                ? <AlertCircle className="text-red-400" size={24} />
                : <CheckCircle className="text-emerald-400" size={24} />
              }
              <span className={`text-lg font-semibold ${message.type === 'error' ? 'text-red-300' : 'text-emerald-300'}`}>
                {message.text}
              </span>
            </div>
          )}

          {/* Users List */}
          <div className="space-y-5">
            {filteredUsers.length === 0 ? (
              <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/50">
                  <Users className="text-white" size={48} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No Users Found</h3>
                <p className="text-slate-400 text-lg">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="group bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10"
                >
                  {editingUser === user.id ? (
                    /* ─── EDIT MODE ─── */
                    <div className="p-8">
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/50">
                            <UserCog className="text-white" size={28} />
                          </div>
                          <div>
                            <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                              Editing User Profile
                            </h3>
                            <p className="text-slate-400 font-medium">{user.fullname}</p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleSave(user.id)}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-2 px-6 py-3 bg-slate-700/50 border border-slate-600 text-white rounded-xl font-bold hover:bg-slate-700 transition-all duration-300 hover:scale-105"
                          >
                            <X size={20} /> Cancel
                          </button>
                        </div>
                      </div>

                      {/* Basic Information */}
                      <div className="bg-slate-800/30 rounded-xl p-6 mb-6 border border-slate-700/30">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                          <Users className="text-emerald-400" size={20} />
                          Basic Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-emerald-400 mb-2">Full Name</label>
                            <input
                              type="text"
                              value={editForm.fullname}
                              onChange={(e) => setEditForm({...editForm, fullname: e.target.value})}
                              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-emerald-400 mb-2">Email Address</label>
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-emerald-400 mb-2">Phone Number</label>
                            <input
                              type="tel"
                              value={editForm.phone}
                              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            />
                          </div>

                          {/* FACILITY — highlighted as important */}
                          <div className="relative">
                            <label className="block text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2">
                              <Building2 size={14} className="text-emerald-400" />
                              Facility / Home Assignment
                              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/30">Required for DSP</span>
                            </label>
                            <div className="relative">
                              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-400" size={16} />
                              <input
                                type="text"
                                value={editForm.facility}
                                onChange={(e) => setEditForm({...editForm, facility: e.target.value})}
                                placeholder="e.g. Sunrise House, Oak Group Home..."
                                className="w-full bg-slate-900/50 border-2 border-emerald-500/40 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder-slate-600"
                              />
                            </div>
                            {uniqueFacilities.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-slate-500 mb-1.5">Existing facilities (click to use):</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {uniqueFacilities.map(f => (
                                    <button
                                      key={f}
                                      onClick={() => setEditForm({...editForm, facility: f})}
                                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-all border ${
                                        editForm.facility === f
                                          ? 'bg-emerald-600 border-emerald-500 text-white'
                                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-emerald-500/50 hover:text-white'
                                      }`}
                                    >
                                      {f}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-emerald-400 mb-2">Certification</label>
                            <input
                              type="text"
                              value={editForm.certification}
                              onChange={(e) => setEditForm({...editForm, certification: e.target.value})}
                              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-emerald-400 mb-2">Division</label>
                            <select
                              value={selectedDivisionForEdit}
                              onChange={(e) => {
                                setSelectedDivisionForEdit(e.target.value);
                                setEditForm({...editForm, division: e.target.value, role_id: '', role_name: ''});
                              }}
                              className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                            >
                              {divisions.map(div => (
                                <option key={div} value={div}>{div}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Role Selection */}
                      <div className="bg-slate-800/30 rounded-xl p-6 mb-6 border border-slate-700/30">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                          <Shield className="text-emerald-400" size={20} />
                          Role Assignment
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {rolesByDivision[selectedDivisionForEdit]?.map(role => (
                            <button
                              key={role.id}
                              onClick={() => handleRoleSelect(role.id)}
                              className={`p-5 rounded-xl text-left transition-all duration-300 hover:scale-105 border-2 ${
                                editForm.role_id === role.id
                                  ? 'bg-gradient-to-br from-emerald-600 to-teal-500 border-emerald-400 shadow-xl shadow-emerald-500/50'
                                  : 'bg-slate-900/50 border-slate-700 hover:border-emerald-500/50'
                              }`}
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${editForm.role_id === role.id ? 'bg-white/20' : 'bg-slate-800'}`}>
                                  <Shield size={20} className={editForm.role_id === role.id ? 'text-white' : 'text-emerald-400'} />
                                </div>
                                {editForm.role_id === role.id && <CheckCircle size={20} className="text-white ml-auto" />}
                              </div>
                              <h5 className="font-bold text-white mb-1 text-sm">{role.name}</h5>
                              <p className="text-xs text-slate-400">{role.permissions.length} permissions</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Permissions */}
                      <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/30">
                        <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                          <Lock className="text-emerald-400" size={20} />
                          Custom Permissions
                          <span className="text-sm font-normal text-slate-400">({editForm.permissions?.length || 0} selected)</span>
                        </h4>
                        <ScrollArea className="h-[500px] pr-4">
                          <div className="space-y-4">
                            {Object.entries(allPermissionsCategories).map(([category, permissions]) => (
                              <div key={category} className="bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700/30">
                                <button
                                  onClick={() => toggleCategory(category)}
                                  className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getDivisionColor('DD')} flex items-center justify-center`}>
                                      <Settings size={14} className="text-white" />
                                    </div>
                                    <span className="font-bold text-white">{category}</span>
                                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                      {permissions.filter(p => editForm.permissions?.includes(p.id)).length}/{permissions.length}
                                    </span>
                                  </div>
                                  <ChevronDown size={18} className={`text-slate-400 transition-transform duration-300 ${expandedCategories[category] ? 'rotate-180' : ''}`} />
                                </button>
                                {expandedCategories[category] && (
                                  <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {permissions.map(permission => (
                                      <button
                                        key={permission.id}
                                        onClick={() => togglePermission(permission.id)}
                                        className={`p-3 rounded-lg text-left transition-all duration-200 hover:scale-105 border ${
                                          editForm.permissions?.includes(permission.id)
                                            ? `bg-gradient-to-br from-emerald-600/20 to-teal-500/20 ${getPermissionLevelColor(permission.level)} border-2`
                                            : 'bg-slate-800/50 border-slate-700 hover:border-emerald-500/30'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getPermissionLevelColor(permission.level)}`}>
                                            {permission.level.toUpperCase()}
                                          </span>
                                          {editForm.permissions?.includes(permission.id) && <CheckCircle size={14} className="text-emerald-400" />}
                                        </div>
                                        <span className={`text-xs font-medium ${editForm.permissions?.includes(permission.id) ? 'text-white' : 'text-slate-400'}`}>
                                          {permission.label}
                                        </span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  ) : (
                    /* ─── VIEW MODE ─── */
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-5">
                          <div className={`w-16 h-16 bg-gradient-to-br ${getDivisionColor(user.division)} rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0`}>
                            <Users className="text-white" size={28} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-white mb-0.5">{user.fullname}</h3>
                            <p className="text-emerald-400 font-bold mb-2">{user.role_name}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-3 py-1 bg-gradient-to-r ${getDivisionColor(user.division)} text-white text-xs rounded-lg font-bold shadow`}>
                                {user.division}
                              </span>
                              <span className="px-2.5 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-lg font-medium border border-slate-600">
                                {user.permissions?.length || 0} Permissions
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(user)}
                            className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 hover:scale-105 text-sm"
                          >
                            <Edit2 size={16} className="group-hover:rotate-12 transition-transform" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(user.id, user.fullname)}
                            className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 hover:scale-105 text-sm"
                          >
                            <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Details Grid — facility always shown */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                        {/* Email */}
                        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                              <Mail size={14} className="text-emerald-400" />
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Email</p>
                          </div>
                          <p className="text-white font-semibold text-sm truncate">{user.email}</p>
                        </div>

                        {/* Phone */}
                        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 bg-green-500/20 rounded-lg flex items-center justify-center">
                              <Phone size={14} className="text-green-400" />
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Phone</p>
                          </div>
                          <p className="text-white font-semibold text-sm">{user.phone || <span className="text-slate-500 italic text-xs">Not set</span>}</p>
                        </div>

                        {/* FACILITY — always shown, with quick inline edit */}
                        <div className="bg-slate-800/40 rounded-xl p-4 border border-emerald-500/20 col-span-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 bg-teal-500/20 rounded-lg flex items-center justify-center">
                              <Building2 size={14} className="text-teal-400" />
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Facility</p>
                            <span className="ml-auto px-1.5 py-0.5 bg-teal-500/10 text-teal-400 text-xs rounded border border-teal-500/20 font-bold">KEY</span>
                          </div>
                          <FacilityQuickEdit
                            userId={user.id}
                            currentFacility={user.facility}
                            onUpdated={(newVal) => handleFacilityQuickUpdate(user.id, newVal)}
                          />
                        </div>

                        {/* Certification */}
                        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 bg-lime-500/20 rounded-lg flex items-center justify-center">
                              <Award size={14} className="text-lime-400" />
                            </div>
                            <p className="text-xs text-slate-500 font-medium">Certification</p>
                          </div>
                          <p className="text-white font-semibold text-sm">{user.certification || <span className="text-slate-500 italic text-xs">Not set</span>}</p>
                        </div>
                      </div>

                      {/* Permissions */}
                      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Lock className="text-emerald-400" size={16} />
                            Active Permissions
                          </h4>
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-lg font-bold border border-emerald-500/30">
                            {user.permissions?.length || 0} Total
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                          {user.permissions?.map(perm => (
                            <span
                              key={perm}
                              className="px-2.5 py-1 bg-slate-700/60 border border-slate-600/50 text-slate-300 text-xs rounded-lg font-medium hover:bg-emerald-600/20 hover:border-emerald-500/40 hover:text-white transition-all duration-200"
                            >
                              {perm.replace(/_/g, ' ')}
                            </span>
                          ))}
                          {(!user.permissions || user.permissions.length === 0) && (
                            <span className="text-slate-500 text-xs italic">No permissions assigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilesAdmin;