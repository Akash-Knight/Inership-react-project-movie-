import React, { useEffect, useState } from 'react';
import { getMovieDetails, type MovieDetails } from '../services/omdbMovieService';
import { isFavorite as checkIsFavorite, addFavorite, removeFavorite } from '../pages/Favourites/FavouritesModel';
import './MovieDetailModal.css';

interface MovieDetailModalProps {
  imdbID: string | null;
  onClose: () => void;
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({ imdbID, onClose }) => {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFav, setIsFav] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  useEffect(() => {
    if (!imdbID) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    setIsFav(checkIsFavorite(imdbID));

    getMovieDetails(imdbID)
      .then((data) => {
        if (isMounted) {
          setDetails(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load movie details');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [imdbID]);

  if (!imdbID) return null;

  const handleToggleFavorite = () => {
    if (!details) return;
    if (isFav) {
      removeFavorite(details.imdbID);
      setIsFav(false);
    } else {
      addFavorite({
        imdbID: details.imdbID,
        Title: details.Title,
        Year: details.Year,
        Type: details.Type,
        Poster: details.Poster,
      });
      setIsFav(true);
    }
  };

  const hasPoster = details?.Poster && details.Poster !== 'N/A';

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-movie-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          id="modal-close-button"
          name="closeModal"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
          title="Close"
        >
          ✕
        </button>

        {loading && (
          <div className="modal-loading-state">
            <div className="spinner" aria-hidden="true"></div>
            <p>Loading movie details...</p>
          </div>
        )}

        {error && !loading && (
          <div className="modal-error-state">
            <p>⚠️ {error}</p>
          </div>
        )}

        {!loading && !error && details && (
          <>
            {/* Hero Backdrop Banner */}
            <div className="modal-hero-banner">
              {hasPoster ? (
                <img
                  src={details.Poster}
                  alt={details.Title}
                  className="modal-banner-image"
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
                  }}
                />
              )}

              <div className="modal-banner-fade"></div>

              <div className="modal-banner-content">
                <h1 id="modal-movie-title" className="modal-movie-title">
                  {details.Title}
                </h1>

                <div className="modal-action-bar">
                  <button
                    type="button"
                    id="modal-fav-btn"
                    name="modalFav"
                    className={`modal-circle-btn ${isFav ? 'active' : ''}`}
                    onClick={handleToggleFavorite}
                    title={isFav ? 'Remove from My List' : 'Add to My List'}
                  >
                    {isFav ? '✓' : '+'}
                  </button>

                  <button
                    type="button"
                    id="modal-like-btn"
                    name="modalLike"
                    className={`modal-circle-btn ${isLiked ? 'active' : ''}`}
                    onClick={() => setIsLiked(!isLiked)}
                    title={isLiked ? 'Liked' : 'Like'}
                  >
                    👍
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Body & Info */}
            <div className="modal-body">
              <div className="modal-meta-row">
                <span className="match-score">
                  {details.imdbRating && details.imdbRating !== 'N/A'
                    ? `${Math.round(parseFloat(details.imdbRating) * 10)}% match`
                    : '95% match'}
                </span>
                <span className="meta-item">{details.Year}</span>
                <span className="meta-item">
                  {details.totalSeasons ? `${details.totalSeasons} Seasons` : details.Runtime || 'HD'}
                </span>
                <span className="badge-outline">HD</span>
                {details.Rated && details.Rated !== 'N/A' && (
                  <span className="badge-age">{details.Rated}</span>
                )}
              </div>

              <div className="modal-info-grid">
                <div className="modal-left-column">
                  <p className="modal-overview">
                    {details.Plot && details.Plot !== 'N/A'
                      ? details.Plot
                      : `A gripping ${details.Type || 'movie'} release featuring ${details.Actors || 'an incredible cast'}.`}
                  </p>
                </div>

                <div className="modal-details-side">
                  {details.Actors && details.Actors !== 'N/A' && (
                    <div className="detail-line">
                      <span className="detail-label">Cast: </span>
                      <span className="detail-value">{details.Actors}</span>
                    </div>
                  )}

                  {details.Genre && details.Genre !== 'N/A' && (
                    <div className="detail-line">
                      <span className="detail-label">Genres: </span>
                      <span className="detail-value">{details.Genre}</span>
                    </div>
                  )}

                  {details.Director && details.Director !== 'N/A' && (
                    <div className="detail-line">
                      <span className="detail-label">Director: </span>
                      <span className="detail-value">{details.Director}</span>
                    </div>
                  )}

                  {details.imdbRating && details.imdbRating !== 'N/A' && (
                    <div className="detail-line">
                      <span className="detail-label">Rating: </span>
                      <span className="detail-value">⭐ {details.imdbRating} / 10</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MovieDetailModal;
