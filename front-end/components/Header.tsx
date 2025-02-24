import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserInfos } from "../api";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { useUser } from "../context/UserContext";

const screenWidth = Dimensions.get("window").width;
const screenHeight = Dimensions.get("window").height;

type HeaderProps = {
  navigation: StackNavigationProp<RootStackParamList, "Main">;
  setIsAuthenticated: (value: boolean) => void;
};

const Header: React.FC<HeaderProps> = ({ navigation, setIsAuthenticated }) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, setUser } = useUser();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("authToken");
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const fetchUserInfos = async () => {
      const fetchedUser = await getUserInfos();
      setUser(fetchedUser);
      console.log("🔍 User récupéré :", fetchedUser);
    };
    fetchUserInfos();
  }, []);

  const openMenu = () => {
    setMenuOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => setMenuOpen(false));
  };

  return (
    <View>
      <View
        className="absolute flex-row justify-between items-center px-4 z-10 w-full"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center gap-5">
          {user?.photo ? (
            <Image
              source={{ uri: user.photo }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <View
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: user?.color || "#ccc" }}
            >
              <Text className="text-white text-lg">{user?.avatar || "🙂"}</Text>
            </View>
          )}
          <Text className="text-white text-lg font-bold">
            Hello {user?.username}
          </Text>
        </View>

        <Pressable onPress={openMenu}>
          <Ionicons name="menu-sharp" size={24} color="white" />
        </Pressable>
      </View>

      {menuOpen && (
        <TouchableWithoutFeedback onPress={closeMenu}>
          <Animated.View
            style={{
              position: "absolute",
              width: screenWidth,
              height: screenHeight,
              zIndex: 10,
              opacity: opacityAnim,
            }}
          >
            <BlurView
              intensity={50}
              tint="dark"
              style={{
                flex: 1,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
              }}
            />
          </Animated.View>
        </TouchableWithoutFeedback>
      )}

      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          height: screenHeight,
          width: screenWidth / 2,
          backgroundColor: "#1E1E1E",
          paddingTop: insets.top + 20,
          paddingHorizontal: 20,
          transform: [{ translateX: slideAnim }],
          zIndex: 20,
        }}
      >
        <Text className="text-white text-xl font-bold mb-4">Menu</Text>

        <Pressable onPress={() => navigation.navigate("EditProfile")}>
          <Text className="text-white text-lg font-bold mb-3">
            Modifier mon profil
          </Text>
        </Pressable>

        <Pressable onPress={handleLogout}>
          <Text className="text-red-500 text-lg font-bold">Se déconnecter</Text>
        </Pressable>

        <Pressable onPress={closeMenu}>
          <Text className="text-gray-300 text-lg">Fermer</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

export default Header;
