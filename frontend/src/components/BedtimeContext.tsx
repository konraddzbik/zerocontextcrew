import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface BedtimeState {
  isBedtime: boolean;
  toggleBedtime: () => void;
}

const BedtimeContext = createContext<BedtimeState | null>(null);

export function BedtimeProvider({ children }: { children: ReactNode }) {
  const [isBedtime, setIsBedtime] = useState(
    () => localStorage.getItem('bedtimeMode') === 'true',
  );

  useEffect(() => {
    const root = document.documentElement;
    if (isBedtime) {
      root.setAttribute('data-theme', 'bedtime');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('bedtimeMode', String(isBedtime));
  }, [isBedtime]);

  function toggleBedtime() {
    setIsBedtime((prev) => !prev);
  }

  return (
    <BedtimeContext.Provider value={{ isBedtime, toggleBedtime }}>
      {children}
    </BedtimeContext.Provider>
  );
}

export function useBedtime(): BedtimeState {
  const ctx = useContext(BedtimeContext);
  if (!ctx) throw new Error('useBedtime must be used within BedtimeProvider');
  return ctx;
}
