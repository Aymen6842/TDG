"use client";
// ─── MOCK TOGGLE ─────────────────────────────────────────────────────────────
// Dev-only. For prod, delete this file and remove <MockToggle /> from
// src/app/[locale]/layout.tsx (one line marked below).
// ─────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

// ─── Runtime store ────────────────────────────────────────────────────────────

interface MockStore {
  isMock: boolean;       // controls data services (projects, tasks, etc.)
  isMockAuth: boolean;   // controls auth (user session)
  toggleData: () => void;
  toggleAuth: () => void;
}

export const useMockStore = create<MockStore>()(
  persist(
    (set) => ({
      isMock: true,
      isMockAuth: true,
      toggleData: () => set((s) => ({ isMock: !s.isMock })),
      toggleAuth: () => set((s) => ({ isMockAuth: !s.isMockAuth })),
    }),
    { name: "dev-mock-store" }
  )
);

export function getUseMock(): boolean {
  return useMockStore.getState().isMock;
}

export function getUseMockAuth(): boolean {
  return useMockStore.getState().isMockAuth;
}

// ─── Draggable floating panel ─────────────────────────────────────────────────

export default function MockToggle() {
  const { isMock, isMockAuth, toggleData, toggleAuth } = useMockStore();
  const queryClient = useQueryClient();

  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const moved = useRef(false);

  useEffect(() => {
    setPos({ x: window.innerWidth - 120, y: window.innerHeight - 160 });
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    moved.current = false;
    dragStart.current = { mx: e.clientX, my: e.clientY, px: pos.x, py: pos.y };
    setDragging(true);
  }, [pos]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved.current = true;
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - 110, dragStart.current.px + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 80, dragStart.current.py + dy))
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  const handleToggleData = () => {
    if (moved.current) return;
    toggleData();
    queryClient.invalidateQueries();
  };

  const handleToggleAuth = () => {
    if (moved.current) return;
    if (isMockAuth) {
      toggleAuth();
      queryClient.clear();
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
    } else {
      toggleAuth();
      queryClient.clear();
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/dashboard";
    }
  };

  return (
    <div
      style={{ left: pos.x, top: pos.y }}
      className={cn(
        "fixed z-[9999] flex flex-col gap-1 rounded-xl p-2 shadow-xl select-none",
        "bg-background/90 backdrop-blur border border-border",
        dragging ? "cursor-grabbing" : "cursor-grab"
      )}
      onMouseDown={onMouseDown}
    >
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest px-1 pb-0.5">Dev</p>

      {/* Data toggle */}
      <button
        onClick={handleToggleData}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap",
          isMock
            ? "bg-primary/15 text-primary"
            : "bg-destructive/15 text-destructive"
        )}
      >
        <span className={cn(
          "size-1.5 shrink-0 rounded-full",
          isMock ? "bg-primary" : "bg-destructive animate-pulse"
        )} />
        Data: {isMock ? "Mock" : "API"}
      </button>

      {/* Auth toggle */}
      <button
        onClick={handleToggleAuth}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap",
          isMockAuth
            ? "bg-primary/15 text-primary"
            : "bg-destructive/15 text-destructive"
        )}
      >
        <span className={cn(
          "size-1.5 shrink-0 rounded-full",
          isMockAuth ? "bg-primary" : "bg-destructive animate-pulse"
        )} />
        Auth: {isMockAuth ? "Mock" : "Real"}
      </button>
    </div>
  );
}
