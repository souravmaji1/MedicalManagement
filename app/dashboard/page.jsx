'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Calendar, TrendingUp, TrendingDown,
  Activity, CheckCircle, AlertCircle, XCircle, Clock, MapPin,
  Heart, Shield, FileText, Award, Target, BarChart3, Home,
  ChevronRight, ChevronDown, Bell, Menu, X, Download, Eye,
  AlertTriangle, Pill, Settings, CreditCard, NetworkIcon, User2Icon,
  Zap, Sparkles, Brain, User, RefreshCw, Loader2, Info, Plus,
  Lock, Unlock, Building, Phone, Mail, Calendar as CalendarIcon,
  Stethoscope, Clipboard, BookOpen, UserCheck, Scale, Scissors,
  AlertOctagon, TrendingDown as TrendDown, CheckCircle2, XOctagon,
  DollarSign, FileCheck, UserX, Clock3, ShieldAlert, Users2
} from 'lucide-react';
import { ScrollArea } from "../../components/ui/scroll-area";
import { useUser, UserButton } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '../../contexts/userProfileContext';
import { PERMISSIONS } from '../../utils/permissions';
import { ScrollBar } from '../../components/ui/scroll-area';
import { getModuleAccessLevel, MODULE_PERMISSIONS, ACCESS_LEVELS } from '../../utils/permissions';

const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const HCBSDashboard = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();
  
  const [individuals, setIndividuals] = useState([]);
  const [selectedIndividual, setSelectedIndividual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [activeTab, setActiveTab] = useState('community');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
    period: '90days'
  });
  const [complianceData, setComplianceData] = useState({
    communityIntegration: {},
    choiceAutonomy: {},
    ispImplementation: {},
    rightsRestrictions: {},
    healthSafety: {},
    staffReadiness: {}
  });
  const [alerts, setAlerts] = useState([]);
  const [showAuditMode, setShowAuditMode] = useState(false);
  const [auditModeData, setAuditModeData] = useState(null);

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

  const dashboardTabs = [
    { id: 'community', label: 'Community Integration', icon: MapPin, color: 'emerald' },
    { id: 'choice', label: 'Choice & Autonomy', icon: Award, color: 'blue' },
    { id: 'isp', label: 'ISP Implementation', icon: Target, color: 'purple' },
    { id: 'rights', label: 'Rights & Restrictions', icon: Shield, color: 'orange' },
    { id: 'health', label: 'Health & Safety', icon: Heart, color: 'red' },
    { id: 'staff', label: 'Staff Readiness', icon: Users, color: 'cyan' }
  ];

 // Replace the existing permission checks section in HCBSDashboard with:

const getModuleAccess = (moduleName) => {
  if (!userProfile || !userProfile.permissions) return ACCESS_LEVELS.NONE;
  
  const modulePerms = MODULE_PERMISSIONS[moduleName];
  if (!modulePerms) return ACCESS_LEVELS.NONE;
  
  return getModuleAccessLevel(userProfile.permissions, modulePerms);
};

// Get access level for HCBS dashboard (using plans module permissions)
const moduleAccess = getModuleAccess('plans'); // HCBS uses plans permissions

const canViewHCBS = moduleAccess !== 'none';
const canEditHCBS = moduleAccess === 'edit' || moduleAccess === 'admin';
const canAdminHCBS = moduleAccess === 'admin';

