export interface Movie {
  imdbID: string;
  Title: string;
  Year: string;
  Type: string;
  Poster: string;
}

export interface MovieDetails extends Movie {
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  imdbRating?: string;
  imdbVotes?: string;
  totalSeasons?: string;
}

export interface OmdbSearchResponse {
  Search?: Movie[];
  totalResults?: string;
  Response: string;
  Error?: string;
}

const API_URL = 'https://www.omdbapi.com/';
const FALLBACK_KEY = 'trilogy';

function sanitizeMoviePosters(movies: Movie[]): Movie[] {
  return movies.map((movie) => ({
    ...movie,
    Poster: movie.Poster && movie.Poster.startsWith('http:')
      ? movie.Poster.replace('http:', 'https:')
      : movie.Poster,
  }));
}

function getRandomRoast(query: string): string {
  const roasts = [
    `Bro, what is "${query}"? 💀 Did your cat walk across your keyboard? Spell the movie title correctly man! (e.g., "Batman", "Dune", "Avengers")`,
    `Bro typed "${query}" and expected Hollywood to release a movie about it! 😭 Fix your spelling boy! (e.g., "Deadpool", "Joker", "Matrix")`,
    `Bro, "${query}" isn't even a real word, let alone a movie title! 💀 Spell it right man! (e.g., "Oppenheimer", "Spider-Man", "Iron Man")`,
    `Bro, my keyboard is crying reading "${query}" 😭 Spell the movie name correctly boy! (e.g., "Inception", "Interstellar", "Thor")`,
  ];
  return roasts[Math.floor(Math.random() * roasts.length)];
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const trimmed = query ? query.trim() : '';
  if (!trimmed) {
    return [];
  }

  if (trimmed.length < 2) {
    throw new Error(getRandomRoast(trimmed));
  }

  const apiKey = import.meta.env.OMDB_API || FALLBACK_KEY;
  const encodedQuery = encodeURIComponent(trimmed);
  const url = `${API_URL}?apikey=${apiKey}&s=${encodedQuery}`;

  try {
    const response = await fetch(url);
    const data: OmdbSearchResponse = await response.json();

    if (!response.ok || data.Response === 'False') {
      if (data.Error && data.Error.toLowerCase().includes('too many results')) {
        const refinedUrl = `${API_URL}?apikey=${apiKey}&s=${encodedQuery}&type=movie`;
        const refinedRes = await fetch(refinedUrl);
        const refinedData: OmdbSearchResponse = await refinedRes.json();

        if (refinedRes.ok && refinedData.Response === 'True' && refinedData.Search) {
          return sanitizeMoviePosters(refinedData.Search);
        }

        throw new Error(getRandomRoast(trimmed));
      }

      if (apiKey !== FALLBACK_KEY) {
        const fallbackUrl = `${API_URL}?apikey=${FALLBACK_KEY}&s=${encodedQuery}`;
        const fallbackRes = await fetch(fallbackUrl);
        const fallbackData: OmdbSearchResponse = await fallbackRes.json();
        if (fallbackRes.ok && fallbackData.Response === 'True' && fallbackData.Search) {
          return sanitizeMoviePosters(fallbackData.Search);
        }
      }

      throw new Error(getRandomRoast(trimmed));
    }

    return sanitizeMoviePosters(data.Search || []);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch movies from OMDb API.');
  }
}

export async function getMovieDetails(imdbID: string): Promise<MovieDetails> {
  if (!imdbID) {
    throw new Error('Invalid IMDb ID');
  }

  const apiKey = import.meta.env.OMDB_API || FALLBACK_KEY;
  const url = `${API_URL}?apikey=${apiKey}&i=${encodeURIComponent(imdbID)}&plot=full`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || data.Response === 'False') {
      if (apiKey !== FALLBACK_KEY) {
        const fallbackUrl = `${API_URL}?apikey=${FALLBACK_KEY}&i=${encodeURIComponent(imdbID)}&plot=full`;
        const fallbackRes = await fetch(fallbackUrl);
        const fallbackData = await fallbackRes.json();
        if (fallbackRes.ok && fallbackData.Response === 'True') {
          return {
            ...fallbackData,
            Poster: fallbackData.Poster && fallbackData.Poster.startsWith('http:')
              ? fallbackData.Poster.replace('http:', 'https:')
              : fallbackData.Poster,
          };
        }
      }
      throw new Error(data.Error || 'Failed to load movie details');
    }

    return {
      ...data,
      Poster: data.Poster && data.Poster.startsWith('http:')
        ? data.Poster.replace('http:', 'https:')
        : data.Poster,
    };
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Failed to fetch movie details from OMDb API.');
  }
}
