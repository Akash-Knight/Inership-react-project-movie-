import React, { useState, useEffect } from 'react';
import type { Movie } from '../services/omdbMovieService';
import { isFavorite as checkIsFavorite, addFavorite, removeFavorite } from '../pages/Favourites/FavouritesModel';
import './MovieCard.css';

interface MovieCardProps {
  movie: Movie;
  onFavoriteToggle?: (movie: Movie, isFav: boolean) => void;
  onClick?: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onFavoriteToggle,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const [isFav, setIsFav] = useState<boolean>(() => checkIsFavorite(movie.imdbID));

  useEffect(() => {
    const syncFav = () => {
      setIsFav(checkIsFavorite(movie.imdbID));
    };

    window.addEventListener('favorites_updated', syncFav);
    return () => {
      window.removeEventListener('favorites_updated', syncFav);
    };
  }, [movie.imdbID]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFav) {
      removeFavorite(movie.imdbID);
      setIsFav(false);
      if (onFavoriteToggle) onFavoriteToggle(movie, false);
    } else {
      addFavorite(movie);
      setIsFav(true);
      if (onFavoriteToggle) onFavoriteToggle(movie, true);
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(movie);
    }
  };

  const hasPoster = movie.Poster && movie.Poster !== 'N/A' && !imageError;

  return (
    <article
      className="movie-card"
      data-testid="movie-card"
      onClick={handleCardClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="movie-poster-wrapper">
        {/* Favorite Heart Button on the left side */}
        <div className="favorite-button-container">
          <button
            type="button"
            id={`fav-btn-${movie.imdbID}`}
            name="favoriteToggle"
            className={`favorite-button ${isFav ? 'active' : ''}`}
            onClick={handleFavoriteClick}
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            title={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <svg
              className="heart-icon"
              viewBox="0 0 24 24"
              fill={isFav ? "#ef4444" : "none"}
              stroke={isFav ? "#ef4444" : "#ffffff"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>

        {/* Media type badge on the right side */}
        <div className="movie-badge-container">
          <span className="movie-badge">{movie.Type || 'Movie'}</span>
        </div>

        {hasPoster ? (
          <img
            src={movie.Poster}
            alt={`${movie.Title} poster`}
            className="movie-poster"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="movie-poster-placeholder">
            <span className="placeholder-icon" aria-hidden="true">🎬</span>
            <span>{movie.Title}</span>
          </div>
        )}
      </div>

      <div className="movie-info">
        <h3 className="movie-title" title={movie.Title}>
          {movie.Title}
        </h3>
        <div className="movie-meta">
          <span className="movie-year">{movie.Year}</span>
        </div>
      </div>
    </article>
  );
};

export default MovieCard;
