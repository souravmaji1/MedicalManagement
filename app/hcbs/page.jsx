'use client'

import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Plus, Search, Filter, Edit2, Save, X, CheckCircle, 
  Clock, AlertCircle, Calendar, TrendingUp, Download, ChevronRight, 
  ChevronDown, Loader2, Bell, Menu, Activity, Target, Heart,NetworkIcon,
  MapPin, Brain, Zap, Sparkles, Award, Home, FileText, Pill,
  AlertTriangle, CreditCard, Settings, TrendingDown, BarChart3,
  Eye, CheckSquare, XCircle, Globe, Utensils, Users as UsersIcon,
  Briefcase, Music, Smile, Flag, AlertOctagon, ArrowLeft, Info
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

const HCBSCompliancePage = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();
  
  const [individuals, setIndividuals] = useState([]);
  const [selectedIndividual, setSelectedIndividual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('hcbs');
  const [activeTab, setActiveTab] = useState('community');

  // Permission checks
  const canViewHCBS = hasAnyPermission([
    PERMISSIONS.DAILY_NOTES_VIEW,
    PERMISSIONS.PLANS_VIEW,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canEditHCBS = hasAnyPermission([
    PERMISSIONS.PLANS_EDIT,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  // HCBS Data State
  const [hcbsData, setHcbsData] = useState({
    // Community Integration
    community_integration: {
      last_30_days_activities: 0,
      last_60_days_activities: 0,
      last_90_days_activities: 0,
      activity_types: [],
      choice_based_activities: 0,
      preferred_activities: [],
      community_participation_level: '',
      barriers_to_community: [],
      last_community_outing: '',
      community_goals: []
    },
    
    // Choice & Autonomy
    choice_autonomy: {
      choice_offered_percentage: 0,
      choice_honored_percentage: 0,
      meal_choices: [],
      schedule_preferences: [],
      activity_preferences: [],
      living_arrangement_choice: '',
      roommate_choice: '',
      staff_choice: '',
      privacy_preferences: [],
      autonomy_concerns: [],
      decision_support_needed: []
    },
    
    // ISP Implementation
    isp_implementation: {
      active_goals: [],
      goals_addressed_30_days: [],
      goals_not_addressed: [],
      goal_progress_notes: [],
      goal_activity_by_domain: {
        community: 0,
        independence: 0,
        health: 0,
        relationships: 0,
        employment: 0
      },
      isp_review_date: '',
      next_isp_review: '',
      goal_achievement_rate: 0
    },
    
    // Rights & Restrictions
    rights_restrictions: {
      has_restrictions: false,
      restriction_types: [],
      visitor_restrictions: {
        active: false,
        reason: '',
        hrc_approval_date: '',
        review_date: '',
        justification: ''
      },
      food_restrictions: {
        active: false,
        reason: '',
        hrc_approval_date: '',
        review_date: '',
        justification: ''
      },
      community_restrictions: {
        active: false,
        reason: '',
        hrc_approval_date: '',
        review_date: '',
        justification: ''
      },
      financial_restrictions: {
        active: false,
        reason: '',
        hrc_approval_date: '',
        review_date: '',
        justification: ''
      },
      communication_restrictions: {
        active: false,
        reason: '',
        hrc_approval_date: '',
        review_date: '',
        justification: ''
      },
      reduction_plan: '',
      hrc_review_frequency: '',
      rights_education_provided: false
    },
    
    // Health & Safety
    health_safety: {
      incident_count_30_days: 0,
      incident_count_60_days: 0,
      incident_count_90_days: 0,
      incidents_by_severity: {
        critical: 0,
        major: 0,
        moderate: 0,
        minor: 0
      },
      medication_errors_30_days: 0,
      prn_usage_30_days: 0,
      prn_medications: [],
      emergency_interventions: [],
      health_concerns: [],
      safety_plans: [],
      last_health_screening: '',
      next_health_screening: ''
    },
    
    // Staff Readiness
    staff_readiness: {
      primary_staff: [],
      staff_training_compliance: 0,
      expired_certifications: [],
      upcoming_expirations: [],
      specialized_training_needed: [],
      staff_ratio_met: true,
      qualified_staff_percentage: 0
    },
    
    // Waiver Information
    waiver_info: {
      waiver_type: '',
      waiver_start_date: '',
      waiver_end_date: '',
      level_of_care: '',
      authorized_services: [],
      service_limits: {},
      prior_authorizations: []
    },
    
    // Compliance Tracking
    compliance: {
      hcbs_compliant: true,
      compliance_score: 100,
      compliance_alerts: [],
      last_audit_date: '',
      next_audit_date: '',
      corrective_actions: [],
      audit_findings: []
    },
    
    // Person-Centered Planning
    person_centered: {
      planning_team: [],
      individual_role_in_planning: '',
      family_involvement: '',
      advocate_information: '',
      communication_method: '',
      decision_making_support: '',
      cultural_considerations: [],
      language_preferences: '',
      religious_preferences: ''
    }
  });

  const menuItems = [
     { id: 'individual', icon: Users, label: 'Individuals', badge: null },
     { id: 'medicine', icon: Pill, label: 'Medications', badge: null },
     { id: 'incident', icon: AlertTriangle, label: 'Incidents', badge: '3' },
     { id: 'privacy', icon: Shield, label: 'Data Privacy', badge: 'NEW' },
     { id: 'hcbs', icon: Shield, label: 'HCBS Compliance', badge: 'NEW' },
      {id: 'engine', icon: Pill, label: 'Foresight Engine', badge: 'NEW'},
     { id: 'intelligence', icon: NetworkIcon, label: 'User Foresight', badge: 'NEW' },
     { id: 'billing', icon: CreditCard, label: 'Billing', badge: null },
     { id: 'analytics', icon: TrendingUp, label: 'Analytics', badge: null }
   ];
  // Tab configuration
  const tabs = [
    { id: 'community', label: 'Community Integration', icon: Globe },
    { id: 'choice', label: 'Choice & Autonomy', icon: CheckSquare },
    { id: 'isp', label: 'ISP Implementation', icon: Target },
    { id: 'rights', label: 'Rights & Restrictions', icon: Shield },
    { id: 'health', label: 'Health & Safety', icon: Heart },
    { id: 'staff', label: 'Staff Readiness', icon: UsersIcon },
    { id: 'waiver', label: 'Waiver Info', icon: FileText },
    { id: 'person_centered', label: 'Person-Centered', icon: Smile }
  ];

  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canViewHCBS) {
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

  const handleSelectIndividual = (individual) => {
    setSelectedIndividual(individual);
    
    // Load existing HCBS data from individual record
    if (individual.hcbs_data) {
      setHcbsData(individual.hcbs_data);
    } else {
      // Reset to default structure
      setHcbsData({
        community_integration: {
          last_30_days_activities: 0,
          last_60_days_activities: 0,
          last_90_days_activities: 0,
          activity_types: [],
          choice_based_activities: 0,
          preferred_activities: [],
          community_participation_level: '',
          barriers_to_community: [],
          last_community_outing: '',
          community_goals: []
        },
        choice_autonomy: {
          choice_offered_percentage: 0,
          choice_honored_percentage: 0,
          meal_choices: [],
          schedule_preferences: [],
          activity_preferences: [],
          living_arrangement_choice: '',
          roommate_choice: '',
          staff_choice: '',
          privacy_preferences: [],
          autonomy_concerns: [],
          decision_support_needed: []
        },
        isp_implementation: {
          active_goals: [],
          goals_addressed_30_days: [],
          goals_not_addressed: [],
          goal_progress_notes: [],
          goal_activity_by_domain: {
            community: 0,
            independence: 0,
            health: 0,
            relationships: 0,
            employment: 0
          },
          isp_review_date: '',
          next_isp_review: '',
          goal_achievement_rate: 0
        },
        rights_restrictions: {
          has_restrictions: false,
          restriction_types: [],
          visitor_restrictions: {
            active: false,
            reason: '',
            hrc_approval_date: '',
            review_date: '',
            justification: ''
          },
          food_restrictions: {
            active: false,
            reason: '',
            hrc_approval_date: '',
            review_date: '',
            justification: ''
          },
          community_restrictions: {
            active: false,
            reason: '',
            hrc_approval_date: '',
            review_date: '',
            justification: ''
          },
          financial_restrictions: {
            active: false,
            reason: '',
            hrc_approval_date: '',
            review_date: '',
            justification: ''
          },
          communication_restrictions: {
            active: false,
            reason: '',
            hrc_approval_date: '',
            review_date: '',
            justification: ''
          },
          reduction_plan: '',
          hrc_review_frequency: '',
          rights_education_provided: false
        },
        health_safety: {
          incident_count_30_days: 0,
          incident_count_60_days: 0,
          incident_count_90_days: 0,
          incidents_by_severity: {
            critical: 0,
            major: 0,
            moderate: 0,
            minor: 0
          },
          medication_errors_30_days: 0,
          prn_usage_30_days: 0,
          prn_medications: [],
          emergency_interventions: [],
          health_concerns: [],
          safety_plans: [],
          last_health_screening: '',
          next_health_screening: ''
        },
        staff_readiness: {
          primary_staff: [],
          staff_training_compliance: 0,
          expired_certifications: [],
          upcoming_expirations: [],
          specialized_training_needed: [],
          staff_ratio_met: true,
          qualified_staff_percentage: 0
        },
        waiver_info: {
          waiver_type: '',
          waiver_start_date: '',
          waiver_end_date: '',
          level_of_care: '',
          authorized_services: [],
          service_limits: {},
          prior_authorizations: []
        },
        compliance: {
          hcbs_compliant: true,
          compliance_score: 100,
          compliance_alerts: [],
          last_audit_date: '',
          next_audit_date: '',
          corrective_actions: [],
          audit_findings: []
        },
        person_centered: {
          planning_team: [],
          individual_role_in_planning: '',
          family_involvement: '',
          advocate_information: '',
          communication_method: '',
          decision_making_support: '',
          cultural_considerations: [],
          language_preferences: '',
          religious_preferences: ''
        }
      });
    }
  };

  const handleSaveHCBS = async () => {
    if (!canEditHCBS) {
      alert('You do not have permission to edit HCBS data.');
      return;
    }

    if (!selectedIndividual) {
      alert('Please select an individual first.');
      return;
    }

    try {
      setSaving(true);

      // Calculate compliance score
      const complianceScore = calculateComplianceScore();
      const complianceAlerts = generateComplianceAlerts();

      const updatedHcbsData = {
        ...hcbsData,
        compliance: {
          ...hcbsData.compliance,
          compliance_score: complianceScore,
          compliance_alerts: complianceAlerts,
          hcbs_compliant: complianceScore >= 85
        }
      };

      // Update individual record with HCBS data
      const { error } = await supabase
        .from('individuals')
        .update({
          hcbs_data: updatedHcbsData,
          updated_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq('id', selectedIndividual.id);

      if (error) throw error;

      // Update local state
      setHcbsData(updatedHcbsData);
      setSelectedIndividual({
        ...selectedIndividual,
        hcbs_data: updatedHcbsData
      });

      alert('HCBS data saved successfully!');
    } catch (error) {
      console.error('Error saving HCBS data:', error);
      alert('Error saving HCBS data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateComplianceScore = () => {
    let score = 100;
    
    // Community Integration (20 points)
    if (hcbsData.community_integration.last_30_days_activities < 4) score -= 10;
    if (hcbsData.community_integration.choice_based_activities === 0) score -= 10;
    
    // Choice & Autonomy (20 points)
    if (hcbsData.choice_autonomy.choice_offered_percentage < 80) score -= 10;
    if (hcbsData.choice_autonomy.choice_honored_percentage < 80) score -= 10;
    
    // ISP Implementation (20 points)
    if (hcbsData.isp_implementation.goals_not_addressed.length > 0) score -= 10;
    if (hcbsData.isp_implementation.goal_achievement_rate < 50) score -= 10;
    
    // Rights & Restrictions (20 points)
    if (hcbsData.rights_restrictions.has_restrictions) {
      const restrictionTypes = hcbsData.rights_restrictions.restriction_types || [];
      restrictionTypes.forEach(type => {
        const restriction = hcbsData.rights_restrictions[`${type}_restrictions`];
        if (restriction && restriction.active) {
          if (!restriction.hrc_approval_date) score -= 5;
          if (new Date(restriction.review_date) < new Date()) score -= 5;
        }
      });
    }
    
    // Health & Safety (10 points)
    if (hcbsData.health_safety.incidents_by_severity.critical > 0) score -= 5;
    if (hcbsData.health_safety.medication_errors_30_days > 2) score -= 5;
    
    // Staff Readiness (10 points)
    if (hcbsData.staff_readiness.staff_training_compliance < 90) score -= 5;
    if (hcbsData.staff_readiness.expired_certifications.length > 0) score -= 5;

    return Math.max(0, score);
  };

  const generateComplianceAlerts = () => {
    const alerts = [];

    // Community Integration Alerts
    if (hcbsData.community_integration.last_30_days_activities === 0) {
      alerts.push({
        severity: 'critical',
        category: 'Community Integration',
        message: 'No community activities documented in last 30 days',
        action: 'Schedule community outings and document choice-based activities'
      });
    }

    // Choice & Autonomy Alerts
    if (hcbsData.choice_autonomy.choice_offered_percentage < 50) {
      alerts.push({
        severity: 'warning',
        category: 'Choice & Autonomy',
        message: 'Low choice offering percentage',
        action: 'Increase documented choice opportunities in daily activities'
      });
    }

    // ISP Implementation Alerts
    if (hcbsData.isp_implementation.goals_not_addressed.length > 0) {
      alerts.push({
        severity: 'warning',
        category: 'ISP Implementation',
        message: `${hcbsData.isp_implementation.goals_not_addressed.length} goals not addressed in 14+ days`,
        action: 'Document goal-related activities and progress'
      });
    }

    // Rights & Restrictions Alerts
    if (hcbsData.rights_restrictions.has_restrictions) {
      const restrictionTypes = hcbsData.rights_restrictions.restriction_types || [];
      restrictionTypes.forEach(type => {
        const restriction = hcbsData.rights_restrictions[`${type}_restrictions`];
        if (restriction && restriction.active) {
          if (!restriction.hrc_approval_date) {
            alerts.push({
              severity: 'critical',
              category: 'Rights & Restrictions',
              message: `${type} restriction without HRC approval`,
              action: 'Obtain HRC approval immediately or remove restriction'
            });
          }
          if (new Date(restriction.review_date) < new Date()) {
            alerts.push({
              severity: 'critical',
              category: 'Rights & Restrictions',
              message: `${type} restriction review overdue`,
              action: 'Schedule HRC review immediately'
            });
          }
        }
      });
    }

    // Staff Readiness Alerts
    if (hcbsData.staff_readiness.expired_certifications.length > 0) {
      alerts.push({
        severity: 'critical',
        category: 'Staff Readiness',
        message: `${hcbsData.staff_readiness.expired_certifications.length} expired certifications`,
        action: 'Block services until certifications are renewed'
      });
    }

    return alerts;
  };

  const updateCommunityIntegration = (field, value) => {
    setHcbsData({
      ...hcbsData,
      community_integration: {
        ...hcbsData.community_integration,
        [field]: value
      }
    });
  };

  const updateChoiceAutonomy = (field, value) => {
    setHcbsData({
      ...hcbsData,
      choice_autonomy: {
        ...hcbsData.choice_autonomy,
        [field]: value
      }
    });
  };

  const updateISPImplementation = (field, value) => {
    setHcbsData({
      ...hcbsData,
      isp_implementation: {
        ...hcbsData.isp_implementation,
        [field]: value
      }
    });
  };

  const updateRightsRestrictions = (field, value) => {
    setHcbsData({
      ...hcbsData,
      rights_restrictions: {
        ...hcbsData.rights_restrictions,
        [field]: value
      }
    });
  };

  const updateRestrictionType = (type, field, value) => {
    setHcbsData({
      ...hcbsData,
      rights_restrictions: {
        ...hcbsData.rights_restrictions,
        [`${type}_restrictions`]: {
          ...hcbsData.rights_restrictions[`${type}_restrictions`],
          [field]: value
        }
      }
    });
  };

  const updateHealthSafety = (field, value) => {
    setHcbsData({
      ...hcbsData,
      health_safety: {
        ...hcbsData.health_safety,
        [field]: value
      }
    });
  };

  const updateStaffReadiness = (field, value) => {
    setHcbsData({
      ...hcbsData,
      staff_readiness: {
        ...hcbsData.staff_readiness,
        [field]: value
      }
    });
  };

  const updateWaiverInfo = (field, value) => {
    setHcbsData({
      ...hcbsData,
      waiver_info: {
        ...hcbsData.waiver_info,
        [field]: value
      }
    });
  };

  const updatePersonCentered = (field, value) => {
    setHcbsData({
      ...hcbsData,
      person_centered: {
        ...hcbsData.person_centered,
        [field]: value
      }
    });
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

  const filteredIndividuals = individuals.filter(ind => 
    ind.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ind.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ind.individualid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <p className="text-xs text-slate-400 font-medium tracking-wide">HCBS Compliance Center</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3 bg-slate-800/50 backdrop-blur-sm rounded-2xl px-5 py-2.5 w-96 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300">
          <Search size={18} className="text-emerald-400" />
          <input 
            type="text" 
            placeholder="Search individuals..." 
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
            
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full transition-all duration-1000" 
            ></div>
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

  // Permission Check
if (!profileLoading && !canViewHCBS) {
return (
<div className="h-screen flex flex-col bg-slate-950 text-white">
<NavBar />
<div className="flex-1 flex items-center justify-center">
<div className="text-center max-w-md">
<Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
<h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
<p className="text-slate-400 mb-6">
You do not have permission to view HCBS compliance data.
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
<p className="text-slate-400 text-lg">Loading HCBS data...</p>
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
HCBS Compliance
</h2>
<div className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full">
<span className="text-green-400 text-xs font-bold flex items-center gap-1">
<Shield size={12} /> ADMH Certified
</span>
</div>
</div>
<p className="text-slate-400 text-lg">
Home & Community-Based Services • Settings Rule Compliance
</p>
</div>
<div className="flex items-center gap-3">
<button
onClick={() => router.push('/dashboard')}
className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-slate-700"
>
<ArrowLeft size={18} />
Back
</button>
{selectedIndividual && canEditHCBS && (
<button 
                     onClick={handleSaveHCBS}
                     disabled={saving}
                     className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                   >
{saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
{saving ? 'Saving...' : 'Save HCBS Data'}
</button>
)}
</div>
</div>
{!selectedIndividual ? (
              // Individual Selection Screen
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Select Individual</h3>
                  <p className="text-slate-400">Choose an individual to manage their HCBS compliance data</p>
                </div>

                <ScrollArea className="h-[600px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredIndividuals.map((individual, idx) => {
                      const complianceScore = individual.hcbs_data?.compliance?.compliance_score || 0;
                      const isCompliant = complianceScore >= 85;
                      
                      return (
                        <div
                          key={individual.id}
                          onClick={() => handleSelectIndividual(individual)}
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
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-400">Compliance</span>
                              <span className={`font-bold ${isCompliant ? 'text-green-400' : 'text-yellow-400'}`}>
                                {complianceScore}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div 
                                className={`h-full rounded-full ${isCompliant ? 'bg-gradient-to-r from-green-600 to-emerald-500' : 'bg-gradient-to-r from-yellow-600 to-orange-500'}`}
                                style={{width: `${complianceScore}%`}}
                              ></div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                              <span className="text-slate-400 text-xs">{individual.homeassignment}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                isCompliant ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                              }`}>
                                {isCompliant ? 'Compliant' : 'Review'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              // HCBS Data Entry Form
              <>
                {/* Selected Individual Header */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                        {getInitials(selectedIndividual.firstname, selectedIndividual.lastname)}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">
                          {selectedIndividual.firstname} {selectedIndividual.lastname}
                        </h3>
                        <p className="text-slate-400">
                          ID: {selectedIndividual.individualid} • {selectedIndividual.homeassignment}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Compliance Score</p>
                        <p className={`text-3xl font-black ${
                          hcbsData.compliance.compliance_score >= 85 ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {hcbsData.compliance.compliance_score}%
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedIndividual(null)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                      >
                        Change Individual
                      </button>
                    </div>
                  </div>
                </div>

                {/* Compliance Alerts */}
                {hcbsData.compliance.compliance_alerts.length > 0 && (
                  <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertOctagon className="text-red-400" size={24} />
                      <h3 className="text-xl font-bold text-white">Compliance Alerts</h3>
                    </div>
                    <div className="space-y-3">
                      {hcbsData.compliance.compliance_alerts.map((alert, idx) => (
                        <div 
                          key={idx}
                          className={`bg-slate-900/50 border rounded-xl p-4 ${
                            alert.severity === 'critical' ? 'border-red-500/50' : 'border-yellow-500/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${
                              alert.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
                            } animate-pulse`}></div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                  alert.severity === 'critical' ? 'bg-red-900/50 text-red-400' : 'bg-yellow-900/50 text-yellow-400'
                                }`}>
                                  {alert.severity.toUpperCase()}
                                </span>
                                <span className="text-slate-400 text-sm">{alert.category}</span>
                              </div>
                              <p className="text-white font-semibold mb-2">{alert.message}</p>
                              <p className="text-slate-400 text-sm">
                                <span className="text-emerald-400 font-semibold">Action: </span>
                                {alert.action}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div className="bg-gradient-to-br  from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                
                
                  <div className="flex flex-wrap gap-2 w-[70vw]">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                            activeTab === tab.id
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg'
                              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          <Icon size={16} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  <ScrollArea className="h-[600px]">
                    <div className="pr- mt-8">
                      {/* Community Integration Tab */}
                      {activeTab === 'community' && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                              <Globe size={20} />
                              Community Integration Tracking
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Activities (Last 30 Days)
                                </label>
                                <input
                                  type="number"
                                  value={hcbsData.community_integration.last_30_days_activities}
                                  onChange={(e) => updateCommunityIntegration('last_30_days_activities', parseInt(e.target.value) || 0)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Activities (Last 60 Days)
                                </label>
                                <input
                                  type="number"
                                  value={hcbsData.community_integration.last_60_days_activities}
                                  onChange={(e) => updateCommunityIntegration('last_60_days_activities', parseInt(e.target.value) || 0)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Activities (Last 90 Days)
                                </label>
                                <input
                                  type="number"
                                  value={hcbsData.community_integration.last_90_days_activities}
                                  onChange={(e) => updateCommunityIntegration('last_90_days_activities', parseInt(e.target.value) || 0)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Choice-Based Activities
                                </label>
                                <input
                                  type="number"
                                  value={hcbsData.community_integration.choice_based_activities}
                                  onChange={(e) => updateCommunityIntegration('choice_based_activities', parseInt(e.target.value) || 0)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Community Participation Level
                                </label>
                                <select
                                  value={hcbsData.community_integration.community_participation_level}
                                  onChange={(e) => updateCommunityIntegration('community_participation_level', e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                >
                                  <option value="">Select Level</option>
                                  <option value="High">High (4+ activities/week)</option>
                                  <option value="Moderate">Moderate (2-3 activities/week)</option>
                                  <option value="Low">Low (1 activity/week)</option>
                                  <option value="Minimal">Minimal (Less than weekly)</option>
                                </select>
                              </div>
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Activity Types (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={hcbsData.community_integration.activity_types.join(', ')}
                                onChange={(e) => updateCommunityIntegration('activity_types', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                placeholder="e.g., Shopping, Dining, Library, Park, Movies"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Preferred Activities (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={hcbsData.community_integration.preferred_activities.join(', ')}
                                onChange={(e) => updateCommunityIntegration('preferred_activities', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                placeholder="e.g., Movies, Bowling, Restaurants"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Barriers to Community Integration
                              </label>
                              <input
                                type="text"
                                value={hcbsData.community_integration.barriers_to_community.join(', ')}
                                onChange={(e) => updateCommunityIntegration('barriers_to_community', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                placeholder="e.g., Transportation, Behavior, Health"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Last Community Outing
                              </label>
                              <input
                                type="date"
                                value={hcbsData.community_integration.last_community_outing}
                                onChange={(e) => updateCommunityIntegration('last_community_outing', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Community Integration Goals
                              </label>
                              <textarea
                                value={hcbsData.community_integration.community_goals.join('\n')}
                                onChange={(e) => updateCommunityIntegration('community_goals', e.target.value.split('\n').filter(s => s))}
                                rows="4"
                                placeholder="Enter each goal on a new line"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                                disabled={!canEditHCBS}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Choice & Autonomy Tab */}
                      {activeTab === 'choice' && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                              <CheckSquare size={20} />
                              Choice & Autonomy Indicators
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Choice Offered Percentage
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={hcbsData.choice_autonomy.choice_offered_percentage}
                                  onChange={(e) => updateChoiceAutonomy('choice_offered_percentage', parseInt(e.target.value) || 0)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Choice Honored Percentage
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={hcbsData.choice_autonomy.choice_honored_percentage}
                                  onChange={(e) => updateChoiceAutonomy('choice_honored_percentage', parseInt(e.target.value) || 0)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Meal Choices (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={hcbsData.choice_autonomy.meal_choices.join(', ')}
                                onChange={(e) => updateChoiceAutonomy('meal_choices', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                placeholder="e.g., Breakfast selection, Dinner preferences"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Schedule Preferences (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={hcbsData.choice_autonomy.schedule_preferences.join(', ')}
                                onChange={(e) => updateChoiceAutonomy('schedule_preferences', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                placeholder="e.g., Wake time, Bedtime, Activity timing"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Activity Preferences (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={hcbsData.choice_autonomy.activity_preferences.join(', ')}
                                onChange={(e) => updateChoiceAutonomy('activity_preferences', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                placeholder="e.g., TV shows, Music, Hobbies"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500" 
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Living Arrangement Choice
                                </label>
                                <input
                                  type="text"
                                  value={hcbsData.choice_autonomy.living_arrangement_choice}
                                  onChange={(e) => updateChoiceAutonomy('living_arrangement_choice', e.target.value)}
                                  placeholder="e.g., Current home, Own room"
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Roommate Choice
                                </label>
                                <input
                                  type="text"
                                  value={hcbsData.choice_autonomy.roommate_choice}
                                  onChange={(e) => updateChoiceAutonomy('roommate_choice', e.target.value)}
                                  placeholder="e.g., Chose roommate, Private room"
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Staff Choice
                                </label>
                                <input
                                  type="text"
                                  value={hcbsData.choice_autonomy.staff_choice}
                                  onChange={(e) => updateChoiceAutonomy('staff_choice', e.target.value)}
                                  placeholder="e.g., Preferred staff members"
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Privacy Preferences (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={hcbsData.choice_autonomy.privacy_preferences.join(', ')}
                                onChange={(e) => updateChoiceAutonomy('privacy_preferences', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                placeholder="e.g., Knock before entering, Private calls"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Autonomy Concerns (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={hcbsData.choice_autonomy.autonomy_concerns.join(', ')}
                                onChange={(e) => updateChoiceAutonomy('autonomy_concerns', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                placeholder="e.g., Needs support with decisions, Requires prompting"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Decision Support Needed (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={hcbsData.choice_autonomy.decision_support_needed.join(', ')}
                                onChange={(e) => updateChoiceAutonomy('decision_support_needed', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                placeholder="e.g., Visual supports, Simplified choices"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ISP Implementation Tab */}
                      {activeTab === 'isp' && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                              <Target size={20} />
                              ISP Implementation & Goal Activity
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  ISP Review Date
                                </label>
                                <input
                                  type="date"
                                  value={hcbsData.isp_implementation.isp_review_date}
                                  onChange={(e) => updateISPImplementation('isp_review_date', e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Next ISP Review
                                </label>
                                <input
                                  type="date"
                                  value={hcbsData.isp_implementation.next_isp_review}
                                  onChange={(e) => updateISPImplementation('next_isp_review', e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Goal Achievement Rate (%)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={hcbsData.isp_implementation.goal_achievement_rate}
                                onChange={(e) => updateISPImplementation('goal_achievement_rate', parseInt(e.target.value) || 0)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Active Goals (one per line)
                              </label>
                              <textarea
                                value={hcbsData.isp_implementation.active_goals.join('\n')}
                                onChange={(e) => updateISPImplementation('active_goals', e.target.value.split('\n').filter(s => s))}
                                rows="5"
                                placeholder="Enter each active goal on a new line"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Goals Addressed (Last 30 Days)
                              </label>
                              <textarea
                                value={hcbsData.isp_implementation.goals_addressed_30_days.join('\n')}
                                onChange={(e) => updateISPImplementation('goals_addressed_30_days', e.target.value.split('\n').filter(s => s))}
                                rows="4"
                                placeholder="List goals that have been addressed"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Goals Not Addressed (Requiring Attention)
                              </label>
                              <textarea
                                value={hcbsData.isp_implementation.goals_not_addressed.join('\n')}
                                onChange={(e) => updateISPImplementation('goals_not_addressed', e.target.value.split('\n').filter(s => s))}
                                rows="4"
                                placeholder="List goals that need attention"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div>
                              <h5 className="text-md font-bold text-white mb-3">Goal Activity by Domain</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Community
                                  </label>
                                  <input
                                    type="number"
                                    value={hcbsData.isp_implementation.goal_activity_by_domain.community}
                                    onChange={(e) => updateISPImplementation('goal_activity_by_domain', {
                                      ...hcbsData.isp_implementation.goal_activity_by_domain,
                                      community: parseInt(e.target.value) || 0
                                    })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                    disabled={!canEditHCBS}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Independence
                                  </label>
                                  <input
                                    type="number"
                                    value={hcbsData.isp_implementation.goal_activity_by_domain.independence}
                                    onChange={(e) => updateISPImplementation('goal_activity_by_domain', {
                                      ...hcbsData.isp_implementation.goal_activity_by_domain,
                                      independence: parseInt(e.target.value) || 0
                                    })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                    disabled={!canEditHCBS}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Health
                                  </label>
                                  <input
                                    type="number"
                                    value={hcbsData.isp_implementation.goal_activity_by_domain.health}
                                    onChange={(e) => updateISPImplementation('goal_activity_by_domain', {
                                      ...hcbsData.isp_implementation.goal_activity_by_domain,
                                      health: parseInt(e.target.value) || 0
                                    })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                    disabled={!canEditHCBS}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Relationships
                                  </label>
                                  <input
                                    type="number"
                                    value={hcbsData.isp_implementation.goal_activity_by_domain.relationships}
                                    onChange={(e) => updateISPImplementation('goal_activity_by_domain', {
                                      ...hcbsData.isp_implementation.goal_activity_by_domain,
                                      relationships: parseInt(e.target.value) || 0
                                    })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                    disabled={!canEditHCBS}
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Employment
                                  </label>
                                  <input
                                    type="number"
                                    value={hcbsData.isp_implementation.goal_activity_by_domain.employment}
                                    onChange={(e) => updateISPImplementation('goal_activity_by_domain', {
                                      ...hcbsData.isp_implementation.goal_activity_by_domain,
                                      employment: parseInt(e.target.value) || 0
                                    })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                    disabled={!canEditHCBS}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rights & Restrictions Tab */}
                      {activeTab === 'rights' && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                              <Shield size={20} />
                              Rights & Restrictions Monitoring
                            </h4>

                            <div className="mb-6">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={hcbsData.rights_restrictions.has_restrictions}
                                  onChange={(e) => updateRightsRestrictions('has_restrictions', e.target.checked)}
                                  className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                                <span className="text-white font-semibold">Individual Has Rights Restrictions</span>
                              </label>
                            </div>

                            {hcbsData.rights_restrictions.has_restrictions && (
                              <>
                                <div className="mb-6">
                                  <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Active Restriction Types
                                  </label>
                                  <div className="space-y-2">
                                    {['visitor', 'food', 'community', 'financial', 'communication'].map((type) => (
                                      <label key={type} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={hcbsData.rights_restrictions.restriction_types.includes(type)}
                                          onChange={(e) => {
                                            const types = hcbsData.rights_restrictions.restriction_types;
                                            if (e.target.checked) {
                                              updateRightsRestrictions('restriction_types', [...types, type]);
                                            } else {
                                              updateRightsRestrictions('restriction_types', types.filter(t => t !== type));
                                            }
                                          }}
                                          className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500"
                                          disabled={!canEditHCBS}
                                        />
                                        <span className="text-slate-300 capitalize">{type} Restrictions</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>

                                {/* Visitor Restrictions */}
                                {hcbsData.rights_restrictions.restriction_types.includes('visitor') && (
                                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
                                    <h5 className="text-white font-bold mb-3">Visitor Restrictions</h5>
                                    <div className="space-y-4">
                                      <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Reason</label>
                                        <input
                                          type="text"
                                          value={hcbsData.rights_restrictions.visitor_restrictions.reason}
                                          onChange={(e) => updateRestrictionType('visitor', 'reason', e.target.value)}
                                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                          disabled={!canEditHCBS}
                                        />
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-slate-300 mb-2">HRC Approval Date</label>
                                          <input
                                            type="date"
                                            value={hcbsData.rights_restrictions.visitor_restrictions.hrc_approval_date}
                                            onChange={(e) => updateRestrictionType('visitor', 'hrc_approval_date', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                            disabled={!canEditHCBS}
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-slate-300 mb-2">Review Date</label>
                                          <input
                                            type="date"
                                            value={hcbsData.rights_restrictions.visitor_restrictions.review_date}
                                            onChange={(e) => updateRestrictionType('visitor', 'review_date', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                            disabled={!canEditHCBS}
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Justification</label>
                                        <textarea
                                          value={hcbsData.rights_restrictions.visitor_restrictions.justification}
                                          onChange={(e) => updateRestrictionType('visitor', 'justification', e.target.value)}
                                          rows="3"
                                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                                          disabled={!canEditHCBS}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Food Restrictions */}
                                {hcbsData.rights_restrictions.restriction_types.includes('food') && (
                                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
                                    <h5 className="text-white font-bold mb-3">Food Restrictions</h5>
                                    <div className="space-y-4">
                                      <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Reason</label>
                                        <input
                                          type="text"
                                          value={hcbsData.rights_restrictions.food_restrictions.reason}
                                          onChange={(e) => updateRestrictionType('food', 'reason', e.target.value)}
                                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                          disabled={!canEditHCBS}
                                        />
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-slate-300 mb-2">HRC Approval Date</label>
                                          <input
                                            type="date"
                                            value={hcbsData.rights_restrictions.food_restrictions.hrc_approval_date}
                                            onChange={(e) => updateRestrictionType('food', 'hrc_approval_date', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                            disabled={!canEditHCBS}
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-slate-300 mb-2">Review Date</label>
                                          <input
                                            type="date"
                                            value={hcbsData.rights_restrictions.food_restrictions.review_date}
                                            onChange={(e) => updateRestrictionType('food', 'review_date', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                            disabled={!canEditHCBS}
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Justification</label>
                                        <textarea
                                          value={hcbsData.rights_restrictions.food_restrictions.justification}
                                          onChange={(e) => updateRestrictionType('food', 'justification', e.target.value)}
                                          rows="3"
                                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                                          disabled={!canEditHCBS}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Similar sections for community, financial, and communication restrictions */}
                                {/* (Following the same pattern as above) */}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                  <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Reduction Plan</label>
                                    <textarea
                                      value={hcbsData.rights_restrictions.reduction_plan}
                                      onChange={(e) => updateRightsRestrictions('reduction_plan', e.target.value)}
                                      rows="4"
                                      placeholder="Plan to reduce or eliminate restrictions"
                                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                                      disabled={!canEditHCBS}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">HRC Review Frequency</label>
                                    <select
                                      value={hcbsData.rights_restrictions.hrc_review_frequency}
                                      onChange={(e) => updateRightsRestrictions('hrc_review_frequency', e.target.value)}
                                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                      disabled={!canEditHCBS}
                                    >
                                      <option value="">Select Frequency</option>
                                      <option value="Monthly">Monthly</option>
                                      <option value="Quarterly">Quarterly</option>
                                      <option value="Semi-Annually">Semi-Annually</option>
                                      <option value="Annually">Annually</option>
                                    </select>
                                  </div>
                                </div>

                                <div>
                                  <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={hcbsData.rights_restrictions.rights_education_provided}
                                      onChange={(e) => updateRightsRestrictions('rights_education_provided', e.target.checked)}
                                      className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                                      disabled={!canEditHCBS}
                                    />
                                    <span className="text-white font-semibold">Rights Education Provided</span>
                                  </label>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Health & Safety Tab */}
                      {activeTab === 'health' && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                              <Heart size={20} />
                              Health & Safety Oversight
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Incidents (Last 30 Days)
                                </label>
                                <input
                                  type="number"
                                  value={hcbsData.health_safety.incident_count_30_days}
                                  onChange={(e) => updateHealthSafety('incident_count_30_days', parseInt(e.target.value) || 0)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Medication Errors (30 Days)
                                </label>
                                <input
                                  type="number"
                                  value={hcbsData.health_safety.medication_errors_30_days}
                                  onChange={(e) => updateHealthSafety('medication_errors_30_days', parseInt(e.target.value) || 0)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  PRN Usage (30 Days)
                                </label>
                                <input
                                  type="number"
                                  value={hcbsData.health_safety.prn_usage_30_days}
                                  onChange={(e) => updateHealthSafety('prn_usage_30_days', parseInt(e.target.value) || 0)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                            </div>

                            <div className="mb-6">
                              <h5 className="text-md font-bold text-white mb-3">Incidents by Severity</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-slate-300 mb-2">Critical</label>
                                  <input
                                    type="number"
                                    value={hcbsData.health_safety.incidents_by_severity.critical}
                                    onChange={(e) => updateHealthSafety('incidents_by_severity', {
                                      ...hcbsData.health_safety.incidents_by_severity,
                                      critical: parseInt(e.target.value) || 0
})}
className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
disabled={!canEditHCBS}
/>
</div>
<div>
<label className="block text-sm font-medium text-slate-300 mb-2">Major</label>
<input
type="number"
value={hcbsData.health_safety.incidents_by_severity.major}
onChange={(e) => updateHealthSafety('incidents_by_severity', {
...hcbsData.health_safety.incidents_by_severity,
major: parseInt(e.target.value) || 0
})}
className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
disabled={!canEditHCBS}
/>
</div>
<div>
<label className="block text-sm font-medium text-slate-300 mb-2">Moderate</label>
<input
type="number"
value={hcbsData.health_safety.incidents_by_severity.moderate}
onChange={(e) => updateHealthSafety('incidents_by_severity', {
...hcbsData.health_safety.incidents_by_severity,
moderate: parseInt(e.target.value) || 0
})}
className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
disabled={!canEditHCBS}
/>
</div>
<div>
<label className="block text-sm font-medium text-slate-300 mb-2">Minor</label>
<input
type="number"
value={hcbsData.health_safety.incidents_by_severity.minor}
onChange={(e) => updateHealthSafety('incidents_by_severity', {
...hcbsData.health_safety.incidents_by_severity,
minor: parseInt(e.target.value) || 0
})}
className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
disabled={!canEditHCBS}
/>
</div>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Last Health Screening</label>
                                <input
                                  type="date"
                                  value={hcbsData.health_safety.last_health_screening}
                                  onChange={(e) => updateHealthSafety('last_health_screening', e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Next Health Screening</label>
                                <input
                                  type="date"
                                  value={hcbsData.health_safety.next_health_screening}
                                  onChange={(e) => updateHealthSafety('next_health_screening', e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Health Concerns (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={hcbsData.health_safety.health_concerns.join(', ')}
                                onChange={(e) => updateHealthSafety('health_concerns', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                placeholder="e.g., Diabetes, Hypertension, Seizures"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Safety Plans (one per line)
                              </label>
                              <textarea
                                value={hcbsData.health_safety.safety_plans.join('\n')}
                                onChange={(e) => updateHealthSafety('safety_plans', e.target.value.split('\n').filter(s => s))}
                                rows="4"
                                placeholder="List active safety plans"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                                disabled={!canEditHCBS}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Staff Readiness Tab */}
                      {activeTab === 'staff' && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                              <UsersIcon size={20} />
                              Staff Readiness & Compliance
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Staff Training Compliance (%)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={hcbsData.staff_readiness.staff_training_compliance}
                                  onChange={(e) => updateStaffReadiness('staff_training_compliance', parseInt(e.target.value) || 0)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Qualified Staff Percentage (%)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={hcbsData.staff_readiness.qualified_staff_percentage}
                                  onChange={(e) => updateStaffReadiness('qualified_staff_percentage', parseInt(e.target.value) || 0)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                            </div>

                            <div className="mb-6">
                              <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={hcbsData.staff_readiness.staff_ratio_met}
                                  onChange={(e) => updateStaffReadiness('staff_ratio_met', e.target.checked)}
                                  className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                                <span className="text-white font-semibold">Staff Ratio Requirements Met</span>
                              </label>
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Primary Staff Members (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={hcbsData.staff_readiness.primary_staff.join(', ')}
                                onChange={(e) => updateStaffReadiness('primary_staff', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                placeholder="e.g., John Doe, Jane Smith"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Expired Certifications (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={hcbsData.staff_readiness.expired_certifications.join(', ')}
                                onChange={(e) => updateStaffReadiness('expired_certifications', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                placeholder="e.g., CPR - John Doe, First Aid - Jane Smith"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Upcoming Expirations (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={hcbsData.staff_readiness.upcoming_expirations.join(', ')}
                                onChange={(e) => updateStaffReadiness('upcoming_expirations', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                placeholder="e.g., Medication Admin - 03/2026"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Specialized Training Needed (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={hcbsData.staff_readiness.specialized_training_needed.join(', ')}
                                onChange={(e) => updateStaffReadiness('specialized_training_needed', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                placeholder="e.g., Seizure management, Behavior intervention"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Waiver Info Tab */}
                      {activeTab === 'waiver' && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                              <FileText size={20} />
                              Waiver Information
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Waiver Type</label>
                                <select
                                  value={hcbsData.waiver_info.waiver_type}
                                  onChange={(e) => updateWaiverInfo('waiver_type', e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                >
                                  <option value="">Select Waiver Type</option>
                                  <option value="DD">Developmental Disabilities (DD)</option>
                                  <option value="MI">Mental Illness (MI)</option>
                                  <option value="SUD">Substance Use Disorder (SUD)</option>
                                  <option value="Elderly">Elderly & Disabled</option>
                                  <option value="TBI">Traumatic Brain Injury</option>
                                  <option value="Peer">Peer Support</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Level of Care</label>
                                <select
                                  value={hcbsData.waiver_info.level_of_care}
                                  onChange={(e) => updateWaiverInfo('level_of_care', e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                >
                                  <option value="">Select Level</option>
                                  <option value="ICF">ICF/IID</option>
                                  <option value="High">High Support</option>
                                  <option value="Medium">Medium Support</option>
                                  <option value="Low">Low Support</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Waiver Start Date</label>
                                <input
                                  type="date"
                                  value={hcbsData.waiver_info.waiver_start_date}
                                  onChange={(e) => updateWaiverInfo('waiver_start_date', e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Waiver End Date</label>
                                <input
                                  type="date"
                                  value={hcbsData.waiver_info.waiver_end_date}
                                  onChange={(e) => updateWaiverInfo('waiver_end_date', e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Authorized Services (comma-separated)
                              </label>
                              <textarea
                                value={hcbsData.waiver_info.authorized_services.join(', ')}
                                onChange={(e) => updateWaiverInfo('authorized_services', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                rows="4"
                                placeholder="e.g., Residential Habilitation, Day Habilitation, Respite"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Prior Authorizations (comma-separated)
                              </label>
                              <textarea
                                value={hcbsData.waiver_info.prior_authorizations.join(', ')}
                                onChange={(e) => updateWaiverInfo('prior_authorizations', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                rows="4"
                                placeholder="List active prior authorizations"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                                disabled={!canEditHCBS}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Person-Centered Tab */}
                      {activeTab === 'person_centered' && (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                              <Smile size={20} />
                              Person-Centered Planning
                            </h4>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Planning Team Members (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={hcbsData.person_centered.planning_team.join(', ')}
                                onChange={(e) => updatePersonCentered('planning_team', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                placeholder="e.g., Individual, Family, QIDP, Therapist"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Individual's Role in Planning
                              </label>
                              <textarea
                                value={hcbsData.person_centered.individual_role_in_planning}
                                onChange={(e) => updatePersonCentered('individual_role_in_planning', e.target.value)}
                                rows="3"
                                placeholder="Describe the individual's involvement and decision-making"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Family Involvement
                                </label>
                                <textarea
                                  value={hcbsData.person_centered.family_involvement}
                                  onChange={(e) => updatePersonCentered('family_involvement', e.target.value)}
                                  rows="3"
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Advocate Information
                                </label>
                                <textarea
                                  value={hcbsData.person_centered.advocate_information}
                                  onChange={(e) => updatePersonCentered('advocate_information', e.target.value)}
                                  rows="3"
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Communication Method
                                </label>
                                <select
                                  value={hcbsData.person_centered.communication_method}
                                  onChange={(e) => updatePersonCentered('communication_method', e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                >
                                  <option value="">Select Method</option>
                                  <option value="Verbal">Verbal</option>
                                  <option value="AAC Device">AAC Device</option>
                                  <option value="Sign Language">Sign Language</option>
                                  <option value="Picture Board">Picture Board</option>
                                  <option value="Writing">Writing</option>
                                  <option value="Mixed">Mixed Methods</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                  Language Preferences
                                </label>
                                <input
                                  type="text"
                                  value={hcbsData.person_centered.language_preferences}
                                  onChange={(e) => updatePersonCentered('language_preferences', e.target.value)}
                                  placeholder="e.g., English, Spanish"
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                  disabled={!canEditHCBS}
                                />
                              </div>
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Decision-Making Support
                              </label>
                              <textarea
                                value={hcbsData.person_centered.decision_making_support}
                                onChange={(e) => updatePersonCentered('decision_making_support', e.target.value)}
                                rows="4"
                                placeholder="Describe supports needed for decision-making"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div className="mb-6">
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Cultural Considerations (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={hcbsData.person_centered.cultural_considerations.join(', ')}
                                onChange={(e) => updatePersonCentered('cultural_considerations', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                                placeholder="e.g., Dietary restrictions, Religious observances"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-2">
                                Religious Preferences
                              </label>
                              <input
                                type="text"
                                value={hcbsData.person_centered.religious_preferences}
                                onChange={(e) => updatePersonCentered('religious_preferences', e.target.value)}
                                placeholder="e.g., Christian, Muslim, None"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                disabled={!canEditHCBS}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}
          </div>
        </main>
      </ScrollArea>
    </div>
  </div>
</div>
)}

export default HCBSCompliancePage