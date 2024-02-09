import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    <nav className='sticky top-0 z-50 h-16 bg-primary text-black'>
      <div className='container mx-auto px-4 flex justify-between items-center h-full'>
        <div>
          {/* <Brand /> */}
          LOGO
        </div>
        <div className='flex justify-between'>
          <ul className='flex justify-between list-none'>
            <li className='mr-16'>
              <Link to=''>PlaceHolder</Link>
            </li>
            <li className='mr-16'>
              <Link to=''>PlaceHolder</Link>
            </li>
            <li>
              <Link to=''>PlaceHolder</Link>
            </li>
          </ul>
        </div>

        <div className='flex justify-between items-center list-none'>
          {isAuthenticated ? (
            <>
              <li className='mr-16'>
                <Link
                  to='/profile'
                  className='text-white font-semibold bg-secondary-200 border-white rounded px-4 py-4'
                >
                  View User Profile
                </Link>
              </li>

              <li>
                <button
                  className='text-white font-semibold bg-secondary-200 border-white rounded px-4 py-4'
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className='mr-16'>
                <Link to='/login' className='text-white font-semibold bg-secondary-200 border-white rounded px-4 py-4'>
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to='/sign-up'
                  className='text-white font-semibold bg-secondary-200 border-white rounded px-4 py-4'
                >
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
