"use client";

import { createContext, useContext, useState } from "react";

const GoogleAdsContext = createContext();

export function GoogleAdsProvider({ children }) {
  const [customerId, setCustomer] = useState(null);
  const [managerId, setManagerId] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  return (
    <GoogleAdsContext.Provider
      value={{
        customerId,
        setCustomer,
        managerId,
        setManagerId,
        refreshToken,
        setRefreshToken,
      }}
    >
      {children}
    </GoogleAdsContext.Provider>
  );
}

export function useGoogleAdsContext() {
  const context = useContext(GoogleAdsContext);
  if (!context) {
    throw new Error("useGoogleAdsContext must be used within GoogleAdsProvider");
  }
  return context;
}