import { useResetPasswordStore } from "../../store/reset-password-store";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useAuthMode } from "../../store/auth-mode-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "@/i18n/navigation";

export default function PasswordStep() {
  const t = useTranslations("modules.auth.resetPassword");
  const tValidations = useTranslations("modules.auth.validations.password");

  const {
    passwordWarning,
    submitPassword,
    isLoading,
    password,
    confirmationPassword,
    setPassword,
    setConfirmationPassword
  } = useResetPasswordStore();
  const { setMode: setAuthMode } = useAuthMode();
  const router = useRouter();

  const handleSubmit = async () => {
    const success = await submitPassword(tValidations);
    if (success) {
      router.push("/login");
    }
  };

  return (
    <div className="flex items-center justify-center py-4 lg:h-screen">
      <Card className="mx-auto w-96">
        <CardHeader>
          <CardTitle className="text-2xl">{t.raw("steps.newPassword.title")}</CardTitle>
          <CardDescription>{t.raw("steps.newPassword.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              {passwordWarning.password && (
                <p className="text-center text-red-500">{passwordWarning.password}</p>
              )}
              <Label htmlFor="password" className="sr-only">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                isPasswordInput
                className="mt-3 w-full"
                placeholder={t.raw("steps.newPassword.passwordLabel")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              {passwordWarning.confirmationPassword && (
                <p className="text-center text-red-500">{passwordWarning.confirmationPassword}</p>
              )}
              <Label htmlFor="confirmationPassword" className="sr-only">
                New Password
              </Label>
              <Input
                id="confirmationPassword"
                type="password"
                isPasswordInput
                className="mt-3 w-full"
                placeholder={t.raw("steps.newPassword.confirmPasswordLabel")}
                value={confirmationPassword}
                onChange={(e) => setConfirmationPassword(e.target.value)}
              />
            </div>
            {passwordWarning.generalWarning && (
              <p className="text-center text-red-500">{passwordWarning.generalWarning}</p>
            )}
            <Button type="button" className="w-full" disabled={isLoading} onClick={handleSubmit}>
              {isLoading ? (
                <>
                  <Loader2Icon className="animate-spin" />
                </>
              ) : (
                t.raw("steps.newPassword.button.default")
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm">
            {t.raw("alreadyHaveAccount")}{" "}
            <button onClick={() => setAuthMode("signIn")} className="underline">
              {t.raw("comebackButton")}
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
