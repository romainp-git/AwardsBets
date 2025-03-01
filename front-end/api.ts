import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { ListType, User, Vote } from "./types/types";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";
import { globalLogout } from "./context/AuthContext";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const token = await getToken();

      if (token) {
        console.warn("❌ Token expiré ou invalide, déconnexion...");
        await removeToken();

        Alert.alert(
          "Session expirée",
          "Votre session a expiré, veuillez vous reconnecter.",
          [{ text: "OK" }]
        );
      }

      globalLogout?.();
    }

    return Promise.reject(error);
  }
);

// 📌 Stocker le token de manière sécurisée
export const storeToken = async (token: string) => {
  await SecureStore.setItemAsync("authToken", token);
};

// 📌 Récupérer le token
export const getToken = async () => {
  return await SecureStore.getItemAsync("authToken");
};

// 📌 Supprimer le token
export const removeToken = async () => {
  await SecureStore.deleteItemAsync("authToken");
};

// 📌 Générer les headers d'authentification
export const getAuthHeaders = async () => {
  const token = await getToken();
  if (!token) throw new Error("Aucun token JWT trouvé");

  return {
    headers: { Authorization: `Bearer ${token}` },
  };
};

// 📌 Vérifier l'authentification de l'utilisateur
export const checkUserAuth = async () => {
  try {
    const token = await getToken();
    if (!token) return null;

    const response = await api.get(`/auth/me`, await getAuthHeaders());

    return response.data; // Retourne les infos du user si valide
  } catch (error) {
    console.log("❌ Erreur lors de la vérification du token :", error);
    return null;
  }
};

// 📌 Inscription
export const register = async (userData: {
  username: string;
  email: string;
  password: string;
}) => {
  try {
    const response = await api.post(`/users/register`, userData);

    if (response.data?.success) {
      const token = await loginUser(userData.username, userData.password);
      return { success: true, token };
    }

    return response.data;
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de l'inscription. Veuillez réessayer.",
    };
  }
};

// 📌 Connexion
export const loginUser = async (username: string, password: string) => {
  try {
    const response = await api.post(`/auth/login`, {
      username,
      password,
    });
    const token = response.data.access_token;
    console.log("🔍 Token :", token);
    await storeToken(token);

    return token;
  } catch (error) {
    console.log("🔍 Erreur lors de la connexion :", error);
    throw error;
  }
};

// 📌 Déconnexion
export const logoutUser = async () => {
  await removeToken();
};

// 📌 Soumettre des votes
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

    await api.post(
      `/votes/batch`,
      { votes: formattedVotes },
      await getAuthHeaders()
    );

    return { success: true };
  } catch (error) {
    console.log("Erreur lors de l'envoi des votes :", error);
    throw error;
  }
};

// 📌 Récupérer tous les votes
export const getAllVotes = async () => {
  try {
    const response = await api.get(`/votes`, await getAuthHeaders());
    return response.data;
  } catch (error) {
    console.log("❌ Erreur lors de la récupération des votes :", error);
    throw error;
  }
};

// 📌 Récupérer tous les utilisateurs
export const getAllUsers = async () => {
  try {
    const response = await api.get(`/users`);
    return response.data;
  } catch (error) {
    console.log("❌ Erreur lors de la récupération des utilisateurs :", error);
    throw error;
  }
};

// 📌 Récupérer les infos du user
export const getUserInfos = async () => {
  try {
    const response = await api.get(`/users/infos`, await getAuthHeaders());
    return response.data;
  } catch (error) {
    console.log("Erreur lors de la récupération des infos du user :", error);
    throw error;
  }
};

