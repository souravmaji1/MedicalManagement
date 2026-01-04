'use client'

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Edit2, Plus, Trash2, Calendar, Target, 
  AlertCircle, Shield, Heart, Activity, FileText, Users,
  Clock, CheckCircle, XCircle, ChevronRight, ChevronDown,
  Home as HomeIcon, Phone, Mail, MapPin, User, Loader2,
  Award, TrendingUp, AlertTriangle, Info, Lock
} from 'lucide-react';
import { ScrollArea } from "../../../components/ui/scroll-area";
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useUserProfile } from '../../../contexts/UserProfileContext';
import { PERMISSIONS } from '../../../utils/permissions';

const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const IndividualProfilePage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const individualId = params?.id;
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();

  const [individual, setIndividual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    outcomes: true,
    goals: true,
    risks: false,
    alerts: false
  });

  // Permission checks
  const canViewProfile = hasAnyPermission([
    PERMISSIONS.DAILY_NOTES_VIEW,
    PERMISSIONS.DAILY_NOTES_CREATE,
    PERMISSIONS.PLANS_VIEW,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canEditBasicInfo = hasAnyPermission([
    PERMISSIONS.PLANS_EDIT,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canEditPlans = hasAnyPermission([
    PERMISSIONS.PLANS_CREATE,
    PERMISSIONS.PLANS_EDIT,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canViewPlans = hasAnyPermission([
    PERMISSIONS.PLANS_VIEW,
    PERMISSIONS.PLANS_CREATE,
    PERMISSIONS.PLANS_EDIT,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canManageRisks = hasAnyPermission([
    PERMISSIONS.PLANS_EDIT,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canManageAlerts = hasAnyPermission([
    PERMISSIONS.INCIDENTS_CREATE,
    PERMISSIONS.PLANS_EDIT,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  // Form state - matches all fields from the add modal
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
    medicaidnumber: '',
    emergencycontact: '',
    allergies: '',
    notes: '',
    outcomes: [],
    goals: [],
    riskplans: [],
    medicalalerts: [],
    behavioralalerts: [],
    rightsrestrictions: [],
    hcbsdomains: [],
    effectivedate: '',
    nextreviewdate: '',
    qidpnotes: ''
  });

  // Fetch individual data
  useEffect(() => {
    if (isLoaded && user && individualId && !profileLoading && userProfile) {
      if (canViewProfile) {
        fetchIndividual();
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, user, individualId, profileLoading, userProfile]);

  // Check if edit mode was requested via URL parameter
  useEffect(() => {
    const editParam = searchParams?.get('edit');
    if (editParam === 'true' && canEditBasicInfo) {
      setIsEditing(true);
    }
  }, [searchParams, canEditBasicInfo]);

  const fetchIndividual = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('individuals')
        .select('*')
        .eq('id', individualId);

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

      const { data, error } = await query.single();

      if (error) throw error;
      
      if (data) {
        setIndividual(data);
        setFormData({
          ...data,
          outcomes: data.outcomes || [],
          goals: data.goals || [],
          riskplans: data.riskplans || [],
          medicalalerts: data.medicalalerts || [],
          behavioralalerts: data.behavioralalerts || [],
          rightsrestrictions: data.rightsrestrictions || [],
          hcbsdomains: data.hcbsdomains || []
        });
      }
    } catch (error) {
      console.error('Error fetching individual:', error);
      alert('Error loading individual data or you do not have permission to view this individual.');
      router.push('/individuals');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!canEditBasicInfo) {
      alert('You do not have permission to edit this individual.');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase
        .from('individuals')
        .update({
          ...formData,
          last_activity: new Date().toISOString(),
          updated_by: userProfile.fullname,
          updated_by_role: userProfile.role_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', individualId);

      if (error) throw error;

      setIndividual(formData);
      setIsEditing(false);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Outcome Management
  const addOutcome = () => {
    if (!canEditPlans) {
      alert('You do not have permission to add outcomes.');
      return;
    }
    const newOutcome = {
      id: Date.now().toString(),
      description: '',
      targetdate: '',
      status: 'In Progress',
      hcbsdomain: '',
      createddate: new Date().toISOString(),
      createdby: userProfile.fullname
    };
    setFormData(prev => ({
      ...prev,
      outcomes: [...prev.outcomes, newOutcome]
    }));
  };

  const updateOutcome = (id, field, value) => {
    if (!canEditPlans) return;
    setFormData(prev => ({
      ...prev,
      outcomes: prev.outcomes.map(outcome => 
        outcome.id === id ? { ...outcome, [field]: value } : outcome
      )
    }));
  };

  const deleteOutcome = (id) => {
    if (!canEditPlans) {
      alert('You do not have permission to delete outcomes.');
      return;
    }
    if (confirm('Are you sure you want to delete this outcome?')) {
      setFormData(prev => ({
        ...prev,
        outcomes: prev.outcomes.filter(outcome => outcome.id !== id)
      }));
    }
  };

  // Goal Management
  const addGoal = () => {
    if (!canEditPlans) {
      alert('You do not have permission to add goals.');
      return;
    }
    const newGoal = {
      id: Date.now().toString(),
      description: '',
      outcomeid: '',
      targetdate: '',
      frequency: 'Daily',
      status: 'Active',
      progress: 0,
      hcbsdomain: '',
      createddate: new Date().toISOString(),
      createdby: userProfile.fullname
    };
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal]
    }));
  };

  const updateGoal = (id, field, value) => {
    if (!canEditPlans) return;
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.map(goal => 
        goal.id === id ? { ...goal, [field]: value } : goal
      )
    }));
  };

  const deleteGoal = (id) => {
    if (!canEditPlans) {
      alert('You do not have permission to delete goals.');
      return;
    }
    if (confirm('Are you sure you want to delete this goal?')) {
      setFormData(prev => ({
        ...prev,
        goals: prev.goals.filter(goal => goal.id !== id)
      }));
    }
  };

  // Risk Plan Management
  const addRiskPlan = () => {
    if (!canManageRisks) {
      alert('You do not have permission to add risk plans.');
      return;
    }
    const newRisk = {
      id: Date.now().toString(),
      risktype: '',
      description: '',
      interventions: '',
      responsiblestaff: '',
      reviewdate: '',
      status: 'Active',
      createddate: new Date().toISOString(),
      createdby: userProfile.fullname
    };
    setFormData(prev => ({
      ...prev,
      riskplans: [...prev.riskplans, newRisk]
    }));
  };

  const updateRiskPlan = (id, field, value) => {
    if (!canManageRisks) return;
    setFormData(prev => ({
      ...prev,
      riskplans: prev.riskplans.map(risk => 
        risk.id === id ? { ...risk, [field]: value } : risk
      )
    }));
  };

  const deleteRiskPlan = (id) => {
    if (!canManageRisks) {
      alert('You do not have permission to delete risk plans.');
      return;
    }
    if (confirm('Are you sure you want to delete this risk plan?')) {
      setFormData(prev => ({
        ...prev,
        riskplans: prev.riskplans.filter(risk => risk.id !== id)
      }));
    }
  };

  // Alert Management
  const addAlert = (type) => {
    if (!canManageAlerts) {
      alert('You do not have permission to add alerts.');
      return;
    }
    const newAlert = {
      id: Date.now().toString(),
      description: '',
      severity: 'Medium',
      dateadded: new Date().toISOString(),
      status: 'Active',
      addedby: userProfile.fullname
    };
    
    if (type === 'medical') {
      setFormData(prev => ({
        ...prev,
        medicalalerts: [...prev.medicalalerts, newAlert]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        behavioralalerts: [...prev.behavioralalerts, newAlert]
      }));
    }
  };

  const updateAlert = (type, id, field, value) => {
    if (!canManageAlerts) return;
    const fieldName = type === 'medical' ? 'medicalalerts' : 'behavioralalerts';
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map(alert => 
        alert.id === id ? { ...alert, [field]: value } : alert
      )
    }));
  };

  const deleteAlert = (type, id) => {
    if (!canManageAlerts) {
      alert('You do not have permission to delete alerts.');
      return;
    }
    if (confirm('Are you sure you want to delete this alert?')) {
      const fieldName = type === 'medical' ? 'medicalalerts' : 'behavioralalerts';
      setFormData(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].filter(alert => alert.id !== id)
      }));
    }
  };

  // Permission Check - No Access Screen
  if (!profileLoading && !canViewProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
          <p className="text-slate-400 mb-6">
            You do not have permission to view individual profiles. Please contact your administrator if you believe this is an error.
          </p>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-400">Your Current Role:</p>
            <p className="text-lg font-bold text-emerald-400 mt-1">{userProfile?.role_name}</p>
            <p className="text-sm text-slate-500 mt-2">Division: {userProfile?.division}</p>
          </div>
          <button
            onClick={() => router.push('/individuals')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded || loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading individual profile...</p>
        </div>
      </div>
    );
  }

  if (!individual) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-2">Individual not found</p>
          <p className="text-slate-500 text-sm mb-6">This individual may not exist or you may not have permission to view them.</p>
          <button
            onClick={() => router.push('/individuals')}
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
          >
            Back to Individuals
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User, permission: canViewProfile },
    { id: 'person-centered-plan', label: 'Person-Centered Plan', icon: FileText, permission: canViewPlans },
    { id: 'goals', label: 'Goals & Outcomes', icon: Target, permission: canViewPlans },
    { id: 'risks', label: 'Risk Management', icon: Shield, permission: canManageRisks || canViewPlans },
    { id: 'alerts', label: 'Alerts & Restrictions', icon: AlertTriangle, permission: canManageAlerts || canViewPlans }
  ].filter(tab => tab.permission);

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/individuals')}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">
                {formData.firstname} {formData.lastname}
              </h1>
              <p className="text-slate-400 mt-1">ID: {formData.individualid}</p>
              {!canEditBasicInfo && (
                <div className="flex items-center gap-2 mt-2">
                  <Lock size={14} className="text-slate-500" />
                  <span className="text-xs text-slate-500">Read-only access</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ ...individual });
                  }}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              canEditBasicInfo && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all"
                >
                  <Edit2 size={18} />
                  Edit Profile
                </button>
              )
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-emerald-400" size={24} />
              <span className="text-2xl font-bold text-white">{formData.compliance_score || 100}%</span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Compliance Score</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="text-blue-400" size={24} />
              <span className="text-2xl font-bold text-white">{formData.goals?.length || 0}</span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Active Goals</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Award className="text-purple-400" size={24} />
              <span className="text-2xl font-bold text-white">{formData.outcomes?.length || 0}</span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Outcomes</p>
          </div>
          <div className="bg-gradient-to-br from-orange-600/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="text-orange-400" size={24} />
              <span className="text-2xl font-bold text-white">
                {(formData.medicalalerts?.length || 0) + (formData.behavioralalerts?.length || 0)}
              </span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Active Alerts</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-2 flex gap-2 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="pr-4">
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                      <User size={20} />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">First Name</label>
                        <input
                          type="text"
                          name="firstname"
                          value={formData.firstname}
                          onChange={handleInputChange}
                          disabled={!isEditing || !canEditBasicInfo}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Last Name</label>
                        <input
                          type="text"
                          name="lastname"
                          value={formData.lastname}
                          onChange={handleInputChange}
                          disabled={!isEditing || !canEditBasicInfo}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Individual ID</label>
                        <input
                          type="text"
                          name="individualid"
                          value={formData.individualid}
                          onChange={handleInputChange}
                          disabled={!isEditing || !canEditBasicInfo}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Date of Birth</label>
                        <input
                          type="date"
                          name="dateofbirth"
                          value={formData.dateofbirth}
                          onChange={handleInputChange}
                          disabled={!isEditing || !canEditBasicInfo}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          disabled={!isEditing || !canEditBasicInfo}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing || !canEditBasicInfo}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing || !canEditBasicInfo}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location & Assignment */}
                  <div>
                    <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                      <HomeIcon size={20} />
                      Location & Assignment
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Home Assignment</label>
                        <input
                          type="text"
                          name="homeassignment"
                          value={formData.homeassignment}
                          onChange={handleInputChange}
                          disabled={!isEditing || !canEditBasicInfo}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          disabled={!isEditing || !canEditBasicInfo}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Admission Date</label>Continue14:15<input
