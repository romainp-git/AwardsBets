import { useEffect, useState } from "react";
import { getMovies, deleteMovie } from "../api";
import "../styles/MoviesList.css";

const MoviesList = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await getMovies();
      setMovies(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des films :", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce film ?")) return;

    try {
      await deleteMovie(id);
      setMovies(movies.filter((movie) => movie.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression du film :", error);
    }
  };

  return (
    <div className="movies-container">
      <h2>Films enregistrés</h2>
      <div className="movies-grid">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card">
            <img
              src={movie.poster}
              alt={movie.title}
              className="movie-poster"
            />
            <div className="movie-info">
              <h3>{movie.title}</h3>
              <p>Sortie : {movie.releaseDate}</p>
              <button
                className="delete-btn"
                onClick={() => handleDelete(movie.id)}
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoviesList;
