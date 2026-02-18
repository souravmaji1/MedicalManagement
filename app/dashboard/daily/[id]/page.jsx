'use client'

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Plus, Trash2, Calendar, Clock, 
  Activity, Heart, Target, Users, CheckCircle,
  AlertCircle, Edit2, Eye, Filter, Search, ClipboardCheck,
  Home as HomeIcon, Utensils, Shirt, Bath, Bed,
  Smile, Frown, Meh, MessageSquare, MapPin,
  FileText, User, Loader2, ChevronDown, ChevronRight,
  TrendingUp, Award, Brain, Sparkles, Coffee, Book,
  Music, Palette, Dumbbell, X, Copy, Shield,
  ClipboardList, CheckSquare, Stethoscope, Bell, Zap,
  RefreshCw, Wand2, ToggleLeft, ToggleRight
} from 'lucide-react';
import { ScrollArea, ScrollBar } from "../../../../components/ui/scroll-area";
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useParams } from 'next/navigation';
import { useUserProfile } from '../../../../contexts/userProfileContext';
import { PERMISSIONS } from '../../../../utils/permissions';

const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const DailyNotesPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const params = useParams();
  const individualId = params?.id;
  const { userProfile, loading: profileLoading, hasPermission, hasAnyPermission } = useUserProfile();

  const [individual, setIndividual] = useState(null);
  const [dailyNotes, setDailyNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [generatingNote, setGeneratingNote] = useState(false);
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [qaScore, setQaScore] = useState(null);
  
  // NEW: Entry mode toggle - 'ai' or 'manual'
  const [entryMode, setEntryMode] = useState('manual');

  // Permission checks
  



  // Permission checks - UPDATED TO MATCH PDF REQUIREMENTS
const canViewDailyNotes = hasAnyPermission([
  PERMISSIONS.DAILY_NOTES_VIEW,
  PERMISSIONS.DAILY_NOTES_CREATE,
  PERMISSIONS.DAILY_NOTES_EDIT,
  PERMISSIONS.DAILY_NOTES_APPROVE,
  PERMISSIONS.INDIVIDUALS_VIEW,  // Anyone who can view individuals can view daily notes
  PERMISSIONS.FULL_ACCESS
]);

const canCreateDailyNotes = hasAnyPermission([
  PERMISSIONS.DAILY_NOTES_CREATE,
  PERMISSIONS.DAILY_NOTES_EDIT,
  PERMISSIONS.DAILY_NOTES_APPROVE,
  PERMISSIONS.FULL_ACCESS
]);

const canEditDailyNotes = hasAnyPermission([
  PERMISSIONS.DAILY_NOTES_EDIT,
  PERMISSIONS.DAILY_NOTES_APPROVE,
  PERMISSIONS.FULL_ACCESS
]);

const canDeleteDailyNotes = hasAnyPermission([
  PERMISSIONS.DAILY_NOTES_DELETE,
  PERMISSIONS.DAILY_NOTES_APPROVE,
  PERMISSIONS.ADMIN,
  PERMISSIONS.FULL_ACCESS
]);

const canApproveDailyNotes = hasAnyPermission([
  PERMISSIONS.DAILY_NOTES_APPROVE,
  PERMISSIONS.FULL_ACCESS
]);

useEffect(() => {
  if (userProfile) {
    console.log('🔍 DEBUG USER PROFILE:', {
      role_id: userProfile.role_id,
      role_name: userProfile.role_name,
      facility: userProfile.facility,
      division: userProfile.division,
      permissions: userProfile.permissions
    });
  }
}, [userProfile]);

useEffect(() => {
  if (individual) {
    console.log('🏠 DEBUG INDIVIDUAL:', {
      id: individual.id,
      name: `${individual.firstname} ${individual.lastname}`,
      homeassignment: individual.homeassignment,
      division: individual.division
    });
  }
}, [individual]);

const canUserEditNote = (note) => {
  if (!note || !userProfile) return false;
  
  // Full access roles can edit anything
  if (hasPermission(PERMISSIONS.FULL_ACCESS)) return true;
  if (hasPermission(PERMISSIONS.ADMIN)) return true;
  if (userProfile.role_id === 'ExecDirector') return true;
  if (userProfile.role_id === 'SystemAdmin') return true;
  if (userProfile.role_id === 'QDDP') return true;
  
  // Billing Staff - VIEW ONLY (cannot edit)
  if (userProfile.role_id === 'BillingStaff') {
    console.log('❌ Billing Staff - view only, cannot edit');
    return false;
  }
  
  // House Manager - Can edit all DD notes
  if (userProfile.role_id === 'HouseManager_DD') {
    console.log('✅ House Manager - can edit all DD notes');
    return true;
  }
  
  // MAS Nurse - Can edit all DD notes
  if (userProfile.role_id === 'MAS_Nurse') {
    console.log('✅ MAS Nurse - can edit all DD notes');
    return true;
  }
  
  // DSP - Can ONLY edit their own notes within 24 hours
  if (userProfile.role_id === 'DSP_DD') {
    if (note.created_by === userProfile.fullname) {
      const noteDate = new Date(note.timestamp);
      const now = new Date();
      const hoursDiff = (now - noteDate) / (1000 * 60 * 60);
      const canEdit = hoursDiff <= 24;
      console.log(`DSP edit check: own note=${note.created_by === userProfile.fullname}, hours=${hoursDiff.toFixed(1)}, canEdit=${canEdit}`);
      return canEdit;
    }
    console.log('❌ DSP - can only edit own notes within 24 hours');
    return false;
  }
  
  // Intake Coordinator - Can edit
  if (userProfile.role_id === 'IntakeCoordinator') {
    return true;
  }
  
  return false;
};

const canAccessIndividual = () => {
  if (!userProfile || !individual) {
    console.log('❌ No userProfile or individual');
    return false;
  }
  
  console.log('🔐 Checking access for:', userProfile.role_id);
  
  // LEVEL 1: Super Admin Access - See EVERYTHING
  if (hasPermission(PERMISSIONS.FULL_ACCESS) || 
      hasPermission(PERMISSIONS.ADMIN) || 
      userProfile.role_id === 'ExecDirector' || 
      userProfile.role_id === 'SystemAdmin' ||
      userProfile.role_id === 'QDDP') {
    console.log('✅ Admin/Exec access granted');
    return true;
  }
  
  // LEVEL 2: Cross-Program Access - See ALL
  if (userProfile.role_id === 'BillingStaff' || 
      userProfile.role_id === 'IntakeCoordinator') {
    console.log('✅ Billing/Intake access granted');
    return true;
  }
  
  // LEVEL 3: DD Division Roles - See ALL DD individuals (NO facility restriction)
  if (userProfile.role_id === 'HouseManager_DD' || 
      userProfile.role_id === 'DSP_DD' || 
      userProfile.role_id === 'MAS_Nurse') {
    const hasAccess = individual.division === 'DD' || !individual.division;
    console.log(`🏠 DD Role check: division=${individual.division}, access=${hasAccess}`);
    return hasAccess;
  }
  
  // LEVEL 4: MI Division - See all MI individuals
  if (userProfile.division === 'MI') {
    if (userProfile.role_id === 'Residential_MI_Staff') {
      console.log('✅ Residential MI Staff - full access');
      return true;
    }
    const hasAccess = individual.division === 'MI';
    console.log(`🧠 MI staff check: ${individual.division} === MI = ${hasAccess}`);
    return hasAccess;
  }
  
  // LEVEL 5: SUD Division - See all SUD individuals
  if (userProfile.division === 'SUD') {
    const hasAccess = individual.division === 'SUD';
    console.log(`💊 SUD staff check: ${individual.division} === SUD = ${hasAccess}`);
    return hasAccess;
  }
  
  // LEVEL 6: PEER Division - See ALL
  if (userProfile.division === 'PEER') {
    console.log('✅ PEER staff - full access');
    return true;
  }
  
  console.log('❌ No access rules matched');
  return false;
};


  const defaultNoteForm = {
    date: new Date().toISOString().split('T')[0],
    shift: '1st Shift',
    shiftTimeIn: '',
    shiftTimeOut: '',
    awakeOvernight: false,
    
    staffname: user?.fullName || '',
    staffid: user?.id || '',
    
    // AI Mode specific fields
    activityType: 'SKILL_BUILDING',
    description: '',
    billingCode: 'H2023',
    
    // Manual Mode fields
    bathing: 'Independent',
    dressing: 'Independent',
    grooming: 'Independent',
    toileting: 'Independent',
    eating: 'Independent',
    mobility: 'Independent',
    
    ispGoalsNarrative: '',
    choiceAutonomyNarrative: '',
    
    activities: [],
    activitydetails: '',
    communityouting: false,
    outinglocation: '',
    outingpurpose: '',
    participationlevel: 'Full',
    
    healthChanges: '',
    noChangesBaseline: false,
    
    mood: 'Happy',
    appetite: 'Good',
    sleep: 'Good',
    
    additionalSupportsNarrative: '',
    
    medicationsAdministered: 'Yes',
    medicationsNotAdministeredReason: '',
    medicationRefusals: '',
    sideEffectsObserved: '',
    prnMedications: [],
    
    safetyIssues: false,
    safetyNarrative: '',
    incidentReportCompleted: 'Not required for this event',
    
    livingSkills: [],
    livingSkillsOther: '',
    livingSkillsNarrative: '',
    
    behaviors: [],
    behaviordetails: '',
    behaviortriggers: '',
    behaviorinterventions: '',
    
    goalsworked: [],
    goalprogress: '',
    
    transportation: '',
    narrative: '',
    
    incidentreported: false,
    incidentdetails: '',
    
    created_by: '',
    created_by_role: '',
    approved: false,
    approved_by: '',
    approved_date: '',

    aiGenerated: false,
    aiGeneratedText: '',
    qaScore: null,
    qaFlags: [],
    uniquenessHash: '',
    phraseKeysUsed: [],
    scribeAssistVersion: '1.0',

    ispGoalAddressed: false,
    selectedIspGoalId: '',
    selectedGoalDomain: '',
    
    choiceOffered: false,
    choiceHonored: false,
    choiceExercisedDescription: '',
    
    communityChoiceDocumented: false,
    linkedDailyNoteId: '',
    
    staffRole: userProfile?.role_name || '',
    electronicSignature: '',
    dateSigned: '',
    signatureConfirmed: false,
    
    documentationStatus: 'Draft',
    recordId: '',
    auditTimestamp: '',
    billingValidated: false,
    
    entryMode: 'manual', // Track which mode was used
    
    timestamp: new Date().toISOString()
  };

  const [noteForm, setNoteForm] = useState({ ...defaultNoteForm });
  const [prnMedication, setPrnMedication] = useState({
    medication: '',
    amount: '',
    time: '',
    reason: '',
    outcome: ''
  });

  const adlOptions = ['Independent', 'Verbal Prompt', 'Physical Assist', 'Total Assist', 'Refused', 'N/A'];
  const moodOptions = ['Happy', 'Calm', 'Anxious', 'Sad', 'Frustrated', 'Excited', 'Neutral'];
  const appetiteOptions = ['Good', 'Fair', 'Poor', 'Refused'];
  const sleepOptions = ['Good', 'Fair', 'Poor', 'Restless', 'N/A'];
  const participationOptions = ['Full', 'Partial', 'Refused'];
  const medicationOptions = ['Yes', 'No'];
  const incidentReportOptions = ['Yes', 'No', 'Not required for this event'];

  const activityTypes = [
    { icon: Palette, label: 'Arts & Crafts', value: 'arts-crafts' },
    { icon: Music, label: 'Music', value: 'music' },
    { icon: Book, label: 'Reading', value: 'reading' },
    { icon: Dumbbell, label: 'Exercise', value: 'exercise' },
    { icon: Coffee, label: 'Social', value: 'social' },
    { icon: MapPin, label: 'Community', value: 'community' },
    { icon: Brain, label: 'Cognitive', value: 'cognitive' },
    { icon: Users, label: 'Group Activity', value: 'group' }
  ];

  const scribeAssistActivityTypes = [
    { value: 'SKILL_BUILDING', label: 'Skill Building', icon: Brain, color: 'emerald' },
    { value: 'COMMUNITY_INTEGRATION', label: 'Community Integration', icon: MapPin, color: 'blue' },
    { value: 'EDUCATION_WORK_PREP', label: 'Education / Work Prep', icon: Book, color: 'purple' },
    { value: 'TREATMENT_SUPPORT', label: 'Treatment Support', icon: Heart, color: 'pink' }
  ];

  const behaviorTypes = [
    'Verbal Aggression',
    'Physical Aggression',
    'Self-Injury',
    'Property Destruction',
    'Elopement Attempt',
    'Refusal',
    'Anxiety',
    'Agitation',
    'Withdrawal',
    'Positive Behavior'
  ];

  const livingSkills = [
    { value: 'cooking', label: 'Cooking' },
    { value: 'cleaning', label: 'Cleaning / Chores' },
    { value: 'laundry', label: 'Laundry' },
    { value: 'money-skills', label: 'Money Skills' },
    { value: 'communication-skills', label: 'Communication Skills' },
    { value: 'personal-hygiene', label: 'Personal Hygiene' },
    { value: 'social-skills', label: 'Social Skills' },
    { value: 'community-safety', label: 'Community Safety' },
    { value: 'medication-participation', label: 'Medication Participation' }
  ];

  const billingCodes = [
    { value: 'H2023', label: 'H2023 - Residential Habilitation' },
    { value: 'T1002', label: 'T1002 - Nursing' },
    { value: 'H0043', label: 'H0043 - Supported Employment' },
    { value: 'H2014', label: 'H2014 - Skills Training' },
    { value: 'H2015', label: 'H2015 - Comprehensive Community Support' }
  ];

  // AI Note Generation Function
  const generateScribeAssistNote = async () => {
    if (!noteForm.description.trim()) {
      alert('Please provide an activity description before generating the note.');
      return;
    }

    setGeneratingNote(true);
    setAiGeneratedText('');
    setQaScore(null);

    try {
      const selectedGoal = individual.goals?.find(g => g.id === noteForm.selectedIspGoalId);
      const pcpGoalText = selectedGoal ? selectedGoal.description : 'General habilitation goals';
      
      const prompt = `You are ScribeAssist, an AI documentation engine for Medicaid Residential Habilitation services.

Generate a unique, audit-defensible clinical note following these exact requirements:

**INPUT DATA:**
- Date: ${noteForm.date}
- Individual: ${individual.firstname} ${individual.lastname}
- Activity Type: ${noteForm.activityType}
- Description: ${noteForm.description}
- Billing Code: ${noteForm.billingCode}
- Start Time: ${noteForm.shiftTimeIn}
- End Time: ${noteForm.shiftTimeOut}
- Staff: ${noteForm.staffname}
- PCP Goal: ${pcpGoalText}
- Community Outing: ${noteForm.communityouting ? 'Yes' : 'No'}
${noteForm.communityouting ? `- Outing Location: ${noteForm.outinglocation}\n- Outing Purpose: ${noteForm.outingpurpose}` : ''}

**REQUIRED OUTPUT STRUCTURE:**

**Intervention:**
[Generate 3-4 sentences describing the service provided. Must include:
- Clear statement of the activity and setting
- Specific support methods used (verbal prompts, modeling, coaching, etc.)
- Safety/supervision notation if community-based
- Link to skill development or independence goals]

**Response:**
[Generate 2-3 sentences about the individual's participation. Must include:
- Level of engagement and cooperation
- Prompting level needed (minimal/moderate/frequent)
- Any notable behaviors or challenges
- Communication or decision-making demonstrated]

**Outcome:**
[Generate 2-3 sentences about progress and PCP alignment. Must include:
- How this supports independence or community functioning
- Explicit link to the PCP goal: "${pcpGoalText}"
- Progress statement using varied language (not repetitive)]

**CRITICAL REQUIREMENTS:**
1. Use varied sentence structures - never repeat exact phrasing
2. Use clinical but plain language (8th grade reading level)
3. Include specific details from the description
4. For ${noteForm.activityType}, use appropriate terminology:
   - SKILL_BUILDING: focus on task analysis, prompting, skill acquisition
   - COMMUNITY_INTEGRATION: focus on navigation, social interaction, safety
   - EDUCATION_WORK_PREP: focus on workplace readiness, task persistence
   - TREATMENT_SUPPORT: focus on coping strategies, treatment adherence
5. Always tie back to PCP goal explicitly
6. Avoid generic phrases like "client did well" or "good session"

Generate ONLY the note content in the exact format above. Do not include explanations or meta-commentary.`;

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GROQ_API_KEY || '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'}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are ScribeAssist, a clinical documentation AI specialized in generating audit-defensible Medicaid habilitation service notes. You follow strict compliance requirements and never repeat phrasing.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 1000,
          top_p: 0.9,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0].message.content.trim();

      const score = calculateQAScore(generatedText, noteForm);

      setAiGeneratedText(generatedText);
      setQaScore(score);
      setNoteForm(prev => ({
        ...prev,
        narrative: generatedText,
        aiGenerated: true,
        aiGeneratedText: generatedText,
        qaScore: score.score,
        qaFlags: score.flags,
        uniquenessHash: generateHash(generatedText),
        scribeAssistVersion: '1.0',
        entryMode: 'ai'
      }));

    } catch (error) {
      console.error('Error generating note:', error);
      alert('Failed to generate AI note. Please try again or switch to manual mode.');
    } finally {
      setGeneratingNote(false);
    }
  };

  const calculateQAScore = (noteText, formData) => {
    let score = 0;
    const flags = [];
    const checks = {
      billingCodePresent: false,
      timeRangeValid: false,
      pcpLinked: false,
      communityLanguagePresent: false,
      individualizedDetail: false,
      interventionLanguage: false,
      responseLanguage: false,
      outcomeLanguage: false
    };

    if (formData.billingCode) {
      score += 10;
      checks.billingCodePresent = true;
    } else {
      flags.push('Missing billing code');
    }

    if (formData.shiftTimeIn && formData.shiftTimeOut) {
      score += 10;
      checks.timeRangeValid = true;
    } else {
      flags.push('Invalid time range');
    }

    const pcpKeywords = ['person-centered plan', 'pcp', 'goal', 'outcome', 'objective'];
    if (pcpKeywords.some(keyword => noteText.toLowerCase().includes(keyword))) {
      score += 20;
      checks.pcpLinked = true;
    } else {
      flags.push('Missing PCP linkage');
    }

    if (formData.activityType === 'COMMUNITY_INTEGRATION' || formData.communityouting) {
      const communityKeywords = ['community', 'outing', 'public', 'navigation', 'store', 'bank', 'safety'];
      if (communityKeywords.some(keyword => noteText.toLowerCase().includes(keyword))) {
        score += 20;
        checks.communityLanguagePresent = true;
      } else {
        flags.push('Missing community-specific language');
      }
    } else {
      score += 20;
      checks.communityLanguagePresent = true;
    }

    if (noteText.length > 200 && formData.description.length > 20) {
      score += 20;
      checks.individualizedDetail = true;
    } else {
      flags.push('Insufficient individualized detail');
    }

    if (noteText.toLowerCase().includes('intervention') || 
        noteText.match(/staff (provided|supported|facilitated|coached)/i)) {
      score += 10;
      checks.interventionLanguage = true;
    } else {
      flags.push('Missing intervention language');
    }

    if (noteText.toLowerCase().includes('response') || 
        noteText.match(/(participated|engaged|demonstrated|required)/i)) {
      score += 10;
      checks.responseLanguage = true;
    } else {
      flags.push('Missing response language');
    }

    if (noteText.toLowerCase().includes('outcome') || 
        noteText.match(/(progress|supports|strengthens|reinforces)/i)) {
      score += 10;
      checks.outcomeLanguage = true;
    } else {
      flags.push('Missing outcome language');
    }

    return {
      score,
      flags,
      checks,
      reviewRequired: score < 85 || flags.length > 2
    };
  };

  const generateHash = (text) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  };

  const handlePrnMedicationAdd = () => {
    if (!prnMedication.medication.trim()) return;
    
    setNoteForm(prev => ({
      ...prev,
      prnMedications: [...prev.prnMedications, { ...prnMedication, id: Date.now().toString() }]
    }));
    
    setPrnMedication({
      medication: '',
      amount: '',
      time: '',
      reason: '',
      outcome: ''
    });
  };

  const handlePrnMedicationRemove = (id) => {
    setNoteForm(prev => ({
      ...prev,
      prnMedications: prev.prnMedications.filter(med => med.id !== id)
    }));
  };

  const toggleActivity = (activity) => {
    setNoteForm(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }));
  };

  const toggleBehavior = (behavior) => {
    setNoteForm(prev => ({
      ...prev,
      behaviors: prev.behaviors.includes(behavior)
        ? prev.behaviors.filter(b => b !== behavior)
        : [...prev.behaviors, behavior]
    }));
  };

  const toggleGoal = (goalId) => {
    setNoteForm(prev => ({
      ...prev,
      goalsworked: prev.goalsworked.includes(goalId)
        ? prev.goalsworked.filter(g => g !== goalId)
        : [...prev.goalsworked, goalId]
    }));
  };

  const toggleLivingSkill = (skill) => {
    setNoteForm(prev => ({
      ...prev,
      livingSkills: prev.livingSkills.includes(skill)
        ? prev.livingSkills.filter(s => s !== skill)
        : [...prev.livingSkills, skill]
    }));
  };

  useEffect(() => {
    if (isLoaded && user && individualId && !profileLoading) {
      if (canViewDailyNotes) {
        fetchIndividual();
        fetchDailyNotes();
      } else {
        setLoading(false);
      }
    }
  }, [isLoaded, user, individualId, profileLoading]);

