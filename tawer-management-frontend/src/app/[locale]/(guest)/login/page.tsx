import { generateMeta } from "@/lib/utils";
import AuthUIWrapper from "@/modules/auth/components/auth-ui-wrapper";
import SignInForm from "@/modules/auth/components/sign-in/form";

export function generateMetadata() {
  return generateMeta({
    title: "Login Page",
    description:
      "A login form with email and password. There's an option to login with Google and a link to sign up if you don't have an account.",
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
