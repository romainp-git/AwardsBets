import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LeaguesScreen from "../screens/LeaguesScreen";
import LeaguesShow from "../screens/LeaguesShow";

const Stack = createStackNavigator();

export function LeaguesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LeaguesIndex" component={LeaguesScreen} />
      <Stack.Screen name="LeaguesShow" component={LeaguesShow} />
    </Stack.Navigator>
  );
}
