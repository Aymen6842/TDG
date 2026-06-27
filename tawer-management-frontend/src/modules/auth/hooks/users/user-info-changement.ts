import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CustomError } from "@/utils/custom-error";
import { toast } from "sonner";
import updateUserInfo from "../../services/users/personal-info-changement";
import {
  UserChangementFormSchema,
  getUserChangementFormSchema
} from "../../validation/schemas/user-changement.schema";
import { UserType } from "@/modules/users/types/users";
import { cleanUserChangementDataToUpload } from "../../utils/data-utils/cleaning/users";

/**
 * Custom hook for creating new users in the system.
 *
 * This hook provides functionality to create a new user using form data
 *
 * @returns {Object} Hook return object containing:
 *   - form: The react-hook-form instance
 *   - warning of user creation
 *   - submitUserCreation that create the user data using the form data
 *   - isPending that gives us the state of the pending once we submit the data
 */

interface Params {
  user?: UserType | null;
  onSuccess?: () => void;
}

export default function useUserInfoChangement({ user, onSuccess }: Params) {
  const queryClient = useQueryClient();
  const t = useTranslations("modules.auth");
  const tValidations = useTranslations("modules.auth.validations");
  const tErrors = useTranslations("modules.auth.errors");
  const router = useRouter();

  const schema = getUserChangementFormSchema({ t: tValidations });

  const form = useForm<UserChangementFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user?.name || "",
      phone: user?.phone || "",
      imageUrl: user?.image || ""
    }
  });

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  /**
   * This function will be used to validate the user data make sure that all data provided by user is valid and submit the data to the backend side if it is valid
   */
  async function onSubmit(data: UserChangementFormSchema) {
    setIsPending(true);
    if (error !== "") setError("");

    try {
      const userData = cleanUserChangementDataToUpload(data);
      await updateUserInfo({ user: userData });

      toast.success(t("success.updatedInfo"));

      form.reset();

      queryClient.invalidateQueries({ queryKey: ["user-data"] });
    } catch (thrownError) {
      const error = thrownError as CustomError;

      if (error.status === 401) {
        router.push("/login");
        return;
      }

      if (error.status === 500) {
        toast.error(tErrors("serverError"));
        setError(tErrors("serverError"));
        return;
      }
    } finally {
      setIsPending(false);
    }
  }

  return {
    form,
    error,
    isPending,
    onSubmit
  };
}
