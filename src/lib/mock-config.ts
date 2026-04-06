// ─── MOCK CONFIG ─────────────────────────────────────────────────────────────
// Delete this file for prod. Also delete src/lib/mock-toggle.tsx.
// ─────────────────────────────────────────────────────────────────────────────

import { useMockStore } from "@/lib/mock-toggle";
import { UserType } from "@/modules/users/types/users";

// Runtime getter — reads from Zustand store so the floating button can toggle it
export function getUseMock(): boolean {
  return useMockStore.getState().isMock;
}

// Keep USE_MOCK as a convenience alias for non-reactive contexts (services)
export const USE_MOCK = getUseMock;

export const MOCK_USER: UserType = {
  id: "mock-001",
  name: "Aymen BenHsan",
  email: "aymen.benhsan@mock.local",
  phone: "+21600000000",
  image: undefined,
  roles: ["ceo"],
  teams: [{ id: "team-001", name: "Dev Team" }],
  isOnline: true,
  notificationsSettings: {
    emailNotifications: false,
    telegramNotifications: false,
    ntfyNotifications: false,
    telegramChatId: null
  },
  createdAt: new Date("2024-01-01")
};
