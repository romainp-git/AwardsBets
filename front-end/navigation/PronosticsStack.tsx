import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import PronosticsScreen from "../screens/PronosticsScreen";
import PronosticsStepper from "../screens/PronosticsStepper";

const Stack = createStackNavigator();

export function PronosticsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PronosticsMain" component={PronosticsScreen} />
      <Stack.Screen name="PronosticsStepper" component={PronosticsStepper} />
    </Stack.Navigator>
  );
}