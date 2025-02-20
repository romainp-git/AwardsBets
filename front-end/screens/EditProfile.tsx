import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { deleteUserPhoto, getUserInfos, updateUserProfile } from "../api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "../context/UserContext";

const avatars = ["🔥", "🎬", "🍿", "🏆", "🎥"];
const colors = ["#B3984C", "#FF5733", "#3498DB", "#2ECC71", "#9B59B6"];

const EditProfile: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { user, refreshUser, setUser } = useUser();

  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("🔥");
  const [color, setColor] = useState("#B3984C");

  useEffect(() => {
    let isMounted = true;
    const fetchUserInfos = async () => {
      const userData = await getUserInfos();
      if (isMounted) setUser(userData);
    };
    fetchUserInfos();
    return () => {
      isMounted = false;
    };
  }, [setUser]);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setDescription(user.description || "");
      setPhoto(user.photo || "");
      setSelectedAvatar(user.avatar || "🔥");
      setColor(user.color || "#B3984C");
    }
  }, [user]);

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      email,
      description,
      photo,
      avatar: selectedAvatar,
      color,
    };

    setUser(updatedUser);
    await updateUserProfile(updatedUser);
    refreshUser();
    navigation.goBack();
  }, [user, email, description, photo, selectedAvatar, color, setUser, refreshUser, navigation]);

  const handleDeletePhoto = useCallback(async () => {
    if (!photo) return;

    try {
      await deleteUserPhoto();
      setPhoto("");
      refreshUser();
      alert("Photo supprimée avec succès.");
    } catch (error) {
      console.error("Erreur lors de la suppression de la photo:", error);
      alert("Impossible de supprimer la photo.");
    }
  }, [photo, refreshUser]);

  return (
    <ScrollView className="flex-1 bg-gray-900 px-5 py-8" style={{ paddingTop: insets.top + 50 }}>
      <Text className="text-white text-2xl font-bold text-center mb-6">Modifier mon profil</Text>

      <View className="items-center mb-6">
        {photo ? (
          <Image source={{ uri: photo }} className="w-32 h-32 rounded-full" />
        ) : (
          <View className="w-32 h-32 rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
            <Text className="text-4xl">{selectedAvatar}</Text>
          </View>
        )}

        <View className="flex-row gap-4 mt-4">
          <TouchableOpacity onPress={pickImage} className="bg-[#B3984C] py-2 px-4 rounded">
            <Text className="text-white">Choisir une photo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeletePhoto}
            className={`py-2 px-4 rounded ${photo ? "bg-red-500" : "bg-gray-500 opacity-50"}`}
            disabled={!photo}
          >
            <Text className="text-white">Supprimer</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-gray-400 mb-2">Adresse e-mail</Text>
      <TextInput
        className="bg-gray-800 text-white py-3 px-4 rounded mb-4"
        value={email}
        textContentType="emailAddress"
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Text className="text-gray-400 mb-2">Citation</Text>
      <TextInput
        className="bg-gray-800 text-white py-3 px-4 rounded mb-4 h-24"
        multiline
        numberOfLines={3}
        placeholder='"A mon signal, déchaîne les enfers !" - Gladiator'
        value={description}
        onChangeText={setDescription}
      />

      <Text className="text-gray-400 mb-2">Choisir un avatar</Text>
      <View className="flex-row gap-4 mb-4">
        {avatars.map((emoji) => (
          <TouchableOpacity
            key={emoji}
            onPress={() => setSelectedAvatar(emoji)}
            className="p-3 rounded bg-gray-700"
          >
            <Text className="text-2xl">{emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-gray-400 mb-2">Choisir une couleur de fond</Text>
      <View className="flex-row gap-4 mb-6">
        {colors.map((colorOption) => (
          <TouchableOpacity
            key={colorOption}
            onPress={() => setColor(colorOption)}
            className="w-10 h-10 rounded-full"
            style={{ backgroundColor: colorOption }}
          />
        ))}
      </View>

      <TouchableOpacity onPress={handleSave} className="bg-[#B3984C] py-3 items-center">
        <Text className="text-white font-bold text-lg">Sauvegarder</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} className="py-3 items-center">
        <Text className="text-white text-md underline">Annuler</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default EditProfile;
