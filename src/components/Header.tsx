import React, { useState, useEffect, type FormEvent } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Debounced live search as user types
  useEffect(() => {
    if (!onSearch || !searchQuery.trim()) return;

    const timer = setTimeout(() => {
      onSearch(searchQuery.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      }
      navigate('/');
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  const getUserInitial = () => {
    if (!currentUser) return 'U';
    if ('displayName' in currentUser && currentUser.displayName) {
      return currentUser.displayName.charAt(0).toUpperCase();
    }
    if (currentUser.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getUserEmailDisplay = () => {
    if (!currentUser) return '';
    if ('displayName' in currentUser && currentUser.displayName) {
      return currentUser.displayName;
    }
    return currentUser.email || 'User';
  };

  return (
    <header className="site-header">
      <nav className="header-nav" aria-label="Main Navigation">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          end
        >
          Home
        </NavLink>
        <NavLink
          to="/favourites"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Favourites
        </NavLink>
      </nav>

      <div className="header-right">
        <form
          id="header-search-form"
          name="headerSearchForm"
          className="header-search-form"
          onSubmit={handleSubmit}
          role="search"
        >
          <span className="search-icon-prefix" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </span>

          <input
            type="text"
            id="header-search-input"
            name="headerSearchQuery"
            className="search-input"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search Movies"
          />

          {searchQuery && (
            <button
              type="button"
              id="header-search-clear-btn"
              name="clearSearch"
              className="search-clear-button"
              onClick={handleClear}
              aria-label="Clear search query"
              title="Clear search"
            >
              ✕
            </button>
          )}

          <button
            type="submit"
            id="header-search-button"
            name="headerSearchSubmit"
            className="search-button"
          >
            Search
          </button>
        </form>

        {currentUser ? (
          <div className="user-profile-badge">
            <span className="user-avatar" title={getUserEmailDisplay()}>
              {getUserInitial()}
            </span>
            <span className="user-email-text" title={getUserEmailDisplay()}>
              {getUserEmailDisplay()}
            </span>
            <button
              type="button"
              id="header-logout-btn"
              name="headerLogout"
              className="auth-nav-btn"
              onClick={logout}
              title="Sign Out"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link to="/login" id="header-login-btn" className="auth-nav-btn login-btn">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
