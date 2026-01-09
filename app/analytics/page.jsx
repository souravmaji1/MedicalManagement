'use client'

import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, Users, Calendar, Filter, Download, ArrowLeft, Palette, Music,
  BarChart3, PieChart, Activity, AlertTriangle, CheckCircle,
  Clock, Target, Heart, Pill, FileText, MapPin, Brain, CreditCard,
  ChevronRight, ChevronDown, Loader2, Search, X, Menu,
  Home, Settings, Bell, Shield, Zap, Sparkles, Award,
  TrendingDown, ArrowUp, ArrowDown, Minus, Eye, Share2,
  RefreshCcw, Calendar as CalendarIcon, User, Home as HomeIcon,
  Printer, Pill as PillIcon, BookOpen, Utensils, Shirt, Bath, Bed,
  Smile, Frown, Meh, MessageSquare, Target as TargetIcon,
  CheckSquare, ClipboardList, Stethoscope, Bell as BellIcon,
  ExternalLink, File, Link, ChevronUp, ChevronDown as ChevronDownIcon,
  Phone, Mail, Map, FileSpreadsheet, Clipboard, Shield as ShieldIcon,
  UserCheck, Activity as ActivityIcon, Droplets, Thermometer,
  HeartPulse, Eye as EyeIcon, BrainCircuit, Wind, AlertCircle
} from 'lucide-react';
import { ScrollArea } from "../../components/ui/scroll-area";
import { useUser, UserButton } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '../../contexts/userProfileContext';
import { PERMISSIONS } from '../../utils/permissions';

const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

// Parse JSON data from Supabase
const parseJSONData = (data) => {
  if (!data) return null;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return null;
    }
  }
  return data;
};

// Helper function to get mood icon
const getMoodIcon = (mood) => {
  const icons = {
    'Happy': Smile,
    'Calm': Smile,
    'Excited': Smile,
    'Neutral': Meh,
    'Anxious': Frown,
    'Sad': Frown,
    'Frustrated': Frown
  };
  return icons[mood] || Meh;
};

