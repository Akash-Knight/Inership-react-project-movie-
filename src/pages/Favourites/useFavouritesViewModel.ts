import { useState, useEffect } from 'react';
import type { Movie } from '../../services/omdbMovieService';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  clearFavorites,
  isFavorite as checkIsFavorite,
} from './FavouritesModel';

export const useFavouritesViewModel = () => {
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'year' | 'title'>('latest');
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'series'>('all');

  const loadFavorites = () => {
    setFavorites(getFavorites());
  };

  useEffect(() => {
    loadFavorites();

    const handleSync = () => {
      loadFavorites();
    };

    window.addEventListener('favorites_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('favorites_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleRemoveFavorite = (imdbID: string) => {
    const updated = removeFavorite(imdbID);
    setFavorites(updated);
  };

  const handleClearAll = () => {
    clearFavorites();
    setFavorites([]);
  };

  const handleToggleFavorite = (movie: Movie) => {
    if (checkIsFavorite(movie.imdbID)) {
      handleRemoveFavorite(movie.imdbID);
    } else {
      const updated = addFavorite(movie);
      setFavorites(updated);
    }
  };

  const filteredFavorites = favorites
    .filter((movie) => {
      if (typeFilter !== 'all') {
        const mType = (movie.Type || 'movie').toLowerCase();
        if (typeFilter === 'series' && !mType.includes('series')) return false;
        if (typeFilter === 'movie' && mType.includes('series')) return false;
      }
      if (!searchFilter.trim()) return true;
      return movie.Title.toLowerCase().includes(searchFilter.toLowerCase().trim());
    })
    .sort((a, b) => {
      if (sortBy === 'year') {
        return (parseInt(b.Year, 10) || 0) - (parseInt(a.Year, 10) || 0);
      }
      if (sortBy === 'title') {
        return a.Title.localeCompare(b.Title);
      }
      return 0;
    });

  return {
    favorites,
    filteredFavorites,
    searchFilter,
    setSearchFilter,
    sortBy,
    setSortBy,
    typeFilter,
    setTypeFilter,
    removeFavorite: handleRemoveFavorite,
    clearAllFavorites: handleClearAll,
    toggleFavorite: handleToggleFavorite,
    isFavorite: checkIsFavorite,
    refreshFavorites: loadFavorites,
  };
};

export default useFavouritesViewModel;
