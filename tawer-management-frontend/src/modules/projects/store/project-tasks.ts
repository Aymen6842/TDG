import { create } from "zustand";

type ViewMode = "list" | "grid";

type VisibleAttributes = {
  key: boolean;
  type: boolean;
  status: boolean;
  priority: boolean;
  points: boolean;
  assignee: boolean;
  milestone: boolean;
  epic: boolean;
};

interface TodoStore {
  selectedTodoId: string | null;
  isAddDialogOpen: boolean;
  isTodoSheetOpen: boolean;
  viewMode: ViewMode;
  visibleAttributes: VisibleAttributes;
  selectedTaskIds: string[];

  setSelectedTodoId: (id: string | null) => void;
  setAddDialogOpen: (isOpen: boolean) => void;
  setTodoSheetOpen: (isOpen: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleAttribute: (key: keyof VisibleAttributes) => void;
  toggleTaskSelection: (id: string) => void;
  clearSelection: () => void;
  setSelectedTaskIds: (ids: string[]) => void;
}

export const useProjectTasksStore = create<TodoStore>((set) => ({
  selectedTodoId: null,
  isAddDialogOpen: false,
  isTodoSheetOpen: false,
  viewMode: "list",
  selectedTaskIds: [],
  visibleAttributes: {
    key: true,
    type: true,
    status: true,
    priority: true,
    points: true,
    assignee: true,
    milestone: true,
    epic: true
  },

  setSelectedTodoId: (id) => set(() => ({ selectedTodoId: id })),
  setAddDialogOpen: (isOpen) => set(() => ({ isAddDialogOpen: isOpen })),
  setTodoSheetOpen: (isOpen) => set(() => ({ isTodoSheetOpen: isOpen })),
  setViewMode: (mode) => set(() => ({ viewMode: mode })),
  toggleAttribute: (key) =>
    set((state) => ({
      visibleAttributes: {
        ...state.visibleAttributes,
        [key]: !state.visibleAttributes[key]
      }
    })),
  toggleTaskSelection: (id) =>
    set((state) => ({
      selectedTaskIds: state.selectedTaskIds.includes(id)
        ? state.selectedTaskIds.filter((tid) => tid !== id)
        : [...state.selectedTaskIds, id],
    })),
  clearSelection: () => set(() => ({ selectedTaskIds: [] })),
  setSelectedTaskIds: (ids) => set(() => ({ selectedTaskIds: ids })),
}));