// Helper function to get activity icon
const getActivityIcon = (activityType) => {
  const icons = {
    'arts-crafts': Palette,
    'music': Music,
    'reading': BookOpen,
    'exercise': Activity,
    'social': Users,
    'community': MapPin,
    'cognitive': Brain,
    'group': Users,
    'arts & crafts': Palette,
    'bath': Bath,
    'bedtime': Bed,
    'meal': Utensils,
    'dressing': Shirt
  };
  return icons[activityType] || Activity;
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// Helper function to format datetime
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const AnalyticsPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();
  const printRef = useRef(null);
  
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTimeRange, setFilterTimeRange] = useState('30days');
  const [filterFacility, setFilterFacility] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('analytics');
  const [selectedIndividual, setSelectedIndividual] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [fullIndividualData, setFullIndividualData] = useState(null);
  const [loadingFullData, setLoadingFullData] = useState(false);
  const [individualDocuments, setIndividualDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [expandedDailyNotes, setExpandedDailyNotes] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  
  const [analyticsData, setAnalyticsData] = useState({
    totalIndividuals: 0,
    activeIndividuals: 0,
    avgComplianceScore: 0,
    totalDailyNotes: 0,
    totalIncidents: 0,
    totalMedications: 0,
    avgGoalProgress: 0,
    hcbsCompliance: 0,
    medicationCompliance: 0,
    behavioralIncidents: 0,
    communityOutings: 0,
    goalAchievements: 0
  });

  // Permission checks
  const canViewReports = hasAnyPermission([
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canExportReports = hasAnyPermission([
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  // Menu items
  const menuItems = [
  //  { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
    { id: 'individual', icon: Users, label: 'Individuals', badge: null },
    { id: 'medicine', icon: Pill, label: 'Medications', badge: null },
    { id: 'incident', icon: AlertTriangle, label: 'Incidents', badge: null },
    { id: 'billing', icon: CreditCard, label: 'Billing', badge: null },
    { id: 'analytics', icon: TrendingUp, label: 'Analytics', badge: null },
  //  { id: 'settings', icon: Settings, label: 'Settings', badge: null },
  ];

  const timeRanges = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '1year', label: 'Last Year' },
    { value: 'all', label: 'All Time' }
  ];

  // Tabs for individual detail modal
  const detailTabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'medical', label: 'Medical', icon: Stethoscope },
    { id: 'behavioral', label: 'Behavioral', icon: Brain },
    { id: 'goals', label: 'Goals & Outcomes', icon: Target },
    { id: 'documents', label: 'Documents', icon: File },
    { id: 'history', label: 'History', icon: Clock }
  ];

  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canViewReports) {
        fetchIndividuals();
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, user, profileLoading, userProfile]);

  useEffect(() => {
    if (individuals.length > 0) {
      calculateAnalytics();
    }
  }, [individuals, filterTimeRange, filterFacility]);

  // Fetch full individual data when selected
  useEffect(() => {
    if (selectedIndividual && !fullIndividualData) {
      fetchFullIndividualData(selectedIndividual.id);
      fetchIndividualDocuments(selectedIndividual.id);
    }
  }, [selectedIndividual]);

  const fetchIndividualDocuments = async (individualId) => {
    try {
      setLoadingDocuments(true);
      
      const { data, error } = await supabase
        .from('individual_documents')
        .select('*')
        .eq('individual_id', individualId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      
      setIndividualDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const fetchFullIndividualData = async (individualId) => {
    try {
      setLoadingFullData(true);
      
      // Fetch main individual data
      const { data: individualData, error: individualError } = await supabase
        .from('individuals')
        .select('*')
        .eq('id', individualId)
        .single();

      if (individualError) throw individualError;
      
      if (individualData) {
        // Parse all JSON fields
        const parsedData = {
          ...individualData,
          medications: parseJSONData(individualData.medications) || [],
          marhistory: parseJSONData(individualData.marhistory) || [],
          dailynotes: parseJSONData(individualData.dailynotes) || [],
          incidents: parseJSONData(individualData.incidents) || [],
          goals: parseJSONData(individualData.goals) || [],
          outcomes: parseJSONData(individualData.outcomes) || [],
          riskplans: parseJSONData(individualData.riskplans) || [],
          medicalalerts: parseJSONData(individualData.medicalalerts) || [],
          behavioralalerts: parseJSONData(individualData.behavioralalerts) || [],
          rightsrestrictions: parseJSONData(individualData.rightsrestrictions) || [],
          hcbsdomains: parseJSONData(individualData.hcbsdomains) || [],
          wellness_data: parseJSONData(individualData.wellness_data) || [],
          incidenttrends: parseJSONData(individualData.incidenttrends) || {},
          behaviorincidents: parseJSONData(individualData.behaviorincidents) || [],
          misseddoses: parseJSONData(individualData.misseddoses) || [],
          mederrors: parseJSONData(individualData.mederrors) || []
        };
        
        setFullIndividualData(parsedData);
      }
    } catch (error) {
      console.error('Error fetching full individual data:', error);
    } finally {
      setLoadingFullData(false);
    }
  };

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
      
      // Parse all individuals' data
      const parsedData = (data || []).map(individual => ({
        ...individual,
        medications: parseJSONData(individual.medications) || [],
        marhistory: parseJSONData(individual.marhistory) || [],
        dailynotes: parseJSONData(individual.dailynotes) || [],
        incidents: parseJSONData(individual.incidents) || [],
        goals: parseJSONData(individual.goals) || [],
        wellness_data: parseJSONData(individual.wellness_data) || [],
        outcomes: parseJSONData(individual.outcomes) || [],
        riskplans: parseJSONData(individual.riskplans) || []
      }));
      
      setIndividuals(parsedData);
    } catch (error) {
      console.error('Error fetching individuals:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = () => {
    let filteredIndividuals = individuals;

    if (filterFacility !== 'all') {
      filteredIndividuals = filteredIndividuals.filter(ind => ind.homeassignment === filterFacility);
    }

    const now = new Date();
    const getDateThreshold = () => {
      switch (filterTimeRange) {
        case '7days': return new Date(now.setDate(now.getDate() - 7));
        case '30days': return new Date(now.setDate(now.getDate() - 30));
        case '90days': return new Date(now.setDate(now.getDate() - 90));
        case '6months': return new Date(now.setMonth(now.getMonth() - 6));
        case '1year': return new Date(now.setFullYear(now.getFullYear() - 1));
        default: return new Date(0);
      }
    };
    const dateThreshold = getDateThreshold();

    const totalIndividuals = filteredIndividuals.length;
    const activeIndividuals = filteredIndividuals.filter(ind => ind.status === 'Active').length;
    
    const avgComplianceScore = totalIndividuals > 0
      ? Math.round(filteredIndividuals.reduce((acc, ind) => acc + (ind.compliance_score || 0), 0) / totalIndividuals)
      : 0;

    let totalDailyNotes = 0;
    let totalIncidents = 0;
    let totalMedications = 0;
    let totalGoalProgress = 0;
    let goalCount = 0;
    let medicationComplianceSum = 0;
    let medicationCount = 0;
    let behavioralIncidents = 0;
    let communityOutings = 0;
    let goalAchievements = 0;

    filteredIndividuals.forEach(ind => {
      if (ind.dailynotes) {
        totalDailyNotes += ind.dailynotes.filter(note => 
          new Date(note.date) >= dateThreshold
        ).length;
        
        communityOutings += ind.dailynotes.filter(note => 
          note.communityouting && new Date(note.date) >= dateThreshold
        ).length;
      }

      if (ind.incidents) {
        const recentIncidents = ind.incidents.filter(inc => 
          new Date(inc.dateoccurred) >= dateThreshold
        );
        totalIncidents += recentIncidents.length;
        behavioralIncidents += recentIncidents.filter(inc => 
          inc.incidenttype === 'Behavioral Emergency' || 
          inc.incidenttype?.toLowerCase().includes('behavior')
        ).length;
      }

      if (ind.medications) {
        totalMedications += ind.medications.filter(med => med.status === 'Active').length;
        ind.medications.forEach(med => {
          if (med.status === 'Active') {
            medicationComplianceSum += (med.compliance || 0);
            medicationCount++;
          }
        });
      }

      if (ind.goals) {
        ind.goals.forEach(goal => {
          if (goal.status === 'Active') {
            totalGoalProgress += (goal.progress || 0);
            goalCount++;
          }
          if (goal.status === 'Completed') {
            goalAchievements++;
          }
        });
      }
    });

    const avgGoalProgress = goalCount > 0 ? Math.round(totalGoalProgress / goalCount) : 0;
    const medicationCompliance = medicationCount > 0 
      ? Math.round(medicationComplianceSum / medicationCount) 
      : 0;
    
    const hcbsCompliance = totalIndividuals > 0
      ? Math.round((communityOutings / (totalIndividuals * 4)) * 100)
      : 0;

    setAnalyticsData({
      totalIndividuals,
      activeIndividuals,
      avgComplianceScore,
      totalDailyNotes,
      totalIncidents,
      totalMedications,
      avgGoalProgress,
      hcbsCompliance: Math.min(hcbsCompliance, 100),
      medicationCompliance,
      behavioralIncidents,
      communityOutings,
      goalAchievements
    });
  };

  const handlePrintIndividual = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setIsPrinting(false), 100);
    }, 100);
  };

  const handleExportReport = () => {
    if (!canExportReports) {
      alert('You do not have permission to export reports.');
      return;
    }

    const headers = ['Name', 'ID', 'Home', 'Status', 'Compliance', 'Daily Notes', 'Medications', 'Incidents', 'Goals Progress', 'Last Activity'];
    const csvContent = [
      headers.join(','),
      ...filteredIndividuals.map(ind => [
        `"${ind.firstname} ${ind.lastname}"`,
        ind.individualid,
        ind.homeassignment,
        ind.status,
        ind.compliance_score || 0,
        ind.dailynotes?.length || 0,
        ind.medications?.length || 0,
        ind.incidents?.length || 0,
        ind.goals ? Math.round(ind.goals.reduce((acc, g) => acc + (g.progress || 0), 0) / (ind.goals.length || 1)) : 0,
        formatDateTime(ind.last_activity)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
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

  const toggleDailyNote = (noteId) => {
    setExpandedDailyNotes(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  };

  const filteredIndividuals = individuals.filter(ind => {
    const matchesSearch = 
      ind.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.individualid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.homeassignment?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFacility = filterFacility === 'all' || ind.homeassignment === filterFacility;

    return matchesSearch && matchesFacility;
  });

  const facilities = [...new Set(individuals.map(ind => ind.homeassignment))].filter(Boolean);

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
            placeholder="Search analytics..." 
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
        
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">System Health</span>
            <span className="text-xs text-purple-400 font-bold">{analyticsData.avgComplianceScore}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-1000" 
              style={{width: `${analyticsData.avgComplianceScore}%`}}></div>
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
                if (item.id !== 'analytics') {
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

  // Individual Detail Modal Component with tabs
  const IndividualDetailModal = () => {
    if (!selectedIndividual) return null;

    const TabContent = () => {
      switch (activeTab) {
        case 'overview':
          return <OverviewTab individual={selectedIndividual} fullData={fullIndividualData} />;
        case 'medical':
          return <MedicalTab individual={selectedIndividual} fullData={fullIndividualData} />;
        case 'behavioral':
          return <BehavioralTab individual={selectedIndividual} fullData={fullIndividualData} />;
        case 'goals':
          return <GoalsTab individual={selectedIndividual} fullData={fullIndividualData} />;
        case 'documents':
          return <DocumentsTab documents={individualDocuments} loading={loadingDocuments} />;
        case 'history':
          return <HistoryTab individual={selectedIndividual} fullData={fullIndividualData} />;
        default:
          return <OverviewTab individual={selectedIndividual} fullData={fullIndividualData} />;
      }
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                {getInitials(selectedIndividual.firstname, selectedIndividual.lastname)}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {selectedIndividual.firstname} {selectedIndividual.lastname}
                </h3>
                <p className="text-slate-400 text-sm">ID: {selectedIndividual.individualid} • {selectedIndividual.homeassignment}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrintIndividual}
                disabled={loadingFullData}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all disabled:opacity-50"
              >
                {loadingFullData ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Printer size={18} />
                )}
                {loadingFullData ? 'Loading...' : 'Print'}
              </button>
              <button 
                onClick={() => {
                  setSelectedIndividual(null);
                  setFullIndividualData(null);
                  setIndividualDocuments([]);
                  setExpandedDailyNotes({});
                  setActiveTab('overview');
                }}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="text-slate-400" size={24} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-700">
            <div className="flex overflow-x-auto">
              {detailTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/5'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <ScrollArea className="h-[calc(90vh-180px)]">
            <div className="p-6">
              <TabContent />
            </div>
          </ScrollArea>

          <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
            <button
              onClick={() => {
                setSelectedIndividual(null);
                setFullIndividualData(null);
                setIndividualDocuments([]);
                setExpandedDailyNotes({});
                setActiveTab('overview');
              }}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
            >
              Close
            </button>
            <button
              onClick={() => router.push(`/individual/${selectedIndividual.id}`)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all"
            >
              View Full Profile
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Tab Components
  const OverviewTab = ({ individual, fullData }) => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Compliance</p>
          <p className="text-2xl font-bold text-white">{individual.compliance_score || 0}%</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Daily Notes</p>
          <p className="text-2xl font-bold text-white">{individual.dailynotes?.length || 0}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Medications</p>
          <p className="text-2xl font-bold text-white">{individual.medications?.length || 0}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Incidents</p>
          <p className="text-2xl font-bold text-white">{individual.incidents?.length || 0}</p>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-slate-800/30 rounded-xl p-4">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          <User size={18} />
          Basic Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-slate-500 text-sm">Full Name</p>
            <p className="text-white font-semibold">{individual.firstname} {individual.lastname}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Individual ID</p>
            <p className="text-white font-semibold font-mono">{individual.individualid}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Status</p>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
              individual.status === 'Active' ? 'bg-green-900/30 text-green-400' : 
              individual.status === 'Pending' ? 'bg-yellow-900/30 text-yellow-400' :
              'bg-red-900/30 text-red-400'
            }`}>
              {individual.status}
            </span>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Date of Birth</p>
            <p className="text-white font-semibold">{formatDate(individual.dateofbirth)}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Gender</p>
            <p className="text-white font-semibold">{individual.gender || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Admission Date</p>
            <p className="text-white font-semibold">{formatDate(individual.admissiondate)}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Home Assignment</p>
            <p className="text-white font-semibold">{individual.homeassignment}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Primary Diagnosis</p>
            <p className="text-white font-semibold">{individual.primarydiagnosis || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Location</p>
            <p className="text-white font-semibold">{individual.location || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-slate-800/30 rounded-xl p-4">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          <Phone size={18} />
          Contact Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-slate-500 text-sm">Phone</p>
            <p className="text-white font-semibold">{individual.phone || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Email</p>
            <p className="text-white font-semibold">{individual.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Medicaid Number</p>
            <p className="text-white font-semibold font-mono">{individual.medicaidnumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Emergency Contact</p>
            <p className="text-white font-semibold">{individual.emergencycontact || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Guardian Information */}
      {individual.guardianname && (
        <div className="bg-slate-800/30 rounded-xl p-4">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <ShieldIcon size={18} />
            Guardian Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-slate-500 text-sm">Guardian Name</p>
              <p className="text-white font-semibold">{individual.guardianname}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Guardian Phone</p>
              <p className="text-white font-semibold">{individual.guardianphone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-slate-500 text-sm">Guardian Email</p>
              <p className="text-white font-semibold">{individual.guardianemail || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-slate-800/30 rounded-xl p-4">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          <ActivityIcon size={18} />
          Recent Activity
        </h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Last Updated</span>
            <span className="text-white font-semibold">{formatDateTime(individual.updated_at)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Created On</span>
            <span className="text-white font-semibold">{formatDateTime(individual.created_at)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Last Activity</span>
            <span className="text-white font-semibold">{formatDateTime(individual.last_activity)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const MedicalTab = ({ individual, fullData }) => (
    <div className="space-y-6">
      {/* Medications */}
      {fullData?.medications && fullData.medications.length > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-bold flex items-center gap-2">
              <PillIcon size={18} />
              Medications ({fullData.medications.length})
            </h4>
          </div>
          <div className="space-y-3">
            {fullData.medications.slice(0, 5).map(med => (
              <div key={med.id} className="bg-slate-900/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">{med.medicationname || med.name}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    med.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {med.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Dosage</p>
                    <p className="text-white">{med.dosage || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Frequency</p>
                    <p className="text-white">{med.frequency || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Route</p>
                    <p className="text-white">{med.route || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Compliance</p>
                    <p className="text-white">{med.compliance || 0}%</p>
                  </div>
                </div>
                {med.specialinstructions && (
                  <p className="text-xs text-slate-400 mt-2">{med.specialinstructions}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Allergies */}
      {individual.allergies && (
        <div className="bg-slate-800/30 rounded-xl p-4">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <AlertCircle size={18} />
            Allergies
          </h4>
          <p className="text-white">{individual.allergies}</p>
        </div>
      )}

      {/* Medical Alerts */}
      {fullData?.medicalalerts && fullData.medicalalerts.length > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-4">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <AlertTriangle size={18} />
            Medical Alerts ({fullData.medicalalerts.length})
          </h4>
          <div className="space-y-2">
            {fullData.medicalalerts.map(alert => (
              <div key={alert.id} className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 font-medium">{alert.description}</p>
                <p className="text-red-300 text-xs mt-1">Severity: {alert.severity}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wellness Data */}
      {fullData?.wellness_data && fullData.wellness_data.length > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-4">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <HeartPulse size={18} />
            Wellness Data ({fullData.wellness_data.length})
          </h4>
          <div className="space-y-3">
            {fullData.wellness_data.slice(0, 3).map((wellness, idx) => (
              <div key={idx} className="bg-slate-900/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">{wellness.title || 'Wellness Entry'}</p>
                  <span className="text-xs text-slate-500">{formatDate(wellness.date)}</span>
                </div>
                {wellness.notes && (
                  <p className="text-sm text-slate-300">{wellness.notes}</p>
                )}
                {(wellness.bloodPressure || wellness.heartRate || wellness.temperature) && (
                  <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                    {wellness.bloodPressure && (
                      <div>
                        <p className="text-slate-500 text-xs">BP</p>
                        <p className="text-white">{wellness.bloodPressure}</p>
                      </div>
                    )}
                    {wellness.heartRate && (
                      <div>
                        <p className="text-slate-500 text-xs">HR</p>
                        <p className="text-white">{wellness.heartRate} bpm</p>
                      </div>
                    )}
                    {wellness.temperature && (
                      <div>
                        <p className="text-slate-500 text-xs">Temp</p>
                        <p className="text-white">{wellness.temperature}°F</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const BehavioralTab = ({ individual, fullData }) => (
    <div className="space-y-6">
      {/* Behavioral Alerts */}
      {fullData?.behavioralalerts && fullData.behavioralalerts.length > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-4">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <Brain size={18} />
            Behavioral Alerts ({fullData.behavioralalerts.length})
          </h4>
          <div className="space-y-2">
            {fullData.behavioralalerts.map(alert => (
              <div key={alert.id} className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                <p className="text-orange-400 font-medium">{alert.description}</p>
                <p className="text-orange-300 text-xs mt-1">Severity: {alert.severity}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Incidents */}
      {fullData?.incidents && fullData.incidents.length > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-4">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <AlertTriangle size={18} />
            Recent Incidents ({fullData.incidents.length})
          </h4>
          <div className="space-y-3">
            {fullData.incidents.slice(0, 5).map(incident => (
              <div key={incident.id} className="bg-slate-900/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white font-medium">{incident.incidenttype}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                    incident.severity === 'High' ? 'bg-red-900/30 text-red-400' :
                    incident.severity === 'Medium' ? 'bg-orange-900/30 text-orange-400' :
                    'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {incident.severity || 'Low'}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-2">
                  {incident.description ? incident.description.substring(0, 100) + '...' : 'No description'}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{formatDate(incident.dateoccurred)}</span>
                  <span>{incident.location || 'Location not specified'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Plans */}
      {fullData?.riskplans && fullData.riskplans.length > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-4">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <ShieldIcon size={18} />
            Risk Plans ({fullData.riskplans.length})
          </h4>
          <div className="space-y-2">
            {fullData.riskplans.map(plan => (
              <div key={plan.id} className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                <p className="text-purple-400 font-medium">{plan.description}</p>
                <p className="text-purple-300 text-xs mt-1">Status: {plan.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const GoalsTab = ({ individual, fullData }) => (
    <div className="space-y-6">
      {/* Goals */}
      {fullData?.goals && fullData.goals.length > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-4">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <Target size={18} />
            Goals & Outcomes ({fullData.goals.length})
          </h4>
          <div className="space-y-3">
            {fullData.goals.map(goal => (
              <div key={goal.id} className="bg-slate-900/50 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-slate-300 flex-1 mr-2">{goal.description}</p>
                  <div className="flex flex-col items-end">
                    <span className="text-lg font-bold text-emerald-400 whitespace-nowrap">{goal.progress || 0}%</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold mt-1 ${
                      goal.status === 'Active' ? 'bg-green-900/30 text-green-400' :
                      goal.status === 'Completed' ? 'bg-blue-900/30 text-blue-400' :
                      'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {goal.status}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" 
                    style={{width: `${goal.progress || 0}%`}}
                  ></div>
                </div>
                {goal.targetdate && (
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>Target: {formatDate(goal.targetdate)}</span>
                    <span>Frequency: {goal.frequency || 'N/A'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outcomes */}
      {fullData?.outcomes && fullData.outcomes.length > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-4">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <CheckSquare size={18} />
            Outcomes ({fullData.outcomes.length})
          </h4>
          <div className="space-y-2">
            {fullData.outcomes.map(outcome => (
              <div key={outcome.id} className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-3">
                <p className="text-emerald-400">{outcome.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HCBS Domains */}
      {fullData?.hcbsdomains && fullData.hcbsdomains.length > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-4">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <HomeIcon size={18} />
            HCBS Domains ({fullData.hcbsdomains.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {fullData.hcbsdomains.map((domain, idx) => (
              <span key={idx} className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm">
                {domain}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const DocumentsTab = ({ documents, loading }) => (
    <div className="space-y-6">
      <div className="bg-slate-800/30 rounded-xl p-4">
        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
          <File size={18} />
          Uploaded Documents ({documents.length})
        </h4>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 size={20} className="text-emerald-500 animate-spin mr-2" />
            <p className="text-slate-400">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No documents uploaded</p>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between text-sm bg-slate-900/50 rounded-lg p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate font-medium">{doc.document_name}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {doc.uploaded_by}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon size={12} />
                      {formatDateTime(doc.uploaded_at)}
                    </span>
                    {doc.signatures_count > 0 && (
                      <span className="flex items-center gap-1">
                        <CheckSquare size={12} />
                        {doc.signatures_count} signature{doc.signatures_count !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => window.open(doc.file_url, '_blank')}
                  className="ml-2 p-1.5 hover:bg-emerald-500/20 rounded transition-all"
                  title="View Document"
                >
                  <ExternalLink size={16} className="text-emerald-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const HistoryTab = ({ individual, fullData }) => (
    <div className="space-y-6">
      {/* Daily Notes */}
      {fullData?.dailynotes && fullData.dailynotes.length > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-bold flex items-center gap-2">
              <ClipboardList size={18} />
              Recent Daily Notes ({fullData.dailynotes.length})
            </h4>
          </div>
          <div className="space-y-4">
            {fullData.dailynotes.slice(0, 5).map(note => {
              const isExpanded = expandedDailyNotes[note.id];
              const MoodIcon = getMoodIcon(note.mood);
              return (
                <div key={note.id} className="bg-slate-900/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
                        <CalendarIcon className="text-white" size={16} />
                      </div>
                      <div>
                        <h5 className="text-white font-medium">
                          {formatDate(note.date)}
                        </h5>
                        <p className="text-xs text-slate-500">{note.shift} • {note.staffname || note.created_by}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MoodIcon className="text-purple-400" size={18} />
                      <span className="text-sm text-slate-300">{note.mood}</span>
                    </div>
                  </div>

                  {/* Activities */}
                  {note.activities && note.activities.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-500 font-semibold mb-1">Activities</p>
                      <div className="flex flex-wrap gap-1">
                        {note.activities.map((activity, idx) => {
                          const ActivityIcon = getActivityIcon(activity);
                          return (
                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-purple-900/30 text-purple-300 rounded text-xs font-medium">
                              <ActivityIcon size={12} />
                              {activity}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Narrative */}
                  {(note.narrative || note.ispGoalsNarrative) && (
                    <div className="mb-3">
                      <p className="text-xs text-slate-500 font-semibold mb-1">Summary</p>
                      <div className="relative">
                        <p className={`text-sm text-slate-300 ${!isExpanded && 'line-clamp-2'}`}>
                          {note.narrative || note.ispGoalsNarrative}
                        </p>
                        {note.narrative && note.narrative.length > 100 && (
                          <button
                            onClick={() => toggleDailyNote(note.id)}
                            className="mt-1 text-purple-400 hover:text-purple-300 text-xs font-medium flex items-center gap-1"
                          >
                            {isExpanded ? (
                              <>
                                Show less <ChevronUp size={12} />
                              </>
                            ) : (
                              <>
                                Read more <ChevronDownIcon size={12} />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Health & Behavior */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Appetite</p>
                      <p className="text-white font-medium">{note.appetite || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Sleep</p>
                      <p className="text-white font-medium">{note.sleep || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Behaviors</p>
                      <p className="text-white font-medium">{note.behaviors?.length || 0}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MAR History */}
      {fullData?.marhistory && fullData.marhistory.length > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-4">
          <h4 className="text-white font-bold mb-3 flex items-center gap-2">
            <Pill size={18} />
            Recent MAR History ({fullData.marhistory.length})
          </h4>
          <div className="space-y-2">
            {fullData.marhistory.slice(0, 5).map(entry => (
              <div key={entry.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                <div>
                  <p className="text-white font-medium">{entry.medication_name}</p>
                  <p className="text-xs text-slate-400">{formatDateTime(entry.date)} • {entry.time}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  entry.status === 'Given' ? 'bg-green-900/30 text-green-400' :
                  entry.status === 'Refused' ? 'bg-red-900/30 text-red-400' :
                  'bg-yellow-900/30 text-yellow-400'
                }`}>
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Permission Check - No Access Screen
  if (!profileLoading && !canViewReports) {
    return (
      <div className="h-screen flex flex-col bg-slate-950 text-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-slate-400 mb-6">
              You do not have permission to view analytics and reports. Please contact your administrator if you believe this is an error.
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
          <p className="text-slate-400 text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-content,
          #printable-content * {
            visibility: visible;
          }
          #printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          .print-section {
            page-break-inside: avoid;
            margin-bottom: 20px;
          }
          .print-page-break {
            page-break-before: always;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>

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
                          Analytics Dashboard
                        </h2>
                        <div className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
                          <span className="text-purple-400 text-xs font-bold flex items-center gap-1">
                            <BarChart3 size={12} /> LIVE
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-lg">
                        Comprehensive reporting and data insights • IPMS Aligned
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-slate-700"
                      >
                        <ArrowLeft size={18} />
                        Back to Home
                      </button>
                      {canExportReports && (
                        <button 
                          onClick={handleExportReport}
                          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300"
                        >
                          <Download size={18} />
                          Export Report
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Controls */}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 flex items-center gap-3 bg-slate-900/50 rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 group">
                        <Search size={20} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                        <input 
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search individuals..." 
                          className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <select
                          value={filterTimeRange}
                          onChange={(e) => setFilterTimeRange(e.target.value)}
                          className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-emerald-500 hover:border-emerald-500/50 transition-all font-semibold"
                        >
                          {timeRanges.map(range => (
                            <option key={range.value} value={range.value}>{range.label}</option>
                          ))}
                        </select>
                        <select
                          value={filterFacility}
                          onChange={(e) => setFilterFacility(e.target.value)}
                          className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-emerald-500 hover:border-emerald-500/50 transition-all font-semibold"
                        >
                          <option value="all">All Facilities</option>
                          {facilities.map(facility => (
                            <option key={facility} value={facility}>{facility}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            setFilterTimeRange('30days');
                            setFilterFacility('all');
                            setSearchTerm('');
                          }}
                          className="p-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50 hover:border-emerald-500/50 rounded-xl transition-all"
                        >
                          <RefreshCcw size={20} className="text-slate-400 hover:text-emerald-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Individuals */}
                    <div className="group relative bg-gradient-to-br from-emerald-600/20 to-teal-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-6 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-600 to-teal-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                            <Users className="text-white" size={26} />
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="text-emerald-400" size={18} />
                            <span className="text-sm font-bold text-emerald-400">
                              +5%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-400 text-sm font-medium">Total Individuals</p>
                          <div className="flex items-end gap-2">
                            <p className="text-4xl font-black text-white">{analyticsData.totalIndividuals}</p>
                            <Sparkles className="text-lime-400 mb-2 animate-pulse" size={20} />
                          </div>
                          <p className="text-xs text-emerald-400 font-medium mt-2">
                            {analyticsData.activeIndividuals} active
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Average Compliance */}
                    <div className="group relative bg-gradient-to-br from-blue-600/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600 to-cyan-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                            <CheckCircle className="text-white" size={26} />
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="text-blue-400" size={18} />
                            <span className="text-sm font-bold text-blue-400">
                              +3%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-400 text-sm font-medium">Avg Compliance</p>
                          <div className="flex items-end gap-2">
                            <p className="text-4xl font-black text-white">{analyticsData.avgComplianceScore}%</p>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-2 mt-3">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000"
                              style={{width: `${analyticsData.avgComplianceScore}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total Daily Notes */}
                    <div className="group relative bg-gradient-to-br from-purple-600/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-600 to-pink-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                            <FileText className="text-white" size={26} />
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="text-purple-400" size={18} />
                            <span className="text-sm font-bold text-purple-400">
                              +12%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-400 text-sm font-medium">Daily Notes</p>
                          <div className="flex items-end gap-2">
                            <p className="text-4xl font-black text-white">{analyticsData.totalDailyNotes}</p>
                          </div>
                          <p className="text-xs text-purple-400 font-medium mt-2">
                            in selected period
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Total Incidents */}
                    <div className="group relative bg-gradient-to-br from-orange-600/20 to-red-500/20 backdrop-blur-sm border border-orange-500/30 rounded-2xl p-6 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-600 to-red-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-all duration-300"></div>
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
                            <AlertTriangle className="text-white" size={26} />
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingDown className="text-green-400" size={18} />
                            <span className="text-sm font-bold text-green-400">
                              -8%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-400 text-sm font-medium">Total Incidents</p>
                          <div className="flex items-end gap-2">
                            <p className="text-4xl font-black text-white">{analyticsData.totalIncidents}</p>
                          </div>
                          <p className="text-xs text-orange-400 font-medium mt-2">
                            {analyticsData.behavioralIncidents} behavioral
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <Pill className="text-blue-400" size={20} />
                        <span className="text-2xl font-bold text-white">{analyticsData.totalMedications}</span>
                      </div>
                      <p className="text-slate-400 text-sm">Active Medications</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{width: `${analyticsData.medicationCompliance}%`}}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-500">{analyticsData.medicationCompliance}%</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <Target className="text-green-400" size={20} />
                        <span className="text-2xl font-bold text-white">{analyticsData.avgGoalProgress}%</span>
                      </div>
                      <p className="text-slate-400 text-sm">Avg Goal Progress</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{width: `${analyticsData.avgGoalProgress}%`}}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-500">{analyticsData.goalAchievements} completed</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <MapPin className="text-purple-400" size={20} />
                        <span className="text-2xl font-bold text-white">{analyticsData.communityOutings}</span>
                      </div>
                      <p className="text-slate-400 text-sm">Community Outings</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                          <div 
                            className="h-full bg-purple-500 rounded-full" 
                            style={{width: `${analyticsData.hcbsCompliance}%`}}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-500">{analyticsData.hcbsCompliance}% HCBS</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <Brain className="text-cyan-400" size={20} />
                        <span className="text-2xl font-bold text-white">{analyticsData.behavioralIncidents}</span>
                      </div>
                      <p className="text-slate-400 text-sm">Behavioral Events</p>
                      <div className="mt-2">
                        <span className="text-xs text-slate-500">
                          {analyticsData.totalIncidents > 0 
                            ? Math.round((analyticsData.behavioralIncidents / analyticsData.totalIncidents) * 100)
                            : 0}% of all incidents
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Individual Performance Table */}
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Individual Performance</h3>
                        <p className="text-slate-400">Detailed metrics for each individual</p>
                      </div>
                      <button
                        onClick={() => setShowFilterMenu(!showFilterMenu)}
                        className="flex items-center gap-2 bg-slate-900/50 hover:bg-slate-800 text-white rounded-xl px-5 py-3 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 font-semibold"
                      >
                        <Filter size={18} />
                        Filter
                      </button>
                    </div>

                    {filteredIndividuals.length === 0 ? (
                      <div className="text-center py-16">
                        <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                        <h4 className="text-xl font-bold text-slate-400 mb-2">No individuals found</h4>
                        <p className="text-slate-500">Try adjusting your filters</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-[600px]">
                        <div className="pr-4">
                          <table className="w-full">
                            <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10">
                              <tr className="border-b border-slate-700/50">
                                <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Individual</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Compliance</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Daily Notes</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Medications</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Incidents</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Goals</th>
                                <th className="text-left py-4 px-4 text-slate-400 font-bold text-xs uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredIndividuals.map((individual, idx) => {
                                const dailyNotesCount = individual.dailynotes?.filter(note => 
                                  new Date(note.date) >= new Date(new Date().setDate(new Date().getDate() - 30))
                                ).length || 0;
                                const medicationsCount = individual.medications?.filter(med => med.status === 'Active').length || 0;
                                const incidentsCount = individual.incidents?.filter(inc => 
                                  new Date(inc.dateoccurred) >= new Date(new Date().setDate(new Date().getDate() - 30))
                                ).length || 0;
                                const goalProgress = individual.goals?.length > 0
                                  ? Math.round(individual.goals.reduce((acc, g) => acc + (g.progress || 0), 0) / individual.goals.length)
                                  : 0;

                                return (
                                  <tr key={individual.id} 
                                    onClick={() => setSelectedIndividual(individual)}
                                    className="border-b border-slate-700/30 hover:bg-slate-900/50 transition-all duration-300 group cursor-pointer">
                                    <td className="py-5 px-4">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${getColorClass(idx)} rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-all duration-300`}>
                                          {getInitials(individual.firstname, individual.lastname)}
                                        </div>
                                        <div>
                                          <p className="text-white font-semibold group-hover:text-emerald-400 transition-colors">
                                            {individual.firstname} {individual.lastname}
                                          </p>
                                          <p className="text-slate-500 text-xs font-mono">{individual.individualid}</p>
                                          <p className="text-slate-500 text-xs">{individual.homeassignment}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="py-5 px-4">
                                      <div className="flex items-center gap-3">
                                        <div className="w-full bg-slate-700 rounded-full h-2 w-24">
                                          <div 
                                            className={`h-full rounded-full ${
                                              individual.compliance_score >= 95 ? 'bg-lime-500' : 
                                              individual.compliance_score >= 85 ? 'bg-yellow-500' : 
                                              'bg-red-500'
                                            }`} 
                                            style={{width: `${individual.compliance_score}%`}}
                                          ></div>
                                        </div>
                                        <span className="text-sm font-bold text-white">{individual.compliance_score}%</span>
                                      </div>
                                    </td>
                                    <td className="py-5 px-4">
                                      <div className="flex items-center gap-2">
                                        <FileText size={14} className="text-purple-400" />
                                        <span className="text-white font-semibold">{dailyNotesCount}</span>
                                      </div>
                                    </td>
                                    <td className="py-5 px-4">
                                      <div className="flex items-center gap-2">
                                        <Pill size={14} className="text-blue-400" />
                                        <span className="text-white font-semibold">{medicationsCount}</span>
                                      </div>
                                    </td>
                                    <td className="py-5 px-4">
                                      <div className="flex items-center gap-2">
                                        <AlertTriangle size={14} className={incidentsCount > 0 ? 'text-orange-400' : 'text-slate-600'} />
                                        <span className={`font-semibold ${incidentsCount > 0 ? 'text-white' : 'text-slate-600'}`}>
                                          {incidentsCount}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-5 px-4">
                                      <div className="flex items-center gap-2">
                                        <Target size={14} className="text-green-400" />
                                        <span className="text-white font-semibold">{goalProgress}%</span>
                                      </div>
                                    </td>
                                    <td className="py-5 px-4">
                                      <div className="flex items-center gap-2">
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/individual/${individual.id}`);
                                          }}
                                          className="p-2 hover:bg-emerald-500/20 rounded-lg transition-all group/btn"
                                          title="View Full Profile"
                                        >
                                          <Eye size={16} className="text-emerald-400 group-hover/btn:scale-110 transition-all" />
                                        </button>
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedIndividual(individual);
                                          }}
                                          className="p-2 hover:bg-blue-500/20 rounded-lg transition-all group/btn"
                                          title="View Analytics"
                                        >
                                          <BarChart3 size={16} className="text-blue-400 group-hover/btn:scale-110 transition-all" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
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

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <BarChart3 className="text-emerald-400" size={24} />
                        Compliance Trends
                      </h3>
                      <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-xl">
                        <div className="text-center">
                          <TrendingUp className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-500">Chart visualization coming soon</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <PieChart className="text-blue-400" size={24} />
                        Incident Distribution
                      </h3>
                      <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-xl">
                        <div className="text-center">
                          <PieChart className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                          <p className="text-slate-500">Chart visualization coming soon</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </ScrollArea>
          </div>
        </div>

        {/* Individual Detail Modal */}
        <IndividualDetailModal />

        {/* Printable Content */}
      {fullIndividualData && (
  <div id="printable-content" className="hidden print:block">
    <div className="bg-white text-black p-8">
      {/* Header */}
      <div className="border-b-4 border-emerald-600 pb-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
              {getInitials(fullIndividualData.firstname, fullIndividualData.lastname)}
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900">
                {fullIndividualData.firstname} {fullIndividualData.lastname}
              </h1>
              <p className="text-gray-600 text-lg mt-1">Complete Profile Report</p>
              <p className="text-gray-500 text-sm font-mono mt-1">ID: {fullIndividualData.individualid}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-emerald-50 border-2 border-emerald-600 rounded-xl p-4">
              <p className="text-xs text-gray-600 mb-1">Report Generated</p>
              <p className="text-lg font-bold text-emerald-700">{new Date().toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-600 p-4 rounded-r-lg">
          <p className="text-sm font-semibold text-emerald-900">CareBridge Pro - IPMS Aligned EMR System</p>
          <p className="text-xs text-gray-600">Alabama DD Compliant Electronic Medical Record</p>
        </div>
      </div>

      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-5 gap-4 mb-8 print-section">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={20} />
            </div>
            <p className="text-xs text-gray-600 font-semibold uppercase">Compliance</p>
          </div>
          <p className="text-3xl font-black text-emerald-700">{fullIndividualData.compliance_score || 0}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div 
              className="h-full bg-emerald-600 rounded-full" 
              style={{width: `${fullIndividualData.compliance_score || 0}%`}}
            ></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
            <p className="text-xs text-gray-600 font-semibold uppercase">Daily Notes</p>
          </div>
          <p className="text-3xl font-black text-purple-700">{fullIndividualData.dailynotes?.length || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Total documented</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Pill className="text-white" size={20} />
            </div>
            <p className="text-xs text-gray-600 font-semibold uppercase">Medications</p>
          </div>
          <p className="text-3xl font-black text-blue-700">{fullIndividualData.medications?.filter(m => m.status === 'Active').length || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Active prescriptions</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-white" size={20} />
            </div>
            <p className="text-xs text-gray-600 font-semibold uppercase">Incidents</p>
          </div>
          <p className="text-3xl font-black text-orange-700">{fullIndividualData.incidents?.length || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Total reported</p>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-rose-100 border-2 border-pink-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
              <HeartPulse className="text-white" size={20} />
            </div>
            <p className="text-xs text-gray-600 font-semibold uppercase">Wellness</p>
          </div>
          <p className="text-3xl font-black text-pink-700">{fullIndividualData.wellness_data?.length || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Health records</p>
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="mb-8 print-section">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-t-xl flex items-center gap-2">
          <User size={20} />
          <h2 className="text-xl font-bold">Basic Information</h2>
        </div>
        <div className="border-2 border-gray-200 rounded-b-xl p-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Full Name</p>
              <p className="text-lg font-bold text-gray-900">{fullIndividualData.firstname} {fullIndividualData.lastname}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Individual ID</p>
              <p className="text-lg font-bold text-gray-900 font-mono">{fullIndividualData.individualid}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Status</p>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                fullIndividualData.status === 'Active' ? 'bg-green-100 text-green-700 border-2 border-green-300' : 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
              }`}>
                {fullIndividualData.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Date of Birth</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(fullIndividualData.dateofbirth)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Gender</p>
              <p className="text-lg font-bold text-gray-900">{fullIndividualData.gender || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Admission Date</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(fullIndividualData.admissiondate)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Home Assignment</p>
              <p className="text-lg font-bold text-gray-900">{fullIndividualData.homeassignment}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Primary Diagnosis</p>
              <p className="text-lg font-bold text-gray-900">{fullIndividualData.primarydiagnosis || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Location</p>
              <p className="text-lg font-bold text-gray-900">{fullIndividualData.location || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-8 print-section">
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white p-4 rounded-t-xl flex items-center gap-2">
          <Phone size={20} />
          <h2 className="text-xl font-bold">Contact Information</h2>
        </div>
        <div className="border-2 border-gray-200 rounded-b-xl p-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Phone</p>
              <p className="text-lg font-bold text-gray-900">{fullIndividualData.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Email</p>
              <p className="text-lg font-bold text-gray-900">{fullIndividualData.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Medicaid Number</p>
              <p className="text-lg font-bold text-gray-900 font-mono">{fullIndividualData.medicaidnumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Emergency Contact</p>
              <p className="text-lg font-bold text-gray-900">{fullIndividualData.emergencycontact || 'N/A'}</p>
            </div>
            {fullIndividualData.notes && (
              <div className="col-span-3">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Additional Notes</p>
                <p className="text-lg text-gray-900">{fullIndividualData.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guardian Information */}
      {fullIndividualData.guardianname && (
        <div className="mb-8 print-section">
          <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white p-4 rounded-t-xl flex items-center gap-2">
            <ShieldIcon size={20} />
            <h2 className="text-xl font-bold">Guardian Information</h2>
          </div>
          <div className="border-2 border-gray-200 rounded-b-xl p-6">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Guardian Name</p>
                <p className="text-lg font-bold text-gray-900">{fullIndividualData.guardianname}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Guardian Phone</p>
                <p className="text-lg font-bold text-gray-900">{fullIndividualData.guardianphone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Guardian Email</p>
                <p className="text-lg font-bold text-gray-900">{fullIndividualData.guardianemail || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Health Information */}
      <div className="mb-8 print-section print-page-break">
        <div className="bg-gradient-to-r from-red-900 to-red-800 text-white p-4 rounded-t-xl flex items-center gap-2">
          <Stethoscope size={20} />
          <h2 className="text-xl font-bold">Health Information</h2>
        </div>
        <div className="border-2 border-gray-200 rounded-b-xl p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Allergies</p>
              <p className="text-lg font-bold text-gray-900">{fullIndividualData.allergies || 'None reported'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Last Updated</p>
              <p className="text-lg font-bold text-gray-900">{formatDateTime(fullIndividualData.last_activity)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Medications Section */}
      {fullIndividualData.medications && fullIndividualData.medications.length > 0 && (
        <div className="mb-8 print-section">
          <div className="bg-gradient-to-r from-blue-700 to-cyan-600 text-white p-4 rounded-t-xl flex items-center gap-2">
            <PillIcon size={20} />
            <h2 className="text-xl font-bold">Medication Management</h2>
          </div>
          <div className="border-2 border-gray-200 rounded-b-xl">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Medication Name</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Dosage</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Route</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Frequency</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Compliance</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Start Date</th>
                </tr>
              </thead>
              <tbody>
                {fullIndividualData.medications.map((med, idx) => (
                  <tr key={med.id || idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      {med.medicationname || med.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{med.dosage || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{med.route || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{med.frequency || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        med.status === 'Active' ? 'bg-green-100 text-green-700' :
                        med.status === 'On Hold' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {med.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-full bg-blue-600 rounded-full" 
                            style={{width: `${med.compliance || 0}%`}}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-700">{med.compliance || 0}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {formatDate(med.startdate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Special Instructions */}
            {fullIndividualData.medications.some(m => m.specialinstructions) && (
              <div className="p-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Special Instructions</h3>
                <div className="space-y-2">
                  {fullIndividualData.medications
                    .filter(m => m.specialinstructions)
                    .map((med, idx) => (
                      <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-blue-900">
                            {med.medicationname || med.name}
                          </span>
                          <span className="text-xs text-blue-700">{med.dosage}</span>
                        </div>
                        <p className="text-sm text-gray-700">{med.specialinstructions}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Wellness Data Section */}
      {fullIndividualData.wellness_data && fullIndividualData.wellness_data.length > 0 && (
        <div className="mb-8 print-section print-page-break">
          <div className="bg-gradient-to-r from-pink-700 to-rose-600 text-white p-4 rounded-t-xl flex items-center gap-2">
            <HeartPulse size={20} />
            <h2 className="text-xl font-bold">Wellness Monitoring</h2>
          </div>
          <div className="border-2 border-gray-200 rounded-b-xl">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Title</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Provider</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Vitals</th>
                </tr>
              </thead>
              <tbody>
                {fullIndividualData.wellness_data.map((wellness, idx) => (
                  <tr key={wellness.id || idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      {formatDate(wellness.date)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                        wellness.type === 'appointment' ? 'bg-blue-100 text-blue-700' :
                        wellness.type === 'medical_history' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {wellness.type?.replace('_', ' ').toUpperCase() || 'WELLNESS'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{wellness.title || 'No title'}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{wellness.provider || 'N/A'}</td>
                    <td className="py-3 px-4">
                      {wellness.status && (
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          wellness.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          wellness.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {wellness.status}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      <div className="space-y-1">
                        {wellness.bloodPressure && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">BP:</span>
                            <span className="font-medium">{wellness.bloodPressure}</span>
                          </div>
                        )}
                        {wellness.heartRate && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">HR:</span>
                            <span className="font-medium">{wellness.heartRate} bpm</span>
                          </div>
                        )}
                        {wellness.temperature && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Temp:</span>
                            <span className="font-medium">{wellness.temperature}°F</span>
                          </div>
                        )}
                        {wellness.weight && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Weight:</span>
                            <span className="font-medium">{wellness.weight} lbs</span>
                          </div>
                        )}
                        {wellness.oxygenSaturation && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">O2:</span>
                            <span className="font-medium">{wellness.oxygenSaturation}%</span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Detailed Wellness Notes */}
            {fullIndividualData.wellness_data.some(w => w.notes) && (
              <div className="p-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Wellness Notes</h3>
                <div className="space-y-3">
                  {fullIndividualData.wellness_data
                    .filter(w => w.notes)
                    .map((wellness, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-900">
                            {formatDate(wellness.date)} - {wellness.title || 'Wellness Entry'}
                          </span>
                          <span className="text-xs text-gray-500">{wellness.type?.replace('_', ' ')}</span>
                        </div>
                        <p className="text-sm text-gray-700">{wellness.notes}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Medical Alerts Section */}
      {fullIndividualData.medicalalerts && fullIndividualData.medicalalerts.length > 0 && (
        <div className="mb-8 print-section">
          <div className="bg-gradient-to-r from-red-700 to-orange-600 text-white p-4 rounded-t-xl flex items-center gap-2">
            <AlertTriangle size={20} />
            <h2 className="text-xl font-bold">Medical Alerts</h2>
          </div>
          <div className="border-2 border-gray-200 rounded-b-xl p-6">
            <div className="space-y-3">
              {fullIndividualData.medicalalerts.map(alert => (
                <div key={alert.id} className="bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="text-red-500 mt-0.5 mr-2" size={16} />
                    <div className="flex-1">
                      <h4 className="font-bold text-red-800">{alert.description}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          alert.severity === 'High' ? 'bg-red-100 text-red-700' :
                          alert.severity === 'Medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {alert.severity || 'Medium'} Severity
                        </span>
                        <span className="text-gray-600">
                          Added: {formatDate(alert.dateadded)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          alert.status === 'Active' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {alert.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Behavioral Alerts Section */}
      {fullIndividualData.behavioralalerts && fullIndividualData.behavioralalerts.length > 0 && (
        <div className="mb-8 print-section">
          <div className="bg-gradient-to-r from-orange-700 to-amber-600 text-white p-4 rounded-t-xl flex items-center gap-2">
            <Brain size={20} />
            <h2 className="text-xl font-bold">Behavioral Alerts</h2>
          </div>
          <div className="border-2 border-gray-200 rounded-b-xl p-6">
            <div className="space-y-3">
              {fullIndividualData.behavioralalerts.map(alert => (
                <div key={alert.id} className="bg-orange-50 border-l-4 border-orange-500 p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="text-orange-500 mt-0.5 mr-2" size={16} />
                    <div className="flex-1">
                      <h4 className="font-bold text-orange-800">{alert.description}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          alert.severity === 'High' ? 'bg-red-100 text-red-700' :
                          alert.severity === 'Medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {alert.severity || 'Medium'} Severity
                        </span>
                        <span className="text-gray-600">
                          Added: {formatDate(alert.dateadded)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          alert.status === 'Active' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {alert.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Risk Plans Section */}
      {fullIndividualData.riskplans && fullIndividualData.riskplans.length > 0 && (
        <div className="mb-8 print-section print-page-break">
          <div className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white p-4 rounded-t-xl flex items-center gap-2">
            <ShieldIcon size={20} />
            <h2 className="text-xl font-bold">Risk Management Plans</h2>
          </div>
          <div className="border-2 border-gray-200 rounded-b-xl p-6">
            <div className="space-y-4">
              {fullIndividualData.riskplans.map(plan => (
                <div key={plan.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-purple-800">{plan.description}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      plan.status === 'Active' ? 'bg-green-100 text-green-700' :
                      plan.status === 'On Hold' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {plan.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Severity</p>
                      <p className="font-semibold text-gray-800">{plan.severity || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Date Added</p>
                      <p className="font-semibold text-gray-800">{formatDate(plan.dateadded)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Goals Section */}
      {fullIndividualData.goals && fullIndividualData.goals.length > 0 && (
        <div className="mb-8 print-section">
          <div className="bg-gradient-to-r from-green-700 to-emerald-600 text-white p-4 rounded-t-xl flex items-center gap-2">
            <Target size={20} />
            <h2 className="text-xl font-bold">Goals & Progress Tracking</h2>
          </div>
          <div className="border-2 border-gray-200 rounded-b-xl p-6">
            <div className="space-y-4">
              {fullIndividualData.goals.map((goal, idx) => (
                <div key={goal.id || idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-500 uppercase">Goal {idx + 1}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          goal.status === 'Active' ? 'bg-green-100 text-green-700' :
                          goal.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {goal.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{goal.description || 'No description provided'}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-black text-green-600">{goal.progress || 0}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all" 
                      style={{width: `${goal.progress || 0}%`}}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                    {goal.targetdate && (
                      <div>
                        <p className="text-gray-600">Target Date</p>
                        <p className="font-semibold text-gray-800">{formatDate(goal.targetdate)}</p>
                      </div>
                    )}
                    {goal.frequency && (
                      <div>
                        <p className="text-gray-600">Frequency</p>
                        <p className="font-semibold text-gray-800">{goal.frequency}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Outcomes Section */}
      {fullIndividualData.outcomes && fullIndividualData.outcomes.length > 0 && (
        <div className="mb-8 print-section">
          <div className="bg-gradient-to-r from-teal-700 to-cyan-600 text-white p-4 rounded-t-xl flex items-center gap-2">
            <CheckSquare size={20} />
            <h2 className="text-xl font-bold">Outcomes</h2>
          </div>
          <div className="border-2 border-gray-200 rounded-b-xl p-6">
            <div className="space-y-2">
              {fullIndividualData.outcomes.map(outcome => (
                <div key={outcome.id} className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <p className="text-teal-800 font-medium">{outcome.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HCBS Domains */}
      {fullIndividualData.hcbsdomains && fullIndividualData.hcbsdomains.length > 0 && (
        <div className="mb-8 print-section">
          <div className="bg-gradient-to-r from-cyan-700 to-blue-600 text-white p-4 rounded-t-xl flex items-center gap-2">
            <HomeIcon size={20} />
            <h2 className="text-xl font-bold">HCBS Domains</h2>
          </div>
          <div className="border-2 border-gray-200 rounded-b-xl p-6">
            <div className="flex flex-wrap gap-2">
              {fullIndividualData.hcbsdomains.map((domain, idx) => (
                <span key={idx} className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                  {domain}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Daily Notes */}
      {fullIndividualData.dailynotes && fullIndividualData.dailynotes.length > 0 && (
        <div className="mb-8 print-section print-page-break">
          <div className="bg-gradient-to-r from-purple-700 to-pink-600 text-white p-4 rounded-t-xl flex items-center gap-2">
            <ClipboardList size={20} />
            <h2 className="text-xl font-bold">Recent Daily Notes</h2>
          </div>
          <div className="border-2 border-gray-200 rounded-b-xl p-6">
            <div className="space-y-6">
              {fullIndividualData.dailynotes.slice(0, 10).map((note, idx) => (
                <div key={note.id || idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {formatDate(note.date)} • {note.shift}
                      </h3>
                      <p className="text-sm text-gray-600">Documented by: {note.staffname || note.created_by}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Mood: {note.mood || 'N/A'}</span>
                      {note.communityouting && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Community Outing
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {note.activities && note.activities.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Activities</p>
                      <div className="flex flex-wrap gap-2">
                        {note.activities.map((activity, activityIdx) => (
                          <span key={activityIdx} className="inline-flex px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                            {activity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(note.narrative || note.ispGoalsNarrative) && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Summary</p>
                      <p className="text-sm text-gray-700">{note.narrative || note.ispGoalsNarrative}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Appetite</p>
                      <p className="font-semibold text-gray-900">{note.appetite || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Sleep</p>
                      <p className="font-semibold text-gray-900">{note.sleep || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Behaviors</p>
                      <p className="font-semibold text-gray-900">{note.behaviors?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Goals Worked</p>
                      <p className="font-semibold text-gray-900">{note.goalsworked?.length || 0}</p>
                    </div>
                  </div>
                  
                  {note.activitydetails && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Activity Details</p>
                      <p className="text-sm text-gray-700">{note.activitydetails}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {fullIndividualData.dailynotes.length > 10 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Showing 10 of {fullIndividualData.dailynotes.length} daily notes
              </div>
            )}
          </div>
        </div>
      )}

      {/* MAR History */}
      {fullIndividualData.marhistory && fullIndividualData.marhistory.length > 0 && (
        <div className="mb-8 print-section">
          <div className="bg-gradient-to-r from-indigo-700 to-violet-600 text-white p-4 rounded-t-xl flex items-center gap-2">
            <Pill size={20} />
            <h2 className="text-xl font-bold">Medication Administration History</h2>
          </div>
          <div className="border-2 border-gray-200 rounded-b-xl">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Date & Time</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Medication</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Given By</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-700 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody>
                {fullIndividualData.marhistory.slice(0, 15).map((entry, idx) => (
                  <tr key={entry.id || idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                      {formatDate(entry.date)} • {entry.time}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{entry.medication_name || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        entry.status === 'Given' ? 'bg-green-100 text-green-700' :
                        entry.status === 'Refused' ? 'bg-red-100 text-red-700' :
                        entry.status === 'Held' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{entry.givenby || entry.given_by || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{entry.notes || 'No notes'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {fullIndividualData.marhistory.length > 15 && (
              <div className="p-4 text-center text-sm text-gray-600 border-t">
                Showing 15 of {fullIndividualData.marhistory.length} MAR entries
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="mb-8 print-section">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-4 rounded-t-xl flex items-center gap-2">
          <Activity size={20} />
          <h2 className="text-xl font-bold">System Information</h2>
        </div>
        <div className="border-2 border-gray-200 rounded-b-xl p-6">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Created Date</p>
              <p className="text-lg font-bold text-gray-900">{formatDateTime(fullIndividualData.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Last Updated</p>
              <p className="text-lg font-bold text-gray-900">{formatDateTime(fullIndividualData.updated_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Last Activity</p>
              <p className="text-lg font-bold text-gray-900">{formatDateTime(fullIndividualData.last_activity)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t-2 border-gray-300 print-section">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Report Generated By</p>
            <p className="text-sm font-bold text-gray-900">{userProfile?.fullname || 'System Administrator'}</p>
            <p className="text-xs text-gray-500">{userProfile?.role_name || 'Administrator'} • {userProfile?.facility || 'CareBridge Pro'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">System Information</p>
            <p className="text-sm font-bold text-gray-900">CareBridge Pro v2.0</p>
            <p className="text-xs text-gray-500">IPMS Aligned • Alabama DD Compliant</p>
          </div>
        </div>
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 text-center">
            <span className="font-semibold">CONFIDENTIAL:</span> This document contains protected health information (PHI) and is intended solely for authorized personnel. 
            Unauthorized disclosure or distribution is prohibited by law.
          </p>
        </div>
        <div className="mt-3 text-center text-xs text-gray-500">
          Page {fullIndividualData.individualid} • Generated on {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  </div>
)}



      </div>
    </>
  );
};

export default AnalyticsPage;