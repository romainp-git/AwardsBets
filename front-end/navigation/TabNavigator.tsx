import React from "react";
import { View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { PronosticsStack } from "./PronosticsStack";
import HomeScreen from "../screens/HomeScreen";
import ClassementScreen from "../screens/ClassementScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ListsScreen from "../screens/ListsScreen";
import { LeaguesStack } from "./LeaguesStack";

const Tab = createBottomTabNavigator();

interface TabNavigatorProps {
  cachedImages: { [key: string]: string };
}

const TabNavigator: React.FC<TabNavigatorProps> = ({ cachedImages }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        //animation: "fade",
        headerShown: false,
        tabBarActiveTintColor: "white",
        tabBarShowLabel: true,
        tabBarInactiveTintColor: "#B3984C",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: "rgba(0,0,0,0.5)",
          borderTopWidth: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={40}
            tint="dark"
            className="absolute bottom-0 left-0 right-0 h-full w-full"
            experimentalBlurMethod={"dimezisBlurView"}
          />
        ),
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: string | undefined;

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Pronostics") iconName = "clipboard";
          else if (route.name === "Ligues") iconName = "trophy";
          else if (route.name === "Classement") iconName = "podium";
          else if (route.name === "Listes") iconName = "list";

          return (
            <View className="relative items-center">
              {focused && (
                <View
                  style={{
                    position: "absolute",
                    top: -7,
                    width: 280,
                    height: 45,
                    pointerEvents: "none",
                  }}
                >
                  <Image
                    source={require("../assets/halo.png")}
                    style={{
                      width: "100%",
                      height: "100%",
                      opacity: 0.8,
                    }}
                    resizeMode="contain"
                  />
                </View>
              )}
              <Ionicons
                name={iconName as keyof typeof Ionicons.glyphMap}
                size={size}
                color={color}
                style={{ zIndex: 10 }}
              />
            </View>
          );
        },
        animationEnabled: false,
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="Home"
        children={() => <HomeScreen cachedImages={cachedImages} />}
      />
      <Tab.Screen name="Pronostics" component={PronosticsStack} />
      <Tab.Screen name="Ligues" component={LeaguesStack} />
      <Tab.Screen name="Classement" component={ClassementScreen} />
      <Tab.Screen
        name="Listes"
        children={() => <ListsScreen cachedImages={cachedImages} />}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
