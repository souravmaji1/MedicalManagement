'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Upload, Search, Filter, Eye, Edit2, Trash2,
  MapPin, Clock, CheckCircle, AlertCircle, Download, X,
  Save, FileText, Phone, Mail, Calendar, User, Home as HomeIcon, AlertTriangle,
  Shield, Heart, Activity, ChevronRight, Loader2, CreditCard,
  Home, FileText as FileTextIcon, Pill, AlertCircle as AlertCircleIcon,User2Icon,
  TrendingUp, Settings, Menu, Bell, ChevronDown, BarChart3, Brain,NetworkIcon,
  Zap, Sparkles, Award, TrendingDown, Target, StickyNote
} from 'lucide-react';
import { ChevronUp } from 'lucide-react';
import { ScrollArea } from "../../../components/ui/scroll-area";
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '../../../contexts/userProfileContext';
import { PERMISSIONS } from '../../../utils/permissions';
import { UserButton } from '@clerk/nextjs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { getModuleAccessLevel, MODULE_PERMISSIONS, ACCESS_LEVELS } from '../../../utils/permissions';
 // Add these imports at the top with other lucide-react icons


const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const IndividualsPage = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();
const [sortColumn, setSortColumn] = useState(null);
const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);


  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('individual');


  const [selectedStatusInfo, setSelectedStatusInfo] = useState(null);
  const [statusReviewNotes, setStatusReviewNotes] = useState('');

  // Add these with your existing state declarations
const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
const [statusUpdateData, setStatusUpdateData] = useState({
  status: '',
  reason: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  notes: ''
});

const handleSort = (column) => {
  if (sortColumn === column) {
    // Toggle direction if clicking the same column
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  } else {
    // Set new column and default to ascending
    setSortColumn(column);
    setSortDirection('asc');
  }
};



  const getModuleAccess = (moduleName) => {
    if (!userProfile || !userProfile.permissions) return ACCESS_LEVELS.NONE;
    
    const modulePerms = MODULE_PERMISSIONS[moduleName];
    if (!modulePerms) return ACCESS_LEVELS.NONE;
    
    return getModuleAccessLevel(userProfile.permissions, modulePerms);
  };

 // Replace the existing permission checks section with:
const moduleAccess = getModuleAccess('individuals');

const canViewIndividuals = moduleAccess !== 'none';
const canEditIndividuals = moduleAccess === 'edit' || moduleAccess === 'admin';
const canAdminIndividuals = moduleAccess === 'admin';
const canAddIndividuals = canAdminIndividuals;
const canDeleteIndividuals = canAdminIndividuals;
const canImportIndividuals = canAdminIndividuals;
const canExportIndividuals = canViewIndividuals; // Anyone who can view can export

