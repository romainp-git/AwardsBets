import React, { useState } from "react";
import "../styles/StyledModal.css"; // Assure-toi d'ajouter ce fichier CSS

const StyledModal = ({
  isOpen,
  movies,
  selectedMovie,
  setSelectedMovie,
  selectedPersons,
  setSelectedPersons,
  selectedSong,
  setSelectedSong,
  onClose,
  onValidate,
}) => {
  if (!isOpen) return null;

  // ✅ State pour la recherche des films
  const [searchMovie, setSearchMovie] = useState("");

  // ✅ State pour la recherche des personnes
  const [searchPerson, setSearchPerson] = useState("");

  // ✅ Trier les films par ordre alphabétique
  const sortedMovies = [...movies].sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  // ✅ Filtrer les films selon la recherche
  const filteredMovies = sortedMovies.filter((movie) =>
    movie.title.toLowerCase().includes(searchMovie.toLowerCase())
  );

  // ✅ Trier et organiser les personnes par rôle
  const sortedPersons = selectedMovie
    ? [...selectedMovie.team].sort((a, b) =>
        a.person.name.localeCompare(b.person.name)
      )
    : [];

  const actors = sortedPersons.filter((p) => p.roles.includes("actor"));
  const others = sortedPersons.filter((p) => !p.roles.includes("actor"));

  const filteredPersons = [...actors, ...others].filter((person) =>
    person.person.name.toLowerCase().includes(searchPerson.toLowerCase())
  );

  const handlePersonClick = (person) => {
    if (!selectedPersons.some((p) => p.id === person.id)) {
      setSelectedPersons([...selectedPersons, person]);
    }
  };

  const removePerson = (id) => {
    setSelectedPersons(selectedPersons.filter((p) => p.id !== id));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <h3>🎬 Ajouter un nommé</h3>

        {/* ✅ Barre de recherche des films */}
        <input
          type="text"
          placeholder="🔎 Rechercher un film..."
          value={searchMovie}
          onChange={(e) => setSearchMovie(e.target.value)}
        />

        {/* ✅ Liste des films affichée sous forme de tags */}
        <div className="movie-list">
          {filteredMovies.map((movie) => (
            <span
              key={movie.id}
              className={`movie-tag ${
                selectedMovie?.id === movie.id ? "selected" : ""
              }`}
              onClick={() => setSelectedMovie(movie)}
            >
              {movie.title}
            </span>
          ))}
        </div>

        {/* ✅ Affichage du film sélectionné en dessous */}
        {selectedMovie && (
          <div className="selected-movie">
            🎬 Film sélectionné : <strong>{selectedMovie.title}</strong>
          </div>
        )}

        {selectedMovie && (
          <div className="person-selection">
            <h4>👤 Choisir les personnes associées</h4>

            <input
              type="text"
              placeholder="🔎 Rechercher un acteur ou réalisateur..."
              value={searchPerson}
              onChange={(e) => setSearchPerson(e.target.value)}
            />

            <div className="person-list">
              {filteredPersons.length > 0 ? (
                <>
                  {filteredPersons.some((p) => p.roles.includes("actor")) && (
                    <h5>🎭 Acteurs</h5>
                  )}
                  {filteredPersons
                    .filter((p) => p.roles.includes("actor"))
                    .map((mp) => (
                      <span
                        key={mp.id}
                        className="person-tag"
                        onClick={() => handlePersonClick(mp)}
                      >
                        {mp.person.name} ({mp.roles.join(", ")})
                      </span>
                    ))}

                  {filteredPersons.some((p) => !p.roles.includes("actor")) && (
                    <h5>🎬 Équipe technique</h5>
                  )}
                  {filteredPersons
                    .filter((p) => !p.roles.includes("actor"))
                    .map((mp) => (
                      <span
                        key={mp.id}
                        className="person-tag"
                        onClick={() => handlePersonClick(mp)}
                      >
                        {mp.person.name} ({mp.roles.join(", ")})
                      </span>
                    ))}
                </>
              ) : (
                <p>Aucun résultat trouvé.</p>
              )}
            </div>

            <div className="selected-tags">
              {selectedPersons.map((p) => (
                <span key={p.id} className="selected-tag">
                  {p.person.name}
                  <button
                    className="remove-tag"
                    onClick={() => removePerson(p.id)}
                  >
                    ✖
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ajout d'une chanson */}
        <input
          type="text"
          placeholder="🎵 Ajouter une chanson (optionnel)"
          value={selectedSong}
          onChange={(e) => setSelectedSong(e.target.value)}
        />

        {/* Boutons d'action */}
        <div className="modal-actions">
          <button className="validate-btn" onClick={onValidate}>
            ✅ Valider
          </button>
          <button className="cancel-btn" onClick={onClose}>
            ❌ Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default StyledModal;
