import { getTranslations } from "next-intl/server";
import { generateMeta } from "@/lib/utils";
import AuthUIWrapper from "@/modules/auth/components/auth-ui-wrapper";
import SignUpForm from "@/modules/auth/components/sign-up/form";

export async function generateMetadata() {
  const t = await getTranslations("metadata.register");

  return generateMeta({
    title: t("title"),
    description: t("description"),
    canonical: "/register"
  });
}

export default function Page() {
  return (
    <AuthUIWrapper>
      <SignUpForm />
    </AuthUIWrapper>
  );
}
