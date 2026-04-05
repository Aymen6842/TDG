"use client";
import EmailStep from "./email-step";
import CodeStep from "./code-step";
import PasswordStep from "./password-step";
import { useResetPasswordStore } from "../../store/reset-password-store";

export default function ResetPasswordSteps() {
  const { step, startPasswordStep } = useResetPasswordStore();

  return (
    <div className="h-full w-full">
      {step === "email" && !startPasswordStep && <EmailStep />}
      {step === "code" && !startPasswordStep && <CodeStep />}
      {(step === "password" || startPasswordStep) && <PasswordStep />}
    </div>
  );
}
