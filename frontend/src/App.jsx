import { Outlet } from 'react-router-dom';
import { useState, useEffect, createContext } from 'react';
import './App.css';
import Navbar from './components/Navbar.jsx';
import checkAuthentication from './constants/checkAuthentication.js';

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
      <Outlet />
    </AuthContext.Provider>
  );
}

export default App;
