import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2Icon, MailIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useResetPasswordStore } from "../../store/reset-password-store";
import Link from "next/link";

export default function EmailStep() {
  const t = useTranslations("modules.auth.resetPassword");
  const tValidations = useTranslations("modules.auth.validations");
  const { warning, submitEmail, email, setEmail, isLoading } = useResetPasswordStore();

  return (
    <div className="flex items-center justify-center py-4 lg:h-screen">
      <Card className="mx-auto w-96">
        <CardHeader>
          <CardTitle className="text-2xl">{t.raw("title")}</CardTitle>
          <CardDescription>{t.raw("steps.email.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="email" className="sr-only">
                Email address
              </Label>
              <div className="relative">
                <MailIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform opacity-30" />
                <Input
                  id="email"
                  className="w-full pl-10"
                  value={email}
                  onChange={(event: any) => {
                    setEmail(event.target.value);
                  }}
                  placeholder={t.raw("steps.email.placeholder")}
                />
              </div>
            </div>
            {warning.generalWarning && (
              <p className="text-center text-red-500">{warning.generalWarning}</p>
            )}
            <Button
              type="button"
              className="w-full"
              disabled={isLoading}
              onClick={() => submitEmail(tValidations)}>
              {isLoading ? (
                <>
                  <Loader2Icon className="animate-spin" />
                  {t.raw("steps.email.button.loading")}
                </>
              ) : (
                t.raw("steps.email.button.default")
              )}
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
