import { useState } from "react";
import { useTranslations } from "next-intl";
import useTimer from "../users/use-timer";
import { verifyResetPasswordCode } from "../../services/reset-password/code-verification";

export default function useCodeVerification() {
  const [code, setCode] = useState("");
  const { displayedTimer, startTimer } = useTimer(300);
  const t = useTranslations("modules.auth");

  async function verifyCode(
    email: string,
    code: string
  ): Promise<{ message: string; verified: boolean }> {
    try {
      const res = await verifyResetPasswordCode({ email, code });

      return {
        message: res.ok ? "" : t("errors.invalidCode"),
        verified: res.ok
      };
    } catch (error) {
      return { message: "", verified: false };
    }
  }

  return {
    verifyCode,
    displayedTimer,
    startTimer,
    code,
    setCode
  };
}
