'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Eye, Edit2, X, Save, Download,
  Clock, AlertCircle, CheckCircle, Calendar, User, FileText,
  Shield, Activity, ChevronRight, Loader2, Upload, Plus,
  Home, Menu, Bell, ChevronDown, UserButton, LogOut, XCircle,
  ArrowRight, AlertTriangle, TrendingUp, TrendingDown, Sparkles,
  Zap, Award, BarChart3, Target, ChevronUp
} from 'lucide-react';
import { ScrollArea } from "../../../components/ui/scroll-area";
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '../../../contexts/userProfileContext';

import { UserButton as ClerkUserButton } from '@clerk/nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";



 // 1. ADD IMPORTS (at the top with other imports)
import { PERMISSIONS, getModuleAccessLevel, MODULE_PERMISSIONS, ACCESS_LEVELS } from '../../../utils/permissions';
import { Lock } from 'lucide-react'; // Add to existing lucide imports


const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const DischargePage = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();

  // State Management
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('discharge');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Discharge Modal States
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [selectedIndividual, setSelectedIndividual] = useState(null);
  const [dischargeData, setDischargeData] = useState({
    discharge_date: new Date().toISOString().split('T')[0],
    discharge_reason: '',
    discharge_type: '',
    discharge_destination: '',
    discharge_notes: '',
    discharge_plan_completed: false,
    final_assessment_completed: false,
    records_transferred: false,
    family_notified: false,
    medications_reconciled: false,
    discharge_instructions_provided: false,
    follow_up_arranged: false,
    discharge_coordinator: '',
    referral_information: '',
    belongings_returned: false,
    final_billing_completed: false
  });

  // View Discharge Details Modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingIndividual, setViewingIndividual] = useState(null);

  // Permission checks
 


 
// 2. ADD PERMISSION CHECKS (after useUserProfile hook, around line 60)
const getModuleAccess = (moduleName) => {
  if (!userProfile || !userProfile.permissions) return ACCESS_LEVELS.NONE;
  
  const modulePerms = MODULE_PERMISSIONS[moduleName];
  if (!modulePerms) return ACCESS_LEVELS.NONE;
  
  return getModuleAccessLevel(userProfile.permissions, modulePerms);
};

// Get access level for discharge module
const moduleAccess = getModuleAccess('discharge');

// Replace existing permission checks with:
const canViewDischarges = moduleAccess !== 'none';
const canEditDischarges = moduleAccess === 'edit' || moduleAccess === 'admin';
const canManageDischarges = moduleAccess === 'admin';

