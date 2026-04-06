import { create } from "zustand";

export type ProjectFilterTab = "all" | "Running" | "Pending" | "Completed";
export type ViewMode = "list" | "grid";

interface ProjectStore {
  selectedProjectId: string | null;
  activeTab: ProjectFilterTab;
  isAddDialogOpen: boolean;
  isProjectSheetOpen: boolean;
  viewMode: ViewMode;

  // Actions
  setSelectedProjectId: (id: string | null) => void;
  setActiveTab: (tab: ProjectFilterTab) => void;
  setAddDialogOpen: (isOpen: boolean) => void;
  setProjectSheetOpen: (isOpen: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  selectedProjectId: null,
  activeTab: "all",
  isAddDialogOpen: false,
  isProjectSheetOpen: false,
  viewMode: "grid", // Using grid as default since previous projects list was grid

  setSelectedProjectId: (id) =>
    set(() => ({
      selectedProjectId: id
    })),

  setActiveTab: (tab) =>
    set(() => ({
      activeTab: tab
    })),

  setAddDialogOpen: (isOpen) =>
    set(() => ({
      isAddDialogOpen: isOpen
    })),

  setProjectSheetOpen: (isOpen) =>
    set(() => ({
      isProjectSheetOpen: isOpen
    })),

  setViewMode: (mode) =>
    set(() => ({
      viewMode: mode
    })),
}));
