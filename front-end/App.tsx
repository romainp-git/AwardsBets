import React, { useState, useEffect } from "react";
import "./global.css";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, ActivityIndicator, Text, Alert, AppState } from "react-native";
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

import { UserProvider, useUser } from "./context/UserContext";
import usePushNotifications from "./context/UsePushNotifications";

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [cachedImages, setCachedImages] = useState<{ [key: string]: string }>({});
  const { user } = useUser();

  const { movies, people, loading, error } = useData();

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
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log("📩 Notification reçue :", notification);
      if (AppState.currentState === "active") {
        Alert.alert("🏆 Mise à jour", "Un nouveau gagnant a été désigné !");
      }
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("🔍 L'utilisateur a cliqué sur la notification :", response);
      Alert.alert("🏆 Mise à jour", "Un nouveau gagnant a été désigné !");
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  // ✅ Vérification de l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("authToken");
      setIsAuthenticated(!!token);
    };

    // ✅ Préchargement des images avec cache
    const preloadImages = async () => {
      try {
        const allImages = [
          ...Object.values(movies).flatMap((film) => [film.poster, film.backdrop, film.logo]),
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
        setIsLoading(false);
        checkAuth();
      }
    };

    preloadImages();
  }, [movies, people]);

  // ✅ Affichage du chargement
  if (loading || isLoading || isAuthenticated === null || !fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#B3984C" />
      </View>
    );
  }

  // ✅ Gestion des erreurs
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white">❌ Erreur : {error}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
                          <Header navigation={navigation} setIsAuthenticated={setIsAuthenticated} />
                          <TabNavigator cachedImages={cachedImages} />
                        </View>
                      )}
                    </Stack.Screen>
                    <Stack.Screen name="EditProfile" component={EditProfile} />
                  </>
                ) : (
                  <>
                    <Stack.Screen name="AuthScreen">
                      {() => <AuthScreen setIsAuthenticated={setIsAuthenticated} />}
                    </Stack.Screen>
                    <Stack.Screen name="RegisterScreen" >
                      {() => <RegisterScreen setIsAuthenticated={setIsAuthenticated} />}
                    </Stack.Screen>
                  </>
                )}
              </Stack.Navigator>
            </NavigationContainer>
          </PaperProvider>
        </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}