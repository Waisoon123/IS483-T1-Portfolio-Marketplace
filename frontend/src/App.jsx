import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar.jsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} />
      <Outlet isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
    </>
  );
}

export default App;
