import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ListType, User, Vote } from "./types/types";
import * as FileSystem from "expo-file-system";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Stocker un token
export const storeToken = async (token: string) => {
  await SecureStore.setItemAsync("authToken", token);
};

// Récupérer le token
export const getToken = async () => {
  return await SecureStore.getItemAsync("authToken");
};

// Supprimer le token
export const removeToken = async () => {
  await SecureStore.deleteItemAsync("authToken");
};

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("authToken");
  if (!token) throw new Error("Aucun token JWT trouvé");

  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

export const register = async (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  console.log("Données envoyées :", userData);
  try {
    const response = await axios.post(
      `${API_BASE_URL}/users/register`,
      userData
    );
    console.log("Inscription réussie :", response.data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return {
        success: false,
        message: error.response.data.message || "Erreur lors de l'inscription",
      };
    }
    return {
      success: false,
      message: "Erreur inattendue. Veuillez réessayer.",
    };
  }
};

export const login = async (username: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username,
      password,
    });
    const token = response.data.access_token;
    await AsyncStorage.setItem("authToken", token);

    return token;
  } catch (error) {
    throw error;
  }
};

export const submitVotes = async (votes: Vote[]) => {
  try {
    const formattedVotes = Object.values(votes)
      .flat()
      .map((vote) => ({
        nomineeId: vote.nominee.id,
        categoryId: vote.category.id,
        type: vote.type,
      }));

    console.log("Données envoyées :", formattedVotes);

    await axios.post(
      `${API_BASE_URL}/votes/batch`,
      { votes: formattedVotes },
      await getAuthHeaders()
    );

    return { success: true };
  } catch (error) {
    console.log("Erreur lors de l'envoi des votes :", error);
    throw error;
  }
};

export const getAllVotes = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/votes`,
      await getAuthHeaders()
    );

    return response.data;
  } catch (error) {
    console.log("Erreur lors de la récupération des votes :", error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  } catch (error) {
    console.log("Erreur lors de la récupération des users :", error);
    throw error;
  }
};

export const getUserInfos = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/users/infos`,
      await getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.log("Erreur lors de la récupération des infos du user :", error);
    throw error;
  }
};

export const getUserVotes = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/votes/user/`,
      await getAuthHeaders()
    );

    if (!response.data || response.data.length === 0) {
      console.log("ℹ Aucun vote trouvé pour cet utilisateur.");
      return [];
    }

    return response.data;
  } catch (error) {
    console.log("Erreur lors de la récupération des votes du user :", error);

    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return [];
    }

    throw error;
  }
};

export const getNominees = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/nominees`,
      await getAuthHeaders()
    );

    return response.data;
  } catch (error) {
    console.log("Erreur lors de la récupération des nommés :", error);
    throw error;
  }
};

export const deleteVote = async (voteId: number | string) => {
  try {
    await axios.delete(
      `${API_BASE_URL}/votes/${voteId}`,
      await getAuthHeaders()
    );
    console.log(`Vote ${voteId} supprimé avec succès`);
  } catch (error) {
    console.log(`Erreur lors de la suppression du vote ${voteId} :`, error);
    throw error;
  }
};

export const updateNomineeOdds = async (
  nomineeId: number | string,
  odds: Record<string, number>
) => {
  try {
    await axios.patch(
      `${API_BASE_URL}/nominees/${nomineeId}/odds`,
      odds,
      await getAuthHeaders()
    );
    console.log(`✅ Odds mises à jour pour le nominé ${nomineeId}`);
  } catch (error) {
    console.log(
      `❌ Erreur lors de la mise à jour des odds pour ${nomineeId} :`,
      error
    );
  }
};

export const updateUserProfile = async (user: User) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) throw new Error("Aucun token JWT trouvé");

    console.log("🔍 User envoyé :", user);
    console.log("🔍 Photo URI :", user.photo);

    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("description", user.description || "");
    formData.append("avatar", user.avatar || "");
    formData.append("color", user.color || "");

    if (user.photo && user.photo.startsWith("file://")) {
      const fileInfo = await FileSystem.getInfoAsync(user.photo);
      if (
        fileInfo.exists &&
        fileInfo.size &&
        fileInfo.size > 10 * 1024 * 1024
      ) {
        // 10 Mo
        alert(
          "La taille de l'image dépasse 10 Mo. Veuillez choisir une image plus petite."
        );
        return;
      }
      const fileName = user.photo.split("/").pop();
      const photo = {
        uri: user.photo,
        name: fileName,
        type: "image/jpeg",
      } as any;

      formData.append("photo", photo);
    }

    console.log("📤 FormData final :", formData);

    await axios.patch(`${API_BASE_URL}/users/update-profile`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 413) {
        alert(
          "La taille du fichier est trop grande. Merci de choisir une image de moins de 10 Mo."
        );
      } else {
        alert(
          "❌ Erreur lors de la mise à jour du profil. Veuillez réessayer."
        );
      }
    }
    throw error;
  }
};

export const deleteUserPhoto = async () => {
  await axios.delete(
    `${API_BASE_URL}/users/delete-photo`,
    await getAuthHeaders()
  );
};

// 🔵 Ajouter un film à une liste
export const addToList = async (movieId: number, type: ListType) => {
  try {
    console.log("🔍 Ajout du film", movieId, "à la liste", type);
    const response = await axios.post(
      `${API_BASE_URL}/lists`,
      { movieId, type },
      await getAuthHeaders()
    );

    return response.data;
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout à la liste :", error);
    return null;
  }
};

// 🔴 Supprimer un film d'une liste
export const removeFromList = async (movieId: number, type: ListType) => {
  try {
    console.log("🔍 Retrait du film", movieId, "à la liste", type);
    const response = await axios.delete(`${API_BASE_URL}/lists`, {
      data: { movieId, type },
      ...(await getAuthHeaders()),
    });
    return response.data;
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de la liste :", error);
    return null;
  }
};

// 🟢 Récupérer une liste d'un type spécifique
export const getUserList = async (type: ListType) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/lists/${type}`,
      await getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de la liste :", error);
    return [];
  }
};

// 🟠 Vérifier si un film est déjà dans une liste
export const isMovieInList = async (movieId: number, type: ListType) => {
  try {
    const list = await getUserList(type);
    return list.some((item: any) => item.movie.id === movieId);
  } catch (error) {
    console.error("❌ Erreur lors de la vérification de la liste :", error);
    return false;
  }
};
