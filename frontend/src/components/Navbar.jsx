import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App.jsx';
import logo from '../assets/vertex_holdings_logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle } from '@fortawesome/free-solid-svg-icons';

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
    <nav className='sticky top-0 z-50 h-20 bg-secondary-200 text-white'>
      <div className='container mx-auto flex justify-evenly items-center h-full'>
        <div>
          <img src={logo} className='w-32 h-32' />
        </div>
        <div className='flex text-md sm:text-sm md:text-base lg:text-base'>
          <ul className='flex list-none font-semibold'>
            <li className='mr-8'>
              <Link to=''>Home</Link>
            </li>
            <li className='mr-8'>
              <Link to=''>About</Link>
            </li>
            <li>
              <Link to='/directory'>Directory</Link>
            </li>
          </ul>

          <div className='flex justify-end items-center list-none ml-8'>
            {isAuthenticated ? (
              <>
                <li className='mr-8'>
                  <Link
                    to='/profile'
                    className='text-black font-semibold bg-secondary-100 border-white rounded p-4 sm:text-xs md:text-base lg:text-base'
                  >
                    View User Profile
                  </Link>
                </li>

                <li>
                  <button
                    className='text-black font-semibold bg-secondary-100 border-white rounded py-4 px-6 sm:text-xs md:text-base lg:text-base'
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className='mr-8'>
                  <Link
                    to='/login'
                    className='text-white font-semibold border-2 border-white rounded p-4 sm:text-xs md:text-base lg:text-base'
                  >
                    <FontAwesomeIcon icon={faUserCircle} className='mr-2' size='xl' />
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to='/sign-up'
                    className='text-white font-semibold border-2 border-white rounded py-4 px-6 sm:text-xs md:text-base lg:text-base'
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
