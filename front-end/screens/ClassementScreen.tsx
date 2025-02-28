import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Collapsible from "react-native-collapsible";
import { useData } from "../data/data";
import { Nominee, Vote } from "../types/types";
import { getAllVotes, getNominees } from "../api";
import { useUser } from "../context/UserContext";
import { useFocusEffect } from "@react-navigation/native";

export default function ClassementScreen() {
  const insets = useSafeAreaInsets();

  const { categories } = useData();
  const { users, refreshUsers } = useUser();

  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [allVotes, setAllVotes] = useState<Vote[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchNominees();
      refreshUsers();
      getAllVotes()
        .then((votes) => {
          setAllVotes(votes);
        })
        .catch((error) =>
          console.log("❌ Erreur lors du chargement des votes :", error)
        );
    }, [])
  );

  const fetchNominees = async () => {
    try {
      const nomineesData = await getNominees();
      setNominees(nomineesData);
    } catch (error) {
      console.log("❌ Erreur lors du chargement des nominés :", error);
    }
  };

  const calculateScores = useMemo(() => {
    const scores: Record<string, { total: number; details: any[] }> = {};

    Object.values(users).forEach((user) => {
      scores[user.id] = { total: user.score || 0, details: [] };
    });

    categories.forEach((category) => {
      if (!category.nominees) return;

      const categoryWinner = nominees.find(
        (nominee) => nominee.winner && nominee.category.id === category.id
      );
      if (!categoryWinner) return;

      const winnerId = categoryWinner.id;
      const winnerOdds = categoryWinner.currWinnerOdds;
      const losers = category.nominees.filter(
        (nominee) => nominee.id !== winnerId
      );

      Object.values(users).forEach((user) => {
        const id = user.id;
        if (!scores[id]) {
          scores[id] = { total: 0, details: [] };
        }
        const userVotes = allVotes.filter(
          (vote) => vote.user.id === id && vote.category.id === category.id
        );
        const hasWinner = userVotes.some(
          (vote) => vote.nominee.id === winnerId && vote.type === "winner"
        );
        const foundLoser = userVotes.some((vote) =>
          losers.some(
            (loser) => loser.id === vote.nominee.id && vote.type === "loser"
          )
        );

        let pointsGagnes = 0;
        let detail = {
          category: category.name,
          points: 0,
          foundWinner: false,
          foundLoser: false,
        };

        let userLoserOdds = 1;
        const userLoserVote = userVotes.find((vote) => vote.type === "loser");

        if (userLoserVote) {
          const loserNominee = category.nominees.find(
            (nominee) => nominee.id === userLoserVote.nominee.id
          );
          if (loserNominee) {
            userLoserOdds = loserNominee.currLoserOdds;
          }
        }

        if (hasWinner) {
          pointsGagnes = 10 * winnerOdds + 10 * userLoserOdds;
          detail.foundWinner = true;
          detail.foundLoser = true;
        } else if (foundLoser) {
          pointsGagnes = 10 * userLoserOdds;
          detail.foundLoser = true;
        } else {
          pointsGagnes = 0;
        }
        detail.points = pointsGagnes;

        console.log("detail pour user", user.username, detail);
        scores[id].details.push(detail);
      });
    });

    console.log("Scores calculés :", scores);

    return scores;
  }, [categories, allVotes, users]);

  const sortedUsers = useMemo(() => {
    console.log("🔄 Tri des utilisateurs pour le classement...");
    return Object.entries(users)
      .map(([id, user]) => {
        console.log("Couleur pour les joueurs", user.username, user.color);
        return {
          id,
          username: user.username || "Inconnu",
          photo: user.photo,
          color: user.color || "#B3984C",
          avatar: user.avatar || `🍿`,
          score: user.score || 0,
          rank: 0,
          details: calculateScores[user.id].details,
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((user, index) => ({ ...user, rank: index + 1 }));
  }, [calculateScores]);

  return (
    <View
      className="bg-zinc-900 flex-1"
      style={{ paddingTop: insets.top + 50 }}
    >
      <Text
        className="text-2xl font-bold text-center text-white mb-4 uppercase"
        style={{ fontFamily: "FuturaHeavy" }}
      >
        Classement
      </Text>

      <View className="flex-row justify-center items-end mb-6 mt-12 px-4">
        {[sortedUsers[1], sortedUsers[0], sortedUsers[2]].map((user, index) => {
          if (!user) return null;

          const podiumRank = index === 0 ? 2 : index === 1 ? 1 : 3;
          const isFirst = podiumRank === 1;
          const bgColor = isFirst
            ? "bg-[#E5B80B]"
            : podiumRank === 2
            ? "bg-[#c4c4c4]"
            : "bg-[#804A00]";
          const borderColor = isFirst
            ? "border-[#c39e0b]"
            : podiumRank === 2
            ? "border-gray-400"
            : "border-orange-400";
          const rankColor = isFirst
            ? "bg-[#c39e0b]"
            : podiumRank === 2
            ? "bg-gray-400"
            : "bg-orange-400";

          const podiumHeight = isFirst ? 140 : 110;
          const imageSize = isFirst ? 90 : 70;
          const imageOffset = isFirst ? -45 : -35;
          console.log(user.color);

          return (
            <View key={user.id} className="flex-1 items-center relative">
              <View
                style={{
                  ...styles.shadow,
                  width: imageSize,
                  height: imageSize,
                  top: imageOffset,
                  backgroundColor: user.color,
                }}
                className={`border-4 ${borderColor} rounded-full absolute overflow-hidden z-10 flex items-center justify-center`}
              >
                {user.photo ? (
                  <Image
                    source={{ uri: user.photo }}
                    className="w-full h-full"
                  />
                ) : (
                  <Text className="text-center text-[3rem]">{user.avatar}</Text>
                )}
              </View>

              <View
                className={`absolute z-20 ${
                  isFirst ? "top-8 w-8 h-8" : "top-6 w-6 h-6"
                } ${rankColor}  rounded-full flex items-center justify-center`}
              >
                {isFirst ? (
                  <Ionicons name="trophy-sharp" size={20} color="gold" />
                ) : (
                  <Text className="text-white text-sm font-bold">
                    {podiumRank}
                  </Text>
                )}
              </View>

              <View
                className={`w-32 ${bgColor} rounded-t-lg justify-end items-center pb-3 pt-16`}
                style={{ height: podiumHeight }}
              >
                <View className="items-center">
                  <Text className="text-white text-center font-bold">
                    {user.username}
                  </Text>
                  <Text className="text-black font-bold">
                    {user.score.toFixed(2)} pts
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <FlatList
        data={sortedUsers}
        keyExtractor={(user) => user?.id?.toString() ?? "unknown"}
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
        renderItem={({ item }) => (
          <>
            <TouchableOpacity
              onPress={() =>
                setExpandedUser(
                  expandedUser === item?.id ? null : item?.id ?? null
                )
              }
            >
              <View className="p-4 flex flex-row justify-between items-center mb-2 bg-zinc-800 rounded-md">
                <View className="flex flex-row items-center">
                  <Text className="text-lg font-bold text-white w-8">
                    {item?.rank ?? "-"}
                  </Text>
                  {item.photo ? (
                    <Image
                      source={{ uri: item.photo }}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  ) : (
                    <Text
                      className={`w-8 h-8 rounded-full mr-2 text-center text-xl`}
                      style={{ backgroundColor: item.color }}
                    >
                      {item.avatar}
                    </Text>
                  )}
                  <Text className="text-lg font-semibold text-white">
                    {item?.username ?? "Inconnu"}
                  </Text>
                </View>
                <Text className="text-lg font-bold text-[#E5B80B]">
                  {item?.score?.toFixed(2) ?? "0"} pts
                </Text>
              </View>
            </TouchableOpacity>

            <Collapsible collapsed={expandedUser !== item?.id}>
              <View className="bg-zinc-800 p-3 rounded-lg mb-2">
                <Text className="text-white font-bold text-lg mb-2">
                  Détail des points
                </Text>
                {item?.details.map((detail, index) => {
                  let statusText = "😬 Rien trouvé";
                  let statusColor = "text-gray-400";

                  if (detail.foundWinner && detail.foundLoser) {
                    statusText = "🏆 Gagnant & Perdant trouvés";
                    statusColor = "text-green-400";
                  } else if (detail.foundLoser) {
                    statusText = "👍🏻 Seulement le Perdant trouvé";
                    statusColor = "text-yellow-400";
                  }

                  return (
                    <View
                      key={index}
                      className="p-4 bg-zinc-900 rounded-md flex-row justify-between items-center mt-2"
                    >
                      <Text className="text-[#B3984C] font-semibold">
                        {detail.category ?? "?"}
                      </Text>
                      <View className="flex flex-col items-end">
                        <Text className={`font-semibold ${statusColor}`}>
                          {statusText}
                        </Text>
                        <Text className="text-gray-400">
                          {detail.points?.toFixed(2) ?? "0"} pts
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Collapsible>
          </>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
