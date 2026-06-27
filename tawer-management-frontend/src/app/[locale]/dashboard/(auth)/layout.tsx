"use client";
import React from "react";
import useUser from "@/modules/auth/hooks/users/use-user";
import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/sidebar/app-sidebar";
import { SiteHeader } from "@/components/layout/header";
import Loading from "@/components/page-loader";
import { CheckInScreen } from "@/modules/tracking/components/attendance/check-in";
import AttendanceWrapper from "@/modules/tracking/components/attendance/wrapper";

export default function AuthLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <SidebarProvider
      defaultOpen={true}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 14)"
        } as React.CSSProperties
      }>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <AttendanceWrapper>
          <div className="flex flex-1 flex-col">
            <div className="@container/main p-4 xl:group-data-[theme-content-layout=centered]/layout:container xl:group-data-[theme-content-layout=centered]/layout:mx-auto">
              {children}
            </div>
          </div>
        </AttendanceWrapper>
        <CheckInScreen />

      </SidebarInset>
    </SidebarProvider>
  );
}
