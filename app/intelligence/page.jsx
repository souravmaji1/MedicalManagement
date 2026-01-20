'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, AlertTriangle, Target, Activity, Shield, Users,
  ChevronRight, Loader2, Search, Filter, X, Menu, Bell, ChevronDown,
  Settings, Home, Pill, CreditCard, BarChart3, NetworkIcon, Sparkles,
  Zap, ArrowUp, ArrowDown, Clock, CheckCircle, AlertCircle, Info,
  TrendingDown, Eye, RefreshCcw, Download, FileText, Heart, MapPin,
  User, Calendar
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

const GROQ_API_KEY = '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';

const ForesightEnginePage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();
  
  const [individuals, setIndividuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedIndividual, setSelectedIndividual] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('intelligence');
  const [showPredictionModal, setShowPredictionModal] = useState(false);

   const menuItems = [
     { id: 'dashboard', icon: Home, label: 'Dashboard', badge: null },
     { id: 'individual', icon: Users, label: 'Individuals', badge: null },
     { id: 'medicine', icon: Pill, label: 'Medications', badge: null },
     { id: 'incident', icon: AlertTriangle, label: 'Incidents', badge: '3' },
     { id: 'privacy', icon: Shield, label: 'Data Privacy', badge: 'NEW' },
     { id: 'report', icon: FileText, label: 'Data Privacy', badge: 'NEW' },
   { id: 'engine', icon: Pill, label: 'Foresight Engine', badge: 'NEW' },
     { id: 'intelligence', icon: NetworkIcon, label: 'User Foresight', badge: 'NEW' },
     { id: 'billing', icon: CreditCard, label: 'Billing', badge: null },
     { id: 'analytics', icon: TrendingUp, label: 'Analytics', badge: null }
   ];

  const canViewEngine = hasAnyPermission([
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canViewEngine) {
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
      
      const parsedData = (data || []).map(individual => ({
        ...individual,
        medications: parseJSONData(individual.medications) || [],
        dailynotes: parseJSONData(individual.dailynotes) || [],
        incidents: parseJSONData(individual.incidents) || [],
        goals: parseJSONData(individual.goals) || [],
        wellness_data: parseJSONData(individual.wellness_data) || [],
        hcbs_data: parseJSONData(individual.hcbs_data) || {},
        marhistory: parseJSONData(individual.marhistory) || [],
        outcomes: parseJSONData(individual.outcomes) || [],
        riskplans: parseJSONData(individual.riskplans) || [],
        medicalalerts: parseJSONData(individual.medicalalerts) || [],
        behavioralalerts: parseJSONData(individual.behavioralalerts) || []
      }));
      
      setIndividuals(parsedData);
    } catch (error) {
      console.error('Error fetching individuals:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const analyzeIndividual = async () => {
    if (!selectedIndividual) return;

    try {
      setAnalyzing(true);
      setPrediction(null);

      const prompt = `You are a predictive analytics AI for a healthcare/care management system. Analyze this individual's data and predict potential risks, opportunities, and outcomes.

Individual Data:
- Name: ${selectedIndividual.firstname} ${selectedIndividual.lastname}
- ID: ${selectedIndividual.individualid}
- Status: ${selectedIndividual.status}
- Compliance Score: ${selectedIndividual.compliance_score}%
- Primary Diagnosis: ${selectedIndividual.primarydiagnosis || 'Not specified'}
- Home Assignment: ${selectedIndividual.homeassignment}
- Admission Date: ${selectedIndividual.admissiondate}

Recent Activity Summary:
- Daily Notes (last 30 days): ${selectedIndividual.dailynotes?.length || 0}
- Active Medications: ${selectedIndividual.medications?.filter(m => m.status === 'Active').length || 0}
- Total Medications: ${selectedIndividual.medications?.length || 0}
- Recent Incidents: ${selectedIndividual.incidents?.length || 0}
- Active Goals: ${selectedIndividual.goals?.filter(g => g.status === 'Active').length || 0}
- Total Goals: ${selectedIndividual.goals?.length || 0}
- Wellness Records: ${selectedIndividual.wellness_data?.length || 0}
- MAR History Records: ${selectedIndividual.marhistory?.length || 0}
- Medical Alerts: ${selectedIndividual.medicalalerts?.length || 0}
- Behavioral Alerts: ${selectedIndividual.behavioralalerts?.length || 0}
- Risk Plans: ${selectedIndividual.riskplans?.length || 0}

HCBS Compliance Data:
${JSON.stringify(selectedIndividual.hcbs_data || {}, null, 2).substring(0, 1000)}

Recent Wellness Data (last 3 entries):
${JSON.stringify(selectedIndividual.wellness_data?.slice(0, 3) || [], null, 2).substring(0, 500)}

Recent Daily Notes (last 3):
${JSON.stringify(selectedIndividual.dailynotes?.slice(0, 3).map(note => ({
  date: note.date,
  mood: note.mood,
  activities: note.activities,
  narrative: note.narrative?.substring(0, 200)
})) || [], null, 2)}

Medications Summary:
${JSON.stringify(selectedIndividual.medications?.map(med => ({
  name: med.medicationname || med.name,
  status: med.status,
  dosage: med.dosage,
  frequency: med.frequency,
  compliance: med.compliance
})) || [], null, 2).substring(0, 800)}

Recent Incidents:
${JSON.stringify(selectedIndividual.incidents?.slice(0, 3).map(inc => ({
  type: inc.incidenttype,
  date: inc.dateoccurred,
  severity: inc.severity,
  description: inc.description?.substring(0, 100)
})) || [], null, 2)}

Active Goals:
${JSON.stringify(selectedIndividual.goals?.filter(g => g.status === 'Active').map(goal => ({
  description: goal.description?.substring(0, 100),
  progress: goal.progress,
  targetdate: goal.targetdate
})) || [], null, 2)}

Medical Alerts:
${JSON.stringify(selectedIndividual.medicalalerts?.map(alert => ({
  description: alert.description,
  severity: alert.severity
})) || [], null, 2)}

Behavioral Alerts:
${JSON.stringify(selectedIndividual.behavioralalerts?.map(alert => ({
  description: alert.description,
  severity: alert.severity
})) || [], null, 2)}

Please provide a structured prediction in the following JSON format:
{
  "riskLevel": "critical" | "high" | "moderate" | "low",
  "riskScore": 0-100,
  "overallSummary": "Brief overview of the individual's current state and key concerns",
  "predictions": [
    {
      "category": "health" | "behavioral" | "compliance" | "goals" | "community" | "medication",
      "type": "risk" | "opportunity",
      "title": "Brief title",
      "description": "Detailed description",
      "likelihood": "high" | "medium" | "low",
      "impact": "high" | "medium" | "low",
      "timeframe": "immediate" | "short-term" | "long-term",
      "actionableSteps": ["step 1", "step 2", "step 3"]
    }
  ],
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": {
    "immediate": ["action 1", "action 2"],
    "shortTerm": ["action 1", "action 2"],
    "longTerm": ["action 1", "action 2"]
  },
  "trendAnalysis": {
    "improving": ["area 1", "area 2"],
    "declining": ["area 1", "area 2"],
    "stable": ["area 1", "area 2"]
  },
  "priorityActions": [
    {
      "priority": "critical" | "high" | "medium" | "low",
      "action": "Description of action needed",
      "deadline": "timeframe for action"
    }
  ]
}

Focus on:
1. Medication adherence patterns and potential issues
2. Behavioral trends and incident patterns
3. Goal progress and achievement likelihood
4. HCBS compliance risks and opportunities
5. Health concerns based on wellness data and medical alerts
6. Community integration opportunities
7. Safety concerns from behavioral alerts and risk plans
8. Staff training or support needs

Be specific, actionable, and evidence-based. Identify both risks to prevent and opportunities to pursue.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert healthcare predictive analytics AI specializing in developmental disabilities care. Provide structured, actionable predictions in valid JSON format. Be thorough and evidence-based.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 3000,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const predictionData = JSON.parse(data.choices[0].message.content);

      const fullPrediction = {
        individualId: selectedIndividual.id,
        individualName: `${selectedIndividual.firstname} ${selectedIndividual.lastname}`,
        individualData: selectedIndividual,
        timestamp: new Date().toISOString(),
        ...predictionData
      };

      setPrediction(fullPrediction);
      setShowPredictionModal(true);
    } catch (error) {
      console.error('Error analyzing individual:', error);
      alert('Error analyzing individual. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'from-red-600 to-red-700';
      case 'high': return 'from-orange-600 to-orange-700';
      case 'moderate': return 'from-yellow-600 to-yellow-700';
      case 'low': return 'from-green-600 to-green-700';
      default: return 'from-slate-600 to-slate-700';
    }
  };

  const getRiskBorderColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'border-red-500/50';
      case 'high': return 'border-orange-500/50';
      case 'moderate': return 'border-yellow-500/50';
      case 'low': return 'border-green-500/50';
      default: return 'border-slate-500/50';
    }
  };

  const getRiskTextColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'moderate': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getRiskBgColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return 'bg-red-900/30';
      case 'high': return 'bg-orange-900/30';
      case 'moderate': return 'bg-yellow-900/30';
      case 'low': return 'bg-green-900/30';
      default: return 'bg-slate-900/30';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'health': return Heart;
      case 'behavioral': return Brain;
      case 'compliance': return Shield;
      case 'goals': return Target;
      case 'community': return MapPin;
      case 'medication': return Pill;
      default: return Activity;
    }
  };

  const filteredIndividuals = individuals.filter(ind => {
    const matchesSearch = 
      ind.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.individualid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.homeassignment?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || ind.status === filterStatus;

    return matchesSearch && matchesFilter;
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search individuals..." 
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
          />
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

  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-900/10 border-r border-slate-800/50 transition-all duration-300 flex flex-col backdrop-blur-xl h-screen`}>
      <div className="p-6 border-b border-slate-800/50 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="text-slate-300 font-semibold">AI Engine Active</span>
          </div>
          <div className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
            <span className="text-emerald-400 text-xs font-bold">v2.0</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium">Total Individuals</span>
            <span className="text-xs text-purple-400 font-bold">{individuals.length}</span>
          </div>
          {selectedIndividual && (
            <div className="mt-2 pt-2 border-t border-purple-500/20">
              <span className="text-xs text-purple-400 font-medium">Selected: {selectedIndividual.firstname}</span>
            </div>
          )}
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
                if (item.id !== 'engine') {
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
              <Brain className="text-emerald-400" size={18} />
              <p className="text-sm font-bold text-white">AI-Powered</p>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">Predictive Analytics Engine</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!profileLoading && !canViewEngine) {
    return (
      <div className="h-screen flex flex-col bg-slate-950 text-white">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-slate-400 mb-6">
              You do not have permission to access the Foresight Engine. Please contact your administrator.
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
          <p className="text-slate-400 text-lg">Loading Foresight Engine...</p>
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
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-rose-500">
                        Foresight Engine
                      </h2>
                      <div className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
                        <span className="text-purple-400 text-xs font-bold flex items-center gap-1">
                          <Brain size={12} /> AI POWERED
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-lg">
                      Select an individual and analyze with predictive AI • {individuals.length} individuals available
                    </p>
                  </div>
                </div>

                {/* Selected Individual Card */}
                {selectedIndividual && (
                  <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                          {getInitials(selectedIndividual.firstname, selectedIndividual.lastname)}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1">
                            {selectedIndividual.firstname} {selectedIndividual.lastname}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="text-slate-400">ID: {selectedIndividual.individualid}</span>
<span className="text-slate-600">•</span>
<span className="text-slate-400">{selectedIndividual.homeassignment}</span>
<span className="text-slate-600">•</span>
<span className={`px-2 py-1 rounded-full text-xs font-bold ${selectedIndividual.status === 'Active' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'}`}>

{selectedIndividual.status}
</span>
</div>
<div className="flex items-center gap-4 mt-2">
<div className="text-sm">
<span className="text-slate-500">Compliance: </span>
<span className="text-white font-bold">{selectedIndividual.compliance_score}%</span>
</div>
<div className="text-sm">
<span className="text-slate-500">Daily Notes: </span>
<span className="text-white font-bold">{selectedIndividual.dailynotes?.length || 0}</span>
</div>
<div className="text-sm">
<span className="text-slate-500">Medications: </span>
<span className="text-white font-bold">{selectedIndividual.medications?.length || 0}</span>
</div>
</div>
</div>
</div>
<div className="flex items-center gap-3">
<button
onClick={() => setSelectedIndividual(null)}
className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
>
Change Selection
</button>
<button
                       onClick={analyzeIndividual}
                       disabled={analyzing}
                       className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
{analyzing ? (
<>
<Loader2 size={20} className="animate-spin" />
Analyzing...
</>
) : (
<>
<Sparkles size={20} />
Start Analysis
</>
)}
</button>
</div>
</div>
</div>
)}

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
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-emerald-500 hover:border-emerald-500/50 transition-all font-semibold"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Review">Review</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Individuals List */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users size={24} className="text-emerald-400" />
                Select an Individual to Analyze
              </h3>

              {filteredIndividuals.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h4 className="text-xl font-bold text-slate-400 mb-2">No individuals found</h4>
                  <p className="text-slate-500">Try adjusting your search or filters</p>
                </div>
              ) : (
                <ScrollArea className="h-[600px] rounded-xl">
                  <div className="pr-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredIndividuals.map((individual, idx) => (
                      <button
                        key={individual.id}
                        onClick={() => setSelectedIndividual(individual)}
                        className={`text-left bg-gradient-to-br from-slate-900/50 to-slate-800/50 border rounded-xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                          selectedIndividual?.id === individual.id
                            ? 'border-purple-500/50 shadow-lg shadow-purple-500/30 scale-105'
                            : 'border-slate-700/50 hover:border-emerald-500/50'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`w-12 h-12 bg-gradient-to-br ${getColorClass(idx)} rounded-xl flex items-center justify-center text-white font-bold shadow-lg`}>
                            {getInitials(individual.firstname, individual.lastname)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold truncate">
                              {individual.firstname} {individual.lastname}
                            </h4>
                            <p className="text-slate-500 text-xs font-mono">{individual.individualid}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Home</span>
                            <span className="text-white font-medium truncate ml-2">{individual.homeassignment}</span>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-400">Status</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              individual.status === 'Active' ? 'bg-green-900/30 text-green-400' : 
                              individual.status === 'Review' ? 'bg-yellow-900/30 text-yellow-400' :
                              'bg-red-900/30 text-red-400'
                            }`}>
                              {individual.status}
                            </span>
                          </div>
                          
                          <div className="pt-2 border-t border-slate-700/50">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-500">Compliance</span>
                              <span className="text-white font-bold">{individual.compliance_score}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-1.5">
                              <div 
                                className={`h-full rounded-full ${
                                  individual.compliance_score >= 95 ? 'bg-lime-500' : 
                                  individual.compliance_score >= 85 ? 'bg-yellow-500' : 
                                  'bg-red-500'
                                }`}
                                style={{width: `${individual.compliance_score}%`}}
                              ></div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
                            <div className="text-center">
                              <p className="text-slate-500">Notes</p>
                              <p className="text-white font-bold">{individual.dailynotes?.length || 0}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-slate-500">Meds</p>
                              <p className="text-white font-bold">{individual.medications?.length || 0}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-slate-500">Goals</p>
                              <p className="text-white font-bold">{individual.goals?.length || 0}</p>
                            </div>
                          </div>
                        </div>

                        {selectedIndividual?.id === individual.id && (
                          <div className="mt-3 pt-3 border-t border-purple-500/30">
                            <p className="text-xs text-purple-400 font-semibold text-center">
                              ✓ Selected for Analysis
                            </p>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </main>
      </ScrollArea>
    </div>
  </div>

  
  {showPredictionModal && prediction && (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 bg-gradient-to-br ${getRiskColor(prediction.riskLevel)} rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
              {getInitials(selectedIndividual.firstname, selectedIndividual.lastname)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{prediction.individualName}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskBorderColor(prediction.riskLevel)} ${getRiskTextColor(prediction.riskLevel)} capitalize`}>
                  {prediction.riskLevel} Risk
                </span>
                <span className="text-slate-400 text-sm">Score: {prediction.riskScore}/100</span>
                <span className="text-slate-500 text-xs">
                  {new Date(prediction.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => {
              setShowPredictionModal(false);
              setPrediction(null);
            }}
            className="p-2 hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="text-slate-400" size={24} />
          </button>
        </div>

        <ScrollArea className="h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Overall Summary */}
            {prediction.overallSummary && (
              <div className={`bg-gradient-to-br ${getRiskBgColor(prediction.riskLevel)} border ${getRiskBorderColor(prediction.riskLevel)} rounded-xl p-6`}>
                <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Brain size={20} />
                  Overall Assessment
                </h4>
                <p className="text-slate-300 leading-relaxed">{prediction.overallSummary}</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${getRiskColor(prediction.riskLevel)} flex items-center justify-center`}>
                      <span className="text-3xl font-black text-white">{prediction.riskScore}</span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase">Risk Score</p>
                      <p className={`text-lg font-bold ${getRiskTextColor(prediction.riskLevel)} capitalize`}>
                        {prediction.riskLevel} Risk
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Key Insights */}
            {prediction.keyInsights && prediction.keyInsights.length > 0 && (
              <div className="bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border border-yellow-500/30 rounded-xl p-6">
                <h4 className="text-lg font-bold text-yellow-400 mb-4 flex items-center gap-2">
                  <Sparkles size={20} />
                  Key Insights
                </h4>
                <div className="space-y-3">
                  {prediction.keyInsights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-900/50 rounded-lg p-4">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-yellow-400 text-sm font-bold">{i + 1}</span>
                      </div>
                      <p className="text-slate-300 flex-1">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Priority Actions */}
            {prediction.priorityActions && prediction.priorityActions.length > 0 && (
              <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-xl p-6">
                <h4 className="text-lg font-bold text-red-400 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Priority Actions Required
                </h4>
                <div className="space-y-3">
                  {prediction.priorityActions.map((action, i) => (
                    <div key={i} className={`flex items-start gap-3 rounded-lg p-4 border ${
                      action.priority === 'critical' ? 'bg-red-900/20 border-red-500/30' :
                      action.priority === 'high' ? 'bg-orange-900/20 border-orange-500/30' :
                      action.priority === 'medium' ? 'bg-yellow-900/20 border-yellow-500/30' :
                      'bg-blue-900/20 border-blue-500/30'
                    }`}>
                      <AlertTriangle className={
                        action.priority === 'critical' ? 'text-red-400' :
                        action.priority === 'high' ? 'text-orange-400' :
                        action.priority === 'medium' ? 'text-yellow-400' :
                        'text-blue-400'
                      } size={20} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${
                            action.priority === 'critical' ? 'bg-red-900/30 text-red-400' :
                            action.priority === 'high' ? 'bg-orange-900/30 text-orange-400' :
                            action.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                            'bg-blue-900/30 text-blue-400'
                          }`}>
                            {action.priority}
                          </span>
                          <span className="text-xs text-slate-500">Deadline: {action.deadline}</span>
                        </div>
                        <p className="text-slate-300">{action.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Predictions */}
            {prediction.predictions && prediction.predictions.length > 0 && (
              <div>
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Brain size={20} className="text-purple-400" />
                  Detailed Predictions ({prediction.predictions.length})
                </h4>
                <div className="space-y-4">
                  {prediction.predictions.map((pred, i) => {
                    const CategoryIcon = getCategoryIcon(pred.category);
                    return (
                      <div key={i} className={`bg-gradient-to-br from-slate-800/50 to-slate-900/50 border ${
                        pred.type === 'risk' ? 'border-red-500/30' : 'border-green-500/30'
                      } rounded-xl p-5`}>
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            pred.type === 'risk' ? 'bg-red-900/30' : 'bg-green-900/30'
                          }`}>
                            <CategoryIcon size={24} className={pred.type === 'risk' ? 'text-red-400' : 'text-green-400'} />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                pred.type === 'risk' ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'
                              }`}>
                                {pred.type?.toUpperCase()}
                              </span>
                              <span className="text-xs text-slate-500 uppercase">{pred.category}</span>
                              <span className="text-xs text-slate-600">•</span>
                              <span className="text-xs text-slate-500 capitalize">{pred.timeframe}</span>
                            </div>
                            <h5 className="text-lg font-bold text-white mb-2">{pred.title}</h5>
                            <p className="text-slate-300 mb-4">{pred.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Likelihood:</span>
                                <span className={`text-xs px-2 py-1 rounded font-bold ${
                                  pred.likelihood === 'high' ? 'bg-red-900/30 text-red-400' :
                                  pred.likelihood === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                                  'bg-green-900/30 text-green-400'
                                }`}>
                                  {pred.likelihood}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">Impact:</span>
                                <span className={`text-xs px-2 py-1 rounded font-bold ${
                                  pred.impact === 'high' ? 'bg-red-900/30 text-red-400' :
                                  pred.impact === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                                  'bg-green-900/30 text-green-400'
                                }`}>
                                  {pred.impact}
                                </span>
                              </div>
                            </div>

                            {pred.actionableSteps && pred.actionableSteps.length > 0 && (
                              <div className="bg-slate-900/50 rounded-lg p-4">
                                <p className="text-sm font-bold text-slate-400 uppercase mb-3">Recommended Actions:</p>
                                <div className="space-y-2">
                                  {pred.actionableSteps.map((step, j) => (
                                    <div key={j} className="flex items-start gap-2">
                                      <CheckCircle size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                      <p className="text-sm text-slate-300">{step}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {prediction.recommendations && (
              <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/30 rounded-xl p-6">
                <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <Target size={20} />
                  Action Plan & Recommendations
                </h4>
                <div className="space-y-4">
                  {prediction.recommendations.immediate && prediction.recommendations.immediate.length > 0 && (
                    <div>
                      <h5 className="text-sm font-bold text-red-400 uppercase mb-3 flex items-center gap-2">
                        <AlertCircle size={16} />
                        Immediate Actions (Within 24-48 Hours)
                      </h5>
                      <div className="space-y-2">
                        {prediction.recommendations.immediate.map((action, i) => (
                          <div key={i} className="flex items-start gap-3 bg-red-900/10 rounded-lg p-3 border border-red-500/20">
                            <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-red-400 text-xs font-bold">{i + 1}</span>
                            </div>
                            <p className="text-sm text-slate-300">{action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {prediction.recommendations.shortTerm && prediction.recommendations.shortTerm.length > 0 && (
                    <div>
                      <h5 className="text-sm font-bold text-yellow-400 uppercase mb-3 flex items-center gap-2">
                        <Clock size={16} />
                        Short-Term Actions (1-4 Weeks)
                      </h5>
                      <div className="space-y-2">
                        {prediction.recommendations.shortTerm.map((action, i) => (
                          <div key={i} className="flex items-start gap-3 bg-yellow-900/10 rounded-lg p-3 border border-yellow-500/20">
                            <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-yellow-400 text-xs font-bold">{i + 1}</span>
                            </div>
                            <p className="text-sm text-slate-300">{action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {prediction.recommendations.longTerm && prediction.recommendations.longTerm.length > 0 && (
                    <div>
                      <h5 className="text-sm font-bold text-blue-400 uppercase mb-3 flex items-center gap-2">
                        <Target size={16} />
                        Long-Term Actions (1-6 Months)
                      </h5>
                      <div className="space-y-2">
                        {prediction.recommendations.longTerm.map((action, i) => (
                          <div key={i} className="flex items-start gap-3 bg-blue-900/10 rounded-lg p-3 border border-blue-500/20">
                            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-blue-400 text-xs font-bold">{i + 1}</span>
                            </div>
                            <p className="text-sm text-slate-300">{action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Trend Analysis */}
            {prediction.trendAnalysis && (
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-400" />
                  Trend Analysis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {prediction.trendAnalysis.improving && prediction.trendAnalysis.improving.length > 0 && (
                    <div className="bg-green-900/10 border border-green-500/30 rounded-lg p-4">
                      <h5 className="text-sm font-bold text-green-400 uppercase mb-3 flex items-center gap-2">
                        <ArrowUp size={16} />
                        Improving
                      </h5>
                      <div className="space-y-2">
                        {prediction.trendAnalysis.improving.map((item, i) => (
                          <div key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {prediction.trendAnalysis.stable && prediction.trendAnalysis.stable.length > 0 && (
                    <div className="bg-blue-900/10 border border-blue-500/30 rounded-lg p-4">
                      <h5 className="text-sm font-bold text-blue-400 uppercase mb-3 flex items-center gap-2">
                        <Activity size={16} />
                        Stable
                      </h5>
                      <div className="space-y-2">
                        {prediction.trendAnalysis.stable.map((item, i) => (
                          <div key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <CheckCircle size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {prediction.trendAnalysis.declining && prediction.trendAnalysis.declining.length > 0 && (
                    <div className="bg-red-900/10 border border-red-500/30 rounded-lg p-4">
                      <h5 className="text-sm font-bold text-red-400 uppercase mb-3 flex items-center gap-2">
                        <ArrowDown size={16} />
                        Needs Attention
                      </h5>
                      <div className="space-y-2">
                        {prediction.trendAnalysis.declining.map((item, i) => (
                          <div key={i} className="text-sm text-slate-300 flex items-start gap-2">
                            <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t border-slate-700 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            Analysis generated: {new Date(prediction.timestamp).toLocaleString()}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowPredictionModal(false);
                setPrediction(null);
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
    </div>
  )}
</div>
  )}

  export default ForesightEnginePage;