// 📌 Récupérer tous les votes de l'utilisateur
export const getUserVotes = async () => {
  try {
    const response = await api.get(`/votes/user/`, await getAuthHeaders());

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

// 📌 Supprimer un vote
export const deleteVote = async (voteId: number | string) => {
  try {
    await api.delete(`/votes/${voteId}`, await getAuthHeaders());
    console.log(`✅ Vote ${voteId} supprimé`);
  } catch (error) {
    console.log(`❌ Erreur lors de la suppression du vote ${voteId} :`, error);
    throw error;
  }
};

// 📌 Récupérer les nommés
export const getNominees = async () => {
  try {
    const response = await api.get(`/nominees`, await getAuthHeaders());
    return response.data;
  } catch (error) {
    console.log("❌ Erreur lors de la récupération des nommés :", error);
    throw error;
  }
};

// 📌 Mettre à jour les cotes d’un nominé
export const updateNomineeOdds = async (
  nomineeId: number | string,
  odds: Record<string, number>
) => {
  try {
    await api.patch(
      `/nominees/${nomineeId}/odds`,
      odds,
      await getAuthHeaders()
    );
    console.log(`✅ Cotes mises à jour pour le nominé ${nomineeId}`);
  } catch (error) {
    console.log(`❌ Erreur lors de la mise à jour des cotes :`, error);
  }
};

// 📌 Mettre à jour le profil utilisateur
export const updateUserProfile = async (user: User) => {
  try {
    const token = await getToken();
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

    await api.patch(`/users/update-profile`, formData, {
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

// 📌 Supprimer la photo de l’utilisateur
export const deleteUserPhoto = async () => {
  await api.delete(`/users/delete-photo`, await getAuthHeaders());
};

// 📌 Récupérer une liste spécifique d’un utilisateur
export const getUserList = async (type: ListType) => {
  try {
    const response = await api.get(`/lists/${type}`, await getAuthHeaders());
    return response.data;
  } catch (error) {
    console.log("❌ Erreur lors de la récupération de la liste :", error);
    return [];
  }
};

// 📌 Créer une ligue
export const CreateLeague = async (leagueData: any) => {
  try {
    const token = await getToken();
    if (!token) throw new Error("Aucun token JWT trouvé");

    const formData = new FormData();
    formData.append("name", leagueData.name);
    formData.append("status", leagueData.visibility);
    formData.append("citation", leagueData.citation || "");
    formData.append("competitionId", leagueData.competitionId.toString());

    leagueData.members.forEach((id: number) => {
      formData.append("membersId", id.toString());
    });

    if (leagueData.logo && leagueData.logo.startsWith("file://")) {
      const fileUri = leagueData.logo;
      const fileName = fileUri.split("/").pop();

      formData.append("photo", {
        uri: fileUri,
        name: fileName,
        type: "image/jpeg",
      } as any);
    } else {
      formData.append("logo", leagueData.logo);
    }

    console.log("🔍 FormData final :", formData);

    const response = await api.post(`${API_BASE_URL}/leagues`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
      },
    });

    console.log("✅ Ligue créée avec succès :", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erreur lors de la création de la ligue :", error);
    throw error;
  }
};

// 📌 Récupérer les ligues d’un utilisateur
export const getUserLeagues = async (userId: number | string) => {
  console.log("🔍 Récupération des ligues de l'utilisateur :", userId);
  try {
    const response = await api.get(
      `/leagues/users/${userId}`,
      await getAuthHeaders()
    );
    console.log("🔍 Réponse des ligues de l'utilisateur :", response.data);
    return response.data;
  } catch (error) {
    console.log("❌ Erreur lors de la récupération de vos ligues :", error);
    return [];
  }
};

// 📌 Ajouter un film à une liste
export const addToList = async (movieId: number, type: ListType) => {
  try {
    const response = await api.post(
      `/lists`,
      { movieId, type },
      await getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.log("❌ Erreur lors de l'ajout à la liste :", error);
    return null;
  }
};

// 📌 Supprimer un film d'une liste
export const removeFromList = async (movieId: number, type: ListType) => {
  try {
    const response = await api.delete(`/lists`, {
      data: { movieId, type },
      ...(await getAuthHeaders()),
    });
    return response.data;
  } catch (error) {
    console.log("❌ Erreur lors de la suppression de la liste :", error);
    return null;
  }
};

// 📌 Vérifier si un film est déjà dans une liste
export const isMovieInList = async (movieId: number, type: ListType) => {
  try {
    const list = await getUserList(type);
    return list.some((item: any) => item.movie.id === movieId);
  } catch (error) {
    console.log("❌ Erreur lors de la vérification de la liste :", error);
    return false;
  }
};
