import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CustomError } from "@/utils/custom-error";
import { UserType } from "../types/users";
import { toast } from "sonner";
import { UserFormSchema, getFormUserSchema } from "../validation/schemas/user.schema";
import uploadUserOnServerSide from "../services/user-upload";
import { castRoleFromFrontendToBackend } from "@/modules/auth/utils/user-roles";
import { UserRoleOnBackendSide } from "@/modules/auth/types";
import { cleanUserDataToUpload } from "../utils/data-management/cleaning/users";

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
  user?: UserType;
  onSuccess?: () => void;
}

export default function useUserUpload({ user, onSuccess }: Params) {
  const queryClient = useQueryClient();
  const t = useTranslations("modules.users");
  const tValidations = useTranslations("modules.users.validations");
  const tErrors = useTranslations("modules.users.errors");
  const sharedErrors = useTranslations("shared.errors");
  const router = useRouter();

  const schema = getFormUserSchema({ t: tValidations, passwordRequired: user ? false : true });

  const form = useForm<UserFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      password: "",
      phone: user?.phone || "",
      roles: (user
        ? user.roles.map((role) => castRoleFromFrontendToBackend(role))
        : []) as UserRoleOnBackendSide[]
    }
  });

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  /**
   * This function will be used to validate the user data make sure that all data provided by user is valid and submit the data to the backend side if it is valid
   */
  async function onSubmit(data: UserFormSchema) {
    setIsPending(true);
    if (error !== "") setError("");

    try {
      const userData = cleanUserDataToUpload(data);
      await uploadUserOnServerSide({ user: userData, id: user ? user.id : "" });

      toast.success(t("success.upload"));

      form.reset();
      onSuccess?.();

      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (thrownError) {
      const error = thrownError as CustomError;

      if (error.status === 401) {
        router.push("/login");
        return;
      }

      if (error.status === 400) {
        switch (error.code) {
          case "USER_ALREADY_EXIST":
            toast.error(tErrors("userAlreadyExist"));
            setError(tErrors("userAlreadyExist"));
            return;

          case "INVALID_FORMAT":
            toast.error(tErrors("invalidFormat"));
            setError(tErrors("invalidFormat"));
            return;

          default:
            toast.error(tErrors("invalidFormat"));
            setError(tErrors("invalidFormat"));
            return;
        }
      }

      if (error.status === 403) {
        toast.error(sharedErrors("permissionDenied"));
        setError(sharedErrors("permissionDenied"));
        return;
      }

      if (error.status === 500) {
        toast.error(tErrors("serverError"));
        setError(tErrors("serverError"));
        return;
      }

      toast.error(tErrors("updateUserFailed"));
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
