import { create } from "zustand";
import { Mail } from "../../../app/[locale]/dashboard/(auth)/mail/data";

type MailStore = {
  selectedMail: Mail | null;
  setSelectedMail: (mail: Mail | null) => void;
};

export const useMailStore = create<MailStore>((set) => ({
  selectedMail: null,
  setSelectedMail: (mail) => set({ selectedMail: mail })
}));
