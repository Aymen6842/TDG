import { create } from "zustand";

interface Store {
  viewerModeIsActive: boolean;
  setViewerModeIsActive: (a: boolean) => void;
}

export const useViewerModeStore = create<Store>(
  (set) => ({
    viewerModeIsActive: false,
    setViewerModeIsActive: (viewerModeIsActive) => set({ viewerModeIsActive }),
  })
);
