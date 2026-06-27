import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { useTranslations } from "next-intl";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useResetPasswordStore } from "../../store/reset-password-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import Link from "next/link";

export default function CodeStep() {
  const t = useTranslations("modules.auth.resetPassword");
  const tErrors = useTranslations("modules.auth.errors");

  const { warning, submitCode, displayedTimer, code, setCode, isLoading } = useResetPasswordStore();

  return (
    <div className="flex items-center justify-center lg:h-screen">
      <Card className="mx-auto w-96">
        <CardHeader>
          <CardTitle className="text-2xl">{t.raw("steps.otp.title")}</CardTitle>
          <CardDescription>
            <span>{t.raw("steps.otp.description")}</span>
            <span> {displayedTimer}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <InputOTP
              maxLength={5}
              value={code}
              onChange={(value: string) => setCode(value)}
              pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
              <InputOTPGroup className="flex w-full overflow-hidden rounded-[15px] px-1 py-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <InputOTPSlot
                    key={idx}
                    className={cn("text-blue flex-1 px-1 py-1 text-center")}
                    index={idx}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {warning.generalWarning && (
              <p className="text-center text-red-500">{warning.generalWarning}</p>
            )}
            <Button
              type="button"
              className="mt-3 w-full"
              onClick={() => submitCode(tErrors)}
              disabled={code.length < 5 || isLoading}>
              <Label>{t.raw("steps.otp.button.default")}</Label>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm">
            {t.raw("alreadyHaveAccount")}{" "}
            <Link href="/login" className="cursor-pointer underline">
              {t.raw("comebackButton")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
