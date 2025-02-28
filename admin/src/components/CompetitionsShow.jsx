import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCompetition, reorderCategories, addCategory } from "../api";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import "../styles/CompetitionsShow.css";
import CategoryRow from "./CategoryRow";
const CompetitionShow = () => {
  const { id } = useParams();
  const [competition, setCompetition] = useState(null);
  const [categories, setCategories] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [newCategory, setNewCategory] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("movie");

  useEffect(() => {
    fetchCompetition();
  }, []);

  const fetchCompetition = async () => {
    try {
      const response = await getCompetition(id);
      setCompetition(response.data);
      const sortedCategories = response.data.categories.sort(
        (a, b) => a.position - b.position
      );
      setCategories(sortedCategories);
    } catch (error) {
      console.error("Erreur lors du chargement de la compétition :", error);
    }
  };

  const handleAddCategory = async () => {
    console.log(id, {
      name: newCategory,
      type: newCategoryType,
    });
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

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.findIndex((c) => c.id === active.id);
    const newIndex = categories.findIndex((c) => c.id === over.id);
    const newCategories = [...categories];
    const [movedCategory] = newCategories.splice(oldIndex, 1);
    newCategories.splice(newIndex, 0, movedCategory);
    setCategories(newCategories);

    try {
      await reorderCategories(
        id,
        newCategories.map((cat, index) => ({
          categoryId: cat.id,
          position: index,
        }))
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour des positions", error);
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

      <div className="add-category">
        <input
          type="text"
          placeholder="Nouvelle catégorie"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />

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

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={() => setExpandedCategory(null)}
      >
        <SortableContext
          items={categories.map((cat) => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="categories-list">
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                category={category}
                fetchCompetition={fetchCompetition}
                setExpandedCategory={setExpandedCategory}
                isExpanded={expandedCategory === category.id}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default CompetitionShow;
