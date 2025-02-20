import { useState } from 'react';
import { searchMovies, getMovieDetails } from '../api';
import '../styles/TmdbSearch.css'; // ✅ Import du CSS

const TmdbSearch = ({ onSelectMovie }) => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);

  const handleSearch = async () => {
    if (!query.trim()) return; 
    const response = await searchMovies(query);
    setMovies(response.data);
  };

  const handleSelectMovie = async (tmdbId) => {
    const response = await getMovieDetails(tmdbId);
    onSelectMovie(response.data);
  };

  return (
    <div className="search-container">
      <h2>Rechercher un film</h2>
      <div className="search-bar">
        <input 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Rechercher un film..."
        />
        <button onClick={handleSearch}>🔍</button>
      </div>

      <div className="movie-grid">
        {movies.slice(0, 10).map(movie => (
          <div key={movie.id} className="movie-card" onClick={() => handleSelectMovie(movie.id)}>
            <img 
              src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
              alt={movie.title} 
              className="movie-poster"
            />
            <div className="movie-title">{movie.title} ({movie.release_date?.split('-')[0]})</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TmdbSearch;