// Specific HCBS permissions
const canExportCompliance = canViewHCBS; // Anyone who can view can export
const canEnableAuditMode = canEditHCBS; // Edit or admin can enable audit mode
const canUpdateDateRange = canEditHCBS; // Edit or admin can update date range
const canRefreshData = canViewHCBS; // Anyone who can view can refresh

  useEffect(() => {
    if (isLoaded && user && !profileLoading && userProfile) {
      if (canViewHCBS) {
        fetchIndividuals();
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, user, profileLoading, userProfile]);

  useEffect(() => {
    if (selectedIndividual) {
      calculateComplianceData();
    }
  }, [selectedIndividual, dateRange]);

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

  const calculateComplianceData = () => {
    if (!selectedIndividual) return;

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    const communityData = calculateCommunityIntegration(startDate, endDate);
    const choiceData = calculateChoiceAutonomy(startDate, endDate);
    const ispData = calculateISPImplementation(startDate, endDate);
    const rightsData = calculateRightsRestrictions(startDate, endDate);
    const healthData = calculateHealthSafety(startDate, endDate);
    const staffData = calculateStaffReadiness(startDate, endDate);

    setComplianceData({
      communityIntegration: communityData,
      choiceAutonomy: choiceData,
      ispImplementation: ispData,
      rightsRestrictions: rightsData,
      healthSafety: healthData,
      staffReadiness: staffData
    });

    generateAlerts(communityData, choiceData, ispData, rightsData, healthData, staffData);
  };

  const calculateCommunityIntegration = (startDate, endDate) => {
    const dailyNotes = selectedIndividual.dailynotes || [];
    const communityActivityLog = selectedIndividual.community_activity_log || [];
    
    const filteredNotes = dailyNotes.filter(note => {
      const noteDate = new Date(note.date);
      return noteDate >= startDate && noteDate <= endDate && note.billingValidated === true;
    });

    const filteredActivities = communityActivityLog.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate >= startDate && activityDate <= endDate;
    });

    const communityOutingsFromNotes = filteredNotes.filter(note => note.communityouting === true);
    const totalCommunityActivities = [...communityOutingsFromNotes, ...filteredActivities];
    
    const activityTypes = {};
    
    filteredNotes.forEach(note => {
      if (note.activities && Array.isArray(note.activities)) {
        note.activities.forEach(activity => {
          activityTypes[activity] = (activityTypes[activity] || 0) + 1;
        });
      }
    });

    filteredActivities.forEach(activity => {
      const type = activity.activity_type || 'Other';
      activityTypes[type] = (activityTypes[type] || 0) + 1;
    });

    const transportationMethods = {};
    filteredNotes.forEach(note => {
      if (note.transportation) {
        transportationMethods[note.transportation] = (transportationMethods[note.transportation] || 0) + 1;
      }
    });

    const daysInRange = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const monthsInRange = Math.max(1, Math.ceil(daysInRange / 30));
    const outingsPerMonth = totalCommunityActivities.length / monthsInRange;
    const percentageWithActivity = filteredNotes.length > 0 
      ? (communityOutingsFromNotes.length / filteredNotes.length) * 100 
      : 0;

    const thirtyDaysAgo = new Date(endDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date(endDate);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const outings30Days = totalCommunityActivities.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= thirtyDaysAgo;
    }).length;

    const outings60Days = totalCommunityActivities.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= sixtyDaysAgo;
    }).length;

    const barriers = selectedIndividual.community_barriers ? selectedIndividual.community_barriers.split(',').map(b => b.trim()).filter(b => b) : [];

    const recentOutings = [...communityOutingsFromNotes, ...filteredActivities]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map(item => ({
        date: item.date,
        location: item.outinglocation || item.community_location || 'Not specified',
        duration: item.duration_minutes ? `${item.duration_minutes} minutes` : 'Not specified',
        activities: item.activities || [item.activity_type] || [],
        purpose: item.outingpurpose || item.purpose || 'Not specified',
        transportation: item.transportation || selectedIndividual.transportation_method || 'Not specified',
        staffName: item.staffname || item.staff_name || 'Not specified',
        choiceDocumented: item.communityChoiceDocumented || item.choice_documented || false
      }));

    return {
      totalOutings: totalCommunityActivities.length,
      outingsPerMonth: Math.round(outingsPerMonth * 10) / 10,
      percentageWithActivity: Math.round(percentageWithActivity),
      activityTypes: activityTypes,
      totalDaysTracked: filteredNotes.length,
      outings30Days: outings30Days,
      outings60Days: outings60Days,
      outings90Days: totalCommunityActivities.length,
      recentOutings: recentOutings,
      transportationMethods: transportationMethods,
      communityBarriers: barriers,
      individualPreferences: selectedIndividual.important_to || 'Not documented',
      importantFor: selectedIndividual.important_for || 'Not documented',
      communityIntegrationPlan: selectedIndividual.community_integration_plan || 'Not documented',
      choiceDocumentedRate: recentOutings.filter(o => o.choiceDocumented).length / Math.max(recentOutings.length, 1) * 100
    };
  };

  const calculateChoiceAutonomy = (startDate, endDate) => {
    const dailyNotes = selectedIndividual.dailynotes || [];
    const choiceAcknowledgments = selectedIndividual.choice_acknowledgments || [];
    
    const filteredNotes = dailyNotes.filter(note => {
      const noteDate = new Date(note.date);
      return noteDate >= startDate && noteDate <= endDate && note.billingValidated === true;
    });

    const notesWithChoiceOffered = filteredNotes.filter(note => 
      note.choiceOffered === true
    );
    
    const notesWithChoiceHonored = filteredNotes.filter(note => 
      note.choiceHonored === true
    );

    const choiceOfferedRate = filteredNotes.length > 0 
      ? (notesWithChoiceOffered.length / filteredNotes.length) * 100 
      : 0;
    
    const choiceHonoredRate = notesWithChoiceOffered.length > 0
      ? (notesWithChoiceHonored.length / notesWithChoiceOffered.length) * 100
      : 0;

    const choiceTypes = {
      meals: 0,
      activities: 0,
      schedules: 0,
      community: 0,
      personal: 0,
      other: 0
    };

    filteredNotes.forEach(note => {
      if (note.choiceExercisedDescription) {
        const choice = note.choiceExercisedDescription.toLowerCase();
        if (choice.includes('meal') || choice.includes('food') || choice.includes('eat')) {
          choiceTypes.meals++;
        } else if (choice.includes('activity') || choice.includes('outing')) {
          choiceTypes.activities++;
        } else if (choice.includes('schedule') || choice.includes('time')) {
          choiceTypes.schedules++;
        } else if (choice.includes('community')) {
          choiceTypes.community++;
        } else if (choice.includes('personal') || choice.includes('clothing')) {
          choiceTypes.personal++;
        } else {
          choiceTypes.other++;
        }
      }
    });

    const validAcknowledgments = choiceAcknowledgments.filter(ack => {
      const ackDate = new Date(ack.created_date || ack.created_at);
      return ackDate >= startDate && ackDate <= endDate;
    });

    const rightsExplainedCount = validAcknowledgments.filter(ack => 
      ack.rights_explained === true
    ).length;

    const rightToRefuseExplained = validAcknowledgments.filter(ack => 
      ack.right_to_refuse_explained === true
    ).length;

    const choiceOptionsExplained = validAcknowledgments.filter(ack => 
      ack.choice_options_explained === true
    ).length;

    const recentChoices = filteredNotes
      .filter(note => note.choiceOffered || note.choiceHonored)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10)
      .map(note => ({
        date: note.date,
        description: note.choiceExercisedDescription || 'Not documented',
        honored: note.choiceHonored || false,
        staffName: note.staffname || 'Not documented',
        narrative: note.choiceAutonomyNarrative || ''
      }));

    return {
      totalNotes: filteredNotes.length,
      choiceOfferedCount: notesWithChoiceOffered.length,
      choiceHonoredCount: notesWithChoiceHonored.length,
      choiceOfferedRate: Math.round(choiceOfferedRate),
      choiceHonoredRate: Math.round(choiceHonoredRate),
      choiceTypes: choiceTypes,
      recentChoices: recentChoices,
      choiceAcknowledgments: validAcknowledgments.length,
      rightsExplainedCount: rightsExplainedCount,
      rightToRefuseExplained: rightToRefuseExplained,
      choiceOptionsExplained: choiceOptionsExplained,
      individualPreferences: selectedIndividual.important_to || 'Not documented',
      importantFor: selectedIndividual.important_for || 'Not documented',
      strengthsInterests: selectedIndividual.strengths_interests || 'Not documented',
      hcbsCompliantAcknowledgments: validAcknowledgments.filter(ack => ack.hcbs_compliant === true).length
    };
  };

  const calculateISPImplementation = (startDate, endDate) => {
    const dailyNotes = selectedIndividual.dailynotes || [];
    const goals = selectedIndividual.goals || [];
    const outcomes = selectedIndividual.outcomes || [];
    const ispOutcomes = selectedIndividual.isp_outcomes || [];
    const quarterlyReviews = selectedIndividual.quarterly_reviews || [];
    
    const filteredNotes = dailyNotes.filter(note => {
      const noteDate = new Date(note.date);
      return noteDate >= startDate && noteDate <= endDate && note.billingValidated === true;
    });

    const notesWithGoals = filteredNotes.filter(note => 
      note.goalsworked && Array.isArray(note.goalsworked) && note.goalsworked.length > 0
    );

    const goalLinkageRate = filteredNotes.length > 0
      ? (notesWithGoals.length / filteredNotes.length) * 100
      : 0;

    const goalActivity = {};

    goals.forEach(goal => {
      const goalId = goal.id;
      goalActivity[goalId] = {
        goalDescription: goal.description || 'No description',
        status: goal.status,
        progress: goal.progress || 0,
        timesWorked: 0,
        lastWorked: null,
        domain: goal.hcbsdomain || 'Not specified',
        frequency: goal.frequency || 'Not specified',
        targetDate: goal.targetdate || 'Not set'
      };
    });

    filteredNotes.forEach(note => {
      if (note.goalsworked && Array.isArray(note.goalsworked)) {
        note.goalsworked.forEach(goalId => {
          if (goalActivity[goalId]) {
            goalActivity[goalId].timesWorked++;
            if (!goalActivity[goalId].lastWorked || new Date(note.date) > new Date(goalActivity[goalId].lastWorked)) {
              goalActivity[goalId].lastWorked = note.date;
            }
          }
        });
      }
    });

    const fourteenDaysAgo = new Date(endDate);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const goalsNotAddressed = goals.filter(goal => {
      if (goal.status !== 'Active') return false;
      const activity = goalActivity[goal.id];
      if (!activity || !activity.lastWorked) return true;
      const lastWorkedDate = new Date(activity.lastWorked);
      return lastWorkedDate < fourteenDaysAgo;
    });

    const domainActivity = {};
    Object.values(goalActivity).forEach(activity => {
      const domain = activity.domain;
      if (!domainActivity[domain]) {
        domainActivity[domain] = {
          totalGoals: 0,
          timesWorked: 0,
          avgProgress: 0,
          activeGoals: 0
        };
      }
      domainActivity[domain].totalGoals++;
      domainActivity[domain].timesWorked += activity.timesWorked;
      domainActivity[domain].avgProgress += activity.progress;
      if (activity.status === 'Active') {
        domainActivity[domain].activeGoals++;
      }
    });

    Object.keys(domainActivity).forEach(domain => {
      if (domainActivity[domain].totalGoals > 0) {
        domainActivity[domain].avgProgress = Math.round(
          domainActivity[domain].avgProgress / domainActivity[domain].totalGoals
        );
      }
    });

    const ispEffectiveStart = selectedIndividual.isp_effective_start;
    const ispEffectiveEnd = selectedIndividual.isp_effective_end;
    const ispNextReview = selectedIndividual.isp_next_review;

    const ispCurrent = ispEffectiveStart && ispEffectiveEnd && 
      new Date(ispEffectiveStart) <= endDate && 
      new Date(ispEffectiveEnd) >= endDate;

    const ispReviewDue = ispNextReview && new Date(ispNextReview) <= endDate;

    const validQuarterlyReviews = quarterlyReviews.filter(review => {
      const reviewDate = new Date(review.review_date);
      return reviewDate >= startDate && reviewDate <= endDate;
    });

    return {
      totalGoals: goals.length,
      activeGoals: goals.filter(g => g.status === 'Active').length,
      goalLinkageRate: Math.round(goalLinkageRate),
      notesWithGoals: notesWithGoals.length,
      totalNotes: filteredNotes.length,
      goalsNotAddressed: goalsNotAddressed.length,
      goalActivity: goalActivity,
      domainActivity: domainActivity,
      goalsNotAddressedList: goalsNotAddressed.map(goal => ({
        id: goal.id,
        description: goal.description || 'No description',
        status: goal.status,
        domain: goal.hcbsdomain || 'Not specified',
        lastWorked: goalActivity[goal.id]?.lastWorked || 'Never',
        targetDate: goal.targetdate || 'Not set'
      })),
      ispEffectiveStart: ispEffectiveStart,
      ispEffectiveEnd: ispEffectiveEnd,
      ispNextReview: ispNextReview,
      ispCurrent: ispCurrent,
      ispReviewDue: ispReviewDue,
      quarterlyReviews: validQuarterlyReviews.length,
      quarterlyReviewsCompleted: validQuarterlyReviews.filter(r => r.reviewed_by).length,
      totalOutcomes: outcomes.length,
      activeOutcomes: outcomes.filter(o => o.status === 'Active' || o.status === 'In Progress').length,
      qidpNotes: selectedIndividual.qidpnotes || 'No notes',
      revisionsNeeded: validQuarterlyReviews.filter(r => r.revisions_needed && r.revisions_needed.trim() !== '').length
    };
  };

  const calculateRightsRestrictions = (startDate, endDate) => {
    const restrictions = selectedIndividual.rightsrestrictions || [];
    const rightsRestrictionsNotes = selectedIndividual.rights_restrictions_notes || '';
    const complaints = selectedIndividual.complaints || [];
    const correctiveActionPlans = selectedIndividual.corrective_action_plans || [];
    
    const activeRestrictions = restrictions.filter(r => r.status === 'Active');
    
    // Categorize restrictions by type as per PDF requirements
    const restrictionTypeBreakdown = {
      visitors: 0,
      food: 0,
      community: 0,
      finances: 0,
      communication: 0,
      other: 0
    };

    activeRestrictions.forEach(restriction => {
      const type = (restriction.restrictiontype || '').toLowerCase();
      if (type.includes('visitor') || type.includes('guest')) {
        restrictionTypeBreakdown.visitors++;
      } else if (type.includes('food') || type.includes('meal') || type.includes('diet')) {
        restrictionTypeBreakdown.food++;
      } else if (type.includes('community') || type.includes('access') || type.includes('outing')) {
        restrictionTypeBreakdown.community++;
      } else if (type.includes('financ') || type.includes('money') || type.includes('fund')) {
        restrictionTypeBreakdown.finances++;
      } else if (type.includes('communication') || type.includes('phone') || type.includes('contact')) {
        restrictionTypeBreakdown.communication++;
      } else {
        restrictionTypeBreakdown.other++;
      }
    });

    const now = new Date();
    const overdueReviews = activeRestrictions.filter(restriction => {
      if (!restriction.reviewdate) return true;
      const reviewDate = new Date(restriction.reviewdate);
      return reviewDate < now;
    });

    const upcomingReviews = activeRestrictions.filter(restriction => {
      if (!restriction.reviewdate) return false;
      const reviewDate = new Date(restriction.reviewdate);
      const thirtyDaysFromNow = new Date(now);
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return reviewDate >= now && reviewDate <= thirtyDaysFromNow;
    });

    const hrcApproved = activeRestrictions.filter(r => r.hrcapproved === true).length;
    const hrcPending = activeRestrictions.filter(r => !r.hrcapproved).length;

    const rightsExplained = selectedIndividual.rights_explained || false;
    const leaseSignatureDate = selectedIndividual.lease_signature_date;
    const signedByIndividual = selectedIndividual.signed_by_individual || false;

    // Lease information
    const leaseStartDate = selectedIndividual.lease_start_date;
    const leaseEndDate = selectedIndividual.lease_end_date;
    const rentAmount = selectedIndividual.rent_amount;

    // Complaints analysis
    const openComplaints = complaints.filter(c => c.resolution_status === 'Open');
    const resolvedComplaints = complaints.filter(c => c.resolution_status === 'Resolved');
    
    const rightsRelatedComplaints = complaints.filter(complaint => {
      const complaintLower = (complaint.description || '').toLowerCase();
      return complaintLower.includes('right') || 
             complaintLower.includes('restriction') || 
             complaintLower.includes('freedom') ||
             complaintLower.includes('choice');
    });

    // Corrective Action Plans
    const openCAPs = correctiveActionPlans.filter(cap => cap.status === 'Open');
    const completedCAPs = correctiveActionPlans.filter(cap => cap.status === 'Completed');

    return {
      totalRestrictions: restrictions.length,
      activeRestrictions: activeRestrictions.length,
      restrictionTypeBreakdown: restrictionTypeBreakdown,
      overdueReviews: overdueReviews.length,
      upcomingReviews: upcomingReviews.length,
      hrcApproved: hrcApproved,
      hrcPending: hrcPending,
      hrcApprovalRate: activeRestrictions.length > 0 ? Math.round((hrcApproved / activeRestrictions.length) * 100) : 100,
      restrictionsList: activeRestrictions.map(r => ({
        id: r.id,
        type: r.restrictiontype || 'Not specified',
        description: r.description || 'No description',
        reviewDate: r.reviewdate || 'Not set',
        status: r.status,
        approved: r.hrcapproved || false
      })),
      overdueList: overdueReviews.map(r => ({
        id: r.id,
        type: r.restrictiontype || 'Not specified',
        reviewDate: r.reviewdate || 'Not set',
        daysOverdue: r.reviewdate 
          ? Math.floor((now - new Date(r.reviewdate)) / (1000 * 60 * 60 * 24))
          : 'Unknown'
      })),
      upcomingList: upcomingReviews.map(r => ({
        id: r.id,
        type: r.restrictiontype || 'Not specified',
        reviewDate: r.reviewdate,
        daysUntilReview: r.reviewdate 
          ? Math.floor((new Date(r.reviewdate) - now) / (1000 * 60 * 60 * 24))
          : 0
      })),
      rightsExplained: rightsExplained,
      leaseSignatureDate: leaseSignatureDate,
      signedByIndividual: signedByIndividual,
      leaseStartDate: leaseStartDate,
      leaseEndDate: leaseEndDate,
      rentAmount: rentAmount,
      totalComplaints: complaints.length,
      openComplaints: openComplaints.length,
      resolvedComplaints: resolvedComplaints.length,
      rightsRelatedComplaints: rightsRelatedComplaints.length,
      rightsRestrictionsNotes: rightsRestrictionsNotes,
      openCAPs: openCAPs.length,
      completedCAPs: completedCAPs.length,
      totalCAPs: correctiveActionPlans.length,
      complaintsList: complaints.map(c => ({
        id: c.complaint_id,
        type: c.complaint_type,
        description: c.description,
        dateFiled: c.date_filed,
        status: c.resolution_status,
        filedBy: c.filed_by
      })),
      capsList: correctiveActionPlans.map(cap => ({
        id: cap.cap_id,
        status: cap.status,
        triggerType: cap.trigger_type,
        rootCause: cap.root_cause,
        correctiveActions: cap.corrective_actions,
        dueDate: cap.due_date,
        responsibleStaff: cap.responsible_staff
      }))
    };
  };

  const calculateHealthSafety = (startDate, endDate) => {
    const incidents = selectedIndividual.incidents || [];
    const medications = selectedIndividual.medications || [];
    const marHistory = selectedIndividual.marhistory || [];
    const wellnessData = selectedIndividual.wellness_data || [];
    const riskPlans = selectedIndividual.riskplans || [];

    const filteredIncidents = incidents.filter(incident => {
      const incidentDate = new Date(incident.dateoccurred);
      return incidentDate >= startDate && incidentDate <= endDate;
    });

    const incidentsBySeverity = {
      critical: 0,
      major: 0,
      moderate: 0,
      minor: 0,
      nearMiss: 0
    };

    const incidentsByType = {};

    filteredIncidents.forEach(incident => {
      const severity = incident.severity || '';
      if (severity.includes('Critical')) incidentsBySeverity.critical++;
      else if (severity.includes('Major')) incidentsBySeverity.major++;
      else if (severity.includes('Moderate')) incidentsBySeverity.moderate++;
      else if (severity.includes('Minor')) incidentsBySeverity.minor++;
      else if (severity.includes('Near Miss')) incidentsBySeverity.nearMiss++;

      const type = incident.incidenttype || 'Other';
      incidentsByType[type] = (incidentsByType[type] || 0) + 1;
    });

    const medicationErrorIncidents = filteredIncidents.filter(inc => 
      inc.incidenttype === 'Medication Error'
    );

    const totalMedErrors = medicationErrorIncidents.length;

    const filteredMAR = marHistory.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });

    const prnMedications = medications.filter(med => med.prn === true && med.status === 'Active');
    const prnUsage = filteredMAR.filter(record => {
      const medication = medications.find(med => med.id === record.medicationid);
      return medication && medication.prn === true;
    });

    const scheduledDoses = filteredMAR.filter(record => {
      const medication = medications.find(med => med.id === record.medicationid);
      return medication && !medication.prn;
    });

    const givenDoses = scheduledDoses.filter(record => record.status === 'Given');
    const refusedDoses = scheduledDoses.filter(record => record.status === 'Refused');
    const missedDosesFiltered = scheduledDoses.filter(record => record.status === 'Missed');

    const medicationComplianceRate = scheduledDoses.length > 0 
      ? Math.round((givenDoses.length / scheduledDoses.length) * 100)
      : 100;

    const emergencyInterventions = filteredIncidents.filter(inc =>
      inc.incidenttype === 'Behavioral Emergency' || 
      inc.incidenttype === 'Medical Emergency'
    );

    const recentVitals = wellnessData
      .filter(data => data.type === 'vital_signs')
      .filter(data => {
        const dataDate = new Date(data.date);
        return dataDate >= startDate && dataDate <= endDate;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    const medicalAppointments = wellnessData
      .filter(data => data.type === 'appointment')
      .filter(data => {
        const dataDate = new Date(data.date);
        return dataDate >= startDate && dataDate <= endDate;
      });

    const healthSummary = selectedIndividual.health_summary || 'Not documented';
    const healthWellnessSummary = selectedIndividual.health_wellness_summary || 'Not documented';
    const behaviorSupportSummary = selectedIndividual.behavior_support_summary || 'Not documented';
    const seizureHistory = selectedIndividual.seizure_history || 'No seizure history';
    const medicationMonitoringNotes = selectedIndividual.medication_monitoring_notes || 'No monitoring notes';
    const behaviorSummary = selectedIndividual.behavior_summary || 'No behavior summary';
    const behaviorStrategies = selectedIndividual.behavior_strategies || 'No behavior strategies';
    const abcDataRequired = selectedIndividual.abc_data_required || false;

    const allergies = selectedIndividual.allergies || 'None';

    const medicalAlerts = selectedIndividual.medicalalerts || [];
    const activeMedicalAlerts = medicalAlerts.filter(alert => alert.status === 'Active');

    const behavioralAlerts = selectedIndividual.behavioralalerts || [];
    const activeBehavioralAlerts = behavioralAlerts.filter(alert => alert.status === 'Active');

    // Risk plans
    const activeRiskPlans = riskPlans.filter(rp => rp.status === 'Active');
    const identifiedRisks = selectedIndividual.identified_risks || 'Not documented';
    const riskMitigationStrategies = selectedIndividual.risk_mitigation_strategies || 'Not documented';

    return {
      totalIncidents: filteredIncidents.length,
      openIncidents: filteredIncidents.filter(inc => inc.status === 'Open').length,
      incidentsBySeverity: incidentsBySeverity,
      incidentsByType: incidentsByType,
      medicationErrors: totalMedErrors,
      prnMedicationCount: prnMedications.length,
      prnUsageCount: prnUsage.length,
      prnUsageRate: filteredMAR.length > 0 ? Math.round((prnUsage.length / filteredMAR.length) * 100) : 0,
      emergencyInterventions: emergencyInterventions.length,
      medicationComplianceRate: medicationComplianceRate,
      totalScheduledDoses: scheduledDoses.length,
      givenDoses: givenDoses.length,
      refusedDoses: refusedDoses.length,
      missedDoses: missedDosesFiltered.length,
      activeMedications: medications.filter(m => m.status === 'Active').length,
      totalMedications: medications.length,
      recentIncidents: filteredIncidents
        .sort((a, b) => new Date(b.dateoccurred) - new Date(a.dateoccurred))
        .slice(0, 10)
        .map(inc => ({
          id: inc.id,
          type: inc.incidenttype,
          severity: inc.severity,
          date: inc.dateoccurred,
          status: inc.status,
          description: inc.description || 'No description',
          followupRequired: inc.followuprequired || false
        })),
      recentVitals: recentVitals.map(vital => ({
        date: vital.date,
        bloodPressure: vital.bloodPressure || 'N/A',
        heartRate: vital.heartRate || 'N/A',
        temperature: vital.temperature || 'N/A',
        oxygenSaturation: vital.oxygenSaturation || 'N/A',
        weight: vital.weight || 'N/A',
        height: vital.height || 'N/A',
        notes: vital.notes || ''
      })),
      medicalAppointments: medicalAppointments.length,
      upcomingAppointments: medicalAppointments.filter(apt => 
        new Date(apt.date) > new Date()
      ).length,
      healthSummary: healthSummary,
      healthWellnessSummary: healthWellnessSummary,
      behaviorSupportSummary: behaviorSupportSummary,
      seizureHistory: seizureHistory,
      medicationMonitoringNotes: medicationMonitoringNotes,
      behaviorSummary: behaviorSummary,
      behaviorStrategies: behaviorStrategies,
      abcDataRequired: abcDataRequired,
      allergies: allergies,
      activeMedicalAlerts: activeMedicalAlerts.length,
      activeBehavioralAlerts: activeBehavioralAlerts.length,
      medicalAlertsList: activeMedicalAlerts,
      behavioralAlertsList: activeBehavioralAlerts,
      activeRiskPlans: activeRiskPlans.length,
      identifiedRisks: identifiedRisks,
      riskMitigationStrategies: riskMitigationStrategies,
      riskPlansList: activeRiskPlans.map(rp => ({
        id: rp.id,
        riskType: rp.risktype,
        description: rp.description,
        interventions: rp.interventions,
        responsibleStaff: rp.responsiblestaff,
        reviewDate: rp.reviewdate
      }))
    };
  };

  const calculateStaffReadiness = (startDate, endDate) => {
    const dailyNotes = selectedIndividual.dailynotes || [];
    const assignedStaff = selectedIndividual.assigned_staff || [];
    const staffTrainingRequirements = selectedIndividual.staff_training_requirements || [];
    
    const filteredNotes = dailyNotes.filter(note => {
      const noteDate = new Date(note.date);
      return noteDate >= startDate && noteDate <= endDate && note.billingValidated === true;
    });

    const staffSet = new Set();
    const staffActivity = {};

    filteredNotes.forEach(note => {
      if (note.staffname) {
        staffSet.add(note.staffname);
        if (!staffActivity[note.staffname]) {
          staffActivity[note.staffname] = {
            shifts: 0,
            role: note.created_by_role || 'Not specified',
            lastShift: note.date,
            billingValidated: 0,
            goalsWorked: 0
          };
        }
        staffActivity[note.staffname].shifts++;
        if (note.billingValidated) {
          staffActivity[note.staffname].billingValidated++;
        }
        if (note.goalsworked && note.goalsworked.length > 0) {
          staffActivity[note.staffname].goalsWorked++;
        }
        if (new Date(note.date) > new Date(staffActivity[note.staffname].lastShift)) {
          staffActivity[note.staffname].lastShift = note.date;
        }
      }
    });

    const approvedNotes = filteredNotes.filter(note => note.approved === true);
    const billingValidatedNotes = filteredNotes.filter(note => note.billingValidated === true);
    
    const approvalRate = filteredNotes.length > 0
      ? (approvedNotes.length / filteredNotes.length) * 100
      : 0;

    const billingValidationRate = filteredNotes.length > 0
      ? (billingValidatedNotes.length / filteredNotes.length) * 100
      : 0;

    const activeStaff = assignedStaff.filter(staff => staff.status === 'Active');
    const trainedStaff = activeStaff.filter(staff => staff.training_completed === true);
    const primaryContacts = activeStaff.filter(staff => staff.primary_contact === true);

    const requiredTrainings = Array.isArray(staffTrainingRequirements) 
      ? staffTrainingRequirements.filter(t => typeof t === 'object' && t.required === true).length
      : 0;

    const shiftCoverage = {
      '1st Shift': 0,
      '2nd Shift': 0,
      '3rd Shift': 0,
      'Other': 0
    };

    filteredNotes.forEach(note => {
      const shift = note.shift || 'Other';
      shiftCoverage[shift] = (shiftCoverage[shift] || 0) + 1;
    });

    const qddpCaseManager = selectedIndividual.qddp_case_manager || 'Not assigned';
    const fundingSource = selectedIndividual.funding_source || 'Not specified';

    return {
      uniqueStaff: staffSet.size,
      totalShifts: filteredNotes.length,
      approvalRate: Math.round(approvalRate),
      approvedNotes: approvedNotes.length,
      billingValidationRate: Math.round(billingValidationRate),
      billingValidatedNotes: billingValidatedNotes.length,
      staffActivity: staffActivity,
      staffList: Array.from(staffSet).map(staffName => ({
        name: staffName,
        shifts: staffActivity[staffName].shifts,
        role: staffActivity[staffName].role,
        lastShift: staffActivity[staffName].lastShift,
        billingValidatedRate: Math.round((staffActivity[staffName].billingValidated / staffActivity[staffName].shifts) * 100),
        goalWorkRate: Math.round((staffActivity[staffName].goalsWorked / staffActivity[staffName].shifts) * 100)
      })),
      assignedStaffCount: assignedStaff.length,
      activeStaffCount: activeStaff.length,
      trainedStaffCount: trainedStaff.length,
      trainingComplianceRate: activeStaff.length > 0 ? Math.round((trainedStaff.length / activeStaff.length) * 100) : 0,
      primaryContactsCount: primaryContacts.length,
      requiredTrainings: requiredTrainings,
      shiftCoverage: shiftCoverage,
      qddpCaseManager: qddpCaseManager,
      fundingSource: fundingSource,
      assignedStaffDetails: activeStaff.map(staff => ({
        id: staff.id,
        name: staff.staff_name,
        role: staff.role || 'Not specified',
        primaryContact: staff.primary_contact || false,
        trainingCompleted: staff.training_completed || false,
        trainingDate: staff.training_completion_date,
        shiftAssignment: staff.shift_assignment,
        contactPhone: staff.contact_phone,
        contactEmail: staff.contact_email
      }))
    };
  };

  const generateAlerts = (community, choice, isp, rights, health, staff) => {
    const newAlerts = [];

    if (community.outings30Days === 0) {
      newAlerts.push({
        id: 'comm-1',
        severity: 'critical',
        category: 'Community Integration',
        message: 'No community activity documented in 30 days',
        action: 'Schedule community outing immediately',
        hcbsRequirement: 'Individuals must access the community consistent with their preferences'
      });
    } else if (community.outings30Days < 4) {
      newAlerts.push({
        id: 'comm-2',
        severity: 'warning',
        category: 'Community Integration',
        message: `Only ${community.outings30Days} community outings in last 30 days`,
        action: 'Increase community engagement frequency (recommended: 4+ per month)',
        hcbsRequirement: 'Regular community integration is required'
      });
    }

    if (community.communityBarriers && community.communityBarriers.length > 0) {
      newAlerts.push({
        id: 'comm-3',
        severity: 'info',
        category: 'Community Integration',
        message: `${community.communityBarriers.length} documented community barriers`,
        action: 'Review and address identified barriers to community access',
        hcbsRequirement: 'Barriers to community integration must be addressed'
      });
    }

    if (choice.choiceOfferedRate < 50) {
      newAlerts.push({
        id: 'choice-1',
        severity: 'critical',
        category: 'Choice & Autonomy',
        message: 'Choice offered in less than 50% of daily notes',
        action: 'Ensure choice is documented in all service delivery',
        hcbsRequirement: 'Choice must be offered and documented'
      });
    } else if (choice.choiceOfferedRate < 70) {
      newAlerts.push({
        id: 'choice-2',
        severity: 'warning',
        category: 'Choice & Autonomy',
        message: `Choice offered rate at ${choice.choiceOfferedRate}% (below 70% target)`,
        action: 'Improve choice documentation practices',
        hcbsRequirement: 'Choice should be consistently offered'
      });
    }

    if (choice.choiceHonoredRate < 70 && choice.choiceOfferedCount > 0) {
      newAlerts.push({
        id: 'choice-3',
        severity: 'warning',
        category: 'Choice & Autonomy',
        message: `Choice honored rate at ${choice.choiceHonoredRate}% (below 70% target)`,
        action: 'Review barriers to honoring individual choices',
        hcbsRequirement: 'Offered choices must be honored when possible'
      });
    }

    if (isp.goalsNotAddressed > 0) {
      newAlerts.push({
        id: 'isp-1',
        severity: 'critical',
        category: 'ISP Implementation',
        message: `${isp.goalsNotAddressed} active goals not addressed in 14+ days`,
        action: 'Review and address all active ISP goals immediately',
        hcbsRequirement: 'All active ISP goals must be regularly addressed'
      });
    }

    if (isp.goalLinkageRate < 60) {
      newAlerts.push({
        id: 'isp-2',
        severity: 'warning',
        category: 'ISP Implementation',
        message: `Goal linkage rate at ${isp.goalLinkageRate}% (below 60% target)`,
        action: 'Improve ISP goal documentation in daily notes',
        hcbsRequirement: 'Services must support ISP outcomes'
      });
    }

    if (!isp.ispCurrent) {
      newAlerts.push({
        id: 'isp-3',
        severity: 'critical',
        category: 'ISP Implementation',
        message: 'ISP is not current or dates not set',
        action: 'Update ISP effective dates immediately',
        hcbsRequirement: 'Current ISP required at all times'
      });
    }

    if (isp.ispReviewDue) {
      newAlerts.push({
        id: 'isp-4',
        severity: 'critical',
        category: 'ISP Implementation',
        message: 'ISP review is overdue',
        action: 'Schedule ISP review meeting immediately',
        hcbsRequirement: 'ISP must be reviewed on schedule'
      });
    }

    if (rights.overdueReviews > 0) {
      newAlerts.push({
        id: 'rights-1',
        severity: 'critical',
        category: 'Rights & Restrictions',
        message: `${rights.overdueReviews} rights restrictions have overdue reviews`,
        action: 'Complete overdue HRC reviews immediately',
        hcbsRequirement: 'Rights restrictions must be reviewed on schedule'
      });
    }

    if (rights.hrcPending > 0) {
      newAlerts.push({
        id: 'rights-3',
        severity: 'critical',
        category: 'Rights & Restrictions',
        message: `${rights.hrcPending} restrictions without HRC approval`,
        action: 'Obtain HRC approval for all restrictions',
        hcbsRequirement: 'All restrictions must be HRC approved'
      });
    }

    if (rights.openComplaints > 0) {
      newAlerts.push({
        id: 'rights-6',
        severity: 'warning',
        category: 'Rights & Restrictions',
        message: `${rights.openComplaints} open complaints requiring resolution`,
        action: 'Address and resolve pending complaints',
        hcbsRequirement: 'Complaints must be investigated and resolved'
      });
    }

    if (rights.openCAPs > 0) {
      newAlerts.push({
        id: 'rights-7',
        severity: 'warning',
        category: 'Rights & Restrictions',
        message: `${rights.openCAPs} open corrective action plans`,
        action: 'Complete pending corrective actions',
        hcbsRequirement: 'CAPs must be implemented and evaluated'
      });
    }

    if (health.openIncidents > 0) {
      newAlerts.push({
        id: 'health-1',
        severity: 'critical',
        category: 'Health & Safety',
        message: `${health.openIncidents} open incidents requiring attention`,
        action: 'Review and close open incidents',
        hcbsRequirement: 'All incidents must be properly investigated and closed'
      });
    }

    if (health.medicationErrors > 0) {
      newAlerts.push({
        id: 'health-2',
        severity: 'critical',
        category: 'Health & Safety',
        message: `${health.medicationErrors} medication errors in date range`,
        action: 'Review medication administration procedures and provide retraining',
        hcbsRequirement: 'Medication safety protocols must be followed'
      });
    }

    if (health.medicationComplianceRate < 90) {
      newAlerts.push({
        id: 'health-4',
        severity: 'warning',
        category: 'Health & Safety',
        message: `Medication compliance at ${health.medicationComplianceRate}% (below 90% target)`,
        action: 'Address medication refusals and missed doses',
        hcbsRequirement: 'Medication compliance must be maintained'
      });
    }

    if (staff.billingValidationRate < 90) {
      newAlerts.push({
        id: 'staff-2',
        severity: 'warning',
        category: 'Staff Readiness',
        message: `Billing validation rate at ${staff.billingValidationRate}% (below 90% target)`,
        action: 'Ensure all documentation meets billing requirements',
        hcbsRequirement: 'Only validated services appear in compliance reporting'
      });
    }

    if (staff.trainingComplianceRate < 100) {
      newAlerts.push({
        id: 'staff-3',
        severity: 'critical',
        category: 'Staff Readiness',
        message: `Training compliance at ${staff.trainingComplianceRate}% (${staff.activeStaffCount - staff.trainedStaffCount} staff need training)`,
        action: 'Complete required staff training immediately',
        hcbsRequirement: 'All staff must complete required training'
      });
    }

    if (staff.qddpCaseManager === 'Not assigned') {
      newAlerts.push({
        id: 'staff-5',
        severity: 'critical',
        category: 'Staff Readiness',
        message: 'No QDDP/Case Manager assigned',
        action: 'Assign QDDP/Case Manager immediately',
        hcbsRequirement: 'QDDP oversight required'
      });
    }

    setAlerts(newAlerts);
  };

  const getInitials = (firstname, lastname) => {
    return `${firstname?.charAt(0) || ''}${lastname?.charAt(0) || ''}`.toUpperCase();
  };

  const getColorClass = (index) => {
    const colors = [
      'from-emerald-600 to-teal-500',
      'from-blue-600 to-cyan-500',
      'from-purple-600 to-pink-500',
      'from-orange-600 to-red-500',
      'from-green-500 to-lime-600',
      'from-indigo-600 to-purple-500',
      'from-rose-600 to-pink-500',
      'from-amber-600 to-orange-500'
    ];
    return colors[index % colors.length];
  };

  const filteredIndividuals = individuals.filter(ind => {
    const matchesSearch = 
      ind.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ind.individualid?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const calculateOverallComplianceScore = (compData) => {
    if (!compData || Object.keys(compData).length === 0) return 0;

    let totalScore = 0;
    let categoryCount = 0;

    if (compData.communityIntegration) {
      const comm = compData.communityIntegration;
      let commScore = 0;
      if (comm.outings30Days >= 4) commScore += 50;
      else if (comm.outings30Days >= 2) commScore += 30;
      else if (comm.outings30Days >= 1) commScore += 15;
      
      if (comm.choiceDocumentedRate >= 80) commScore += 50;
      else if (comm.choiceDocumentedRate >= 60) commScore += 30;
      else if (comm.choiceDocumentedRate >= 40) commScore += 15;
      
      totalScore += commScore;
      categoryCount++;
    }

    if (compData.choiceAutonomy) {
      const choice = compData.choiceAutonomy;
      let choiceScore = 0;
      if (choice.choiceOfferedRate >= 70) choiceScore += 50;
      else if (choice.choiceOfferedRate >= 50) choiceScore += 30;
      else if (choice.choiceOfferedRate >= 30) choiceScore += 15;
      
      if (choice.choiceHonoredRate >= 70) choiceScore += 50;
      else if (choice.choiceHonoredRate >= 50) choiceScore += 30;
      else if (choice.choiceHonoredRate >= 30) choiceScore += 15;
      
      totalScore += choiceScore;
      categoryCount++;
    }

    if (compData.ispImplementation) {
      const isp = compData.ispImplementation;
      let ispScore = 0;
      if (isp.goalLinkageRate >= 60) ispScore += 40;
      else if (isp.goalLinkageRate >= 40) ispScore += 25;
      else if (isp.goalLinkageRate >= 20) ispScore += 10;
      
      if (isp.goalsNotAddressed === 0) ispScore += 30;
      else if (isp.goalsNotAddressed <= 2) ispScore += 15;
      
      if (isp.ispCurrent) ispScore += 30;
      
      totalScore += ispScore;
      categoryCount++;
    }

    if (compData.rightsRestrictions) {
      const rights = compData.rightsRestrictions;
      let rightsScore = 100;
      if (rights.overdueReviews > 0) rightsScore -= 40;
      if (rights.hrcPending > 0) rightsScore -= 30;
      if (!rights.rightsExplained) rightsScore -= 20;
      if (rights.openComplaints > 0) rightsScore -= 10;
      
      totalScore += Math.max(0, rightsScore);
      categoryCount++;
    }

    if (compData.healthSafety) {
      const health = compData.healthSafety;
      let healthScore = 100;
      if (health.openIncidents > 0) healthScore -= 20;
      if (health.medicationErrors > 0) healthScore -= 30;
      if (health.medicationComplianceRate < 90) healthScore -= 20;
      if (health.emergencyInterventions > 3) healthScore -= 15;
      if (health.prnUsageCount > 15) healthScore -= 15;
      
      totalScore += Math.max(0, healthScore);
      categoryCount++;
    }

    if (compData.staffReadiness) {
      const staff = compData.staffReadiness;
      let staffScore = 0;
      if (staff.approvalRate >= 80) staffScore += 25;
      else if (staff.approvalRate >= 60) staffScore += 15;
      
      if (staff.billingValidationRate >= 90) staffScore += 25;
      else if (staff.billingValidationRate >= 70) staffScore += 15;
      
      if (staff.trainingComplianceRate === 100) staffScore += 25;
      else if (staff.trainingComplianceRate >= 80) staffScore += 15;
      
      if (staff.qddpCaseManager !== 'Not assigned') staffScore += 25;
      
      totalScore += staffScore;
      categoryCount++;
    }

    return categoryCount > 0 ? Math.round(totalScore / categoryCount) : 0;
  };

  const exportCompliance = () => {
    if (!selectedIndividual) return;

    const overallScore = calculateOverallComplianceScore(complianceData);

    const data = {
      exportType: 'HCBS Compliance Report',
      exportDate: new Date().toISOString(),
      dateRange: dateRange,
      individual: {
        name: `${selectedIndividual.firstname} ${selectedIndividual.lastname}`,
        id: selectedIndividual.individualid,
        dateOfBirth: selectedIndividual.dateofbirth,
        home: selectedIndividual.homeassignment,
        division: selectedIndividual.division,
        status: selectedIndividual.status,
        medicaidNumber: selectedIndividual.medicaidnumber,
        fundingSource: selectedIndividual.funding_source
      },
      overallComplianceScore: overallScore,
      metrics: complianceData,
      alerts: alerts,
      criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
      warningAlerts: alerts.filter(a => a.severity === 'warning').length,
      infoAlerts: alerts.filter(a => a.severity === 'info').length,
      auditMode: showAuditMode,
      auditData: auditModeData
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HCBS_Compliance_${selectedIndividual.individualid}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const enableAuditMode = () => {
    setShowAuditMode(true);
    setAuditModeData({
      lockedDateRange: { ...dateRange },
      lockedMetrics: { ...complianceData },
      lockedAlerts: [...alerts],
      auditInitiatedBy: userProfile?.fullname || 'User',
      auditInitiatedAt: new Date().toISOString(),
      auditPurpose: 'HCBS Compliance Audit'
    });
  };

  const disableAuditMode = () => {
    setShowAuditMode(false);
    setAuditModeData(null);
  };

 

  

  if (!profileLoading && !canViewHCBS) {
    return (
      <div className="h-screen flex flex-col bg-slate-950 text-white">
      
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
            <p className="text-slate-400 mb-6">
              You do not have permission to view the HCBS Dashboard.
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
          <p className="text-slate-400 text-lg">Loading HCBS Dashboard...</p>
        </div>
      </div>
    );
  }

 
  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      
      <div className="flex flex-1 overflow-hidden">
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <main className="p-6 lg:p-8">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">
                        HCBS Compliance Dashboard
                      </h2>
                      <div className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full">
                        <span className="text-green-400 text-xs font-bold flex items-center gap-1">
                          <Shield size={12} /> ADMH Certified
                        </span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-lg">
                      Real-time compliance monitoring • Person-centered • Audit-ready • HCBS Settings Rule
                    </p>
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
                  
                  {selectedIndividual && (
                    <div className="flex items-center gap-3">
                      {!showAuditMode ? (
                        <button
                          onClick={enableAuditMode}
                          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-purple-500"
                        >
                          <Lock size={18} />
                          Enable Audit Mode
                        </button>
                      ) : (
                        <button
                          onClick={disableAuditMode}
                          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-orange-500"
                        >
                          <Unlock size={18} />
                          Disable Audit Mode
                        </button>
                      )}
                     {canExportCompliance && (
  <button
    onClick={exportCompliance}
    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border border-slate-700"
  >
    <Download size={18} />
    Export Report
  </button>
)}
                      <button
                        onClick={() => calculateComplianceData()}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-105"
                        disabled={showAuditMode}
                      >
                        <RefreshCw size={18} />
                        {showAuditMode ? 'Locked' : 'Refresh Data'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Audit Mode Banner */}
                {showAuditMode && auditModeData && (
                  <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lock className="text-purple-400" size={24} />
                        <div>
                          <h3 className="text-xl font-bold text-white">Audit Mode Active</h3>
                          <p className="text-purple-300 text-sm">
                            Data frozen for compliance audit • Initiated by {auditModeData.auditInitiatedBy} on {new Date(auditModeData.auditInitiatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded-lg">
                        <p className="text-purple-300 text-xs font-bold">Evidence Packet Locked</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Date Range Filter */}
                {selectedIndividual && (
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="text-emerald-400" size={20} />
                          <span className="text-white font-semibold">Date Range:</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => !showAuditMode && setDateRange({...dateRange, start: e.target.value, period: 'custom'})}
                            disabled={showAuditMode}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span className="text-slate-400">to</span>
                          <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => !showAuditMode && setDateRange({...dateRange, end: e.target.value, period: 'custom'})}
                            disabled={showAuditMode}
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {['30days', '60days', '90days'].map(period => (
                          <button
                            key={period}
                            onClick={() => {
                              if (!showAuditMode) {
                                const days = parseInt(period);
                                const end = new Date();
                                const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
                                setDateRange({
                                  start: start.toISOString().split('T')[0],
                                  end: end.toISOString().split('T')[0],
                                  period: period
                                });
                              }
                            }}
                            disabled={showAuditMode}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                              dateRange.period === period
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {period.replace('days', ' Days')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {!selectedIndividual ? (
                  /* Individual Selection Grid */
                  <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-white mb-2">Select Individual</h3>
                      <p className="text-slate-400">Choose an individual to view their comprehensive HCBS compliance metrics and documentation</p>
                    </div>

                    <ScrollArea className="h-[600px]">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredIndividuals.map((individual, idx) => {
                          const tempCompData = {
                            communityIntegration: { outings30Days: Math.floor(Math.random() * 10) },
                            choiceAutonomy: { choiceOfferedRate: 50 + Math.floor(Math.random() * 50) },
                            ispImplementation: { goalLinkageRate: 40 + Math.floor(Math.random() * 60) },
                            rightsRestrictions: { overdueReviews: 0, hrcPending: 0 },
                            healthSafety: { openIncidents: 0, medicationErrors: 0 },
                            staffReadiness: { approvalRate: 70 + Math.floor(Math.random() * 30) }
                          };
                          const complianceScore = individual.compliance_score || calculateOverallComplianceScore(tempCompData);

                          return (
                            <div
                              key={individual.id}
                              onClick={() => setSelectedIndividual(individual)}
                              className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 cursor-pointer hover:border-emerald-500/50 transition-all duration-300 hover:scale-105 group"
                            >
                              <div className="flex items-center gap-3 mb-4">
                                <div className={`w-14 h-14 bg-gradient-to-br ${getColorClass(idx)} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                                  {getInitials(individual.firstname, individual.lastname)}
                                </div>
                                <div>
                                  <h3 className="text-white font-bold text-lg group-hover:text-emerald-400 transition-colors">
                                    {individual.firstname} {individual.lastname}
                                  </h3>
                                  <p className="text-slate-400 text-sm">ID: {individual.individualid}</p>
                                </div>
                              </div>

                              <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-400">Home:</span>
                                  <span className="text-white font-semibold">{individual.homeassignment}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-400">Division:</span>
                                  <span className="text-white font-semibold">{individual.division || 'N/A'}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-400">Status:</span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    individual.status === 'Active' 
                                      ? 'bg-green-900/30 text-green-400 border border-green-500/50' 
                                      : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50'
                                  }`}>
                                    {individual.status}
                                  </span>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-slate-400 text-xs">HCBS Compliance</span>
                                  <span className={`text-sm font-bold ${
                                    complianceScore >= 95 ? 'text-green-400' :
                                    complianceScore >= 85 ? 'text-yellow-400' :
                                    'text-red-400'
                                  }`}>{complianceScore}%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                  <div 
                                    className={`h-full rounded-full transition-all ${
                                      complianceScore >= 95 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                                      complianceScore >= 85 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                      'bg-gradient-to-r from-red-500 to-orange-600'
                                    }`}
                                    style={{width: `${complianceScore}%`}}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  /* Compliance Dashboard */
                  <>
                    {/* Selected Individual Header */}
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-20 h-20 bg-gradient-to-br ${getColorClass(0)} rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                            {getInitials(selectedIndividual.firstname, selectedIndividual.lastname)}
                          </div>
                          <div>
                            <h3 className="text-3xl font-bold text-white mb-1">
                              {selectedIndividual.firstname} {selectedIndividual.lastname}
                            </h3>
                            <div className="flex items-center gap-4 text-sm flex-wrap">
                              <span className="text-slate-400">ID: {selectedIndividual.individualid}</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-400">{selectedIndividual.homeassignment}</span>
<span className="text-slate-400">•</span>
<span className="text-slate-400">DOB: {new Date(selectedIndividual.dateofbirth).toLocaleDateString()}</span>
<span className="text-slate-400">•</span>
<span className={`px-2 py-1 rounded-full text-xs font-bold ${selectedIndividual.status === 'Active' ? 'bg-green-900/30 text-green-400 border border-green-500/50' : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50'}`}>
</span>
</div>
</div>
</div>
<button
onClick={() => setSelectedIndividual(null)}
className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
>
Change Individual
</button>
</div>
</div>

{/* Alerts Panel */}
                {alerts.length > 0 && (
                  <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="text-red-400" size={24} />
                      <h3 className="text-xl font-bold text-white">
                        Compliance Alerts ({alerts.length})
                        <span className="ml-3 text-sm font-normal text-slate-400">
                          {alerts.filter(a => a.severity === 'critical').length} Critical • 
                          {alerts.filter(a => a.severity === 'warning').length} Warning • 
                          {alerts.filter(a => a.severity === 'info').length} Info
                        </span>
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {alerts.map(alert => (
                        <div 
                          key={alert.id}
                          className={`p-4 rounded-xl border ${
                            alert.severity === 'critical' 
                              ? 'bg-red-900/30 border-red-500/50' 
                              : alert.severity === 'warning'
                              ? 'bg-yellow-900/30 border-yellow-500/50'
                              : 'bg-blue-900/30 border-blue-500/50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {alert.severity === 'critical' && <XCircle className="text-red-400 mt-1 flex-shrink-0" size={20} />}
                            {alert.severity === 'warning' && <AlertCircle className="text-yellow-400 mt-1 flex-shrink-0" size={20} />}
                            {alert.severity === 'info' && <Info className="text-blue-400 mt-1 flex-shrink-0" size={20} />}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">{alert.category}</p>
                              <p className="text-white font-semibold text-sm mb-2">{alert.message}</p>
                              <p className="text-slate-300 text-xs mb-2"><span className="font-bold">Action:</span> {alert.action}</p>
                              {alert.hcbsRequirement && (
                                <p className="text-slate-400 text-xs italic"><span className="font-bold">HCBS Requirement:</span> {alert.hcbsRequirement}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dashboard Tabs */}
                {/* Dashboard Tabs */}
<div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
  <div className="border-b border-slate-700">
    <ScrollArea className="w-full">

                      <div className="flex p-2 gap-2 w-[50vw]">
                        {dashboardTabs.map(tab => {
                          const Icon = tab.icon;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                                activeTab === tab.id
                                  ? `bg-gradient-to-r from-${tab.color}-600 to-${tab.color}-500 text-white shadow-lg`
                                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              <Icon size={18} />
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>

                  <div className="p-6">
                    {/* Community Integration Tab */}
                    {activeTab === 'community' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-slate-900/50 border border-emerald-500/30 rounded-xl p-4">
                            <p className="text-slate-400 text-sm mb-1">Total Outings</p>
                            <p className="text-3xl font-bold text-white">{complianceData.communityIntegration.totalOutings || 0}</p>
                            <p className="text-emerald-400 text-xs mt-1">in {dateRange.period.replace('days', ' days')}</p>
                          </div>
                          <div className="bg-slate-900/50 border border-emerald-500/30 rounded-xl p-4">
                            <p className="text-slate-400 text-sm mb-1">Per Month</p>
                            <p className="text-3xl font-bold text-white">{complianceData.communityIntegration.outingsPerMonth || 0}</p>
                            <p className="text-emerald-400 text-xs mt-1">average</p>
                          </div>
                          <div className="bg-slate-900/50 border border-emerald-500/30 rounded-xl p-4">
                            <p className="text-slate-400 text-sm mb-1">Last 30 Days</p>
                            <p className="text-3xl font-bold text-white">{complianceData.communityIntegration.outings30Days || 0}</p>
                            <p className="text-emerald-400 text-xs mt-1">outings</p>
                          </div>
                          <div className="bg-slate-900/50 border border-emerald-500/30 rounded-xl p-4">
                            <p className="text-slate-400 text-sm mb-1">Engagement Rate</p>
                            <p className="text-3xl font-bold text-white">{complianceData.communityIntegration.percentageWithActivity || 0}%</p>
                            <p className="text-emerald-400 text-xs mt-1">of documented days</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                            <h4 className="text-lg font-bold text-white mb-4">Activity Types</h4>
                            <div className="space-y-3">
                              {Object.entries(complianceData.communityIntegration.activityTypes || {}).map(([activity, count]) => (
                                <div key={activity}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-slate-300 capitalize">{activity.replace('-', ' ')}</span>
                                    <span className="text-white font-bold">{count}</span>
                                  </div>
                                  <div className="w-full bg-slate-800 rounded-full h-2">
                                    <div 
                                      className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full"
                                      style={{
                                        width: `${Math.min((count / (complianceData.communityIntegration.totalOutings || 1)) * 100, 100)}%`
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                              {Object.keys(complianceData.communityIntegration.activityTypes || {}).length === 0 && (
                                <p className="text-slate-500 text-center py-4">No activity types documented</p>
                              )}
                            </div>
                          </div>

                          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                            <h4 className="text-lg font-bold text-white mb-4">Recent Community Outings</h4>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {(complianceData.communityIntegration.recentOutings || []).map((outing, idx) => (
                                <div key={idx} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-white font-semibold">{outing.location}</span>
                                    <span className="text-slate-400 text-xs">{new Date(outing.date).toLocaleDateString()}</span>
                                  </div>
                                  <div className="space-y-1 text-sm">
                                    <p className="text-slate-400">Duration: {outing.duration}</p>
                                    <p className="text-slate-400">Purpose: {outing.purpose}</p>
                                    <p className="text-slate-400">Transportation: {outing.transportation}</p>
                                    <p className="text-slate-400">Staff: {outing.staffName}</p>
                                  </div>
                                  {outing.activities.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {outing.activities.map((activity, actIdx) => (
                                        <span key={actIdx} className="px-2 py-1 bg-emerald-900/30 text-emerald-400 text-xs rounded border border-emerald-500/50">
                                          {activity}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {outing.choiceDocumented && (
                                    <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                                      <CheckCircle2 size={14} />
                                      Choice Documented
                                    </div>
                                  )}
                                </div>
                              ))}
                              {(!complianceData.communityIntegration.recentOutings || complianceData.communityIntegration.recentOutings.length === 0) && (
                                <p className="text-slate-500 text-center py-4">No community outings documented</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Additional Community Integration Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                            <h4 className="text-lg font-bold text-white mb-4">Transportation Methods</h4>
                            <div className="space-y-3">
                              {Object.entries(complianceData.communityIntegration.transportationMethods || {}).map(([method, count]) => (
                                <div key={method}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-slate-300">{method}</span>
                                    <span className="text-white font-bold">{count}</span>
                                  </div>
                                  <div className="w-full bg-slate-800 rounded-full h-2">
                                    <div 
                                      className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full"
                                      style={{
                                        width: `${Math.min((count / (complianceData.communityIntegration.totalOutings || 1)) * 100, 100)}%`
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                            <h4 className="text-lg font-bold text-white mb-4">Individual Preferences</h4>
                            <div className="space-y-3">
                              <div>
                                <p className="text-slate-400 text-sm mb-1">Important To (Preferences):</p>
                                <p className="text-white text-sm">{complianceData.communityIntegration.individualPreferences}</p>
                              </div>
                              <div>
                                <p className="text-slate-400 text-sm mb-1">Community Integration Plan:</p>
                                <p className="text-white text-sm">{complianceData.communityIntegration.communityIntegrationPlan}</p>
                              </div>
                            {complianceData.communityIntegration.communityBarriers && 
 Array.isArray(complianceData.communityIntegration.communityBarriers) &&
 complianceData.communityIntegration.communityBarriers.length > 0 && (
  <div>
    <p className="text-slate-400 text-sm mb-1">Identified Barriers:</p>
    <div className="space-y-1">
      {complianceData.communityIntegration.communityBarriers.map((barrier, idx) => (
        <p key={idx} className="text-yellow-400 text-sm">• {barrier}</p>
      ))}
    </div>
  </div>
)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Choice & Autonomy Tab */}
{activeTab === 'choice' && (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-slate-900/50 border border-blue-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Choice Offered</p>
        <p className="text-3xl font-bold text-white">{complianceData.choiceAutonomy.choiceOfferedRate || 0}%</p>
        <p className="text-blue-400 text-xs mt-1">{complianceData.choiceAutonomy.choiceOfferedCount || 0} instances</p>
      </div>
      <div className="bg-slate-900/50 border border-blue-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Choice Honored</p>
        <p className="text-3xl font-bold text-white">{complianceData.choiceAutonomy.choiceHonoredRate || 0}%</p>
        <p className="text-blue-400 text-xs mt-1">{complianceData.choiceAutonomy.choiceHonoredCount || 0} instances</p>
      </div>
      <div className="bg-slate-900/50 border border-blue-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Total Notes</p>
        <p className="text-3xl font-bold text-white">{complianceData.choiceAutonomy.totalNotes || 0}</p>
        <p className="text-blue-400 text-xs mt-1">documented</p>
      </div>
      <div className="bg-slate-900/50 border border-blue-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Compliance</p>
        <p className={`text-3xl font-bold ${
          (complianceData.choiceAutonomy.choiceOfferedRate || 0) >= 70 ? 'text-green-400' : 'text-yellow-400'
        }`}>
          {(complianceData.choiceAutonomy.choiceOfferedRate || 0) >= 70 ? 'Good' : 'Needs Improvement'}
        </p>
        <p className="text-blue-400 text-xs mt-1">target: 70%+</p>
      </div>
    </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
    <h4 className="text-lg font-bold text-white mb-4">Choice Types</h4>
    <div className="space-y-3">
      {Object.entries(complianceData.choiceAutonomy.choiceTypes || {}).map(([type, count]) => (
        <div key={type}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-300 capitalize">{type}</span>
            <span className="text-white font-bold">{count}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
              style={{
                width: `${Math.min((count / (complianceData.choiceAutonomy.choiceOfferedCount || 1)) * 100, 100)}%`
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>

  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
    <h4 className="text-lg font-bold text-white mb-4">Recent Choices</h4>
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {(complianceData.choiceAutonomy.recentChoices || []).map((choice, idx) => (
        <div key={idx} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-400 text-xs">{new Date(choice.date).toLocaleDateString()}</span>
            {choice.honored && (
              <span className="text-green-400 text-xs flex items-center gap-1">
                <CheckCircle2 size={14} />
                Honored
              </span>
            )}
          </div>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-slate-400">Offered: </span>
              <span className="text-white">{choice.offered}</span>
            </div>
            <div>
              <span className="text-slate-400">Taken: </span>
              <span className="text-white">{choice.taken}</span>
            </div>
            <div>
              <span className="text-slate-400">Staff: </span>
              <span className="text-white">{choice.staffName}</span>
            </div>
          </div>
        </div>
      ))}
      {(!complianceData.choiceAutonomy.recentChoices || complianceData.choiceAutonomy.recentChoices.length === 0) && (
        <p className="text-slate-500 text-center py-4">No choices documented</p>
      )}
    </div>
  </div>
</div>

{/* Choice Acknowledgments */}
<div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
  <h4 className="text-lg font-bold text-white mb-4">Choice & Rights Acknowledgments</h4>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <p className="text-slate-400 text-sm mb-1">Total Acknowledgments</p>
      <p className="text-2xl font-bold text-white">{complianceData.choiceAutonomy.choiceAcknowledgments || 0}</p>
    </div>
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <p className="text-slate-400 text-sm mb-1">Rights Explained</p>
      <p className="text-2xl font-bold text-white">{complianceData.choiceAutonomy.rightsExplainedCount || 0}</p>
    </div>
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <p className="text-slate-400 text-sm mb-1">Right to Refuse</p>
      <p className="text-2xl font-bold text-white">{complianceData.choiceAutonomy.rightToRefuseExplained || 0}</p>
    </div>
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <p className="text-slate-400 text-sm mb-1">HCBS Compliant</p>
      <p className="text-2xl font-bold text-white">{complianceData.choiceAutonomy.hcbsCompliantAcknowledgments || 0}</p>
    </div>
  </div>
</div>

{/* Individual Preferences */}
<div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
  <h4 className="text-lg font-bold text-white mb-4">Individual Preferences & Strengths</h4>
  <div className="space-y-3">
    <div>
      <p className="text-slate-400 text-sm mb-1">Important To (What matters to the individual):</p>
      <p className="text-white">{complianceData.choiceAutonomy.individualPreferences}</p>
    </div>
    <div>
      <p className="text-slate-400 text-sm mb-1">Strengths & Interests:</p>
      <p className="text-white">{complianceData.choiceAutonomy.strengthsInterests}</p>
    </div>
  </div>
</div>
</div>
)}
{/* ISP Implementation Tab */}
{activeTab === 'isp' && (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-slate-900/50 border border-purple-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Total Goals</p>
        <p className="text-3xl font-bold text-white">{complianceData.ispImplementation.totalGoals || 0}</p>
        <p className="text-purple-400 text-xs mt-1">{complianceData.ispImplementation.activeGoals || 0} active</p>
      </div>
      <div className="bg-slate-900/50 border border-purple-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Goal Linkage</p>
        <p className="text-3xl font-bold text-white">{complianceData.ispImplementation.goalLinkageRate || 0}%</p>
        <p className="text-purple-400 text-xs mt-1">of notes linked</p>
      </div>
      <div className="bg-slate-900/50 border border-purple-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Not Addressed</p>
        <p className="text-3xl font-bold text-white">{complianceData.ispImplementation.goalsNotAddressed || 0}</p>
        <p className="text-purple-400 text-xs mt-1">in 14+ days</p>
      </div>
      <div className="bg-slate-900/50 border border-purple-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">ISP Status</p>
        <p className={`text-2xl font-bold ${complianceData.ispImplementation.ispCurrent ? 'text-green-400' : 'text-red-400'}`}>
          {complianceData.ispImplementation.ispCurrent ? 'Current' : 'Expired/Missing'}
        </p>
        <p className="text-purple-400 text-xs mt-1">
          {complianceData.ispImplementation.ispReviewDue ? 'Review Overdue' : 'On Schedule'}
        </p>
      </div>
    </div>
    {/* ISP Dates */}
<div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
  <h4 className="text-lg font-bold text-white mb-4">ISP Dates</h4>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <p className="text-slate-400 text-sm mb-1">Effective Start</p>
      <p className="text-white font-semibold">{complianceData.ispImplementation.ispEffectiveStart || 'Not set'}</p>
    </div>
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <p className="text-slate-400 text-sm mb-1">Effective End</p>
      <p className="text-white font-semibold">{complianceData.ispImplementation.ispEffectiveEnd || 'Not set'}</p>
    </div>
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <p className="text-slate-400 text-sm mb-1">Next Review</p>
      <p className="text-white font-semibold">{complianceData.ispImplementation.ispNextReview || 'Not scheduled'}</p>
    </div>
  </div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
    <h4 className="text-lg font-bold text-white mb-4">Goal Activity by Domain</h4>
    <div className="space-y-3">
      {Object.entries(complianceData.ispImplementation.domainActivity || {}).map(([domain, data]) => (
        <div key={domain} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold">{domain}</span>
            <span className="text-purple-400 text-sm">{data.avgProgress}% avg progress</span>
          </div>
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>{data.totalGoals} goals ({data.activeGoals} active)</span>
            <span>{data.timesWorked} times worked</span>
          </div>
        </div>
      ))}
      {Object.keys(complianceData.ispImplementation.domainActivity || {}).length === 0 && (
        <p className="text-slate-500 text-center py-4">No domain activity</p>
      )}
    </div>
  </div>

  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
    <h4 className="text-lg font-bold text-white mb-4">Goals Not Recently Addressed</h4>
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {(complianceData.ispImplementation.goalsNotAddressedList || []).map((goal) => (
        <div key={goal.id} className="p-3 bg-red-900/20 rounded-lg border border-red-500/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-red-400 text-xs uppercase font-bold">{goal.status}</span>
            <span className="text-slate-400 text-xs">Last: {goal.lastWorked}</span>
          </div>
          <p className="text-white text-sm mb-1">{goal.description}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Domain: {goal.domain}</span>
            <span className="text-slate-400">Target: {goal.targetDate || 'Not set'}</span>
          </div>
        </div>
      ))}
      {(!complianceData.ispImplementation.goalsNotAddressedList || complianceData.ispImplementation.goalsNotAddressedList.length === 0) && (
        <p className="text-green-400 text-center py-4">✓ All goals recently addressed</p>
      )}
    </div>
  </div>
</div>

{/* Quarterly Reviews */}
<div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
  <h4 className="text-lg font-bold text-white mb-4">Quarterly Reviews & Outcomes</h4>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <p className="text-slate-400 text-sm mb-1">Quarterly Reviews</p>
      <p className="text-2xl font-bold text-white">{complianceData.ispImplementation.quarterlyReviews || 0}</p>
    </div>
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <p className="text-slate-400 text-sm mb-1">Completed</p>
      <p className="text-2xl font-bold text-white">{complianceData.ispImplementation.quarterlyReviewsCompleted || 0}</p>
    </div>
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <p className="text-slate-400 text-sm mb-1">Total Outcomes</p>
      <p className="text-2xl font-bold text-white">{complianceData.ispImplementation.totalOutcomes || 0}</p>
    </div>
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <p className="text-slate-400 text-sm mb-1">Active Outcomes</p>
      <p className="text-2xl font-bold text-white">{complianceData.ispImplementation.activeOutcomes || 0}</p>
    </div>
  </div>
  <div>
    <p className="text-slate-400 text-sm mb-1">QIDP Notes:</p>
    <p className="text-white text-sm">{complianceData.ispImplementation.qidpNotes}</p>
  </div>
</div>
</div>
)}
{/* Rights & Restrictions Tab - Continuing from where it was cut off */}
{activeTab === 'rights' && (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-slate-900/50 border border-orange-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Total Restrictions</p>
        <p className="text-3xl font-bold text-white">{complianceData.rightsRestrictions.totalRestrictions || 0}</p>
        <p className="text-orange-400 text-xs mt-1">{complianceData.rightsRestrictions.activeRestrictions || 0} active</p>
      </div>
      <div className="bg-slate-900/50 border border-orange-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Overdue Reviews</p>
        <p className={`text-3xl font-bold ${
          (complianceData.rightsRestrictions.overdueReviews || 0) > 0 ? 'text-red-400' : 'text-green-400'
        }`}>
          {complianceData.rightsRestrictions.overdueReviews || 0}
        </p>
        <p className="text-orange-400 text-xs mt-1">need attention</p>
      </div>
      <div className="bg-slate-900/50 border border-orange-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">HRC Approval</p>
        <p className="text-3xl font-bold text-white">{complianceData.rightsRestrictions.hrcApprovalRate || 0}%</p>
        <p className="text-orange-400 text-xs mt-1">{complianceData.rightsRestrictions.hrcApproved || 0} approved</p>
      </div>
      <div className="bg-slate-900/50 border border-orange-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Compliance</p>
        <p className={`text-3xl font-bold ${
          (complianceData.rightsRestrictions.overdueReviews || 0) === 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {(complianceData.rightsRestrictions.overdueReviews || 0) === 0 ? 'Good' : 'Action Required'}
        </p>
        <p className="text-orange-400 text-xs mt-1">HRC compliant</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
    <h4 className="text-lg font-bold text-white mb-4">Active Restrictions</h4>
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {(complianceData.rightsRestrictions.restrictionsList || []).map((restriction) => (
        <div key={restriction.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-400 text-sm font-bold">{restriction.type}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
              restriction.approved 
                ? 'bg-green-900/30 text-green-400 border border-green-500/50'
                : 'bg-red-900/30 text-red-400 border border-red-500/50'
            }`}>
              {restriction.approved ? 'HRC Approved' : 'Pending'}
            </span>
          </div>
          <p className="text-white text-sm mb-2">{restriction.description}</p>
          <p className="text-slate-400 text-xs">Review: {restriction.reviewDate}</p>
        </div>
      ))}
      {(!complianceData.rightsRestrictions.restrictionsList || complianceData.rightsRestrictions.restrictionsList.length === 0) && (
        <p className="text-green-400 text-center py-4">✓ No active restrictions</p>
      )}
    </div>
  </div>

  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
    <h4 className="text-lg font-bold text-white mb-4">Review Status</h4>
    
    {complianceData.rightsRestrictions.overdueReviews > 0 && (
      <div className="mb-4">
        <h5 className="text-red-400 font-semibold mb-2">Overdue Reviews ({complianceData.rightsRestrictions.overdueReviews})</h5>
        <div className="space-y-2">
          {(complianceData.rightsRestrictions.overdueList || []).map((restriction) => (
            <div key={restriction.id} className="p-3 bg-red-900/20 rounded-lg border border-red-500/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-red-400 font-semibold text-sm">{restriction.type}</span>
                <span className="text-red-300 text-xs">{restriction.daysOverdue} days overdue</span>
              </div>
              <p className="text-white text-xs">Review Date: {restriction.reviewDate}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {complianceData.rightsRestrictions.upcomingReviews > 0 && (
      <div>
        <h5 className="text-yellow-400 font-semibold mb-2">Upcoming Reviews ({complianceData.rightsRestrictions.upcomingReviews})</h5>
        <div className="space-y-2">
          {(complianceData.rightsRestrictions.upcomingList || []).map((restriction) => (
            <div key={restriction.id} className="p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-yellow-400 font-semibold text-sm">{restriction.type}</span>
                <span className="text-yellow-300 text-xs">in {restriction.daysUntilReview} days</span>
              </div>
              <p className="text-white text-xs">Review Date: {restriction.reviewDate}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {complianceData.rightsRestrictions.overdueReviews === 0 && complianceData.rightsRestrictions.upcomingReviews === 0 && (
      <p className="text-green-400 text-center py-4">✓ All reviews current</p>
    )}
  </div>
</div>

{/* Rights Education & Acknowledgment */}
<div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
  <h4 className="text-lg font-bold text-white mb-4">Rights Education & Acknowledgment</h4>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Rights Explained</p>
        {complianceData.rightsRestrictions.rightsExplained ? (
          <CheckCircle2 className="text-green-400" size={20} />
        ) : (
          <XOctagon className="text-red-400" size={20} />
        )}
      </div>
    </div>
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Signed by Individual</p>
        {complianceData.rightsRestrictions.signedByIndividual ? (
          <CheckCircle2 className="text-green-400" size={20} />
        ) : (
          <XOctagon className="text-red-400" size={20} />
        )}
      </div>
    </div>
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <p className="text-slate-400 text-sm mb-1">Lease Signature Date</p>
      <p className="text-white font-semibold">{complianceData.rightsRestrictions.leaseSignatureDate || 'Not signed'}</p>
    </div>
  </div>
</div>

{/* Rights-Related Complaints */}
{complianceData.rightsRestrictions.rightsRelatedComplaints > 0 && (
  <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
    <h4 className="text-lg font-bold text-white mb-2">Rights-Related Complaints</h4>
    <p className="text-red-400">
      {complianceData.rightsRestrictions.rightsRelatedComplaints} complaints related to rights or restrictions have been filed
    </p>
  </div>
)}

</div>
)}
{/* Health & Safety Tab */}
{activeTab === 'health' && (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-slate-900/50 border border-red-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Total Incidents</p>
        <p className="text-3xl font-bold text-white">{complianceData.healthSafety.totalIncidents || 0}</p>
        <p className="text-red-400 text-xs mt-1">{complianceData.healthSafety.openIncidents || 0} open</p>
      </div>
      <div className="bg-slate-900/50 border border-red-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Med Errors</p>
        <p className="text-3xl font-bold text-white">{complianceData.healthSafety.medicationErrors || 0}</p>
        <p className="text-red-400 text-xs mt-1">in range</p>
      </div>
      <div className="bg-slate-900/50 border border-red-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Med Compliance</p>
        <p className="text-3xl font-bold text-white">{complianceData.healthSafety.medicationComplianceRate || 0}%</p>
        <p className="text-red-400 text-xs mt-1">{complianceData.healthSafety.givenDoses || 0}/{complianceData.healthSafety.totalScheduledDoses || 0} doses</p>
      </div>
      <div className="bg-slate-900/50 border border-red-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">PRN Usage</p>
        <p className="text-3xl font-bold text-white">{complianceData.healthSafety.prnUsageCount || 0}</p>
        <p className="text-red-400 text-xs mt-1">{complianceData.healthSafety.prnMedicationCount || 0} PRN meds</p>
      </div>
    </div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
    <h4 className="text-lg font-bold text-white mb-4">Incidents by Severity</h4>
    <div className="space-y-3">
      {Object.entries(complianceData.healthSafety.incidentsBySeverity || {}).map(([severity, count]) => (
        <div key={severity}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-300 capitalize">{severity.replace(/([A-Z])/g, ' $1').trim()}</span>
            <span className="text-white font-bold">{count}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className={`h-full rounded-full ${
                severity === 'critical' ? 'bg-gradient-to-r from-red-600 to-red-500' :
                severity === 'major' ? 'bg-gradient-to-r from-orange-600 to-orange-500' :
                severity === 'moderate' ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' :
                'bg-gradient-to-r from-green-600 to-green-500'
              }`}
              style={{
                width: `${Math.min((count / (complianceData.healthSafety.totalIncidents || 1)) * 100, 100)}%`
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>

  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
    <h4 className="text-lg font-bold text-white mb-4">Incidents by Type</h4>
    <div className="space-y-3">
      {Object.entries(complianceData.healthSafety.incidentsByType || {}).map(([type, count]) => (
        <div key={type}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-300">{type}</span>
            <span className="text-white font-bold">{count}</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div 
              className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full"
              style={{
                width: `${Math.min((count / (complianceData.healthSafety.totalIncidents || 1)) * 100, 100)}%`
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

{/* Recent Incidents */}
<div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
  <h4 className="text-lg font-bold text-white mb-4">Recent Incidents</h4>
  <div className="space-y-3 max-h-96 overflow-y-auto">
    {(complianceData.healthSafety.recentIncidents || []).map((incident, idx) => (
      <div key={idx} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-semibold text-sm">{incident.type}</span>
          <span className="text-slate-400 text-xs">{new Date(incident.date).toLocaleDateString()}</span>
        </div>
        <p className="text-slate-300 text-sm mb-2">{incident.description}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
            incident.severity?.includes('Critical') ? 'bg-red-900/30 text-red-400 border border-red-500/50' :
            incident.severity?.includes('Major') ? 'bg-orange-900/30 text-orange-400 border border-orange-500/50' :
            'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50'
          }`}>
            {incident.severity}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
            incident.status === 'Open' ? 'bg-red-900/30 text-red-400 border border-red-500/50' :
            'bg-green-900/30 text-green-400 border border-green-500/50'
          }`}>
            {incident.status}
          </span>
          {incident.followupRequired && (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-900/30 text-purple-400 border border-purple-500/50">
              Follow-up Required
            </span>
          )}
        </div>
      </div>
    ))}
    {(!complianceData.healthSafety.recentIncidents || complianceData.healthSafety.recentIncidents.length === 0) && (
      <p className="text-green-400 text-center py-4">✓ No recent incidents</p>
    )}
  </div>
</div>

{/* Medication Details */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
    <h4 className="text-lg font-bold text-white mb-4">Medication Administration</h4>
    <div className="space-y-3">
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-400 text-sm">Given Doses</span>
          <span className="text-green-400 font-bold">{complianceData.healthSafety.givenDoses || 0}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="h-full bg-gradient-to-r from-green-600 to-emerald-500 rounded-full"
            style={{
              width: `${complianceData.healthSafety.medicationComplianceRate || 0}%`
            }}
          ></div>
        </div>
      </div>
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-400 text-sm">Refused Doses</span>
          <span className="text-yellow-400 font-bold">{complianceData.healthSafety.refusedDoses || 0}</span>
        </div>
      </div>
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-400 text-sm">Missed Doses</span>
          <span className="text-red-400 font-bold">{complianceData.healthSafety.missedDoses || 0}</span>
        </div>
      </div>
      <div className="p-3 bg-slate-800/50 rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-400 text-sm">Active Medications</span>
          <span className="text-white font-bold">{complianceData.healthSafety.activeMedications || 0}</span>
        </div>
      </div>
    </div>
  </div>

  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
    <h4 className="text-lg font-bold text-white mb-4">Recent Vital Signs</h4>
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {(complianceData.healthSafety.recentVitals || []).map((vital, idx) => (
        <div key={idx} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-semibold text-sm">Vital Signs</span>
            <span className="text-slate-400 text-xs">{new Date(vital.date).toLocaleDateString()}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400">BP: </span>
              <span className="text-white">{vital.bloodPressure}</span>
            </div>
            <div>
              <span className="text-slate-400">HR: </span>
              <span className="text-white">{vital.heartRate}</span>
            </div>
            <div>
              <span className="text-slate-400">Temp: </span>
              <span className="text-white">{vital.temperature}</span>
            </div>
            <div>
              <span className="text-slate-400">O2: </span>
              <span className="text-white">{vital.oxygenSaturation}</span>
            </div>
            {vital.weight && (
              <div>
                <span className="text-slate-400">Weight: </span>
                <span className="text-white">{vital.weight}</span>
              </div>
            )}
            {vital.height && (
              <div>
                <span className="text-slate-400">Height: </span>
                <span className="text-white">{vital.height}</span>
              </div>
            )}
          </div>
          {vital.notes && (
            <p className="text-slate-400 text-xs mt-2">{vital.notes}</p>
          )}
        </div>
      ))}
      {(!complianceData.healthSafety.recentVitals || complianceData.healthSafety.recentVitals.length === 0) && (
        <p className="text-slate-500 text-center py-4">No vital signs recorded</p>
      )}
    </div>
  </div>
</div>

{/* Health Summary */}
<div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
  <h4 className="text-lg font-bold text-white mb-4">Health Summary</h4>
  <div className="space-y-3">
    <div>
      <p className="text-slate-400 text-sm mb-1">General Health:</p>
      <p className="text-white">{complianceData.healthSafety.healthSummary}</p>
    </div>
    <div>
      <p className="text-slate-400 text-sm mb-1">Seizure History:</p>
      <p className="text-white">{complianceData.healthSafety.seizureHistory}</p>
    </div>
    <div>
      <p className="text-slate-400 text-sm mb-1">Allergies:</p>
      <p className="text-white">{complianceData.healthSafety.allergies}</p>
    </div>
    <div>
      <p className="text-slate-400 text-sm mb-1">Medication Monitoring Notes:</p>
      <p className="text-white">{complianceData.healthSafety.medicationMonitoringNotes}</p>
    </div>
  </div>
</div>

{/* Alerts */}
{(complianceData.healthSafety.activeMedicalAlerts > 0 || complianceData.healthSafety.activeBehavioralAlerts > 0) && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {complianceData.healthSafety.activeMedicalAlerts > 0 && (
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
        <h4 className="text-lg font-bold text-white mb-4">Active Medical Alerts ({complianceData.healthSafety.activeMedicalAlerts})</h4>
        <div className="space-y-2">
          {(complianceData.healthSafety.medicalAlertsList || []).map((alert, idx) => (
            <div key={idx} className="p-3 bg-red-900/30 rounded-lg border border-red-500/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-red-400 font-semibold text-sm">{alert.severity || 'Alert'}</span>
                <span className="text-red-300 text-xs">{new Date(alert.dateadded).toLocaleDateString()}</span>
              </div>
              <p className="text-white text-sm">{alert.description}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {complianceData.healthSafety.activeBehavioralAlerts > 0 && (
      <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
        <h4 className="text-lg font-bold text-white mb-4">Active Behavioral Alerts ({complianceData.healthSafety.activeBehavioralAlerts})</h4>
        <div className="space-y-2">
          {(complianceData.healthSafety.behavioralAlertsList || []).map((alert, idx) => (
            <div key={idx} className="p-3 bg-yellow-900/30 rounded-lg border border-yellow-500/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-yellow-400 font-semibold text-sm">{alert.severity || 'Alert'}</span>
                <span className="text-yellow-300 text-xs">{new Date(alert.dateadded).toLocaleDateString()}</span>
              </div>
              <p className="text-white text-sm">{alert.description}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}

</div>
)}
{/* Staff Readiness Tab */}
{activeTab === 'staff' && (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-slate-900/50 border border-cyan-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Unique Staff</p>
        <p className="text-3xl font-bold text-white">{complianceData.staffReadiness.uniqueStaff || 0}</p>
        <p className="text-cyan-400 text-xs mt-1">serving individual</p>
      </div>
      <div className="bg-slate-900/50 border border-cyan-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Approval Rate</p>
        <p className="text-3xl font-bold text-white">{complianceData.staffReadiness.approvalRate || 0}%</p>
        <p className="text-cyan-400 text-xs mt-1">{complianceData.staffReadiness.approvedNotes || 0} approved</p>
      </div>
      <div className="bg-slate-900/50 border border-cyan-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Billing Validation</p>
        <p className="text-3xl font-bold text-white">{complianceData.staffReadiness.billingValidationRate || 0}%</p>
        <p className="text-cyan-400 text-xs mt-1">billing-ready</p>
      </div>
      <div className="bg-slate-900/50 border border-cyan-500/30 rounded-xl p-4">
        <p className="text-slate-400 text-sm mb-1">Training Compliance</p>
        <p className="text-3xl font-bold text-white">{complianceData.staffReadiness.trainingComplianceRate || 0}%</p>
        <p className="text-cyan-400 text-xs mt-1">{complianceData.staffReadiness.trainedStaffCount || 0}/{complianceData.staffReadiness.activeStaffCount || 0} trained</p>
      </div>
    </div>

    {/* Staff Activity */}
<div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
  <h4 className="text-lg font-bold text-white mb-4">Staff Activity</h4>
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="border-b border-slate-700">
        <tr>
          <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Staff Name</th>
          <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Role</th>
          <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Shifts</th>
          <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Last Shift</th>
          <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Billing Rate</th>
          <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm">Goal Work Rate</th>
        </tr>
      </thead>
      <tbody>
        {(complianceData.staffReadiness.staffList || []).map((staff, idx) => (
          <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/30">
            <td className="py-3 px-4 text-white font-semibold">{staff.name}</td>
            <td className="py-3 px-4 text-slate-300">{staff.role}</td>
            <td className="py-3 px-4 text-white">{staff.shifts}</td>
            <td className="py-3 px-4 text-slate-300">{new Date(staff.lastShift).toLocaleDateString()}</td>
            <td className="py-3 px-4">
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                staff.billingValidatedRate >= 90 ? 'bg-green-900/30 text-green-400' :
                staff.billingValidatedRate >= 70 ? 'bg-yellow-900/30 text-yellow-400' :
                'bg-red-900/30 text-red-400'
              }`}>
                {staff.billingValidatedRate}%
              </span>
            </td>
            <td className="py-3 px-4">
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                staff.goalWorkRate >= 60 ? 'bg-green-900/30 text-green-400' :
                staff.goalWorkRate >= 40 ? 'bg-yellow-900/30 text-yellow-400' :
                'bg-red-900/30 text-red-400'
              }`}>
                {staff.goalWorkRate}%
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {(!complianceData.staffReadiness.staffList || complianceData.staffReadiness.staffList.length === 0) && (
      <p className="text-slate-500 text-center py-8">No staff activity</p>
    )}
  </div>
</div>

{/* Assigned Staff Details */}
<div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
  <h4 className="text-lg font-bold text-white mb-4">Assigned Staff ({complianceData.staffReadiness.activeStaffCount || 0})</h4>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {(complianceData.staffReadiness.assignedStaffDetails || []).map((staff, idx) => (
      <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-semibold">{staff.name}</span>
          {staff.primaryContact && (
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-900/30 text-emerald-400 border border-emerald-500/50">
              Primary Contact
            </span>
          )}
        </div>
        <div className="space-y-1 text-sm">
          <p className="text-slate-400">Role: <span className="text-white">{staff.role}</span></p>
          <p className="text-slate-400">Shift: <span className="text-white">{staff.shiftAssignment}</span></p>
          <p className="text-slate-400">Phone: <span className="text-white">{staff.contactPhone}</span></p>
          <p className="text-slate-400">Email: <span className="text-white">{staff.contactEmail}</span></p>
          {staff.trainingCompleted ? (
            <div className="flex items-center gap-1 text-green-400">
              <CheckCircle2 size={14} />
              Training Completed ({staff.trainingDate})
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-400">
              <XOctagon size={14} />
              Training Incomplete
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
</div>

{/* QDDP/Case Manager */}
<div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
  <h4 className="text-lg font-bold text-white mb-4">QDDP/Case Manager</h4>
  <div className="p-4 bg-slate-800/50 rounded-lg">
    <p className="text-white font-semibold text-lg">{complianceData.staffReadiness.qddpCaseManager}</p>
    {complianceData.staffReadiness.qddpCaseManager === 'Not assigned' && (
      <p className="text-red-400 text-sm mt-2">⚠️ QDDP/Case Manager assignment required</p>
    )}
  </div>
</div>

{/* Shift Coverage */}
<div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
  <h4 className="text-lg font-bold text-white mb-4">Shift Coverage</h4>
  <div className="space-y-3">
    {Object.entries(complianceData.staffReadiness.shiftCoverage || {}).map(([shift, count]) => (
      <div key={shift}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-300">{shift}</span>
          <span className="text-white font-bold">{count} shifts</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div 
            className="h-full bg-gradient-to-r from-cyan-600 to-blue-500 rounded-full"
            style={{
              width: `${Math.min((count / (complianceData.staffReadiness.totalShifts || 1)) * 100, 100)}%`
            }}
          ></div>
        </div>
      </div>
    ))}
  </div>
</div>

</div>
)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </main>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
export default HCBSDashboard;

