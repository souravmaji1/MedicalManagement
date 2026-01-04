// lib/AdContext.js
"use client";

import { createContext, useContext, useState } from "react";

const AdContext = createContext();

export function AdProvider({ children }) {
  // Google Ads State
  const [googleAds, setGoogleAds] = useState({
    customerId: null,
    managerId: null,
    refreshToken: null,
    isConnected: false,
    accounts: [], // For storing fetched accounts
    selectedAccount: null // For storing selected account details
  });

  // Facebook Ads State
  const [facebookAds, setFacebookAds] = useState({
    accessToken: null,
    adAccountId: null,
    pageId: null,
    isConnected: false,
    adAccounts: [], // For storing fetched ad accounts
    pages: [], // For storing fetched pages
    selectedAdAccount: null,
    selectedPage: null
  });

  // Platform selection
  const [selectedPlatform, setSelectedPlatform] = useState(null); // 'google' or 'facebook'

  // Update Google Ads state
  const updateGoogleAds = (updates) => {
    setGoogleAds(prev => ({ ...prev, ...updates }));
  };

  // Update Facebook Ads state
  const updateFacebookAds = (updates) => {
    setFacebookAds(prev => ({ ...prev, ...updates }));
  };

  return (
    <AdContext.Provider
      value={{
        // Google Ads
        googleAds,
        updateGoogleAds,
        
        // Facebook Ads
        facebookAds,
        updateFacebookAds,
        
        // Platform selection
        selectedPlatform,
        setSelectedPlatform
      }}
    >
      {children}
    </AdContext.Provider>
  );
}

export function useAdContext() {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error("useAdContext must be used within AdProvider");
  }
  return context;
}