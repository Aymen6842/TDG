import { generateMeta } from "@/lib/utils";
import AuthUIWrapper from "@/modules/auth/components/auth-ui-wrapper";
import SignUpForm from "@/modules/auth/components/sign-up/form";

export async function generateMetadata() {
  return generateMeta({
    title: "Register Page",
    description:
      "A register form with first name, last name, email and password. There's an option to register with Google and a link to login if you already have an account.",
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
