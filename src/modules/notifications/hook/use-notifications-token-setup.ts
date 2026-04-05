// hooks/useNotificationsTokenSetup.ts
import useCurrentUser from "@/modules/auth/hooks/users/use-user";
import { useEffect } from "react";
import { getDeviceInfo } from "../utils/devices";
import sendUserNotificationsToken from "../services/bg-notifications/tokens-setup";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "@/lib/firebase";
import { useQueryClient } from "@tanstack/react-query";
import { useNotificationsTokensStore } from "../store/notifications-tokens";
import { USE_MOCK } from "@/lib/mock-config";

export default function useNotificationsTokenSetup() {
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();
  const fcmToken = useNotificationsTokensStore(store => store.fcmToken);

  useEffect(() => {
    if (USE_MOCK) return;

    const setupToken = async () => {
      try {
        if (!user || fcmToken !== null) return;
        if (!messaging) return;

        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        // Get FCM token
        const fcmTokenFromFirebase = await getToken(messaging);
        if (!fcmTokenFromFirebase) return;

        const { device, deviceType } = getDeviceInfo();

        const res = await sendUserNotificationsToken({
          data: {
            token: fcmTokenFromFirebase,
            device,
            deviceType,
          }
        });

      } catch {
      }
    };

    if (user)
      setupToken();

    // Handle foreground messages
    if (!messaging) return;
    const unsubscribe = onMessage(messaging, (payload) => {
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
        exact: false
      })
    });

    return () => unsubscribe();

  }, [user]);

}
