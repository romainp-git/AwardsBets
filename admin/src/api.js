import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username, password) => {
  try {
    const response = await api.post("/auth/login", { username, password });

    console.log(response);

    if (response.status === 200) {
      localStorage.setItem("authToken", response.data.token);
      return {
        success: true,
        message: "Connexion réussie",
        token: response.data.token,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Erreur de connexion",
    };
  }

  return { success: false, message: "Erreur inconnue" };
};

export const register = async (userData) => {
  return await api.post("/users/register", userData);
};

export const getMovies = async () => {
  return await api.get(`/movies/`);
};

export const searchMovies = async (query) => {
  return api.get(`/movies/search/${query}`);
};

export const getMovieDetails = async (tmdbId) => {
  return api.get(`/movies/tmdb/${tmdbId}`);
};

export const importMovie = async (movieData) => {
  return api.post(`/movies/import`, movieData);
};

export const deleteMovie = async (id) => {
  return await api.delete(`/movies/${id}`);
};

export const getCompetitions = async () => {
  return await api.get(`/competitions`);
};

export const createCompetition = async (competition) => {
  return await api.post(`/competitions`, competition);
};

export const deleteCompetition = async (id) => {
  return await api.delete(`/competitions/${id}`);
};

export const getCompetition = async (id) => {
  return await api.get(`/competitions/${id}`);
};

export const addCategory = async (competitionId, categoryData) => {
  return await api.post(
    `/competitions/${competitionId}/categories`,
    categoryData
  );
};

export const reorderCategories = async (competitionId, categoriesOrder) => {
  try {
    console.log(competitionId, categoriesOrder);
    return await api.patch(`/competitions/${competitionId}/categories/order`, {
      categoriesOrder,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de l'ordre des catégories :",
      error
    );
    throw error;
  }
};

export const deleteCategory = async (categoryId) => {
  return await api.delete(`/categories/${categoryId}`);
};

export const addNominee = async (competitionId, categoryId, nomineeData) => {
  return await api.post(
    `/competitions/${competitionId}/categories/${categoryId}/nominees`,
    nomineeData
  );
};

export const deleteNominee = async (nomineeId) => {
  return await api.delete(`/nominees/${nomineeId}`);
};

export const setWinner = async (nomineeId) => {
  return await api.patch(`/nominees/${nomineeId}/set-winner`);
};
