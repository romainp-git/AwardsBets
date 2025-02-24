import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Switch, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useData } from "../data/data";
import { Nominee, User, Vote } from "../types/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import {
  deleteVote,
  getAllVotes,
  getUserInfos,
  getUserVotes,
  submitVotes,
  updateNomineeOdds,
} from "../api";

export default function PronosticsStepper() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votesFromDB, setVotesFromDB] = useState<Record<string, Vote[]>>({});
  const [selectingWinner, setSelectingWinner] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const { categories } = useData();
  const category = categories[currentIndex];
  const [currentVotes, setCurrentVotes] = useState<Record<string, Vote[]>>({});

  const navigation = useNavigation();
  const tabBarHeight: number = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerOpacity = useDerivedValue(() => {
    return interpolate(scrollY.value, [0, 50], [0, 1], "clamp");
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData: User = await getUserInfos();
        setUser(userData);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération de l'utilisateur :",
          error
        );
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const loadVotes = async () => {
      try {
        const userVotes = await getUserVotes();

        const votesByCategory = userVotes.reduce(
          (acc: { [k: string]: Vote[] }, vote: Vote) => {
            if (!acc[vote.category.id]) acc[vote.category.id] = [];
            acc[vote.category.id].push(vote);
            return acc;
          },
          {}
        );

        setVotesFromDB(votesByCategory);
        setCurrentVotes(votesByCategory);
      } catch (error) {
        console.error("Erreur lors du chargement des votes :", error);
      }
    };

    loadVotes();
  }, []);

  const filterModifiedVotes = () => {
    const votesToDelete: Vote[] = [];
    const votesToAdd: Vote[] = [];

    Object.keys(currentVotes).forEach((categoryId) => {
      const oldVotes: Vote[] = votesFromDB[categoryId] || [];
      const newVotes: Vote[] = currentVotes[categoryId] || [];

      oldVotes.forEach((oldVote) => {
        const isStillValid = newVotes.some(
          (newVote) =>
            newVote.nominee.id === oldVote.nominee.id &&
            newVote.type === oldVote.type
        );
        if (!isStillValid) {
          votesToDelete.push(oldVote);
        }
      });

      newVotes.forEach((newVote) => {
        const isNew: boolean = !oldVotes.some(
          (oldVote) =>
            oldVote.nominee.id === newVote.nominee.id &&
            oldVote.type === newVote.type
        );
        if (isNew) {
          votesToAdd.push(newVote);
        }
      });
    });

    return { votesToAdd, votesToDelete };
  };

  const handleVote: (nominee: Nominee) => void = (nominee: Nominee) => {
    if (!user) return;

    setCurrentVotes((prev) => {
      let updatedVotes: Record<string, Vote[]> = { ...prev };
      let voteType: "winner" | "loser" = selectingWinner ? "winner" : "loser";
      let categoryVotes: Vote[] = [...(updatedVotes[category.id] || [])];

      categoryVotes = categoryVotes.filter((vote) => vote.type !== voteType);

      categoryVotes.push({
        id: `${category.id}-${nominee.id}`,
        category,
        user,
        nominee,
        type: voteType,
      });

      updatedVotes[category.id] = categoryVotes;
      return updatedVotes;
    });
  };

  const isCategoryComplete = () => {
    const categoryVotes: Vote[] = currentVotes[category?.id] || [];
    const hasWinner: boolean = categoryVotes.some(
      (vote) => vote.type === "winner"
    );
    const hasLoser: boolean = categoryVotes.some(
      (vote) => vote.type === "loser"
    );

    return hasWinner && hasLoser;
  };

  const calculateOdds = (votesForNominee: number, totalVotes: number) => {
    if (totalVotes === 0) return 2;

    const probability = votesForNominee / totalVotes;
    const rawOdds = 1 / probability;

    return parseFloat(Math.max(1.2, Math.min(rawOdds, 10)).toFixed(1));
  };

  const updateAllNomineesOdds = async (modifiedCategoryIds: string[]) => {
    try {
      const allVotesData = await getAllVotes();

      for (const category of categories.filter((cat) =>
        modifiedCategoryIds.includes(cat.id)
      )) {
        const categoryVotes = allVotesData.filter(
          (vote: Vote) =>
            vote.type === "winner" && vote.category.id === category.id
        );
        const totalVotes = categoryVotes.length;
        const categoryNominees = category.nominees;

        for (const nominee of categoryNominees) {
          const nomineeVotes = categoryVotes.filter(
            (vote: Vote) => vote.nominee.id === nominee.id
          ).length;

          const newOdds = {
            prevWinnerOdds: nominee.currWinnerOdds,
            prevLoserOdds: nominee.currLoserOdds,
            currWinnerOdds: calculateOdds(nomineeVotes, totalVotes),
            currLoserOdds: calculateOdds(totalVotes - nomineeVotes, totalVotes),
          };

          console.log(
            `🎲 Mise à jour des odds pour ${nominee.movie?.title}:`,
            newOdds
          );
          await updateNomineeOdds(nominee.id, newOdds);
        }
      }
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour des odds :", error);
    }
  };

  const cancelVoting = () => {
    navigation.goBack();
  };

  const goToNextCategory = async () => {
    if (!user) return;

    if (currentIndex < categories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectingWinner(true);
    } else {
      try {
        const { votesToAdd, votesToDelete } = filterModifiedVotes();
        for (const vote of votesToDelete) {
          await deleteVote(vote.id);
        }

        if (votesToAdd.length > 0) {
          await submitVotes(votesToAdd);
        }

        const modifiedCategories = [
          ...new Set(votesToAdd.map((vote) => vote.category.id)),
        ];
        await updateAllNomineesOdds(modifiedCategories);
        navigation.goBack();
      } catch (error) {
        console.error("Erreur lors de l'envoi des votes :", error);
      }
    }
  };

  const goToPreviousCategory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <View className="bg-zinc-900 flex-1 relative">
      <Animated.ScrollView
        className="flex-1 p-4"
        style={Platform.OS === "ios" ? { paddingTop: insets.top + 50 } : {}}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        <Text
          className="text-2xl font-bold text-center mb-4 text-white"
          style={{ fontFamily: "FuturaHeavy" }}
        >
          {category?.name}
        </Text>

        <View className="flex-row items-center justify-center mb-4 gap-3">
          <Text
            className={`text-lg font-bold ${
              selectingWinner ? "text-yellow-500" : "text-gray-400"
            }`}
          >
            Lauréat
          </Text>
          <Switch
            trackColor={{ false: "#767577", true: "#767577" }}
            thumbColor={selectingWinner ? "#B3984C" : "#f4f3f4"}
            onValueChange={() => setSelectingWinner(!selectingWinner)}
            value={!selectingWinner}
          />
          <Text
            className={`text-lg font-bold ${
              !selectingWinner ? "text-white" : "text-gray-400"
            }`}
          >
            Perdant
          </Text>
        </View>

        <Text className="text-lg text-center text-gray-400 mb-2">
          {selectingWinner
            ? "Sélectionnez le lauréat"
            : "Sélectionnez un perdant"}
        </Text>

        {category?.nominees.map((nominee: Nominee) => {
          const categoryVotes = currentVotes[category?.id] || [];

          const isWinner = categoryVotes.some(
            (vote) => vote.type === "winner" && vote.nominee.id === nominee.id
          );
          const isLoser = categoryVotes.some(
            (vote) => vote.type === "loser" && vote.nominee.id === nominee.id
          );
          const isDisabled =
            (selectingWinner && isLoser) || (!selectingWinner && isWinner);

          let nomineeTextParts: [string, string] = ["", ""];

          if (category.type === "movie") {
            nomineeTextParts = [
              nominee.movie?.title || "Titre inconnu",
              `de ${
                nominee.team.find((member: { roles: string[] }) =>
                  member.roles.includes("director")
                )?.person.name || "Réalisateur inconnu"
              }`,
            ];
          } else if (category.type === "actor") {
            // Pour une personne, nom + film
            nomineeTextParts = [
              nominee.team[0]?.person.name || "Nom inconnu",
              nominee.movie?.title || "Film inconnu",
            ];
          } else if (category.type === "other") {
            // Pour une personne, nom + film
            nomineeTextParts = [
              nominee.team[0]?.person.name || "Nom inconnu",
              nominee.movie?.title || "Film inconnu",
            ];
          } else if (category.type === "song") {
            // Pour une chanson, titre + film
            nomineeTextParts = [
              nominee.song || "Titre inconnu",
              nominee.movie?.title || "Film inconnu",
            ];
          }

          return (
            <TouchableOpacity
              key={nominee.id}
              onPress={() => !isDisabled && handleVote(nominee)}
              disabled={isDisabled}
              className={`p-3 border border-[#B3984C] mb-2 ${
                isWinner
                  ? "bg-yellow-700/30 border border-yellow-500"
                  : isLoser
                  ? "border-gray-500 bg-gray-600"
                  : "bg-zinc-800  border-zinc-900 rounded-md"
              } ${isDisabled ? "opacity-50" : ""}`}
            >
              <Text className="text-white font-bold">
                {nomineeTextParts[0]}
              </Text>
              <Text className="text-white">{nomineeTextParts[1]}</Text>
            </TouchableOpacity>
          );
        })}

        <View className="flex-1" style={{ paddingBottom: tabBarHeight }}>
          <View className="flex-row justify-between mt-4 gap-2">
            {currentIndex > 0 ? (
              <>
                <TouchableOpacity
                  onPress={goToPreviousCategory}
                  className="py-3 px-6 border border-[#B3984C] w-1/2"
                >
                  <Text
                    className="text-xl text-[#B3984C] font-bold text-center"
                    style={{ fontFamily: "FuturaHeavy" }}
                  >
                    Précédent
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={isCategoryComplete() ? goToNextCategory : () => {}}
                  className={`py-3 px-6 w-1/2 ${
                    isCategoryComplete()
                      ? "bg-[#B3984C]"
                      : "bg-gray-500 opacity-50"
                  }`}
                  disabled={!isCategoryComplete()}
                >
                  <Text
                    className="text-xl text-white font-bold text-center"
                    style={{ fontFamily: "FuturaHeavy" }}
                  >
                    {currentIndex < categories.length - 1
                      ? "Suivant"
                      : "Terminer"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View className="flex-1">
                <TouchableOpacity
                  onPress={isCategoryComplete() ? goToNextCategory : () => {}}
                  className={`py-3 px-6 w-full ${
                    isCategoryComplete()
                      ? "bg-[#B3984C]"
                      : "bg-gray-500 opacity-50"
                  }`}
                  disabled={!isCategoryComplete()}
                >
                  <Text
                    className="text-xl text-white font-bold text-center"
                    style={{ fontFamily: "FuturaHeavy" }}
                  >
                    {currentIndex < categories.length - 1
                      ? "Suivant"
                      : "Terminer"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity
            onPress={cancelVoting}
            className="mt-2 py-2 items-center"
          >
            <Text className="text-gray-400 text-lg underline">Annuler</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>

      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          height: insets.top + 45,
          backgroundColor: "rgba(0,0,0,0.3)",
          opacity: headerOpacity,
        }}
      >
        <BlurView
          intensity={50}
          tint="dark"
          style={{ flex: 1 }}
          experimentalBlurMethod={"dimezisBlurView"}
        />
      </Animated.View>
    </View>
  );
}
