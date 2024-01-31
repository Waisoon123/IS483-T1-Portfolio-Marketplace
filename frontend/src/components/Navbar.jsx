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
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logo}>
          {/* <Brand /> */}
          LOGO
        </div>
        <div className={styles['nav-elements']}>
          <ul className={styles['nav-elements ul']}>
            <li>
              <Link to=''>PlaceHolder</Link>
            </li>
            <li>
              <Link to=''>PlaceHolder</Link>
            </li>
            <li>
              <Link to=''>PlaceHolder</Link>
            </li>
            <li>
              <Link to=''>PlaceHolder</Link>
            </li>
          </ul>
        </div>

        <div className={styles.actionButtons}>
          {isAuthenticated ? (
            <>
              <li>
                <Link to='/profile' className={styles.button}>
                  View User Profile
                </Link>
              </li>

              <li>
                <button className={styles.button} onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to='/login' className={styles.button}>
                  Login
                </Link>
              </li>
              <li>
                <Link to='/sign-up' className={styles.button}>
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
