import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import HomeView from './pages/Home/HomeView';
import FavouritesView from './pages/Favourites/FavouritesView';
import LoginView from './pages/Auth/LoginView';
import SignupView from './pages/Auth/SignupView';

function AppContent() {
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <>
      <Header onSearch={(q) => setSearchQuery(q)} />
      <main>
        <Routes>
          <Route path="/" element={<HomeView externalQuery={searchQuery} />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/signup" element={<SignupView />} />
          <Route
            path="/favourites"
            element={
              <ProtectedRoute>
                <FavouritesView />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
