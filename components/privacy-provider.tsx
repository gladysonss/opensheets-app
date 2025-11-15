"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface PrivacyContextType {
  privacyMode: boolean;
  toggle: () => void;
  set: (value: boolean) => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(
  undefined
);

const STORAGE_KEY = "app:privacyMode";

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [privacyMode, setPrivacyMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Sincronizar com localStorage na montagem (evitar mismatch SSR/CSR)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setPrivacyMode(stored === "true");
    }
    setHydrated(true);
  }, []);

  // Persistir mudanças no localStorage
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, String(privacyMode));
    }
  }, [privacyMode, hydrated]);

  const toggle = () => {
    setPrivacyMode((prev) => !prev);
  };

  const set = (value: boolean) => {
    setPrivacyMode(value);
  };

  return (
    <PrivacyContext.Provider value={{ privacyMode, toggle, set }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacyMode() {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error("usePrivacyMode must be used within a PrivacyProvider");
  }
  return context;
}
