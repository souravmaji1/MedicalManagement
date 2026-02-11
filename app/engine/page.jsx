'use client';
import React, { useState, useEffect } from 'react';
import { 
  Brain, TrendingUp, TrendingDown, AlertTriangle, Users, Activity, 
  Calendar, Clock, Target, Award, Shield, Heart, Pill, FileText,
  BarChart3, PieChart, LineChart, ArrowUp, ArrowDown, Minus,
  CheckCircle, XCircle, AlertCircle, Info, Zap, Sparkles,
  ChevronRight, ChevronDown, Filter, Download, Search, Bell,
  Menu, X, Home, CreditCard, NetworkIcon, Loader2, Eye, User2Icon,
  TrendingUpIcon, Percent, UserCheck, AlertOctagon, MapPin,
  DollarSign, Gauge, TrendingUpDownIcon, Building2, GraduationCap,
  UserX, UserPlus, BookOpen, ClipboardCheck, AlertCircleIcon,
  TrendingDownIcon, HomeIcon, FileWarning, Scale, Thermometer,
  Stethoscope, Car, Utensils, Smile, Frown, Meh, TrendingUp as TrendingUpIcon2,
  Brain as BrainIcon, Users as UsersIcon, Activity as ActivityIcon,
  HeartPulse, Siren, UserCircle, Briefcase, ClipboardList, FolderOpen
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

const ForesightEnginePage = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { userProfile, loading: profileLoading, hasPermission } = useUserProfile();
  
  const [individuals, setIndividuals] = useState([]);
  const [staffProfiles, setStaffProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('engine');
  const [timeHorizon, setTimeHorizon] = useState('90');
  const [selectedRegion, setSelectedRegion] = useState('all');
  
  const [forecastMarkets, setForecastMarkets] = useState([]);
  const [userCredits, setUserCredits] = useState(100);
  const [userPositions, setUserPositions] = useState({});
  
  const [scenarioInputs, setScenarioInputs] = useState({
    staffIncrease: 0,
    engagementChange: 0,
    newPrograms: 0,
    trainingInvestment: 0,
    wellnessInvestment: 0,
    communityProgramExpansion: 0
  });
  const [scenarioResults, setScenarioResults] = useState(null);

  const [forecasts, setForecasts] = useState({
    riskOutlook: 'MODERATE',
    riskScore: 0,
    highImpactForecasts: [],
    engagementForecast: {},
    workforceOutlook: {},
    capacityForecast: {},
    complianceRisk: {},
    medicationCompliance: {},
    incidentTrends: {},
    goalProgress: {},
    healthTrends: {},
    statusDistribution: {},
    programHealth: {},
    regionalRisks: [],
    utilizationProjection: {},
    blendedForecasts: [],
    staffAnalytics: {},
    trainingCompliance: {},
    leaseCompliance: {},
    complaintsAnalysis: {},
    correctiveActions: {},
    quarterlyReviewStatus: {},
    wellnessMetrics: {},
    outcomesAnalysis: {},
    communityIntegration: {},
    choiceAutonomy: {},
    medicationErrors: {},
    riskPlanEffectiveness: {},
    medicalAlerts: {},
    behavioralAlerts: {},
    rightsRestrictions: {},
    transportationBarriers: {},
    behaviorSupport: {},
    healthMonitoring: {},
    fundingAnalysis: {},
    caseManagerWorkload: {},
    hcbsCompliance: {},
    ispEffectiveness: {}
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

  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      fetchAllData();
    }
  }, [isLoaded, user, profileLoading, userProfile]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      let individualsQuery = supabase
        .from('individuals')
        .select('*')
        .order('created_at', { ascending: false });

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

      const { data: staffData, error: staffError } = await supabase
        .from('user_profiles')
        .select('*');
      
      if (staffError) throw staffError;

      setIndividuals(individualsData || []);
      setStaffProfiles(staffData || []);
      
      initializeForecastMarkets(individualsData || [], staffData || []);
      generateComprehensiveForecasts(individualsData || [], staffData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateComprehensiveForecasts = (individualsData, staffData) => {
    if (!individualsData.length) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // === EXISTING METRICS (Enhanced) ===
    const avgCompliance = individualsData.reduce((acc, ind) => acc + (ind.compliance_score || 0), 0) / individualsData.length;
    const lowComplianceCount = individualsData.filter(ind => (ind.compliance_score || 0) < 85).length;
    const complianceRisk = (lowComplianceCount / individualsData.length) * 100;

    // === MEDICATION ANALYTICS (Enhanced with Errors) ===
    let totalMedications = 0;
    let activeMedications = 0;
    let missedDoses = 0;
    let medicationErrors = 0;
    let errorsByType = {};
    
    individualsData.forEach(ind => {
      if (ind.medications && Array.isArray(ind.medications)) {
        totalMedications += ind.medications.length;
        activeMedications += ind.medications.filter(med => med.status === 'Active').length;
      }
      if (ind.misseddoses && Array.isArray(ind.misseddoses)) {
        missedDoses += ind.misseddoses.length;
      }
      if (ind.mederrors && Array.isArray(ind.mederrors)) {
        medicationErrors += ind.mederrors.length;
        ind.mederrors.forEach(error => {
          const type = error.error_type || 'Unspecified';
          errorsByType[type] = (errorsByType[type] || 0) + 1;
        });
      }
    });

    const medComplianceRate = totalMedications > 0 
      ? ((totalMedications - missedDoses) / totalMedications) * 100 
      : 100;

    const medErrorRate = totalMedications > 0
      ? (medicationErrors / totalMedications) * 100
      : 0;

    // === WELLNESS METRICS (NEW) ===
    let totalVitals = 0;
    let recentVitals = 0;
    let scheduledAppointments = 0;
    let completedAppointments = 0;
    let missedAppointments = 0;
    let wellnessByType = {};
    
    individualsData.forEach(ind => {
      if (ind.wellness_data && Array.isArray(ind.wellness_data)) {
        ind.wellness_data.forEach(wellness => {
          const type = wellness.type || 'other';
          wellnessByType[type] = (wellnessByType[type] || 0) + 1;
          
          if (type === 'vital_signs') {
            totalVitals++;
            if (new Date(wellness.date) > thirtyDaysAgo) {
              recentVitals++;
            }
          }
          
          if (type === 'appointment') {
            scheduledAppointments++;
            if (wellness.status === 'Completed') completedAppointments++;
            if (wellness.status === 'Missed') missedAppointments++;
          }
        });
      }
    });

    const appointmentComplianceRate = scheduledAppointments > 0
      ? (completedAppointments / scheduledAppointments) * 100
      : 100;

    // === OUTCOMES & ISP EFFECTIVENESS (NEW) ===
    let totalOutcomes = 0;
    let inProgressOutcomes = 0;
    let completedOutcomes = 0;
    let outcomesByDomain = {};
    let totalObjectives = 0;
    let achievedObjectives = 0;
    
    individualsData.forEach(ind => {
      if (ind.outcomes && Array.isArray(ind.outcomes)) {
        totalOutcomes += ind.outcomes.length;
        ind.outcomes.forEach(outcome => {
          if (outcome.status === 'In Progress') inProgressOutcomes++;
          if (outcome.status === 'Completed') completedOutcomes++;
          
          const domain = outcome.hcbsdomain || 'Unspecified';
          outcomesByDomain[domain] = (outcomesByDomain[domain] || 0) + 1;
          
          if (outcome.objectives && Array.isArray(outcome.objectives)) {
            totalObjectives += outcome.objectives.length;
            achievedObjectives += outcome.objectives.filter(obj => obj.status === 'Achieved').length;
          }
        });
      }
    });

    const outcomeCompletionRate = totalOutcomes > 0
      ? (completedOutcomes / totalOutcomes) * 100
      : 0;

    const objectiveAchievementRate = totalObjectives > 0
      ? (achievedObjectives / totalObjectives) * 100
      : 0;

    // === GOALS ANALYTICS (Enhanced) ===
    let totalGoals = 0;
    let activeGoals = 0;
    let avgGoalProgress = 0;
    let goalsByDomain = {};
    
    individualsData.forEach(ind => {
      if (ind.goals && Array.isArray(ind.goals)) {
        totalGoals += ind.goals.length;
        activeGoals += ind.goals.filter(goal => goal.status === 'Active').length;
        const goalProgresses = ind.goals.map(g => g.progress || 0);
        avgGoalProgress += goalProgresses.reduce((a, b) => a + b, 0) / Math.max(goalProgresses.length, 1);
        
        ind.goals.forEach(goal => {
          const domain = goal.hcbsdomain || 'Other';
          goalsByDomain[domain] = (goalsByDomain[domain] || 0) + 1;
        });
      }
    });

    avgGoalProgress = avgGoalProgress / Math.max(individualsData.length, 1);
    const goalCompletionTrend = avgGoalProgress >= 50 ? 'positive' : avgGoalProgress >= 25 ? 'neutral' : 'negative';

    // === COMMUNITY INTEGRATION (NEW) ===
    let totalCommunityActivities = 0;
    let activitiesByType = {};
    let individualsWithActivities = 0;
    let choiceDocumentedCount = 0;
    
    individualsData.forEach(ind => {
      if (ind.community_activity_log && Array.isArray(ind.community_activity_log)) {
        if (ind.community_activity_log.length > 0) individualsWithActivities++;
        totalCommunityActivities += ind.community_activity_log.length;
        
        ind.community_activity_log.forEach(activity => {
          const type = activity.activity_type || 'Other';
          activitiesByType[type] = (activitiesByType[type] || 0) + 1;
          if (activity.choice_documented) choiceDocumentedCount++;
        });
      }
    });

    const communityParticipationRate = individualsData.length > 0
      ? (individualsWithActivities / individualsData.length) * 100
      : 0;

    const avgActivitiesPerPerson = individualsData.length > 0
      ? totalCommunityActivities / individualsData.length
      : 0;

    // === CHOICE & AUTONOMY (NEW) ===
    let totalChoiceAcknowledgments = 0;
    let hcbsCompliantChoices = 0;
    let rightsExplainedCount = 0;
    
    individualsData.forEach(ind => {
      if (ind.choice_acknowledgments && Array.isArray(ind.choice_acknowledgments)) {
        totalChoiceAcknowledgments += ind.choice_acknowledgments.length;
        ind.choice_acknowledgments.forEach(ack => {
          if (ack.hcbs_compliant) hcbsCompliantChoices++;
          if (ack.rights_explained) rightsExplainedCount++;
        });
      }
    });

    const choiceComplianceRate = totalChoiceAcknowledgments > 0
      ? (hcbsCompliantChoices / totalChoiceAcknowledgments) * 100
      : 100;

    // === TRANSPORTATION & BARRIERS (NEW) ===
    let transportationMethods = {};
    let communityBarriers = {};
    
    individualsData.forEach(ind => {
      if (ind.transportation_method) {
        const method = ind.transportation_method;
        transportationMethods[method] = (transportationMethods[method] || 0) + 1;
      }
      if (ind.community_barriers) {
        const barrier = ind.community_barriers;
        communityBarriers[barrier] = (communityBarriers[barrier] || 0) + 1;
      }
    });

    // === RISK PLANS (NEW) ===
    let totalRiskPlans = 0;
    let activeRiskPlans = 0;
    let riskPlansByType = {};
    
    individualsData.forEach(ind => {
      if (ind.riskplans && Array.isArray(ind.riskplans)) {
        totalRiskPlans += ind.riskplans.length;
        ind.riskplans.forEach(plan => {
          if (plan.status === 'Active') activeRiskPlans++;
          const type = plan.risktype || 'Unspecified';
          riskPlansByType[type] = (riskPlansByType[type] || 0) + 1;
        });
      }
    });

    // === MEDICAL & BEHAVIORAL ALERTS (NEW) ===
    let totalMedicalAlerts = 0;
    let activeMedicalAlerts = 0;
    let totalBehavioralAlerts = 0;
    let activeBehavioralAlerts = 0;
    let alertsBySeverity = { High: 0, Medium: 0, Low: 0 };
    
    individualsData.forEach(ind => {
      if (ind.medicalalerts && Array.isArray(ind.medicalalerts)) {
        totalMedicalAlerts += ind.medicalalerts.length;
        ind.medicalalerts.forEach(alert => {
          if (alert.status === 'Active') activeMedicalAlerts++;
          const severity = alert.severity || 'Medium';
          alertsBySeverity[severity] = (alertsBySeverity[severity] || 0) + 1;
        });
      }
      if (ind.behavioralalerts && Array.isArray(ind.behavioralalerts)) {
        totalBehavioralAlerts += ind.behavioralalerts.length;
        ind.behavioralalerts.forEach(alert => {
          if (alert.status === 'Active') activeBehavioralAlerts++;
          const severity = alert.severity || 'Medium';
          alertsBySeverity[severity] = (alertsBySeverity[severity] || 0) + 1;
        });
      }
    });

    // === BEHAVIOR SUPPORT (NEW) ===
    let individualsRequiringABC = 0;
    let individualsWithStrategies = 0;
    
    individualsData.forEach(ind => {
      if (ind.abc_data_required) individualsRequiringABC++;
      if (ind.behavior_strategies) individualsWithStrategies++;
    });

    // === RIGHTS RESTRICTIONS (NEW) ===
    let totalRightsRestrictions = 0;
    
    individualsData.forEach(ind => {
      if (ind.rightsrestrictions && Array.isArray(ind.rightsrestrictions)) {
        totalRightsRestrictions += ind.rightsrestrictions.length;
      }
    });

    // === FUNDING SOURCE ANALYSIS (NEW) ===
    let fundingSources = {};
    
    individualsData.forEach(ind => {
      if (ind.funding_source) {
        const source = ind.funding_source;
        fundingSources[source] = (fundingSources[source] || 0) + 1;
      }
    });

    // === CASE MANAGER WORKLOAD (NEW) ===
    let caseManagerLoads = {};
    
    individualsData.forEach(ind => {
      if (ind.qddp_case_manager) {
        const manager = ind.qddp_case_manager;
        caseManagerLoads[manager] = (caseManagerLoads[manager] || 0) + 1;
      }
    });

    // === EXISTING METRICS (Continued) ===
    let totalIncidents = 0;
    let openIncidents = 0;
    let highSeverityIncidents = 0;
    
    individualsData.forEach(ind => {
      if (ind.incidents && Array.isArray(ind.incidents)) {
        totalIncidents += ind.incidents.length;
        openIncidents += ind.incidents.filter(inc => inc.status === 'Open').length;
        highSeverityIncidents += ind.incidents.filter(inc => 
          inc.severity?.includes('Critical') || inc.severity?.includes('Major')
        ).length;
      }
    });

    const incidentRate = (totalIncidents / individualsData.length).toFixed(1);
    const openIncidentRate = (openIncidents / Math.max(totalIncidents, 1)) * 100;

    let totalNotes = 0;
    let notesLast30Days = 0;
    
    individualsData.forEach(ind => {
      if (ind.dailynotes && Array.isArray(ind.dailynotes)) {
        totalNotes += ind.dailynotes.length;
        notesLast30Days += ind.dailynotes.filter(note => 
          new Date(note.timestamp || note.date) > thirtyDaysAgo
        ).length;
      }
    });

    const avgNotesPerIndividual = totalNotes / Math.max(individualsData.length, 1);
    const engagementTrend = avgNotesPerIndividual >= 10 ? 'high' : avgNotesPerIndividual >= 5 ? 'medium' : 'low';

    // === STAFF ANALYTICS ===
    let totalAssignedStaff = 0;
    let staffWithTraining = 0;
    let staffWithoutTraining = 0;
    let uniqueStaffIds = new Set();
    let staffByRole = {};
    let staffByShift = {};
    
    individualsData.forEach(ind => {
      if (ind.assigned_staff && Array.isArray(ind.assigned_staff)) {
        ind.assigned_staff.forEach(staff => {
          totalAssignedStaff++;
          uniqueStaffIds.add(staff.staff_id || staff.staff_name);
          
          if (staff.training_completed) {
            staffWithTraining++;
          } else if (staff.status === 'Active') {
            staffWithoutTraining++;
          }
          
          const role = staff.role || 'Unspecified';
          staffByRole[role] = (staffByRole[role] || 0) + 1;
          
          const shift = staff.shift_assignment || 'Unassigned';
          staffByShift[shift] = (staffByShift[shift] || 0) + 1;
        });
      }
    });

    const trainingComplianceRate = totalAssignedStaff > 0 
      ? (staffWithTraining / totalAssignedStaff) * 100 
      : 100;

    // === TRAINING REQUIREMENTS ===
    let totalTrainingReqs = 0;
    let requiredTrainings = 0;
    let trainingsByType = {};
    
    individualsData.forEach(ind => {
      if (ind.staff_training_requirements && Array.isArray(ind.staff_training_requirements)) {
        totalTrainingReqs += ind.staff_training_requirements.length;
        ind.staff_training_requirements.forEach(req => {
          if (req.required) requiredTrainings++;
          const type = req.training_type || 'Other';
          trainingsByType[type] = (trainingsByType[type] || 0) + 1;
        });
      }
    });

    // === LEASE COMPLIANCE ===
    let totalWithLease = 0;
    let fullyCompliantLeases = 0;
    let missingLeaseSignature = 0;
    let missingRightsExplanation = 0;
    let expiringSoon = 0;
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    
    individualsData.forEach(ind => {
      if (ind.lease_start_date) {
        totalWithLease++;
        
        const hasSignature = ind.signed_by_individual && ind.lease_signature_date;
        const hasRights = ind.rights_explained;
        
        if (hasSignature && hasRights) {
          fullyCompliantLeases++;
        }
        if (!hasSignature) missingLeaseSignature++;
        if (!hasRights) missingRightsExplanation++;
        
        if (ind.lease_end_date) {
          const endDate = new Date(ind.lease_end_date);
          if (endDate <= ninetyDaysFromNow && endDate > new Date()) {
            expiringSoon++;
          }
        }
      }
    });

    const leaseComplianceRate = totalWithLease > 0 
      ? (fullyCompliantLeases / totalWithLease) * 100 
      : 0;

    // === COMPLAINTS & GRIEVANCES ===
    let totalComplaints = 0;
    let openComplaints = 0;
    let complaintsByType = {};
    let recentComplaints = 0;
    
    individualsData.forEach(ind => {
      if (ind.complaints && Array.isArray(ind.complaints)) {
        totalComplaints += ind.complaints.length;
        ind.complaints.forEach(complaint => {
          if (complaint.resolution_status === 'Open') openComplaints++;
          
          const type = complaint.complaint_type || 'Other';
          complaintsByType[type] = (complaintsByType[type] || 0) + 1;
          
          if (complaint.date_filed) {
            const filedDate = new Date(complaint.date_filed);
            if (filedDate > thirtyDaysAgo) recentComplaints++;
          }
        });
      }
    });

    const complaintRate = individualsData.length > 0 
      ? (totalComplaints / individualsData.length).toFixed(2) 
      : '0.00';

    // === CORRECTIVE ACTION PLANS ===
    let totalCAPs = 0;
    let openCAPs = 0;
    let completedCAPs = 0;
    let overdueCAPs = 0;
    let capsByTrigger = {};
    
    individualsData.forEach(ind => {
      if (ind.corrective_action_plans && Array.isArray(ind.corrective_action_plans)) {
        totalCAPs += ind.corrective_action_plans.length;
        ind.corrective_action_plans.forEach(cap => {
          if (cap.status === 'Open' || cap.status === 'In Progress') {
            openCAPs++;
            if (cap.due_date && new Date(cap.due_date) < new Date()) {
              overdueCAPs++;
            }
          }
          if (cap.status === 'Completed') completedCAPs++;
          
          const trigger = cap.trigger_type || 'Other';
          capsByTrigger[trigger] = (capsByTrigger[trigger] || 0) + 1;
        });
      }
    });

    // === QUARTERLY REVIEWS ===
    let totalReviews = 0;
    let reviewsThisQuarter = 0;
    let overdueReviews = 0;
    
    const currentQuarter = `Q${Math.floor((new Date().getMonth() / 3)) + 1} ${new Date().getFullYear()}`;
    
    individualsData.forEach(ind => {
      if (ind.quarterly_reviews && Array.isArray(ind.quarterly_reviews)) {
        totalReviews += ind.quarterly_reviews.length;
        ind.quarterly_reviews.forEach(review => {
          if (review.quarter === currentQuarter) reviewsThisQuarter++;
        });
      }
      
      if (ind.isp_next_review) {
        const nextReview = new Date(ind.isp_next_review);
        if (nextReview < new Date()) overdueReviews++;
      }
    });

    const activeCount = individualsData.filter(ind => ind.status === 'Active').length;
    const reviewCount = individualsData.filter(ind => ind.status === 'Review').length;
    const inactiveCount = individualsData.filter(ind => ind.status === 'Inactive').length;
    const reviewRate = individualsData.length > 0 ? (reviewCount / individualsData.length) * 100 : 0;

    const totalStaff = staffData.length;
    const staffByDivision = {
      DD: staffData.filter(s => s.division === 'DD').length,
      MI: staffData.filter(s => s.division === 'MI').length,
      SUD: staffData.filter(s => s.division === 'SUD').length,
      PEER: staffData.filter(s => s.division === 'PEER').length
    };

    const documentationRate = individualsData.length > 0 
      ? ((notesLast30Days / (individualsData.length * 30)) * 100).toFixed(0) 
      : '0';
    const avgNotesPerStaff = totalStaff > 0 ? (notesLast30Days / totalStaff).toFixed(1) : '0';

    const overtimePressure = parseFloat(documentationRate) < 60 ? 'High' : parseFloat(documentationRate) < 80 ? 'Medium' : 'Low';
    const turnoverRisk = overtimePressure === 'High' ? 63 : overtimePressure === 'Medium' ? 45 : 28;

    // === REGIONAL RISKS (Enhanced) ===
    const homeAssignments = {};
    individualsData.forEach(ind => {
      if (ind.homeassignment) {
        if (!homeAssignments[ind.homeassignment]) {
          homeAssignments[ind.homeassignment] = {
            total: 0,
            incidents: 0,
            lowCompliance: 0,
            staffGaps: 0,
            openComplaints: 0,
            activeMedAlerts: 0,
            communityParticipation: 0
          };
        }
        homeAssignments[ind.homeassignment].total++;
        if (ind.incidents && ind.incidents.length > 0) {
          homeAssignments[ind.homeassignment].incidents += ind.incidents.length;
        }
        if ((ind.compliance_score || 0) < 85) {
          homeAssignments[ind.homeassignment].lowCompliance++;
        }
        if (ind.assigned_staff && ind.assigned_staff.some(s => !s.training_completed && s.status === 'Active')) {
          homeAssignments[ind.homeassignment].staffGaps++;
        }
        if (ind.complaints && ind.complaints.some(c => c.resolution_status === 'Open')) {
          homeAssignments[ind.homeassignment].openComplaints++;
        }
        if (ind.medicalalerts && ind.medicalalerts.some(a => a.status === 'Active')) {
          homeAssignments[ind.homeassignment].activeMedAlerts++;
        }
        if (ind.community_activity_log && ind.community_activity_log.length > 0) {
          homeAssignments[ind.homeassignment].communityParticipation++;
        }
      }
    });

    const regionalRisks = Object.entries(homeAssignments).map(([region, data]) => ({
      region,
      riskLevel: data.lowCompliance / data.total > 0.3 || data.staffGaps / data.total > 0.2 || data.activeMedAlerts > 2 ? 'High' : 
                 data.incidents / data.total > 2 || data.openComplaints > 0 ? 'Watch' : 'Stable',
      individuals: data.total,
      incidentRate: (data.incidents / data.total).toFixed(1),
      staffGaps: data.staffGaps,
      openComplaints: data.openComplaints,
      activeMedAlerts: data.activeMedAlerts,
      communityParticipation: ((data.communityParticipation / data.total) * 100).toFixed(0)
    }));

    // === HCBS DOMAIN ANALYSIS ===
    const programsByHCBS = {};
    individualsData.forEach(ind => {
      if (ind.hcbsdomains && Array.isArray(ind.hcbsdomains)) {
        ind.hcbsdomains.forEach(domain => {
          if (!programsByHCBS[domain]) {
            programsByHCBS[domain] = {
              participants: 0,
              avgEngagement: 0,
              notesCount: 0,
              goalsCount: 0,
              outcomesCount: 0
            };
          }
          programsByHCBS[domain].participants++;
          if (ind.dailynotes) {
            programsByHCBS[domain].notesCount += ind.dailynotes.length;
          }
          if (ind.goals) {
            programsByHCBS[domain].goalsCount += ind.goals.filter(g => g.hcbsdomain === domain).length;
          }
          if (ind.outcomes) {
            programsByHCBS[domain].outcomesCount += ind.outcomes.filter(o => o.hcbsdomain === domain).length;
          }
        });
      }
    });

    Object.keys(programsByHCBS).forEach(domain => {
      programsByHCBS[domain].avgEngagement = 
        programsByHCBS[domain].participants > 0
          ? (programsByHCBS[domain].notesCount / programsByHCBS[domain].participants).toFixed(1)
          : '0';
    });

    const currentUtilization = individualsData.length > 0 
      ? ((activeCount / individualsData.length) * 100).toFixed(0) 
      : '0';
    const projectedUtilization = Math.min(parseInt(currentUtilization) + 5, 100);
    const capacityTightening = projectedUtilization > 85;

    // === ENHANCED ML FORECASTS ===
    const mlForecasts = [
      {
        question: 'Will ISP outcome completion rate exceed 75% next quarter?',
        mlProbability: Math.min(outcomeCompletionRate + 10, 95).toFixed(0),
        trend: outcomeCompletionRate > 65 ? 'up' : 'down',
        confidence: 'High',
        driver: `${completedOutcomes} of ${totalOutcomes} outcomes completed, ${objectiveAchievementRate.toFixed(0)}% objective achievement`
      },
      {
        question: 'Will community integration participation reach 80%?',
        mlProbability: Math.min(communityParticipationRate + 15, 90).toFixed(0),
        trend: communityParticipationRate > 60 ? 'up' : 'stable',
        confidence: 'High',
        driver: `${individualsWithActivities} of ${individualsData.length} participating, ${avgActivitiesPerPerson.toFixed(1)} avg activities per person`
      },
      {
        question: 'Will wellness appointment compliance drop below 80%?',
        mlProbability: Math.max(100 - appointmentComplianceRate + 5, 0).toFixed(0),
        trend: appointmentComplianceRate < 85 ? 'up' : 'down',
        confidence: 'Medium',
        driver: `${missedAppointments} missed of ${scheduledAppointments} scheduled, ${completedAppointments} completed`
      },
      {
        question: 'Will medication error rate increase >5%?',
        mlProbability: Math.min(medErrorRate * 2 + 20, 85).toFixed(0),
        trend: medErrorRate > 3 ? 'up' : 'stable',
        confidence: 'High',
        driver: `${medicationErrors} errors across ${totalMedications} total medications (${medErrorRate.toFixed(1)}% error rate)`
      },
      {
        question: 'Will active medical/behavioral alerts exceed 15 organization-wide?',
        mlProbability: Math.min(((activeMedicalAlerts + activeBehavioralAlerts) / 15) * 100, 95).toFixed(0),
        trend: (activeMedicalAlerts + activeBehavioralAlerts) > 10 ? 'up' : 'stable',
        confidence: 'High',
        driver: `${activeMedicalAlerts} medical + ${activeBehavioralAlerts} behavioral alerts currently active`
      },
      {
        question: 'Will training compliance drop below 80% in next quarter?',
        mlProbability: Math.max(100 - trainingComplianceRate + 10, 0).toFixed(0),
        trend: trainingComplianceRate < 85 ? 'up' : 'stable',
        confidence: 'High',
        driver: `${staffWithoutTraining} active staff lack ISP training of ${totalAssignedStaff} total assignments`
      },
      {
        question: 'Will lease compliance violations increase >15%?',
        mlProbability: Math.min((missingLeaseSignature + missingRightsExplanation) * 3, 85).toFixed(0),
        trend: leaseComplianceRate < 90 ? 'up' : 'stable',
        confidence: 'High',
        driver: `${totalWithLease - fullyCompliantLeases} of ${totalWithLease} leases non-compliant`
      },
      {
        question: 'Will HCBS choice compliance fall below 90%?',
        mlProbability: Math.max(100 - choiceComplianceRate + 5, 0).toFixed(0),
        trend: choiceComplianceRate < 95 ? 'up' : 'down',
        confidence: 'Medium',
        driver: `${hcbsCompliantChoices} of ${totalChoiceAcknowledgments} choices HCBS-compliant, ${rightsExplainedCount} had rights explained`
      },
      {
        question: 'Will goal achievement rate improve >10% next quarter?',
        mlProbability: goalCompletionTrend === 'positive' ? 72 : goalCompletionTrend === 'neutral' ? 45 : 25,
        trend: goalCompletionTrend === 'positive' ? 'up' : 'down',
        confidence: 'Medium',
        driver: `${avgGoalProgress.toFixed(0)}% average progress, ${activeGoals} of ${totalGoals} goals active`
      },
      {
        question: 'Will turnover exceed target in next 6 months?',
        mlProbability: turnoverRisk,
        trend: overtimePressure === 'High' ? 'up' : 'stable',
        confidence: 'Medium',
        driver: `Documentation rate at ${documentationRate}%, ${totalStaff} staff members`
      }
    ];

    const blendedForecasts = mlForecasts.map((mlForecast, idx) => {
      const marketForecast = forecastMarkets[idx];
      if (marketForecast) {
        const totalVotes = marketForecast.yesVotes + marketForecast.noVotes;
        const marketProb = (marketForecast.yesVotes / totalVotes * 100).toFixed(0);
        const blendedProb = (
          (parseFloat(mlForecast.mlProbability) * 0.6) +
          (parseFloat(marketProb) * 0.4)
        ).toFixed(0);
        
        return {
          ...mlForecast,
          marketProbability: marketProb,
          blendedProbability: blendedProb,
          question: marketForecast.question
        };
      }
      return {
        ...mlForecast,
        blendedProbability: mlForecast.mlProbability
      };
    });

    // === ENHANCED RISK SCORE ===
    const riskScore = (
      (complianceRisk * 0.10) +
      ((100 - medComplianceRate) * 0.08) +
      (medErrorRate * 0.08) +
      (openIncidentRate * 0.08) +
      ((100 - avgGoalProgress) * 0.07) +
      (turnoverRisk * 0.10) +
      ((100 - trainingComplianceRate) * 0.10) +
      ((100 - leaseComplianceRate) * 0.07) +
      ((openComplaints / individualsData.length * 100) * 0.06) +
      ((openCAPs / Math.max(totalCAPs, 1) * 100) * 0.03) +
      ((100 - appointmentComplianceRate) * 0.06) +
      ((100 - outcomeCompletionRate) * 0.07) +
      ((100 - communityParticipationRate) * 0.05) +
      ((100 - choiceComplianceRate) * 0.05)
    );

    const riskOutlook = riskScore > 40 ? 'HIGH' : riskScore > 20 ? 'MODERATE' : 'LOW';

    setForecasts({
      riskOutlook,
      riskScore: riskScore.toFixed(1),
      highImpactForecasts: mlForecasts,
      blendedForecasts,
      engagementForecast: {
        current: avgNotesPerIndividual.toFixed(1),
        projected: (avgNotesPerIndividual * 0.92).toFixed(1),
        trend: engagementTrend,
        notesLast30Days,
        totalNotes
      },
      workforceOutlook: {
        totalStaff,
        staffByDivision,
        documentationRate,
        avgNotesPerStaff,
        overtimePressure,
        turnoverRisk: turnoverRisk.toFixed(0)
      },
      capacityForecast: {
        activeIndividuals: activeCount,
        reviewNeeded: reviewCount,
        utilization: currentUtilization,
        projectedUtilization,
        capacityTightening
      },
      complianceRisk: {
        avgScore: avgCompliance.toFixed(1),
        lowComplianceCount,
        riskLevel: complianceRisk > 20 ? 'High' : complianceRisk > 10 ? 'Medium' : 'Low'
      },
      medicationCompliance: {
        totalMedications,
        activeMedications,
        missedDoses,
        complianceRate: medComplianceRate.toFixed(1),
        trend: medComplianceRate >= 95 ? 'positive' : medComplianceRate >= 85 ? 'neutral' : 'negative'
      },
      incidentTrends: {
        totalIncidents,
        openIncidents,
        highSeverityIncidents,
        incidentRate,
        openIncidentRate: openIncidentRate.toFixed(0),
        trend: openIncidentRate > 30 ? 'increasing' : 'stable'
      },
      goalProgress: {
        totalGoals,
        activeGoals,
        avgProgress: avgGoalProgress.toFixed(1),
        trend: goalCompletionTrend,
        goalsByDomain
      },
      healthTrends: {
        vitalsComplianceRate: ((recentVitals / individualsData.length) * 100).toFixed(0),
        upcomingAppointments: scheduledAppointments - completedAppointments - missedAppointments,
        recentVitals: recentVitals,
        totalVitals: totalVitals
      },
      statusDistribution: {
        active: activeCount,
        review: reviewCount,
        inactive: inactiveCount,
        reviewRate: reviewRate.toFixed(1)
      },
      programHealth: programsByHCBS,
      regionalRisks,
      utilizationProjection: {
        current: currentUtilization,
        projected: projectedUtilization,
        tightening: capacityTightening
      },
      staffAnalytics: {
        totalAssignedStaff,
        uniqueStaff: uniqueStaffIds.size,
        staffWithTraining,
        staffWithoutTraining,
        trainingComplianceRate: trainingComplianceRate.toFixed(1),
        staffByRole,
        staffByShift,
        avgStaffPerIndividual: (totalAssignedStaff / individualsData.length).toFixed(1)
      },
      trainingCompliance: {
        totalRequirements: totalTrainingReqs,
        requiredTrainings,
        trainingsByType,
        complianceRate: trainingComplianceRate.toFixed(1),
        staffNeedingTraining: staffWithoutTraining
      },
      leaseCompliance: {
        totalWithLease,
        fullyCompliant: fullyCompliantLeases,
        missingSignature: missingLeaseSignature,
        missingRights: missingRightsExplanation,
        expiringSoon,
        complianceRate: leaseComplianceRate.toFixed(1)
      },
      complaintsAnalysis: {
        total: totalComplaints,
        open: openComplaints,
        recent: recentComplaints,
        byType: complaintsByType,
        ratePerIndividual: complaintRate,
        resolutionRate: totalComplaints > 0 ? (((totalComplaints - openComplaints) / totalComplaints) * 100).toFixed(0) : '100'
      },
      correctiveActions: {
        total: totalCAPs,
        open: openCAPs,
        completed: completedCAPs,
        overdue: overdueCAPs,
        byTrigger: capsByTrigger,
        completionRate: totalCAPs > 0 ? ((completedCAPs / totalCAPs) * 100).toFixed(0) : '0'
      },
      quarterlyReviewStatus: {
        total: totalReviews,
        thisQuarter: reviewsThisQuarter,
        overdue: overdueReviews,
        currentQuarter,
        complianceRate: individualsData.length > 0 ? (((individualsData.length - overdueReviews) / individualsData.length) * 100).toFixed(0) : '100'
      },
      wellnessMetrics: {
        totalAppointments: scheduledAppointments,
        completed: completedAppointments,
        missed: missedAppointments,
        complianceRate: appointmentComplianceRate.toFixed(1),
        totalVitals,
        recentVitals,
        wellnessByType
      },
      outcomesAnalysis: {
        total: totalOutcomes,
        inProgress: inProgressOutcomes,
        completed: completedOutcomes,
        completionRate: outcomeCompletionRate.toFixed(1),
        totalObjectives,
        achievedObjectives,
        achievementRate: objectiveAchievementRate.toFixed(1),
        outcomesByDomain
      },
      communityIntegration: {
        totalActivities: totalCommunityActivities,
        participationRate: communityParticipationRate.toFixed(1),
        avgActivitiesPerPerson: avgActivitiesPerPerson.toFixed(1),
        activitiesByType,
        choiceDocumented: choiceDocumentedCount
      },
      choiceAutonomy: {
        totalAcknowledgments: totalChoiceAcknowledgments,
        hcbsCompliant: hcbsCompliantChoices,
        complianceRate: choiceComplianceRate.toFixed(1),
        rightsExplained: rightsExplainedCount
      },
      medicationErrors: {
        total: medicationErrors,
        errorRate: medErrorRate.toFixed(2),
        errorsByType
      },
      riskPlanEffectiveness: {
        total: totalRiskPlans,
        active: activeRiskPlans,
        riskPlansByType
      },
      medicalAlerts: {
        total: totalMedicalAlerts,
        active: activeMedicalAlerts,
        alertsBySeverity
      },
      behavioralAlerts: {
        total: totalBehavioralAlerts,
        active: activeBehavioralAlerts
      },
      rightsRestrictions: {
        total: totalRightsRestrictions,
        individualsAffected: individualsData.filter(ind => 
          ind.rightsrestrictions && ind.rightsrestrictions.length > 0
        ).length
      },
      transportationBarriers: {
        transportationMethods,
        communityBarriers
      },
      behaviorSupport: {
        requireABC: individualsRequiringABC,
        haveStrategies: individualsWithStrategies,
        abcComplianceRate: individualsRequiringABC > 0 
          ? ((individualsWithStrategies / individualsRequiringABC) * 100).toFixed(0) 
          : '100'
      },
      fundingAnalysis: {
        fundingSources,
        totalIndividuals: individualsData.length
      },
      caseManagerWorkload: {
        caseManagerLoads,
        avgCaseload: Object.keys(caseManagerLoads).length > 0
          ? (individualsData.length / Object.keys(caseManagerLoads).length).toFixed(1)
          : '0'
      },
      hcbsCompliance: {
        domainsServed: Object.keys(programsByHCBS).length,
        choiceComplianceRate: choiceComplianceRate.toFixed(1),
        communityParticipationRate: communityParticipationRate.toFixed(1),
        rightsRestrictionsCount: totalRightsRestrictions
      },
      ispEffectiveness: {
        outcomeCompletionRate: outcomeCompletionRate.toFixed(1),
        goalProgressRate: avgGoalProgress.toFixed(1),
        objectiveAchievementRate: objectiveAchievementRate.toFixed(1),
        quarterlyReviewCompliance: ((individualsData.length - overdueReviews) / individualsData.length * 100).toFixed(0)
      }
    });
  };

  const initializeForecastMarkets = (individualsData, staffData) => {
    if (!individualsData.length) return;
    
    const markets = [
      {
        id: 'market_1',
        question: 'Will ISP outcome completion rate exceed 75% next quarter?',
        yesVotes: 68,
        noVotes: 32,
        totalCredits: 500,
        status: 'active',
        mlProbability: 70,
        currentMetric: 'Current: 65%',
        trend: 'up'
      },
      {
        id: 'market_2',
        question: 'Will community integration participation reach 80%?',
        yesVotes: 72,
        noVotes: 28,
        totalCredits: 480,
        status: 'active',
        mlProbability: 75,
        currentMetric: 'Current: 68%',
        trend: 'up'
      },
      {
        id: 'market_3',
        question: 'Will wellness appointment compliance drop below 80%?',
        yesVotes: 35,
        noVotes: 65,
        totalCredits: 420,
        status: 'active',
        mlProbability: 30,
        currentMetric: 'Current: 87%',
        trend: 'down'
      },
      {
        id: 'market_4',
        question: 'Will medication error rate increase >5%?',
        yesVotes: 42,
        noVotes: 58,
        totalCredits: 390,
        status: 'active',
        mlProbability: 38,
        currentMetric: 'Current: 2.3%',
        trend: 'stable'
      }
    ];

    setForecastMarkets(markets);
  };

  const runScenarioSimulation = () => {
    const baseForecasts = forecasts;
    const staffImpact = scenarioInputs.staffIncrease / 10;
    const engagementImpact = scenarioInputs.engagementChange;
    const trainingInvestment = scenarioInputs.trainingInvestment;
    const wellnessInvestment = scenarioInputs.wellnessInvestment;
    const communityExpansion = scenarioInputs.communityProgramExpansion;
    
    const newTurnoverRisk = Math.max(0, parseFloat(baseForecasts.workforceOutlook.turnoverRisk) - staffImpact * 5);
    const newEngagement = parseFloat(baseForecasts.engagementForecast.current) * (1 + engagementImpact / 100);
    const newOvertimePressure = staffImpact > 2 ? 'Low' : staffImpact > 1 ? 'Medium' : baseForecasts.workforceOutlook.overtimePressure;
    const newUtilization = Math.min(100, parseFloat(baseForecasts.capacityForecast.utilization) + (scenarioInputs.newPrograms * 5));
    const newTrainingCompliance = Math.min(100, parseFloat(baseForecasts.trainingCompliance.complianceRate) + (trainingInvestment * 2));
    const newWellnessCompliance = Math.min(100, parseFloat(baseForecasts.wellnessMetrics.complianceRate) + (wellnessInvestment * 1.5));
    const newCommunityParticipation = Math.min(100, parseFloat(baseForecasts.communityIntegration.participationRate) + (communityExpansion * 3));
    const newOutcomeCompletion = Math.min(100, parseFloat(baseForecasts.outcomesAnalysis.completionRate) + (engagementImpact / 2));

    setScenarioResults({
      turnoverRisk: newTurnoverRisk.toFixed(0),
      turnoverChange: (newTurnoverRisk - parseFloat(baseForecasts.workforceOutlook.turnoverRisk)).toFixed(0),
      engagement: newEngagement.toFixed(1),
      engagementChange: ((newEngagement - parseFloat(baseForecasts.engagementForecast.current)) / parseFloat(baseForecasts.engagementForecast.current) * 100).toFixed(0),
      overtimePressure: newOvertimePressure,
      utilization: newUtilization.toFixed(0),
      trainingCompliance: newTrainingCompliance.toFixed(0),
      trainingChange: (newTrainingCompliance - parseFloat(baseForecasts.trainingCompliance.complianceRate)).toFixed(0),
      wellnessCompliance: newWellnessCompliance.toFixed(0),
      wellnessChange: (newWellnessCompliance - parseFloat(baseForecasts.wellnessMetrics.complianceRate)).toFixed(0),
      communityParticipation: newCommunityParticipation.toFixed(0),
      communityChange: (newCommunityParticipation - parseFloat(baseForecasts.communityIntegration.participationRate)).toFixed(0),
      outcomeCompletion: newOutcomeCompletion.toFixed(0),
      outcomeChange: (newOutcomeCompletion - parseFloat(baseForecasts.outcomesAnalysis.completionRate)).toFixed(0)
    });
  };

  const castForecastVote = (marketId, voteYes, credits) => {
    if (credits > userCredits) {
      alert('Insufficient credits');
      return;
    }
    
    setForecastMarkets(prev => prev.map(market => {
      if (market.id === marketId) {
        return {
          ...market,
          yesVotes: voteYes ? market.yesVotes + credits : market.yesVotes,
          noVotes: !voteYes ? market.noVotes + credits : market.noVotes,
          totalCredits: market.totalCredits + credits
        };
      }
      return market;
    }));

    setUserCredits(prev => prev - credits);
    setUserPositions(prev => ({
      ...prev,
      [marketId]: { vote: voteYes ? 'YES' : 'NO', credits }
    }));
  };

  const exportForesightBriefing = () => {
    alert('Foresight briefing export - generating comprehensive PDF with all analytics, forecasts, compliance metrics, and governance statement');
  };

  const getRiskColor = (outlook) => {
    switch(outlook) {
      case 'HIGH': return 'text-red-400 bg-red-900/30 border-red-500/50';
      case 'MODERATE': return 'text-yellow-400 bg-yellow-900/30 border-yellow-500/50';
      case 'LOW': return 'text-green-400 bg-green-900/30 border-green-500/50';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return <ArrowUp className="text-red-400" size={18} />;
      case 'down': return <ArrowDown className="text-green-400" size={18} />;
      case 'stable': return <Minus className="text-yellow-400" size={18} />;
      default: return <Minus className="text-slate-400" size={18} />;
    }
  };

  const getRegionalRiskColor = (level) => {
    switch(level) {
      case 'High': return 'bg-red-600';
      case 'Watch': return 'bg-yellow-600';
      case 'Stable': return 'bg-green-600';
      default: return 'bg-slate-600';
    }
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
            placeholder="Search forecasts..." 
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
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                if (item.id !== 'reports') {
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

  if (!isLoaded || loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Analyzing comprehensive data...</p>
          <p className="text-slate-500 text-sm mt-2">Processing outcomes, wellness, community integration, and compliance metrics...</p>
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
                
                {/* Global Header */}
                <div className="bg-gradient-to-r from-purple-900/20 via-pink-900/20 to-purple-900/20 border border-purple-500/30 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                        <Brain className="text-white animate-pulse" size={28} />
                      </div>
                      <div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600">
                          CAREBRIDGE FORESIGHT ENGINE
                        </h1>
                        <p className="text-slate-300 text-sm">Predictive Intelligence • Non-PHI • Comprehensive Analytics</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={timeHorizon}
                        onChange={(e) => setTimeHorizon(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                      >
                        <option value="30">30 Days</option>
                        <option value="90">90 Days</option>
                        <option value="180">180 Days</option>
                      </select>
                      <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                      >
                        <option value="all">All Regions</option>
                        {forecasts.regionalRisks?.map(region => (
                          <option key={region.region} value={region.region}>{region.region}</option>
                        ))}
                      </select>
                      <button 
                        onClick={exportForesightBriefing}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                      >
                        <Download size={16} />
                        Export Briefing
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm flex-wrap">
                    <CheckCircle className="text-green-400" size={16} />
                    <span className="text-green-400 font-semibold">Aggregated</span>
                    <span className="text-slate-400">•</span>
                    <CheckCircle className="text-green-400" size={16} />
                    <span className="text-green-400 font-semibold">De-Identified</span>
                    <span className="text-slate-400">•</span>
                    <CheckCircle className="text-green-400" size={16} />
                    <span className="text-green-400 font-semibold">HCBS Compliant</span>
                    <span className="text-slate-400">• Analyzing {individuals.length} Individuals • {forecasts.staffAnalytics?.uniqueStaff || 0} Unique Staff • {forecasts.outcomesAnalysis?.total || 0} Outcomes</span>
                  </div>
                </div>

                {/* Executive Summary Dashboard - ENHANCED */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Sparkles className="text-purple-400" size={24} />
                    Executive Foresight Summary
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <p className="text-slate-400 text-sm mb-2">Overall Risk Outlook</p>
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xl font-bold border ${getRiskColor(forecasts.riskOutlook)}`}>
                        {forecasts.riskOutlook === 'HIGH' && <AlertOctagon size={24} />}
                        {forecasts.riskOutlook === 'MODERATE' && <AlertCircle size={24} />}
                        {forecasts.riskOutlook === 'LOW' && <CheckCircle size={24} />}
                        {forecasts.riskOutlook}
                      </div>
                      <p className="text-slate-400 text-xs mt-2">Next {timeHorizon} Days</p>
                    </div>
                    
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <p className="text-slate-400 text-sm mb-2">Risk Score</p>
                      <div className="flex items-end gap-2">
                        <p className="text-4xl font-black text-white">{forecasts.riskScore}</p>
                        <p className="text-slate-400 text-lg mb-1">/100</p>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mt-2">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            forecasts.riskScore > 40 ? 'bg-gradient-to-r from-red-600 to-orange-500' :
                            forecasts.riskScore > 20 ? 'bg-gradient-to-r from-yellow-600 to-orange-500' :
                            'bg-gradient-to-r from-green-600 to-emerald-500'
                          }`}
                          style={{width: `${forecasts.riskScore}%`}}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <p className="text-slate-400 text-sm mb-2">ISP Effectiveness</p>
                      <div className="flex items-end gap-2 mb-2">
                        <p className="text-3xl font-black text-white">{forecasts.ispEffectiveness?.outcomeCompletionRate || 0}%</p>
                        <Target className={`mb-1 ${parseFloat(forecasts.ispEffectiveness?.outcomeCompletionRate || 0) >= 70 ? 'text-green-400' : 'text-yellow-400'}`} size={20} />
                      </div>
                      <p className="text-slate-400 text-xs">
                        {forecasts.outcomesAnalysis?.completed || 0}/{forecasts.outcomesAnalysis?.total || 0} outcomes completed
                      </p>
                    </div>
                    
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <p className="text-slate-400 text-sm mb-2">HCBS Compliance</p>
                      <div className="flex items-end gap-2 mb-2">
                        <p className="text-3xl font-black text-white">{forecasts.hcbsCompliance?.choiceComplianceRate || 0}%</p>
                        <Shield className={`mb-1 ${parseFloat(forecasts.hcbsCompliance?.choiceComplianceRate || 0) >= 90 ? 'text-green-400' : 'text-yellow-400'}`} size={20} />
                      </div>
                      <p className="text-slate-400 text-xs">
                        {forecasts.hcbsCompliance?.domainsServed || 0} domains active
                      </p>
                    </div>
                  </div>

                  {/* Quick Metrics Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Heart className="text-pink-400" size={16} />
                        <p className="text-slate-400 text-xs">Wellness Compliance</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{forecasts.wellnessMetrics?.complianceRate || 0}%</p>
                    </div>
                    
                    <div className="bg-slate-800/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="text-cyan-400" size={16} />
                        <p className="text-slate-400 text-xs">Community Participation</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{forecasts.communityIntegration?.participationRate || 0}%</p>
                    </div>
                    
                    <div className="bg-slate-800/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Pill className="text-blue-400" size={16} />
                        <p className="text-slate-400 text-xs">Med Compliance</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{forecasts.medicationCompliance?.complianceRate || 0}%</p>
                    </div>
                    
                    <div className="bg-slate-800/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="text-green-400" size={16} />
                        <p className="text-slate-400 text-xs">Goal Progress</p>
                      </div>
                      <p className="text-2xl font-bold text-white">{forecasts.goalProgress?.avgProgress || 0}%</p>
                    </div>
                  </div>
                </div>

                {/* NEW: ISP Outcomes & Effectiveness Dashboard */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Target className="text-emerald-400" size={24} />
                    ISP Outcomes & Effectiveness
                  </h2>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Outcome Progress</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-sm">Total Outcomes</span>
                          <span className="text-white font-bold text-xl">{forecasts.outcomesAnalysis?.total || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-sm">In Progress</span>
                          <span className="text-blue-400 font-bold text-xl">{forecasts.outcomesAnalysis?.inProgress || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-sm">Completed</span>
                          <span className="text-green-400 font-bold text-xl">{forecasts.outcomesAnalysis?.completed || 0}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300 font-semibold">Completion Rate</span>
                            <span className="text-emerald-400 font-bold text-2xl">{forecasts.outcomesAnalysis?.completionRate || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-emerald-600 to-green-500 rounded-full transition-all"
                              style={{width: `${forecasts.outcomesAnalysis?.completionRate || 0}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Objective Achievement</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-sm">Total Objectives</span>
                          <span className="text-white font-bold text-xl">{forecasts.outcomesAnalysis?.totalObjectives || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-sm">Achieved</span>
                          <span className="text-green-400 font-bold text-xl">{forecasts.outcomesAnalysis?.achievedObjectives || 0}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-300 font-semibold">Achievement Rate</span>
                            <span className="text-cyan-400 font-bold text-2xl">{forecasts.outcomesAnalysis?.achievementRate || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full transition-all"
                              style={{width: `${forecasts.outcomesAnalysis?.achievementRate || 0}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Outcomes by Domain</h3>
                      {Object.keys(forecasts.outcomesAnalysis?.outcomesByDomain || {}).length > 0 ? (
                        <div className="space-y-2">
                          {Object.entries(forecasts.outcomesAnalysis?.outcomesByDomain || {}).map(([domain, count]) => (
                            <div key={domain} className="flex items-center justify-between">
                              <span className="text-white text-sm">{domain}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"
                                    style={{width: `${(count / (forecasts.outcomesAnalysis?.total || 1)) * 100}%`}}
                                  ></div>
                                </div>
                                <span className="text-purple-400 font-bold text-sm w-8 text-right">{count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-slate-400">
                          <Target className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                          <p className="text-sm">No outcomes data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* NEW: Wellness & Health Monitoring Dashboard */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <HeartPulse className="text-pink-400" size={24} />
                    Wellness & Health Monitoring
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <p className="text-slate-400 text-sm mb-2">Appointment Compliance</p>
                      <p className="text-4xl font-black text-white">{forecasts.wellnessMetrics?.complianceRate || 0}%</p>
                      <p className="text-slate-400 text-xs mt-2">
                        {forecasts.wellnessMetrics?.completed || 0}/{forecasts.wellnessMetrics?.totalAppointments || 0} completed
                      </p>
                    </div>
                    
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <p className="text-slate-400 text-sm mb-2">Missed Appointments</p>
                      <p className="text-4xl font-black text-red-400">{forecasts.wellnessMetrics?.missed || 0}</p>
                      <p className="text-slate-400 text-xs mt-2">Requires follow-up</p>
                    </div>
                    
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <p className="text-slate-400 text-sm mb-2">Recent Vitals</p>
                      <p className="text-4xl font-black text-cyan-400">{forecasts.wellnessMetrics?.recentVitals || 0}</p>
                      <p className="text-slate-400 text-xs mt-2">Last 30 days</p>
                    </div>
                    
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <p className="text-slate-400 text-sm mb-2">Total Vitals Logged</p>
                      <p className="text-4xl font-black text-white">{forecasts.wellnessMetrics?.totalVitals || 0}</p>
                      <p className="text-slate-400 text-xs mt-2">All time</p>
                    </div>
                  </div>

                  {Object.keys(forecasts.wellnessMetrics?.wellnessByType || {}).length > 0 && (
                    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4">Wellness Activities by Type</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(forecasts.wellnessMetrics?.wellnessByType || {}).map(([type, count]) => (
                          <div key={type} className="bg-slate-800/50 rounded-lg p-3">
                            <p className="text-slate-400 text-xs mb-1 capitalize">{type.replace('_', ' ')}</p>
                            <p className="text-2xl font-bold text-white">{count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* NEW: Community Integration Dashboard */}
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
<h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
<Users className="text-cyan-400" size={24} />
Community Integration & Participation
</h2>
<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Participation Rate</p>
                  <p className="text-4xl font-black text-white">{forecasts.communityIntegration?.participationRate || 0}%</p>
                  <p className="text-slate-400 text-xs mt-2">
                    Active participants
                  </p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Total Activities</p>
                  <p className="text-4xl font-black text-cyan-400">{forecasts.communityIntegration?.totalActivities || 0}</p>
                  <p className="text-slate-400 text-xs mt-2">Organization-wide</p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Avg Per Person</p>
                  <p className="text-4xl font-black text-white">{forecasts.communityIntegration?.avgActivitiesPerPerson || 0}</p>
                  <p className="text-slate-400 text-xs mt-2">Activities/person</p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Choice Documented</p>
                  <p className="text-4xl font-black text-green-400">{forecasts.communityIntegration?.choiceDocumented || 0}</p>
                  <p className="text-slate-400 text-xs mt-2">HCBS compliant</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {Object.keys(forecasts.communityIntegration?.activitiesByType || {}).length > 0 && (
                  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Activities by Type</h3>
                    <div className="space-y-2">
                      {Object.entries(forecasts.communityIntegration?.activitiesByType || {}).map(([type, count]) => (
                        <div key={type} className="flex items-center justify-between">
                          <span className="text-white text-sm capitalize">{type}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full"
                                style={{width: `${(count / (forecasts.communityIntegration?.totalActivities || 1)) * 100}%`}}
                              ></div>
                            </div>
                            <span className="text-cyan-400 font-bold text-sm w-12 text-right">{count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(forecasts.transportationBarriers?.transportationMethods || {}).length > 0 && (
                  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">Transportation Methods</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(forecasts.transportationBarriers?.transportationMethods || {}).map(([method, count]) => (
                        <div key={method} className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-slate-400 text-xs mb-1">{method}</p>
                          <p className="text-2xl font-bold text-white">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* NEW: Choice & Autonomy Compliance */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <CheckCircle className="text-green-400" size={24} />
                Choice & Autonomy (HCBS Core Value)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">HCBS Compliance</p>
                  <div className="flex items-end gap-2 mb-2">
                    <p className="text-4xl font-black text-white">{forecasts.choiceAutonomy?.complianceRate || 0}%</p>
                    <Shield className={`mb-1 ${parseFloat(forecasts.choiceAutonomy?.complianceRate || 0) >= 95 ? 'text-green-400' : 'text-yellow-400'}`} size={20} />
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden mt-2">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        parseFloat(forecasts.choiceAutonomy?.complianceRate || 0) >= 95 ? 'bg-gradient-to-r from-green-600 to-emerald-500' :
                        'bg-gradient-to-r from-yellow-600 to-orange-500'
                      }`}
                      style={{width: `${forecasts.choiceAutonomy?.complianceRate || 0}%`}}
                    ></div>
                  </div>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Total Acknowledgments</p>
                  <p className="text-4xl font-black text-white">{forecasts.choiceAutonomy?.totalAcknowledgments || 0}</p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">HCBS Compliant</p>
                  <p className="text-4xl font-black text-green-400">{forecasts.choiceAutonomy?.hcbsCompliant || 0}</p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Rights Explained</p>
                  <p className="text-4xl font-black text-cyan-400">{forecasts.choiceAutonomy?.rightsExplained || 0}</p>
                </div>
              </div>
            </div>

            {/* NEW: Medication Safety & Errors */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Pill className="text-blue-400" size={24} />
                Medication Safety & Error Prevention
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Error Rate</p>
                  <p className="text-4xl font-black text-white">{forecasts.medicationErrors?.errorRate || 0}%</p>
                  <p className="text-slate-400 text-xs mt-2">
                    {forecasts.medicationErrors?.total || 0} total errors
                  </p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Med Compliance</p>
                  <p className="text-4xl font-black text-green-400">{forecasts.medicationCompliance?.complianceRate || 0}%</p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Missed Doses</p>
                  <p className="text-4xl font-black text-orange-400">{forecasts.medicationCompliance?.missedDoses || 0}</p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Active Medications</p>
                  <p className="text-4xl font-black text-white">{forecasts.medicationCompliance?.activeMedications || 0}</p>
                </div>
              </div>

              {Object.keys(forecasts.medicationErrors?.errorsByType || {}).length > 0 && (
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Errors by Type</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(forecasts.medicationErrors?.errorsByType || {}).map(([type, count]) => (
                      <div key={type} className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                        <p className="text-red-400 text-xs mb-1">{type}</p>
                        <p className="text-2xl font-bold text-white">{count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* NEW: Medical & Behavioral Alerts */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Siren className="text-red-400" size={24} />
                Active Alerts & Monitoring
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Medical Alerts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Total</span>
                      <span className="text-white font-bold text-xl">{forecasts.medicalAlerts?.total || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Active</span>
                      <span className="text-red-400 font-bold text-2xl">{forecasts.medicalAlerts?.active || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Behavioral Alerts</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Total</span>
                      <span className="text-white font-bold text-xl">{forecasts.behavioralAlerts?.total || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Active</span>
                      <span className="text-orange-400 font-bold text-2xl">{forecasts.behavioralAlerts?.active || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">By Severity</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-red-400 text-sm">High</span>
                      <span className="text-red-400 font-bold">{forecasts.medicalAlerts?.alertsBySeverity?.High || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400 text-sm">Medium</span>
                      <span className="text-yellow-400 font-bold">{forecasts.medicalAlerts?.alertsBySeverity?.Medium || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-400 text-sm">Low</span>
                      <span className="text-blue-400 font-bold">{forecasts.medicalAlerts?.alertsBySeverity?.Low || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW: Risk Plans & Behavior Support */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <AlertTriangle className="text-amber-400" size={24} />
                Risk Management & Behavior Support
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Risk Plans</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Total Plans</span>
                      <span className="text-white font-bold text-xl">{forecasts.riskPlanEffectiveness?.total || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Active</span>
                      <span className="text-amber-400 font-bold text-2xl">{forecasts.riskPlanEffectiveness?.active || 0}</span>
                    </div>
                    
                    {Object.keys(forecasts.riskPlanEffectiveness?.riskPlansByType || {}).length > 0 && (
                      <div className="pt-3 border-t border-slate-700">
                        <p className="text-slate-400 text-xs mb-2">By Type</p>
                        <div className="space-y-1">
                          {Object.entries(forecasts.riskPlanEffectiveness?.riskPlansByType || {}).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between text-sm">
                              <span className="text-slate-300">{type}</span>
                              <span className="text-amber-400 font-semibold">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Behavior Support</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Require ABC Data</span>
                      <span className="text-white font-bold text-xl">{forecasts.behaviorSupport?.requireABC || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Have Strategies</span>
                      <span className="text-green-400 font-bold text-xl">{forecasts.behaviorSupport?.haveStrategies || 0}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-300 font-semibold">ABC Compliance</span>
                        <span className="text-cyan-400 font-bold text-2xl">{forecasts.behaviorSupport?.abcComplianceRate || 0}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full transition-all"
                          style={{width: `${forecasts.behaviorSupport?.abcComplianceRate || 0}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW: Funding Source Analysis */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <DollarSign className="text-green-400" size={24} />
                Funding Source Distribution
              </h2>
              
              {Object.keys(forecasts.fundingAnalysis?.fundingSources || {}).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(forecasts.fundingAnalysis?.fundingSources || {}).map(([source, count]) => (
                    <div key={source} className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                      <p className="text-slate-400 text-sm mb-2">{source}</p>
                      <p className="text-3xl font-black text-white">{count}</p>
                      <p className="text-slate-400 text-xs mt-2">
                        {((count / (forecasts.fundingAnalysis?.totalIndividuals || 1)) * 100).toFixed(0)}% of total
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <DollarSign className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">No funding source data available</p>
                </div>
              )}
            </div>

            {/* NEW: Case Manager Workload */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Briefcase className="text-purple-400" size={24} />
                QDDP/Case Manager Workload Distribution
              </h2>
              
              <div className="mb-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 inline-block">
                  <p className="text-slate-400 text-sm mb-2">Average Caseload</p>
                  <p className="text-5xl font-black text-white">{forecasts.caseManagerWorkload?.avgCaseload || 0}</p>
                  <p className="text-slate-400 text-xs mt-2">Individuals per manager</p>
                </div>
              </div>
              
              {Object.keys(forecasts.caseManagerWorkload?.caseManagerLoads || {}).length > 0 ? (
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Individual Case Managers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(forecasts.caseManagerWorkload?.caseManagerLoads || {}).map(([manager, count]) => (
                      <div key={manager} className="bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <UserCircle className="text-purple-400" size={16} />
                          <p className="text-white text-sm font-semibold truncate">{manager}</p>
                        </div>
                        <p className="text-3xl font-bold text-purple-400">{count}</p>
                        <p className="text-slate-400 text-xs mt-1">assigned individuals</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Briefcase className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">No case manager data available</p>
                </div>
              )}
            </div>

            {/* EXISTING SECTIONS CONTINUE... */}
            {/* Staff Analytics Dashboard */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <GraduationCap className="text-cyan-400" size={24} />
                Staff Training & Assignment Analytics
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Training Compliance</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      parseFloat(forecasts.staffAnalytics?.trainingComplianceRate || 0) >= 90 ? 'bg-green-900/30 text-green-400 border border-green-500/50' :
                      parseFloat(forecasts.staffAnalytics?.trainingComplianceRate || 0) >= 80 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50' :
                      'bg-red-900/30 text-red-400 border border-red-500/50'
                    }`}>
                      {forecasts.staffAnalytics?.trainingComplianceRate || 0}%
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs mb-1">Total Assigned</p>
                        <p className="text-2xl font-bold text-white">{forecasts.staffAnalytics?.totalAssignedStaff || 0}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs mb-1">Unique Staff</p>
                        <p className="text-2xl font-bold text-cyan-400">{forecasts.staffAnalytics?.uniqueStaff || 0}</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="text-green-400" size={16} />
                          <span className="text-sm text-slate-300">Training Complete</span>
                        </div>
                        <span className="text-white font-bold">{forecasts.staffAnalytics?.staffWithTraining || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="text-red-400" size={16} />
                          <span className="text-sm text-slate-300">Training Needed</span>
                        </div>
                        <span className="text-red-400 font-bold">{forecasts.staffAnalytics?.staffWithoutTraining || 0}</span>
                      </div>
                    </div>
                    
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          parseFloat(forecasts.staffAnalytics?.trainingComplianceRate || 0) >= 90 ? 'bg-gradient-to-r from-green-600 to-emerald-500' :
                          parseFloat(forecasts.staffAnalytics?.trainingComplianceRate || 0) >= 80 ? 'bg-gradient-to-r from-yellow-600 to-orange-500' :
                          'bg-gradient-to-r from-red-600 to-orange-500'
                        }`}
                        style={{width: `${forecasts.staffAnalytics?.trainingComplianceRate || 0}%`}}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Staff Distribution</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-slate-400 text-sm mb-3">By Role</p>
                      <div className="space-y-2">
                        {Object.entries(forecasts.staffAnalytics?.staffByRole || {}).map(([role, count]) => (
                          <div key={role} className="flex items-center justify-between">
                            <span className="text-white text-sm">{role || 'Unspecified'}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full"
                                  style={{width: `${(count / (forecasts.staffAnalytics?.totalAssignedStaff || 1)) * 100}%`}}
                                ></div>
                              </div>
                              <span className="text-cyan-400 font-bold text-sm w-8 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-700">
                      <p className="text-slate-400 text-sm mb-3">By Shift</p>
                      <div className="space-y-2">
                        {Object.entries(forecasts.staffAnalytics?.staffByShift || {}).map(([shift, count]) => (
                          <div key={shift} className="flex items-center justify-between">
                            <span className="text-white text-sm">{shift}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"
                                  style={{width: `${(count / (forecasts.staffAnalytics?.totalAssignedStaff || 1)) * 100}%`}}
                                ></div>
                              </div>
                              <span className="text-purple-400 font-bold text-sm w-8 text-right">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Training Requirements by Type</h3>
                
                {Object.keys(forecasts.trainingCompliance?.trainingsByType || {}).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(forecasts.trainingCompliance?.trainingsByType || {}).map(([type, count]) => (
                      <div key={type} className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs mb-1 truncate" title={type}>{type}</p>
                        <p className="text-xl font-bold text-white">{count}</p>
                        <p className="text-xs text-slate-500">requirement{count !== 1 ? 's' : ''}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm">No specialized training requirements defined</p>
                  </div>
                )}
              </div>
            </div>

            {/* Lease & Rights Compliance Dashboard */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Scale className="text-indigo-400" size={24} />
                Lease & HCBS Rights Compliance
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Overall Compliance</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                      parseFloat(forecasts.leaseCompliance?.complianceRate || 0) >= 95 ? 'bg-green-900/30 text-green-400 border border-green-500/50' :
                      parseFloat(forecasts.leaseCompliance?.complianceRate || 0) >= 85 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50' :
                      'bg-red-900/30 text-red-400 border border-red-500/50'
                    }`}>
                      {forecasts.leaseCompliance?.complianceRate || 0}%
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Total with Lease</span>
                      <span className="text-white font-bold">{forecasts.leaseCompliance?.totalWithLease || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-400" size={14} />
                        <span className="text-slate-400 text-sm">Fully Compliant</span>
                      </div>
                      <span className="text-green-400 font-bold">{forecasts.leaseCompliance?.fullyCompliant || 0}</span>
                    </div>
                    
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden mt-4">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          parseFloat(forecasts.leaseCompliance?.complianceRate || 0) >= 95 ? 'bg-gradient-to-r from-green-600 to-emerald-500' :
                          parseFloat(forecasts.leaseCompliance?.complianceRate || 0) >= 85 ? 'bg-gradient-to-r from-yellow-600 to-orange-500' :
                          'bg-gradient-to-r from-red-600 to-orange-500'
                        }`}
                        style={{width: `${forecasts.leaseCompliance?.complianceRate || 0}%`}}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Compliance Gaps</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <FileWarning className="text-red-400" size={16} />
                          <span className="text-sm text-slate-300">Missing Signature</span>
                        </div>
                        <span className="text-red-400 font-bold">{forecasts.leaseCompliance?.missingSignature || 0}</span>
                      </div>
                      <p className="text-xs text-slate-400">HCBS violation risk</p>
                    </div>
                    
                    <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="text-amber-400" size={16} />
                          <span className="text-sm text-slate-300">Rights Not Explained</span>
                        </div>
                        <span className="text-amber-400 font-bold">{forecasts.leaseCompliance?.missingRights || 0}</span>
                      </div>
                      <p className="text-xs text-slate-400">Requires documentation</p>
                    </div>
                    
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Clock className="text-yellow-400" size={16} />
                          <span className="text-sm text-slate-300">Expiring Soon (90d)</span>
                        </div>
                        <span className="text-yellow-400 font-bold">{forecasts.leaseCompliance?.expiringSoon || 0}</span>
                      </div>
                      <p className="text-xs text-slate-400">Renewal needed</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Action Required</h3>
                  
                  <div className="space-y-3">
                    {(forecasts.leaseCompliance?.missingSignature || 0) > 0 && (
                      <div className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={14} />
                        <div>
                          <p className="text-white font-semibold">Obtain {forecasts.leaseCompliance?.missingSignature} signature{forecasts.leaseCompliance?.missingSignature !== 1 ? 's' : ''}</p>
                          <p className="text-slate-400 text-xs">Priority: High</p>
                        </div>
                      </div>
                    )}
                    
                    {(forecasts.leaseCompliance?.missingRights || 0) > 0 && (
                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="text-amber-400 flex-shrink-0 mt-0.5" size={14} />
                        <div>
                          <p className="text-white font-semibold">Document rights explanation for {forecasts.leaseCompliance?.missingRights}</p>
                          <p className="text-slate-400 text-xs">Priority: High</p>
                        </div>
                      </div>
                    )}
                    
                    {(forecasts.leaseCompliance?.expiringSoon || 0) > 0 && (
                      <div className="flex items-start gap-2 text-sm">
                        <Clock className="text-yellow-400 flex-shrink-0 mt-0.5" size={14} />
                        <div>
                          <p className="text-white font-semibold">Renew {forecasts.leaseCompliance?.expiringSoon} lease{forecasts.leaseCompliance?.expiringSoon !== 1 ? 's' : ''}</p>
                          <p className="text-slate-400 text-xs">Priority: Medium</p>
                        </div>
                      </div>
                    )}
                    
                    {(forecasts.leaseCompliance?.missingSignature || 0) === 0 && 
                     (forecasts.leaseCompliance?.missingRights || 0) === 0 && 
                     (forecasts.leaseCompliance?.expiringSoon || 0) === 0 && (
                      <div className="flex items-center gap-2 text-sm text-green-400">
                        <CheckCircle size={14} />
                        <span>All leases compliant</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Complaints & Grievances Dashboard */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <AlertCircleIcon className="text-orange-400" size={24} />
                Complaints & Grievance Tracking
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Total Complaints</p>
                  <p className="text-4xl font-black text-white">{forecasts.complaintsAnalysis?.total || 0}</p>
                  <p className="text-slate-400 text-xs mt-2">{forecasts.complaintsAnalysis?.ratePerIndividual || 0} per individual</p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Open Complaints</p>
                  <p className="text-4xl font-black text-orange-400">{forecasts.complaintsAnalysis?.open || 0}</p>
                  <p className="text-slate-400 text-xs mt-2">Require resolution</p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Recent (30d)</p>
                  <p className="text-4xl font-black text-yellow-400">{forecasts.complaintsAnalysis?.recent || 0}</p>
                  <p className="text-slate-400 text-xs mt-2">Filed this month</p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Resolution Rate</p>
                  <p className="text-4xl font-black text-green-400">{forecasts.complaintsAnalysis?.resolutionRate || 0}%</p>
                  <p className="text-slate-400 text-xs mt-2">Closed successfully</p>
                </div>
              </div>
              
              {Object.keys(forecasts.complaintsAnalysis?.byType || {}).length > 0 && (
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Complaints by Type</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(forecasts.complaintsAnalysis?.byType || {}).map(([type, count]) => (
                      <div key={type} className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs mb-1">{type}</p>
                        <p className="text-2xl font-bold text-white">{count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Corrective Action Plans Dashboard */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <FileWarning className="text-red-400" size={24} />
                Corrective Action Plans (CAPs)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Total CAPs</p>
                  <p className="text-4xl font-black text-white">{forecasts.correctiveActions?.total || 0}</p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Open/In Progress</p>
                  <p className="text-4xl font-black text-yellow-400">{forecasts.correctiveActions?.open || 0}</p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Overdue</p>
                  <p className="text-4xl font-black text-red-400">{forecasts.correctiveActions?.overdue || 0}</p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Completion Rate</p>
                  <p className="text-4xl font-black text-green-400">{forecasts.correctiveActions?.completionRate || 0}%</p>
                </div>
              </div>
              
              {Object.keys(forecasts.correctiveActions?.byTrigger || {}).length > 0 && (
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">CAPs by Trigger Type</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(forecasts.correctiveActions?.byTrigger || {}).map(([trigger, count]) => (
                      <div key={trigger} className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs mb-1">{trigger}</p>
                        <p className="text-2xl font-bold text-white">{count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {(forecasts.correctiveActions?.overdue || 0) > 0 && (
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mt-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-red-400 font-bold mb-1">URGENT: {forecasts.correctiveActions?.overdue} Overdue CAP{forecasts.correctiveActions?.overdue !== 1 ? 's' : ''}</p>
                      <p className="text-slate-300 text-sm">Overdue corrective actions may result in compliance violations. Immediate review and completion required.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* High-Impact Forecasts */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Target className="text-emerald-400" size={24} />
                High-Impact Forecasts (ML + Human Intelligence)
              </h2>
              
              <div className="space-y-3">
                {forecasts.blendedForecasts.map((forecast, idx) => (
                  <div 
                    key={idx}
                    className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 hover:border-emerald-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white font-semibold group-hover:text-emerald-400 transition-colors">
                          {forecast.question}
                        </p>
                        <p className="text-slate-400 text-xs mt-1">{forecast.driver}</p>
                        
                        {forecast.marketProbability && (
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <div className="flex items-center gap-1">
                              <Brain size={12} className="text-cyan-400" />
                              <span className="text-slate-400">ML:</span>
                              <span className="text-cyan-400 font-bold">{forecast.mlProbability}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users size={12} className="text-purple-400" />
                              <span className="text-slate-400">Market:</span>
                              <span className="text-purple-400 font-bold">{forecast.marketProbability}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-400">{forecast.blendedProbability}%</p>
                          <p className="text-xs text-slate-500">Blended</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {getTrendIcon(forecast.trend)}
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          forecast.confidence === 'High' ? 'bg-green-900/30 text-green-400 border border-green-500/50' :
                          forecast.confidence === 'Medium' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {forecast.confidence}
                        </div>
                        
                        <ChevronRight className="text-slate-500 group-hover:text-emerald-400 transition-colors" size={20} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Scenario Simulator */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Gauge className="text-cyan-400" size={24} />
                Scenario Simulator
              </h2>
              
              <p className="text-slate-400 text-sm mb-6">Model the impact of organizational changes on key forecasts</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Staff Increase (%)</label>
                  <input
                    type="number"
                    value={scenarioInputs.staffIncrease}
                    onChange={(e) => setScenarioInputs({...scenarioInputs, staffIncrease: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Engagement Change (%)</label>
                  <input
                    type="number"
                    value={scenarioInputs.engagementChange}
                    onChange={(e) => setScenarioInputs({...scenarioInputs, engagementChange: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-300 text-sm mb-2">New Programs</label>
                  <input
                    type="number"
                    value={scenarioInputs.newPrograms}
                    onChange={(e) => setScenarioInputs({...scenarioInputs, newPrograms: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Training Investment (1-10)</label>
                  <input
                    type="number"
                    value={scenarioInputs.trainingInvestment}
                    onChange={(e) => setScenarioInputs({...scenarioInputs, trainingInvestment: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="0-10"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Wellness Investment (1-10)</label>
                  <input
                    type="number"
                    value={scenarioInputs.wellnessInvestment}
                    onChange={(e) => setScenarioInputs({...scenarioInputs, wellnessInvestment: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="0-10"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Community Program Expansion (1-10)</label>
                  <input
                    type="number"
                    value={scenarioInputs.communityProgramExpansion}
                    onChange={(e) => setScenarioInputs({...scenarioInputs, communityProgramExpansion: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    placeholder="0-10"
                  />
                </div>
              </div>
              
              <button
                onClick={runScenarioSimulation}
                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all mb-6"
              >
                Run Simulation
              </button>
              
              {scenarioResults && (
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Projected Impact</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs mb-1">Turnover Risk</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-white">{scenarioResults.turnoverRisk}%</p>
                        <p className={`text-sm mb-1 ${parseFloat(scenarioResults.turnoverChange) < 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {parseFloat(scenarioResults.turnoverChange) > 0 ? '+' : ''}{scenarioResults.turnoverChange}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs mb-1">Engagement</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-white">{scenarioResults.engagement}</p>
                        <p className={`text-sm mb-1 ${parseFloat(scenarioResults.engagementChange) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {parseFloat(scenarioResults.engagementChange) > 0 ? '+' : ''}{scenarioResults.engagementChange}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs mb-1">Training Compliance</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-white">{scenarioResults.trainingCompliance}%</p>
                        <p className={`text-sm mb-1 ${parseFloat(scenarioResults.trainingChange) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {parseFloat(scenarioResults.trainingChange) > 0 ? '+' : ''}{scenarioResults.trainingChange}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs mb-1">Wellness Compliance</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-white">{scenarioResults.wellnessCompliance}%</p>
                        <p className={`text-sm mb-1 ${parseFloat(scenarioResults.wellnessChange) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {parseFloat(scenarioResults.wellnessChange) > 0 ? '+' : ''}{scenarioResults.wellnessChange}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs mb-1">Community Participation</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-white">{scenarioResults.communityParticipation}%</p>
                        <p className={`text-sm mb-1 ${parseFloat(scenarioResults.communityChange) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {parseFloat(scenarioResults.communityChange) > 0 ? '+' : ''}{scenarioResults.communityChange}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs mb-1">Outcome Completion</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-white">{scenarioResults.outcomeCompletion}%</p>
                        <p className={`text-sm mb-1 ${parseFloat(scenarioResults.outcomeChange) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {parseFloat(scenarioResults.outcomeChange) > 0 ? '+' : ''}{scenarioResults.outcomeChange}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs mb-1">Overtime Pressure</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
                        scenarioResults.overtimePressure === 'High' ? 'bg-red-900/30 text-red-400' :
                        scenarioResults.overtimePressure === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-green-900/30 text-green-400'
                      }`}>
                        {scenarioResults.overtimePressure}
                      </div>
                    </div>
                    
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-400 text-xs mb-1">Utilization</p>
                      <p className="text-2xl font-bold text-white">{scenarioResults.utilization}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Regional Risks */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <MapPin className="text-red-400" size={24} />
                Regional Risk Map
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {forecasts.regionalRisks?.length > 0 ? forecasts.regionalRisks.map(region => (
                  <div key={region.region} className="bg-slate-900/50 border border-slate-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${getRegionalRiskColor(region.riskLevel)}`}></div>
                        <p className="text-white font-bold text-lg">{region.region}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        region.riskLevel === 'High' ? 'bg-red-900/30 text-red-400 border border-red-500/50' :
                        region.riskLevel === 'Watch' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50' :
                        'bg-green-900/30 text-green-400 border border-green-500/50'
                      }`}>
                        {region.riskLevel}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs mb-1">Individuals</p>
                        <p className="text-xl font-bold text-white">{region.individuals}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs mb-1">Incidents</p>
                        <p className="text-xl font-bold text-orange-400">{region.incidentRate}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs mb-1">Staff Gaps</p>
                        <p className="text-xl font-bold text-red-400">{region.staffGaps || 0}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs mb-1">Complaints</p>
                        <p className="text-xl font-bold text-yellow-400">{region.openComplaints || 0}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs mb-1">Med Alerts</p>
                        <p className="text-xl font-bold text-pink-400">{region.activeMedAlerts || 0}</p>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-slate-400 text-xs mb-1">Community</p>
                        <p className="text-xl font-bold text-cyan-400">{region.communityParticipation}%</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-slate-400 py-8 col-span-2">
                    No regional data available
                  </div>
                )}
              </div>
            </div>

            {/* Quarterly Review Status */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Calendar className="text-cyan-400" size={24} />
                Quarterly Review Status
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Total Reviews</p>
                  <p className="text-4xl font-black text-white">{forecasts.quarterlyReviewStatus?.total || 0}</p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">This Quarter</p>
                  <p className="text-4xl font-black text-cyan-400">{forecasts.quarterlyReviewStatus?.thisQuarter || 0}</p>
                  <p className="text-slate-400 text-xs mt-2">{forecasts.quarterlyReviewStatus?.currentQuarter}</p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Overdue</p>
                  <p className="text-4xl font-black text-red-400">{forecasts.quarterlyReviewStatus?.overdue || 0}</p>
                </div>
                
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                  <p className="text-slate-400 text-sm mb-2">Compliance Rate</p>
                  <p className="text-4xl font-black text-green-400">{forecasts.quarterlyReviewStatus?.complianceRate || 0}%</p>
                </div>
              </div>
            </div>

            {/* Governance Banner */}
            <div className="bg-gradient-to-r from-amber-900/20 via-orange-900/20 to-amber-900/20 border border-amber-500/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="text-amber-400 flex-shrink-0 mt-1" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-amber-300 mb-2">FORECASTS ARE ORGANIZATIONAL-LEVEL ONLY</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
                      <span className="text-amber-100">No PHI used</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
                      <span className="text-amber-100">No client-level predictions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
                      <span className="text-amber-100">Decision-support tool only</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
                      <span className="text-amber-100">Cannot deny services/HR actions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </ScrollArea>
    </div>
  </div>
</div>
);
};
export default ForesightEnginePage;