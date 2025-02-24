import React, { useState, useEffect, useCallback } from "react";
import "./global.css";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const Stack = createStackNavigator();

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [cachedImages, setCachedImages] = useState<{ [key: string]: string }>(
    {}
  );
  const { user } = useUser();

  const { movies, people, loading } = useData();

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

  // ✅ Gestion des notifications
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
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("authToken");
      setIsAuthenticated(!!token);
      setAppIsReady(true);
    };

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
        checkAuth();
      }
    };

    preloadImages();
  }, [movies, people]);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      SplashScreen.hide();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <GestureHandlerRootView>
        <SafeAreaProvider>
          <UserProvider>
            <PaperProvider>
              <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                  {isAuthenticated ? (
                    <>
                      <Stack.Screen name="Main">
                        {({ navigation }) => (
                          <View className="flex-1 relative">
                            <Header
                              navigation={navigation}
                              setIsAuthenticated={setIsAuthenticated}
                            />
                            <TabNavigator cachedImages={cachedImages} />
                          </View>
                        )}
                      </Stack.Screen>
                      <Stack.Screen
                        name="EditProfile"
                        component={EditProfile}
                      />
                    </>
                  ) : (
                    <>
                      <Stack.Screen name="AuthScreen">
                        {() => (
                          <AuthScreen setIsAuthenticated={setIsAuthenticated} />
                        )}
                      </Stack.Screen>
                      <Stack.Screen name="RegisterScreen">
                        {() => (
                          <RegisterScreen
                            setIsAuthenticated={setIsAuthenticated}
                          />
                        )}
                      </Stack.Screen>
                    </>
                  )}
                </Stack.Navigator>
              </NavigationContainer>
            </PaperProvider>
          </UserProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </View>
  );
}
