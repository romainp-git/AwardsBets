import { useState } from 'react';
import { importMovie } from '../api';
import { IonIcon } from '@ionic/react';
import { closeCircleOutline } from 'ionicons/icons';

import '../styles/MovieDetails.css';

const VALID_DEPARTMENTS = {
  "Directing": "Réalisation",
  "Writing": "Scénario",
  "Production": "Production",
  "Editing": "Montage",
  "Sound": "Son",
  "Visual Effects": "Effets Visuels",
  "Costume & Make-Up": "Costumes & Maquillage",
  "Camera": "Image",
};

const MovieDetails = ({ movie, onCancel }) => {
  const [selectedImages, setSelectedImages] = useState({
    backdrop: movie.images.backdrops[0] || '',
    poster: movie.images.posters[0] || '',
    logo: movie.images.logos[0] || '',
  });

  const handleImageSelection = (type, imageUrl) => {
    setSelectedImages((prev) => ({ ...prev, [type]: imageUrl }));
  };

  const handleImport = async () => {
    await importMovie({
      title: movie.title,
      releaseDate: movie.release_date,
      backdrop: selectedImages.backdrop,
      poster: selectedImages.poster,
      logo: selectedImages.logo,
      rating: movie.vote_average,
      genres: movie.genres.map((genre) => genre.name).join(", "),
      duration: movie.runtime,
      synopsis: movie.overview,
      credits: movie.credits,
      tmdbId: movie.id,
    });

    alert('Film importé avec succès !');
    onCancel();
  };

  return (
    <div className="movie-details">
      <button className="close-btn" onClick={onCancel}>
        <IonIcon icon={closeCircleOutline} />
      </button>

      <h2>{movie.title} ({movie.release_date?.split('-')[0]})</h2>
      <p>Genres</p>
      <div className="movie-genres">
        {movie.genres.map((genre) => genre.name).join(", ")}
      </div>
      <p className="movie-overview">{movie.overview}</p>

      <h3>Choisir une image</h3>
      <div className="image-selection">
        <div>
          <h4>Backdrop</h4>
          <div className="image-grid">
            {movie.images.backdrops.map((img, index) => (
              <img 
                key={index} 
                src={img} 
                alt="Backdrop" 
                onClick={() => handleImageSelection('backdrop', img)}
                className={selectedImages.backdrop === img ? "selected" : ""}
              />
            ))}
          </div>
        </div>

        <div>
          <h4>Poster</h4>
          <div className="image-grid">
            {movie.images.posters.map((img, index) => (
              <img 
                key={index} 
                src={img} 
                alt="Poster" 
                onClick={() => handleImageSelection('poster', img)}
                className={selectedImages.poster === img ? "selected" : ""}
              />
            ))}
          </div>
        </div>

        <div>
          <h4>Logo</h4>
          <div className="image-grid">
            {movie.images.logos.map((img, index) => (
              <img 
                key={index} 
                src={img} 
                alt="Logo" 
                onClick={() => handleImageSelection('logo', img)}
                className={selectedImages.logo === img ? "selected" : ""}
              />
            ))}
          </div>
        </div>
      </div>

      <h3>Distribution</h3>
      <div className="cast-grid">
        {movie.credits.cast.slice(0, 10).map((actor, index) => (
          <div key={index} className="cast-card">
            <img src={`https://image.tmdb.org/t/p/h632${actor.profile_path}`} alt={actor.name} />
            <p>{actor.name}</p>
          </div>
        ))}
      </div>

      <h3>Équipe technique</h3>
      <div className="crew-list">
        {movie.credits.crew
          .filter(person => Object.keys(VALID_DEPARTMENTS).includes(person.department))
          .map((person, index) => (
            <p key={index}>
              <strong>{VALID_DEPARTMENTS[person.department]} :</strong> {person.name} ({person.job})
            </p>
        ))}
      </div>

      <button className="import-btn" onClick={handleImport}>Importer le film</button>
      <button className="cancel-btn" onClick={onCancel}>Annuler</button>
    </div>
  );
};

export default MovieDetails;