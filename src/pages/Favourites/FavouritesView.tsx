import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useFavouritesViewModel from './useFavouritesViewModel';
import MovieCard from '../../components/MovieCard';
import MovieDetailModal from '../../components/MovieDetailModal';
import './FavouritesView.css';

export const FavouritesView: React.FC = () => {
  const {
    favorites,
    filteredFavorites,
    searchFilter,
    setSearchFilter,
    sortBy,
    setSortBy,
    typeFilter,
    setTypeFilter,
    clearAllFavorites,
  } = useFavouritesViewModel();

  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  return (
    <div className="favourites-container">
      {/* Netflix-Style Movie Detail Modal Overlay */}
      <MovieDetailModal
        imdbID={selectedMovieId}
        onClose={() => setSelectedMovieId(null)}
      />

      <header className="favourites-header-card">
        <div className="favourites-top-row">
          <div className="favourites-title-group">
            <h1 className="favourites-title">
              <span>❤️</span> My Favourites
            </h1>
            <span className="favourites-badge">
              {favorites.length} {favorites.length === 1 ? 'Movie' : 'Movies'}
            </span>
          </div>

          {favorites.length > 0 && (
            <button
              type="button"
              id="clear-all-favorites-btn"
              name="clearAllFavorites"
              className="clear-all-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all favorite movies?')) {
                  clearAllFavorites();
                }
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {favorites.length > 0 && (
          <div className="favourites-controls-bar">
            <div className="filter-search-box">
              <span style={{ color: '#34d399' }} aria-hidden="true">🔍</span>
              <input
                type="text"
                id="filter-favorites-input"
                name="filterFavoritesQuery"
                className="filter-input"
                placeholder="Search saved movies..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                aria-label="Search saved movies"
              />
            </div>

            <div className="filter-options-group">
              <select
                id="type-filter-select"
                className="select-dropdown"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'movie' | 'series')}
                aria-label="Filter media type"
              >
                <option value="all">All Types</option>
                <option value="movie">Movies Only</option>
                <option value="series">Series Only</option>
              </select>

              <select
                id="sort-by-select"
                className="select-dropdown"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'latest' | 'year' | 'title')}
                aria-label="Sort favorites"
              >
                <option value="latest">Sort: Recently Added</option>
                <option value="year">Sort: Release Year (Newest)</option>
                <option value="title">Sort: Title (A - Z)</option>
              </select>
            </div>
          </div>
        )}
      </header>

      {filteredFavorites.length > 0 ? (
        <div className="favourites-grid">
          {filteredFavorites.map((movie) => (
            <MovieCard
              key={movie.imdbID}
              movie={movie}
              onClick={(m) => setSelectedMovieId(m.imdbID)}
            />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="empty-favourites">
          <span className="empty-icon" aria-hidden="true">🔍</span>
          <h2 className="empty-heading">No Matches Found</h2>
          <p className="empty-subtext">
            No saved movies match "{searchFilter}". Try clearing your filter or changing your sort criteria.
          </p>
          <button
            type="button"
            className="explore-link"
            onClick={() => {
              setSearchFilter('');
              setTypeFilter('all');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="empty-favourites">
          <span className="empty-icon" aria-hidden="true">🤍</span>
          <h2 className="empty-heading">Your Favourites List is Empty</h2>
          <p className="empty-subtext">
            You haven't saved any movies yet. Explore trending movies on the Home page and click the heart icon on any poster to save them to your list!
          </p>
          <Link to="/" className="explore-link">
            <span>🎬</span> Explore Movies
          </Link>
        </div>
      )}
    </div>
  );
};

export default FavouritesView;
