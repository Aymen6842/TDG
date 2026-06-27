import { CalendarEventType, EventType } from "../../types";
import deleteEventOnServerSide from "../../services/actions/event-deletion";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { castToFromCalendarEventTypeToCalendarEventRequestType } from "../../dto/requests/events";
import uploadEventToServerSide from "../../services/actions/event-upload";
import { CustomError } from "@/utils/custom-error";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface Params {
  type: EventType;
}

export default function useEventsActions({ type }: Params) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = useTranslations("modules.events.success");
  const tErrors = useTranslations("modules.events.errors");
  const sharedErrors = useTranslations("shared.errors");
  const [isPending, setIsPending] = useState(false);

  const handleEventUpdate = async (event: CalendarEventType) => {
    setIsPending(true);

    try {
      const uploadedEvent = castToFromCalendarEventTypeToCalendarEventRequestType(event, type);

      await uploadEventToServerSide({ id: event.id, event: uploadedEvent });

      queryClient.invalidateQueries({ queryKey: ["events"] });

      toast.success(t("eventUpdated"));
      return true;
    } catch (thrownError) {
      const error = thrownError as CustomError;
      if (error.status === 401) {
        router.push("/login");
        return false;
      }

      if (error.status === 403) {
        toast.error(sharedErrors("permissionDenied"));
        return false;
      }

      toast.error(tErrors("eventUpdateFailed"));

      return false;
    } finally {
      setIsPending(false);
    }
  };

  const handleEventDelete = async (eventId: string) => {
    setIsPending(true);

    try {
      await deleteEventOnServerSide({ id: eventId });

      queryClient.invalidateQueries({ queryKey: ["events"] });

      toast.success(t("eventDeleted"));

      return true;
    } catch (thrownError) {
      const error = thrownError as CustomError;
      if (error.status === 401) {
        router.push("/login");
        return false;
      }

      if (error.status === 403) {
        toast.error(sharedErrors("permissionDenied"));
        return false;
      }

      toast.error(tErrors("eventDeletionFailed"));

      return false;
    } finally {
      setIsPending(false);
    }
  };

  return {
    handleEventUpdate,
    handleEventDelete,
    isPending
  };
}
