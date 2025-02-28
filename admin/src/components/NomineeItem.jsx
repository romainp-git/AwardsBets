import { deleteNominee, setWinner } from "../api";

const NomineeItem = ({ category, nominee, fetchCompetition }) => {
  const handleDeleteNominee = async (nomineeId) => {
    try {
      await deleteNominee(nomineeId);
      fetchCompetition();
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

  return (
    <div className="nominee-item">
      {category.type === "movie" && (
        <div className="nominee-header">
          {nominee.winner ? "🏆" : "🎬"} <strong>{nominee.movie.title}</strong>
        </div>
      )}

      {category.type === "actor" && nominee.team.length > 0 && (
        <div className="nominee-header">
          {nominee.winner ? "🏆" : "👤"}{" "}
          <strong>{nominee.team.map((mp) => mp.person.name).join(", ")}</strong>
        </div>
      )}

      {category.type === "song" && nominee.song && (
        <div className="nominee-header">
          {nominee.winner ? "🏆" : "🎵"} <strong>{nominee.song}</strong>
        </div>
      )}

      {category.type === "other" && (
        <div className="nominee-header">
          {nominee.winner ? "🏆" : "🎬"} <strong>{nominee.movie.title}</strong>
        </div>
      )}

      <div className="nominee-team">
        {category.type === "movie" || category.type === "other" ? (
          nominee.team.map((mp) => (
            <span key={mp.id} className="nominee-person">
              {mp.person.name} ({mp.roles.join(", ")})
            </span>
          ))
        ) : (
          <span className="nominee-movie"> 🎬 {nominee.movie.title}</span>
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
          onClick={() => handleDeleteNominee(nominee.id)}
        >
          ❌
        </button>
      </div>
    </div>
  );
};

export default NomineeItem;
