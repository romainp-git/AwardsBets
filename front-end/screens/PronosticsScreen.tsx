import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Collapsible from "react-native-collapsible";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CoteCard from "../components/CoteCard";
import VoteBar from "../components/VoteBar";
import { getAllVotes, getNominees, getUserVotes } from "../api";
import { useData } from "../data/data";
import { Category, Nominee, RootStackParamList, Vote } from "../types/types";
import { differenceInDays } from "date-fns";
import { StackNavigationProp } from "@react-navigation/stack";

const CategoryHeader: React.FC<{
  category: Category;
  activeCategory: string | null;
  toggleCategory: (categoryId: string) => void;
  logoUri: string;
}> = ({ category, activeCategory, toggleCategory, logoUri }) => (
  <LinearGradient
    colors={["#996F3D", "#D7C298"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
  >
    <TouchableOpacity
      onPress={() => toggleCategory(category.id)}
      className="flex flex-row justify-between items-center p-4"
    >
      <View className="flex flex-row gap-2 items-center">
        <Image
          source={{ uri: logoUri }}
          className="w-8 h-8"
          style={{ tintColor: "white" }}
        />
        <Text className="text-xl font-bold tracking-wide text-white">
          {category.name}
        </Text>
      </View>
      <Ionicons
        name={activeCategory === category.id ? "chevron-up" : "chevron-down"}
        size={24}
        color="white"
      />
    </TouchableOpacity>
  </LinearGradient>
);

const NomineeItem: React.FC<{
  item: Nominee;
  index: number;
  category: Category;
  winner: Nominee | undefined;
  calculateVotePercentage: (nominee: Nominee, category: Category) => number;
}> = ({ item, index, category, winner, calculateVotePercentage }) => (
  <View
    className={`flex flex-row justify-between items-center p-3 gap-2
      ${
        item === winner
          ? "bg-yellow-700/30 border rounded-md border-yellow-500"
          : "bg-zinc-800 rounded-md"
      }
      ${index === category.nominees.length - 1 ? "mb-0" : "mb-2"}`}
  >
    <View className="flex-1">
      <View className="flex flex-row gap-2 items-center">
        {item === winner && <Text className="text-white text-lg">🏆</Text>}
        {renderNameItem(category.type, item)}
      </View>
      <VoteBar percentage={calculateVotePercentage(item, category)} />
    </View>
    <CoteCard
      cote={item.currWinnerOdds}
      previousCote={item.prevWinnerOdds}
      label="Winner"
    />
    <CoteCard
      cote={item.currLoserOdds}
      previousCote={item.prevLoserOdds}
      label="Loser"
    />
  </View>
);

const UserVotesSection: React.FC<{
  selectedWinner: Nominee;
  selectedLoser: Nominee;
  navigation: StackNavigationProp<RootStackParamList>;
}> = ({ selectedWinner, selectedLoser, navigation }) => (
  <View className="w-full bg-yellow-600/30 py-3 border border-yellow-500 flex flex-col mb-3 rounded-md">
    <Text
      className="text-white text-xl text-center mb-2"
      style={{ fontFamily: "FuturaHeavy" }}
    >
      Mes votes
    </Text>
    <View className="flex flex-row items-center justify-center gap-2">
      <View className="flex flex-col items-center gap-2">
        <View className="flex flex-row items-center gap-3">
          <Image
            source={{ uri: selectedWinner.movie.poster }}
            style={{ width: 80, height: 120 }}
            className="rounded-md"
          />
          <View className="flex flex-col items-center gap-2">
            <Text className="font-bold text-white text-sm text-center">
              🏆 Gagnant
            </Text>
            <CoteCard
              cote={selectedWinner.currWinnerOdds}
              previousCote={selectedWinner.prevWinnerOdds}
              label="Winner"
            />
          </View>
        </View>
      </View>
      <Text className="text-white text-2xl">/</Text>
      <View className="flex flex-col items-center gap-2">
        <View className="flex flex-row items-center gap-3">
          <View className="flex flex-col items-center gap-2">
            <Text className="font-bold text-white text-sm text-center">
              Perdant 😭
            </Text>
            <CoteCard
              cote={selectedLoser.currLoserOdds}
              previousCote={selectedLoser.prevLoserOdds}
              label="Loser"
            />
          </View>
          <Image
            source={{ uri: selectedLoser.movie.poster }}
            style={{ width: 80, height: 120 }}
            className="rounded-md"
          />
        </View>
      </View>
    </View>
    <TouchableOpacity onPress={() => navigation.navigate("PronosticsStepper")}>
      <Text className="text-white text-md underline mt-2 text-center">
        Changer mes votes
      </Text>
    </TouchableOpacity>
  </View>
);

const renderNameItem = (categoryType: string, item: Nominee) => {
  switch (categoryType) {
    case "movie":
      return (
        <View>
          <Text className="text-white text-lg font-bold">
            {item.movie?.title}
          </Text>
          <Text className="text-gray-300">
            {item.team?.map((mp) => mp.person.name).join(", ") || "—"}
          </Text>
        </View>
      );
    case "actor":
    case "other":
      return (
        <View>
          <Text className="text-white text-lg font-bold">
            {item.team?.map((mp) => mp.person.name).join(", ") || "—"}
          </Text>
          <Text className="text-gray-300">{item.movie?.title}</Text>
        </View>
      );
    case "song":
      return (
        <View>
          <Text className="text-white text-lg font-bold">{item.song}</Text>
          <Text className="text-gray-300">
            {item.team?.map((mp) => mp.person.name).join(", ") || "—"}
          </Text>
          <Text className="text-gray-400 italic">{item.movie?.title}</Text>
        </View>
      );
    default:
      return <View className="w-12 h-12 rounded-full bg-gray-300"></View>;
  }
};

const PronosticsScreen: React.FC = () => {
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { competition, categories } = useData();

  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const [allVotes, setAllVotes] = useState<Vote[]>([]);
  const [nominees, setNominees] = useState<Nominee[]>([]);
  const [loading, setLoading] = useState(true);

  const startDate = new Date(competition?.date || "");
  const today = new Date();
  const remainingDays = differenceInDays(startDate, today);

  const sortedCategories = [...categories].sort(
    (a, b) => a.position - b.position
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const logoUri = useMemo(
    () =>
      "https://cdn.freelogovectors.net/wp-content/uploads/2023/01/oscar_logo-freelogovectors.net_.png",
    []
  );

  useEffect(() => {
    if (categories.length > 0) {
      const firstCategoryId =
        sortedCategories.length > 0 ? sortedCategories[0].id : null;
      setActiveCategory(firstCategoryId);
    }
  }, [categories]);

  useFocusEffect(
    useCallback(() => {
      fetchUserVotes();
      fetchNominees();
    }, [])
  );

  const fetchUserVotes = async () => {
    try {
      const [allVotesData, userVotesData] = await Promise.all([
        getAllVotes(),
        getUserVotes(),
      ]);
      setUserVotes(userVotesData.length ? userVotesData : []);
      setAllVotes(allVotesData.length ? allVotesData : []);
    } catch (error) {
      console.log("Erreur lors de la récupération des votes :", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNominees = async () => {
    try {
      const nomineesData = await getNominees();
      setNominees(nomineesData);
    } catch (error) {
      console.log("Erreur lors du chargement des nominés :", error);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setActiveCategory((prev) => (prev === categoryId ? null : categoryId));
    setTimeout(() => {
      if (flatListRef.current) {
        const index = sortedCategories.findIndex(
          (cat) => cat.id === categoryId
        );
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
        });
      }
    }, 300);
  };

  const votePercentages = useMemo(() => {
    if (!allVotes.length) return {};
    const percentages: Record<string, Record<string, number>> = {};
    allVotes.forEach((vote) => {
      if (vote.type !== "winner") return;
      if (!percentages[vote.category.id]) percentages[vote.category.id] = {};
      if (!percentages[vote.category.id][vote.nominee.id])
        percentages[vote.category.id][vote.nominee.id] = 0;
      percentages[vote.category.id][vote.nominee.id] += 1;
    });

    Object.keys(percentages).forEach((categoryId) => {
      const totalVotes = Object.values(percentages[categoryId]).reduce(
        (sum, num) => sum + num,
        0
      );
      if (totalVotes > 0) {
        Object.keys(percentages[categoryId]).forEach((nomineeId) => {
          percentages[categoryId][nomineeId] = Math.round(
            (percentages[categoryId][nomineeId] / totalVotes) * 100
          );
        });
      }
    });

    return percentages;
  }, [allVotes]);

  const calculateVotePercentage = (
    nominee: Nominee,
    category: Category
  ): number => votePercentages[category.id]?.[nominee.id] || 0;

  if (loading) {
    return <ActivityIndicator size="large" color="#B3984C" />;
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
        Mes pronostics
      </Text>
      {!userVotes.length && (
        <>
          <Text className="text-lg text-center text-white mb-4 px-4">
            Il reste : {remainingDays > 0 ? remainingDays : "moins d'un"}{" "}
            jour(s) avant la cérémonie de remise de prix. N'oublie pas de
            compléter tes pronostics !
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("PronosticsStepper")}
            className="bg-[#B3984C] py-3 mx-4 items-center"
          >
            <Text
              className="text-white font-bold text-xl"
              style={{ fontFamily: "FuturaHeavy" }}
            >
              Faire mes pronostics
            </Text>
          </TouchableOpacity>
          <View className="border-t border-[#d7b35f] mx-10 my-10"></View>
        </>
      )}
      <FlatList
        showsVerticalScrollIndicator={false}
        data={[...categories].sort((a, b) => a.position - b.position)}
        ref={flatListRef}
        keyExtractor={(category) => category.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
        getItemLayout={(data, index) => ({
          length: 65,
          offset: 65 * index,
          index,
        })}
        extraData={nominees}
        renderItem={({ item: category, index }) => {
          const findUserVote = (type: "winner" | "loser") =>
            userVotes.find(
              (vote) => vote.category.id === category.id && vote.type === type
            );
          const selectedWinner = nominees.find(
            (n) => n.id === findUserVote("winner")?.nominee.id
          );
          const selectedLoser = nominees.find(
            (n) => n.id === findUserVote("loser")?.nominee.id
          );
          const winner = nominees.find(
            (n) => n.winner && n.category.id === category.id
          );
          const categoryNominees = nominees.filter(
            (n) => n.category.id === category.id
          );

          return (
            <View key={category.id} className="mb-3">
              <CategoryHeader
                category={category}
                activeCategory={activeCategory}
                toggleCategory={toggleCategory}
                logoUri={logoUri}
              />
              <Collapsible
                collapsed={activeCategory !== sortedCategories[index].id}
              >
                <View className="px-2 pt-3">
                  {selectedWinner && selectedLoser && (
                    <UserVotesSection
                      selectedWinner={selectedWinner}
                      selectedLoser={selectedLoser}
                      navigation={navigation}
                    />
                  )}
                  <FlatList
                    data={categoryNominees.slice().sort((a, b) => {
                      if (a.winner) return -1;
                      if (b.winner) return 1;
                      return a.movie.title.localeCompare(b.movie.title);
                    })}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false}
                    extraData={nominees}
                    renderItem={({ item, index }) => (
                      <NomineeItem
                        item={item}
                        index={index}
                        category={category}
                        winner={winner}
                        calculateVotePercentage={calculateVotePercentage}
                      />
                    )}
                  />
                </View>
              </Collapsible>
            </View>
          );
        }}
      />
    </View>
  );
};

export default PronosticsScreen;
