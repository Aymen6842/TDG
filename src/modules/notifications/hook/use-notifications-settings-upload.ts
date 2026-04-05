import updatePersonalInfoOnServerSide from "@/modules/auth/services/users/personal-info-changement";
import { CustomError } from "@/utils/custom-error";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import usePersonalNotificationsSettings from "./use-personal-notifications-settings";

export default function useNotificationsSettingsUpload() {
  const t = useTranslations("modules.notifications");
  const tErrors = useTranslations("modules.notifications.errors")
  const router = useRouter();

  const { settings } = usePersonalNotificationsSettings();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [telegramNotifications, setTelegramNotifications] = useState(false);
  const [telegramChatId, setTelegramChatId] = useState("");
  const [ntfyNotifications, setNtfyNotifications] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    if (settings) {
      if (settings.emailNotifications !== emailNotifications)
        setEmailNotifications(settings.emailNotifications);
      if (settings.telegramNotifications !== telegramNotifications)
        setTelegramNotifications(settings.telegramNotifications);
      if (settings.ntfyNotifications !== ntfyNotifications) setNtfyNotifications(settings.ntfyNotifications);
      if (settings.telegramChatId !== telegramChatId)
        setTelegramChatId(settings.telegramChatId ? settings.telegramChatId : "");
    }
  }, [settings])

  const onSubmit = async () => {
    if (telegramNotifications && !telegramChatId.trim()) {
      toast.error(tErrors("noNotificationsReceivedWithoutTelegramChatId"));
      setError(tErrors("noNotificationsReceivedWithoutTelegramChatId"))
      return;
    }

    const notificationsSettingsToUpload = new FormData();
    notificationsSettingsToUpload.append("emailNotificationsEnabled", emailNotifications ? "true" : "false");
    notificationsSettingsToUpload.append("ntfyNotificationsEnabled", ntfyNotifications ? "true" : "false");
    notificationsSettingsToUpload.append("telegramNotificationsEnabled", telegramNotifications ? "true" : "false");
    if (telegramNotifications && telegramChatId.trim()) notificationsSettingsToUpload.append("telegramChatId", telegramChatId.trim());

    if (error) setError(null);

    setIsPending(true);
    try {

      await updatePersonalInfoOnServerSide({ user: notificationsSettingsToUpload });

      toast.success(t("success.settingsUpdated"));
    } catch (err) {
      const error = err as CustomError;

      if (error.status === 401) router.push("/dashboard/login");
      else {
        toast.error(tErrors("technicalIssue"));
        setError(tErrors("technicalIssue"));
      }

    } finally {
      setIsPending(false);
    }
  };


  return {
    emailNotifications,
    setEmailNotifications,
    telegramNotifications,
    setTelegramNotifications,
    telegramChatId,
    setTelegramChatId,
    ntfyNotifications,
    setNtfyNotifications,
    onSubmit,
    isPending,
    error
  };


}