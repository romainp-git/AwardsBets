import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getCompetition,
  addCategory,
  deleteCategory,
  addNominee,
  getMovies,
  deleteNominee,
  setWinner,
} from "../api";
import dayjs from "dayjs";
import "dayjs/locale/fr";

import StyledModal from "./StyledModal";
import "../styles/CompetitionsShow.css";

const CompetitionShow = () => {
  const { id } = useParams();
  const [competition, setCompetition] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("movie");
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedPersons, setSelectedPersons] = useState([]);
  const [selectedSong, setSelectedSong] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [categoryIdForNominee, setCategoryIdForNominee] = useState(null);

  useEffect(() => {
    fetchCompetition();
    fetchMovies();
  }, []);

  const fetchCompetition = async () => {
    try {
      const response = await getCompetition(id);
      setCompetition(response.data);
      setCategories(response.data.categories);
    } catch (error) {
      console.error("Erreur lors du chargement de la compétition :", error);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await getMovies();
      setMovies(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des films :", error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      const response = await addCategory(id, {
        name: newCategory,
        type: newCategoryType,
      });
      setCategories([...categories, response.data]);
      setNewCategory("");
      setNewCategoryType("movie");
    } catch (error) {
      console.error("Erreur lors de l'ajout de la catégorie :", error);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      setCategories(
        categories.filter((category) => category.id !== categoryId)
      );
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie :", error);
    }
  };

  const handleAddNominee = async () => {
    if (!selectedMovie || !categoryIdForNominee) return;
    console.log(
      "Ajout du nommé :",
      selectedMovie,
      selectedPersons,
      selectedSong
    );
    try {
      const nomineeData = {
        movie: selectedMovie.id,
        team: selectedPersons.map((p) => p.id),
        song: selectedSong || null,
      };
      await addNominee(id, categoryIdForNominee, nomineeData);
      fetchCompetition(); // Mettre à jour l'affichage
      setShowModal(false);
      setSelectedMovie(null);
      setSelectedPersons([]);
      setSelectedSong("");
    } catch (error) {
      console.error("Erreur lors de l'ajout du nommé :", error);
    }
  };

  const openNomineeModal = (categoryId) => {
    setCategoryIdForNominee(categoryId);
    setShowModal(true);
  };

  const handleDeleteNominee = async (nomineeId) => {
    try {
      await deleteNominee(nomineeId);
      setCategories(
        categories.map((category) => ({
          ...category,
          nominees: category.nominees.filter(
            (nominee) => nominee.id !== nomineeId
          ),
        }))
      );
    } catch (error) {
      console.error("Erreur lors de la suppression du nommé :", error);
    }
  };

  const handleSetWinner = async (nomineeId) => {
    try {
      await setWinner(nomineeId);
      fetchCompetition();
    } catch (error) {
      console.error("❌ Erreur lors de la désignation du vainqueur :", error);
    }
  };

  if (!competition) return <p className="loading">Chargement...</p>;

  return (
    <div className="competition-container">
      <div className="competition-header">
        <div className="competition-title">
          <span className="competition-name">{competition.name}</span>
          <span className="competition-edition">{competition.edition}</span>
        </div>
        <span className="competition-info">
          📅 {competition.date} | ⏰ {competition.startTime} -{" "}
          {competition.endTime}
        </span>
        <span className="competition-info">
          📍 {competition.venue}, {competition.city}, {competition.country}
        </span>
      </div>

      {/* Formulaire d'ajout de catégorie */}
      <div className="add-category">
        <input
          type="text"
          placeholder="Nouvelle catégorie"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />

        {/* ✅ Sélection du type de catégorie */}
        <select
          value={newCategoryType}
          onChange={(e) => setNewCategoryType(e.target.value)}
        >
          <option value="movie">🎬 Film</option>
          <option value="actor">👤 Personne</option>
          <option value="song">🎵 Chanson</option>
          <option value="other">🍿 Autre</option>
        </select>

        <button onClick={handleAddCategory}>➕ Ajouter</button>
      </div>

      {/* Liste des catégories */}
      <table className="categories-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th className="ten-percent">Type de catégorie</th>
            <th className="ten-percent">NB nommés</th>
            <th>Statut</th>
            <th>Vainqueur</th>
            <th>Dernière modification</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const winner = category.nominees.find((nominee) => nominee.winner);

            return (
              <React.Fragment key={category.id}>
                <tr
                  className="category-row"
                  onClick={() => toggleCategory(category.id)}
                >
                  <td>{category.name}</td>
                  <td>
                    {category.type === "movie"
                      ? "🎬 Film"
                      : category.type === "actor"
                      ? "👤 Acteur/Actrice"
                      : category.type === "song"
                      ? "🎵 Musique"
                      : "🍿 Autre"}
                  </td>
                  <td>{category.nominees.length}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        winner ? "status-closed" : "status-pending"
                      }`}
                    >
                      {winner ? "Résultat publié" : "En attente"}
                    </span>
                  </td>
                  <td>
                    {winner
                      ? `🏆 ${
                          winner.movie?.title ||
                          winner.team?.map((p) => p.person.name).join(", ") ||
                          winner.song
                        }`
                      : "—"}
                  </td>
                  <td>
                    {dayjs(category.updatedAt)
                      .locale("fr")
                      .format("DD/MM/YYYY hh:mm:ss") || "Non disponible"}
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                    >
                      ❌
                    </button>
                    <button
                      className="add-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openNomineeModal(category.id);
                      }}
                    >
                      ➕ Ajouter un nommé
                    </button>
                  </td>
                </tr>

                {/* Accordéon des nommés */}
                {expandedCategory === category.id && (
                  <tr className="nominee-list">
                    <td colSpan="7">
                      <div className="nominees-container">
                        {category.nominees.length > 0 ? (
                          category.nominees
                            .sort((a, b) => {
                              if (a.winner) return -1; // ✅ Le gagnant en premier
                              if (b.winner) return 1;
                              return (
                                a.movie?.title ||
                                a.song ||
                                a.team?.[0]?.person.name ||
                                ""
                              ).localeCompare(
                                b.movie?.title ||
                                  b.song ||
                                  b.team?.[0]?.person.name ||
                                  ""
                              ); // ✅ Tri alphabétique
                            })
                            .map((nominee) => (
                              <div key={nominee.id} className="nominee-item">
                                {/* ✅ Affichage dynamique en fonction du type de catégorie */}
                                {category.type === "movie" && (
                                  <div className="nominee-header">
                                    {nominee.winner ? "🏆" : "🎬"}{" "}
                                    <strong>{nominee.movie.title}</strong>
                                  </div>
                                )}

                                {category.type === "actor" &&
                                  nominee.team.length > 0 && (
                                    <div className="nominee-header">
                                      {nominee.winner ? "🏆" : "👤"}{" "}
                                      <strong>
                                        {nominee.team
                                          .map((mp) => mp.person.name)
                                          .join(", ")}
                                      </strong>
                                    </div>
                                  )}

                                {category.type === "song" && nominee.song && (
                                  <div className="nominee-header">
                                    {nominee.winner ? "🏆" : "🎵"}{" "}
                                    <strong>{nominee.song}</strong>
                                  </div>
                                )}

                                {category.type === "other" && (
                                  <div className="nominee-header">
                                    {nominee.winner ? "🏆" : "🎬"}{" "}
                                    <strong>{nominee.movie.title}</strong>
                                  </div>
                                )}

                                <div className="nominee-team">
                                  {category.type === "movie" ||
                                  category.type === "other" ? (
                                    nominee.team.map((mp) => (
                                      <span
                                        key={mp.id}
                                        className="nominee-person"
                                      >
                                        {mp.person.name} ({mp.roles.join(", ")})
                                      </span>
                                    ))
                                  ) : (
                                    <span className="nominee-movie">
                                      {" "}
                                      🎬 {nominee.movie.title}
                                    </span>
                                  )}
                                </div>

                                <div className="nominee-controls">
                                  <button
                                    className="winner-btn"
                                    onClick={() => handleSetWinner(nominee.id)}
                                  >
                                    🏆 Désigner vainqueur
                                  </button>
                                  <button
                                    className="delete-btn"
                                    onClick={() =>
                                      handleDeleteNominee(nominee.id)
                                    }
                                  >
                                    ❌
                                  </button>
                                </div>
                              </div>
                            ))
                        ) : (
                          <p className="no-nominees">
                            Aucun nommé pour cette catégorie.
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      <StyledModal
        isOpen={showModal} // ✅ On passe l'état de la modale
        movies={movies}
        selectedMovie={selectedMovie}
        setSelectedMovie={setSelectedMovie}
        selectedPersons={selectedPersons}
        setSelectedPersons={setSelectedPersons}
        selectedSong={selectedSong}
        setSelectedSong={setSelectedSong}
        onClose={() => setShowModal(false)} // ✅ Permet de fermer la modale
        onValidate={handleAddNominee}
      />
    </div>
  );
};

export default CompetitionShow;
