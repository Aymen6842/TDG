import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { NotificationSettingsType } from "../types";
import { useEffect, useState } from "react";

/**
 * This hook is used to extract personal user notifications settings
 * @returns settings related to user notifications
 */
export default function usePersonalNotificationsSettings(): { settings?: NotificationSettingsType | null, isLoading: boolean, isError: boolean } {
  // This hook can be expanded in the future to include logic for fetching and updating notification settings
  const { user, isLoading, isError } = useCurrentUser()
  const [settings, setSettings] = useState<NotificationSettingsType | null>(null);

  useEffect(() => {
    if (user) {
      setSettings({
        ...user.notificationsSettings,
        ntfyTopic: user.id
      });
    }
  }, [user])

  return {
    settings: user ? settings : user,
    isLoading,
    isError
  };
}