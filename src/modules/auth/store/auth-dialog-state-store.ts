import { create } from "zustand";

interface DialogState {
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
}

export const useAuthDialogState = create<DialogState>((set) => ({
  isOpen: false,
  setIsOpen: (state) => set({ isOpen: state }),
}));
