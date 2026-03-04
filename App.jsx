import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import * as Notifications from "expo-notifications";
import { supabase } from "./src/api/supabase";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  useEffect(() => {
    async function registerPush() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;

      const { data } = await supabase.auth.getSession();
      const userId = data?.session?.user?.id;

      if (userId) {
        await supabase
          .from("profiles")
          .update({ push_token: token })
          .eq("id", userId);
      }
    }

    registerPush();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
