"use client";

import Loading from "@/components/page-loader";
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { redirect } from "next/navigation";
import React from "react";

export default function GuestLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) <Loading />;

  if (user) redirect("/dashboard");

  return <>{children}</>;
}
