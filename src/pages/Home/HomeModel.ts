import { searchMovies, type Movie } from '../../services/omdbMovieService';

export async function getMovies(query: string): Promise<Movie[]> {
  const cleanedQuery = query ? query.trim() : '';

  if (cleanedQuery.length < 2) {
    return [];
  }

  return searchMovies(cleanedQuery);
}

export type { Movie };
