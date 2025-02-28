import React, { useCallback, useState } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { League } from "../types/types";

export const mockLeagues: League[] = [
  {
    id: "1",
    name: "Ligue des Cinéphiles",
    competitions: ["Oscars 2025", "Cannes 2025"],
    members: ["Romain", "Alice", "Bob"],
  },
  {
    id: "2",
    name: "Ligue des Experts",
    competitions: ["BAFTA 2025", "Sundance 2025"],
    members: ["Claire", "David"],
  },
  {
    id: "3",
    name: "Ligue des Amateurs",
    competitions: ["Golden Globes 2025"],
    members: ["Emma", "Lucas", "Sophie"],
  },
];

type LeaguessScreenNavigationProp = StackNavigationProp<{
  LeaguesIndex: undefined;
  LeaguesShow: { league: League };
}>;

export default function LeaguessScreen() {
  const navigation = useNavigation<LeaguessScreenNavigationProp>();
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      setLoading(false);
    }, [])
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-900">
        <ActivityIndicator size="large" color="#B3984C" />
      </View>
    );
  }

  return (
    <View
      className="bg-zinc-900 flex-1"
      style={{ paddingTop: insets.top + 50 }}
    >
      <Text
        className="text-2xl font-bold text-center text-white mb-4 uppercase"
        style={{ fontFamily: "FuturaHeavy" }}
      >
        Mes Ligues
      </Text>

      <FlatList
        data={mockLeagues}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="p-3 mb-3 bg-gray-800 rounded-lg"
            onPress={() => navigation.navigate("LeaguesShow", { league: item })}
          >
            <Text className="text-white text-lg">{item.name}</Text>
            <Text className="text-gray-400 text-sm">
              {item.competitions.length} compétitions
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
