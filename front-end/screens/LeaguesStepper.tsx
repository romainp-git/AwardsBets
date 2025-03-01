import React, { useState, useEffect, createContext, useContext } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Competition } from "../types/types";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  interpolate,
  useDerivedValue,
} from "react-native-reanimated";
import { CreateLeague, getUserLeagues } from "../api";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../context/UserContext";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { staticLogos } from "../types/types";

interface FriendType {
  id: number;
  name: string;
  email: string;
}

interface LeagueContextProps {
  isPrivate: boolean;
  setIsPrivate: (value: boolean) => void;
  selectedLogoUri: string | null;
  setSelectedLogoUri: (uri: string | null) => void;
  selectedLogoIndex: number | null;
  setSelectedLogoIndex: (index: number | null) => void;
  competitions: Competition[];
  selectedCompetition: Competition | null;
  setSelectedCompetition: (comp: Competition) => void;
  friendList: FriendType[];
  selectedFriends: FriendType[];
  setSelectedFriends: (friends: FriendType[]) => void;
  invitedEmails: string[];
  setInvitedEmails: (emails: string[]) => void;
  pickImage: () => Promise<void>;
}
const CreateLeagueContext = createContext<LeagueContextProps | undefined>(
  undefined
);

const Stepper = ({ currentStep }: { currentStep: number }) => {
  return (
    <View className="w-full flex-row justify-between items-center my-4">
      {["Step 1", "Step 2", "Step 3"].map((_, index) => (
        <View
          key={index}
          className={`h-1 flex-1 mx-1 ${
            index <= currentStep ? "bg-[#B3984C]" : "bg-gray-600"
          }`}
        />
      ))}
    </View>
  );
};

