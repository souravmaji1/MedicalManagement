'use client'

import React, { useState, useEffect } from 'react';
import { 
  Pill, Plus, Search, Filter, Edit2, Trash2, Save, X, CheckCircle, XCircle, 
  Clock, AlertCircle, Calendar, User, Activity, TrendingUp, Download, ArrowLeft,
  ChevronRight, ChevronDown, Loader2, AlertTriangle, FileText, PlusCircle,
  MinusCircle, RotateCcw, History, BarChart3, Settings, Eye,
  Users, FileText as FileTextIcon, Home, MapPin, Brain, Zap, Sparkles, Award,
  ChevronLeft, Bell, Menu, Shield
} from 'lucide-react';
import { ScrollArea } from "../../components/ui/scroll-area";
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { PERMISSIONS } from '../../utils/permissions';

// Initialize Supabase client
const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const MedicationsPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();
  
  const [individuals, setIndividuals] = useState([]);
  const [selectedIndividual, setSelectedIndividual] = useState(null);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMARModal, setShowMARModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('medicine');

  // Permission checks
  const canViewMedications = hasAnyPermission([
    PERMISSIONS.MAR_CREATE,
    PERMISSIONS.MAR_APPROVE,
    PERMISSIONS.MAR_FULL,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canAddMedications = hasAnyPermission([
    PERMISSIONS.MAR_FULL,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canEditMedications = hasAnyPermission([
    PERMISSIONS.MAR_FULL,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canDeleteMedications = hasAnyPermission([
    PERMISSIONS.MAR_FULL,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canCreateMAREntries = hasAnyPermission([
    PERMISSIONS.MAR_CREATE,
    PERMISSIONS.MAR_FULL,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canApproveMAREntries = hasAnyPermission([
    PERMISSIONS.MAR_APPROVE,
    PERMISSIONS.MAR_FULL,
    PERMISSIONS.FULL_ACCESS
  ]);

  // Medication form state
  const [medicationForm, setMedicationForm] = useState({
    medicationname: '',
    dosage: '',
    route: '',
    frequency: '',
    startdate: '',
    enddate: '',
    prescribedby: '',
    pharmacy: '',
    indication: '',
    specialinstructions: '',
    times: [],
    prn: false,
    prnreason: ''
  });

  // MAR entry form state
  const [marEntry, setMarEntry] = useState({
    medicationid: '',
    time: '',
    status: '',
    notes: '',
    givenby: '',
    refusedreason: '',
    heldreason: '',
    lateminutes: ''
  });

  const [marHistory, setMarHistory] = useState([]);

  // Time blocks for MAR
  const timeBlocks = [
    '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
  ];

  const routes = ['PO', 'IM', 'IV', 'SubQ', 'Topical', 'Inhalation', 'Rectal', 'Sublingual', 'Nasal'];
  const frequencies = ['Daily', 'BID', 'TID', 'QID', 'QHS', 'QAM', 'PRN', 'Weekly', 'Monthly'];

   const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
    { id: 'individual', icon: Users, label: 'Individuals', badge: null },
    { id: 'daily', icon: FileText, label: 'Daily Notes', badge: '12' },
    { id: 'medicine', icon: Pill, label: 'Medications', badge: null },
    { id: 'incident', icon: AlertTriangle, label: 'Incidents', badge: '3' },
    { id: 'hcbs', icon: MapPin, label: 'HCBS Tracking', badge: null },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', badge: null },
    { id: 'settings', icon: Settings, label: 'Settings', badge: null },
  ];

  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canViewMedications) {
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
        // House managers only see individuals in their facility
        query = query.eq('homeassignment', userProfile.facility);
      } else if (userProfile.role_id === 'DSP_DD') {
        // DSPs only see individuals in their assigned home
        query = query.eq('homeassignment', userProfile.facility);
      } else if (userProfile.division === 'MI' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        // MI staff see only their division's individuals
        query = query.eq('division', 'MI');
      } else if (userProfile.division === 'SUD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        // SUD staff see only their division's individuals
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

  const fetchMedications = async (individualId) => {
    try {
      const individual = individuals.find(ind => ind.id === individualId);
      if (individual && individual.medications) {
        setMedications(individual.medications);
      } else {
        setMedications([]);
      }
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  };

  const handleAddMedication = async (e) => {
    e.preventDefault();
    
    if (!canAddMedications) {
      alert('You do not have permission to add medications.');
      return;
    }

    try {
      const newMedication = {
        id: Date.now().toString(),
        ...medicationForm,
        createddate: new Date().toISOString(),
        status: 'Active',
        compliance: 0,
        created_by: userProfile.fullname,
        created_by_role: userProfile.role_name
      };

      const updatedMedications = [...medications, newMedication];
      
      const { error } = await supabase
        .from('individuals')
        .update({ 
          medications: updatedMedications,
          last_activity: new Date().toISOString()
        })
        .eq('id', selectedIndividual.id);

      if (error) throw error;

      setMedications(updatedMedications);
      setShowAddModal(false);
      resetMedicationForm();
      alert('Medication added successfully!');
    } catch (error) {
      console.error('Error adding medication:', error);
      alert('Error adding medication. Please try again.');
    }
  };

  const handleMARentry = async (e) => {
    e.preventDefault();
    
    if (!canCreateMAREntries) {
      alert('You do not have permission to create MAR entries.');
      return;
    }

    try {
      const newMAREntry = {
        id: Date.now().toString(),
        ...marEntry,
        date: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        given_by: userProfile.fullname,
        given_by_role: userProfile.role_name,
        approved: canApproveMAREntries,
        approved_by: canApproveMAREntries ? userProfile.fullname : null
      };

      const updatedHistory = [...marHistory, newMAREntry];
      
      // Update medication with MAR entry
      const updatedMedications = medications.map(med => 
        med.id === marEntry.medicationid 
          ? { ...med, lastadministered: newMAREntry.date, compliance: calculateCompliance(med.id) }
          : med
      );

      const { error } = await supabase
        .from('individuals')
        .update({ 
          medications: updatedMedications,
          marhistory: updatedHistory,
          last_activity: new Date().toISOString()
        })
        .eq('id', selectedIndividual.id);

      if (error) throw error;

      setMedications(updatedMedications);
      setMarHistory(updatedHistory);
      setShowMARModal(false);
      resetMARForm();
      alert('MAR entry recorded successfully!');
    } catch (error) {
      console.error('Error recording MAR entry:', error);
      alert('Error recording MAR entry. Please try again.');
    }
  };

  const calculateCompliance = (medicationId) => {
    const medHistory = marHistory.filter(entry => 
      entry.medicationid === medicationId && 
      entry.status === 'Given'
    );
    const expectedDoses = 30;
    return Math.round((medHistory.length / expectedDoses) * 100);
  };

  const checkMissedDoses = () => {
    const now = new Date();
    const missedDoses = [];
    
    medications.forEach(med => {
      if (med.times) {
        med.times.forEach(time => {
          const [hours, minutes] = time.split(':').map(Number);
          const doseTime = new Date(now);
          doseTime.setHours(hours, minutes, 0, 0);
          
          if (now > doseTime && !isDoseAdministered(med.id, time)) {
            missedDoses.push({
              medication: med.medicationname,
              time: time,
              overdue: Math.floor((now - doseTime) / 60000)
            });
          }
        });
      }
    });
    
    return missedDoses;
  };

  const isDoseAdministered = (medicationId, time) => {
    const today = new Date().toDateString();
    return marHistory.some(entry => 
      entry.medicationid === medicationId && 
      entry.time === time && 
      new Date(entry.date).toDateString() === today
    );
  };

  const createMedErrorIncident = async (medicationId, errorType, details) => {
    try {
      const incident = {
        id: Date.now().toString(),
        type: 'Medication Error',
        subtype: errorType,
        details: details,
        medicationid: medicationId,
        date: new Date().toISOString(),
        status: 'Open',
        created_by: userProfile.fullname,
        created_by_role: userProfile.role_name
      };
      alert(`Med error incident created: ${errorType}\nDetails: ${details}`);
    } catch (error) {
      console.error('Error creating incident:', error);
    }
  };

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

  const resetMedicationForm = () => {
    setMedicationForm({
      medicationname: '',
      dosage: '',
      route: '',
      frequency: '',
      startdate: '',
      enddate: '',
      prescribedby: '',
      pharmacy: '',
      indication: '',
      specialinstructions: '',
      times: [],
      prn: false,
      prnreason: ''
    });
  };

  const resetMARForm = () => {
    setMarEntry({
      medicationid: '',
      time: '',
      status: '',
      notes: '',
      givenby: '',
      refusedreason: '',
      heldreason: '',
      lateminutes: ''
    });
  };

  const filteredIndividuals = individuals.filter(ind => {
    const matchesSearch = 
      ind.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.individualid?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const missedDoses = checkMissedDoses();

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
            placeholder="Search medications..." 
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
          />
          <kbd className="px-2 py-0.5 text-xs bg-slate-700 rounded text-slate-400 font-mono">⌘K</kbd>
        </div>
        
        <button className="relative p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-105 group">
          <Bell className="text-slate-300 group-hover:text-emerald-400 transition-colors" size={20} />
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
              {userProfile?.fullname?.charAt(0) || 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
          </div>
          <ChevronDown size={16} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
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
        
        <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Medication Compliance</span>
            <span className="text-xs text-blue-400 font-bold">
              {medications.length > 0 
                ? Math.round(medications.reduce((acc, med) => acc + (med.compliance || 0), 0) / medications.length) + '%'
                : '0%'
              }
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000" 
              style={{width: medications.length > 0 
                ? Math.round(medications.reduce((acc, med) => acc + (med.compliance || 0), 0) / medications.length) + '%'
                : '0%'
              }}>
            </div>
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
                if (item.id !== 'medications') {
                  router.push(`/${item.id === 'dashboard' ? 'dashboard' : item.id}`);
                }
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
            <p className="text-xs text-slate-400 leading-relaxed">Alabama DD Compliant System</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Permission Check - No Access Screen
  if (!profileLoading && !canViewMedications) {
    return (
      <div className="h-screen flex flex-col bg-slate-950 text-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-slate-400 mb-6">
              You do not have permission to view medications. Please contact your administrator if you believe this is an error.
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
          <p className="text-slate-400 text-lg">Loading medications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      <NavBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <main className="p-6 lg:p-8">
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">
                        Medication Management
                      </h2>
                      <div className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full">
                        <span className="text-blue-400 text-xs font-bold flex items-center gap-1">
                          <Pill size={12} /> MAR
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-lg">
                      MAR Module • IPMS Aligned Medication Tracking
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => router.push('/dashboard')}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-slate-700"
                    >
                      <ChevronLeft size={18} />
                      Back to Dashboard
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="group relative bg-gradient-to-br from-blue-600/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600 to-cyan-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                          <Pill className="text-white" size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-blue-400" size={18} />
                          <span className="text-sm font-bold text-blue-400">
                            +{medications.length > 0 ? '5%' : '0%'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Active Medications</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">{medications.length}</p>
                          <Pill className="text-blue-400 mb-2" size={20} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group relative bg-gradient-to-br from-green-600/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6 hover:border-green-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-600 to-emerald-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                          <CheckCircle className="text-white" size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-green-400" size={18} />
                          <span className="text-sm font-bold text-green-400">
                            +{medications.filter(med => med.compliance > 80).length > 0 ? '3%' : '0%'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">High Compliance</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">
                            {medications.filter(med => med.compliance > 80).length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group relative bg-gradient-to-br from-orange-600/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-600 to-red-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                          <AlertTriangle className="text-white" size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-orange-400" size={18} />
                          <span className="text-sm font-bold text-orange-400">
                            +{missedDoses.length > 0 ? '8%' : '0%'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Missed Today</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">{missedDoses.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group relative bg-gradient-to-br from-purple-600/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                          <BarChart3 className="text-white" size={26} />
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="text-purple-400" size={18} />
                          <span className="text-sm font-bold text-purple-400">
                            +{medications.length > 0 ? '2%' : '0%'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-400 text-sm font-medium">Avg Compliance</p>
                        <div className="flex items-end gap-2">
                          <p className="text-4xl font-black text-white">
                            {Math.round(medications.reduce((acc, med) => acc + (med.compliance || 0), 0) / (medications.length || 1))}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300">
                  {!selectedIndividual ? (
                    <>
                      {/* Individual Selection */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">Select Individual</h3>
                          <p className="text-slate-400">Choose an individual to manage their medications</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-3 bg-slate-900/50 rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
                            <Search size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                            <input 
                              type="text"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search individuals..." 
                              className="bg-transparent border-none outline-none text-sm text-white w-64 placeholder:text-slate-500"
                            />
                          </div>
                        </div>
                      </div>

                      <ScrollArea className="h-[400px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredIndividuals.map((individual, idx) => (
                            <div
                              key={individual.id}
                              onClick={() => {
                                setSelectedIndividual(individual);
                                fetchMedications(individual.id);
                              }}
                              className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 group"
                            >
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-12 h-12 bg-gradient-to-br ${getColorClass(idx)} rounded-xl flex items-center justify-center text-white font-bold`}>
                                  {getInitials(individual.firstname, individual.lastname)}
                                </div>
                                <div>
                                  <h3 className="text-white font-semibold group-hover:text-emerald-400 transition-colors">
                                    {individual.firstname} {individual.lastname}
                                  </h3>
                                  <p className="text-slate-400 text-sm">ID: {individual.individualid}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">{individual.homeassignment}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  individual.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                                }`}>
                                  {individual.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </>
                  ) : (
                    <>
                      {/* Selected Individual Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                            {getInitials(selectedIndividual.firstname, selectedIndividual.lastname)}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white">
                              {selectedIndividual.firstname} {selectedIndividual.lastname}
                            </h3>
                            <p className="text-slate-400">ID: {selectedIndividual.individualid} • {selectedIndividual.homeassignment}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setSelectedIndividual(null)}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300"
                          >
                            Change Individual
                          </button>
                          {canAddMedications && (
                            <button
                              onClick={() => setShowAddModal(true)}
                              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300"
                            >
                              <Plus size={18} />
                              Add Medication
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Medications List */}
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-white">Active Medications</h3>
                            <p className="text-slate-400">Manage medication schedules and MAR entries</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {canCreateMAREntries && (
                              <button
                                onClick={() => setShowMARModal(true)}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
                              >
                                <FileText size={18} />
                                MAR Entry
                              </button>
                            )}
                          </div>
                        </div>

                        {medications.length === 0 ? (
                          <div className="text-center py-16">
                            <Pill className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h4 className="text-xl font-bold text-slate-400 mb-2">No medications found</h4>
                            <p className="text-slate-500">Add the first medication to get started</p>
                          </div>
                        ) : (
                          <ScrollArea className="h-[500px]">
                            <div className="space-y-4">
                              {medications.map((medication) => (
                                <div key={medication.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-emerald-500/30 transition-all duration-300">
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-3">
                                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                                        <Pill className="text-white" size={24} />
                                      </div>
                                      <div>
                                        <h4 className="text-white font-bold text-lg">{medication.medicationname}</h4>
                                        <p className="text-slate-400">{medication.dosage} • {medication.route} • {medication.frequency}</p>
                                        {medication.prn && (
                                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900/30 text-yellow-400 text-xs rounded-full mt-1">
                                            <AlertCircle size={12} />
                                            PRN
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="text-right">
                                        <p className="text-sm text-slate-400">Compliance</p>
                                        <p className={`text-lg font-bold ${
                                          medication.compliance >= 90 ? 'text-green-400' :
                                          medication.compliance >= 70 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                          {medication.compliance}%
                                        </p>
                                      </div>
                                      {canDeleteMedications && (
                                        <button
                                          onClick={() => {
                                            if (confirm('Are you sure you want to delete this medication?')) {
                                              // Delete logic here
                                            }
                                          }}
                                          className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-300"
                                        >
                                          <Trash2 size={16} className="text-red-400" />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div>
                                      <p className="text-slate-400 text-sm">Indication</p>
                                      <p className="text-white text-sm">{medication.indication || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-400 text-sm">Prescribed By</p>
                                      <p className="text-white text-sm">{medication.prescribedby || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-400 text-sm">Start Date</p>
                                      <p className="text-white text-sm">{new Date(medication.startdate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-slate-400 text-sm">Status</p>
                                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                                        medication.status === 'Active' ? 'bg-green-900/30 text-green-400' :
                                        medication.status === 'On Hold' ? 'bg-yellow-900/30 text-yellow-400' :
                                        'bg-red-900/30 text-red-400'
                                      }`}>
                                        {medication.status}
                                      </span>
                                    </div>
                                  </div>

                                  {medication.specialinstructions && (
                                    <div className="mb-4">
                                      <p className="text-slate-400 text-sm mb-1">Special Instructions</p>
                                      <p className="text-white text-sm bg-slate-800 rounded-lg p-2">{medication.specialinstructions}</p>
                                    </div>
                                  )}

                                  {/* Time Block MAR */}
                                  <div className="border-t border-slate-700 pt-4">
                                    <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                                      <Clock size={16} />
                                      Today's MAR Schedule
                                    </h5>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                      {timeBlocks.map(time => {
                                        const isAdministered = isDoseAdministered(medication.id, time);
                                        const isScheduled = medication.times?.includes(time);
                                        
                                        if (!isScheduled) return null;
                                        
                                        return (
                                          <div
                                            key={time}
                                            className={`p-3 rounded-lg border text-center transition-all duration-300 ${
                                              isAdministered
                                                ? 'bg-green-900/30 border-green-500/50 text-green-400'
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-emerald-500/50 cursor-pointer hover:scale-105'
                                            }`}
                                            onClick={() => {
                                              if (!isAdministered && canCreateMAREntries) {
                                                setMarEntry({
                                                  ...marEntry,
                                                  medicationid: medication.id,
                                                  time: time
                                                });
                                                setShowMARModal(true);
                                              }
                                            }}
                                          >
                                            <p className="text-sm font-semibold">{time}</p>
                                            <p className="text-xs mt-1">
                                              {isAdministered ? 'Given' : 'Due'}
                                            </p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </main>
          </ScrollArea>
        </div>
      </div>

      {/* Add Medication Modal */}
      {showAddModal && canAddMedications && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Plus className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Add New Medication</h3>
                  <p className="text-slate-400 text-sm">Enter medication information</p>
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
              <form onSubmit={handleAddMedication} className="p-6 space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Pill size={20} />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">Medication Name *</label>
                      <input
                        type="text"
                        value={medicationForm.medicationname}
                        onChange={(e) => setMedicationForm({...medicationForm, medicationname: e.target.value})}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Dosage *</label>
                      <input
                        type="text"
                        value={medicationForm.dosage}
                        onChange={(e) => setMedicationForm({...medicationForm, dosage: e.target.value})}
                        required
                        placeholder="e.g., 10mg, 1 tablet"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Route *</label>
                      <select
                        value={medicationForm.route}
                        onChange={(e) => setMedicationForm({...medicationForm, route: e.target.value})}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      >
                        <option value="">Select Route</option>
                        {routes.map(route => (
                          <option key={route} value={route}>{route}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Frequency *</label>
                      <select
                        value={medicationForm.frequency}
                        onChange={(e) => setMedicationForm({...medicationForm, frequency: e.target.value})}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      >
                        <option value="">Select Frequency</option>
                        {frequencies.map(freq => (
                          <option key={freq} value={freq}>{freq}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">PRN Medication</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setMedicationForm({...medicationForm, prn: !medicationForm.prn})}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            medicationForm.prn 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {medicationForm.prn ? 'Yes' : 'No'}
                        </button>
                        {medicationForm.prn && (
                          <input
                            type="text"
                            value={medicationForm.prnreason}
                            onChange={(e) => setMedicationForm({...medicationForm, prnreason: e.target.value})}
                            placeholder="PRN reason"
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scheduling */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    Schedule
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Administration Times</label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeBlocks.map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => {
                              const times = medicationForm.times.includes(time)
                                ? medicationForm.times.filter(t => t !== time)
                                : [...medicationForm.times, time];
                              setMedicationForm({...medicationForm, times});
                            }}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                              medicationForm.times.includes(time)
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Start Date *</label>
                        <input
                          type="date"
                          value={medicationForm.startdate}
                          onChange={(e) => setMedicationForm({...medicationForm, startdate: e.target.value})}
                          required
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
                        <input
                          type="date"
                          value={medicationForm.enddate}
                          onChange={(e) => setMedicationForm({...medicationForm, enddate: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prescriber Information */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <User size={20} />
                    Prescriber & Pharmacy
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Prescribed By *</label>
                      <input
                        type="text"
                        value={medicationForm.prescribedby}
                        onChange={(e) => setMedicationForm({...medicationForm, prescribedby: e.target.value})}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Pharmacy</label>
                      <input
                        type="text"
                        value={medicationForm.pharmacy}
                        onChange={(e) => setMedicationForm({...medicationForm, pharmacy: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <FileText size={20} />
                    Additional Information
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Indication</label>
                      <input
                        type="text"
                        value={medicationForm.indication}
                        onChange={(e) => setMedicationForm({...medicationForm, indication: e.target.value})}
                        placeholder="Reason for medication"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Special Instructions</label>
                      <textarea
                        value={medicationForm.specialinstructions}
                        onChange={(e) => setMedicationForm({...medicationForm, specialinstructions: e.target.value})}
                        rows="3"
                        placeholder="Any special administration instructions"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
                      />
                    </div>
                  </div>
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
                    Save Medication
                  </button>
                </div>
              </form>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* MAR Entry Modal */}
      {showMARModal && canCreateMAREntries && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">MAR Entry</h3>
                  <p className="text-slate-400 text-sm">Medication Administration Record</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMARModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="text-slate-400" size={24} />
              </button>
            </div>

            <form onSubmit={handleMARentry} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Medication</label>
                  <select
                    value={marEntry.medicationid}
                    onChange={(e) => setMarEntry({...marEntry, medicationid: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Medication</option>
                    {medications.map(med => (
                      <option key={med.id} value={med.id}>{med.medicationname} - {med.dosage}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Time</label>
                  <select
                    value={marEntry.time}
                    onChange={(e) => setMarEntry({...marEntry, time: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Time</option>
                    {timeBlocks.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={marEntry.status}
                    onChange={(e) => setMarEntry({...marEntry, status: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                  >
                    <option value="">Select Status</option>
                    <option value="Given">Given</option>
                    <option value="Refused">Refused</option>
                    <option value="Held">Held</option>
                    <option value="Late">Late</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Given By</label>
                  <input
                    type="text"
                    value={marEntry.givenby}
                    onChange={(e) => setMarEntry({...marEntry, givenby: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                {marEntry.status === 'Refused' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Refusal Reason</label>
                    <input
                      type="text"
                      value={marEntry.refusedreason}
                      onChange={(e) => setMarEntry({...marEntry, refusedreason: e.target.value})}
                      required
                      placeholder="Reason for refusal"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                )}
                {marEntry.status === 'Held' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Hold Reason</label>
                    <input
                      type="text"
                      value={marEntry.heldreason}
                      onChange={(e) => setMarEntry({...marEntry, heldreason: e.target.value})}
                      required
                      placeholder="Reason for holding dose"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                )}
                {marEntry.status === 'Late' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Minutes Late</label>
                    <input
                      type="number"
                      value={marEntry.lateminutes}
                      onChange={(e) => setMarEntry({...marEntry, lateminutes: e.target.value})}
                      required
                      placeholder="e.g., 15"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Notes</label>
                  <textarea
                    value={marEntry.notes}
                    onChange={(e) => setMarEntry({...marEntry, notes: e.target.value})}
                    rows="3"
                    placeholder="Additional notes..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    if (marEntry.status === 'Refused' || marEntry.status === 'Held' || marEntry.status === 'Late') {
                      createMedErrorIncident(marEntry.medicationid, marEntry.status, marEntry.notes);
                    }
                    setShowMARModal(false);
                  }}
                  className="px-4 py-2 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                  <AlertTriangle size={16} />
                  Create Incident
                </button>
                <button
                  type="button"
                  onClick={() => setShowMARModal(false)}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all"
                >
                  <Save size={18} />
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationsPage;