import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function useExternalAuth() {
  const t = useTranslations("auth.warnings.externalAuth");

  const router = useRouter();
  const searchParams = useSearchParams();
  const externalAuthResult = searchParams.get("auth");
  const externalAuthStatus = searchParams.get("status");

  useEffect(() => {
    setTimeout(() => {
      if (externalAuthResult === "failed") {
        toast.error(
          externalAuthStatus == "409" ? t("emailLinkedWithAnAccount") : t("generalError")
        );
        router.replace("/");
      }
    }, 0);
  }, []);
}
