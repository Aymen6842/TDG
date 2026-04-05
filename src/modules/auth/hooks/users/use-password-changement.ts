import { changePassword } from "@/modules/auth/services/password-changement";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getPasswordChangementSchema,
  PasswordChangementFormValues
} from "../../validation/schemas/auth/password-changement";
import { toast } from "sonner";
import { CustomError } from "@/utils/custom-error";

export default function usePasswordChangement() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("modules.auth");
  const tErrors = useTranslations("modules.auth.errors");
  const tValidations = useTranslations("modules.auth.validations.password");

  const form = useForm<PasswordChangementFormValues>({
    resolver: zodResolver(getPasswordChangementSchema(tValidations)),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmationPassword: ""
    }
  });

  async function submitPassword(data: PasswordChangementFormValues) {
    setIsLoading(true);

    try {
      const res = await changePassword({
        oldPassword: data.currentPassword,
        newPassword: data.newPassword
      });

      setIsLoading(false);

      if (res) {
        if (res.ok) {
          form.reset();
          toast.success(t("success.passwordUpdated"));
        } else {
          toast.error(tErrors("passwordChangementFailed"));
        }
      } else {
        router.push(`/`);
      }
    } catch (error) {
      const customError = error as CustomError;
      if (customError.code === "P4000") toast.error(tErrors("invalidPassword"));
      else toast.error(tErrors("passwordChangementFailed"));
    } finally {
      setIsLoading(false);
    }
  }

  return {
    form,
    isLoading,
    submitPassword
  };
}