const LogoPicker: React.FC = () => {
  const context = useContext(CreateLeagueContext);
  if (!context) throw new Error("CreateLeagueContext not provided");

  const {
    selectedLogoUri,
    setSelectedLogoUri,
    selectedLogoIndex,
    setSelectedLogoIndex,
    pickImage,
  } = context;

  const selectStaticLogo = (index: number) => {
    setSelectedLogoIndex(index);
    setSelectedLogoUri(null);
  };

  return (
    <View className="flex-row flex-wrap justify-center gap-4">
      {staticLogos.map((logo, idx: number) => {
        const isSelected = selectedLogoIndex === idx && !selectedLogoUri;
        return (
          <TouchableOpacity
            key={idx}
            onPress={() => selectStaticLogo(idx)}
            className={`w-[100px] h-[100px] flex items-center justify-center border rounded ${
              isSelected ? "border-[#B3984C]" : "border-gray-500"
            }`}
          >
            <Image source={logo.source} className="w-[90px] h-[90px]" />
          </TouchableOpacity>
        );
      })}

      {/* ✅ Bouton pour uploader une image */}
      <TouchableOpacity
        onPress={async () => {
          await pickImage();
          setSelectedLogoIndex(null);
        }}
        className={`w-[100px] h-[100px] flex items-center justify-center border rounded ${
          selectedLogoUri ? "border-[#B3984C]" : "border-gray-500"
        }`}
      >
        {selectedLogoUri ? (
          <Image
            source={{ uri: selectedLogoUri }}
            className="w-[90px] h-[90px]"
          />
        ) : (
          <Text className="text-xs text-gray-300 text-center">
            Uploader un logo
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const CompetitionList: React.FC = () => {
  const context = useContext(CreateLeagueContext);
  if (!context) throw new Error("CreateLeagueContext not provided");

  const { competitions, selectedCompetition, setSelectedCompetition } = context;

  if (competitions.length === 0) {
    return <Text>Chargement des compétitions...</Text>;
  }

  return (
    <View>
      {competitions.map((comp) => {
        const isSelected = selectedCompetition?.id === comp.id;
        return (
          <TouchableOpacity
            key={comp.id}
            onPress={() => setSelectedCompetition(comp)}
          >
            <View
              className={`p-3 my-1 rounded ${
                isSelected
                  ? "bg-yellow-700/30 border border-yellow-500 "
                  : "bg-zinc-800"
              }`}
            >
              <Text className="font-bold text-white">
                {comp.name} – {comp.edition}
              </Text>
              <Text className="text-white">
                Date : {comp.date.toString()} à {comp.startTime}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const FriendInvite: React.FC = () => {
  const context = useContext(CreateLeagueContext);
  if (!context) throw new Error("CreateLeagueContext not provided");

  const {
    friendList,
    selectedFriends,
    setSelectedFriends,
    invitedEmails,
    setInvitedEmails,
  } = context;

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [emailInput, setEmailInput] = useState<string>("");

  // Filter friends based on search query
  const filteredFriends = friendList.filter(
    (friend) =>
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle selection of a friend
  const toggleFriendSelection = (friend: FriendType) => {
    if (selectedFriends.some((f) => f.id === friend.id)) {
      // Remove friend if already selected
      setSelectedFriends(selectedFriends.filter((f) => f.id !== friend.id));
    } else {
      // Add friend to selected list
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  return (
    <View className="mb-4">
      <TextInput
        className="bg-zinc-800 text-white py-3 px-4 mb-4 border border-[#B3984C]"
        placeholder="Rechercher un ami"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filteredFriends.map((friend) => {
        const isSelected = selectedFriends.some((f) => f.id === friend.id);
        return (
          <TouchableOpacity
            key={friend.id}
            onPress={() => toggleFriendSelection(friend)}
          >
            <View className="py-2 border-b border-gray-200 flex-row justify-between">
              <Text className="text-white">
                {friend.name} ({friend.email})
              </Text>
              {isSelected && <Text className="text-green-600">✔️</Text>}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function CreateLeagueScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [step, setStep] = useState(0);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [selectedLogoUri, setSelectedLogoUri] = useState<string | null>(null);
  const [selectedLogoIndex, setSelectedLogoIndex] = useState<number | null>(0);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [selectedCompetition, setSelectedCompetition] =
    useState<Competition | null>(null);
  const [friendList, setFriendList] = useState<FriendType[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<FriendType[]>([]);
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [leagueName, setLeagueName] = useState("");
  const { user } = useUser();
  const tabBarHeight = useBottomTabBarHeight();

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
    const fetchCompetitions = async () => {
      try {
        const response = await fetch(
          "https://awards-bets.fr/api/competitions/"
        );
        const data = await response.json();
        setCompetitions(data);
      } catch (error) {
        console.error("Erreur lors du chargement des compétitions:", error);
      }
    };
    fetchCompetitions();

    const exampleFriends: FriendType[] = [
      { id: 1, name: "Alice", email: "alice@example.com" },
      { id: 2, name: "Bob", email: "bob@example.com" },
      { id: 3, name: "Charlie", email: "charlie@example.com" },
    ];
    setFriendList(exampleFriends);
  }, []);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert(
        "Permission d'accéder à la galerie est requise pour uploader un logo."
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      if (result.assets && result.assets.length > 0) {
        setSelectedLogoUri(result.assets[0].uri);
      } else if ((result as any).uri) {
        setSelectedLogoUri((result as any).uri);
      }
      setSelectedLogoIndex(0);
    }
  };

  const handleCreateLeague = async () => {
    try {
      const leagueData = {
        name: leagueName,
        visibility: isPrivate ? "private" : "public",
        logo: selectedLogoUri
          ? selectedLogoUri
          : selectedLogoIndex !== null
          ? staticLogos[selectedLogoIndex].name
          : null,

        citation: "",
        competitionId: selectedCompetition?.id || null,
        members: selectedFriends.map((f) => f.id),
      };

      console.log("Creating league with data:", leagueData);
      await CreateLeague(leagueData);

      navigation.goBack();
    } catch (error) {
      console.log("Erreur lors de la création de la ligue :", error);
    }
  };

  const handleNextStep = async () => {
    if (step === 0) {
      if (!leagueName.trim()) {
        alert("Le nom de la ligue ne peut pas être vide.");
        return;
      }

      const leagues = await getUserLeagues(user?.id || "");
      const nameExists = leagues.some(
        (league: { name: string }) =>
          league.name.toLowerCase() === leagueName.toLowerCase()
      );

      if (nameExists) {
        Alert.alert(
          "Déjà pris !",
          "Ce nom de ligue est déjà pris, veuillez en choisir un autre."
        );
        return;
      }
    }

    setStep(step + 1);
  };

  const canProceedToNextStep = () => {
    if (step === 0) {
      return leagueName.trim().length > 0;
    }
    if (step === 1) {
      return selectedCompetition !== null;
    }
    if (step === 2) {
      return true;
    }
    return false;
  };

  return (
    <CreateLeagueContext.Provider
      value={{
        isPrivate,
        setIsPrivate,
        selectedLogoUri,
        setSelectedLogoUri,
        selectedLogoIndex,
        setSelectedLogoIndex,
        competitions,
        selectedCompetition,
        setSelectedCompetition,
        friendList,
        selectedFriends,
        setSelectedFriends,
        invitedEmails,
        setInvitedEmails,
        pickImage,
      }}
    >
      <View className="bg-zinc-900 flex-1 relative">
        <Text
          className="text-2xl font-bold text-center text-white mb-4"
          style={{
            fontFamily: "FuturaHeavy",
            ...(Platform.OS === "ios" ? { paddingTop: insets.top + 50 } : {}),
          }}
        >
          Créer une ligue
        </Text>

        <Stepper currentStep={step} />

        <Animated.ScrollView
          className="flex-1 p-4 box-border"
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
        >
          {step === 0 && (
            <>
              <View className="mb-2">
                <Text
                  className="font-bold text-lg text-white mb-2"
                  style={{ fontFamily: "FuturaBook" }}
                >
                  Nom de la ligue
                </Text>
                <TextInput
                  className="bg-zinc-800 text-white py-3 px-4 mb-4 border border-[#B3984C]"
                  placeholder="Entrez un nom de ligue"
                  placeholderTextColor="#aaa"
                  value={leagueName}
                  onChangeText={setLeagueName}
                />
              </View>

              <View className="flex-row items-center justify-between mb-2">
                <Text
                  className="font-bold text-lg text-white mb-2"
                  style={{ fontFamily: "FuturaBook" }}
                >
                  Activer le mode privé
                </Text>
                <Switch value={isPrivate} onValueChange={setIsPrivate} />
              </View>

              <Text
                className="font-bold text-lg text-white mb-2"
                style={{ fontFamily: "FuturaBook" }}
              >
                Sélection du logo
              </Text>
              <LogoPicker />
            </>
          )}

          {step === 1 && (
            <>
              <Text
                className="font-bold text-lg text-white mb-2"
                style={{ fontFamily: "FuturaBook" }}
              >
                Sélection de la compétition
              </Text>
              <CompetitionList />
            </>
          )}

          {step === 2 && (
            <>
              <Text
                className="font-bold text-lg text-white mb-2"
                style={{ fontFamily: "FuturaBook" }}
              >
                Inviter des amis
              </Text>
              <FriendInvite />
            </>
          )}

          <View
            className="w-full box-border"
            style={{ paddingBottom: tabBarHeight + 10 }}
          >
            <View className="flex-row justify-between mt-4 w-full gap-4 box-border">
              {step > 0 && (
                <TouchableOpacity
                  onPress={() => setStep(step - 1)}
                  className="py-3 px-6 border border-[#B3984C] flex-1"
                >
                  <Text className="text-xl text-[#B3984C] font-bold text-center">
                    Retour
                  </Text>
                </TouchableOpacity>
              )}
              {step < 2 ? (
                <TouchableOpacity
                  onPress={() => handleNextStep()}
                  className={`py-3 px-6  flex-1 ${
                    canProceedToNextStep()
                      ? "bg-[#B3984C]"
                      : "bg-gray-500 opacity-50"
                  }`}
                  disabled={!canProceedToNextStep()}
                >
                  <Text className="text-xl text-white font-bold text-center">
                    Suivant
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleCreateLeague}
                  className="py-3 px-6 bg-[#B3984C] flex-1"
                >
                  <Text className="text-xl text-white font-bold text-center">
                    Créer la ligue
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity className="mt-2 py-2 items-center">
              <Text className="text-white text-md underline">Annuler</Text>
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
    </CreateLeagueContext.Provider>
  );
}
