'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://bbikcxalypttfgrlxstf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiaWtjeGFseXB0dGZncmx4c3RmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzcxODcwOCwiZXhwIjoyMDY5Mjk0NzA4fQ.4BLQyvPA0eB745Sfdn2Tl4oCDRTzNhLXrJ8Os8wOXfs'
);



const UserProfileContext = createContext();

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within UserProfileProvider');
  }
  return context;
};

export const UserProfileProvider = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserProfile();
    } else if (isLoaded && !user) {
      setLoading(false);
    }
  }, [isLoaded, user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('clerk_user_id', user.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission) => {
    if (!userProfile || !userProfile.permissions) return false;
    if (userProfile.permissions.includes('full_access')) return true;
    return userProfile.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    if (!userProfile || !userProfile.permissions) return false;
    if (userProfile.permissions.includes('full_access')) return true;
    return permissions.some(perm => userProfile.permissions.includes(perm));
  };

  const refreshProfile = () => {
    if (user) {
      fetchUserProfile();
    }
  };

  return (
    <UserProfileContext.Provider value={{
      userProfile,
      loading,
      hasPermission,
      hasAnyPermission,
      refreshProfile
    }}>
      {children}
    </UserProfileContext.Provider>
  );
};