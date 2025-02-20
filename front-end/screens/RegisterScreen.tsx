import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { login, register } from "../api"; // Il faudra créer cette API
import { RootStackParamList } from "../types/types";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

type RegisterScreenProps = {
  setIsAuthenticated: (value: boolean) => void;
};

const RegisterScreen: React.FC<RegisterScreenProps> = ({ setIsAuthenticated }) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = async () => {
        if (!username || !email || !password) {
            Alert.alert("Erreur", "Tous les champs sont obligatoires !");
            return;
        }

        try {
            const response = await register({ username, email, password });

            if (response.success) {
                Alert.alert("Succès", response.message);

                // 🔥 Connexion automatique après l'inscription
                const loginResponse = await login(username, password);

                if (loginResponse) {
                    setIsAuthenticated(true); // ✅ Login gère déjà le stockage du token
                } else {
                    Alert.alert("Erreur", "La connexion automatique a échoué. Veuillez vous connecter manuellement.");
                }
            } else {
                // 🔴 Affichage de l'erreur spécifique retournée par l'API
                Alert.alert("Erreur", response.message);
            }
        } catch (error) {
            Alert.alert("Erreur", "Impossible de créer le compte. Veuillez réessayer.");
        }
    };

  return (
    <View className="flex-1 justify-center items-center bg-zinc-900 p-6">
      <Text className="text-white text-[30px] font-bold mb-6" style={{ fontFamily: "FuturaHeavy" }}>INSCRIPTION</Text>
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
          placeholder="Email"
          placeholderTextColor="white"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
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
      <TouchableOpacity className="flex justify-center bg-[#B3984C] py-3 mt-4 w-full" onPress={handleRegister}>
        <Text className="text-white text-lg font-bold text-center" style={{ fontFamily: "FuturaHeavy" }}>S'INSCRIRE</Text>
      </TouchableOpacity>

      <TouchableOpacity className="mt-4" onPress={() => navigation.goBack()}>
        <Text className="text-[#B3984C] text-lg">Retour à la connexion</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RegisterScreen;