// For status updates - requires edit or admin
const canUpdateStatus = canEditIndividuals;

  

  // Form state for adding individual
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    individualid: '',
    dateofbirth: '',
    gender: '',
    phone: '',
    email: '',
    location: '',
    homeassignment: '',
    primarydiagnosis: '',
    guardianname: '',
    guardianphone: '',
    guardianemail: '',
    admissiondate: '',
    status: 'Active',
    status_reason: '',
    medicaidnumber: '',
    emergencycontact: '',
    allergies: '',
    notes: ''
  });


     const menuItems = [
         { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
         { id: 'individual', icon: Users, label: 'Individuals', badge: null },
         { id: 'medicine', icon: Pill, label: 'Medications', badge: null },
         { id: 'incident', icon: AlertTriangle, label: 'Incidents', badge: '3' },
          { id: 'bill', icon: Shield, label: 'Billing Report', badge: 'NEW' },
           { id: 'staff', icon: User2Icon, label: 'Add Staff', badge: 'NEW' },
         { id: 'privacy', icon: Shield, label: 'Data Privacy', badge: 'NEW' },
         { id: 'report', icon: FileText, label: 'Report', badge: 'NEW' },
         { id: 'engine', icon: Pill, label: 'Foresight Engine', badge: 'NEW' },
         { id: 'intelligence', icon: NetworkIcon, label: 'User Foresight', badge: 'NEW' },
         { id: 'billing', icon: CreditCard, label: 'Billing', badge: null },
         { id: 'analytics', icon: TrendingUp, label: 'Analytics', badge: null }
       ];

  // Fetch individuals from Supabase with role-based filtering
  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canViewIndividuals) {
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


      const { data, error } = await query;

      if (error) throw error;
      setIndividuals(data || []);
    } catch (error) {
      console.error('Error fetching individuals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

 
// Helper function to add entry to update history - CORRECTED VERSION
const addToUpdateHistory = (currentHistory, updateType, updatedFields, userProfile, additionalInfo = {}) => {
  const historyEntry = {
    timestamp: new Date().toISOString(),
    updated_by: userProfile.fullname,           // ✅ This is included
    updated_by_role: userProfile.role_name,     // ✅ This is included
    user_id: userProfile.user_id || user.id,    // ✅ User ID
    update_type: updateType, // 'create', 'edit', 'status_change', 'status_review', 'import', 'delete'
    changes: updatedFields,
    ...additionalInfo
  };

  // Parse existing history or start with empty array
  const history = Array.isArray(currentHistory) ? currentHistory : [];
  
  // Add new entry at the beginning (most recent first)
  return [historyEntry, ...history];
};

  const handleAddIndividual = async (e) => {
    e.preventDefault();
    
    if (!canAddIndividuals) {
      alert('You do not have permission to add individuals.');
      return;
    }

    try {
      const individualData = {
        ...formData,
        userid: user.id,
        division: userProfile.division,
        created_by: userProfile.fullname,
        created_by_role: userProfile.role_name,
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        compliance_score: 100,
              update_history: [{
        timestamp: new Date().toISOString(),
        updated_by: userProfile.fullname,
        updated_by_role: userProfile.role_name,
        user_id: user.id,
        update_type: 'create',
        changes: formData,
        action: 'Individual record created'
      }]
      };

      const { data, error } = await supabase
        .from('individuals')
        .insert([individualData])
        .select();

      if (error) throw error;

      setIndividuals(prev => [data[0], ...prev]);
      setShowAddModal(false);
      resetForm();
      alert('Individual added successfully!');
    } catch (error) {
      console.error('Error adding individual:', error);
      alert('Error adding individual. Please try again.');
    }
  };

  const handleImportCSV = async (e) => {
    if (!canImportIndividuals) {
      alert('You do not have permission to import individuals.');
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const rows = text.split('\n').map(row => row.split(','));
      const headers = rows[0].map(h => h.trim().toLowerCase());
      
      const importedData = rows.slice(1).filter(row => row.length > 1).map(row => {
        const individual = {
          userid: user.id,
          division: userProfile.division,
          created_by: userProfile.fullname,
          created_by_role: userProfile.role_name,
          created_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          compliance_score: 95,
          status: 'Active'
        };

        headers.forEach((header, index) => {
          const value = row[index]?.trim();
          if (value) {
            const fieldMap = {
              'first name': 'firstname',
              'firstname': 'firstname',
              'last name': 'lastname',
              'lastname': 'lastname',
              'id': 'individualid',
              'individual id': 'individualid',
              'dob': 'dateofbirth',
              'date of birth': 'dateofbirth',
              'location': 'location',
              'home': 'homeassignment',
              'home assignment': 'homeassignment',
              'phone': 'phone',
              'email': 'email',
              'diagnosis': 'primarydiagnosis',
              'guardian': 'guardianname',
              'guardian name': 'guardianname',
              'status': 'status'
            };

            const fieldName = fieldMap[header] || header.replace(/\s+/g, '');
            individual[fieldName] = value;
          }
        });

        return individual;
      });

      const { data, error } = await supabase
        .from('individuals')
        .insert(importedData)
        .select();

      if (error) throw error;

      setIndividuals(prev => [...data, ...prev]);
      setShowImportModal(false);
      alert(`Successfully imported ${data.length} individuals`);
    } catch (error) {
      console.error('Error importing CSV:', error);
      alert('Error importing CSV. Please check the file format.');
    }
  };

  const handleDeleteIndividual = async (id) => {
    if (!canDeleteIndividuals) {
      alert('You do not have permission to delete individuals.');
      return;
    }

    if (!confirm('Are you sure you want to delete this individual? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('individuals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIndividuals(prev => prev.filter(ind => ind.id !== id));
      alert('Individual deleted successfully.');
    } catch (error) {
      console.error('Error deleting individual:', error);
      alert('Error deleting individual.');
    }
  };

  const handleExport = () => {
    if (!canExportIndividuals) {
      alert('You do not have permission to export data.');
      return;
    }

    // Create CSV content
    const headers = ['First Name', 'Last Name', 'Individual ID', 'DOB', 'Home Assignment', 'Status', 'Location'];
    const csvContent = [
      headers.join(','),
      ...filteredIndividuals.map(ind => [
        ind.firstname,
        ind.lastname,
        ind.individualid,
        ind.dateofbirth,
        ind.homeassignment,
        ind.status,
        ind.location
      ].join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `individuals_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFormData({
      firstname: '',
      lastname: '',
      individualid: '',
      dateofbirth: '',
      gender: '',
      phone: '',
      email: '',
      location: '',
      homeassignment: '',
      primarydiagnosis: '',
      guardianname: '',
      guardianphone: '',
      guardianemail: '',
      admissiondate: '',
      status: 'Active',
      status_reason: '',
      medicaidnumber: '',
      emergencycontact: '',
      allergies: '',
      notes: ''
    });
  };

 const filteredIndividuals = individuals
  .filter(ind => {
    const matchesSearch = 
      ind.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.individualid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.homeassignment?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || ind.status === filterStatus;

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
      case 'lastActivity':
        aVal = new Date(a.last_activity).getTime();
        bVal = new Date(b.last_activity).getTime();
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getInitials = (firstname, lastname) => {
    return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
  };

  const getColorClass = (index) => {
    const colors = [
      'from-emerald-600 to-teal-500',
      'from-green-400 to-emerald-500',
      'from-lime-500 to-green-600',
      'from-teal-500 to-emerald-600',
      'from-cyan-500 to-teal-600'
    ];
    return colors[index % colors.length];
  };

  // Handle stats card click
  const handleStatsCardClick = (status) => {
    setFilterStatus(status);
  };

 // Handle status click to show review modal
const handleStatusClick = (individual) => {
  if (individual.status === 'Review' || individual.status === 'Inactive') {
    setSelectedStatusInfo({
      id: individual.id,
      name: `${individual.firstname} ${individual.lastname}`,
      status: individual.status,
      status_reason: individual.status_reason,
      review_notes: individual.review_notes,
      review_date: individual.review_date,
      reviewed_by: individual.reviewed_by
    });
    setStatusReviewNotes(individual.review_notes || '');
    setShowStatusModal(true);
  } else {
    // For active status, show update modal directly
    handleOpenStatusUpdateModal(individual);
  }
};

// Function to open status update modal
const handleOpenStatusUpdateModal = (individual) => {
  setSelectedStatusInfo({
    id: individual.id,
    name: `${individual.firstname} ${individual.lastname}`,
    currentStatus: individual.status,
    status_reason: individual.status_reason
  });
  setStatusUpdateData({
    status: individual.status,
    reason: individual.status_reason || '',
    effectiveDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  setShowStatusUpdateModal(true);
};



const handleUpdateStatus = async () => {
  // Add permission check at the start
  if (!canUpdateStatus) {
    alert('You do not have permission to update individual status.');
    return;
  }
 
  if (!selectedStatusInfo || !statusUpdateData.status) return;
  
  if (statusUpdateData.status === 'Active' && !statusUpdateData.reason.trim()) {
    alert('Please provide a reason for the status update.');
    return;
  }

  try {
    // First, get current individual data
    const { data: currentData, error: fetchError } = await supabase
      .from('individuals')
      .select('*')
      .eq('id', selectedStatusInfo.id)
      .single();

    if (fetchError) throw fetchError;

    const statusChanges = {
      status: statusUpdateData.status,
      status_reason: statusUpdateData.reason,
      review_notes: statusUpdateData.notes
    };

    // Create new history entry with all required fields
    const historyEntry = {
      timestamp: new Date().toISOString(),
      updated_by: userProfile.fullname,           // ✅ Included
      updated_by_role: userProfile.role_name,     // ✅ Included
      user_id: user.id,                           // ✅ Included
      update_type: 'status_change',
      changes: statusChanges,
      action: `Status changed from ${currentData.status} to ${statusUpdateData.status}`,
      previous_status: currentData.status,
      previous_reason: currentData.status_reason,
      effective_date: statusUpdateData.effectiveDate
    };

    const currentHistory = Array.isArray(currentData.update_history) ? currentData.update_history : [];
    const newHistory = [historyEntry, ...currentHistory];

    const updateData = {
      status: statusUpdateData.status,
      status_reason: statusUpdateData.reason,
      review_notes: statusUpdateData.notes,
      reviewed_by: userProfile.fullname,
      review_date: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      updated_by: userProfile.fullname,
      updated_by_role: userProfile.role_name,
      updated_at: new Date().toISOString(),
      update_history: newHistory
    };

    const { error } = await supabase
      .from('individuals')
      .update(updateData)
      .eq('id', selectedStatusInfo.id);

    if (error) throw error;

    // Update local state
    setIndividuals(prev => prev.map(ind => 
      ind.id === selectedStatusInfo.id 
        ? { ...ind, ...updateData }
        : ind
    ));

    // If updating to Active, clear filter to show them
    if (statusUpdateData.status === 'Active') {
      setFilterStatus('all');
    }

    alert('Status updated successfully!');
    setShowStatusUpdateModal(false);
    setSelectedStatusInfo(null);
    setStatusUpdateData({
      status: '',
      reason: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      notes: ''
    });
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Error updating status.');
  }
};

  const handleUpdateStatusReview = async () => {
if (!canEditIndividuals) {
    alert('You do not have permission to update status reviews.');
    return;
  }


    if (!selectedStatusInfo) return;
  
  try {
    // First, get current individual data for history
    const { data: currentData, error: fetchError } = await supabase
      .from('individuals')
      .select('*')
      .eq('id', selectedStatusInfo.id)
      .single();

    if (fetchError) throw fetchError;

    // Create new history entry with all required fields
    const historyEntry = {
      timestamp: new Date().toISOString(),
      updated_by: userProfile.fullname,           // ✅ Included
      updated_by_role: userProfile.role_name,     // ✅ Included
      user_id: user.id,                           // ✅ Included
      update_type: 'status_review',
      changes: { review_notes: statusReviewNotes },
      action: 'Status review notes updated',
      previous_review_notes: currentData.review_notes
    };

    const currentHistory = Array.isArray(currentData.update_history) ? currentData.update_history : [];
    const newHistory = [historyEntry, ...currentHistory];

    const updateData = {
      review_notes: statusReviewNotes,
      reviewed_by: userProfile.fullname,
      review_date: new Date().toISOString(),
      updated_by: userProfile.fullname,
      updated_by_role: userProfile.role_name,
      updated_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      update_history: newHistory
    };

    const { error } = await supabase
      .from('individuals')
      .update(updateData)
      .eq('id', selectedStatusInfo.id);

    if (error) throw error;

    // Update local state
    setIndividuals(prev => prev.map(ind => 
      ind.id === selectedStatusInfo.id 
        ? { ...ind, ...updateData }
        : ind
    ));

    alert('Status review updated successfully!');
    setShowStatusModal(false);
    setSelectedStatusInfo(null);
  } catch (error) {
    console.error('Error updating status review:', error);
    alert('Error updating status review.');
  }
};

  // Calculate stats
  const totalIndividuals = individuals.length;
  const activeIndividuals = individuals.filter(ind => ind.status === 'Active').length;
  const reviewIndividuals = individuals.filter(ind => ind.status === 'Review').length;
  const inactiveIndividuals = individuals.filter(ind => ind.status === 'Inactive').length;

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
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-700/50 cursor-pointer hover:bg-white/5 rounded-xl p-2 transition-all duration-300 group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
              {userProfile?.fullname || 'User'}
            </p>
            <p className="text-xs text-slate-400 font-medium">
              {userProfile?.role_name || 'Staff'} • Online
            </p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/50">
              <UserButton afterSignOutUrl="/" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </div>
          <ChevronDown size={16} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
        </div>
      </div>
    </div>
  );

  

  // Permission Check - No Access Screen
  if (!profileLoading && !canViewIndividuals) {
    return (
      <div className="h-screen flex flex-col bg-slate-950 text-white">
    
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-slate-400 mb-6">
              You do not have permission to view individuals. Please contact your administrator if you believe this is an error.
            </p>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <p className="text-sm text-slate-400">Your Current Role:</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">{userProfile?.role_name}</p>
              <p className="text-sm text-slate-500 mt-2">Division: {userProfile?.division}</p>
            </div>
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
          <p className="text-slate-400 text-lg">Loading individuals...</p>
        </div>
      </div>
    );
  }


// Update the TableRow component - replace the actions td section:

const TableRow = ({ individual, idx }) => {
  // Check if user is DSP role
  const isDSP = userProfile?.role_id === 'DSP_DD';

  return (
    <tr className="border-b border-slate-700/30 hover:bg-slate-900/50 transition-all duration-300 group">
      <td className="py-5 px-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${getColorClass(idx)} rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-all duration-300`}>
            {getInitials(individual.firstname, individual.lastname)}
          </div>
          <div>
            <button 
              onClick={() => {
                // If DSP role, redirect to daily notes, otherwise to individual details
                const path = isDSP 
                  ? `/dashboard/daily/${individual.id}`
                  : `/dashboard/individual/${individual.id}`;
                router.push(path);
              }}
              className="text-white font-semibold group-hover:text-emerald-400 transition-colors hover:underline text-left"
            >
              {individual.firstname} {individual.lastname}
            </button>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-full bg-slate-700 rounded-full h-1.5 w-20">
                <div className={`h-full rounded-full ${individual.compliance_score >= 95 ? 'bg-lime-500' : individual.compliance_score >= 85 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{width: `${individual.compliance_score}%`}} />
              </div>
              <span className="text-xs text-slate-500 font-medium">{individual.compliance_score}%</span>
            </div>
          </div>
        </div>
      </td>
      <td className="py-5 px-4"><span className="text-slate-300 font-mono text-sm">{individual.individualid}</span></td>
      <td className="py-5 px-4">
        <div className="flex items-center gap-2"><MapPin size={14} className="text-emerald-400" /><span className="text-slate-300 text-sm">{individual.homeassignment || individual.location}</span></div>
      </td>
      <td className="py-5 px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStatusClick(individual)}
            disabled={!canViewIndividuals}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              individual.status === 'Active' 
                ? 'bg-green-900/30 text-green-400 border-green-500/50 hover:bg-green-800/40' 
                : individual.status === 'Review' 
                ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50 hover:bg-yellow-800/40 cursor-pointer' 
                : 'bg-red-900/30 text-red-400 border-red-500/50 hover:bg-red-800/40 cursor-pointer'
            } ${!canViewIndividuals ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {individual.status}
            {(individual.status === 'Review' || individual.status === 'Inactive') && (
              <span className="ml-1">🔍</span>
            )}
          </button>
          {canUpdateStatus && (
            <button
              onClick={() => handleOpenStatusUpdateModal(individual)}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition-all group/btn"
              title="Update Status"
            >
              <Edit2 size={14} className="text-slate-400 group-hover/btn:text-blue-400 transition-colors" />
            </button>
          )}
        </div>
      </td>
      <td className="py-5 px-4">
        <div className="flex items-center gap-2"><Clock size={14} className="text-slate-500" /><span className="text-slate-400 text-sm">{new Date(individual.last_activity).toLocaleDateString()}</span></div>
      </td>
      <td className="py-5 px-4">
        <div className="flex items-center gap-2">
          {/* Goals Button - Navigate to individual details */}
          {canViewIndividuals && (
            <button 
              onClick={() => router.push(`/dashboard/individual/${individual.id}`)} 
              className="p-2 hover:bg-purple-500/20 rounded-lg transition-all group/btn" 
              title="View Goals & Care Plans"
            >
              <Target size={16} className="text-purple-400 group-hover/btn:scale-110 transition-all" />
            </button>
          )}
          
          {/* Daily Notes Button - Navigate to daily notes */}
          {canViewIndividuals && (
            <button 
              onClick={() => router.push(`/dashboard/daily/${individual.id}`)} 
              className="p-2 hover:bg-blue-500/20 rounded-lg transition-all group/btn" 
              title="Daily Notes"
            >
              <FileText size={16} className="text-blue-400 group-hover/btn:scale-110 transition-all" />
            </button>
          )}
          
          {/* Edit - only if user has edit or admin access and NOT DSP */}
          {canEditIndividuals && !isDSP && (
            <button 
              onClick={() => router.push(`/dashboard/individual/${individual.id}?edit=true`)} 
              className="p-2 hover:bg-emerald-500/20 rounded-lg transition-all group/btn" 
              title="Edit"
            >
              <Edit2 size={16} className="text-emerald-400 group-hover/btn:scale-110 transition-all" />
            </button>
          )}
          
          {/* Delete - only if user has admin access */}
          {canDeleteIndividuals && (
            <button 
              onClick={() => handleDeleteIndividual(individual.id)} 
              className="p-2 hover:bg-red-500/20 rounded-lg transition-all group/btn" 
              title="Delete"
            >
              <Trash2 size={16} className="text-red-400 group-hover/btn:scale-110 transition-all" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
  
      <div className="flex flex-1 overflow-hidden">
      


        {/* Status Update Modal */}
{showStatusUpdateModal && selectedStatusInfo && (
  <Dialog open={showStatusUpdateModal} onOpenChange={setShowStatusUpdateModal}>
    <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl max-w-2xl">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
          <Edit2 className="text-blue-400" size={24} />
          Update Status
        </DialogTitle>
      </DialogHeader>
      
       <ScrollArea className="max-h-[calc(90vh-180px)]">
      <div className="space-y-6 py-4">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <h4 className="text-lg font-semibold text-white mb-2">
            Individual: {selectedStatusInfo.name}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Current Status:</p>
              <p className={`font-bold ${
                selectedStatusInfo.currentStatus === 'Active' ? 'text-green-400' :
                selectedStatusInfo.currentStatus === 'Review' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {selectedStatusInfo.currentStatus}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Current Reason:</p>
              <p className="text-white">{selectedStatusInfo.status_reason || 'Not specified'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              New Status *
            </label>
            <select
              value={statusUpdateData.status}
              onChange={(e) => setStatusUpdateData(prev => ({ 
                ...prev, 
                status: e.target.value,
                // Clear reason when switching to Active
                reason: e.target.value === 'Active' ? '' : prev.reason
              }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="">Select New Status</option>
              <option value="Active">Active</option>
              <option value="Review">Review</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {statusUpdateData.status && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Status Reason *
              </label>
              <input
                type="text"
                value={statusUpdateData.reason}
                onChange={(e) => setStatusUpdateData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder={
                  statusUpdateData.status === 'Review' 
                    ? 'Reason for review (e.g., incidents, compliance issues)...'
                    : 'Reason for inactive status (e.g., discharge, leave of absence)...'
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
              />
              <p className="text-xs text-slate-500 mt-2">
                {statusUpdateData.status === 'Review' 
                  ? 'Required: Explain why this individual needs review.'
                  : 'Required: Explain why this individual is inactive.'}
              </p>
            </div>
          )}

          {statusUpdateData.status === 'Active' && selectedStatusInfo.currentStatus !== 'Active' && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-400 mt-1" size={20} />
                <div>
                  <h5 className="text-green-300 font-semibold mb-1">Activation Information:</h5>
                  <ul className="text-sm text-green-100 space-y-1">
                    <li>• Individual will be restored to active service status</li>
                    <li>• Care plans and services will resume</li>
                    <li>• Billing and reporting will restart</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={statusUpdateData.notes}
              onChange={(e) => setStatusUpdateData(prev => ({ ...prev, notes: e.target.value }))}
              rows="3"
              placeholder="Add any additional notes or comments about this status change..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
            />
          </div>

          {statusUpdateData.status === 'Review' && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-yellow-400 mt-1" size={20} />
                <div>
                  <h5 className="text-yellow-300 font-semibold mb-1">Review Process:</h5>
                  <ul className="text-sm text-yellow-100 space-y-1">
                    <li>• Individual will be flagged for administrative review</li>
                    <li>• Services will continue during review period</li>
                    <li>• Review must be completed within 30 days</li>
                    <li>• All documentation will be verified</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {statusUpdateData.status === 'Inactive' && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircleIcon className="text-red-400 mt-1" size={20} />
                <div>
                  <h5 className="text-red-300 font-semibold mb-1">Inactivation Effects:</h5>
                  <ul className="text-sm text-red-100 space-y-1">
                    <li>• All active services will be suspended</li>
                    <li>• Billing will be paused</li>
                    <li>• Care plans will be archived</li>
                    <li>• Reactivation requires new assessment</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
          <button
            onClick={() => {
              setShowStatusUpdateModal(false);
              setSelectedStatusInfo(null);
              setStatusUpdateData({
                status: '',
                reason: '',
                effectiveDate: new Date().toISOString().split('T')[0],
                notes: ''
              });
            }}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateStatus}
            disabled={!statusUpdateData.status || (statusUpdateData.status !== 'Active' && !statusUpdateData.reason.trim())}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            Update Status
          </button>
        </div>
      </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
)}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <main className="p-6 lg:p-8">
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
             <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
  <div>
    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">
                        Individuals
                      </h2>
                      <div className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full">
                        <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                          <Zap size={12} /> LIVE
                        </span>
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
    
                    <p className="text-slate-400 text-lg">
                      Manage {individuals.length} client profiles and care plans
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {canImportIndividuals && (
                      <button 
                        onClick={() => setShowImportModal(true)}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-slate-700"
                      >
                        <Upload size={18} />
                        Import CSV
                      </button>
                    )}
                    {canAddIndividuals && (
                      <button 
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105"
                      >
                        <Plus size={18} />
                        Add Individual
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Individuals Card */}
                  <button 
                    onClick={() => handleStatsCardClick('all')}
                    className={`group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden cursor-pointer ${
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
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-green-400" size={18} />
                          <span className="text-sm font-bold text-green-400">
                            +12%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Total Individuals</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">{totalIndividuals}</p>
                          {filterStatus === 'all' && <Sparkles className="text-lime-400 mb-2 animate-pulse" size={20} />}
                        </div>
                        <p className={`text-xs font-medium mt-2 ${
                          filterStatus === 'all' ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          {filterStatus === 'all' ? '✓ Currently viewing all individuals' : 'Click to view all'}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Active Individuals Card */}
                  <button 
                    onClick={() => handleStatsCardClick('Active')}
                    className={`group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden cursor-pointer ${
                      filterStatus === 'Active' 
                        ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/30' 
                        : 'border-slate-700/50 hover:border-emerald-500/50'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 ${
                          filterStatus === 'Active' 
                            ? 'bg-gradient-to-br from-green-400 to-emerald-500 animate-pulse' 
                            : 'bg-gradient-to-br from-slate-700 to-slate-800'
                        }`}>
                          <CheckCircle className={filterStatus === 'Active' ? 'text-white' : 'text-slate-400'} size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-green-400" size={18} />
                          <span className="text-sm font-bold text-green-400">
                            +5%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Active Individuals</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">
                            {activeIndividuals}
                          </p>
                          {filterStatus === 'Active' && <CheckCircle className="text-green-400 mb-2 animate-pulse" size={20} />}
                        </div>
                        <p className={`text-xs font-medium mt-2 ${
                          filterStatus === 'Active' ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          {filterStatus === 'Active' ? '✓ Currently viewing active individuals' : 'Click to view active only'}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Average Compliance Card */}
                  <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-lime-500 to-green-600 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                          <Brain className="text-slate-400" size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-green-400" size={18} />
                          <span className="text-sm font-bold text-green-400">
                            +8%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Avg Compliance</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">
                            {individuals.length > 0 
                              ? Math.round(individuals.reduce((acc, ind) => acc + (ind.compliance_score || 0), 0) / individuals.length)
                              : 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pending Reviews Card */}
                  <button 
                    onClick={() => handleStatsCardClick('Review')}
                    className={`group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden cursor-pointer ${
                      filterStatus === 'Review' 
                        ? 'border-amber-500/50 shadow-lg shadow-amber-500/30' 
                        : 'border-slate-700/50 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500 to-yellow-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300 ${
                          filterStatus === 'Review' 
                            ? 'bg-gradient-to-br from-amber-500 to-yellow-500 animate-pulse' 
                            : 'bg-gradient-to-br from-slate-700 to-slate-800'
                        }`}>
                          <AlertCircle className={filterStatus === 'Review' ? 'text-white' : 'text-slate-400'} size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="text-red-400" size={18} />
                          <span className="text-sm font-bold text-red-400">
                            -3%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Pending Reviews</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">
                            {reviewIndividuals}
                          </p>
                          {filterStatus === 'Review' && <AlertCircle className="text-amber-400 mb-2 animate-pulse" size={20} />}
                        </div>
                        <p className={`text-xs font-medium mt-2 ${
                          filterStatus === 'Review' ? 'text-amber-400' : 'text-slate-500'
                        }`}>
                          {filterStatus === 'Review' ? '✓ Currently viewing pending reviews' : 'Click to view pending reviews'}
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Main Content */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300">
                  {/* Search and Filter */}
                  <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="flex-1 flex items-center gap-3 bg-slate-900/50 rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
                      <Search size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                      <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, ID, or home..." 
                        className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
                      />
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800 text-white rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 font-semibold"
                      >
                        <Filter size={18} />
                        Filters
                        <span className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                          filterStatus === 'all' ? 'bg-emerald-500/20 text-emerald-400' :
                          filterStatus === 'Active' ? 'bg-green-500/20 text-green-400' :
                          filterStatus === 'Review' ? 'bg-amber-500/20 text-amber-400' :
                          filterStatus === 'Inactive' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-700 text-slate-400'
                        }`}>
                          {filterStatus === 'all' ? 'All' : filterStatus}
                        </span>
                      </button>
                      
                      {showFilterMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl p-2 z-20 shadow-2xl">
                          {['all', 'Active', 'Review', 'Inactive'].map(status => (
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
                              <span>{status === 'all' ? 'All Status' : status}</span>
                              {filterStatus === status && <CheckCircle size={16} />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {canExportIndividuals && (
                      <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800 text-white rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 font-semibold"
                      >
                        <Download size={18} />
                        Export
                      </button>
                    )}
                  </div>

                  {/* Current Filter Status Indicator */}
                  {filterStatus !== 'all' && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {filterStatus === 'Active' && <CheckCircle className="text-green-400" size={18} />}
                          {filterStatus === 'Review' && <AlertCircle className="text-amber-400" size={18} />}
                          {filterStatus === 'Inactive' && <AlertCircle className="text-red-400" size={18} />}
                          <span className="text-white font-semibold">
                            Showing {filterStatus === 'Active' ? 'Active' : filterStatus === 'Review' ? 'Pending Review' : 'Inactive'} Individuals
                          </span>
                          <span className="text-slate-400 text-sm">
                            ({filteredIndividuals.length} of {individuals.length})
                          </span>
                        </div>
                        <button 
                          onClick={() => setFilterStatus('all')}
                          className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                          <X size={14} />
                          Clear Filter
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Table */}
                  {filteredIndividuals.length === 0 ? (
                    <div className="text-center py-16">
                      <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-slate-400 mb-2">No individuals found</h3>
                      <p className="text-slate-500">
                        {filterStatus !== 'all' 
                          ? `No individuals found with status: ${filterStatus}` 
                          : individuals.length === 0 
                            ? 'Add your first individual to get started' 
                            : 'Try adjusting your search or filters'}
                      </p>
                      {filterStatus !== 'all' && (
                        <button 
                          onClick={() => setFilterStatus('all')}
                          className="mt-4 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                        >
                          Show All Individuals
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
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
      onClick={() => handleSort('id')}
      className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider cursor-pointer hover:text-emerald-400 transition-colors group"
    >
      <div className="flex items-center gap-2">
        ID
        {sortColumn === 'id' && (
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
      onClick={() => handleSort('lastActivity')}
      className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider cursor-pointer hover:text-emerald-400 transition-colors group"
    >
      <div className="flex items-center gap-2">
        Last Activity
        {sortColumn === 'lastActivity' && (
          sortDirection === 'asc' ? <ChevronUp size={14} className="text-emerald-400" /> : <ChevronDown size={14} className="text-emerald-400" />
        )}
      </div>
    </th>
    <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Actions</th>
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
                      
                      <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700/50">
                        <p className="text-slate-400 text-sm">
                          Showing <span className="text-white font-semibold">{filteredIndividuals.length}</span> of <span className="text-white font-semibold">{individuals.length}</span> individuals
                          {filterStatus !== 'all' && (
                            <span className="ml-2 px-2 py-1 bg-slate-800 rounded-lg">
                              <span className="text-slate-300">Filter: </span>
                              <span className="font-semibold text-emerald-400">{filterStatus}</span>
                            </span>
                          )}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </main>
          </ScrollArea>
        </div>
      </div>

      {/* Status Review Modal */}
      {showStatusModal && selectedStatusInfo && (
        <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
          <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                {selectedStatusInfo.status === 'Review' ? (
                  <AlertCircle className="text-yellow-400" size={24} />
                ) : (
                  <AlertCircleIcon className="text-red-400" size={24} />
                )}
                {selectedStatusInfo.status} Status Review
              </DialogTitle>
            </DialogHeader>

            {/* Add this button to the existing Status Review Modal */}
<div className="flex items-center justify-between mb-4">
  <button
    onClick={() => {
      setShowStatusModal(false);
      handleOpenStatusUpdateModal(selectedStatusInfo);
    }}
    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all"
  >
    <Edit2 size={16} />
    Update Status
  </button>
</div>
            
               <ScrollArea className="max-h-[calc(90vh-180px)]">
            <div className="space-y-6 py-4">
              <div className="bg-slate-800/50 rounded-xl p-4">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Individual: {selectedStatusInfo.name}
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Status:</p>
                    <p className={`font-bold ${
                      selectedStatusInfo.status === 'Review' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {selectedStatusInfo.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Status Reason:</p>
                    <p className="text-white">{selectedStatusInfo.status_reason || 'Not specified'}</p>
                  </div>
                  {selectedStatusInfo.review_date && (
                    <div>
                      <p className="text-slate-400">Last Reviewed:</p>
                      <p className="text-white">
                        {new Date(selectedStatusInfo.review_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {selectedStatusInfo.reviewed_by && (
                    <div>
                      <p className="text-slate-400">Reviewed By:</p>
                      <p className="text-white">{selectedStatusInfo.reviewed_by}</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Review Notes & Actions Required
                </label>
                <textarea
                  value={statusReviewNotes}
                  onChange={(e) => setStatusReviewNotes(e.target.value)}
                  rows={6}
                  placeholder={
                    selectedStatusInfo.status === 'Review' 
                      ? 'Enter review notes, action items, or requirements...'
                      : 'Enter reasons for inactive status and required steps for reactivation...'
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">
                  {selectedStatusInfo.status === 'Review' 
                    ? 'Document what needs to be reviewed and any action items required.'
                    : 'Document why this individual is inactive and steps needed to reactivate.'}
                </p>
              </div>

              {selectedStatusInfo.status === 'Review' && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-yellow-400 mt-1" size={20} />
                    <div>
                      <h5 className="text-yellow-300 font-semibold mb-1">Pending Review Items:</h5>
                      <ul className="text-sm text-yellow-100 space-y-1">
                        <li>• Review recent incidents and notes</li>
                        <li>• Verify compliance documentation</li>
                        <li>• Check care plan updates</li>
                        <li>• Review medication changes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {selectedStatusInfo.status === 'Inactive' && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircleIcon className="text-red-400 mt-1" size={20} />
                    <div>
                      <h5 className="text-red-300 font-semibold mb-1">Inactive Status Details:</h5>
                      <ul className="text-sm text-red-100 space-y-1">
                        <li>• Individual is currently not receiving services</li>
                        <li>• All active care plans are suspended</li>
                        <li>• Billing and reporting are paused</li>
                        <li>• Reactivation requires administrator approval</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedStatusInfo(null);
                  }}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300"
                >
                  Close
                </button>
                <button
                  onClick={handleUpdateStatusReview}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300"
                >
                  <Save size={18} />
                  Save Review Notes
                </button>
              </div>
            </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Individual Modal - Only shown if user has permission */}
      {showAddModal && canAddIndividuals && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center">
                  <Plus className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Add New Individual</h3>
                  <p className="text-slate-400 text-sm">Enter individual information</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="text-slate-400" size={24} />
              </button>
            </div>

            <ScrollArea className="h-[calc(90vh-180px)]">
              <form onSubmit={handleAddIndividual} className="p-6 space-y-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <User size={20} />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">First Name *</label>
                      <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Last Name *</label>
                      <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Individual ID *</label>
                      <input
                        type="text"
                        name="individualid"
                        value={formData.individualid}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Date of Birth *</label>
                      <input
                        type="date"
                        name="dateofbirth"
                        value={formData.dateofbirth}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <HomeIcon size={20} />
                    Location & Assignment
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Home Assignment *</label>
                      <input
                        type="text"
                        name="homeassignment"
                        value={formData.homeassignment}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., Oak Ridge Home"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, State"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Admission Date *</label>
                      <input
                        type="date"
                        name="admissiondate"
                        value={formData.admissiondate}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      >
                        <option value="Active">Active</option>
                        <option value="Review">Review</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Status Reason</label>
                      <input
                        type="text"
                        name="status_reason"
                        value={formData.status_reason}
                        onChange={handleInputChange}
                        placeholder="Reason for status (optional)"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Heart size={20} />
                    Medical Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Primary Diagnosis</label>
                      <input
                        type="text"
                        name="primarydiagnosis"
                        value={formData.primarydiagnosis}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Medicaid Number</label>
                      <input
                        type="text"
                        name="medicaidnumber"
                        value={formData.medicaidnumber}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all font-mono"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Allergies</label>
                      <input
                        type="text"
                        name="allergies"
                        value={formData.allergies}
                        onChange={handleInputChange}
                        placeholder="List any known allergies"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Guardian Information */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Shield size={20} />
                    Guardian & Emergency Contact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Guardian Name</label>
                      <input
                        type="text"
                        name="guardianname"
                        value={formData.guardianname}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Guardian Phone</label>
                      <input
                        type="tel"
                        name="guardianphone"
                        value={formData.guardianphone}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Guardian Email</label>
                      <input
                        type="email"
                        name="guardianemail"
                        value={formData.guardianemail}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Emergency Contact</label>
                      <input
                        type="text"
                        name="emergencycontact"
                        value={formData.emergencycontact}
                        onChange={handleInputChange}
                        placeholder="Name and phone"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <FileText size={20} />
                    Additional Notes
                  </h4>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Any additional information..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300"
                  >
                    <Save size={18} />
                    Save Individual
                  </button>
                </div>
              </form>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && canImportIndividuals && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center">
                  <Upload className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Import Individuals</h3>
                  <p className="text-slate-400 text-sm">Upload a CSV file with individual data</p>
                </div>
              </div>
              <button 
                onClick={() => setShowImportModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="text-slate-400" size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h4 className="text-white font-bold mb-3">CSV Format Requirements</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>First row should contain column headers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Required fields: First Name, Last Name, Individual ID, Home Assignment, Admission Date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>Date format: YYYY-MM-DD</span>
                  </li>
                </ul>
              </div>

              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-8 text-center transition-all duration-300 cursor-pointer">
                <Upload className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-white font-semibold mb-2">Choose CSV file or drag and drop</p>
                <p className="text-slate-400 text-sm mb-4">Maximum file size: 5MB</p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="hidden"
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 cursor-pointer"
                >
                  <Upload size={18} />
                  Select File
                </label>
              </div>

              <button
                onClick={() => setShowImportModal(false)}
                className="w-full px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualsPage;

