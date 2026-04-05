import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { CustomError } from "@/utils/custom-error";
import { toast } from "sonner";
import { TeamType } from "../types/teams";
import { TeamFormSchema, getTeamFormSchema } from "../validation/schemas/team.schema";
import { cleanTeamDataToUpload } from "../utils/data-management/cleaning/teams";
import uploadTeamOnServerSide from "../services/team-upload";

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
  team?: TeamType;
  onSuccess?: () => void;
}

export default function useTeamUpload({ team, onSuccess }: Params) {
  const queryClient = useQueryClient();
  const t = useTranslations("modules.users.teams");
  const tValidations = useTranslations("modules.users.validations.teams");
  const tErrors = useTranslations("modules.users.errors");
  const sharedErrors = useTranslations("shared.errors");

  const router = useRouter();

  const schema = getTeamFormSchema({ t: tValidations });

  const form = useForm<TeamFormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: team?.name || "",

      members: team?.members.map((member) => member.id) || []
    }
  });

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  /**
   * This function will be used to validate the user data make sure that all data provided by user is valid and submit the data to the backend side if it is valid
   */
  async function onSubmit(data: TeamFormSchema) {
    setIsPending(true);
    if (error !== "") setError("");

    try {
      const castedTeamDataToUpload = cleanTeamDataToUpload(data);
      await uploadTeamOnServerSide({ team: castedTeamDataToUpload, id: team ? team.id : "" });

      toast.success(t("success.upload"));
      onSuccess?.();

      form.reset();

      queryClient.invalidateQueries({ queryKey: ["teams"] });
    } catch (thrownError) {
      const error = thrownError as CustomError;

      if (error.status === 401) {
        router.push("/login");
        return;
      }

      if (error.status === 400) {
        switch (error.code) {
          case "TEAM_ALREADY_EXIST":
            toast.error(tErrors("teamAlreadyExist"));
            setError(tErrors("teamAlreadyExist"));
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

      toast.error(tErrors("updateTeamFailed"));
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
