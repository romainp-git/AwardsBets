import React, { useState } from "react";
import "../styles/StyledModal.css"; // Assure-toi d'ajouter ce fichier CSS

const StyledModal = ({ 
  isOpen, // Ajout de la prop pour contrôler l'affichage 
  movies, 
  selectedMovie, 
  setSelectedMovie, 
  selectedPersons, 
  setSelectedPersons, 
  selectedSong, 
  setSelectedSong, 
  onClose, 
  onValidate 
}) => {

  if (!isOpen) return null; // Si la modale n'est pas ouverte, on ne l'affiche pas

  const handlePersonClick = (person) => {
    if (!selectedPersons.some(p => p.id === person.id)) {
      setSelectedPersons([...selectedPersons, person]);
    }
  };

  const removePerson = (id) => {
    setSelectedPersons(selectedPersons.filter(p => p.id !== id));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <h3>🎬 Ajouter un nommé</h3>

        {/* Sélection du film */}
        <select onChange={(e) => setSelectedMovie(movies.find(m => m.id === parseInt(e.target.value)))}>
          <option value="">Sélectionner un film</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>{movie.title}</option>
          ))}
        </select>

        {/* Sélection des personnes associées avec tags */}
        {selectedMovie && (
          <div className="person-selection">
            <h4>👤 Choisir les personnes associées</h4>
            <div className="person-list">
              {selectedMovie.team
                .sort((a, b) => a.person.name.localeCompare(b.person.name))
                .map((mp) => (
                  <span key={mp.id} className="person-tag" onClick={() => handlePersonClick(mp)}>
                    {mp.person.name} ({mp.roles.join(", ")})
                  </span>
              ))}
            </div>

            {/* Affichage des personnes sélectionnées en mode "tag" */}
            <div className="selected-tags">
              {selectedPersons.map((p) => (
                <span key={p.id} className="selected-tag">
                  {p.person.name}
                  <button className="remove-tag" onClick={() => removePerson(p.id)}>✖</button>
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
          <button className="validate-btn" onClick={onValidate}>✅ Valider</button>
          <button className="cancel-btn" onClick={onClose}>❌ Annuler</button>
        </div>
      </div>
    </div>
  );
};

export default StyledModal;