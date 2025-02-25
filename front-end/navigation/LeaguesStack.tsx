import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import PronosticsScreen from "../screens/PronosticsScreen";

const Stack = createStackNavigator();

export function LeaguesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PronosticsMain" component={PronosticsScreen} />
    </Stack.Navigator>
  );
}
