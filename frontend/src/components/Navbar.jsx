import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Navbar.module.css';

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    // navbar
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
            <Link to='/profile' className={styles.loginButton}>
              View User Profile
            </Link>
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
          {/* <Link to='/login' className={styles.loginButton}>
            Login
          </Link>
          <Link to='/sign-up' className={styles.signupButton}>
            Sign Up
          </Link>
          <Link to='/profile' className={styles.loginButton}>
            View User Profile
          </Link> */}
        </nav>
      </header>
    </div>
  );
}

export default Navbar;
