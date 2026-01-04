"use client";

import { createContext, useContext, useState } from "react";

const FacebookAdContext = createContext();

export function FacebookAdProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [adAccountId, setAdAccountId] = useState(null);
  const [pageId, setPageId] = useState(null);

  return (
    <FacebookAdContext.Provider
      value={{
        accessToken,
        setAccessToken,
        adAccountId,
        setAdAccountId,
        pageId,
        setPageId,
      }}
    >
      {children}
    </FacebookAdContext.Provider>
  );
}

export function useFacebookAdContext() {
  const context = useContext(FacebookAdContext);
  if (!context) {
    throw new Error("useFacebookAdContext must be used within FacebookAdProvider");
  }
  return context;
}