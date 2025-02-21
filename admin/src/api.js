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

    if (response.status === 201) {
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
  return await axios.get(`${API_URL}/movies/`);
};

export const searchMovies = async (query) => {
  return axios.get(`${API_URL}/movies/search/${query}`);
};

export const getMovieDetails = async (tmdbId) => {
  return axios.get(`${API_URL}/movies/tmdb/${tmdbId}`);
};

export const importMovie = async (movieData) => {
  return axios.post(`${API_URL}/movies/import`, movieData);
};

export const deleteMovie = async (id) => {
  return await axios.delete(`${API_URL}/movies/${id}`);
};

export const getCompetitions = async () => {
  return await axios.get(`${API_URL}/competitions`);
};

export const createCompetition = async (competition) => {
  return await axios.post(`${API_URL}/competitions`, competition);
};

export const deleteCompetition = async (id) => {
  return await axios.delete(`${API_URL}/competitions/${id}`);
};

export const getCompetition = async (id) => {
  return await axios.get(`${API_URL}/competitions/${id}`);
};

export const addCategory = async (competitionId, categoryData) => {
  return await axios.post(
    `${API_URL}/competitions/${competitionId}/categories`,
    categoryData
  );
};

export const deleteCategory = async (categoryId) => {
  return await axios.delete(`${API_URL}/categories/${categoryId}`);
};

export const addNominee = async (competitionId, categoryId, nomineeData) => {
  return await axios.post(
    `${API_URL}/competitions/${competitionId}/categories/${categoryId}/nominees`,
    nomineeData
  );
};

export const deleteNominee = async (nomineeId) => {
  return await axios.delete(`${API_URL}/nominees/${nomineeId}`);
};

export const setWinner = async (nomineeId) => {
  return await axios.patch(`${API_URL}/nominees/${nomineeId}/set-winner`);
};
