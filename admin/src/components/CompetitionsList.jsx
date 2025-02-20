import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCompetitions, createCompetition, deleteCompetition } from "../api";
import "../styles/CompetitionsList.css";

const CompetitionsList = () => {
  const [competitions, setCompetitions] = useState([]);
  const [newCompetition, setNewCompetition] = useState({
    name: "",
    edition: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    city: "",
    country: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const response = await getCompetitions();
      setCompetitions(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des compétitions :", error);
    }
  };

  const handleChange = (e) => {
    setNewCompetition({ ...newCompetition, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    if (!newCompetition.name.trim()) {
      alert("Le champ Nom est obligatoire.");
      return;
    }

    const formattedDate = newCompetition.date
      ? new Date(newCompetition.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    try {
      await createCompetition({
        ...newCompetition,
        date: formattedDate,
        startTime: newCompetition.startTime || "00:00:00",
        endTime: newCompetition.endTime || "00:00:00",
        venue: newCompetition.venue || "Lieu inconnu",
        city: newCompetition.city || "Ville inconnue",
        country: newCompetition.country || "Pays inconnu"
      });

      setNewCompetition({
        name: "",
        edition: "",
        date: "",
        startTime: "",
        endTime: "",
        venue: "",
        city: "",
        country: ""
      });

      fetchCompetitions();
    } catch (error) {
      console.error("Erreur lors de la création de la compétition :", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette compétition ?")) {
      try {
        await deleteCompetition(id);
        fetchCompetitions();
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
      }
    }
  };

  return (
    <div className="competitions-container">
      <h2>🏆 Compétitions</h2>

      <div className="add-competition">
        <h3>➕ Ajouter une compétition</h3>
        <div className="form-group">
          <input type="text" name="name" placeholder="Nom" value={newCompetition.name} onChange={handleChange} />
          <input type="text" name="edition" placeholder="97e cérémonie" value={newCompetition.edition} onChange={handleChange} />
        </div>
        <div className="form-group">
          <input type="date" name="date" value={newCompetition.date} onChange={handleChange} />
          <input type="time" name="startTime" value={newCompetition.startTime} onChange={handleChange} />
          <input type="time" name="endTime" value={newCompetition.endTime} onChange={handleChange} />
        </div>
        <div className="form-group">
          <input type="text" name="venue" placeholder="Lieu" value={newCompetition.venue} onChange={handleChange} />
          <input type="text" name="city" placeholder="Ville" value={newCompetition.city} onChange={handleChange} />
          <input type="text" name="country" placeholder="Pays" value={newCompetition.country} onChange={handleChange} />
        </div>
        <button onClick={handleCreate} className="add-button">✅ Ajouter</button>
      </div>

      <h3>📋 Liste des compétitions</h3>
      <div className="competitions-list">
        {competitions.length === 0 ? (
          <p className="empty-list">🚫 Aucune compétition enregistrée.</p>
        ) : (
          competitions.map((competition) => (
            <div 
              key={competition.id} 
              className="competition-card"
            >
              {console.log(competition)}
              <div className="competition-info" onClick={() => navigate(`/competitions/${competition.id}`)}>
                <span className="competition-title">{competition.name} <span>({competition.edition})</span></span>
                <span className="competition-location">📍 {competition.venue}, {competition.city}, {competition.country}</span>
              </div>
              <div className="competition-date">
                <span>📅 {new Date(competition.date).toLocaleDateString("fr-FR")}</span>
                <span>⏰ {competition.startTime} - {competition.endTime}</span>
              </div>
              <button onClick={() => handleDelete(competition.id)} className="delete-button">🗑️</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CompetitionsList;