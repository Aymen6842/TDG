"use client";
import { sendEmailConfirmationLink } from "@/modules/auth/services/verification/email-confirmation";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function useEmailConfirmation(searchParams: {
  [key: string]: string | string[] | undefined;
}) {
  const [resentRefused, setResentRefused] = useState(false);
  const status = searchParams["status"] ? Number(searchParams["status"]) : 500;
  const token = searchParams["token"] ? (searchParams["token"] as string) : "";
  const router = useRouter();

  const t = useTranslations();

  function sendLinkAgain() {
    sendEmailConfirmationLink(token).then((res) => {
      if (res.ok) {
        router.push("/");
      } else {
        setResentRefused(true);
      }
    });
  }

  return { sendLinkAgain, resentRefused, status, t };
}
