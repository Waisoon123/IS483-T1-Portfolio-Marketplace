import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { AuthContext } from '../App.jsx';

function Navbar() {
  const { isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    document.cookie = 'userID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div className={styles.navbar}>
      <header className='App-header'>
        <nav className={styles.navbarBody}>
          <Link to='/' className=''>
            Lorem Ipsum
          </Link>
          <Link to='/' className=''>
            Lorem Ipsum
          </Link>
          {isAuthenticated ? (
            <>
              <Link to='/profile' className={styles.loginButton}>
                View User Profile
              </Link>
              <button className={styles.loginButton} onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to='/login' className={styles.loginButton}>
                Login
              </Link>
              <Link to='/sign-up' className={styles.signupButton}>
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </header>
    </div>
  );
}

export default Navbar;
