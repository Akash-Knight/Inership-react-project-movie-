import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, EffectFade } from 'swiper/modules';

import useHomeViewModel from './useHomeViewModel';
import MovieCard from '../../components/MovieCard';
import MovieDetailModal from '../../components/MovieDetailModal';
import './HomeView.css';

interface HomeViewProps {
  externalQuery?: string;
}

export interface MovieCategory {
  id: string;
  name: string;
  icon: string;
  searchQuery: string;
  description: string;
}

export const MOVIE_CATEGORIES: MovieCategory[] = [
  {
    id: 'all',
    name: 'All',
    icon: '🌟',
    searchQuery: 'Deadpool',
    description: 'Explore top trending movies and series across all popular genres.',
  },
  {
    id: 'action',
    name: 'Action',
    icon: '💥',
    searchQuery: 'Dune',
    description: 'Fast-paced movies with high energy, physical fights, stunts, and dangerous chases.',
  },
  {
    id: 'comedy',
    name: 'Comedy',
    icon: '😂',
    searchQuery: 'Inside Out',
    description: 'Light and funny films meant to make people laugh and feel happy.',
  },
  {
    id: 'drama',
    name: 'Drama',
    icon: '🎭',
    searchQuery: 'Oppenheimer',
    description: 'Serious stories about realistic characters facing deep emotional struggles or life conflicts.',
  },
  {
    id: 'horror',
    name: 'Horror',
    icon: '👻',
    searchQuery: 'Alien',
    description: 'Scary films designed to frighten, shock, and cause dread with monsters or ghosts.',
  },
  {
    id: 'romance',
    name: 'Romance',
    icon: '❤️',
    searchQuery: 'Romance',
    description: 'Stories focused on love, dating, and the emotional connection between characters.',
  },
  {
    id: 'sci-fi',
    name: 'Science Fiction',
    icon: '🚀',
    searchQuery: 'Dune',
    description: 'Imaginative tales involving futuristic technology, space, or scientific changes.',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    icon: '🧙‍♂️',
    searchQuery: 'Wicked',
    description: 'Magical stories set in make-believe worlds far away from normal reality.',
  },
  {
    id: 'thriller',
    name: 'Thriller',
    icon: '⚡',
    searchQuery: 'Joker',
    description: 'Suspenseful films that build high tension and worry about what will happen next.',
  },
  {
    id: 'western',
    name: 'Western',
    icon: '🤠',
    searchQuery: 'Horizon',
    description: 'Stories set in the old American frontier featuring cowboys and outlaws.',
  },
  {
    id: 'documentary',
    name: 'Documentary',
    icon: '📹',
    searchQuery: 'Documentary',
    description: 'Non-fiction films that show real facts, events, and real people.',
  },
];

