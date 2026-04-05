import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Store {
  fcmToken: string | null;
  setFcmToken: (token: string | null) => void;
}

export const useNotificationsTokensStore = create<Store>()(
  persist(
    (set) => ({
      fcmToken: null,
      setFcmToken: (fcmToken) => set({ fcmToken }),
    }),
    {
      name: "notifications-token" // localStorage key
    }
  )
);
