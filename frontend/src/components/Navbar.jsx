import { useContext } from 'react';
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
    <nav className='sticky top-0 z-50 h-16 bg-secondary-200 text-white'>
      <div className='container mx-auto flex justify-between items-center h-full'>
        <div>
          {/* <Brand /> */}
          LOGO
        </div>
        <div className='flex justify-between text-md sm:text-sm md:text-base lg:text-base'>
          <ul className='flex justify-between list-none'>
            <li className='mr-8'>
              <Link to=''>PlaceHolder</Link>
            </li>
            <li className='mr-8'>
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
                  className='text-black font-semibold bg-secondary-100 border-white rounded p-4 sm:text-xs md:text-base lg:text-base'
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
                  className='text-black font-semibold bg-secondary-100 border-white rounded p-4 sm:text-xs md:text-base lg:text-base'
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to='/sign-up'
                  className='text-black font-semibold bg-secondary-100 border-white rounded p-4 sm:text-xs md:text-base lg:text-base'
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
