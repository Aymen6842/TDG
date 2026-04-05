import { create } from "zustand";
import { FilterTab, ViewMode } from "@/modules/tasks/types/tasks";



interface TodoStore {
  selectedTodoId: string | null;
  activeTab: FilterTab;
  isAddDialogOpen: boolean;
  isTodoSheetOpen: boolean;
  viewMode: ViewMode;

  // Actions

  setSelectedTodoId: (id: string | null) => void;
  setActiveTab: (tab: FilterTab) => void;
  setAddDialogOpen: (isOpen: boolean) => void;
  setTodoSheetOpen: (isOpen: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
}

export const useTodoStore = create<TodoStore>((set) => ({
  selectedTodoId: null,
  activeTab: "all",
  isAddDialogOpen: false,
  isTodoSheetOpen: false,
  viewMode: "list",

  setSelectedTodoId: (id) =>
    set(() => ({
      selectedTodoId: id
    })),

  setActiveTab: (tab) =>
    set(() => ({
      activeTab: tab
    })),

  setAddDialogOpen: (isOpen) =>
    set(() => ({
      isAddDialogOpen: isOpen
    })),

  setTodoSheetOpen: (isOpen) =>
    set(() => ({
      isTodoSheetOpen: isOpen
    })),

  setViewMode: (mode) =>
    set(() => ({
      viewMode: mode
    })),

}));
