import React, { useState, useEffect } from "react";
import "./global.css";

import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Alert, AppState } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";

import Header from "./components/Header";
import AuthScreen from "./screens/AuthScreen";
import RegisterScreen from "./screens/RegisterScreen";
import TabNavigator from "./navigation/TabNavigator";
import EditProfile from "./screens/EditProfile";
import { useData } from "./data/data";
import { PaperProvider } from "react-native-paper";
import * as SplashScreen from "expo-splash-screen";

import { UserProvider, useUser } from "./context/UserContext";
import usePushNotifications from "./context/UsePushNotifications";
import { AuthProvider, useAuth } from "./context/AuthContext";

const Stack = createStackNavigator();

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function App() {
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <AuthProvider>
          <UserProvider>
            <PaperProvider>
              <MainNavigator />
            </PaperProvider>
          </UserProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const MainNavigator = () => {
  const { isAuthenticated } = useAuth();
  const [appIsReady, setAppIsReady] = useState(false);
  const [cachedImages, setCachedImages] = useState<{ [key: string]: string }>(
    {}
  );
  const { user } = useUser();
  const { movies, people } = useData();

  const [fontsLoaded] = useFonts({
    FuturaBook: require("./assets/fonts/FuturaBook.ttf"),
    FuturaHeavy: require("./assets/fonts/FuturaHeavy.ttf"),
  });

  const expoPushToken = usePushNotifications(user?.id ?? "");

  useEffect(() => {
    if (expoPushToken) {
      console.log("📲 Expo Push Token enregistré :", expoPushToken);
    }
  }, [expoPushToken]);

  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("📩 Notification reçue :", notification);
        if (AppState.currentState === "active") {
          Alert.alert("🏆 Mise à jour", "Un nouveau gagnant a été désigné !");
        }
      }
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(
          "🔍 L'utilisateur a cliqué sur la notification :",
          response
        );
        Alert.alert("🏆 Mise à jour", "Un nouveau gagnant a été désigné !");
      });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  useEffect(() => {
    const preloadImages = async () => {
      try {
        const allImages = [
          ...Object.values(movies).flatMap((film) => [
            film.poster,
            film.backdrop,
            film.logo,
          ]),
          ...Object.values(people).map((person) => person.photo),
        ].filter(Boolean);

        const imageCache: { [key: string]: string } = {};
        await Promise.all(
          allImages.map(async (uri) => {
            imageCache[uri] = uri;
          })
        );
        setCachedImages(imageCache);
      } catch (error) {
        console.log("❌ Erreur lors du préchargement des images :", error);
      } finally {
        setAppIsReady(true);
      }
    };
    preloadImages();
  }, [movies, people]);

  useEffect(() => {
    if (appIsReady && isAuthenticated !== null) {
      console.log("🚀 Hiding SplashScreen...");
      SplashScreen.hideAsync();
    }
  }, [appIsReady, isAuthenticated]);

  if (!appIsReady || isAuthenticated === null) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Main">
                {() => (
                  <View className="flex-1 relative">
                    <Header />
                    <TabNavigator cachedImages={cachedImages} />
                  </View>
                )}
              </Stack.Screen>
              <Stack.Screen name="EditProfile" component={EditProfile} />
            </>
          ) : (
            <>
              <Stack.Screen name="AuthScreen" component={AuthScreen} />
              <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};