const fetchIndividual = async () => {
  try {
    setLoading(true);
    
    console.log('📡 Fetching individual:', individualId);
    console.log('👤 User role:', userProfile?.role_id);
    console.log('📍 User division:', userProfile?.division);
    
    // Start with base query - NO FACILITY FILTERING
    let query = supabase
      .from('individuals')
      .select('*')
      .eq('id', individualId);

    // Apply ONLY division-based filtering (not facility)
    const isAdmin = hasPermission(PERMISSIONS.FULL_ACCESS) || 
                    hasPermission(PERMISSIONS.ADMIN) || 
                    userProfile.role_id === 'ExecDirector' || 
                    userProfile.role_id === 'SystemAdmin' ||
                    userProfile.role_id === 'QDDP';
    
    if (isAdmin) {
      console.log('✅ Admin access - no filters');
      // No filters for admin - see ALL divisions
    }
    // Billing Staff and Intake Coordinator - See ALL
    else if (userProfile.role_id === 'BillingStaff' || 
             userProfile.role_id === 'IntakeCoordinator') {
      console.log('✅ Billing/Intake access - no filters');
      // No filters - see ALL divisions
    }
    // DSP - See all DD individuals (NO facility filter)
    else if (userProfile.role_id === 'DSP_DD') {
      console.log('👷 DSP - filtering by DD division only');
      query = query.or('division.eq.DD,division.is.null');
    }
    // House Manager - See all DD individuals (NO facility filter)
    else if (userProfile.role_id === 'HouseManager_DD') {
      console.log('🏠 House Manager - filtering by DD division only');
      query = query.or('division.eq.DD,division.is.null');
    }
    // MAS Nurse - See all DD individuals
    else if (userProfile.role_id === 'MAS_Nurse') {
      console.log('💊 MAS Nurse - filtering by DD division only');
      query = query.or('division.eq.DD,division.is.null');
    }
    // MI Division staff - See all MI individuals
    else if (userProfile.division === 'MI') {
      if (userProfile.role_id === 'Residential_MI_Staff') {
        console.log('🧠 Residential MI Staff - no filters');
        // No filter
      } else {
        console.log('🧠 MI Staff - filtering by MI division');
        query = query.eq('division', 'MI');
      }
    }
    // SUD Division staff - See all SUD individuals
    else if (userProfile.division === 'SUD') {
      console.log('💊 SUD Staff - filtering by SUD division');
      query = query.eq('division', 'SUD');
    }
    // PEER Division staff - See ALL
    else if (userProfile.division === 'PEER') {
      console.log('🤝 PEER Staff - no filters');
      // No filter - see all divisions
    }

    const { data, error } = await query.single();

    if (error) throw error;
    
    console.log('✅ Individual fetched:', data?.firstname, data?.lastname);
    console.log('🏠 Individual homeassignment:', data?.homeassignment);
    console.log('📍 Individual division:', data?.division);
    
    setIndividual(data);
  } catch (error) {
    console.error('❌ Error fetching individual:', error);
    setIndividual(null);
  } finally {
    setLoading(false);
  }
};

 const fetchDailyNotes = async () => {
  try {
    setLoading(true);
    const { data, error } = await supabase
      .from('individuals')
      .select('dailynotes')
      .eq('id', individualId)
      .single();

    if (error) throw error;
    
    let notes = data?.dailynotes || [];
    
    // NO FILTERING by facility - all DD staff see all DD notes
    // Only filter for non-DD divisions
    const isAdmin = hasPermission(PERMISSIONS.FULL_ACCESS) || 
                    hasPermission(PERMISSIONS.ADMIN) || 
                    userProfile.role_id === 'ExecDirector' || 
                    userProfile.role_id === 'SystemAdmin' ||
                    userProfile.role_id === 'QDDP';
    
    if (isAdmin || 
        userProfile.role_id === 'BillingStaff' || 
        userProfile.role_id === 'IntakeCoordinator' ||
        userProfile.role_id === 'DSP_DD' ||
        userProfile.role_id === 'HouseManager_DD' ||
        userProfile.role_id === 'MAS_Nurse') {
      // See ALL notes - no filtering
      console.log('✅ Viewing all notes - no filtering');
    }
    // MI Division staff - filter by MI
    else if (userProfile.division === 'MI' && userProfile.role_id !== 'Residential_MI_Staff') {
      notes = notes.filter(note => note.division === 'MI');
    }
    // SUD Division staff - filter by SUD
    else if (userProfile.division === 'SUD') {
      notes = notes.filter(note => note.division === 'SUD');
    }
    
    setDailyNotes(notes);
  } catch (error) {
    console.error('Error fetching daily notes:', error);
    setDailyNotes([]);
  } finally {
    setLoading(false);
  }
};

  const handleEditNote = (note) => {
    if (!canUserEditNote(note)) {
      alert('You do not have permission to edit this note.');
      return;
    }
    
    setEditingNote(note.id);
    setNoteForm({
      ...note,
      activities: note.activities || [],
      behaviors: note.behaviors || [],
      goalsworked: note.goalsworked || [],
      livingSkills: note.livingSkills || [],
      prnMedications: note.prnMedications || []
    });
    
    // Set entry mode based on note's entryMode
    setEntryMode(note.entryMode || (note.aiGenerated ? 'ai' : 'manual'));
    
    if (note.aiGeneratedText) {
      setAiGeneratedText(note.aiGeneratedText);
    }
    if (note.qaScore !== undefined) {
      setQaScore({ score: note.qaScore, flags: note.qaFlags || [] });
    }
    
    setShowAddModal(true);
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    resetForm();
    setShowAddModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNoteForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    
    if (noteForm.ispGoalAddressed && !noteForm.selectedIspGoalId) {
      alert('Please select an ISP Goal ID when "ISP Goal Addressed" is checked.');
      return;
    }
    
    if (noteForm.electronicSignature !== noteForm.staffname) {
      alert('Electronic signature must match your staff name exactly.');
      return;
    }
    
    if (!noteForm.signatureConfirmed) {
      alert('Please confirm your signature by checking the certification box.');
      return;
    }
    
    if (!noteForm.choiceExercisedDescription?.trim()) {
      alert('Please describe the choices exercised by the individual (HCBS requirement).');
      return;
    }

    try {
      setSaving(true);
      
      const now = new Date().toISOString();
      
      let docStatus = 'Draft';
      if (noteForm.electronicSignature === noteForm.staffname && noteForm.signatureConfirmed) {
        docStatus = 'Signed';
        if (canApproveDailyNotes) {
          docStatus = 'Billing-Validated';
        }
      }
      
      const { data: currentData, error: fetchError } = await supabase
        .from('individuals')
        .select('*')
        .eq('id', individualId)
        .single();

      if (fetchError) throw fetchError;

      let newNote;
      let historyEntry;
      
      if (editingNote) {
        const originalNote = dailyNotes.find(note => note.id === editingNote);
        
        newNote = {
          ...noteForm,
          id: editingNote,
          last_edited: now,
          last_edited_by: userProfile.fullname,
          last_edited_by_role: userProfile.role_name,
          documentationStatus: docStatus,
          dateSigned: now,
          entryMode: entryMode
        };
        
        historyEntry = {
          timestamp: now,
          updated_by: userProfile.fullname,
          updated_by_role: userProfile.role_name,
          user_id: user.id,
          update_type: 'daily_note_edit',
          changes: noteForm,
          action: `Daily note edited for ${noteForm.date} - ${noteForm.shift}`,
          previous_note: originalNote,
          note_id: editingNote,
          documentation_status: docStatus,
          individual_name: `${individual.firstname} ${individual.lastname}`,
          ai_generated: entryMode === 'ai',
          qa_score: noteForm.qaScore,
          entry_mode: entryMode
        };
        
        const updatedNotes = dailyNotes.map(note => 
          note.id === editingNote ? newNote : note
        );

        const currentHistory = Array.isArray(currentData.update_history) ? currentData.update_history : [];
        const newHistory = [historyEntry, ...currentHistory];
        
        const { error } = await supabase
          .from('individuals')
          .update({ 
            dailynotes: updatedNotes,
            last_activity: now,
            updated_by: userProfile.fullname,
            updated_by_role: userProfile.role_name,
            updated_at: now,
            update_history: newHistory
          })
          .eq('id', individualId);

        if (error) throw error;

        setDailyNotes(updatedNotes);
        setIndividual(prev => ({
          ...prev,
          update_history: newHistory
        }));
        setEditingNote(null);
        alert('Daily note updated successfully!');
      } else {
        newNote = {
          ...noteForm,
          id: Date.now().toString(),
          timestamp: now,
          created_by: userProfile.fullname,
          created_by_role: userProfile.role_name,
          facility: userProfile.facility,
          division: userProfile.division,
          approved: canApproveDailyNotes,
          documentationStatus: docStatus,
          recordId: `DN-${Date.now()}`,
          auditTimestamp: now,
          dateSigned: now,
          billingValidated: docStatus === 'Billing-Validated',
          entryMode: entryMode,
          aiGenerated: entryMode === 'ai'
        };

        historyEntry = {
          timestamp: now,
          updated_by: userProfile.fullname,
          updated_by_role: userProfile.role_name,
          user_id: user.id,
          update_type: 'daily_note_create',
          changes: newNote,
          action: `Daily note created for ${noteForm.date} - ${noteForm.shift}`,
          note_id: newNote.id,
          documentation_status: docStatus,
          shift: noteForm.shift,
          activities_count: noteForm.activities?.length || 0,
          behaviors_count: noteForm.behaviors?.length || 0,
          goals_worked_count: noteForm.goalsworked?.length || 0,
          isp_goal_addressed: noteForm.ispGoalAddressed,
          community_outing: noteForm.communityouting,
          individual_name: `${individual.firstname} ${individual.lastname}`,
          ai_generated: entryMode === 'ai',
          qa_score: noteForm.qaScore,
          scribeassist_activity_type: noteForm.activityType,
          billing_code: noteForm.billingCode,
          entry_mode: entryMode
        };

        const updatedNotes = [newNote, ...dailyNotes];

        const currentHistory = Array.isArray(currentData.update_history) ? currentData.update_history : [];
        const newHistory = [historyEntry, ...currentHistory];

        const { error } = await supabase
          .from('individuals')
          .update({ 
            dailynotes: updatedNotes,
            last_activity: now,
            updated_by: userProfile.fullname,
            updated_by_role: userProfile.role_name,
            updated_at: now,
            update_history: newHistory
          })
          .eq('id', individualId);

        if (error) throw error;

        setDailyNotes(updatedNotes);
        setIndividual(prev => ({
          ...prev,
          update_history: newHistory
        }));
        
        const modeLabel = entryMode === 'ai' ? 'AI-Assisted' : 'Manual';
        alert(`Daily note saved successfully! Status: ${docStatus} (${modeLabel} Mode)`);
      }

      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving note:', error);
      alert(`Error ${editingNote ? 'updating' : 'saving'} note. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndAddAnother = async (e) => {
    e.preventDefault();
    await handleSaveNote(e);
    if (!editingNote) {
      setShowAddModal(true);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!canDeleteDailyNotes) {
      alert('You do not have permission to delete daily notes.');
      return;
    }

    if (!confirm('Are you sure you want to delete this daily note? This action cannot be undone.')) return;

    try {
      const now = new Date().toISOString();
      
      const deletedNote = dailyNotes.find(note => note.id === noteId);
      
      const { data: currentData, error: fetchError } = await supabase
        .from('individuals')
        .select('update_history')
        .eq('id', individualId)
        .single();

      if (fetchError) throw fetchError;

      const updatedNotes = dailyNotes.filter(note => note.id !== noteId);

      const historyEntry = {
        timestamp: now,
        updated_by: userProfile.fullname,
        updated_by_role: userProfile.role_name,
        user_id: user.id,
        update_type: 'daily_note_delete',
        changes: { deleted_note: deletedNote },
        action: `Daily note deleted for ${deletedNote?.date} - ${deletedNote?.shift}`,
        deleted_note_id: noteId,
        deleted_by_role: userProfile.role_name,
        note_date: deletedNote?.date,
        note_shift: deletedNote?.shift,
        original_author: deletedNote?.created_by,
        individual_name: `${individual.firstname} ${individual.lastname}`
      };

      const currentHistory = Array.isArray(currentData?.update_history) ? currentData.update_history : [];
      const newHistory = [historyEntry, ...currentHistory];
      
      const { error } = await supabase
        .from('individuals')
        .update({ 
          dailynotes: updatedNotes,
          last_activity: now,
          updated_by: userProfile.fullname,
          updated_by_role: userProfile.role_name,
          updated_at: now,
          update_history: newHistory
        })
        .eq('id', individualId);

      if (error) throw error;

      setDailyNotes(updatedNotes);
      setIndividual(prev => ({
        ...prev,
        update_history: newHistory
      }));
      setSelectedNote(null);
      if (editingNote === noteId) {
        setEditingNote(null);
        resetForm();
      }
      alert('Daily note deleted successfully.');
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting daily note.');
    }
  };

  const resetForm = () => {
    setNoteForm({ ...defaultNoteForm });
    setPrnMedication({
      medication: '',
      amount: '',
      time: '',
      reason: '',
      outcome: ''
    });
    setAiGeneratedText('');
    setQaScore(null);
    setEntryMode('manual');
  };

  const filteredNotes = dailyNotes.filter(note => {
    const matchesSearch = 
      note.narrative?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.staffname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.behaviordetails?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.activitydetails?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.ispGoalsNarrative?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.choiceAutonomyNarrative?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !filterDate || note.date === filterDate;
    
    return matchesSearch && matchesDate;
  });

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

  const getMoodColor = (mood) => {
    const colors = {
      'Happy': 'text-green-400',
      'Calm': 'text-blue-400',
      'Excited': 'text-purple-400',
      'Neutral': 'text-slate-400',
      'Anxious': 'text-yellow-400',
      'Sad': 'text-orange-400',
      'Frustrated': 'text-red-400'
    };
    return colors[mood] || 'text-slate-400';
  };

  const printDailyNote = (note) => {
    if (!note) {
      alert('No note selected to print');
      return;
    }

    if (!note.date) {
      alert('This note is missing required date information');
      return;
    }

    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow pop-ups to print notes');
      return;
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Daily Service Note - ${new Date(note.date).toLocaleDateString()}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            padding: 40px;
            color: #1a1a1a;
            background: white;
          }
          
          .header {
            border-bottom: 3px solid #10b981;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .header h1 {
            color: #10b981;
            font-size: 28px;
            margin-bottom: 10px;
          }
          
          .header-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 15px;
          }
          
          .header-info-item {
            font-size: 14px;
          }
          
          .header-info-item strong {
            color: #4b5563;
          }
          
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          
          .section-title {
            background: #f3f4f6;
            padding: 10px 15px;
            border-left: 4px solid #10b981;
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 15px;
            color: #1f2937;
          }
          
          .grid-2 {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          
          .grid-3 {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
          }
          
          .field {
            margin-bottom: 12px;
          }
          
          .field-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 4px;
            font-weight: 600;
          }
          
          .field-value {
            font-size: 14px;
            color: #1f2937;
            padding: 8px;
            background: #f9fafb;
            border-radius: 4px;
            border: 1px solid #e5e7eb;
          }
          
          .narrative-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 15px;
            white-space: pre-wrap;
            line-height: 1.6;
            font-size: 14px;
          }
          
          .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: bold;
            margin-right: 8px;
            margin-bottom: 5px;
          }
          
          .badge-ai {
            background: #e9d5ff;
            color: #7c3aed;
          }
          
          .badge-manual {
            background: #dbeafe;
            color: #2563eb;
          }
          
          .badge-approved {
            background: #d1fae5;
            color: #059669;
          }
          
          .badge-qa {
            background: #fef3c7;
            color: #d97706;
          }
          
          .badge-qa-high {
            background: #d1fae5;
            color: #059669;
          }
          
          .badge-qa-low {
            background: #fee2e2;
            color: #dc2626;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
          
          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Daily Service Note</h1>
          <div style="margin-top: 10px;">
            ${note.entryMode === 'ai' ? '<span class="badge badge-ai">🪄 AI-Assisted</span>' : '<span class="badge badge-manual">📝 Manual Entry</span>'}
            ${note.approved ? '<span class="badge badge-approved">✓ Approved</span>' : ''}
            ${note.qaScore !== undefined ? `<span class="badge ${note.qaScore >= 90 ? 'badge-qa-high' : note.qaScore >= 75 ? 'badge-qa' : 'badge-qa-low'}">QA Score: ${note.qaScore}/100</span>` : ''}
          </div>
          <div class="header-info">
            <div class="header-info-item">
              <strong>Individual:</strong> ${individual?.firstname || 'N/A'} ${individual?.lastname || ''}
            </div>
            <div class="header-info-item">
              <strong>Individual ID:</strong> ${individual?.individualid || 'N/A'}
            </div>
            <div class="header-info-item">
              <strong>Date:</strong> ${new Date(note.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div class="header-info-item">
              <strong>Shift:</strong> ${note.shift || 'N/A'}
            </div>
            <div class="header-info-item">
              <strong>Staff:</strong> ${note.staffname || 'N/A'}
            </div>
            <div class="header-info-item">
              <strong>Entry Method:</strong> ${note.entryMode === 'ai' ? 'AI-Assisted' : 'Manual'}
            </div>
          </div>
        </div>

        ${note.description ? `
        <div class="section">
          <div class="section-title">📝 Activity Description</div>
          <div class="narrative-box">${note.description}</div>
        </div>
        ` : ''}

        ${note.narrative ? `
        <div class="section">
          <div class="section-title">💬 Clinical Documentation</div>
          <div class="narrative-box">${note.narrative}</div>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">💊 Health & Wellness</div>
          <div class="grid-3">
            <div class="field">
              <div class="field-label">Mood</div>
              <div class="field-value">${note.mood || 'N/A'}</div>
            </div>
            <div class="field">
              <div class="field-label">Appetite</div>
              <div class="field-value">${note.appetite || 'N/A'}</div>
            </div>
            <div class="field">
              <div class="field-label">Sleep Quality</div>
              <div class="field-value">${note.sleep || 'N/A'}</div>
            </div>
          </div>
        </div>

        ${note.electronicSignature ? `
        <div class="section">
          <div class="section-title">📝 Electronic Signature</div>
          <div class="grid-2">
            <div class="field">
              <div class="field-label">Signed By</div>
              <div class="field-value">${note.electronicSignature}</div>
            </div>
            <div class="field">
              <div class="field-label">Date Signed</div>
              <div class="field-value">${note.dateSigned ? new Date(note.dateSigned).toLocaleString() : 'N/A'}</div>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="footer">
          <p>Document created on ${note.timestamp ? new Date(note.timestamp).toLocaleString() : 'N/A'}</p>
          <p style="margin-top: 10px;">Printed on ${new Date().toLocaleString()}</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (!profileLoading && !canViewDailyNotes) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center max-w-md">
          <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
          <p className="text-slate-400 mb-6">
            You do not have permission to view daily notes.
          </p>
          <button
            onClick={() => router.push('/individual')}
            className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
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
          <p className="text-slate-400 text-lg">Loading daily notes...</p>
        </div>
      </div>
    );
  }

  if (!individual || !canAccessIndividual()) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Individual not found or access denied</p>
          <button
            onClick={() => router.push('/individual')}
            className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
          >
            Back to Individuals
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className="max-h-screen bg-slate-950 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/dashboard/individual/${individualId}`)}
              className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <div>
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500">
                Daily Service Notes
              </h1>
              <p className="text-slate-400 mt-1">
                {individual.firstname} {individual.lastname} • ID: {individual.individualid}
              </p>
            </div>
          </div>
          {canCreateDailyNotes && (
            <button
              onClick={() => {
                setEditingNote(null);
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all"
            >
              <Plus size={18} />
              Add Daily Note
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="text-emerald-400" size={24} />
              <span className="text-2xl font-bold text-white">{filteredNotes.length}</span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Total Notes</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-blue-400" size={24} />
              <span className="text-2xl font-bold text-white">
                {dailyNotes.filter(n => n.date === new Date().toISOString().split('T')[0]).length}
              </span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Today</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Wand2 className="text-purple-400" size={24} />
              <span className="text-2xl font-bold text-white">
                {dailyNotes.filter(n => n.entryMode === 'ai').length}
              </span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">AI-Assisted</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-indigo-500/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="text-blue-400" size={24} />
              <span className="text-2xl font-bold text-white">
                {dailyNotes.filter(n => n.entryMode === 'manual' || !n.entryMode).length}
              </span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Manual Entry</p>
          </div>
          <div className="bg-gradient-to-br from-orange-600/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="text-orange-400" size={24} />
              <span className="text-2xl font-bold text-white">
                {dailyNotes.filter(n => n.incidentreported || n.safetyIssues).length}
              </span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Incidents</p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 flex items-center gap-3 bg-slate-900/50 rounded-xl px-5 py-3 border border-slate-700/50">
            <Search size={20} className="text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes..." 
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-5 py-3 text-white focus:outline-none focus:border-emerald-500"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
              >
                <X className="text-white" size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Notes List */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-400 mb-2">No daily notes found</h3>
              <p className="text-slate-500 mb-4">
                {dailyNotes.length === 0 
                  ? 'Start documenting with AI-assisted or manual entry' 
                  : 'Try adjusting your search or filters'}
              </p>
              {canCreateDailyNotes && (
                <button
                  onClick={() => {
                    setEditingNote(null);
                    resetForm();
                    setShowAddModal(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all"
                >
                  Add First Note
                </button>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {filteredNotes.map((note) => {
                  const MoodIcon = getMoodIcon(note.mood);
                  const canEditThisNote = canUserEditNote(note);
                  return (
                    <div 
                      key={note.id} 
                      className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-emerald-500/50 transition-all cursor-pointer group"
                      onClick={() => setSelectedNote(note)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            note.entryMode === 'ai' 
                              ? 'bg-gradient-to-br from-purple-600 to-pink-500'
                              : 'bg-gradient-to-br from-emerald-600 to-teal-500'
                          }`}>
                            {note.entryMode === 'ai' ? <Wand2 className="text-white" size={24} /> : <Calendar className="text-white" size={24} />}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-lg font-bold text-white">
                                {new Date(note.date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </h3>
                              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-bold border border-emerald-500/30">
                                {note.shift}
                              </span>
                              {note.entryMode === 'ai' ? (
                                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full font-bold border border-purple-500/30 flex items-center gap-1">
                                  <Wand2 size={12} />
                                  Scribe Assist
                                </span>
                              ) : (
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-bold border border-blue-500/30 flex items-center gap-1">
                                  <FileText size={12} />
                                  Manual
                                </span>
                              )}
                              {note.approved && (
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-bold border border-green-500/30">
                                  Approved
                                </span>
                              )}
                              {note.qaScore !== undefined && (
                                <span className={`px-3 py-1 text-xs rounded-full font-bold border ${
                                  note.qaScore >= 90 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                  note.qaScore >= 75 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                                  'bg-red-500/20 text-red-400 border-red-500/30'
                                }`}>
                                  QA: {note.qaScore}
                                </span>
                              )}
                            </div>
                            <p className="text-slate-400 text-sm mt-1">
                              {note.staffname} • {new Date(note.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MoodIcon className={`${getMoodColor(note.mood)}`} size={24} />
                          {canEditThisNote && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditNote(note);
                              }}
                              className="p-2 hover:bg-blue-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Edit2 size={16} className="text-blue-400" />
                            </button>
                          )}
                          {canDeleteDailyNotes && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(note.id);
                              }}
                              className="p-2 hover:bg-red-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} className="text-red-400" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-1">Mood</p>
                          <p className="text-sm font-semibold text-white">{note.mood}</p>
                        </div>
                        {note.activityType && (
                          <div className="bg-slate-800/50 rounded-lg p-3">
                            <p className="text-xs text-slate-400 mb-1">Activity Type</p>
                            <p className="text-sm font-semibold text-white">{note.activityType}</p>
                          </div>
                        )}
                       
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-1">Community</p>
                          <p className="text-sm font-semibold text-white">
                            {note.communityouting ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </div>

                      {(note.narrative || note.description) && (
                        <div className="bg-slate-800/30 rounded-lg p-4">
                          <p className="text-sm text-slate-300 line-clamp-3">
                            {note.narrative || note.description}
                          </p>
                        </div>
                      )}

                      {(note.incidentreported || note.safetyIssues) && (
                        <div className="mt-4 flex items-center gap-2 text-orange-400 text-sm">
                          <AlertCircle size={16} />
                          <span className="font-semibold">Requires review</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Add/Edit Note Modal with Mode Toggle */}
      {(showAddModal && canCreateDailyNotes) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  entryMode === 'ai' 
                    ? 'bg-gradient-to-br from-purple-600 to-pink-500'
                    : 'bg-gradient-to-br from-emerald-600 to-teal-500'
                }`}>
                  {entryMode === 'ai' ? <Wand2 className="text-white" size={24} /> : <ClipboardList className="text-white" size={24} />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    {editingNote ? 'Edit Daily Service Note' : 'Daily Service Note'}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {entryMode === 'ai' ? 'Scribe Assist documentation' : 'Manual documentation entry'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* MODE TOGGLE BUTTONS */}
                <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setEntryMode('manual')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      entryMode === 'manual'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <FileText size={16} />
                    Manual
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryMode('ai')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                      entryMode === 'ai'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Wand2 size={16} />
                    Scribe Assist
                  </button>
                </div>
                <button 
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-all"
                >
                  <X className="text-slate-400" size={24} />
                </button>
              </div>
            </div>

            <ScrollArea className="h-[calc(90vh-160px)]">
              <form onSubmit={handleSaveNote} className="p-6 space-y-8">
                
                {/* AI MODE - ScribeAssist Section */}
                {entryMode === 'ai' && (
                  <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Wand2 className="text-purple-400" size={24} />
                      <h4 className="text-lg font-bold text-purple-400">ScribeAssist Documentation Engine</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Activity Type *</label>
                        <div className="grid grid-cols-2 gap-2">
                          {scribeAssistActivityTypes.map(type => {
                            const Icon = type.icon;
                            return (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => setNoteForm(prev => ({ ...prev, activityType: type.value }))}
                                className={`p-3 border rounded-lg transition-all flex flex-col items-center gap-2 ${
                                  noteForm.activityType === type.value
                                    ? `bg-${type.color}-600/20 border-${type.color}-500 text-${type.color}-400`
                                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                }`}
                              >
                                <Icon size={20} />
                                <span className="text-xs font-semibold text-center">{type.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Billing Code *</label>
                        <select
                          name="billingCode"
                          value={noteForm.billingCode}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                        >
                          {billingCodes.map(code => (
                            <option key={code.value} value={code.value}>{code.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Activity Description *
                      </label>
                      <textarea
                        name="description"
                        value={noteForm.description}
                        onChange={handleInputChange}
                        placeholder="Describe the activity in detail. Be specific - AI will use this to generate the clinical note."
                        rows="3"
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={generateScribeAssistNote}
                        disabled={generatingNote || !noteForm.description.trim()}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {generatingNote ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Zap size={18} />
                            Generate Note
                          </>
                        )}
                      </button>
                      
                      {aiGeneratedText && (
                        <button
                          type="button"
                          onClick={generateScribeAssistNote}
                          disabled={generatingNote}
                          className="flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                        >
                          <RefreshCw size={16} />
                          Regenerate
                        </button>
                      )}
                    </div>

                    {aiGeneratedText && (
                      <div className="mt-4 space-y-3">
                        <div className="bg-slate-900/50 border border-emerald-500/30 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-bold text-emerald-400 flex items-center gap-2">
                              <CheckCircle size={16} />
                              AI-Generated Clinical Note
                            </h5>
                            {qaScore && (
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                qaScore.score >= 90 ? 'bg-green-500/20 text-green-400' :
                                qaScore.score >= 75 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                QA Score: {qaScore.score}/100
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-800/50 rounded-lg p-4">
                            {aiGeneratedText}
                          </div>
                        </div>

                        {qaScore && qaScore.flags.length > 0 && (
                          <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3">
                            <p className="text-xs font-bold text-orange-400 mb-2">QA Flags:</p>
                            <ul className="text-xs text-orange-300 space-y-1">
                              {qaScore.flags.map((flag, index) => (
                                <li key={index}>• {flag}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* SHIFT DETAILS - Required for both modes */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Clock size={20} />
                    SHIFT DETAILS
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Date *</label>
                      <input
                        type="date"
                        name="date"
                        value={noteForm.date}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Shift Time *</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['1st Shift', '2nd Shift', '3rd Shift', 'Awake Overnight'].map(shift => (
                          <button
                            key={shift}
                            type="button"
                            onClick={() => setNoteForm(prev => ({ ...prev, shift }))}
                            className={`p-2 border rounded-lg text-sm font-semibold ${
                              noteForm.shift === shift
                                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                                : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                          >
                            {shift}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Staff Name</label>
                      <input
                        type="text"
                        name="staffname"
                        value={noteForm.staffname}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Time In *</label>
                      <input
                        type="time"
                        name="shiftTimeIn"
                        value={noteForm.shiftTimeIn}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Time Out *</label>
                      <input
                        type="time"
                        name="shiftTimeOut"
                        value={noteForm.shiftTimeOut}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* MANUAL MODE - All Detailed Sections */}
                {entryMode === 'manual' && (
                  <>
                    {/* ADLs */}
                    <div>
                      <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                        <Activity size={20} />
                        Activities of Daily Living (ADLs)
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                          { name: 'bathing', icon: Bath, label: 'Bathing' },
                          { name: 'dressing', icon: Shirt, label: 'Dressing' },
                          { name: 'grooming', icon: User, label: 'Grooming' },
                          { name: 'toileting', icon: HomeIcon, label: 'Toileting' },
                          { name: 'eating', icon: Utensils, label: 'Eating' },
                          { name: 'mobility', icon: Activity, label: 'Mobility' }
                        ].map(adl => {
                          const Icon = adl.icon;
                          return (
                            <div key={adl.name}>
                              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                <Icon size={16} />
                                {adl.label}
                              </label>
                              <select
                                name={adl.name}
                                value={noteForm[adl.name]}
                                onChange={handleInputChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                              >
                                {adlOptions.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* ISP Goals */}
                    <div>
                      <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                        <Target size={20} />
                        ISP GOALS & SUPPORT PROVIDED
                      </h4>
                      <div className="space-y-3 mb-4">
                        {individual.goals?.length > 0 ? (
                          individual.goals.map(goal => {
                            const isSelected = noteForm.goalsworked.includes(goal.id);
                            return (
                              <button
                                key={goal.id}
                                type="button"
                                onClick={() => toggleGoal(goal.id)}
                                className={`w-full p-4 border rounded-xl transition-all text-left ${
                                  isSelected
                                    ? 'bg-blue-600/20 border-blue-500'
                                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                                    isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-600'
                                  }`}>
                                    {isSelected && <CheckCircle size={16} className="text-white" />}
                                  </div>
                                  <div className="flex-1">
                                    <p className={`font-semibold ${isSelected ? 'text-blue-400' : 'text-slate-300'}`}>
                                      {goal.description}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                      Frequency: {goal.frequency} • Progress: {goal.progress}%
                                    </p>
                                  </div>
                                </div>
                              </button>
                            );
                          })
                        ) : (
                          <p className="text-slate-500 text-sm">No goals defined for this individual</p>
                        )}
                      </div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Narrative (Describe support provided):
                      </label>
                      <textarea
                        name="ispGoalsNarrative"
                        value={noteForm.ispGoalsNarrative}
                        onChange={handleInputChange}
                        placeholder="Describe how you supported the individual with their goals..."
                        rows="3"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    {/* Activities */}
                    <div>
                      <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                        <Sparkles size={20} />
                        DAILY ACTIVITIES
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        {activityTypes.map(activity => {
                          const Icon = activity.icon;
                          const isSelected = noteForm.activities.includes(activity.value);
                          return (
                            <button
                              key={activity.value}
                              type="button"
                              onClick={() => toggleActivity(activity.value)}
                              className={`p-3 border rounded-lg transition-all flex flex-col items-center gap-2 ${
                                isSelected
                                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                              }`}
                            >
                              <Icon size={20} />
                              <span className="text-xs font-semibold text-center">{activity.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <textarea
                        name="activitydetails"
                        value={noteForm.activitydetails}
                        onChange={handleInputChange}
                        placeholder="Describe activities in detail..."
                        rows="2"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    {/* Behaviors */}
                    <div>
                      <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                        <Brain size={20} />
                        BEHAVIORS OBSERVED
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {behaviorTypes.map(behavior => {
                          const isSelected = noteForm.behaviors.includes(behavior);
                          return (
                            <button
                              key={behavior}
                              type="button"
                              onClick={() => toggleBehavior(behavior)}
                              className={`p-3 border rounded-lg transition-all text-sm font-semibold ${
                                isSelected
                                  ? 'bg-purple-600/20 border-purple-500 text-purple-400'
                                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                              }`}
                            >
                              {behavior}
                            </button>
                          );
                        })}
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <textarea
                          name="behaviordetails"
                          value={noteForm.behaviordetails}
                          onChange={handleInputChange}
                          placeholder="Describe behaviors..."
                          rows="2"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                        />
                        <textarea
                          name="behaviortriggers"
                          value={noteForm.behaviortriggers}
                          onChange={handleInputChange}
                          placeholder="Identify triggers..."
                          rows="2"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                        />
                        <textarea
                          name="behaviorinterventions"
                          value={noteForm.behaviorinterventions}
                          onChange={handleInputChange}
                          placeholder="Interventions used..."
                          rows="2"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                        />
                      </div>
                    </div>

                    {/* Living Skills */}
                    <div>
                      <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                        <HomeIcon size={20} />
                        INDEPENDENT LIVING SKILLS
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {livingSkills.map(skill => {
                          const isSelected = noteForm.livingSkills.includes(skill.value);
                          return (
                            <button
                              key={skill.value}
                              type="button"
                              onClick={() => toggleLivingSkill(skill.value)}
                              className={`p-3 border rounded-lg transition-all text-sm font-semibold ${
                                isSelected
                                  ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                              }`}
                            >
                              {skill.label}
                            </button>
                          );
                        })}
                      </div>
                      <textarea
                        name="livingSkillsNarrative"
                        value={noteForm.livingSkillsNarrative}
                        onChange={handleInputChange}
                        placeholder="Describe skills practiced..."
                        rows="3"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none mt-4"
                      />
                    </div>
                  </>
                )}

                {/* ISP LINKAGE - Required for both modes */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Target size={20} />
                    ISP LINKAGE
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="ispGoalAddressed"
                        checked={noteForm.ispGoalAddressed}
                        onChange={handleInputChange}
                        className="w-5 h-5 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500"
                      />
                      <label className="text-white font-semibold">
                        ISP Goal Addressed? *
                      </label>
                    </div>

                    {noteForm.ispGoalAddressed && (
                      <div className="pl-8 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Select ISP Goal ID *
                          </label>
                          <select
                            name="selectedIspGoalId"
                            value={noteForm.selectedIspGoalId}
                            onChange={(e) => {
                              const selectedGoal = individual.goals?.find(g => g.id === e.target.value);
                              setNoteForm(prev => ({
                                ...prev,
                                selectedIspGoalId: e.target.value,
                                selectedGoalDomain: selectedGoal?.hcbsdomain || selectedGoal?.domain || 'Other'
                              }));
                            }}
                            required={noteForm.ispGoalAddressed}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="">-- Select Active ISP Goal --</option>
                            {individual.goals?.filter(g => g.status === 'Active').map(goal => (
                              <option key={goal.id} value={goal.id}>
                                {goal.description}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* CHOICE & AUTONOMY - Required for both modes */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <CheckSquare size={20} />
                    CHOICE & AUTONOMY (HCBS REQUIREMENT)
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="choiceOffered"
                          checked={noteForm.choiceOffered}
                          onChange={handleInputChange}
                          className="w-5 h-5 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500"
                        />
                        <label className="text-white font-semibold">
                          Choice Offered? *
                        </label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="choiceHonored"
                          checked={noteForm.choiceHonored}
                          onChange={handleInputChange}
                          className="w-5 h-5 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500"
                        />
                        <label className="text-white font-semibold">
                          Choice Honored? *
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Describe choice exercised *
                      </label>
                      <textarea
                        name="choiceExercisedDescription"
                        value={noteForm.choiceExercisedDescription}
                        onChange={handleInputChange}
                        placeholder="Describe the choices the individual made today..."
                        rows="2"
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* COMMUNITY OUTING - Required for both modes */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <MapPin size={20} />
                    COMMUNITY ACTIVITIES
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="communityouting"
                        checked={noteForm.communityouting}
                        onChange={handleInputChange}
                        className="w-5 h-5 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500"
                      />
                      <label className="text-white font-semibold">
                        Community Outing
                      </label>
                    </div>

                    {noteForm.communityouting && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                          <input
                            type="text"
                            name="outinglocation"
                            value={noteForm.outinglocation}
                            onChange={handleInputChange}
                            placeholder="e.g., Local park"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Purpose</label>
                          <input
                            type="text"
                            name="outingpurpose"
                            value={noteForm.outingpurpose}
                            onChange={handleInputChange}
                            placeholder="e.g., Shopping"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* HEALTH OBSERVATIONS - Required for both modes */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Stethoscope size={20} />
                    HEALTH & WELLNESS
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Mood</label>
                      <select
                        name="mood"
                        value={noteForm.mood}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      >
                        {moodOptions.map(mood => (
                          <option key={mood} value={mood}>{mood}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Appetite</label>
                      <select
                        name="appetite"
                        value={noteForm.appetite}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      >
                        {appetiteOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Sleep</label>
                      <select
                        name="sleep"
                        value={noteForm.sleep}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      >
                        {sleepOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* MEDICATION - Required for both modes */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Bell size={20} />
                    MEDICATION ADMINISTRATION
                  </h4>
                  <div className="flex gap-4">
                    {medicationOptions.map(option => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setNoteForm(prev => ({ ...prev, medicationsAdministered: option }))}
                        className={`px-4 py-2 border rounded-lg font-semibold ${
                          noteForm.medicationsAdministered === option
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SAFETY - Required for both modes */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <AlertCircle size={20} />
                    SAFETY & INCIDENTS
                  </h4>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="safetyIssues"
                      checked={noteForm.safetyIssues}
                      onChange={handleInputChange}
                      className="w-5 h-5 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500"
                    />
                    <label className="text-white font-semibold">
                      Safety issues to report
                    </label>
                  </div>
                  {noteForm.safetyIssues && (
                    <textarea
                      name="safetyNarrative"
                      value={noteForm.safetyNarrative}
                      onChange={handleInputChange}
                      placeholder="Describe the safety issue..."
                      rows="3"
                      className="w-full bg-red-900/20 border border-red-500/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 resize-none mt-4"
                    />
                  )}
                </div>

                {/* STAFF SIGN-OFF - Required for both modes */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <ClipboardCheck size={20} />
                    STAFF SIGN-OFF (REQUIRED)
                  </h4>
                  
                  <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-xl p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Electronic Signature *
                      </label>
                      <input
                        type="text"
                        name="electronicSignature"
                        value={noteForm.electronicSignature}
                        onChange={handleInputChange}
                        placeholder="Type your full name"
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                      />
                      {noteForm.electronicSignature && noteForm.electronicSignature !== noteForm.staffname && (
                        <p className="text-red-400 text-xs mt-1">⚠️ Must match staff name exactly</p>
                      )}
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="signatureConfirmed"
                        checked={noteForm.signatureConfirmed}
                        onChange={handleInputChange}
                        required
                        className="w-5 h-5 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 mt-0.5"
                      />
                      <label className="text-white text-sm">
                        <strong>I certify</strong> that this information is accurate and complete. *
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  {!editingNote && canCreateDailyNotes && (
                    <button
                      type="button"
                      onClick={handleSaveAndAddAnother}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50"
                    >
                      <Copy size={18} />
                      Save & Add Another
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl font-bold hover:shadow-2xl hover:shadow-emerald-500/50 transition-all disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {saving ? 'Saving...' : (editingNote ? 'Update Note' : 'Save Note')}
                  </button>
                </div>
              </form>
            </ScrollArea>
          </div>
        </div>
      )}

      {/* View Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  selectedNote.entryMode === 'ai' 
                    ? 'bg-gradient-to-br from-purple-600 to-pink-500'
                    : 'bg-gradient-to-br from-emerald-600 to-teal-500'
                }`}>
                  {selectedNote.entryMode === 'ai' ? <Wand2 className="text-white" size={24} /> : <Eye className="text-white" size={24} />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Daily Note Details</h3>
                  <p className="text-slate-400 text-sm">
                    {new Date(selectedNote.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canUserEditNote(selectedNote) && (
                  <button
                    onClick={() => {
                      setSelectedNote(null);
                      handleEditNote(selectedNote);
                    }}
                    className="p-2 hover:bg-blue-500/20 rounded-lg transition-all"
                  >
                    <Edit2 size={20} className="text-blue-400" />
                  </button>
                )}
                <button 
                  onClick={() => setSelectedNote(null)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-all"
                >
                  <X className="text-slate-400" size={24} />
                </button>
              </div>
            </div>

            <ScrollArea className="h-[calc(90vh-160px)]">
              <div className="p-6 space-y-6">
                {/* Entry Mode Badge */}
                <div className="flex items-center gap-2">
                  {selectedNote.entryMode === 'ai' ? (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full font-bold border border-purple-500/30 flex items-center gap-1">
                      <Wand2 size={12} />
                      AI-Assisted Entry
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-bold border border-blue-500/30 flex items-center gap-1">
                      <FileText size={12} />
                      Manual Entry
                    </span>
                  )}
                  {selectedNote.qaScore !== undefined && (
                    <span className={`px-3 py-1 text-xs rounded-full font-bold border ${
                      selectedNote.qaScore >= 90 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      selectedNote.qaScore >= 75 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      QA: {selectedNote.qaScore}
                    </span>
                  )}
                </div>

                {/* Rest of the view modal content - shift details, health, etc. */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-3">Shift Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Shift</p>
                      <p className="text-white font-semibold">{selectedNote.shift}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Staff</p>
                      <p className="text-white font-semibold">{selectedNote.staffname}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Time In</p>
                      <p className="text-white font-semibold">{selectedNote.shiftTimeIn || 'N/A'}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Time Out</p>
                      <p className="text-white font-semibold">{selectedNote.shiftTimeOut || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {selectedNote.description && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-400 mb-3">Activity Description</h4>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{selectedNote.description}</p>
                    </div>
                  </div>
                )}

                {selectedNote.narrative && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-400 mb-3">Clinical Documentation</h4>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{selectedNote.narrative}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-3">Health & Wellness</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Mood</p>
                      <p className="text-white font-semibold">{selectedNote.mood}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Appetite</p>
                      <p className="text-white font-semibold">{selectedNote.appetite}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Sleep</p>
                      <p className="text-white font-semibold">{selectedNote.sleep}</p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-500">
                    Documented on {new Date(selectedNote.timestamp).toLocaleString()} • Entry Method: {selectedNote.entryMode === 'ai' ? 'AI-Assisted' : 'Manual'}
                  </p>
                </div>
              </div>
            </ScrollArea>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => printDailyNote(selectedNote)}
                className="px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <FileText size={18} />
                Print
              </button>
              {canDeleteDailyNotes && (
                <button
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-semibold transition-all"
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => setSelectedNote(null)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyNotesPage;