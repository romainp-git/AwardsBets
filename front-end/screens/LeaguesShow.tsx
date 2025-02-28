import React from "react";
import { View, Text } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { League } from "../types/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type LeaguesShowRouteProp = RouteProp<
  { LeaguesShow: { league: League } },
  "LeaguesShow"
>;

export default function LeaguesShow() {
  const route = useRoute<LeaguesShowRouteProp>();
  const { league } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-zinc-900 p-5"
      style={{ paddingTop: insets.top + 50 }}
    >
      <Text className="text-2xl font-bold text-white">{league.name}</Text>
      <Text className="text-gray-400">
        Membres: {league.members.join(", ")}
      </Text>
      <Text className="text-gray-400">
        {league.competitions.length} compétitions
      </Text>
    </View>
  );
}
