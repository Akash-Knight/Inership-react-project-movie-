import { useState } from 'react';
import { getMovies, type Movie } from './HomeModel';

export const useHomeViewModel = () => {
  const [query, setQuery] = useState<string>('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (searchQuery?: string) => {
    const targetQuery = searchQuery !== undefined ? searchQuery : query;
    setLoading(true);
    setError(null);
    try {
      const resultList = await getMovies(targetQuery);
      setMovies(resultList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load movies.');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    query,
    setQuery,
    movies,
    loading,
    error,
    handleSearch,
  };
};

export default useHomeViewModel;
