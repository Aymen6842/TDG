import { getTranslations } from "next-intl/server";
import { generateMeta } from "@/lib/utils";
import AuthUIWrapper from "@/modules/auth/components/auth-ui-wrapper";
import SignInForm from "@/modules/auth/components/sign-in/form";

export async function generateMetadata() {
  const t = await getTranslations("metadata.login");

  return generateMeta({
    title: t("title"),
    description: t("description"),
    canonical: "/login"
  });
}

export default function Page() {
  return (
    <AuthUIWrapper>
      <SignInForm />
    </AuthUIWrapper>
  );
}
