import { create } from "zustand";
import { EventType } from "../types";

interface Store {
  eventType: EventType | null;
  setEventType: (eventType: EventType) => void;
}

export const useEventStore = create<Store>((set) => ({
  eventType: null,

  setEventType: (eventType: EventType) =>
    set(() => ({
      eventType
    }))
}));
