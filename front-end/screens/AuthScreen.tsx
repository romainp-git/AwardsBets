import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/types";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";

const AuthScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login(username, password);
    } catch (error) {
      console.log(error);
      Alert.alert("Erreur", "Email ou mot de passe incorrect.");
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-zinc-900 p-6">
      <Text
        className="text-white text-[30px] font-bold mb-6"
        style={{ fontFamily: "FuturaHeavy" }}
      >
        CONNEXION
      </Text>
      <View className="flex flex-col items-start mb-6 w-full">
        <Text
          className="text-white text-[20px] text-bold"
          style={{ fontFamily: "FuturaHeavy" }}
        >
          Enfin de retour !
        </Text>
        <Text
          className="text-white text-lg"
          style={{ fontFamily: "FuturaBook" }}
        >
          Connecte-toi pour faire tes pronostics
        </Text>
      </View>
      <View className="w-full flex flex-col gap-2">
        <TextInput
          className="w-full text-white p-3 border border-[#B3984C] bg-zinc-800"
          placeholder="Username"
          placeholderTextColor="white"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          className="w-full border border-[#B3984C] bg-zinc-800 text-white p-3"
          placeholder="Mot de passe"
          placeholderTextColor="white"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>
      <TouchableOpacity
        className="flex justify-center bg-[#B3984C] py-3 mt-4 w-full"
        onPress={handleLogin}
      >
        <Text
          className="text-white text-lg font-bold text-center"
          style={{ fontFamily: "FuturaHeavy" }}
        >
          SE CONNECTER
        </Text>
      </TouchableOpacity>

      {/* 🚀 Nouveau bouton "Créer un compte" */}
      <TouchableOpacity
        className="mt-4"
        onPress={() => navigation.navigate("RegisterScreen")}
      >
        <Text className="text-[#B3984C] text-lg">Créer un compte</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AuthScreen;
