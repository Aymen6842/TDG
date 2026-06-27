import { signIn } from "@/modules/auth/services/sign-in";
import { useState } from "react";

import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CustomError } from "@/utils/custom-error";
import { getSignInFormSchema } from "../validation/schemas/auth/sign-in";

export default function useSignIn() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations("modules.auth.validations");
  const errorsContent = useTranslations("modules.auth.errors");

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const formSchema = getSignInFormSchema(t);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (error !== "") setError("");

    try {
      await signIn({
        email: values.email,
        password: values.password
      });

      // Invalidate user data in the cache
      queryClient.invalidateQueries({ queryKey: ["user-data"] });

      // Wait for user data
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (e) {
      const error = e as CustomError;

      if (error.status === 401) {
        setError(errorsContent("incorrectEmailOrPassword"));
      } else if (error.status === 400) {
        setError(errorsContent("invalidData"));
      } else if (error.status === 404) {
        setError(errorsContent("userNotFound"));
      } else if (error.status === 409) {
        setError(errorsContent("accountCreatedWithSocialLogin"));
      } else {
        setError(errorsContent("technicalIssue"));
      }
    } finally {
      setIsPending(false);
    }
  }

  return { error, onSubmit, isPending, form };
}
