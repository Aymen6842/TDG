import { UserType } from "@/modules/users/types/users";

// ─── MOCK TOGGLE ────────────────────────────────────────────────────────────
// Set to `true` to use mock data (bypasses auth + firebase).
// Set to `false` to use the real backend API.
export const USE_MOCK = true;
// ────────────────────────────────────────────────────────────────────────────

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
