import React, { useEffect, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import StyledModal from "./StyledModal";
import { deleteCategory, addNominee, getMovies } from "../api";
import "../styles/CompetitionsShow.css";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import NomineeItem from "./NomineeItem";
dayjs.locale("fr");

const CategoryRow = ({
  category,
  fetchCompetition,
  isExpanded,
  setExpandedCategory,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: category.id,
      disabled: false,
    });
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedPersons, setSelectedPersons] = useState([]);
  const [selectedSong, setSelectedSong] = useState("");
  const [showModal, setShowModal] = useState(false);
  const winner = category.nominees.find((nominee) => nominee.winner);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await getMovies();
      setMovies(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des films :", error);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategory(categoryId);
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      fetchCompetition();
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie :", error);
    }
  };

  const openNomineeModal = () => {
    setShowModal(true);
  };

  const handleAddNominee = async () => {
    if (!selectedMovie || !category.id) return;
    try {
      const nomineeData = {
        movie: selectedMovie.id,
        team: selectedPersons.map((p) => p.id),
        song: selectedSong || null,
      };
      await addNominee(category.competitionId, category.id, nomineeData);
      setShowModal(false);
      setSelectedMovie(null);
      setSelectedPersons([]);
      setSelectedSong("");
      fetchCompetition();
    } catch (error) {
      console.error("Erreur lors de l'ajout du nommé :", error);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div>
      <div
        ref={setNodeRef}
        style={style}
        className="category-row"
        onClick={() => toggleCategory(category.id)}
      >
        <div className="drag-handle" {...listeners} {...attributes}>
          ☰
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.1rem",
            width: "200px",
          }}
        >
          <span className="category-name">{category.name}</span>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "0.2rem",
              alignItems: "center",
              fontSize: "0.8rem",
            }}
          >
            <span>
              {category.type === "movie"
                ? "🎬 Film"
                : category.type === "actor"
                ? "👤 Acteur/Actrice"
                : category.type === "song"
                ? "🎵 Musique"
                : "🍿 Autre"}
            </span>
            -<span>{category.nominees.length} nommé(s)</span>
          </div>
        </div>

        <div>
          <span
            className={`status-badge ${
              winner ? "status-closed" : "status-pending"
            }`}
          >
            {winner ? "Résultat publié" : "En attente"}
          </span>
        </div>
        <div style={{ fontSize: "0.8rem", flex: 1 }}>
          {winner
            ? `🏆 ${
                winner.movie?.title ||
                winner.song ||
                winner.team?.map((p) => p.person.name).join(", ")
              }`
            : "Aucun lauréat pour le moment"}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.1rem",
            fontSize: "0.8rem",
            alignItems: "center",
          }}
        >
          <span>{dayjs(category.updatedAt).format("DD/MM/YY")}</span>
          <span>{dayjs(category.updatedAt).format("HH:mm")}</span>
        </div>
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}
        >
          <button
            className="add-btn"
            onClick={(e) => {
              e.stopPropagation();
              openNomineeModal(category.id);
            }}
            data-dndkit-disabled="true"
          >
            Ajouter un nommé
          </button>

          <button
            className="delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCategory(category.id);
            }}
            data-dndkit-disabled="true"
          >
            ❌
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="nominee-list">
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
                    b.movie?.title || b.song || b.team?.[0]?.person.name || ""
                  ); // ✅ Tri alphabétique
                })
                .map((nominee) => (
                  <NomineeItem
                    key={nominee.id}
                    category={category}
                    nominee={nominee}
                    fetchCompetition={fetchCompetition}
                  />
                ))
            ) : (
              <p className="no-nominees">Aucun nommé pour cette catégorie.</p>
            )}
          </div>
        </div>
      )}

      <StyledModal
        isOpen={showModal}
        movies={movies}
        selectedMovie={selectedMovie}
        setSelectedMovie={setSelectedMovie}
        selectedPersons={selectedPersons}
        setSelectedPersons={setSelectedPersons}
        selectedSong={selectedSong}
        setSelectedSong={setSelectedSong}
        onClose={() => setShowModal(false)}
        onValidate={handleAddNominee}
      />
    </div>
  );
};

export default CategoryRow;
