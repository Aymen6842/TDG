import { UserType } from "@/modules/users/types/users";
import { create } from "zustand";

type Store = {
  isLoading: boolean;
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  setIsLoading: (isLoading: boolean) => void;
};

const useUserStore = create<Store>((set) => ({
  isLoading: true,
  user: null,
  setUser: (user) =>
    set((store) => ({
      user
    })),
  setIsLoading: (isLoading) => set((store) => ({ isLoading }))
}));

export default useUserStore;
