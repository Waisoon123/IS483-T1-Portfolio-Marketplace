import { Outlet } from 'react-router-dom';
import { useState, useEffect, createContext } from 'react';
import './App.css';
import Navbar from './components/Navbar.jsx';
import checkAuthentication from './utils/checkAuthentication.js';
import { LandingHero } from './components/LandingHero.jsx';
import CompanyProfileCard from './components/CompanyProfileCard.jsx';

export const AuthContext = createContext();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthentication(auth => {
      setIsAuthenticated(auth);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <Navbar />
      <LandingHero />
      <CompanyProfileCard />
      <Outlet />
    </AuthContext.Provider>
  );
}

export default App;
