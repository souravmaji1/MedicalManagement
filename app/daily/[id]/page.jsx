'use client'

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Plus, Trash2, Calendar, Clock, 
  Activity, Heart, Target, Users, CheckCircle,
  AlertCircle, Edit2, Eye, Filter, Search,ClipboardCheck,
  Home as HomeIcon, Utensils, Shirt, Bath, Bed,
  Smile, Frown, Meh, MessageSquare, MapPin,
  FileText, User, Loader2, ChevronDown, ChevronRight,
  TrendingUp, Award, Brain, Sparkles, Coffee, Book,
  Music, Palette, Dumbbell, X, Copy, Shield,
  ClipboardList, CheckSquare, Stethoscope, Bell
} from 'lucide-react';
import { ScrollArea, ScrollBar } from "../../../components/ui/scroll-area";
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter, useParams } from 'next/navigation';
import { useUserProfile } from '../../../contexts/userProfileContext';
import { PERMISSIONS } from '../../../utils/permissions';

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
  const [viewMode, setViewMode] = useState('list'); // list or detail

  // Permission checks
  const canViewDailyNotes = hasAnyPermission([
    PERMISSIONS.DAILY_NOTES_VIEW,
    PERMISSIONS.DAILY_NOTES_CREATE,
    PERMISSIONS.DAILY_NOTES_APPROVE,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canCreateDailyNotes = hasAnyPermission([
    PERMISSIONS.DAILY_NOTES_CREATE,
    PERMISSIONS.DAILY_NOTES_APPROVE,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canEditDailyNotes = hasAnyPermission([
    PERMISSIONS.DAILY_NOTES_APPROVE,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canDeleteDailyNotes = hasAnyPermission([
    PERMISSIONS.DAILY_NOTES_APPROVE,
    PERMISSIONS.ADMIN,
    PERMISSIONS.FULL_ACCESS
  ]);

  const canApproveDailyNotes = hasAnyPermission([
    PERMISSIONS.DAILY_NOTES_APPROVE,
    PERMISSIONS.FULL_ACCESS
  ]);

  // Role-based access control
  const canAccessIndividual = () => {
    if (!userProfile || !individual) return false;
    
    // Full access users can see everything
    if (hasPermission(PERMISSIONS.FULL_ACCESS)) return true;
    
    // House managers only see individuals in their facility
    if (userProfile.role_id === 'HouseManager_DD') {
      return individual.homeassignment === userProfile.facility;
    }
    
    // DSPs only see individuals in their assigned home
    if (userProfile.role_id === 'DSP_DD') {
      return individual.homeassignment === userProfile.facility;
    }
    
    // MI staff see only their division's individuals, except Residential MI Staff
    if (userProfile.division === 'MI' && userProfile.role_id !== 'Residential_MI_Staff') {
      return individual.division === 'MI';
    }
    
    // SUD staff see only their division's individuals
    if (userProfile.division === 'SUD') {
      return individual.division === 'SUD';
    }
    
    // Residential MI Staff can access all individuals
    if (userProfile.role_id === 'Residential_MI_Staff') {
      return true;
    }
    
    return false;
  };

  // Check if user can edit a specific note
  const canUserEditNote = (note) => {
    if (!note || !userProfile) return false;
    
    // Full access users can edit any note
    if (hasPermission(PERMISSIONS.FULL_ACCESS)) return true;
    
    // Users with DAILY_NOTES_APPROVE permission can edit any note
    if (hasPermission(PERMISSIONS.DAILY_NOTES_APPROVE)) return true;
    
    // Original creator can edit their own notes within 24 hours
    if (note.created_by === userProfile.fullname) {
      const noteDate = new Date(note.timestamp);
      const now = new Date();
      const hoursDiff = (now - noteDate) / (1000 * 60 * 60);
      return hoursDiff <= 24;
    }
    
    return false;
  };

  // Default form state for new note
  const defaultNoteForm = {
    // SECTION 1 — SHIFT DETAILS
    date: new Date().toISOString().split('T')[0],
    shift: '1st Shift',
    shiftTimeIn: '',
    shiftTimeOut: '',
    awakeOvernight: false,
    
    // Staff info
    staffname: user?.fullName || '',
    staffid: user?.id || '',
    
    // ADLs
    bathing: 'Independent',
    dressing: 'Independent',
    grooming: 'Independent',
    toileting: 'Independent',
    eating: 'Independent',
    mobility: 'Independent',
    
    // SECTION 2 — ISP GOALS & SUPPORT PROVIDED
    ispGoalsNarrative: '',
    
    // SECTION 3 — CHOICE & AUTONOMY
    choiceAutonomyNarrative: '',
    
    // SECTION 4 — DAILY ACTIVITIES & COMMUNITY INCLUSION
    activities: [],
    activitydetails: '',
    communityouting: false,
    outinglocation: '',
    outingpurpose: '',
    participationlevel: 'Full',
    
    // SECTION 5 — HEALTH, BEHAVIOR, & WELLNESS OBSERVATIONS
    healthChanges: '',
    noChangesBaseline: false,
    
    // Mood & Well-being
    mood: 'Happy',
    appetite: 'Good',
    sleep: 'Good',
    
    // SECTION 6 — ADDITIONAL SUPPORTS PROVIDED
    additionalSupportsNarrative: '',
    
    // SECTION 7 — MEDICATION ADMINISTRATION
    medicationsAdministered: 'Yes',
    medicationsNotAdministeredReason: '',
    medicationRefusals: '',
    sideEffectsObserved: '',
    prnMedications: [],
    
    // SECTION 8 — SAFETY & INCIDENT SCREENING
    safetyIssues: false,
    safetyNarrative: '',
    incidentReportCompleted: 'Not required for this event',
    
    // SECTION 9 — INDEPENDENT LIVING SKILLS PRACTICED
    livingSkills: [],
    livingSkillsOther: '',
    livingSkillsNarrative: '',
    
    // Behaviors
    behaviors: [],
    behaviordetails: '',
    behaviortriggers: '',
    behaviorinterventions: '',
    
    // Goals worked on
    goalsworked: [],
    goalprogress: '',
    
    // Transportation
    transportation: '',
    
    // Narrative (kept for backward compatibility)
    narrative: '',
    
    // Incidents/Concerns
    incidentreported: false,
    incidentdetails: '',
    
    // Audit trail
    created_by: '',
    created_by_role: '',
    approved: false,
    approved_by: '',
    approved_date: '',




    // NEW: SECTION C — ISP LINKAGE
  ispGoalAddressed: false,
  selectedIspGoalId: '',
  selectedGoalDomain: '', // Auto-filled from goal
  
  // ENHANCED: SECTION D — CHOICE & AUTONOMY
  choiceOffered: false,
  choiceHonored: false,
  choiceExercisedDescription: '', // In addition to choiceAutonomyNarrative
  
  // ENHANCED: SECTION E — COMMUNITY ACTIVITY
  communityChoiceDocumented: false,
  linkedDailyNoteId: '', // For audit purposes
  
  // NEW: SECTION F — STAFF SIGN-OFF
  staffRole: userProfile?.role_name || '',
  electronicSignature: '',
  dateSigned: '',
  signatureConfirmed: false,
  
  // NEW: SYSTEM FIELDS
  documentationStatus: 'Draft', // Draft → Signed → Billing-Validated
  recordId: '',
  auditTimestamp: '',
  billingValidated: false,
    
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

  // Toggle functions for multi-select fields
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
      let query = supabase
        .from('individuals')
        .select('*')
        .eq('id', individualId);

      // Role-based filtering
      if (userProfile.role_id === 'HouseManager_DD') {
        query = query.eq('homeassignment', userProfile.facility);
      } else if (userProfile.role_id === 'DSP_DD') {
        query = query.eq('homeassignment', userProfile.facility);
      } else if (userProfile.division === 'MI' && !hasPermission(PERMISSIONS.FULL_ACCESS) && userProfile.role_id !== 'Residential_MI_Staff') {
        query = query.eq('division', 'MI');
      } else if (userProfile.division === 'SUD' && !hasPermission(PERMISSIONS.FULL_ACCESS)) {
        query = query.eq('division', 'SUD');
      }

      const { data, error } = await query.single();

      if (error) throw error;
      setIndividual(data);
    } catch (error) {
      console.error('Error fetching individual:', error);
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
      
      // Apply role-based filtering to daily notes
      let notes = data?.dailynotes || [];
      
      // Filter notes based on user permissions
      if (!hasPermission(PERMISSIONS.FULL_ACCESS)) {
        if (userProfile.role_id === 'DSP_DD') {
          // DSPs can only see notes they created or notes in their facility
          notes = notes.filter(note => 
            note.created_by === userProfile.fullname || 
            note.facility === userProfile.facility
          );
        } else if (userProfile.division === 'MI' && userProfile.role_id !== 'Residential_MI_Staff') {
          // MI staff see only MI division notes
          notes = notes.filter(note => note.division === 'MI');
        } else if (userProfile.division === 'SUD') {
          // SUD staff see only SUD division notes
          notes = notes.filter(note => note.division === 'SUD');
        }
      }
      
      setDailyNotes(notes);
    } catch (error) {
      console.error('Error fetching daily notes:', error);
      setDailyNotes([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to start editing a note
  const handleEditNote = (note) => {
    if (!canUserEditNote(note)) {
      alert('You do not have permission to edit this note.');
      return;
    }
    
    setEditingNote(note.id);
    setNoteForm({
      ...note,
      // Ensure arrays are properly set
      activities: note.activities || [],
      behaviors: note.behaviors || [],
      goalsworked: note.goalsworked || [],
      livingSkills: note.livingSkills || [],
      prnMedications: note.prnMedications || []
    });
    setShowAddModal(true);
  };

  // Function to cancel editing
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

  // UPDATE SAVE FUNCTION to handle new fields (around line 600)

const handleSaveNote = async (e) => {
  e.preventDefault();
  
  // Validate ISP Linkage
  if (noteForm.ispGoalAddressed && !noteForm.selectedIspGoalId) {
    alert('Please select an ISP Goal ID when "ISP Goal Addressed" is checked.');
    return;
  }
  
  // Validate Electronic Signature
  if (noteForm.electronicSignature !== noteForm.staffname) {
    alert('Electronic signature must match your staff name exactly.');
    return;
  }
  
  if (!noteForm.signatureConfirmed) {
    alert('Please confirm your signature by checking the certification box.');
    return;
  }
  
  // Validate Choice & Autonomy
  if (!noteForm.choiceExercisedDescription?.trim()) {
    alert('Please describe the choices exercised by the individual (HCBS requirement).');
    return;
  }

  try {
    setSaving(true);
    
    const now = new Date().toISOString();
    
    // Determine documentation status
    let docStatus = 'Draft';
    if (noteForm.electronicSignature === noteForm.staffname && noteForm.signatureConfirmed) {
      docStatus = 'Signed';
      // Auto-validate if user has approval permission
      if (canApproveDailyNotes) {
        docStatus = 'Billing-Validated';
      }
    }
    
    let newNote;
    
    if (editingNote) {
      newNote = {
        ...noteForm,
        id: editingNote,
        last_edited: now,
        last_edited_by: userProfile.fullname,
        last_edited_by_role: userProfile.role_name,
        documentationStatus: docStatus,
        dateSigned: now
      };
      
      const updatedNotes = dailyNotes.map(note => 
        note.id === editingNote ? newNote : note
      );
      
      const { error } = await supabase
        .from('individuals')
        .update({ 
          dailynotes: updatedNotes,
          last_activity: now
        })
        .eq('id', individualId);

      if (error) throw error;

      setDailyNotes(updatedNotes);
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
        billingValidated: docStatus === 'Billing-Validated'
      };

      const updatedNotes = [newNote, ...dailyNotes];

      const { error } = await supabase
        .from('individuals')
        .update({ 
          dailynotes: updatedNotes,
          last_activity: now
        })
        .eq('id', individualId);

      if (error) throw error;

      setDailyNotes(updatedNotes);
      alert(`Daily note saved successfully! Status: ${docStatus}`);
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
      const updatedNotes = dailyNotes.filter(note => note.id !== noteId);
      
      const { error } = await supabase
        .from('individuals')
        .update({ 
          dailynotes: updatedNotes,
          last_activity: new Date().toISOString()
        })
        .eq('id', individualId);

      if (error) throw error;

      setDailyNotes(updatedNotes);
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
  };

  const filteredNotes = dailyNotes.filter(note => {
    const matchesSearch = 
      note.narrative?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.staffname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.behaviordetails?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.activitydetails?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.ispGoalsNarrative?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.choiceAutonomyNarrative?.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  // Permission Check - No Access Screen
  if (!profileLoading && !canViewDailyNotes) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-950">
        <div className="text-center max-w-md">
          <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Access Restricted</h2>
          <p className="text-slate-400 mb-6">
            You do not have permission to view daily notes. Please contact your administrator if you believe this is an error.
          </p>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <p className="text-sm text-slate-400">Your Current Role:</p>
            <p className="text-lg font-bold text-emerald-400 mt-1">{userProfile?.role_name}</p>
            <p className="text-sm text-slate-500 mt-2">Division: {userProfile?.division}</p>
          </div>
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
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/individual/${individualId}`)}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-600/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="text-emerald-400" size={24} />
              <span className="text-2xl font-bold text-white">{filteredNotes.length}</span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Visible Notes</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="text-blue-400" size={24} />
              <span className="text-2xl font-bold text-white">
                {dailyNotes.filter(n => n.date === new Date().toISOString().split('T')[0]).length}
              </span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Today's Notes</p>
          </div>
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="text-purple-400" size={24} />
              <span className="text-2xl font-bold text-white">
                {dailyNotes.filter(n => n.communityouting).length}
              </span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Community Outings</p>
          </div>
          <div className="bg-gradient-to-br from-orange-600/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="text-orange-400" size={24} />
              <span className="text-2xl font-bold text-white">
                {dailyNotes.filter(n => n.incidentreported || n.safetyIssues).length}
              </span>
            </div>
            <p className="text-slate-300 text-sm font-semibold">Incidents/Safety Issues</p>
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
                  ? 'Start documenting daily activities and care' 
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
                      {/* Note Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center">
                            <Calendar className="text-white" size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
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
                              {note.approved && (
                                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-bold border border-green-500/30">
                                  Approved
                                </span>
                              )}
                              {note.last_edited && (
                                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full font-bold border border-blue-500/30">
                                  Edited
                                </span>
                              )}
                            </div>
                            <p className="text-slate-400 text-sm mt-1">
                              Documented by {note.staffname} • {new Date(note.timestamp).toLocaleTimeString()}
                              {note.created_by_role && ` • ${note.created_by_role}`}
                              {note.last_edited && ` • Last edited by ${note.last_edited_by}`}
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
                              title="Edit Note"
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
                              title="Delete Note"
                            >
                              <Trash2 size={16} className="text-red-400" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Quick Summary */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-1">Mood</p>
                          <p className="text-sm font-semibold text-white">{note.mood}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-1">Activities</p>
                          <p className="text-sm font-semibold text-white">{note.activities?.length || 0}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-1">Goals</p>
                          <p className="text-sm font-semibold text-white">{note.goalsworked?.length || 0}</p>
                        </div>
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-1">Community</p>
                          <p className="text-sm font-semibold text-white">
                            {note.communityouting ? 'Yes' : 'No'}
                          </p>
                        </div>
                      </div>

                      {/* Narrative Preview */}
                      {(note.narrative || note.ispGoalsNarrative || note.choiceAutonomyNarrative) && (
                        <div className="bg-slate-800/30 rounded-lg p-4">
                          <p className="text-sm text-slate-300 line-clamp-2">
                            {note.narrative || note.ispGoalsNarrative || note.choiceAutonomyNarrative}
                          </p>
                        </div>
                      )}

                      {/* Incident Alert */}
                      {(note.incidentreported || note.safetyIssues) && (
                        <div className="mt-4 flex items-center gap-2 text-orange-400 text-sm">
                          <AlertCircle size={16} />
                          <span className="font-semibold">
                            {note.incidentreported ? 'Incident reported' : 'Safety issue reported'} - requires review
                          </span>
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

      {/* Add/Edit Note Modal */}
      {(showAddModal && canCreateDailyNotes) && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center">
                  <ClipboardList className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {editingNote ? 'Edit Daily Service Note' : 'Daily Service Note'}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {editingNote ? 'Update existing daily note' : 'Document daily activities and care'}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleCancelEdit}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="text-slate-400" size={24} />
              </button>
            </div>

            <ScrollArea className="h-[calc(90vh-160px)]">
              <form onSubmit={handleSaveNote} className="p-6 space-y-8">
                {/* SECTION 1 — SHIFT DETAILS */}
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
                      <label className="block text-sm font-medium text-slate-300 mb-2">Time In</label>
                      <input
                        type="time"
                        name="shiftTimeIn"
                        value={noteForm.shiftTimeIn}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Time Out</label>
                      <input
                        type="time"
                        name="shiftTimeOut"
                        value={noteForm.shiftTimeOut}
                        onChange={handleInputChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

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

              

{/* SECTION C — ISP LINKAGE */}
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
      <div className="pl-8 space-y-4 animate-in fade-in">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select ISP Goal ID * <span className="text-xs text-slate-500">(Must belong to this individual and be Active)</span>
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
                {goal.description} (Domain: {goal.hcbsdomain || goal.domain || 'Other'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Goal Domain <span className="text-xs text-slate-500">(Auto-filled from selected goal)</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {['Independence', 'Community', 'Health', 'Behavior', 'Other'].map(domain => (
              <div 
                key={domain}
                className={`px-3 py-2 rounded-lg text-sm font-semibold text-center ${
                  noteForm.selectedGoalDomain === domain
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800/50 text-slate-400'
                }`}
              >
                {domain}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
          <p className="text-xs text-blue-400">
            📊 <strong>Audit Note:</strong> This linkage enables ISP Goal Implementation Reports, 
            Compliance Alerts, and HCBS Evidence Summaries. Daily notes without ISP linkage will NOT 
            count toward goal activity metrics.
          </p>
        </div>
      </div>
    )}

    {!noteForm.ispGoalAddressed && (
      <div className="pl-8 bg-slate-800/30 border border-slate-700 rounded-lg p-3">
        <p className="text-sm text-slate-400">
          ℹ️ No ISP goal was addressed during this service period. Note will be saved but will NOT count toward goal implementation metrics.
        </p>
      </div>
    )}
  </div>
</div>

                {/* SECTION 2 — ISP GOALS & SUPPORT PROVIDED */}
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
                    Narrative (Describe support provided for each goal):
                  </label>
                  <textarea
                    name="ispGoalsNarrative"
                    value={noteForm.ispGoalsNarrative}
                    onChange={handleInputChange}
                    placeholder="Example: 'Supported John in preparing his breakfast by prompting him through each step. He independently completed 3/5 steps.'"
                    rows="3"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

            

{/* SECTION D — CHOICE & AUTONOMY (ENHANCED) */}
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
        Describe choice exercised (activity, meal, schedule, etc.) *
      </label>
      <textarea
        name="choiceExercisedDescription"
        value={noteForm.choiceExercisedDescription}
        onChange={handleInputChange}
        placeholder="Example: 'Individual chose to wear blue shirt instead of red, chose pizza for lunch, decided to skip afternoon walk and read instead.'"
        rows="2"
        required
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Additional Choice & Autonomy Narrative:
      </label>
      <textarea
        name="choiceAutonomyNarrative"
        value={noteForm.choiceAutonomyNarrative}
        onChange={handleInputChange}
        placeholder="Provide additional context about how individual exercised autonomy today..."
        rows="2"
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
      />
    </div>
  </div>
</div>

                {/* SECTION 4 — DAILY ACTIVITIES & COMMUNITY INCLUSION */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Sparkles size={20} />
                    DAILY ACTIVITIES & COMMUNITY INCLUSION
                  </h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Activities Completed:</label>
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
                      placeholder="Describe meaningful activities completed today and how they supported independence, social skills, or inclusion..."
                      rows="2"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

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
                        Community Outing (if applicable)
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
                            placeholder="e.g., Local park, grocery store"
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
                            placeholder="e.g., Shopping, social visit"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Level of Participation</label>
                          <select
                            name="participationlevel"
                            value={noteForm.participationlevel}
                            onChange={handleInputChange}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                          >
                            {participationOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Transportation</label>
                          <input
                            type="text"
                            name="transportation"
                            value={noteForm.transportation}
                            onChange={handleInputChange}
                            placeholder="e.g., Agency van, public bus"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                          <div className="md:col-span-2">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="communityChoiceDocumented"
          checked={noteForm.communityChoiceDocumented}
          onChange={handleInputChange}
          className="w-5 h-5 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500"
        />
        <label className="text-white font-semibold">
          Choice Documented? * <span className="text-xs text-slate-400">(HCBS requirement for community activities)</span>
        </label>
      </div>
    </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 5 — HEALTH, BEHAVIOR, & WELLNESS OBSERVATIONS */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Stethoscope size={20} />
                     HEALTH, BEHAVIOR, & WELLNESS OBSERVATIONS
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Overall Mood</label>
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
                      <label className="block text-sm font-medium text-slate-300 mb-2">Sleep Quality</label>
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
                  
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Changes Noted (mood, behavior, appetite, sleep, hygiene, bowel movements, or overall wellness):
                  </label>
                  <textarea
                    name="healthChanges"
                    value={noteForm.healthChanges}
                    onChange={handleInputChange}
                    placeholder="Document any changes observed..."
                    rows="2"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                  
                  <div className="flex items-center gap-3 mt-4">
                    <input
                      type="checkbox"
                      name="noChangesBaseline"
                      checked={noteForm.noChangesBaseline}
                      onChange={handleInputChange}
                      className="w-5 h-5 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500"
                    />
                    <label className="text-white font-semibold">
                      No changes from baseline were observed
                    </label>
                  </div>
                </div>

                {/* Behaviors Section */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Brain size={20} />
                    Behaviors Observed
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
                      placeholder="Describe behaviors in detail..."
                      rows="2"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                    />
                    <textarea
                      name="behaviortriggers"
                      value={noteForm.behaviortriggers}
                      onChange={handleInputChange}
                      placeholder="Identify triggers (antecedents)..."
                      rows="2"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                    />
                    <textarea
                      name="behaviorinterventions"
                      value={noteForm.behaviorinterventions}
                      onChange={handleInputChange}
                      placeholder="Interventions used (consequences)..."
                      rows="2"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>
                </div>

                {/* SECTION 6 — ADDITIONAL SUPPORTS PROVIDED */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Users size={20} />
                     ADDITIONAL SUPPORTS PROVIDED
                  </h4>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Did the individual require extra support (behavioral, medical, emotional)? Describe what occurred and your response:
                  </label>
                  <textarea
                    name="additionalSupportsNarrative"
                    value={noteForm.additionalSupportsNarrative}
                    onChange={handleInputChange}
                    placeholder="Describe any additional supports provided..."
                    rows="3"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* SECTION 7 — MEDICATION ADMINISTRATION */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Bell size={20} />
                    MEDICATION ADMINISTRATION (MAR SUMMARY)
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Medications Administered as Scheduled:
                      </label>
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

                    {noteForm.medicationsAdministered === 'No' && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Explain:</label>
                        <textarea
                          name="medicationsNotAdministeredReason"
                          value={noteForm.medicationsNotAdministeredReason}
                          onChange={handleInputChange}
                          placeholder="Explain why medications were not administered..."
                          rows="2"
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Refusals / Missed Doses:</label>
                      <textarea
                        name="medicationRefusals"
                        value={noteForm.medicationRefusals}
                        onChange={handleInputChange}
                        placeholder="Document any medication refusals or missed doses..."
                        rows="2"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Side Effects Observed:</label>
                      <textarea
                        name="sideEffectsObserved"
                        value={noteForm.sideEffectsObserved}
                        onChange={handleInputChange}
                        placeholder="Document any observed side effects..."
                        rows="2"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    {/* PRN Medications */}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">PRN Medications Given:</label>
                      <div className="space-y-3 mb-3">
                        {noteForm.prnMedications.map(med => (
                          <div key={med.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-white">{med.medication}</p>
                                <p className="text-sm text-slate-400">Amount: {med.amount} • Time: {med.time}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handlePrnMedicationRemove(med.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <p className="text-sm text-slate-300 mb-1"><span className="text-slate-400">Reason:</span> {med.reason}</p>
                            <p className="text-sm text-slate-300"><span className="text-slate-400">Outcome:</span> {med.outcome}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <input
                          type="text"
                          placeholder="Medication"
                          value={prnMedication.medication}
                          onChange={(e) => setPrnMedication(prev => ({ ...prev, medication: e.target.value }))}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                        <input
                          type="text"
                          placeholder="Amount"
                          value={prnMedication.amount}
                          onChange={(e) => setPrnMedication(prev => ({ ...prev, amount: e.target.value }))}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                        <input
                          type="time"
                          placeholder="Time"
                          value={prnMedication.time}
                          onChange={(e) => setPrnMedication(prev => ({ ...prev, time: e.target.value }))}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                        <input
                          type="text"
                          placeholder="Reason for PRN"
                          value={prnMedication.reason}
                          onChange={(e) => setPrnMedication(prev => ({ ...prev, reason: e.target.value }))}
                          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                        />
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            placeholder="Outcome/Relief"
                            value={prnMedication.outcome}
                            onChange={(e) => setPrnMedication(prev => ({ ...prev, outcome: e.target.value }))}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handlePrnMedicationAdd}
                        className="px-4 py-2 bg-emerald-600/20 border border-emerald-500 text-emerald-400 rounded-lg font-semibold hover:bg-emerald-600/30 transition-all"
                      >
                        Add PRN Medication
                      </button>
                    </div>
                  </div>
                </div>

                {/* SECTION 8 — SAFETY & INCIDENT SCREENING */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <AlertCircle size={20} />
                     SAFETY & INCIDENT SCREENING
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="safetyIssues"
                        checked={noteForm.safetyIssues}
                        onChange={handleInputChange}
                        className="w-5 h-5 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500"
                      />
                      <label className="text-white font-semibold">
                        Safety issues, environmental concerns, accidents, injuries, or behavioral incidents
                      </label>
                    </div>

                    {noteForm.safetyIssues ? (
                      <div className="pl-8 space-y-4">
                        <textarea
                          name="safetyNarrative"
                          value={noteForm.safetyNarrative}
                          onChange={handleInputChange}
                          placeholder="Describe the safety issue or incident in detail..."
                          rows="3"
                          className="w-full bg-red-900/20 border border-red-500/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 resize-none"
                        />
                        
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            Did you complete an ADMH Incident Report (IR)?
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {incidentReportOptions.map(option => (
                              <button
                                key={option}
                                type="button"
                                onClick={() => setNoteForm(prev => ({ ...prev, incidentReportCompleted: option }))}
                                className={`px-4 py-2 border rounded-lg font-semibold ${
                                  noteForm.incidentReportCompleted === option
                                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 pl-8">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-slate-600 rounded"></div>
                        </div>
                        <span className="text-slate-300">No issues to report</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 9 — INDEPENDENT LIVING SKILLS PRACTICED */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <HomeIcon size={20} />
                    INDEPENDENT LIVING SKILLS PRACTICED
                  </h4>
                  <div className="space-y-4">
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
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Other:</label>
                      <input
                        type="text"
                        name="livingSkillsOther"
                        value={noteForm.livingSkillsOther}
                        onChange={handleInputChange}
                        placeholder="Specify other skills practiced"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Explain skills practiced and level of independence:
                      </label>
                      <textarea
                        name="livingSkillsNarrative"
                        value={noteForm.livingSkillsNarrative}
                        onChange={handleInputChange}
                        placeholder="Describe the skills practiced and the individual's level of independence..."
                        rows="3"
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Daily Narrative (existing field - keep for backward compatibility) */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <MessageSquare size={20} />
                    Daily Narrative (Optional Additional Notes)
                  </h4>
                  <textarea
                    name="narrative"
                    value={noteForm.narrative}
                    onChange={handleInputChange}
                    placeholder="Additional notes or summary of the day..."
                    rows="4"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                

{/* SECTION F — STAFF SIGN-OFF */}
<div>
  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
    <ClipboardCheck size={20} />
    STAFF SIGN-OFF (REQUIRED)
  </h4>
  
  <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-xl p-6 space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Staff Name * <span className="text-xs text-slate-500">(Auto-filled)</span>
        </label>
        <input
          type="text"
          name="staffname"
          value={noteForm.staffname}
          disabled
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none disabled:opacity-70"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Staff Role * <span className="text-xs text-slate-500">(Auto-filled)</span>
        </label>
        <input
          type="text"
          name="staffRole"
          value={noteForm.staffRole}
          disabled
          className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none disabled:opacity-70"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Electronic Signature * <span className="text-xs text-slate-500">(Type your full name to confirm)</span>
      </label>
      <input
        type="text"
        name="electronicSignature"
        value={noteForm.electronicSignature}
        onChange={handleInputChange}
        placeholder="Type your full name exactly as it appears above"
        required
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500"
      />
      {noteForm.electronicSignature && noteForm.electronicSignature !== noteForm.staffname && (
        <p className="text-red-400 text-xs mt-1">⚠️ Signature must match staff name exactly</p>
      )}
    </div>

    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Date Signed * <span className="text-xs text-slate-500">(Auto-filled with today's date)</span>
      </label>
      <input
        type="date"
        name="dateSigned"
        value={noteForm.dateSigned || new Date().toISOString().split('T')[0]}
        disabled
        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none disabled:opacity-70"
      />
    </div>

    <div className="flex items-start gap-3 pt-4 border-t border-slate-700">
      <input
        type="checkbox"
        name="signatureConfirmed"
        checked={noteForm.signatureConfirmed}
        onChange={handleInputChange}
        required
        className="w-5 h-5 bg-slate-800 border-slate-700 rounded focus:ring-orange-500 mt-0.5"
      />
      <label className="text-white text-sm">
        <strong>I certify that:</strong> The information documented in this daily service note is accurate and complete to the best of my knowledge. 
        I provided the services as described and witnessed the activities, behaviors, and events documented above. 
        My electronic signature confirms my accountability for this record. *
      </label>
    </div>

    {noteForm.electronicSignature === noteForm.staffname && noteForm.signatureConfirmed && (
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
        <p className="text-green-400 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          <strong>Signature Valid</strong> - This note will be marked as "Signed" and eligible for billing validation.
        </p>
      </div>
    )}
  </div>

  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 mt-4">
    <p className="text-xs text-blue-400">
      📋 <strong>Audit Rule:</strong> This note will appear in reports ONLY IF status = "Billing-Validated". 
      Unsigned notes remain in "Draft" status and are excluded from billing and compliance reports.
    </p>
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

      {/* View Note Detail Modal - Updated to show all new sections */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center">
                  <Eye className="text-white" size={24} />
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
                    title="Edit Note"
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
                {/* SECTION 1 — SHIFT DETAILS */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <Clock size={18} />
                    Shift Details
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Shift</p>
                      <p className="text-white font-semibold">{selectedNote.shift}</p>
                    </div>
                    {selectedNote.shiftTimeIn && (
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">Time In</p>
                        <p className="text-white font-semibold">{selectedNote.shiftTimeIn}</p>
                      </div>
                    )}
                    {selectedNote.shiftTimeOut && (
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">Time Out</p>
                        <p className="text-white font-semibold">{selectedNote.shiftTimeOut}</p>
                      </div>
                    )}
                    <div className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">Staff</p>
                      <p className="text-white font-semibold">{selectedNote.staffname}</p>
                      {selectedNote.created_by_role && (
                        <p className="text-xs text-slate-500 mt-1">{selectedNote.created_by_role}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* SECTION 2 — ISP GOALS & SUPPORT PROVIDED */}
                {selectedNote.ispGoalsNarrative && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                      <Target size={18} />
                      ISP Goals & Support Provided
                    </h4>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{selectedNote.ispGoalsNarrative}</p>
                    </div>
                  </div>
                )}

                {/* SECTION 3 — CHOICE & AUTONOMY */}
                {selectedNote.choiceAutonomyNarrative && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                      <CheckSquare size={18} />
                      Choice & Autonomy
                    </h4>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{selectedNote.choiceAutonomyNarrative}</p>
                    </div>
                  </div>
                )}

                {/* SECTION 4 — ACTIVITIES & COMMUNITY INCLUSION */}
                {(selectedNote.activities?.length > 0 || selectedNote.communityouting) && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                      <Sparkles size={18} />
                      Activities & Community Inclusion
                    </h4>
                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                      {selectedNote.activities?.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Activities:</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {selectedNote.activities.map(activity => (
                              <span key={activity} className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded text-xs font-semibold">
                                {activityTypes.find(a => a.value === activity)?.label || activity}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {selectedNote.activitydetails && (
                        <p className="text-slate-300 text-sm">{selectedNote.activitydetails}</p>
                      )}
                      {selectedNote.communityouting && (
                        <div className="pt-3 border-t border-slate-700">
                          <p className="text-sm font-semibold text-white mb-2">Community Outing:</p>
                          <div className="grid grid-cols-2 gap-3">
                            {selectedNote.outinglocation && (
                              <div>
                                <p className="text-xs text-slate-400">Location</p>
                                <p className="text-sm text-white">{selectedNote.outinglocation}</p>
                              </div>
                            )}
                            {selectedNote.outingpurpose && (
                              <div>
                                <p className="text-xs text-slate-400">Purpose</p>
                                <p className="text-sm text-white">{selectedNote.outingpurpose}</p>
                              </div>
                            )}
                            {selectedNote.participationlevel && (
                              <div>
                                <p className="text-xs text-slate-400">Participation</p>
                                <p className="text-sm text-white">{selectedNote.participationlevel}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION 5 — HEALTH, BEHAVIOR, & WELLNESS */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                    <Stethoscope size={18} />
                    Health, Behavior & Wellness
                  </h4>
                  <div className="grid grid-cols-3 gap-3 mb-3">
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
                  {selectedNote.healthChanges && (
                    <div className="bg-slate-800/50 rounded-lg p-4 mb-3">
                      <p className="text-xs text-slate-400 mb-2">Changes Noted:</p>
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{selectedNote.healthChanges}</p>
                    </div>
                  )}
                  {selectedNote.noChangesBaseline && (
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                      <CheckCircle size={16} />
                      <span>No changes from baseline were observed</span>
                    </div>
                  )}
                </div>

                {/* SECTION 6 — ADDITIONAL SUPPORTS */}
                {selectedNote.additionalSupportsNarrative && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                      <Users size={18} />
                      Additional Supports Provided
                    </h4>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{selectedNote.additionalSupportsNarrative}</p>
                    </div>
                  </div>
                )}

                {/* SECTION 7 — MEDICATION ADMINISTRATION */}
                {(selectedNote.medicationsAdministered || selectedNote.prnMedications?.length > 0) && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                      <Bell size={18} />
                      Medication Administration
                    </h4>
                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                      {selectedNote.medicationsAdministered && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Medications Administered:</p>
                          <p className="text-white font-semibold">{selectedNote.medicationsAdministered}</p>
                          {selectedNote.medicationsAdministered === 'No' && selectedNote.medicationsNotAdministeredReason && (
                            <p className="text-slate-300 text-sm mt-2">{selectedNote.medicationsNotAdministeredReason}</p>
                          )}
                        </div>
                      )}
                      {selectedNote.medicationRefusals && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Refusals / Missed Doses:</p>
                          <p className="text-slate-300 text-sm">{selectedNote.medicationRefusals}</p>
                        </div>
                      )}
                      {selectedNote.sideEffectsObserved && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Side Effects Observed:</p>
                          <p className="text-slate-300 text-sm">{selectedNote.sideEffectsObserved}</p>
                        </div>
                      )}
                      {selectedNote.prnMedications?.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">PRN Medications Given:</p>
                          <div className="space-y-2 mt-2">
                            {selectedNote.prnMedications.map((med, index) => (
                              <div key={index} className="bg-slate-900/50 rounded p-3">
                                <p className="font-semibold text-white">{med.medication}</p>
                                <p className="text-sm text-slate-400">Amount: {med.amount} • Time: {med.time}</p>
                                <p className="text-sm text-slate-300 mt-1">Reason: {med.reason}</p>
                                <p className="text-sm text-slate-300">Outcome: {med.outcome}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION 8 — SAFETY & INCIDENT SCREENING */}
                {(selectedNote.safetyIssues || selectedNote.safetyNarrative) && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                      <AlertCircle size={18} />
                      Safety & Incident Screening
                    </h4>
                    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                      {selectedNote.safetyNarrative && (
                        <p className="text-slate-300 text-sm whitespace-pre-wrap mb-3">{selectedNote.safetyNarrative}</p>
                      )}
                      {selectedNote.incidentReportCompleted && (
                        <p className="text-sm text-slate-400">
                          Incident Report: {selectedNote.incidentReportCompleted}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* SECTION 9 — INDEPENDENT LIVING SKILLS */}
                {selectedNote.livingSkills?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                      <HomeIcon size={18} />
                      Independent Living Skills Practiced
                    </h4>
                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedNote.livingSkills.map(skill => {
                          const skillLabel = livingSkills.find(s => s.value === skill)?.label || skill;
                          return (
                            <span key={skill} className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/30">
                              {skillLabel}
                            </span>
                          );
                        })}
                        {selectedNote.livingSkillsOther && (
                          <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-semibold border border-blue-500/30">
                            {selectedNote.livingSkillsOther}
                          </span>
                        )}
                      </div>
                      {selectedNote.livingSkillsNarrative && (
                        <p className="text-slate-300 text-sm whitespace-pre-wrap">{selectedNote.livingSkillsNarrative}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Original Narrative (for backward compatibility) */}
                {selectedNote.narrative && !selectedNote.ispGoalsNarrative && !selectedNote.choiceAutonomyNarrative && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
                      <MessageSquare size={18} />
                      Daily Narrative
                    </h4>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{selectedNote.narrative}</p>
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-center pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-500">
                    Documented on {new Date(selectedNote.timestamp).toLocaleString()}
                    {selectedNote.created_by_role && ` • Role: ${selectedNote.created_by_role}`}
                    {selectedNote.last_edited && ` • Last edited on ${new Date(selectedNote.last_edited).toLocaleString()} by ${selectedNote.last_edited_by}`}
                  </p>
                </div>
              </div>
            </ScrollArea>

            <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
              {canDeleteDailyNotes && (
                <button
                  onClick={() => handleDeleteNote(selectedNote.id)}
                  className="px-6 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl font-semibold transition-all"
                >
                  Delete Note
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