// Specific action permissions
const canProcessDischarge = canManageDischarges;
const canReactivateIndividuals = canManageDischarges;
const canExportReports = canViewDischarges;
const canViewDetails = canViewDischarges;

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
    { id: 'individual', icon: Users, label: 'Individuals', badge: null },
    { id: 'discharge', icon: LogOut, label: 'Discharge Management', badge: 'Active' },
    { id: 'medicine', icon: Shield, label: 'Medications', badge: null },
    { id: 'incident', icon: AlertTriangle, label: 'Incidents', badge: null },
    { id: 'report', icon: FileText, label: 'Reports', badge: null }
  ];

  // Fetch individuals - include all statuses for discharge management
  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canViewDischarges) {
        fetchIndividuals();
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, user, profileLoading, userProfile]);

  const fetchIndividuals = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('individuals')
        .select('*')
        .order('created_at', { ascending: false });

      // Role-based filtering
      if (userProfile.role_id === 'HouseManager_DD') {
        query = query.eq('homeassignment', userProfile.facility);
      } else if (userProfile.role_id === 'DSP_DD') {
        query = query.eq('homeassignment', userProfile.facility);
      } else if (userProfile.division === 'MI' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        query = query.eq('division', 'MI');
      } else if (userProfile.division === 'SUD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        query = query.eq('division', 'SUD');
      }

      const { data, error } = await query;

      if (error) throw error;
      setIndividuals(data || []);
    } catch (error) {
      console.error('Error fetching individuals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Open discharge modal
  const handleOpenDischargeModal = (individual) => {
    setSelectedIndividual(individual);
    setDischargeData({
      discharge_date: new Date().toISOString().split('T')[0],
      discharge_reason: individual.discharge_reason || '',
      discharge_type: individual.discharge_type || '',
      discharge_destination: individual.discharge_destination || '',
      discharge_notes: individual.discharge_notes || '',
      discharge_plan_completed: individual.discharge_plan_completed || false,
      final_assessment_completed: individual.final_assessment_completed || false,
      records_transferred: individual.records_transferred || false,
      family_notified: individual.family_notified || false,
      medications_reconciled: individual.medications_reconciled || false,
      discharge_instructions_provided: individual.discharge_instructions_provided || false,
      follow_up_arranged: individual.follow_up_arranged || false,
      discharge_coordinator: individual.discharge_coordinator || userProfile.fullname,
      referral_information: individual.referral_information || '',
      belongings_returned: individual.belongings_returned || false,
      final_billing_completed: individual.final_billing_completed || false
    });
    setShowDischargeModal(true);
  };

  // Handle discharge submission
  const handleDischarge = async () => {
   if (!selectedIndividual || !canProcessDischarge) {
    alert('You do not have permission to process discharges.');
    return;
  }

    if (!dischargeData.discharge_reason || !dischargeData.discharge_type) {
      alert('Please provide discharge reason and type.');
      return;
    }

    try {
      const updateData = {
        status: 'Discharged',
        discharge_date: dischargeData.discharge_date,
        discharge_reason: dischargeData.discharge_reason,
        discharge_type: dischargeData.discharge_type,
        discharge_destination: dischargeData.discharge_destination,
        discharge_notes: dischargeData.discharge_notes,
        discharge_plan_completed: dischargeData.discharge_plan_completed,
        final_assessment_completed: dischargeData.final_assessment_completed,
        records_transferred: dischargeData.records_transferred,
        family_notified: dischargeData.family_notified,
        medications_reconciled: dischargeData.medications_reconciled,
        discharge_instructions_provided: dischargeData.discharge_instructions_provided,
        follow_up_arranged: dischargeData.follow_up_arranged,
        discharge_coordinator: dischargeData.discharge_coordinator,
        referral_information: dischargeData.referral_information,
        belongings_returned: dischargeData.belongings_returned,
        final_billing_completed: dischargeData.final_billing_completed,
        discharged_by: userProfile.fullname,
        discharged_by_role: userProfile.role_name,
        discharge_processed_date: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        updated_by: userProfile.fullname,
        updated_by_role: userProfile.role_name,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('individuals')
        .update(updateData)
        .eq('id', selectedIndividual.id);

      if (error) throw error;

      // Update local state
      setIndividuals(prev => prev.map(ind => 
        ind.id === selectedIndividual.id 
          ? { ...ind, ...updateData }
          : ind
      ));

      alert('Individual discharged successfully!');
      setShowDischargeModal(false);
      setSelectedIndividual(null);
    } catch (error) {
      console.error('Error processing discharge:', error);
      alert('Error processing discharge. Please try again.');
    }
  };

  // View discharge details
  const handleViewDischarge = (individual) => {
    setViewingIndividual(individual);
    setShowViewModal(true);
  };

  // Reactivate discharged individual
  const handleReactivate = async (individual) => {
    if (!canManageDischarges) {
      alert('You do not have permission to reactivate individuals.');
      return;
    }

    if (!confirm(`Are you sure you want to reactivate ${individual.firstname} ${individual.lastname}?`)) {
      return;
    }

    try {
      const updateData = {
        status: 'Active',
        reactivation_date: new Date().toISOString(),
        reactivated_by: userProfile.fullname,
        reactivated_by_role: userProfile.role_name,
        reactivation_notes: 'Reactivated from discharge',
        last_activity: new Date().toISOString(),
        updated_by: userProfile.fullname,
        updated_by_role: userProfile.role_name,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('individuals')
        .update(updateData)
        .eq('id', individual.id);

      if (error) throw error;

      setIndividuals(prev => prev.map(ind => 
        ind.id === individual.id 
          ? { ...ind, ...updateData }
          : ind
      ));

      alert('Individual reactivated successfully!');
    } catch (error) {
      console.error('Error reactivating individual:', error);
      alert('Error reactivating individual.');
    }
  };

  // Filter and sort individuals
  const filteredIndividuals = individuals
    .filter(ind => {
      const matchesSearch = 
        ind.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ind.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ind.individualid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ind.homeassignment?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesFilter = true;
      if (filterStatus === 'discharged') {
        matchesFilter = ind.status === 'Discharged';
      } else if (filterStatus === 'pending') {
        matchesFilter = ind.status === 'Pending Discharge' || ind.discharge_plan_completed === true;
      } else if (filterStatus === 'active') {
        matchesFilter = ind.status === 'Active';
      }

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (!sortColumn) return 0;

      let aVal, bVal;

      switch (sortColumn) {
        case 'name':
          aVal = `${a.firstname} ${a.lastname}`.toLowerCase();
          bVal = `${b.firstname} ${b.lastname}`.toLowerCase();
          break;
        case 'id':
          aVal = a.individualid?.toLowerCase() || '';
          bVal = b.individualid?.toLowerCase() || '';
          break;
        case 'location':
          aVal = (a.homeassignment || a.location || '').toLowerCase();
          bVal = (b.homeassignment || b.location || '').toLowerCase();
          break;
        case 'status':
          aVal = a.status?.toLowerCase() || '';
          bVal = b.status?.toLowerCase() || '';
          break;
        case 'dischargeDate':
          aVal = new Date(a.discharge_date || 0).getTime();
          bVal = new Date(b.discharge_date || 0).getTime();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Stats calculations
  const totalIndividuals = individuals.length;
  const dischargedIndividuals = individuals.filter(ind => ind.status === 'Discharged').length;
  const pendingDischarges = individuals.filter(ind => ind.status === 'Pending Discharge' || ind.discharge_plan_completed === true).length;
  const activeIndividuals = individuals.filter(ind => ind.status === 'Active').length;

  const getInitials = (firstname, lastname) => {
    return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
  };

  const getColorClass = (index) => {
    const colors = [
      'from-emerald-600 to-teal-500',
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500',
      'from-green-400 to-emerald-500'
    ];
    return colors[index % colors.length];
  };

  // NavBar Component
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
            <p className="text-xs text-slate-400 font-medium tracking-wide">Discharge Management System</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm rounded-2xl px-5 py-2.5 w-96 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
          <Search size={18} className="text-emerald-400" />
          <input 
            type="text" 
            placeholder="Search discharges..." 
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
          />
        </div>
        
        <button className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105 group">
          <Bell size={20} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-lime-500 to-green-600 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-700/50">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">
              {userProfile?.fullname || 'User'}
            </p>
            <p className="text-xs text-slate-400 font-medium">
              {userProfile?.role_name || 'Staff'}
            </p>
          </div>
          <ClerkUserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );

  // Sidebar Component
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
      </div>
      
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="mb-2 px-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Main Menu</span>
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                router.push(`/${item.id === 'dashboard' ? 'dashboard' : item.id}`);
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
            <p className="text-xs text-slate-400 leading-relaxed">Discharge Process Compliant</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Table Row Component
  const TableRow = ({ individual, idx }) => (
    <tr className="border-b border-slate-700/30 hover:bg-slate-900/50 transition-all duration-300 group">
      <td className="py-5 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${getColorClass(idx)} rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-all duration-300`}>
            {getInitials(individual.firstname, individual.lastname)}
          </div>
          <div>
            <button 
              onClick={() => router.push(`/individual/${individual.id}`)}
              className="text-white font-semibold group-hover:text-emerald-400 transition-colors hover:underline text-left"
            >
              {individual.firstname} {individual.lastname}
            </button>
            <p className="text-xs text-slate-500">{individual.individualid}</p>
          </div>
        </div>
      </td>
      <td className="py-5 px-4">
        <div className="flex items-center gap-2">
          <Home size={14} className="text-emerald-400" />
          <span className="text-slate-300 text-sm">{individual.homeassignment || individual.location}</span>
        </div>
      </td>
      <td className="py-5 px-4">
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
          individual.status === 'Discharged' 
            ? 'bg-red-900/30 text-red-400 border-red-500/50' 
            : individual.status === 'Pending Discharge'
            ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50'
            : 'bg-green-900/30 text-green-400 border-green-500/50'
        }`}>
          {individual.status}
        </span>
      </td>
      <td className="py-5 px-4">
        {individual.discharge_date ? (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-500" />
            <span className="text-slate-300 text-sm">
              {new Date(individual.discharge_date).toLocaleDateString()}
            </span>
          </div>
        ) : (
          <span className="text-slate-500 text-sm">Not set</span>
        )}
      </td>
      <td className="py-5 px-4">
        <span className="text-slate-300 text-sm">
          {individual.discharge_reason || 'Not specified'}
        </span>
      </td>
      <td className="py-5 px-4">
        <div className="flex items-center gap-2">
          {individual.status === 'Discharged' ? (
            <>
              <button
                onClick={() => handleViewDischarge(individual)}
                className="p-2 hover:bg-blue-500/20 rounded-lg transition-all group/btn"
                title="View Details"
              >
                <Eye size={16} className="text-blue-400 group-hover/btn:scale-110 transition-all" />
              </button>
              {canManageDischarges && (
                <button
                  onClick={() => handleReactivate(individual)}
                  className="p-2 hover:bg-green-500/20 rounded-lg transition-all group/btn"
                  title="Reactivate"
                >
                  <CheckCircle size={16} className="text-green-400 group-hover/btn:scale-110 transition-all" />
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => router.push(`/individual/${individual.id}`)}
                className="p-2 hover:bg-blue-500/20 rounded-lg transition-all group/btn"
                title="View Profile"
              >
                <Eye size={16} className="text-blue-400 group-hover/btn:scale-110 transition-all" />
              </button>
              {canManageDischarges && (
                <button
                  onClick={() => handleOpenDischargeModal(individual)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-all group/btn"
                  title="Process Discharge"
                >
                  <LogOut size={16} className="text-red-400 group-hover/btn:scale-110 transition-all" />
                </button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  );

  // Permission Check
  if (!profileLoading && !canViewDischarges) {
    return (
      <div className="h-screen flex flex-col bg-slate-950 text-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-slate-400 mb-6">
              You do not have permission to view discharge management.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded || loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading discharge data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
    
      <div className="flex flex-1 overflow-hidden">
    

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <main className="p-6 lg:p-8">
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500">
                        Discharge Management
                      </h2>
                      <div className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full">
                        <span className="text-red-400 text-xs font-bold flex items-center gap-1">
                          <Zap size={12} /> LIVE
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-lg">
                      Manage individual discharges and track discharge processes
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {canManageDischarges && (
                      <button 
                        onClick={() => {/* Export functionality */}}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-slate-700"
                      >
                        <Download size={18} />
                        Export Report
                      </button>
                    )}
                  </div>
                </div>

                <div className={`px-3 py-1 rounded-full border ${
  moduleAccess === 'admin' ? 'bg-purple-500/20 border-purple-500/30 text-purple-400' :
  moduleAccess === 'edit' ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' :
  moduleAccess === 'view' ? 'bg-green-500/20 border-green-500/30 text-green-400' :
  'bg-slate-500/20 border-slate-500/30 text-slate-400'
}`}>
  <span className="text-xs font-bold uppercase flex items-center gap-1">
    <Shield size={12} />
    {moduleAccess === 'admin' ? 'Full Access' : 
     moduleAccess === 'edit' ? 'Edit Access' : 
     moduleAccess === 'view' ? 'View Only' : 'No Access'}
  </span>
</div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Individuals */}
                  <button 
                    onClick={() => setFilterStatus('all')}
                    className={`group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden cursor-pointer ${
                      filterStatus === 'all' 
                        ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/30' 
                        : 'border-slate-700/50 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-600 to-teal-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 ${
                          filterStatus === 'all' 
                            ? 'bg-gradient-to-br from-emerald-600 to-teal-500 animate-pulse' 
                            : 'bg-gradient-to-br from-slate-700 to-slate-800'
                        }`}>
                          <Users className={filterStatus === 'all' ? 'text-white' : 'text-slate-400'} size={26} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Total Individuals</p>
                        <p className="text-4xl font-black text-white">{totalIndividuals}</p>
                      </div>
                    </div>
                  </button>

                  {/* Active */}
                  <button 
                    onClick={() => setFilterStatus('active')}
                    className={`group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden cursor-pointer ${
                      filterStatus === 'active' 
                        ? 'border-green-500/50 shadow-lg shadow-green-500/30' 
                        : 'border-slate-700/50 hover:border-green-500/50'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 ${
                          filterStatus === 'active' 
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500 animate-pulse' 
                            : 'bg-gradient-to-br from-slate-700 to-slate-800'
                        }`}>
                          <CheckCircle className={filterStatus === 'active' ? 'text-white' : 'text-slate-400'} size={26} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Active</p>
                        <p className="text-4xl font-black text-white">{activeIndividuals}</p>
                      </div>
                    </div>
                  </button>

                  {/* Pending Discharge */}
                  <button 
                    onClick={() => setFilterStatus('pending')}
                    className={`group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden cursor-pointer ${
                      filterStatus === 'pending' 
                        ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/30' 
                        : 'border-slate-700/50 hover:border-yellow-500/50'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 ${
                          filterStatus === 'pending' 
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 animate-pulse' 
                            : 'bg-gradient-to-br from-slate-700 to-slate-800'
                        }`}>
                          <Clock className={filterStatus === 'pending' ? 'text-white' : 'text-slate-400'} size={26} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Pending Discharge</p>
                        <p className="text-4xl font-black text-white">{pendingDischarges}</p>
                      </div>
                    </div>
                  </button>

                  {/* Discharged */}
                  <button 
                    onClick={() => setFilterStatus('discharged')}
                    className={`group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden cursor-pointer ${
                      filterStatus === 'discharged' 
                        ? 'border-red-500/50 shadow-lg shadow-red-500/30' 
                        : 'border-slate-700/50 hover:border-red-500/50'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500 to-orange-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 ${
                          filterStatus === 'discharged' 
                            ? 'bg-gradient-to-br from-red-500 to-orange-500 animate-pulse' 
                            : 'bg-gradient-to-br from-slate-700 to-slate-800'
                        }`}>
                          <LogOut className={filterStatus === 'discharged' ? 'text-white' : 'text-slate-400'} size={26} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Discharged</p>
                        <p className="text-4xl font-black text-white">{dischargedIndividuals}</p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Main Table */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  {/* Search and Filter */}
                  <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="flex-1 flex items-center gap-3 bg-slate-900/50 rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
                      <Search size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                      <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, ID, or location..." 
                        className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
                      />
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800 text-white rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 font-semibold"
                      >
                        <Filter size={18} />
                        Status Filter
                        <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                          filterStatus === 'all' ? 'bg-emerald-500/20 text-emerald-400' :
                          filterStatus === 'active' ? 'bg-green-500/20 text-green-400' :
                          filterStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {filterStatus === 'all' ? 'All' : 
                           filterStatus === 'active' ? 'Active' :
                           filterStatus === 'pending' ? 'Pending' :
                           'Discharged'}
                        </span>
                      </button>
                      
                      {showFilterMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl p-2 z-20 shadow-2xl">
                          {['all', 'active', 'pending', 'discharged'].map(status => (
                            <button
                              key={status}
                              onClick={() => {
                                setFilterStatus(status);
                                setShowFilterMenu(false);
                              }}
                              className={`w-full text-left px-4 py-2 rounded-lg transition-all flex items-center justify-between ${
                                filterStatus === status
                                  ? 'bg-emerald-600 text-white'
                                  : 'text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              <span className="capitalize">{status}</span>
                              {filterStatus === status && <CheckCircle size={16} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Table */}
                  {filteredIndividuals.length === 0 ? (
                    <div className="text-center py-16">
                      <LogOut className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-400 mb-2">No individuals found</h3>
                      <p className="text-slate-500">
                        {filterStatus !== 'all' 
                          ? `No individuals found with ${filterStatus} status` 
                          : 'No discharge records available'}
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[500px] rounded-xl">
                      <div className="pr-4">
                        <table className="w-full">
                          <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
                            <tr className="border-b border-slate-700/50">
                              <th 
                                onClick={() => handleSort('name')}
                                className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider cursor-pointer hover:text-emerald-400 transition-colors group"
                              >
                                <div className="flex items-center gap-2">
                                  Individual
                                  {sortColumn === 'name' && (
                                    sortDirection === 'asc' ? <ChevronUp size={14} className="text-emerald-400" /> : <ChevronDown size={14} className="text-emerald-400" />
                                  )}
                                </div>
                              </th>
                              <th 
                                onClick={() => handleSort('location')}
                                className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider cursor-pointer hover:text-emerald-400 transition-colors group"
                              >
                                <div className="flex items-center gap-2">
                                  Location
                                  {sortColumn === 'location' && (
                                    sortDirection === 'asc' ? <ChevronUp size={14} className="text-emerald-400" /> : <ChevronDown size={14} className="text-emerald-400" />
                                  )}
                                </div>
                              </th>
                              <th 
                                onClick={() => handleSort('status')}
                                className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider cursor-pointer hover:text-emerald-400 transition-colors group"
                              >
                                <div className="flex items-center gap-2">
                                  Status
                                  {sortColumn === 'status' && (
                                    sortDirection === 'asc' ? <ChevronUp size={14} className="text-emerald-400" /> : <ChevronDown size={14} className="text-emerald-400" />
                                  )}
                                </div>
                              </th>
                              <th 
                                onClick={() => handleSort('dischargeDate')}
                                className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider cursor-pointer hover:text-emerald-400 transition-colors group"
                              >
                                <div className="flex items-center gap-2">
                                  Discharge Date
                                  {sortColumn === 'dischargeDate' && (
                                    sortDirection === 'asc' ? <ChevronUp size={14} className="text-emerald-400" /> : <ChevronDown size={14} className="text-emerald-400" />
                                  )}
                                </div>
                              </th>
                              <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">
                                Reason
                              </th>
                              <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredIndividuals.map((individual, idx) => (
                              <TableRow key={individual.id} individual={individual} idx={idx} />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </ScrollArea>
                  )}

                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700/50">
                    <p className="text-slate-400 text-sm">
                      Showing <span className="text-white font-semibold">{filteredIndividuals.length}</span> of <span className="text-white font-semibold">{individuals.length}</span> individuals
                    </p>
                  </div>
                </div>
              </div>
            </main>
          </ScrollArea>
        </div>
      </div>

      {/* Discharge Modal */}
      {showDischargeModal && selectedIndividual && (
        <Dialog open={showDischargeModal} onOpenChange={setShowDischargeModal}>
          <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <LogOut className="text-red-400" size={24} />
                Process Discharge - {selectedIndividual.firstname} {selectedIndividual.lastname}
              </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="max-h-[calc(90vh-180px)]">
              <div className="space-y-6 py-4">
                {/* Individual Info */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Individual ID:</p>
                      <p className="text-white font-semibold">{selectedIndividual.individualid}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Current Status:</p>
                      <p className="text-white font-semibold">{selectedIndividual.status}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Home Assignment:</p>
                      <p className="text-white font-semibold">{selectedIndividual.homeassignment}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Admission Date:</p>
                      <p className="text-white font-semibold">
                        {new Date(selectedIndividual.admissiondate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Discharge Information */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4">Discharge Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Discharge Date *
                      </label>
                      <input
                        type="date"
                        value={dischargeData.discharge_date}
                        onChange={(e) => setDischargeData(prev => ({ ...prev, discharge_date: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Discharge Type *
                      </label>
                      <select
                        value={dischargeData.discharge_type}
                        onChange={(e) => setDischargeData(prev => ({ ...prev, discharge_type: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      >
                        <option value="">Select Type</option>
                        <option value="Planned">Planned</option>
                        <option value="Medical Transfer">Medical Transfer</option>
                        <option value="Voluntary">Voluntary</option>
                        <option value="Administrative">Administrative</option>
                        <option value="Deceased">Deceased</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Discharge Reason *
                      </label>
                      <textarea
                        value={dischargeData.discharge_reason}
                        onChange={(e) => setDischargeData(prev => ({ ...prev, discharge_reason: e.target.value }))}
                        rows="3"
                        placeholder="Explain the reason for discharge..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Discharge Destination
                      </label>
                      <input
                        type="text"
                        value={dischargeData.discharge_destination}
                        onChange={(e) => setDischargeData(prev => ({ ...prev, discharge_destination: e.target.value }))}
                        placeholder="Where is the individual being discharged to?"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Discharge Coordinator
                      </label>
                      <input
                        type="text"
                        value={dischargeData.discharge_coordinator}
                        onChange={(e) => setDischargeData(prev => ({ ...prev, discharge_coordinator: e.target.value }))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Referral Information
                      </label>
                      <textarea
                        value={dischargeData.referral_information}
                        onChange={(e) => setDischargeData(prev => ({ ...prev, referral_information: e.target.value }))}
                        rows="2"
                        placeholder="Any referral or follow-up information..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Discharge Checklist */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4">Discharge Checklist</h4>
                  <div className="space-y-3">
                    {[
                      { key: 'discharge_plan_completed', label: 'Discharge Plan Completed' },
                      { key: 'final_assessment_completed', label: 'Final Assessment Completed' },
                      { key: 'records_transferred', label: 'Records Transferred' },
                      { key: 'family_notified', label: 'Family/Guardian Notified' },
                      { key: 'medications_reconciled', label: 'Medications Reconciled' },
                      { key: 'discharge_instructions_provided', label: 'Discharge Instructions Provided' },
                      { key: 'follow_up_arranged', label: 'Follow-up Care Arranged' },
                      { key: 'belongings_returned', label: 'Personal Belongings Returned' },
                      { key: 'final_billing_completed', label: 'Final Billing Completed' }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-all">
                        <input
                          type="checkbox"
                          checked={dischargeData[item.key]}
                          onChange={(e) => setDischargeData(prev => ({ ...prev, [item.key]: e.target.checked }))}
                          className="w-5 h-5 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                        />
                        <span className="text-white text-sm font-medium">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Additional Discharge Notes
                  </label>
                  <textarea
                    value={dischargeData.discharge_notes}
                    onChange={(e) => setDischargeData(prev => ({ ...prev, discharge_notes: e.target.value }))}
                    rows="4"
                    placeholder="Any additional notes about the discharge process..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
                  />
                </div>

                {/* Warning */}
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-400 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <h5 className="text-red-300 font-semibold mb-1">Important:</h5>
                      <ul className="text-sm text-red-100 space-y-1">
                        <li>• This action will change the individual's status to "Discharged"</li>
                        <li>• All active services will be discontinued</li>
                        <li>• Please ensure all checklist items are completed</li>
                        <li>• This action can be reversed by reactivating the individual</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => {
                      setShowDischargeModal(false);
                      setSelectedIndividual(null);
                    }}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDischarge}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300"
                  >
                    <LogOut size={18} />
                    Process Discharge
                  </button>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}

      {/* View Discharge Details Modal */}
      {showViewModal && viewingIndividual && (
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <Eye className="text-blue-400" size={24} />
                Discharge Details - {viewingIndividual.firstname} {viewingIndividual.lastname}
              </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="max-h-[calc(90vh-180px)]">
              <div className="space-y-6 py-4">
                {/* Individual Info */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Individual Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Individual ID:</p>
                      <p className="text-white font-semibold">{viewingIndividual.individualid}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Status:</p>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-900/30 text-red-400 border border-red-500/50">
                        {viewingIndividual.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-400">Home Assignment:</p>
                      <p className="text-white font-semibold">{viewingIndividual.homeassignment}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Admission Date:</p>
                      <p className="text-white font-semibold">
                        {new Date(viewingIndividual.admissiondate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Discharge Information */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Discharge Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Discharge Date:</p>
                      <p className="text-white font-semibold">
                        {viewingIndividual.discharge_date 
                          ? new Date(viewingIndividual.discharge_date).toLocaleDateString()
                          : 'Not recorded'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">Discharge Type:</p>
                      <p className="text-white font-semibold">{viewingIndividual.discharge_type || 'Not specified'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400">Discharge Reason:</p>
                      <p className="text-white">{viewingIndividual.discharge_reason || 'Not specified'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400">Discharge Destination:</p>
                      <p className="text-white">{viewingIndividual.discharge_destination || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Discharge Coordinator:</p>
                      <p className="text-white">{viewingIndividual.discharge_coordinator || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Processed By:</p>
                      <p className="text-white">{viewingIndividual.discharged_by || 'Not recorded'}</p>
                    </div>
                  </div>
                </div>

                {/* Checklist Status */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Discharge Checklist Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { key: 'discharge_plan_completed', label: 'Discharge Plan Completed' },
                      { key: 'final_assessment_completed', label: 'Final Assessment Completed' },
                      { key: 'records_transferred', label: 'Records Transferred' },
                      { key: 'family_notified', label: 'Family/Guardian Notified' },
                      { key: 'medications_reconciled', label: 'Medications Reconciled' },
                      { key: 'discharge_instructions_provided', label: 'Discharge Instructions Provided' },
                      { key: 'follow_up_arranged', label: 'Follow-up Care Arranged' },
                      { key: 'belongings_returned', label: 'Personal Belongings Returned' },
                      { key: 'final_billing_completed', label: 'Final Billing Completed' }
                    ].map(item => (
                      <div key={item.key} className="flex items-center gap-2">
                        {viewingIndividual[item.key] ? (
                          <CheckCircle size={16} className="text-green-400" />
                        ) : (
                          <XCircle size={16} className="text-red-400" />
                        )}
                        <span className="text-sm text-slate-300">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                {viewingIndividual.discharge_notes && (
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-white mb-3">Discharge Notes</h4>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">
                      {viewingIndividual.discharge_notes}
                    </p>
                  </div>
                )}

                {/* Referral Information */}
                {viewingIndividual.referral_information && (
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <h4 className="text-lg font-semibold text-white mb-3">Referral Information</h4>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap">
                      {viewingIndividual.referral_information}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setViewingIndividual(null);
                    }}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300"
                  >
                    Close
                  </button>
                  {canManageDischarges && (
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleReactivate(viewingIndividual);
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300"
                    >
                      <CheckCircle size={18} />
                      Reactivate Individual
                    </button>
                  )}
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DischargePage;