import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomError } from "@/utils/custom-error";
import { signUp } from "../services/sign-up";
import { signIn } from "../services/sign-in";
import { getSignUpFormSchema } from "../validation/schemas/auth/sign-up";
import { cleanSignUpDataToUpload } from "../utils/data-utils/cleaning/users";

export default function useSignUp() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations("modules.auth.validations");
  const errorsContent = useTranslations("modules.auth.errors");

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState(""); // For confirmation page

  const formSchema = getSignUpFormSchema(t);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (error !== "") setError("");
    setIsPending(true);

    try {
      const signUpData = cleanSignUpDataToUpload(values);
      await signUp(signUpData);

      try {
        await signIn({
          email: values.email,
          password: values.password
        });

        // Store email for confirmation page
        setEmail(values.email);
        router.push("/dashboard");
        queryClient.invalidateQueries({ queryKey: ["user-data"] });

        setIsPending(false);
      } catch (signInError) {
        // If sign-in fails, still consider signup successful but show an error
        setError(errorsContent("signInAfterSignUpFailed"));
        setIsPending(false);
      }
    } catch (e) {
      const error = e as CustomError;

      if (error.status === 400) {
        setError(errorsContent("emailAlreadyExist"));
      } else {
        setError(errorsContent("technicalIssue"));
      }
      setIsPending(false);
    }
  }

  return { error, onSubmit, isPending, form, email };
}
