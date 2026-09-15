"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Currency = "BRL" | "EUR";

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  eurRate: number;
}

const STORAGE_KEY = "vila-caju-currency";
const FALLBACK_EUR_RATE = 5.8;

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "BRL",
  setCurrency: () => undefined,
  eurRate: FALLBACK_EUR_RATE,
});

interface CurrencyProviderProps {
  children: React.ReactNode;
  eurRate?: number;
}

export function CurrencyProvider({ children, eurRate = FALLBACK_EUR_RATE }: CurrencyProviderProps) {
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
    <CurrencyContext.Provider value={{ currency, setCurrency, eurRate }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
