import React, { useCallback, useState } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { League, RootStackParamList, staticLogos } from "../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { getUserLeagues } from "../api";
import { useUser } from "../context/UserContext";

export default function LeaguessScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { user } = useUser();

  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchLeagues = async () => {
        const leagues = await getUserLeagues(user?.id || "");
        setLeagues(leagues);
        setLoading(false);
      };
      fetchLeagues();
    }, [])
  );

  const getLogoSource = (logo: string) => {
    if (logo?.startsWith("http")) return { uri: logo };
    const staticLogo = staticLogos.find((l) => l.name === logo);
    return staticLogo
      ? staticLogo.source
      : require("../assets/logo-oscars.png"); // Image par défaut si introuvable
  };

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
        data={leagues}
        className="mx-2"
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="p-3 mb-2 bg-zinc-800 rounded-md flex-row gap-2 items-center"
            onPress={() => navigation.navigate("LeaguesShow", { league: item })}
          >
            <Image
              source={getLogoSource(item.logo || "")}
              className="w-20 h-20 rounded-full"
            />
            <View className="flex-col justify-center flex-1">
              <Text
                className="text-white text-xl w-full flex-wrap leading-6 mb-2"
                numberOfLines={2}
                style={{ fontFamily: "FuturaHeavy" }}
              >
                {item.name}
              </Text>

              <Text className="text-gray-400 text-sm">
                {item.competition.name} - {item.competition.edition} -{" "}
                {new Date(item.competition.date).toLocaleDateString("fr-FR", {
                  month: "numeric",
                  day: "numeric",
                  year: "numeric",
                })}
              </Text>
              <Text className="text-gray-400 text-sm">
                {item.members.length} membres
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        className="p-3 bg-[#B3984C] m-3"
        onPress={() => navigation.navigate("LeaguesStepper")}
        style={{ marginBottom: insets.bottom + tabBarHeight - 15 }}
      >
        <Text
          className="text-xl text-white font-bold text-center"
          style={{ fontFamily: "FuturaHeavy" }}
        >
          Créer une nouvelle ligue
        </Text>
      </TouchableOpacity>
    </View>
  );
}