export const HomeView: React.FC<HomeViewProps> = ({ externalQuery }) => {
  const { setQuery, movies, loading, error, handleSearch } = useHomeViewModel();
  const [activeCategory, setActiveCategory] = useState('all');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  const currentCategory = MOVIE_CATEGORIES.find((c) => c.id === activeCategory) || MOVIE_CATEGORIES[0];

  useEffect(() => {
    if (externalQuery && externalQuery.trim()) {
      setQuery(externalQuery);
      handleSearch(externalQuery);
    } else if (movies.length === 0 && !loading && !error) {
      handleSearch(currentCategory.searchQuery);
    }
  }, [externalQuery]);

  const sortedMovies = [...movies].sort((a, b) => {
    const yearA = parseInt(a.Year, 10) || 0;
    const yearB = parseInt(b.Year, 10) || 0;
    return yearB - yearA;
  });

  const isSearchActive = Boolean(externalQuery && externalQuery.trim());
  const searchNormalized = (externalQuery || '').toLowerCase().trim();

  const exactMatchMovie = movies.find(
    (m) => m.Title.toLowerCase().trim() === searchNormalized
  ) || movies[0];

  const validHeroMovies = sortedMovies.filter(
    (movie) => movie.Poster && movie.Poster !== 'N/A' && !failedImages[movie.imdbID]
  );

  const heroSlidesToRender = isSearchActive && exactMatchMovie
    ? [exactMatchMovie]
    : (validHeroMovies.length > 0 ? validHeroMovies : sortedMovies);

  const handleSelectCategory = (category: MovieCategory) => {
    setActiveCategory(category.id);
    setQuery(category.searchQuery);
    handleSearch(category.searchQuery);
  };

  return (
    <div className="home-container">
      {/* Netflix-Style Movie Detail Modal Overlay */}
      <MovieDetailModal
        imdbID={selectedMovieId}
        onClose={() => setSelectedMovieId(null)}
      />

      {/* Hero Section */}
      <section className="hero-swiper-wrapper">
        {heroSlidesToRender.length > 0 ? (
          <Swiper
            key={isSearchActive ? `search-${externalQuery}` : `category-${activeCategory}`}
            modules={[Pagination, Autoplay, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            speed={600}
            autoplay={heroSlidesToRender.length > 1 ? { delay: 5000, disableOnInteraction: false } : false}
            pagination={heroSlidesToRender.length > 1 ? { clickable: true } : false}
            loop={heroSlidesToRender.length > 1}
            className="hero-swiper"
          >
            {heroSlidesToRender.map((movie) => {
              const hasPoster = movie.Poster && movie.Poster !== 'N/A' && !failedImages[movie.imdbID];

              return (
                <SwiperSlide key={movie.imdbID}>
                  <div className="hero-slide-inner">
                    <div className="hero-banner-left">
                      {isSearchActive && (
                        <span className="hero-badge highlight" style={{ marginBottom: '0.2rem' }}>
                          🎯 EXACT SEARCH MATCH
                        </span>
                      )}

                      <h1 className="hero-title">{movie.Title}</h1>

                      <div className="hero-badges">
                        <span className="hero-badge highlight">{movie.Type || 'Movie'}</span>
                        <span className="hero-badge">{movie.Year}</span>
                        <span className="hero-badge">HD</span>
                        <span className="hero-badge">CC</span>
                      </div>

                      <p className="hero-description">
                        Experience {movie.Title} ({movie.Year}), an exciting {movie.Type || 'movie'} release fetched directly from OMDb database.
                      </p>

                      <div className="hero-action-row">
                        <button
                          type="button"
                          id={`hero-details-btn-${movie.imdbID}`}
                          name="viewDetails"
                          className="hero-play-button"
                          onClick={() => setSelectedMovieId(movie.imdbID)}
                        >
                          <span className="play-icon" aria-hidden="true">ℹ️</span> VIEW DETAILS
                        </button>
                      </div>
                    </div>

                    <div className="hero-banner-right" onClick={() => setSelectedMovieId(movie.imdbID)} style={{ cursor: 'pointer' }}>
                      {hasPoster ? (
                        <img
                          src={movie.Poster}
                          alt={`${movie.Title} poster`}
                          className="hero-banner-image"
                          onError={() => setFailedImages((prev) => ({ ...prev, [movie.imdbID]: true }))}
                        />
                      ) : (
                        <div className="hero-poster-placeholder">
                          <span className="hero-placeholder-icon" aria-hidden="true">🎬</span>
                          <div className="hero-placeholder-title">{movie.Title}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
          <div className="hero-slide-inner">
            <div className="hero-banner-left">
              <h1 className="hero-title">Discover Movies</h1>
              <p className="hero-description">Loading featured latest movies from OMDb API...</p>
            </div>
          </div>
        )}
      </section>

      {/* Category Filter Pills Section */}
      <section className="categories-section">
        <h2 className="categories-header">Browse By Genre</h2>

        <div className="categories-scroll-container">
          {MOVIE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              id={`category-btn-${category.id}`}
              name={`categorySelect-${category.id}`}
              className={`category-chip ${activeCategory === category.id && !isSearchActive ? 'active' : ''}`}
              onClick={() => handleSelectCategory(category)}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        <div className="category-description-banner">
          <strong>{currentCategory.icon} {currentCategory.name}:</strong> {currentCategory.description}
        </div>
      </section>

      {/* Movie Results Grid Section */}
      <section className="results-section">
        {loading && (
          <div className="loading-state">
            <div className="spinner" aria-hidden="true"></div>
            <p>Searching OMDb database for {isSearchActive ? `"${externalQuery}"` : currentCategory.name}...</p>
          </div>
        )}

        {error && !loading && (
          <div className="error-state">
            <p className="error-message">⚠️ {error}</p>
          </div>
        )}

        {!loading && !error && movies.length > 0 && (
          <>
            <div className="results-header">
              <h2 className="results-count">
                {isSearchActive
                  ? `Related Movies for "${externalQuery}" (${movies.length})`
                  : `${currentCategory.name} Movies (${movies.length})`}
              </h2>
            </div>
            <div className="movies-grid">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.imdbID}
                  movie={movie}
                  onClick={(m) => setSelectedMovieId(m.imdbID)}
                />
              ))}
            </div>
          </>
        )}

        {!loading && !error && movies.length === 0 && (
          <div className="empty-state">
            <p>No movies found for {isSearchActive ? `"${externalQuery}"` : currentCategory.name}. Try another search term!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomeView;
