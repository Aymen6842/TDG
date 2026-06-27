import { create } from "zustand";

interface AuthRefresherState {
  authRefresher: number;
  refreshUserAuthentication: () => void;
}

const useAuthRefresher = create<AuthRefresherState>((set, get) => ({
  authRefresher: 0,
  refreshUserAuthentication: () => set({ authRefresher: get().authRefresher + 1 })
}));

export default useAuthRefresher;
