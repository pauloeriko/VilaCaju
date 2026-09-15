"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Currency = "BRL" | "EUR";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
}

const STORAGE_KEY = "vila-caju-currency";

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "BRL",
  setCurrency: () => undefined,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("BRL");

  // Lecture de la préférence persistée au montage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "EUR" || stored === "BRL") {
      setCurrencyState(stored);
    }
  }, []);

  function setCurrency(c: Currency) {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
