import { CalendarEventType, EventType } from "../../types";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CustomError } from "@/utils/custom-error";
import { EventFormSchema, getEventFormSchema } from "../../validations/event.schema";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { castToCalendarEventRequestType } from "../../dto/requests/events";
import uploadEventToServerSide from "../../services/actions/event-upload";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

interface Params {
  type: EventType;
  event?: CalendarEventType | null;
  onSuccess?: () => void;
}

export default function useEventUpload({ type, onSuccess, event = null }: Params) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("modules.events");
  const tValidations = useTranslations("modules.events.validations");
  const tErrors = useTranslations("modules.events.errors");
  const sharedErrors = useTranslations("shared.errors");

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  const schema = getEventFormSchema({ t: tValidations });
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {}
  });

  /**
   * This function will be used to validate the user data make sure that all data provided by user is valid and submit the data to the backend side if it is valid
   */
  async function onSubmit(data: EventFormSchema) {
    setIsPending(true);

    if (error !== "") setError("");

    try {
      const eventToUpload = castToCalendarEventRequestType(data, type);
      await uploadEventToServerSide({ event: eventToUpload, id: event ? event.id : "" });

      if (event && event.id === "") toast.success(t("success.eventCreated"));
      else toast.success(t("success.eventUpdated"));

      form.reset();
      onSuccess?.();

      queryClient.invalidateQueries({ queryKey: ["events"] });
    } catch (thrownError) {
      const error = thrownError as CustomError;

      if (error.status === 401) {
        router.push("/login");
        return;
      }

      if (error.status === 403) {
        toast.error(sharedErrors("permissionDenied"));
        setError(sharedErrors("permissionDenied"));
        return;
      }

      toast.error(tErrors("serverError"));
      setError(tErrors("serverError"));
    } finally {
      setIsPending(false);
    }
  }

  return {
    form,
    isPending,
    onSubmit,
    error
  };
}
