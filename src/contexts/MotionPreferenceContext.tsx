import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

type Ctx = { reducedMotion: boolean; toggle: () => void; set: (v: boolean) => void };
const MotionPreferenceContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "reduce-motion";

const initial = (): boolean => {
  if (typeof window === "undefined") return false;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored !== null) return stored === "1";
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
};

const applyHtmlClass = (on: boolean) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("reduce-motion", on);
};

export const MotionPreferenceProvider = ({ children }: { children: ReactNode }) => {
  const [reducedMotion, setReduced] = useState<boolean>(initial);

  useEffect(() => { applyHtmlClass(reducedMotion); }, [reducedMotion]);

  const set = useCallback((v: boolean) => {
    setReduced(v);
    try { localStorage.setItem(STORAGE_KEY, v ? "1" : "0"); } catch {}
  }, []);
  const toggle = useCallback(() => set(!reducedMotion), [reducedMotion, set]);

  return (
    <MotionPreferenceContext.Provider value={{ reducedMotion, toggle, set }}>
      {children}
    </MotionPreferenceContext.Provider>
  );
};

export const useMotionPreference = (): Ctx => {
  const ctx = useContext(MotionPreferenceContext);
  if (!ctx) return { reducedMotion: false, toggle: () => {}, set: () => {} };
  return ctx;
};