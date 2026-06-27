import { useState } from "react";
import { generate2FACode } from "@/modules/auth/services/2fa/generate-code";
import { login2FA } from "@/modules/auth/services/2fa/login-2fa";
import { getServerErrorWarning } from "../utils/warnings/general-warning";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import useTimer from "./users/use-timer";
import { toast } from "sonner";
import useAuthRefresher from "../store/auth-refresher";

/**
 * Custom hook for managing passwordless 2FA login flow.
 *
 * This hook handles the two-step authentication process:
 * 1. Request step: User enters email or phone to receive a 2FA code
 * 2. OTP step: User enters the received 6-digit code to complete login
 *
 * @returns {Object} An object containing:
 * - step: Current step in the flow ("request" | "otp")
 * - email: Email input value and setter
 * - phone: Phone input value and setter
 * - otp: OTP input value and setter
 * - warning: Validation and error messages
 * - submitRequest: Function to submit email/phone and request 2FA code
 * - submitOtp: Function to submit OTP and complete login
 * - isLoading: Loading state for async operations
 */
export default function use2FALogin() {
  const [step, setStep] = useState<"choice" | "email" | "phone" | "otp">("choice");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const t = useTranslations("auth");
  const warnings = useTranslations("warnings");
  const { displayedTimer, startTimer } = useTimer(300);
  const [warning, setWarning] = useState({
    email: "",
    phone: "",
    generalWarning: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUserAuthentication } = useAuthRefresher();
  const queryClient = useQueryClient();

  /**
   * Submits the email or phone number to request a 2FA code.
   *
   * Validates that at least one contact method (email or phone) is provided.
   * If valid, calls the generate2FACode API to send an OTP code.
   * On success, transitions to the OTP input step.
   * On failure, displays server error messages.
   */
  function submitRequest() {
    if (!email && !phone) {
      setWarning({
        email: warnings("upload.auth.emailOrPasswordRequired.title"),
        phone: "",
        generalWarning: warnings("upload.auth.emailOrPasswordRequired.title")
      });
      toast.warning(warnings("upload.auth.emailOrPasswordRequired.description"));
      return;
    }

    setIsLoading(true);
    generate2FACode({
      email: email || undefined,
      phone: phone || undefined
    }).then((res) => {
      if (res.ok) {
        setStep("otp");
        setWarning({
          email: "",
          phone: "",
          generalWarning: ""
        });
        startTimer();
      } else {
        const errorMessage = getServerErrorWarning(res.status, t);

        setWarning({
          email: "",
          phone: "",
          generalWarning: errorMessage
        });
      }
      setIsLoading(false);
    });
  }

  /**
   * Submits the OTP code to complete the 2FA authentication.
   *
   * Validates that an OTP code is provided.
   * If valid, calls the login2FA API to verify the code and authenticate the user.
   * On success, refreshes authentication state and invalidates user data cache.
   * On failure, displays server error messages.
   */
  function submitOtp() {
    if (!otp) {
      setWarning({
        email: "",
        phone: "",
        generalWarning: t("2fa.otpRequired")
      });
      toast.warning(t("2fa.otpRequired"));
      return;
    }

    setIsLoading(true);
    login2FA({
      email: email,
      phone: phone,
      twoFactorAuthCode: otp
    }).then((res) => {
      if (res.ok) {
        refreshUserAuthentication();
        queryClient.invalidateQueries({ queryKey: ["user-data"] });
      } else {
        let errorMessage = getServerErrorWarning(res.status, t);

        // Handle specific 2FA error codes
        if (res.errorCode === "P2009") {
          errorMessage = t("2fa.invalidOrExpiredCode");
        }

        setWarning({
          email: "",
          phone: "",
          generalWarning: errorMessage
        });
      }
      setIsLoading(false);
    });
  }

  return {
    step,
    setStep,
    email,
    setEmail,
    phone,
    setPhone,
    otp,
    setOtp,
    warning,
    submitRequest,
    submitOtp,
    isLoading,
    displayedTimer
  };
}
