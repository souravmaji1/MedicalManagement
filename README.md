'use client'

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Plus, Search, Filter, Edit2, Trash2, Save, X, CheckCircle, XCircle, 
  Clock, AlertCircle, Calendar, User, Activity, TrendingUp, Download, 
  ChevronRight, ChevronDown, Loader2, FileText, Upload, Bell, ArrowLeft,
  Shield, Eye, MessageSquare, Paperclip, History, BarChart3,
  TrendingDown, AlertOctagon, Info, CheckSquare, RotateCcw,
  Users, FileText as FileTextIcon, Pill, Home, Settings, Menu,
  MapPin, Brain, Zap, Sparkles, Award, ChevronLeft
} from 'lucide-react';
import { ScrollArea } from "../../components/ui/scroll-area";
import { useUser, UserButton } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '../../contexts/userProfileContext';
import { PERMISSIONS } from '../../utils/permissions';

// Initialize Supabase client
const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const IncidentsPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();
  
  const [individuals, setIndividuals] = useState([]);
  const [selectedIndividual, setSelectedIndividual] = useState(null);
  const [allIncidents, setAllIncidents] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('incident');
  const [statsFilter, setStatsFilter] = useState('all');

  // Permission checks
  const canViewIncidents = hasAnyPermission([
    PERMISSIONS.INCIDENTS_CREATE,
    PERMISSIONS.INCIDENTS_APPROVE,
    PERMISSIONS.INCIDENTS_REVIEW,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canCreateIncidents = hasAnyPermission([
    PERMISSIONS.INCIDENTS_CREATE,
    PERMISSIONS.INCIDENTS_APPROVE,
    PERMISSIONS.INCIDENTS_REVIEW,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canReviewIncidents = hasAnyPermission([
    PERMISSIONS.INCIDENTS_APPROVE,
    PERMISSIONS.INCIDENTS_REVIEW,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canEditIncidents = hasAnyPermission([
    PERMISSIONS.INCIDENTS_APPROVE,
    PERMISSIONS.INCIDENTS_REVIEW,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canDeleteIncidents = hasAnyPermission([
    PERMISSIONS.INCIDENTS_APPROVE,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canExportIncidents = hasAnyPermission([
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.INCIDENTS_APPROVE,
    PERMISSIONS.FULL_ACCESS
  ]);

  // Incident form state
  const [incidentForm, setIncidentForm] = useState({
    incidenttype: '',
    severity: '',
    dateoccurred: '',
    timeoccurred: '',
    location: '',
    individualsinvolved: [],
    staffinvolved: [],
    description: '',
    immediateaction: '',
    injuries: '',
    medicalattention: false,
    notifiedparties: [],
    witnessnames: [],
    witnessstatements: '',
    followuprequired: false,
    followupactions: '',
    qidpreviewnotes: '',
    adminreviewnotes: '',
    status: 'Open',
    attachments: [],
    ipmsfields: {
      incidentcategory: '',
      subcategory: '',
      locationcode: '',
      contributingfactors: [],
      preventionmeasures: []
    },
    created_by: '',
    created_by_role: '',
    division: '',
    facility: ''
  });

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    incidentid: '',
    reviewtype: '',
    notes: '',
    recommendations: '',
    statuschange: '',
    reviewedby: '',
    reviewdate: new Date().toISOString().split('T')[0],
    reviewed_by: '',
    reviewed_by_role: ''
  });

  // IPMS incident types and categories
  const ipmsIncidentTypes = [
    'Consumer Injury/Death',
    'Medication Error',
    'Consumer Missing',
    'Law Enforcement',
    'Alleged Abuse/Neglect',
    'Environmental Emergency',
    'Staff Injury',
    'Vehicle Incident',
    'Property Damage',
    'Behavioral Emergency',
    'Medical Emergency',
    'Other'
  ];

  const severityLevels = [
    'Critical - Life Threatening',
    'Major - Serious Injury/Illness',
    'Moderate - Minor Injury/Illness',
    'Minor - No Injury/Illness',
    'Near Miss'
  ];

  const incidentStatuses = [
    'Open',
    'Under Review',
    'Pending Investigation',
    'Resolved',
    'Closed',
    'Referred to External Agency'
  ];

  const locationCodes = [
    'Community',
    'Residential Facility',
    'Day Program',
    'Vocational Site',
    'Vehicle/Transportation',
    'Medical Facility',
    'Other'
  ];

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
    { id: 'individual', icon: Users, label: 'Individuals', badge: null },
    { id: 'medicine', icon: Pill, label: 'Medications', badge: null },
    { id: 'incident', icon: AlertTriangle, label: 'Incidents', badge: '3' },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', badge: null },
    { id: 'settings', icon: Settings, label: 'Settings', badge: null },
  ];

  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canViewIncidents) {
        fetchIndividualsAndIncidents();
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, user, profileLoading, userProfile]);

  const fetchIndividualsAndIncidents = async () => {
    try {
      setLoading(true);
      
      let individualsQuery = supabase
        .from('individuals')
        .select('*')
        .order('created_at', { ascending: false });

      // Role-based filtering for individuals
      if (userProfile.role_id === 'HouseManager_DD') {
        individualsQuery = individualsQuery.eq('homeassignment', userProfile.facility);
      } else if (userProfile.role_id === 'DSP_DD') {
        individualsQuery = individualsQuery.eq('homeassignment', userProfile.facility);
      } else if (userProfile.division === 'MI' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        individualsQuery = individualsQuery.eq('division', 'MI');
      } else if (userProfile.division === 'SUD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        individualsQuery = individualsQuery.eq('division', 'SUD');
      }

      const { data: individualsData, error: individualsError } = await individualsQuery;
      if (individualsError) throw individualsError;

      setIndividuals(individualsData || []);

      // Fetch all incidents from the incidents table
      let incidentsQuery = supabase
        .from('incidents')
        .select('*')
        .order('dateoccurred', { ascending: false });

      // Role-based filtering for incidents
      if (userProfile.role_id === 'DSP_DD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        incidentsQuery = incidentsQuery.or(`created_by.eq.${userProfile.fullname},facility.eq.${userProfile.facility}`);
      } else if (userProfile.division === 'MI' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        incidentsQuery = incidentsQuery.eq('division', 'MI');
      } else if (userProfile.division === 'SUD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        incidentsQuery = incidentsQuery.eq('division', 'SUD');
      }

      const { data: incidentsData, error: incidentsError } = await incidentsQuery;
      if (incidentsError) throw incidentsError;

      setAllIncidents(incidentsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchIncidentsForIndividual = (individualId) => {
    const individualIncidents = allIncidents.filter(inc => inc.individual_id === individualId);
    setIncidents(individualIncidents);
  };

  const handleAddIncident = async (e) => {
    e.preventDefault();
    
    if (!canCreateIncidents) {
      alert('You do not have permission to create incidents.');
      return;
    }

    try {
      const newIncident = {
        individual_id: selectedIndividual.id,
        incidenttype: incidentForm.incidenttype,
        severity: incidentForm.severity,
        dateoccurred: incidentForm.dateoccurred,
        timeoccurred: incidentForm.timeoccurred,
        location: incidentForm.location,
        individualsinvolved: incidentForm.individualsinvolved,
        staffinvolved: incidentForm.staffinvolved,
        description: incidentForm.description,
        immediateaction: incidentForm.immediateaction,
        injuries: incidentForm.injuries,
        medicalattention: incidentForm.medicalattention,
        notifiedparties: incidentForm.notifiedparties,
        witnessnames: incidentForm.witnessnames,
        witnessstatements: incidentForm.witnessstatements,
        followuprequired: incidentForm.followuprequired,
        followupactions: incidentForm.followupactions,
        status: incidentForm.status,
        attachments: incidentForm.attachments,
        ipmsfields: incidentForm.ipmsfields,
        created_by: userProfile.fullname,
        created_by_role: userProfile.role_name,
        division: userProfile.division,
        facility: userProfile.facility,
        reportedby: user.id,
        reporteddate: new Date().toISOString(),
        createddate: new Date().toISOString(),
        lastupdated: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('incidents')
        .insert([newIncident])
        .select();

      if (error) throw error;

      // Refresh incidents
      await fetchIndividualsAndIncidents();
      if (selectedIndividual) {
        fetchIncidentsForIndividual(selectedIndividual.id);
      }

      setShowAddModal(false);
      resetIncidentForm();
      alert('Incident reported successfully!');
    } catch (error) {
      console.error('Error adding incident:', error);
      alert('Error reporting incident. Please try again.');
    }
  };

  const handleReviewIncident = async (e) => {
    e.preventDefault();
    
    if (!canReviewIncidents) {
      alert('You do not have permission to review incidents.');
      return;
    }

    try {
      const updateData = {
        lastupdated: new Date().toISOString(),
        reviewed_by: userProfile.fullname,
        reviewed_by_role: userProfile.role_name
      };

      if (reviewForm.statuschange) {
        updateData.status = reviewForm.statuschange;
      }

      if (reviewForm.reviewtype === 'QIDP') {
        updateData.qidpreviewnotes = reviewForm.notes;
        updateData.qidpreviewdate = new Date().toISOString();
      } else if (reviewForm.reviewtype === 'Admin') {
        updateData.adminreviewnotes = reviewForm.notes;
        updateData.adminreviewdate = new Date().toISOString();
      }

      const { error } = await supabase
        .from('incidents')
        .update(updateData)
        .eq('id', reviewForm.incidentid);

      if (error) throw error;

      // Refresh incidents
      await fetchIndividualsAndIncidents();
      if (selectedIndividual) {
        fetchIncidentsForIndividual(selectedIndividual.id);
      }

      setShowReviewModal(false);
      resetReviewForm();
      alert('Incident review completed successfully!');
    } catch (error) {
      console.error('Error reviewing incident:', error);
      alert('Error reviewing incident. Please try again.');
    }
  };

  const handleDeleteIncident = async (incidentId) => {
    if (!canDeleteIncidents) {
      alert('You do not have permission to delete incidents.');
      return;
    }

    if (!confirm('Are you sure you want to delete this incident?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('incidents')
        .delete()
        .eq('id', incidentId);

      if (error) throw error;

      // Refresh incidents
      await fetchIndividualsAndIncidents();
      if (selectedIndividual) {
        fetchIncidentsForIndividual(selectedIndividual.id);
      }

      alert('Incident deleted successfully!');
    } catch (error) {
      console.error('Error deleting incident:', error);
      alert('Error deleting incident. Please try again.');
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileData = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
      uploaded_by: userProfile.fullname,
      url: URL.createObjectURL(file)
    }));
    
    setIncidentForm({
      ...incidentForm,
      attachments: [...incidentForm.attachments, ...fileData]
    });
  };

  const removeAttachment = (index) => {
    setIncidentForm({
      ...incidentForm,
      attachments: incidentForm.attachments.filter((_, i) => i !== index)
    });
  };

  const resetIncidentForm = () => {
    setIncidentForm({
      incidenttype: '',
      severity: '',
      dateoccurred: '',
      timeoccurred: '',
      location: '',
      individualsinvolved: [],
      staffinvolved: [],
      description: '',
      immediateaction: '',
      injuries: '',
      medicalattention: false,
      notifiedparties: [],
      witnessnames: [],
      witnessstatements: '',
      followuprequired: false,
      followupactions: '',
      qidpreviewnotes: '',
      adminreviewnotes: '',
      status: 'Open',
      attachments: [],
      ipmsfields: {
        incidentcategory: '',
        subcategory: '',
        locationcode: '',
        contributingfactors: [],
        preventionmeasures: []
      },
      created_by: '',
      created_by_role: '',
      division: '',
      facility: ''
    });
  };

  const resetReviewForm = () => {
    setReviewForm({
      incidentid: '',
      reviewtype: '',
      notes: '',
      recommendations: '',
      statuschange: '',
      reviewedby: '',
      reviewdate: new Date().toISOString().split('T')[0],
      reviewed_by: '',
      reviewed_by_role: ''
    });
  };

  // Calculate stats
  const openIncidentsCount = allIncidents.filter(inc => inc.status === 'Open').length;
  const highSeverityCount = allIncidents.filter(inc => 
    inc.severity === 'Critical - Life Threatening' || inc.severity === 'Major - Serious Injury/Illness'
  ).length;
  const closureRate = allIncidents.length > 0 
    ? Math.round((allIncidents.filter(inc => inc.status === 'Closed').length / allIncidents.length) * 100)
    : 0;
  const totalIncidentsCount = allIncidents.length;

  // Get individuals with incidents based on stats filter
  const getFilteredIndividualsByStats = () => {
    if (statsFilter === 'all') {
      return individuals;
    }

    const individualsWithIncidentCounts = individuals.map(ind => {
      const indIncidents = allIncidents.filter(inc => inc.individual_id === ind.id);
      return {
        ...ind,
        openIncidents: indIncidents.filter(inc => inc.status === 'Open').length,
        highSeverity: indIncidents.filter(inc => 
          inc.severity === 'Critical - Life Threatening' || inc.severity === 'Major - Serious Injury/Illness'
        ).length,
        totalIncidents: indIncidents.length
      };
    });

    if (statsFilter === 'open') {
      return individualsWithIncidentCounts.filter(ind => ind.openIncidents > 0);
    } else if (statsFilter === 'high-severity') {
      return individualsWithIncidentCounts.filter(ind => ind.highSeverity > 0);
    } else if (statsFilter === 'total') {
      return individualsWithIncidentCounts.filter(ind => ind.totalIncidents > 0);
    }

    return individualsWithIncidentCounts;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical - Life Threatening': return 'text-red-400 bg-red-900/30 border-red-500/50';
      case 'Major - Serious Injury/Illness': return 'text-orange-400 bg-orange-900/30 border-orange-500/50';
      case 'Moderate - Minor Injury/Illness': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
      case 'Minor - No Injury/Illness': return 'text-green-400 bg-green-900/30 border-green-500/50';
      case 'Near Miss': return 'text-blue-400 bg-blue-900/30 border-blue-500/50';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'text-red-400 bg-red-900/30 border-red-500/50';
      case 'Under Review': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
      case 'Pending Investigation': return 'text-orange-400 bg-orange-900/30 border-orange-500/50';
      case 'Resolved': return 'text-blue-400 bg-blue-900/30 border-blue-500/50';
      case 'Closed': return 'text-green-400 bg-green-900/30 border-green-500/50';
      case 'Referred to External Agency': return 'text-purple-400 bg-purple-900/30 border-purple-500/50';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
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

  const filteredIndividuals = getFilteredIndividualsByStats().filter(ind => {
    const matchesSearch = 
      ind.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.individualid?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = 
      incident.incidenttype.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    const matchesType = filterType === 'all' || incident.incidenttype === filterType;

    return matchesSearch && matchesStatus && matchesSeverity && matchesType;
  });

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
            placeholder="Search incidents..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            <UserButton afterSignOutUrl="/" />
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
        
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Incident Rate</span>
            <span className="text-xs text-red-400 font-bold">{totalIncidentsCount}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-1000" 
              style={{width: `${Math.min((totalIncidentsCount / 10) * 100, 100)}%`}}></div>
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
                if (item.id !== 'incident') {
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
if (!profileLoading && !canViewIncidents) {
return (
<div className="h-screen flex flex-col bg-slate-950 text-white">
<NavBar />
<div className="flex-1 flex items-center justify-center">
<div className="text-center max-w-md">
<Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
<h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
<p className="text-slate-400 mb-6">
You do not have permission to view incidents. Please contact your administrator if you believe this is an error.
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
<p className="text-slate-400 text-lg">Loading incidents...</p>
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
Incident Reporting
</h2>
<div className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full">
<span className="text-red-400 text-xs font-bold flex items-center gap-1">
<AlertTriangle size={12} /> IPMS
</span>
</div>
</div>
<p className="text-slate-400 text-lg">
IPMS-Aligned • State Compliant Incident Management
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
            {/* Quick Stats - Now Clickable */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button 
                onClick={() => setStatsFilter(statsFilter === 'open' ? 'all' : 'open')}
                className={`group relative bg-gradient-to-br from-red-600/20 to-pink-500/20 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20 overflow-hidden text-left ${
                  statsFilter === 'open' ? 'border-red-500 shadow-lg shadow-red-500/30' : 'border-red-500/30 hover:border-red-500/50'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-600 to-pink-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                      <AlertTriangle className="text-white" size={26} />
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="text-red-400" size={18} />
                      <span className="text-sm font-bold text-red-400">
                        +{openIncidentsCount > 0 ? '12%' : '0%'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 text-sm font-medium">Open Incidents</p>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-black text-white">
                        {openIncidentsCount}
                      </p>
                      <AlertTriangle className="text-red-400 mb-2 animate-pulse" size={20} />
                    </div>
                  </div>
                </div>
                {statsFilter === 'open' && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="text-red-400" size={20} />
                  </div>
                )}
              </button>

              <button 
                onClick={() => setStatsFilter(statsFilter === 'high-severity' ? 'all' : 'high-severity')}
                className={`group relative bg-gradient-to-br from-orange-600/20 to-red-500/20 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 overflow-hidden text-left ${
                  statsFilter === 'high-severity' ? 'border-orange-500 shadow-lg shadow-orange-500/30' : 'border-orange-500/30 hover:border-orange-500/50'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-600 to-red-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                      <AlertOctagon className="text-white" size={26} />
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="text-orange-400" size={18} />
                      <span className="text-sm font-bold text-orange-400">
                        +{highSeverityCount > 0 ? '8%' : '0%'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 text-sm font-medium">High Severity</p>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-black text-white">
                        {highSeverityCount}
                      </p>
                    </div>
                  </div>
                </div>
                {statsFilter === 'high-severity' && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="text-orange-400" size={20} />
                  </div>
                )}
              </button>

              <button 
                onClick={() => setStatsFilter('all')}
                className={`group relative bg-gradient-to-br from-blue-600/20 to-cyan-500/20 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden text-left ${
                  statsFilter === 'all' ? 'border-blue-500 shadow-lg shadow-blue-500/30' : 'border-blue-500/30 hover:border-blue-500/50'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600 to-cyan-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                      <TrendingUp className="text-white" size={26} />
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="text-blue-400" size={18} />
                      <span className="text-sm font-bold text-blue-400">
                        {closureRate}%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 text-sm font-medium">Closure Rate</p>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-black text-white">
                        {closureRate}%
                      </p>
                    </div>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => setStatsFilter(statsFilter === 'total' ? 'all' : 'total')}
                className={`group relative bg-gradient-to-br from-purple-600/20 to-pink-500/20 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden text-left ${
                  statsFilter === 'total' ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 'border-purple-500/30 hover:border-purple-500/50'
                }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                      <BarChart3 className="text-white" size={26} />
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="text-purple-400" size={18} />
                      <span className="text-sm font-bold text-purple-400">
                        +{totalIncidentsCount > 0 ? '5%' : '0%'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 text-sm font-medium">Total Incidents</p>
                    <div className="flex items-end gap-2">
                      <p className="text-4xl font-black text-white">{totalIncidentsCount}</p>
                    </div>
                  </div>
                </div>
                {statsFilter === 'total' && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="text-purple-400" size={20} />
                  </div>
                )}
              </button>
            </div>

            {/* Active Filter Display */}
            {statsFilter !== 'all' && (
              <div className="bg-gradient-to-r from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Filter className="text-emerald-400" size={20} />
                  <div>
                    <p className="text-white font-semibold">
                      Filtering by: {
                        statsFilter === 'open' ? 'Open Incidents' :
                        statsFilter === 'high-severity' ? 'High Severity' :
                        statsFilter === 'total' ? 'All Individuals with Incidents' : 'All'
                      }
                    </p>
                    <p className="text-slate-400 text-sm">
                      Showing {filteredIndividuals.length} individual(s)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setStatsFilter('all')}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-300"
                >
                  <X size={16} />
                  Clear Filter
                </button>
              </div>
            )}

            {/* Main Content */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300">
              {!selectedIndividual ? (
                <>
                  {/* Individual Selection */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Select Individual</h3>
                      <p className="text-slate-400">Choose an individual to view their incident history</p>
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
                      {filteredIndividuals.map((individual, idx) => {
                        const indIncidents = allIncidents.filter(inc => inc.individual_id === individual.id);
                        const openCount = indIncidents.filter(inc => inc.status === 'Open').length;
                        const highSevCount = indIncidents.filter(inc => 
                          inc.severity === 'Critical - Life Threatening' || inc.severity === 'Major - Serious Injury/Illness'
                        ).length;
                        
                        return (
                          <div
                            key={individual.id}
                            onClick={() => {
                              setSelectedIndividual(individual);
                              fetchIncidentsForIndividual(individual.id);
                            }}
                            className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 group"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`w-12 h-12 bg-gradient-to-br ${getColorClass(idx)} rounded-xl flex items-center justify-center text-white font-bold`}>
                                {getInitials(individual.firstname, individual.lastname)}
                              </div>
                              <div className="flex-1">
                                <h3 className="text-white font-semibold group-hover:text-emerald-400 transition-colors">
                                  {individual.firstname} {individual.lastname}
                                </h3>
                                <p className="text-slate-400 text-sm">ID: {individual.individualid}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span className="text-slate-400">{individual.homeassignment}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                individual.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                              }`}>
                                {individual.status}
                              </span>
                            </div>
                            {indIncidents.length > 0 && (
                              <div className="border-t border-slate-700 pt-2 mt-2 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400">Total:</span>
                                  <span className="text-white font-bold">{indIncidents.length}</span>
                                </div>
                                {openCount > 0 && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-red-400">Open:</span>
                                    <span className="text-red-400 font-bold">{openCount}</span>
                                  </div>
                                )}
                                {highSevCount > 0 && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-orange-400">High:</span>
                                    <span className="text-orange-400 font-bold">{highSevCount}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {filteredIndividuals.length === 0 && (
                      <div className="text-center py-16">
                        <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h4 className="text-xl font-bold text-slate-400 mb-2">No individuals found</h4>
                        <p className="text-slate-500">
                          {statsFilter !== 'all' 
                            ? 'No individuals match the current filter' 
                            : 'Try adjusting your search'}
                        </p>
                      </div>
                    )}
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
                        onClick={() => {
                          setSelectedIndividual(null);
                          setIncidents([]);
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all duration-300"
                      >
                        Change Individual
                      </button>
                      {canCreateIncidents && (
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300"
                        >
                          <AlertTriangle size={18} />
                          Report Incident
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Incidents List */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white">Incident History</h3>
                        <p className="text-slate-400">IPMS-aligned incident tracking and management</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShowFilterMenu(!showFilterMenu)}
                          className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800 text-white rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 font-semibold"
                        >
                          <Filter size={18} />
                          Filters
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-bold">
                            {filterStatus === 'all' ? 'All' : filterStatus}
                          </span>
                        </button>
                        {canExportIncidents && (
                          <button className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800 text-white rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 font-semibold">
                            <Download size={18} />
                            Export
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filter Menu */}
                    {showFilterMenu && (
                      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                            <select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                            >
                              <option value="all">All Statuses</option>
                              {incidentStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Severity</label>
                            <select
                              value={filterSeverity}
                              onChange={(e) => setFilterSeverity(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                            >
                              <option value="all">All Severities</option>
                              {severityLevels.map(severity => (
                                <option key={severity} value={severity}>{severity}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                            <select
                              value={filterType}
                              onChange={(e) => setFilterType(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                            >
                              <option value="all">All Types</option>
                              {ipmsIncidentTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {filteredIncidents.length === 0 ? (
                      <div className="text-center py-16">
                        <AlertTriangle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h4 className="text-xl font-bold text-slate-400 mb-2">No incidents found</h4>
                        <p className="text-slate-500">
                          {incidents.length === 0 
                            ? 'No incidents reported for this individual' 
                            : 'Try adjusting your search or filters'}
                        </p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[600px]">
                        <div className="space-y-4">
                          {filteredIncidents.map((incident) => (
                            <div key={incident.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-red-500/30 transition-all duration-300">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-4">
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                    incident.severity?.includes('Critical') ? 'bg-red-900/50' :
                                    incident.severity?.includes('Major') ? 'bg-orange-900/50' :
                                    incident.severity?.includes('Moderate') ? 'bg-yellow-900/50' :
                                    'bg-green-900/50'
                                  }`}>
                                    <AlertTriangle className={`${
                                      incident.severity?.includes('Critical') ? 'text-red-400' :
                                      incident.severity?.includes('Major') ? 'text-orange-400' :
                                      incident.severity?.includes('Moderate') ? 'text-yellow-400' :
                                      'text-green-400'
                                    }`} size={24} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <h4 className="text-white font-bold text-lg">{incident.incidenttype}</h4>
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(incident.severity)}`}>
                                        {incident.severity}
                                      </span>
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(incident.status)}`}>
                                        {incident.status}
                                      </span>
                                    </div>
                                    <p className="text-slate-300 text-sm mb-2">
                                      {new Date(incident.dateoccurred).toLocaleDateString()} at {incident.timeoccurred} • {incident.location}
                                    </p>
                                    <p className="text-slate-400 text-sm line-clamp-2">{incident.description}</p>
</div>
</div>
<div className="flex items-center gap-2">
{canReviewIncidents && (
<button
onClick={() => {
setReviewForm({...reviewForm, incidentid: incident.id});
setShowReviewModal(true);
}}
className="p-2 hover:bg-blue-500/20 rounded-lg transition-all duration-300"
>
<Eye size={16} className="text-blue-400" />
</button>
)}
{canDeleteIncidents && (
<button
onClick={() => handleDeleteIncident(incident.id)}
className="p-2 hover:bg-red-500/20 rounded-lg transition-all duration-300"
>
<Trash2 size={16} className="text-red-400" />
</button>
)}
</div>
</div>
                              {/* Quick Details */}
                              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                                <div>
                                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Reported By</p>
                                  <p className="text-white text-sm">{incident.created_by || 'Unknown'}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Staff Involved</p>
                                  <p className="text-white text-sm">{incident.staffinvolved?.length || 0} staff</p>
                                </div>
                                <div>
                                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Medical Attention</p>
                                  <p className="text-white text-sm">{incident.medicalattention ? 'Yes' : 'No'}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Follow-up Required</p>
                                  <p className="text-white text-sm">{incident.followuprequired ? 'Yes' : 'No'}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Attachments</p>
                                  <p className="text-white text-sm">{incident.attachments?.length || 0} files</p>
                                </div>
                              </div>

                              {/* IPMS Fields */}
                              {incident.ipmsfields?.incidentcategory && (
                                <div className="border-t border-slate-700 pt-4">
                                  <h5 className="text-slate-400 text-sm font-semibold mb-2">IPMS Classification</h5>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded border border-blue-500/50">
                                      {incident.ipmsfields.incidentcategory}
                                    </span>
                                    {incident.ipmsfields.subcategory && (
                                      <span className="px-2 py-1 bg-cyan-900/30 text-cyan-400 text-xs rounded border border-cyan-500/50">
                                        {incident.ipmsfields.subcategory}
                                      </span>
                                    )}
                                    {incident.ipmsfields.locationcode && (
                                      <span className="px-2 py-1 bg-purple-900/30 text-purple-400 text-xs rounded border border-purple-500/50">
                                        {incident.ipmsfields.locationcode}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Review Status */}
                              {(incident.qidpreviewnotes || incident.adminreviewnotes) && (
                                <div className="border-t border-slate-700 pt-4 mt-4">
                                  <h5 className="text-slate-400 text-sm font-semibold mb-2">Review Status</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {incident.qidpreviewnotes && (
                                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                                        <p className="text-blue-400 text-xs uppercase tracking-wider mb-1">QIDP Review</p>
                                        <p className="text-white text-sm">{incident.qidpreviewnotes}</p>
                                        <p className="text-blue-300 text-xs mt-1">
                                          {new Date(incident.qidpreviewdate).toLocaleDateString()}
                                        </p>
                                      </div>
                                    )}
                                    {incident.adminreviewnotes && (
                                      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                                        <p className="text-purple-400 text-xs uppercase tracking-wider mb-1">Admin Review</p>
                                        <p className="text-white text-sm">{incident.adminreviewnotes}</p>
                                        <p className="text-purple-300 text-xs mt-1">
                                          {new Date(incident.adminreviewdate).toLocaleDateString()}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
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

  {/* Add Incident Modal */}
  {showAddModal && canCreateIncidents && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-500 rounded-xl flex items-center justify-center">
              <AlertTriangle className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Report New Incident</h3>
              <p className="text-slate-400 text-sm">IPMS-aligned incident reporting</p>
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
          <form onSubmit={handleAddIncident} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} />
                Basic Incident Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Incident Type *</label>
                  <select
                    value={incidentForm.incidenttype}
                    onChange={(e) => setIncidentForm({...incidentForm, incidenttype: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="">Select Incident Type</option>
                    {ipmsIncidentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Severity Level *</label>
                  <select
                    value={incidentForm.severity}
                    onChange={(e) => setIncidentForm({...incidentForm, severity: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="">Select Severity</option>
                    {severityLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date Occurred *</label>
                  <input
                    type="date"
                    value={incidentForm.dateoccurred}
                    onChange={(e) => setIncidentForm({...incidentForm, dateoccurred: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Time Occurred *</label>
                  <input
                    type="time"
                    value={incidentForm.timeoccurred}
                    onChange={(e) => setIncidentForm({...incidentForm, timeoccurred: e.target.value})}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Location *</label>
                  <input
                    type="text"
                    value={incidentForm.location}
                    onChange={(e) => setIncidentForm({...incidentForm, location: e.target.value})}
                    required
                    placeholder="e.g., Oak Ridge Home, Community"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Medical Attention Required</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIncidentForm({...incidentForm, medicalattention: !incidentForm.medicalattention})}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        incidentForm.medicalattention 
                          ? 'bg-red-600 text-white' 
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {incidentForm.medicalattention ? 'Yes' : 'No'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* IPMS Classification */}
            <div>
              <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <Shield size={20} />
                IPMS Classification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Incident Category</label>
                  <select
                    value={incidentForm.ipmsfields.incidentcategory}
                    onChange={(e) => setIncidentForm({
                      ...incidentForm,
                      ipmsfields: {...incidentForm.ipmsfields, incidentcategory: e.target.value}
                    })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="">Select Category</option>
                    <option value="Consumer">Consumer</option>
                    <option value="Staff">Staff</option>
                    <option value="Environmental">Environmental</option>
                    <option value="Vehicle">Vehicle</option>
                    <option value="Property">Property</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Subcategory</label>
                  <input
                    type="text"
                    value={incidentForm.ipmsfields.subcategory}
                    onChange={(e) => setIncidentForm({
                      ...incidentForm,
                      ipmsfields: {...incidentForm.ipmsfields, subcategory: e.target.value}
                    })}
                    placeholder="e.g., Injury, Death, Abuse"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Location Code</label>
                  <select
                    value={incidentForm.ipmsfields.locationcode}
                    onChange={(e) => setIncidentForm({
                      ...incidentForm,
                      ipmsfields: {...incidentForm.ipmsfields, locationcode: e.target.value}
                    })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    <option value="">Select Location Code</option>
                    {locationCodes.map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <FileText size={20} />
                Detailed Description
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Incident Description *</label>
                  <textarea
                    value={incidentForm.description}
                    onChange={(e) => setIncidentForm({...incidentForm, description: e.target.value})}
                    required
                    rows="4"
                    placeholder="Provide detailed description of what happened..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Immediate Action Taken *</label>
                  <textarea
                    value={incidentForm.immediateaction}
                    onChange={(e) => setIncidentForm({...incidentForm, immediateaction: e.target.value})}
                    required
                    rows="3"
                    placeholder="Describe immediate actions taken..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Injuries Sustained</label>
                    <input
                      type="text"
                      value={incidentForm.injuries}
                      onChange={(e) => setIncidentForm({...incidentForm, injuries: e.target.value})}
                      placeholder="Describe any injuries"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Witness Names</label>
                    <input
                      type="text"
                      value={incidentForm.witnessnames.join(', ')}
                      onChange={(e) => setIncidentForm({...incidentForm, witnessnames: e.target.value.split(', ')})}
                      placeholder="Separate names with commas"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Witness Statements</label>
                  <textarea
                    value={incidentForm.witnessstatements}
                    onChange={(e) => setIncidentForm({...incidentForm, witnessstatements: e.target.value})}
                    rows="3"
                    placeholder="Record witness statements..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Notifications & Follow-up */}
            <div>
              <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <Bell size={20} />
                Notifications & Follow-up
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Parties Notified</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Guardian', 'QIDP', 'Admin', 'Nurse', 'Physician', 'Law Enforcement', 'Emergency Services'].map(party => (
                      <button
                        key={party}
                        type="button"
                        onClick={() => {
                          const notified = incidentForm.notifiedparties.includes(party)
                            ? incidentForm.notifiedparties.filter(p => p !== party)
                            : [...incidentForm.notifiedparties, party];
                          setIncidentForm({...incidentForm, notifiedparties: notified});
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                          incidentForm.notifiedparties.includes(party)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {party}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Follow-up Required</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIncidentForm({...incidentForm, followuprequired: !incidentForm.followuprequired})}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                          incidentForm.followuprequired 
                            ? 'bg-orange-600 text-white' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {incidentForm.followuprequired ? 'Yes' : 'No'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                    <select
                      value={incidentForm.status}
                      onChange={(e) => setIncidentForm({...incidentForm, status: e.target.value})}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all"
                    >
                      {incidentStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {incidentForm.followuprequired && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Follow-up Actions</label>
                    <textarea
                      value={incidentForm.followupactions}
                      onChange={(e) => setIncidentForm({...incidentForm, followupactions: e.target.value})}
                      rows="3"
                      placeholder="Describe required follow-up actions..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-all resize-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* File Attachments */}
            <div>
              <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                <Paperclip size={20} />
                Attachments
              </h4>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-6 text-center transition-all duration-300 cursor-pointer">
                  <Upload className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-white font-semibold mb-2">Upload supporting documents</p>
                  <p className="text-slate-400 text-sm mb-3">Photos, witness statements, medical reports</p>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 cursor-pointer"
                  >
                    <Upload size={18} />
                    Select Files
                  </label>
                </div>
                {incidentForm.attachments.length > 0 && (
                  <div className="space-y-2">
                    {incidentForm.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-800 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <FileText className="text-emerald-400" size={16} />
                          <div>
                            <p className="text-white text-sm font-medium">{file.name}</p>
                            <p className="text-slate-400 text-xs">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="p-1 hover:bg-red-500/20 rounded transition-all"
                        >
                          <X size={16} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-red-500/50 transition-all duration-300"
              >
                <AlertTriangle size={18} />
                Report Incident
              </button>
            </div>
          </form>
        </ScrollArea>
      </div>
    </div>
  )}

  {/* Review Incident Modal */}
  {showReviewModal && canReviewIncidents && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
              <Eye className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Review Incident</h3>
              <p className="text-slate-400 text-sm">QIDP/Admin review and recommendations</p>
            </div>
          </div>
          <button 
            onClick={() => setShowReviewModal(false)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="text-slate-400" size={24} />
          </button>
        </div>

        <form onSubmit={handleReviewIncident} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Review Type</label>
              <select
                value={reviewForm.reviewtype}
                onChange={(e) => setReviewForm({...reviewForm, reviewtype: e.target.value})}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
              >
                <option value="">Select Review Type</option>
                <option value="QIDP">QIDP Review</option>
                <option value="Admin">Admin Review</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Status Change</label>
              <select
                value={reviewForm.statuschange}
                onChange={(e) => setReviewForm({...reviewForm, statuschange: e.target.value})}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
              >
                <option value="">No Change</option>
                {incidentStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Reviewed By</label>
              <input
                type="text"
                value={reviewForm.reviewedby}
                onChange={(e) => setReviewForm({...reviewForm, reviewedby: e.target.value})}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Review Date</label>
              <input
                type="date"
                value={reviewForm.reviewdate}
                onChange={(e) => setReviewForm({...reviewForm, reviewdate: e.target.value})}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all"            />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Review Notes</label>
            <textarea
              value={reviewForm.notes}
              onChange={(e) => setReviewForm({...reviewForm, notes: e.target.value})}
              required
              rows="4"
              placeholder="Enter review notes and observations..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Recommendations</label>
            <textarea
              value={reviewForm.recommendations}
              onChange={(e) => setReviewForm({...reviewForm, recommendations: e.target.value})}
              rows="3"
              placeholder="Enter recommendations for prevention/improvement..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={() => setShowReviewModal(false)}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all"
            >
              <CheckCircle size={18} />
              Complete Review
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>
);
};
export default IncidentsPage;
