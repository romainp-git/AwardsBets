import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import TmdbSearch from './components/TmdbSearch';
import MoviesList from './components/MoviesList';
import MovieDetails from './components/MovieDetails';
import CompetitionsList from './components/CompetitionsList';
import CompetitionShow from './components/CompetitionsShow';
import UserForm from './components/UserForm';

import './styles/styles.css';

const App = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);

  return (
    <Router>
      <div className="admin-container">
        <nav className="admin-nav">
          <ul>
            <li><Link to="/">Recherche TMDB</Link></li>
            <li><Link to="/movies">Films en base</Link></li>
            <li><Link to="/competitions">Compétitions</Link></li> {/* ✅ Ajout du lien vers la page des compétitions */}
          </ul>
        </nav>

        <div className="app-container">
          <Routes>
            <Route path="/" element={
              <div className="search-section-container">
                <div className={`search-section ${selectedMovie ? 'shrunk' : ''}`}>
                  <TmdbSearch onSelectMovie={setSelectedMovie} />
                </div>

                <div className={`details-section ${selectedMovie ? 'show' : ''}`}>
                  {selectedMovie && <MovieDetails movie={selectedMovie} onCancel={() => setSelectedMovie(null)} />}
                </div>
              </div>
            } />
            
            <Route path="/movies" element={<MoviesList />} />
            <Route path="/competitions" element={<CompetitionsList />} />
            <Route path="/competitions/:id" element={<CompetitionShow />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;