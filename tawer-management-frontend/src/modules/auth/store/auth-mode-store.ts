import { useEffect } from "react";
import { create } from "zustand";

type Mode = "reset" | "signIn" | "signUp";
interface AuthMode {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

export const useAuthModeStore = create<AuthMode>((set) => ({
  mode: "signIn",
  setMode: (mode) => set((store) => ({ mode })),
}));

export const useAuthMode = (passedMode?: Mode) => {
  const { mode, setMode } = useAuthModeStore((store) => store);

  useEffect(() => {
    if (passedMode) setMode(passedMode);
  }, [passedMode]);

  return { mode, setMode };
};
