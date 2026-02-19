'use client'

import React, { useState } from 'react';
import { 
  CreditCard, DollarSign, FileText, TrendingUp, Users, Settings, Menu,
  ChevronRight, Shield, ChevronLeft, Home, Pill, AlertTriangle, NetworkIcon, User2Icon,
  TrendingUp as TrendingUpIcon, Loader2, MapPin, Activity, Bell, 
  Search, ChevronDown, X, ExternalLink, Globe
} from 'lucide-react';
import { ScrollArea } from "../../../components/ui/scroll-area";
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '../../../contexts/userProfileContext';
import { UserButton } from '@clerk/nextjs';
import { useTheme } from '../../../contexts/themeContext';
import ThemeToggle from '../../../components/themeToggle';

const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);

const stateMedicaidUrls = {
  'alabama': { name: 'Alabama', url: 'https://medicaid.alabama.gov/' },
  'alaska': { name: 'Alaska', url: 'http://dhss.alaska.gov/dpa/Pages/medicaid/default.aspx' },
  'arizona': { name: 'Arizona', url: 'https://www.azahcccs.gov/' },
  'arkansas': { name: 'Arkansas', url: 'https://humanservices.arkansas.gov/divisions-shared-services/medical-services/' },
  'california': { name: 'California', url: 'https://www.dhcs.ca.gov/services/medi-cal/Pages/default.aspx' },
  'colorado': { name: 'Colorado', url: 'https://www.healthfirstcolorado.com/' },
  'connecticut': { name: 'Connecticut', url: 'https://portal.ct.gov/DSS/Services/Health-and-Home-Care' },
  'delaware': { name: 'Delaware', url: 'https://dhss.delaware.gov/dhss/dmma/' },
  'district-of-columbia': { name: 'District of Columbia', url: 'https://dchealth.dc.gov/service/medicaid' },
  'florida': { name: 'Florida', url: 'https://ahca.myflorida.com/medicaid/' },
  'georgia': { name: 'Georgia', url: 'https://medicaid.georgia.gov/' },
  'hawaii': { name: 'Hawaii', url: 'https://medquest.hawaii.gov/' },
  'idaho': { name: 'Idaho', url: 'https://healthandwelfare.idaho.gov/Medical/Medicaid/tabid/123/Default.aspx' },
  'illinois': { name: 'Illinois', url: 'https://www.illinois.gov/hfs/MedicalPrograms/AllKids/Pages/medical.aspx' },
  'indiana': { name: 'Indiana', url: 'https://www.in.gov/medicaid/' },
  'iowa': { name: 'Iowa', url: 'https://dhs.iowa.gov/ime/members' },
  'kansas': { name: 'Kansas', url: 'https://www.kancare.ks.gov/' },
  'kentucky': { name: 'Kentucky', url: 'https://chfs.ky.gov/agencies/dms/Pages/default.aspx' },
  'louisiana': { name: 'Louisiana', url: 'https://ldh.la.gov/index.cfm/subhome/1' },
  'maine': { name: 'Maine', url: 'https://www.maine.gov/dhhs/ofi/programs-services/health-care-assistance' },
  'maryland': { name: 'Maryland', url: 'https://health.maryland.gov/mmcp/Pages/home.aspx' },
  'massachusetts': { name: 'Massachusetts', url: 'https://www.mass.gov/topics/masshealth' },
  'michigan': { name: 'Michigan', url: 'https://www.michigan.gov/mdhhs/0,5885,7-339-71547_4860,00.html' },
  'minnesota': { name: 'Minnesota', url: 'https://mn.gov/dhs/people-we-serve/adults/health-care/health-care-programs/programs-and-services/medical-assistance.jsp' },
  'mississippi': { name: 'Mississippi', url: 'https://medicaid.ms.gov/' },
  'missouri': { name: 'Missouri', url: 'https://mydss.mo.gov/healthcare' },
  'montana': { name: 'Montana', url: 'https://dphhs.mt.gov/MontanaHealthcarePrograms/MemberServices' },
  'nebraska': { name: 'Nebraska', url: 'http://dhhs.ne.gov/Pages/Medicaid-Eligibility.aspx' },
  'nevada': { name: 'Nevada', url: 'https://dwss.nv.gov/Medical/MEDICAID/' },
  'new-hampshire': { name: 'New Hampshire', url: 'https://www.dhhs.nh.gov/ombp/medicaid/' },
  'new-jersey': { name: 'New Jersey', url: 'http://www.njfamilycare.org/' },
  'new-mexico': { name: 'New Mexico', url: 'https://www.hsd.state.nm.us/lookingforassistance/medical_assistance_division/' },
  'new-york': { name: 'New York', url: 'https://www.health.ny.gov/health_care/medicaid/' },
  'north-carolina': { name: 'North Carolina', url: 'https://medicaid.ncdhhs.gov/' },
  'north-dakota': { name: 'North Dakota', url: 'https://www.nd.gov/dhs/services/medicalserv/medicaid/' },
  'ohio': { name: 'Ohio', url: 'https://medicaid.ohio.gov/' },
  'oklahoma': { name: 'Oklahoma', url: 'https://oklahoma.gov/ohca/individuals.html' },
  'oregon': { name: 'Oregon', url: 'https://www.oregon.gov/oha/HSD/OHP/Pages/index.aspx' },
  'pennsylvania': { name: 'Pennsylvania', url: 'https://www.dhs.pa.gov/Services/Assistance/Pages/Medical-Assistance.aspx' },
  'rhode-island': { name: 'Rhode Island', url: 'http://www.eohhs.ri.gov/Consumer/FamilieswithChildren/HealthCare.aspx' },
  'south-carolina': { name: 'South Carolina', url: 'https://www.scdhhs.gov/' },
  'south-dakota': { name: 'South Dakota', url: 'https://dss.sd.gov/medicaid/' },
  'tennessee': { name: 'Tennessee', url: 'https://www.tn.gov/tenncare.html' },
  'texas': { name: 'Texas', url: 'https://hhs.texas.gov/services/health/medicaid-chip' },
  'utah': { name: 'Utah', url: 'https://medicaid.utah.gov/' },
  'vermont': { name: 'Vermont', url: 'https://www.greenmountaincare.org/' },
  'virginia': { name: 'Virginia', url: 'https://www.virginiamedicaid.dmas.virginia.gov/' },
  'washington': { name: 'Washington', url: 'https://www.hca.wa.gov/health-care-services-supports/apple-health-medicaid-coverage' },
  'west-virginia': { name: 'West Virginia', url: 'https://dhhr.wv.gov/bms/Pages/default.aspx' },
  'wisconsin': { name: 'Wisconsin', url: 'https://www.dhs.wisconsin.gov/medicaid/index.htm' },
  'wyoming': { name: 'Wyoming', url: 'https://health.wyo.gov/healthcarefin/medicaid/' }
};

const BillingPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { userProfile, loading: profileLoading } = useUserProfile();
  const { isDark } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('billing');
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState('alabama');
  const [showStateDropdown, setShowStateDropdown] = useState(false);

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

  const handleBillingRedirect = () => {
    const selectedStateData = stateMedicaidUrls[selectedState];
    if (selectedStateData) {
      window.open(selectedStateData.url, '_blank', 'noopener,noreferrer');
    }
  };

  // NavBar Component
  const NavBar = () => (
    <div className={`backdrop-blur-xl border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-2xl ${
      isDark
        ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-900/20 border-slate-800/50'
        : 'bg-gradient-to-r from-white via-white to-emerald-50 border-emerald-100'
    }`}>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`lg:hidden p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
            isDark ? 'hover:bg-white/10' : 'hover:bg-emerald-50'
          }`}
        >
          {sidebarOpen
            ? <X size={20} className={isDark ? 'text-white' : 'text-slate-700'} />
            : <Menu size={20} className={isDark ? 'text-white' : 'text-slate-700'} />}
        </button>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-pulse">
              <Activity className="text-white" size={26} />
            </div>
            <div className={`absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 animate-pulse ${isDark ? 'border-slate-900' : 'border-white'}`}></div>
          </div>
          <div>
            <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
              CareBridge Pro
            </h1>
            <p className={`text-xs font-medium tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>IPMS Aligned EMR</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className={`hidden md:flex items-center gap-3 backdrop-blur-sm rounded-2xl px-5 py-2.5 w-96 border transition-all duration-300 ${
          isDark
            ? 'bg-slate-800/50 border-slate-700/50 hover:border-emerald-500/50'
            : 'bg-slate-100 border-slate-200 hover:border-emerald-400'
        }`}>
          <Search size={18} className="text-emerald-500" />
          <input
            type="text"
            placeholder="Search billing records..."
            className={`bg-transparent border-none outline-none text-sm w-full ${
              isDark ? 'text-white placeholder:text-slate-500' : 'text-slate-800 placeholder:text-slate-400'
            }`}
          />
          <kbd className={`px-2 py-0.5 text-xs rounded font-mono ${isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-500'}`}>⌘K</kbd>
        </div>

        <button className={`relative p-2.5 rounded-xl transition-all duration-300 hover:scale-105 group ${isDark ? 'hover:bg-white/10' : 'hover:bg-emerald-50'}`}>
          <Bell size={20} className={`transition-colors group-hover:text-emerald-500 ${isDark ? 'text-slate-300' : 'text-slate-600'}`} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-lime-500 to-green-600 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
        </button>

        <ThemeToggle />

        <div className={`flex items-center gap-3 pl-4 border-l cursor-pointer rounded-xl p-2 transition-all duration-300 group ${
          isDark ? 'border-slate-700/50 hover:bg-white/5' : 'border-emerald-100 hover:bg-emerald-50'
        }`}>
          <div className="text-right hidden sm:block">
            <p className={`text-sm font-semibold transition-colors group-hover:text-emerald-500 ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {userProfile?.fullname || 'User'}
            </p>
            <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {userProfile?.role_name || 'Staff'} • Online
            </p>
          </div>
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/50">
              <UserButton afterSignOutUrl="/" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 ${isDark ? 'border-slate-900' : 'border-white'}`}></div>
          </div>
          <ChevronDown size={16} className={`transition-colors group-hover:text-emerald-500 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
        </div>
      </div>
    </div>
  );

  // Sidebar Component
  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-72 border-r transition-all duration-300 flex flex-col backdrop-blur-xl h-screen ${
      isDark
        ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-900/10 border-slate-800/50'
        : 'bg-gradient-to-b from-white via-white to-emerald-50 border-emerald-100'
    }`}>
      <div className={`p-6 border-b flex-shrink-0 ${isDark ? 'border-slate-800/50' : 'border-emerald-100'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>System Online</span>
          </div>
          <div className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
            <span className="text-emerald-600 text-xs font-bold">v2.0</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Billing Status</span>
            <span className="text-xs text-emerald-600 font-bold">Active</span>
          </div>
          <div className={`w-full rounded-full h-2 overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-emerald-100'}`}>
            <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        <div className="mb-2 px-3">
          <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Main Menu</span>
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                if (item.id !== 'billing') {
                  router.push(`/${item.id === 'dashboard' ? 'dashboard' : item.id}`);
                }
                if (window.innerWidth < 1024) setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl mb-2 transition-all duration-300 group relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/50 scale-105'
                  : isDark
                    ? 'text-slate-400 hover:bg-white/5 hover:text-white hover:scale-105'
                    : 'text-slate-600 hover:bg-emerald-50 hover:text-slate-900 hover:scale-105'
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
                    : 'bg-emerald-500/20 text-emerald-600 border border-emerald-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
              {isActive && <ChevronRight size={16} className="relative z-10 animate-pulse" />}
            </button>
          );
        })}
      </ScrollArea>

      <div className={`p-4 border-t space-y-3 flex-shrink-0 ${isDark ? 'border-slate-800/50' : 'border-emerald-100'}`}>
        <div className={`rounded-xl p-4 border border-emerald-500/30 backdrop-blur-sm relative overflow-hidden ${
          isDark ? 'bg-gradient-to-br from-emerald-900/30 via-teal-900/30 to-green-900/30' : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50'
        }`}>
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="text-emerald-500" size={18} />
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>IPMS Certified</p>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Alabama DD Compliant System</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isLoaded || profileLoading) {
    return (
      <div className={`flex items-center justify-center h-screen ${isDark ? 'bg-slate-950' : 'bg-emerald-50'}`}>
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Loading billing...</p>
        </div>
      </div>
    );
  }

  const selectedStateData = stateMedicaidUrls[selectedState];

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      <div className="flex flex-1 overflow-hidden">
  
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <main className="p-6 lg:p-8">
              <div className="space-y-8 animate-in fade-in duration-500">

                {/* Header */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500">
                        Billing Management
                      </h2>
                      <div className="px-3 py-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-full">
                        <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                          <DollarSign size={12} /> IPMS
                        </span>
                      </div>
                    </div>
                    <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Integrated Billing & Revenue Management
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => router.push('/')}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 border ${
                        isDark
                          ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                          : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <ChevronLeft size={18} />
                      Back to Home
                    </button>
                  </div>
                </div>

                {/* State Selection */}
                <div className={`rounded-2xl border p-6 ${
                  isDark
                    ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-900/20 border-slate-800/50'
                    : 'bg-white border-emerald-100 shadow-sm'
                }`}>
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <Globe className="text-emerald-500" size={24} />
                        <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Select Your State</h3>
                      </div>
                      <p className={`mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Choose your state to access the appropriate Medicaid billing portal. Each state has its own Medicaid system with specific requirements and procedures.
                      </p>

                      {/* State Dropdown */}
                      <div className="relative max-w-md">
                        <button
                          onClick={() => setShowStateDropdown(!showStateDropdown)}
                          className={`w-full flex items-center justify-between border rounded-xl px-5 py-4 transition-all duration-300 group ${
                            isDark
                              ? 'bg-slate-800/50 border-slate-700 hover:border-emerald-500/50'
                              : 'bg-slate-50 border-slate-200 hover:border-emerald-400'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <MapPin className="text-emerald-500" size={20} />
                            <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                              {selectedStateData.name}
                            </span>
                          </div>
                          <ChevronDown className={`transition-transform duration-300 ${showStateDropdown ? 'rotate-180' : ''} ${isDark ? 'text-slate-400' : 'text-slate-500'}`} size={20} />
                        </button>

                        {showStateDropdown && (
                          <div className={`absolute top-full left-0 right-0 mt-2 border rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto ${
                            isDark
                              ? 'bg-slate-900 border-slate-700 shadow-black/50'
                              : 'bg-white border-emerald-100 shadow-emerald-100'
                          }`}>
                            <div className="p-2">
                              {Object.entries(stateMedicaidUrls).map(([key, state]) => (
                                <button
                                  key={key}
                                  onClick={() => {
                                    setSelectedState(key);
                                    setShowStateDropdown(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                                    selectedState === key
                                      ? isDark ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'
                                      : isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>{state.name}</span>
                                  {selectedState === key && (
                                    <ChevronRight className="text-emerald-500 ml-auto" size={16} />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Selected State Info */}
                      <div className={`mt-6 p-4 rounded-xl border ${
                        isDark ? 'bg-slate-800/30 border-slate-700/50' : 'bg-emerald-50/50 border-emerald-100'
                      }`}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-lg flex items-center justify-center">
                            <MapPin className="text-white" size={16} />
                          </div>
                          <div>
                            <h4 className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedStateData.name} Medicaid</h4>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Official State Portal</p>
                          </div>
                        </div>
                        <p className={`text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          You will be redirected to the official {selectedStateData.name} Medicaid website for billing and claims management.
                        </p>
                        <div className={`text-xs font-mono break-all ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {selectedStateData.url}
                        </div>
                      </div>
                    </div>

                    <div className={`lg:border-l lg:pl-6 ${isDark ? 'lg:border-slate-700/50' : 'lg:border-emerald-100'}`}>
                      <div className={`rounded-xl p-6 border border-emerald-500/30 ${
                        isDark ? 'bg-gradient-to-br from-emerald-900/30 to-teal-900/30' : 'bg-gradient-to-br from-emerald-50 to-teal-50'
                      }`}>
                        <h4 className={`font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                          <Shield size={18} className="text-emerald-500" />
                          Important Notes
                        </h4>
                        <ul className="space-y-3 text-sm">
                          {[
                            'Each state has unique Medicaid requirements',
                            'Ensure you have proper credentials for your state',
                            'Bookmark your state\'s portal for quick access'
                          ].map((note, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 flex-shrink-0"></div>
                              <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>{note}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main CTA */}
                <div className="flex items-center justify-center min-h-[40vh]">
                  <div className="text-center space-y-8">
                    <div className="relative inline-block">
                      <div className="w-32 h-32 bg-gradient-to-br from-emerald-600 via-teal-500 to-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30 animate-pulse">
                        <CreditCard className="text-white" size={64} />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-md">
                        <DollarSign className="text-white" size={16} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Access {selectedStateData.name} Medicaid
                      </h3>
                      <p className={`text-lg max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        You are about to access the {selectedStateData.name} Medicaid billing system for comprehensive financial tracking and reporting.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={handleBillingRedirect}
                        disabled={loading}
                        className="group relative inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-emerald-600 via-teal-500 to-green-500 text-white rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <ExternalLink size={28} className="relative z-10" />
                        <span className="relative z-10">
                          {loading ? 'Redirecting...' : `Go to ${selectedStateData.name} Medicaid`}
                        </span>
                        <div className="relative z-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </button>
                      <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        You will be redirected to the official {selectedStateData.name} Medicaid website
                      </p>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                      {[
                        { icon: FileText, gradient: 'from-emerald-600 to-teal-500', title: 'Claims Processing', desc: 'Automated claims submission and tracking' },
                        { icon: TrendingUp, gradient: 'from-teal-600 to-cyan-500', title: 'Revenue Analytics', desc: 'Real-time financial performance insights' },
                        { icon: Users, gradient: 'from-green-600 to-emerald-500', title: 'Insurance Integration', desc: 'Direct connectivity with payers' }
                      ].map(({ icon: Icon, gradient, title, desc }) => (
                        <div key={title} className={`border rounded-xl p-6 transition-all duration-300 hover:border-emerald-400 ${
                          isDark
                            ? 'bg-slate-800/50 border-slate-700'
                            : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                        }`}>
                          <div className="flex items-center justify-center mb-4">
                            <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center`}>
                              <Icon className="text-white" size={24} />
                            </div>
                          </div>
                          <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</h4>
                          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
                        </div>
                      ))}
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

export default BillingPage;