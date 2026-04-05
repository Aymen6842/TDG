"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import useExternalAuth from "../hooks/use-external-auth-validation";

interface Props {
  children: React.ReactNode;
}

export default function AuthUIWrapper({ children }: Props) {
  const t = useTranslations("modules.auth.authUIWrapper");

  useExternalAuth();

  return (
    <div className="bg-background grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden items-center justify-center overflow-hidden lg:flex">
        <Image
          width={1000}
          height={1000}
          src={`/images/extra/image4.jpg`}
          alt="shadcn/ui login page"
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>
      <div className="flex flex-col gap-6 px-5">
        <div className="flex flex-1 items-start justify-center pt-16 md:pt-32">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