type="date"
name="admissiondate"
value={formData.admissiondate}
onChange={handleInputChange}
disabled={!isEditing || !canEditBasicInfo}
className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
/>
</div>
<div>
<label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
<select
name="status"
value={formData.status}
onChange={handleInputChange}
disabled={!isEditing || !canEditBasicInfo}
className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
>
<option value="Active">Active</option>
<option value="Review">Review</option>
<option value="Inactive">Inactive</option>
</select>
</div>
</div>
</div>
              {/* Medical Information */}
              <div>
                <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <Heart size={20} />
                  Medical Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Primary Diagnosis</label>
                    <input
                      type="text"
                      name="primarydiagnosis"
                      value={formData.primarydiagnosis}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Medicaid Number</label>
                    <input
                      type="text"
                      name="medicaidnumber"
                      value={formData.medicaidnumber}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all font-mono"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Allergies</label>
                    <input
                      type="text"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Guardian Information */}
              <div>
                <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <Shield size={20} />
                  Guardian & Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Guardian Name</label>
                    <input
                      type="text"
                      name="guardianname"
                      value={formData.guardianname}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Guardian Phone</label>
                    <input
                      type="tel"
                      name="guardianphone"
                      value={formData.guardianphone}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Guardian Email</label>
                    <input
                      type="email"
                      name="guardianemail"
                      value={formData.guardianemail}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Emergency Contact</label>
                    <input
                      type="text"
                      name="emergencycontact"
                      value={formData.emergencycontact}
                      onChange={handleInputChange}
                      disabled={!isEditing || !canEditBasicInfo}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <h3 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Additional Notes
                </h3>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  disabled={!isEditing || !canEditBasicInfo}
                  rows="4"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* Person-Centered Plan Tab */}
          {activeTab === 'person-centered-plan' && (
            <div className="space-y-6">
              {!canViewPlans ? (
                <div className="text-center py-16">
                  <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
                  <p className="text-slate-500">You do not have permission to view person-centered plans.</p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-white mb-4">Person-Centered Plan Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Effective Date</label>
                        <input
                          type="date"
                          name="effectivedate"
                          value={formData.effectivedate}
                          onChange={handleInputChange}
                          disabled={!isEditing || !canEditPlans}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Next Review Date</label>
                        <input
                          type="date"
                          name="nextreviewdate"
                          value={formData.nextreviewdate}
                          onChange={handleInputChange}
                          disabled={!isEditing || !canEditPlans}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-400 mb-2">QIDP Notes</label>
                        <textarea
                          name="qidpnotes"
                          value={formData.qidpnotes}
                          onChange={handleInputChange}
                          disabled={!isEditing || !canEditPlans}
                          rows="4"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* HCBS Domains */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-white mb-4">HCBS Compliance Domains</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Community Integration', 'Choice & Control', 'Rights', 'Privacy', 'Dignity & Respect', 'Person-Centered'].map(domain => (
                        <div
                          key={domain}
                          className={`p-4 border rounded-lg transition-all ${
                            formData.hcbsdomains?.includes(domain)
                              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                              : 'bg-slate-700/30 border-slate-600 text-slate-400'
                          } ${(isEditing && canEditPlans) ? 'cursor-pointer hover:border-slate-500' : 'cursor-not-allowed opacity-70'}`}
                          onClick={() => {
                            if (!isEditing || !canEditPlans) return;
                            setFormData(prev => ({
                              ...prev,
                              hcbsdomains: prev.hcbsdomains?.includes(domain)
                                ? prev.hcbsdomains.filter(d => d !== domain)
                                : [...(prev.hcbsdomains || []), domain]
                            }));
                          }}
                        >
                          <p className="text-sm font-semibold text-center">{domain}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Goals & Outcomes Tab */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              {!canViewPlans ? (
                <div className="text-center py-16">
                  <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
                  <p className="text-slate-500">You do not have permission to view goals and outcomes.</p>
                </div>
              ) : (
                <>
                  {/* Outcomes Section */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Award className="text-purple-400" size={24} />
                        Outcomes
                      </h3>
                      {isEditing && canEditPlans && (
                        <button
                          onClick={addOutcome}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
                        >
                          <Plus size={16} />
                          Add Outcome
                        </button>
                      )}
                    </div>

                    {formData.outcomes?.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Award className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p>No outcomes defined yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.outcomes?.map((outcome) => (
                          <div key={outcome.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                                <textarea
                                  value={outcome.description}
                                  onChange={(e) => updateOutcome(outcome.id, 'description', e.target.value)}
                                  disabled={!isEditing || !canEditPlans}
                                  rows="2"
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all resize-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Target Date</label>
                                <input
                                  type="date"
                                  value={outcome.targetdate}
                                  onChange={(e) => updateOutcome(outcome.id, 'targetdate', e.target.value)}
                                  disabled={!isEditing || !canEditPlans}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                                <select
                                  value={outcome.status}
                                  onChange={(e) => updateOutcome(outcome.id, 'status', e.target.value)}
                                  disabled={!isEditing || !canEditPlans}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all"
                                >
                                  <option value="In Progress">In Progress</option>
                                  <option value="Achieved">Achieved</option>
                                  <option value="On Hold">On Hold</option>
                                  <option value="Discontinued">Discontinued</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">HCBS Domain</label>
                                <select
                                  value={outcome.hcbsdomain}
                                  onChange={(e) => updateOutcome(outcome.id, 'hcbsdomain', e.target.value)}
                                  disabled={!isEditing || !canEditPlans}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-all"
                                >
                                  <option value="">Select Domain</option>
                                  <option value="Community Integration">Community Integration</option>
                                  <option value="Choice & Control">Choice & Control</option>
                                  <option value="Rights">Rights</option>
                                  <option value="Privacy">Privacy</option>
                                  <option value="Dignity & Respect">Dignity & Respect</option>
                                  <option value="Person-Centered">Person-Centered</option>
                                </select>
                              </div>
                              {isEditing && canEditPlans && (
                                <div className="flex items-end">
                                  <button
                                    onClick={() => deleteOutcome(outcome.id)}
                                    className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Goals Section */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Target className="text-blue-400" size={24} />
                        Goals
                      </h3>
                      {isEditing && canEditPlans && (
                        <button
                          onClick={addGoal}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
                        >
                          <Plus size={16} />
                          Add Goal
                        </button>
                      )}
                    </div>

                    {formData.goals?.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Target className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p>No goals defined yet</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {formData.goals?.map((goal) => (
                          <div key={goal.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Goal Description</label>
                                <textarea
                                  value={goal.description}
                                  onChange={(e) => updateGoal(goal.id, 'description', e.target.value)}
                                  disabled={!isEditing || !canEditPlans}
                                  rows="2"
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all resize-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Frequency</label>
                                <select
                                  value={goal.frequency}
                                  onChange={(e) => updateGoal(goal.id, 'frequency', e.target.value)}
                                  disabled={!isEditing || !canEditPlans}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                                >
                                  <option value="Daily">Daily</option>
                                  <option value="Weekly">Weekly</option>
                                  <option value="Monthly">Monthly</option>
                                  <option value="As Needed">As Needed</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Target Date</label>
                                <input
                                  type="date"
                                  value={goal.targetdate}
                                  onChange={(e) => updateGoal(goal.id, 'targetdate', e.target.value)}
                                  disabled={!isEditing || !canEditPlans}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                                <select
                                  value={goal.status}
                                  onChange={(e) => updateGoal(goal.id, 'status', e.target.value)}
                                  disabled={!isEditing || !canEditPlans}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                                >
                                  <option value="Active">Active</option>
                                  <option value="Completed">Completed</option>
                                  <option value="On Hold">On Hold</option>
                                  <option value="Discontinued">Discontinued</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Progress (%)</label>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={goal.progress}
                                  onChange={(e) => updateGoal(goal.id, 'progress', parseInt(e.target.value))}
                                  disabled={!isEditing || !canEditPlans}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-all"
                                />
                              </div>
                              {isEditing && canEditPlans && (
                                <div className="flex items-end">
                                  <button
                                    onClick={() => deleteGoal(goal.id)}
                                    className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400">Progress</span>
                                <span className="text-sm font-bold text-white">{goal.progress}%</span>
                              </div>
                              <div className="w-full bg-slate-700 rounded-full h-2">
                                <div 
                                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-300"
                                  style={{ width: `${goal.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Risk Management Tab */}
          {activeTab === 'risks' && (
            <div className="space-y-6">
              {!canManageRisks && !canViewPlans ? (
                <div className="text-center py-16">
                  <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
                  <p className="text-slate-500">You do not have permission to view risk management.</p>
                </div>
              ) : (
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Shield className="text-orange-400" size={24} />
                      Risk Plans
                    </h3>
                    {isEditing && canManageRisks && (
                      <button
                        onClick={addRiskPlan}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-all"
                      >
                        <Plus size={16} />
                        Add Risk Plan
                      </button>
                    )}
                  </div>

                  {formData.riskplans?.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <Shield className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                      <p>No risk plans defined yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.riskplans?.map((risk) => (
                        <div key={risk.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-400 mb-2">Risk Type</label>
                              <input
                                type="text"
                                value={risk.risktype}
                                onChange={(e) => updateRiskPlan(risk.id, 'risktype', e.target.value)}
                                disabled={!isEditing || !canManageRisks}
                                placeholder="e.g., Elopement, Self-Harm, Medical"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-400 mb-2">Status</label>
                              <select
                                value={risk.status}
                                onChange={(e) => updateRiskPlan(risk.id, 'status', e.target.value)}
                                disabled={!isEditing || !canManageRisks}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all"
                              >
                                <option value="Active">Active</option>
                                <option value="Under Review">Under Review</option>
                                <option value="Resolved">Resolved</option>
                              </select>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                              <textarea
                                value={risk.description}
                                onChange={(e) => updateRiskPlan(risk.id, 'description', e.target.value)}
                                disabled={!isEditing || !canManageRisks}
                                rows="2"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all resize-none"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-400 mb-2">Interventions</label>
                              <textarea
                                value={risk.interventions}
                                onChange={(e) => updateRiskPlan(risk.id, 'interventions', e.target.value)}
                                disabled={!isEditing || !canManageRisks}
                                rows="2"
                                placeholder="List interventions and strategies..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-400 mb-2">Responsible Staff</label>
                              <input
                                type="text"
                                value={risk.responsiblestaff}
                                onChange={(e) => updateRiskPlan(risk.id, 'responsiblestaff', e.target.value)}
                                disabled={!isEditing || !canManageRisks}
                                className="w-full bg-slateContinue14:17-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all"
/>
</div>
<div>
<label className="block text-sm font-medium text-slate-400 mb-2">Review Date</label>
<input
type="date"
value={risk.reviewdate}
onChange={(e) => updateRiskPlan(risk.id, 'reviewdate', e.target.value)}
disabled={!isEditing || !canManageRisks}
className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 disabled:opacity-50 transition-all"
/>
</div>
{isEditing && canManageRisks && (
<div className="md:col-span-2">
<button
onClick={() => deleteRiskPlan(risk.id)}
className="w-full px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
>
<Trash2 size={16} />
Delete Risk Plan
</button>
</div>
)}
</div>
</div>
))}
</div>
)}
</div>
)}
</div>
)}
          {/* Alerts & Restrictions Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              {!canManageAlerts && !canViewPlans ? (
                <div className="text-center py-16">
                  <Lock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-400 mb-2">Access Restricted</h3>
                  <p className="text-slate-500">You do not have permission to view alerts.</p>
                </div>
              ) : (
                <>
                  {/* Medical Alerts */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Heart className="text-red-400" size={24} />
                        Medical Alerts
                      </h3>
                      {isEditing && canManageAlerts && (
                        <button
                          onClick={() => addAlert('medical')}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                        >
                          <Plus size={16} />
                          Add Alert
                        </button>
                      )}
                    </div>

                    {formData.medicalalerts?.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Heart className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p>No medical alerts</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.medicalalerts?.map((alert) => (
                          <div key={alert.id} className="bg-slate-900/50 border border-red-500/30 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Alert Description</label>
                                <input
                                  type="text"
                                  value={alert.description}
                                  onChange={(e) => updateAlert('medical', alert.id, 'description', e.target.value)}
                                  disabled={!isEditing || !canManageAlerts}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 disabled:opacity-50 transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Severity</label>
                                <select
                                  value={alert.severity}
                                  onChange={(e) => updateAlert('medical', alert.id, 'severity', e.target.value)}
                                  disabled={!isEditing || !canManageAlerts}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 disabled:opacity-50 transition-all"
                                >
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                                  <option value="Critical">Critical</option>
                                </select>
                              </div>
                              {isEditing && canManageAlerts && (
                                <div className="md:col-span-3">
                                  <button
                                    onClick={() => deleteAlert('medical', alert.id)}
                                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all flex items-center gap-2"
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Behavioral Alerts */}
                  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-yellow-400" size={24} />
                        Behavioral Alerts
                      </h3>
                      {isEditing && canManageAlerts && (
                        <button
                          onClick={() => addAlert('behavioral')}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold transition-all"
                        >
                          <Plus size={16} />
                          Add Alert
                        </button>
                      )}
                    </div>

                    {formData.behavioralalerts?.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Activity className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                        <p>No behavioral alerts</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.behavioralalerts?.map((alert) => (
                          <div key={alert.id} className="bg-slate-900/50 border border-yellow-500/30 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Alert Description</label>
                                <input
                                  type="text"
                                  value={alert.description}
                                  onChange={(e) => updateAlert('behavioral', alert.id, 'description', e.target.value)}
                                  disabled={!isEditing || !canManageAlerts}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition-all"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Severity</label>
                                <select
                                  value={alert.severity}
                                  onChange={(e) => updateAlert('behavioral', alert.id, 'severity', e.target.value)}
                                  disabled={!isEditing || !canManageAlerts}
                                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 disabled:opacity-50 transition-all"
                                >
                                  <option value="Low">Low</option>
                                  <option value="Medium">Medium</option>
                                  <option value="High">High</option>
                                  <option value="Critical">Critical</option>
                                </select>
                              </div>
                              {isEditing && canManageAlerts && (
                                <div className="md:col-span-3">
                                  <button
                                    onClick={() => deleteAlert('behavioral', alert.id)}
                                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all flex items-center gap-2"
                                  >
                                    <Trash2 size={16} />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </ScrollArea>
    </div>
  </div>
</div>
);
};
export default IndividualProfilePage;
