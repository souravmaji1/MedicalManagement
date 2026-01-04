'use client'

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Plus, Trash2, Calendar, Clock, 
  Activity, Heart, Target, Users, CheckCircle,
  AlertCircle, Edit2, Eye, Filter, Search,
  Home as HomeIcon, Utensils, Shirt, Bath, Bed,
  Smile, Frown, Meh, MessageSquare, MapPin,
  FileText, User, Loader2, ChevronDown, ChevronRight,
  TrendingUp, Award, Brain, Sparkles, Coffee, Book,
  Music, Palette, Dumbbell, X, Copy, Shield
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

  // Form state for daily note
  const [noteForm, setNoteForm] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: 'Day',
    staffname: user?.fullName || '',
    staffid: user?.id || '',
    
    // ADLs
    bathing: 'Independent',
    dressing: 'Independent',
    grooming: 'Independent',
    toileting: 'Independent',
    eating: 'Independent',
    mobility: 'Independent',
    
    // Activities
    activities: [],
    activitydetails: '',
    
    // Behaviors
    behaviors: [],
    behaviordetails: '',
    behaviortriggers: '',
    behaviorinterventions: '',
    
    // Goals worked on
    goalsworked: [],
    goalprogress: '',
    
    // Community/HCBS
    communityouting: false,
    outinglocation: '',
    outingduration: '',
    choiceoffered: '',
    choicetaken: '',
    skillspracticed: '',
    transportation: '',
    
    // Mood & Well-being
    mood: 'Happy',
    appetite: 'Good',
    sleep: 'Good',
    
    // Narrative
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
    
    timestamp: new Date().toISOString()
  });

  const adlOptions = ['Independent', 'Verbal Prompt', 'Physical Assist', 'Total Assist', 'Refused', 'N/A'];
  const shiftOptions = ['Day (6am-2pm)', 'Evening (2pm-10pm)', 'Night (10pm-6am)', 'Other'];
  const moodOptions = ['Happy', 'Calm', 'Anxious', 'Sad', 'Frustrated', 'Excited', 'Neutral'];
  const appetiteOptions = ['Good', 'Fair', 'Poor', 'Refused'];
  const sleepOptions = ['Good', 'Fair', 'Poor', 'Restless', 'N/A'];

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNoteForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  const handleSaveNote = async (e) => {
    e.preventDefault();
    
    if (!canCreateDailyNotes) {
      alert('You do not have permission to create daily notes.');
      return;
    }

    try {
      setSaving(true);
      
      const newNote = {
        ...noteForm,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        created_by: userProfile.fullname,
        created_by_role: userProfile.role_name,
        facility: userProfile.facility,
        division: userProfile.division,
        approved: canApproveDailyNotes // Auto-approve if user has approval permission
      };

      const updatedNotes = [newNote, ...dailyNotes];

      const { error } = await supabase
        .from('individuals')
        .update({ 
          dailynotes: updatedNotes,
          last_activity: new Date().toISOString()
        })
        .eq('id', individualId);

      if (error) throw error;

      setDailyNotes(updatedNotes);
      setShowAddModal(false);
      resetForm();
      alert('Daily note saved successfully!');
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error saving note. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndAddAnother = async (e) => {
    e.preventDefault();
    await handleSaveNote(e);
    setShowAddModal(true);
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
      alert('Daily note deleted successfully.');
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting daily note.');
    }
  };

  const resetForm = () => {
    setNoteForm({
      date: new Date().toISOString().split('T')[0],
      shift: 'Day',
      staffname: user?.fullName || '',
      staffid: user?.id || '',
      bathing: 'Independent',
      dressing: 'Independent',
      grooming: 'Independent',
      toileting: 'Independent',
      eating: 'Independent',
      mobility: 'Independent',
      activities: [],
      activitydetails: '',
      behaviors: [],
      behaviordetails: '',
      behaviortriggers: '',
      behaviorinterventions: '',
      goalsworked: [],
      goalprogress: '',
      communityouting: false,
      outinglocation: '',
      outingduration: '',
      choiceoffered: '',
      choicetaken: '',
      skillspracticed: '',
      transportation: '',
      mood: 'Happy',
      appetite: 'Good',
      sleep: 'Good',
      narrative: '',
      incidentreported: false,
      incidentdetails: '',
      created_by: '',
      created_by_role: '',
      approved: false,
      approved_by: '',
      approved_date: '',
      timestamp: new Date().toISOString()
    });
  };

  const filteredNotes = dailyNotes.filter(note => {
    const matchesSearch = 
      note.narrative?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.staffname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.behaviordetails?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.activitydetails?.toLowerCase().includes(searchTerm.toLowerCase());
    
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
            onClick={() => router.push('/dashboard')}
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
            onClick={() => router.push('/individuals')}
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
              onClick={() => setShowAddModal(true)}
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
                {dailyNotes.filter(n => n.incidentreported).length}
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
                  ? 'Start documenting daily activities and care' 
                  : 'Try adjusting your search or filters'}
              </p>
              {canCreateDailyNotes && (
                <button
                  onClick={() => setShowAddModal(true)}
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
                            </div>
                            <p className="text-slate-400 text-sm mt-1">
                              Documented by {note.staffname} • {new Date(note.timestamp).toLocaleTimeString()}
                              {note.created_by_role && ` • ${note.created_by_role}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MoodIcon className={`${getMoodColor(note.mood)}`} size={24} />
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
                      {note.narrative && (
                        <div className="bg-slate-800/30 rounded-lg p-4">
                          <p className="text-sm text-slate-300 line-clamp-2">{note.narrative}</p>
                        </div>
                      )}

                      {/* Incident Alert */}
                      {note.incidentreported && (
                        <div className="mt-4 flex items-center gap-2 text-orange-400 text-sm">
                          <AlertCircle size={16} />
                          <span className="font-semibold">Incident reported - requires review</span>
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
      {showAddModal && canCreateDailyNotes && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/95 backdrop-blur-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center">
                  <Plus className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Daily Service Note</h3>
                  <p className="text-slate-400 text-sm">Document daily activities and care</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="text-slate-400" size={24} />
              </button>
            </div>

            <ScrollArea className="h-[calc(90vh-160px)]">
              <form onSubmit={handleSaveNote} className="p-6 space-y-8">
                {/* Basic Information */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Calendar size={20} />
                    Basic Information
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
                      <label className="block text-sm font-medium text-slate-300 mb-2">Shift *</label>
                      <select
                        name="shift"
                        value={noteForm.shift}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                      >
                        {shiftOptions.map(shift => (
                          <option key={shift} value={shift}>{shift}</option>
                        ))}
                      </select>
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

                {/* Activities */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Sparkles size={20} />
                    Activities Participated
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {activityTypes.map(activity => {
                      const Icon = activity.icon;
                      const isSelected = noteForm.activities.includes(activity.value);
                      return (
                        <button
                          key={activity.value}
                          type="button"
                          onClick={() => toggleActivity(activity.value)}
                          className={`p-4 border rounded-xl transition-all flex flex-col items-center gap-2 ${
                            isSelected
                              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                              : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          <Icon size={24} />
                          <span className="text-sm font-semibold text-center">{activity.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <textarea
                    name="activitydetails"
                    value={noteForm.activitydetails}
                    onChange={handleInputChange}
                    placeholder="Describe activities in detail..."
                    rows="3"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Goals Worked On */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Target size={20} />
                    Goals Worked On
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
                  <textarea
                    name="goalprogress"
                    value={noteForm.goalprogress}
                    onChange={handleInputChange}
                    placeholder="Describe progress on goals..."
                    rows="3"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Behaviors */}
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

                {/* Community/HCBS Documentation */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <MapPin size={20} />
                    Community Integration & HCBS
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
                        Community outing occurred today
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
                          <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
                          <input
                            type="text"
                            name="outingduration"
                            value={noteForm.outingduration}
                            onChange={handleInputChange}
                            placeholder="e.g., 2 hours"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                          />
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
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Skills Practiced</label>
                          <input
                            type="text"
                            name="skillspracticed"
                            value={noteForm.skillspracticed}
                            onChange={handleInputChange}
                            placeholder="e.g., Money handling, social interaction"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-300 mb-2">Choice Offered</label>
                          <textarea
                            name="choiceoffered"
                            value={noteForm.choiceoffered}
                            onChange={handleInputChange}
                            placeholder="What choices were offered?"
                            rows="2"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-300 mb-2">Choice Taken</label>
                          <textarea
                            name="choicetaken"
                            value={noteForm.choicetaken}
                            onChange={handleInputChange}
                            placeholder="What did the individual choose?"
                            rows="2"
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mood & Well-being */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <Heart size={20} />
                    Mood & Well-being
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                </div>

                {/* Narrative */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <MessageSquare size={20} />
                    Daily Narrative
                  </h4>
                  <textarea
                    name="narrative"
                    value={noteForm.narrative}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed narrative of the day's events, interactions, and observations..."
                    rows="6"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Incidents/Concerns */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                    <AlertCircle size={20} />
                    Incidents/Concerns
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="incidentreported"
                        checked={noteForm.incidentreported}
                        onChange={handleInputChange}
                        className="w-5 h-5 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500"
                      />
                      <label className="text-white font-semibold">
                        Incident or concern to report
                      </label>
                    </div>

                    {noteForm.incidentreported && (
                      <div className="pl-8">
                        <textarea
                          name="incidentdetails"
                          value={noteForm.incidentdetails}
                          onChange={handleInputChange}
                          placeholder="Describe the incident or concern in detail..."
                          rows="4"
                          className="w-full bg-red-900/20 border border-red-500/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 resize-none"
                        />
                        <p className="text-sm text-orange-400 mt-2 flex items-center gap-2">
                          <AlertCircle size={16} />
                          Remember to file a formal incident report in the IPMS module
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-700">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  {canCreateDailyNotes && (
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
                    {saving ? 'Saving...' : 'Save Note'}
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
              <button 
                onClick={() => setSelectedNote(null)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-all"
              >
                <X className="text-slate-400" size={24} />
              </button>
            </div>

            <ScrollArea className="h-[calc(90vh-160px)]">
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Shift</p>
                    <p className="text-white font-semibold">{selectedNote.shift}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <p className="text-xs text-slate-400 mb-1">Staff</p>
                    <p className="text-white font-semibold">{selectedNote.staffname}</p>
                    {selectedNote.created_by_role && (
                      <p className="text-xs text-slate-500 mt-1">{selectedNote.created_by_role}</p>
                    )}
                  </div>
                </div>

                {/* ADLs */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-3">ADL Summary</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Bathing', value: selectedNote.bathing },
                      { label: 'Dressing', value: selectedNote.dressing },
                      { label: 'Grooming', value: selectedNote.grooming },
                      { label: 'Toileting', value: selectedNote.toileting },
                      { label: 'Eating', value: selectedNote.eating },
                      { label: 'Mobility', value: selectedNote.mobility }
                    ].map(adl => (
                      <div key={adl.label} className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-1">{adl.label}</p>
                        <p className="text-sm font-semibold text-white">{adl.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activities */}
                {selectedNote.activities?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-400 mb-3">Activities</h4>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {selectedNote.activities.map(activity => (
                          <span key={activity} className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-sm font-semibold border border-emerald-500/30">
                            {activityTypes.find(a => a.value === activity)?.label || activity}
                          </span>
                        ))}
                      </div>
                      {selectedNote.activitydetails && (
                        <p className="text-slate-300 text-sm">{selectedNote.activitydetails}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Goals */}
                {selectedNote.goalsworked?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-400 mb-3">Goals Worked On</h4>
                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-2">
                      {selectedNote.goalsworked.map(goalId => {
                        const goal = individual.goals?.find(g => g.id === goalId);
                        return goal ? (
                          <div key={goalId} className="flex items-center gap-2 text-sm">
                            <CheckCircle size={16} className="text-blue-400" />
                            <span className="text-slate-300">{goal.description}</span>
                          </div>
                        ) : null;
                      })}
                      {selectedNote.goalprogress && (
                        <p className="text-slate-300 text-sm mt-3 pt-3 border-t border-slate-700">
                          {selectedNote.goalprogress}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Behaviors */}
                {selectedNote.behaviors?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-400 mb-3">Behaviors</h4>
                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {selectedNote.behaviors.map(behavior => (
                          <span key={behavior} className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-sm font-semibold border border-purple-500/30">
                            {behavior}
                          </span>
                        ))}
                      </div>
                      {selectedNote.behaviordetails && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Details:</p>
                          <p className="text-slate-300 text-sm">{selectedNote.behaviordetails}</p>
                        </div>
                      )}
                      {selectedNote.behaviortriggers && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Triggers:</p>
                          <p className="text-slate-300 text-sm">{selectedNote.behaviortriggers}</p>
                        </div>
                      )}
                      {selectedNote.behaviorinterventions && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Interventions:</p>
                          <p className="text-slate-300 text-sm">{selectedNote.behaviorinterventions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Community Outing */}
                {selectedNote.communityouting && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-400 mb-3">Community Outing</h4>
                    <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {selectedNote.outinglocation && (
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Location</p>
                            <p className="text-white font-semibold">{selectedNote.outinglocation}</p>
                          </div>
                        )}
                        {selectedNote.outingduration && (
                          <div>
                            <p className="text-xs text-slate-400 mb-1">Duration</p>
                            <p className="text-white font-semibold">{selectedNote.outingduration}</p>
                          </div>
                        )}
                      </div>
                      {selectedNote.choiceoffered && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Choice Offered:</p>
                          <p className="text-slate-300 text-sm">{selectedNote.choiceoffered}</p>
                        </div>
                      )}
                      {selectedNote.choicetaken && (
                        <div>
                          <p className="text-xs text-slate-400 mb-1">Choice Taken:</p>
                          <p className="text-slate-300 text-sm">{selectedNote.choicetaken}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Mood & Well-being */}
                <div>
                  <h4 className="text-lg font-bold text-emerald-400 mb-3">Mood & Well-being</h4>
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

                {/* Narrative */}
                {selectedNote.narrative && (
                  <div>
                    <h4 className="text-lg font-bold text-emerald-400 mb-3">Daily Narrative</h4>
                    <div className="bg-slate-800/50 rounded-lg p-4">
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{selectedNote.narrative}</p>
                    </div>
                  </div>
                )}

                {/* Incident */}
                {selectedNote.incidentreported && (
                  <div>
                    <h4 className="text-lg font-bold text-orange-400 mb-3 flex items-center gap-2">
                      <AlertCircle size={20} />
                      Incident Reported
                    </h4>
                    <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                      <p className="text-slate-300 text-sm whitespace-pre-wrap">{selectedNote.incidentdetails}</p>
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-center pt-4 border-t border-slate-700">
                  <p className="text-xs text-slate-500">
                    Documented on {new Date(selectedNote.timestamp).toLocaleString()}
                    {selectedNote.created_by_role && ` • Role: ${selectedNote.created_by_role}`}
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