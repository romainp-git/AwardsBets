import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import { getAuthHeaders } from "../api";

const API_BASE_URL = "https://awards-bets.fr/api";

export default function usePushNotifications(userId: string) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    const registerForPushNotifications = async () => {
      if (!Device.isDevice) {
        console.log("🚫 Notifications push désactivées sur simulateur");
        return;
      }

      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } =
          await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
          console.log("🚫 Permission refusée pour les notifications");
          return;
        }
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      setExpoPushToken(token);

      await AsyncStorage.setItem("expoPushToken", token);

      const authHeaders = await getAuthHeaders();
      await fetch(`${API_BASE_URL}/users/register-push-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders.headers,
        },
        body: JSON.stringify({ userId, expoPushToken: token }),
      }).catch((err) =>
        console.log("❌ Erreur enregistrement push token :", err)
      );
    };

    registerForPushNotifications();
  }, []);

  return expoPushToken;
}
