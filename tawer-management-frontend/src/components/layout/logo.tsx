"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Logo() {
  const t = useTranslations("shared.logo");

  return (
    <Image
      src="/logo.png"
      width={30}
      height={30}
      className="me-1 rounded-[5px] transition-all group-data-collapsible:size-7 group-data-[collapsible=icon]:size-8"
      alt={t("alt")}
      unoptimized
    />
  );
}
