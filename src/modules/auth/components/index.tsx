"use client";
import { useTranslations } from "next-intl";
import { Button } from "../../../components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import use2FALogin from "../hooks/use-2fa-login";

export function TwoFALogin() {
  const t = useTranslations("auth");
  const {
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
  } = use2FALogin();

  return (
    <div className="flex h-full w-full flex-col space-y-5">
      <div className="font-dm-sans shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8">
        <h2 className="text-purple text-xl font-bold">{t("2fa.title")}</h2>

        {/* STEP 1: Choose login method */}
        {step === "choice" && (
          <div className="my-8 flex flex-col space-y-5">
            <Button
              className="bg-purple h-10 rounded-md font-medium text-white"
              onClick={() => setStep("email")}>
              {t("2fa.loginWithEmail")}
            </Button>
            <Button
              className="bg-purple h-10 rounded-md font-medium text-white"
              onClick={() => setStep("phone")}>
              {t("2fa.loginWithPhone")}
            </Button>
          </div>
        )}

        {/* STEP 2: Request with email */}
        {step === "email" && (
          <>
            <p className="text-purple mt-2 max-w-sm text-sm">{t("2fa.requestDescription")}</p>
            {warning.generalWarning && (
              <p className="mt-2 text-sm text-[#EF0000]">{warning.generalWarning}</p>
            )}

            <form
              className="my-8 flex flex-col space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                submitRequest();
              }}>
              <div>
                <label className="text-sm font-bold text-black">{t("input.email")}</label>
                <Input
                  type="email"
                  placeholder={t("input.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("choice")}
                  className="h-10 w-1/3">
                  ← {t("common.back")}
                </Button>
                <Button
                  className="bg-purple h-10 w-2/3 rounded-md font-medium text-white"
                  type="submit"
                  disabled={isLoading}>
                  {t("2fa.requestButton")} →
                </Button>
              </div>
            </form>
          </>
        )}

        {/* STEP 2: Request with phone */}
        {step === "phone" && (
          <>
            <p className="text-purple mt-2 max-w-sm text-sm">{t("2fa.requestDescription")}</p>
            {warning.generalWarning && (
              <p className="mt-2 text-sm text-[#EF0000]">{warning.generalWarning}</p>
            )}

            <form
              className="my-8 flex flex-col space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                submitRequest();
              }}>
              <div>
                <label className="text-sm font-bold text-black">{t("input.phone")}</label>
                <Input
                  type="tel"
                  placeholder={t("input.phonePlaceholder")}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("choice")}
                  className="h-10 w-1/3">
                  ← {t("common.back")}
                </Button>
                <Button
                  className="bg-purple h-10 w-2/3 rounded-md font-medium text-white"
                  type="submit"
                  disabled={isLoading}>
                  {t("2fa.requestButton")} →
                </Button>
              </div>
            </form>
          </>
        )}

        {/* STEP 3: OTP step */}
        {step === "otp" && (
          <>
            <p className="mt-2 max-w-sm text-sm text-black">{t("2fa.otpDescription")}</p>
            {warning.generalWarning && (
              <p className="mt-2 text-sm text-[#EF0000]">{warning.generalWarning}</p>
            )}

            <form
              className="my-8 flex flex-col space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                submitOtp();
              }}>
              <div>
                <InputOTP maxLength={6} value={otp} onChange={setOtp} className="mt-1">
                  <InputOTPGroup className="flex w-full text-black">
                    {[0, 1, 2].map((i) => (
                      <InputOTPSlot key={i} index={i} className="flex-1 text-center" />
                    ))}
                  </InputOTPGroup>
                  <InputOTPGroup className="flex w-full text-black">
                    {[3, 4, 5].map((i) => (
                      <InputOTPSlot key={i} index={i} className="flex-1 text-center" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="mt-2 flex w-full justify-center">
                {displayedTimer === "00:00" ? (
                  <span className="text-red-500">{t("2fa.codeExpired")}</span>
                ) : (
                  <span className="text-purple">{`(${displayedTimer})`}</span>
                )}
              </div>

              <Button
                className="bg-purple h-10 rounded-md font-medium text-white"
                type="submit"
                disabled={isLoading || displayedTimer === "00:00"}>
                {t("2fa.confirmButton")} →
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
