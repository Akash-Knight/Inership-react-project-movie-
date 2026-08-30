import type { Movie } from '../../services/omdbMovieService';

const FAVORITES_STORAGE_KEY = 'omdb_favorite_movies';

export function getFavorites(): Movie[] {
  try {
    const rawData = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!rawData) return [];
    return JSON.parse(rawData) as Movie[];
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
    return [];
  }
}

export function saveFavorites(favorites: Movie[]): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    // Dispatch custom storage event for sync across components
    window.dispatchEvent(new Event('favorites_updated'));
  } catch (error) {
    console.error('Error saving favorites to localStorage:', error);
  }
}

export function addFavorite(movie: Movie): Movie[] {
  const current = getFavorites();
  if (current.some((m) => m.imdbID === movie.imdbID)) {
    return current;
  }
  const updated = [movie, ...current];
  saveFavorites(updated);
  return updated;
}

export function removeFavorite(imdbID: string): Movie[] {
  const current = getFavorites();
  const updated = current.filter((m) => m.imdbID !== imdbID);
  saveFavorites(updated);
  return updated;
}

export function isFavorite(imdbID: string): boolean {
  const current = getFavorites();
  return current.some((m) => m.imdbID === imdbID);
}

export function clearFavorites(): void {
  try {
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    window.dispatchEvent(new Event('favorites_updated'));
  } catch (error) {
    console.error('Error clearing favorites:', error);
  }
}

export interface FavouritesModel {
  getFavorites: typeof getFavorites;
  addFavorite: typeof addFavorite;
  removeFavorite: typeof removeFavorite;
  isFavorite: typeof isFavorite;
  clearFavorites: typeof clearFavorites;
}
