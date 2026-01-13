'use client'

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { 
  Users, Shield, Heart, Activity, UserCircle, Mail, Phone,
  CheckCircle, ChevronRight, Loader2, Building2, Award
} from 'lucide-react';

const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);



const RoleSelectionFlow = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [profileData, setProfileData] = useState({
    fullname: '',
    email: '',
    phone: '',
    facility: '',
    certification: ''
  });

  const divisions = [
    {
      id: 'DD',
      name: 'Developmental Disabilities',
      icon: Users,
      color: 'from-emerald-600 to-teal-500',
      description: 'DD Residential & Day Programs'
    },
    {
      id: 'MI',
      name: 'Mental Illness',
      icon: Heart,
      color: 'from-blue-600 to-cyan-500',
      description: 'Mental Health Services'
    },
    {
      id: 'SUD',
      name: 'Substance Use Disorder',
      icon: Activity,
      color: 'from-purple-600 to-pink-500',
      description: 'Substance Abuse Treatment'
    },
    {
      id: 'PEER',
      name: 'Peer Support',
      icon: Award,
      color: 'from-orange-600 to-red-500',
      description: 'Peer Support Services'
    }
  ];

  const rolesByDivision = {
  DD: [
    { id: 'DSP_DD', name: 'Direct Support Professional (DSP)', permissions: ['daily_notes', 'adls', 'incidents', 'mar'] },
    { id: 'HouseManager_DD', name: 'House Manager', permissions: ['approve_notes', 'approve_incidents', 'approve_mar'] },
    { id: 'QDDP', name: 'QDDP/QIDP', permissions: ['plans', 'review_all', 'hcbs_dashboard'] },
    { id: 'MAS_Nurse', name: 'MAS Nurse', permissions: ['medications', 'mar_approve', 'health_tracking'] },
    { id: 'ExecDirector', name: 'Executive Director', permissions: ['full_access'] },
    { id: 'ExecPresident', name: 'Executive President', permissions: ['full_access', 'system_admin', 'all_divisions', 'financial_access', 'user_management', 'compliance_oversight', 'strategic_planning'] }
  ],
  MI: [
    { id: 'MI_Staff', name: 'Residential MI Staff', permissions: ['shift_notes', 'incidents', 'behaviors'] },
    { id: 'Therapist_MI', name: 'Therapist/Clinician', permissions: ['clinical_notes', 'treatment_plans', 'assessments'] },
    { id: 'Psychiatrist', name: 'Psychiatrist', permissions: ['med_orders', 'diagnoses', 'clinical_notes'] },
    { id: 'MI_Supervisor', name: 'Clinical Supervisor', permissions: ['approve_plans', 'review_incidents', 'reports'] },
    { id: 'MI_PeerSupport', name: 'Certified Peer Specialist', permissions: ['peer_notes', 'recovery_goals'] },
    { id: 'ExecPresident', name: 'Executive President', permissions: ['full_access', 'system_admin', 'all_divisions', 'financial_access', 'user_management', 'compliance_oversight', 'strategic_planning'] }
  ],
  SUD: [
    { id: 'SUD_Counselor', name: 'SUD Counselor', permissions: ['counseling_notes', 'asam', 'recovery_plan'] },
    { id: 'SUD_PeerSupport', name: 'Recovery Coach', permissions: ['peer_notes', 'relapse_logs'] },
    { id: 'Nurse_SUD', name: 'SUD Nurse', permissions: ['mat_tracking', 'withdrawal', 'vitals'] },
    { id: 'MAT_Staff', name: 'MAT Clinic Staff', permissions: ['mat_full', 'dose_logs'] },
    { id: 'SUD_Director', name: 'Program Director', permissions: ['approve_all', 'reports', 'admin'] },
    { id: 'ExecPresident', name: 'Executive President', permissions: ['full_access', 'system_admin', 'all_divisions', 'financial_access', 'user_management', 'compliance_oversight', 'strategic_planning'] }
  ],
  PEER: [
    { id: 'DD_PeerMentor', name: 'DD Peer Mentor', permissions: ['peer_notes', 'community_activities'] },
    { id: 'MI_CPS', name: 'MI Certified Peer Specialist', permissions: ['cps_notes', 'recovery_support'] },
    { id: 'SUD_PeerRecovery', name: 'SUD Peer Recovery Specialist', permissions: ['peer_recovery_notes', 'relapse_support'] },
    { id: 'ExecPresident', name: 'Executive President', permissions: ['full_access', 'system_admin', 'all_divisions', 'financial_access', 'user_management', 'compliance_oversight', 'strategic_planning'] }
  ]
};

  useEffect(() => {
    if (isLoaded && user) {
      checkExistingProfile();
    }
  }, [isLoaded, user]);

  const checkExistingProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single();

      if (data) {
        // Profile exists, redirect to dashboard
        router.push('/individual');
      } else {
        // No profile, show role selection
        setLoading(false);
        setProfileData({
          ...profileData,
          fullname: user.fullName || '',
          email: user.primaryEmailAddress?.emailAddress || ''
        });
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      const selectedRoleData = rolesByDivision[selectedDivision].find(r => r.id === selectedRole);

      const profilePayload = {
        clerk_user_id: user.id,
        fullname: profileData.fullname,
        email: profileData.email,
        phone: profileData.phone,
        facility: profileData.facility,
        certification: profileData.certification,
        division: selectedDivision,
        role_id: selectedRole,
        role_name: selectedRoleData.name,
        permissions: selectedRoleData.permissions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_profiles')
        .insert([profilePayload]);

      if (error) throw error;

      // Redirect to dashboard
      router.push('/individual');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-emerald-400' : 'text-slate-600'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                {step > 1 ? <CheckCircle size={20} /> : '1'}
              </div>
              <span className="text-sm font-semibold">Division</span>
            </div>
            <ChevronRight size={20} className="text-slate-600" />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-emerald-400' : 'text-slate-600'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                {step > 2 ? <CheckCircle size={20} /> : '2'}
              </div>
              <span className="text-sm font-semibold">Role</span>
            </div>
            <ChevronRight size={20} className="text-slate-600" />
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-emerald-400' : 'text-slate-600'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-emerald-600' : 'bg-slate-800'}`}>
                3
              </div>
              <span className="text-sm font-semibold">Profile</span>
            </div>
          </div>
        </div>

        {/* Step 1: Division Selection */}
        {step === 1 && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome to CareBridge Pro</h2>
            <p className="text-slate-400 mb-8">Select your division to get started</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {divisions.map(division => {
                const Icon = division.icon;
                return (
                  <button
                    key={division.id}
                    onClick={() => {
                      setSelectedDivision(division.id);
                      setStep(2);
                    }}
                    className={`p-6 border-2 rounded-xl transition-all hover:scale-105 ${
                      selectedDivision === division.id
                        ? 'border-emerald-500 bg-emerald-600/20'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${division.color} rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className="text-white" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{division.name}</h3>
                    <p className="text-slate-400 text-sm">{division.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Role Selection */}
        {step === 2 && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8">
            <button
              onClick={() => setStep(1)}
              className="text-slate-400 hover:text-white mb-4 flex items-center gap-2"
            >
              ← Back
            </button>
            <h2 className="text-3xl font-bold text-white mb-2">Select Your Role</h2>
            <p className="text-slate-400 mb-8">Choose the role that best describes your position</p>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-4">
              {rolesByDivision[selectedDivision]?.map(role => (
                <button
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role.id);
                    setStep(3);
                  }}
                  className={`w-full p-6 border-2 rounded-xl transition-all text-left hover:scale-[1.02] ${
                    selectedRole === role.id
                      ? 'border-emerald-500 bg-emerald-600/20'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-2">{role.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.slice(0, 3).map(perm => (
                          <span key={perm} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                            {perm.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <Shield className="text-emerald-400" size={24} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Profile Setup */}
        {step === 3 && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-8">
            <button
              onClick={() => setStep(2)}
              className="text-slate-400 hover:text-white mb-4 flex items-center gap-2"
            >
              ← Back
            </button>
            <h2 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h2>
            <p className="text-slate-400 mb-8">Fill in your basic information</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={profileData.fullname}
                  onChange={(e) => setProfileData({...profileData, fullname: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Facility/Location</label>
                <input
                  type="text"
                  value={profileData.facility}
                  onChange={(e) => setProfileData({...profileData, facility: e.target.value})}
                  placeholder="e.g., Oak Ridge Home"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Certification/License (if applicable)</label>
                <input
                  type="text"
                  value={profileData.certification}
                  onChange={(e) => setProfileData({...profileData, certification: e.target.value})}
                  placeholder="e.g., RN, LPN, CPS"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !profileData.fullname || !profileData.email}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Complete Setup
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSelectionFlow;