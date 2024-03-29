import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import CompanyProfileCard from './CompanyProfileCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import checkAuthentication from '../utils/checkAuthentication.js';

const API_URL = import.meta.env.VITE_API_URL;

export const LandingHero = () => {
  const navigate = useNavigate();

  // NLP Integration - Search Logic Implementation Here
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);
  const [hasCompanies, setHasCompanies] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    checkAuthentication(auth => {
      if (auth) {
        setLoading(true);
        try {
          // Get interests from local storage
          const interests = localStorage.getItem('interests');
          fetch(`${API_URL}semantic-search-portfolio-companies/?query=${encodeURIComponent(interests)}`)
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              let company_name_list = data.company;
              for (let i = 0; i < company_name_list.length; i++) {
                fetch(`${API_URL}companies/?company=${encodeURIComponent(company_name_list[i])}`)
                  .then(response => {
                    if (!response.ok) {
                      throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                  })
                  .then(data => {
                    // console.log('Data:', data.results);
                    setCompanies(prevCompanies => [...prevCompanies, ...data.results]);
                    setHasCompanies(true);
                  });
                setLoading(false);
              }
            })
            .catch(error => {
              console.error('Failed to fetch data:', error);
              setLoading(false);
            });
        } catch (error) {
          console.error('Failed to fetch data:', error);
          setLoading(false);
        }
      }
    });
  }, []);

  const handleKeyPress = event => {
    if (event.key === 'Enter') {
      search(searchTerm);
    }
  };

  const search = term => {
    const encodedSearch = encodeURIComponent(term);
    navigate(`/directory/?query=${encodedSearch}`);
  };

  return (
    <div className='bg-primary min-h-screen h-auto'>
      <div className='flex flex-col items-center justify-center p-8'>
        <h1 className='text-center text-4xl font-black text-black sm:text-4xl md:text-6xl mt-48 mb-4'>
          Find what you need
        </h1>
        <div className='relative flex items-center w-full max-w-4xl mt-6'>
          <input
            className='pointer-events-auto w-full h-12 text-gray-700 rounded-full text-left text-xl sm:text-sm font-light md:text-xl pl-8 pr-16 mb-2'
            type='search'
            placeholder='What are you looking for?'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <div className='absolute right-0 top-0 bottom-0 flex items-center justify-center bg-secondary-200 rounded-full w-12 h-12 cursor-pointer'>
            <FontAwesomeIcon icon={faSearch} className='text-white' size='xl' onClick={() => search(searchTerm)} />
          </div>
        </div>
        <p className='text-black text-md mt-4 mb-4 sm:text-xs md:text-lg lg:text-xl'>
          {'*Find what you need using your own words like "Machine learning company in the healthcare sector"'}
        </p>
        <div className='flex mt-4'>
          <p className='text-black font-light sm:text-md md:text-xl lg:text-3xl'>Or&nbsp;</p>
          <Link className='underline pointer-events-auto font-bold sm:text=md md:text-xl lg:text-3xl' to='/directory'>
            View Our Lists of Start-ups
          </Link>
        </div>
      </div>
      {loading ? (
        <div className='flex flex-col items-center justify-start h-auto bg-primary'>
          <div className='animate-spin ease-linear border-4 border-t-4 border-secondary-300 h-12 w-12 mb-4'></div>
          <div className='text-secondary-300'>Loading...</div>
        </div>
      ) : (
        <div className='mt-32'>
          {hasCompanies ? (
            <>
              <h1 className='text-center text-4xl font-black text-black sm:text-4xl md:text-4xl'>
                Recommended For You
              </h1>
              <div className='bg-primary h-full w-8/12 mx-auto'>
                <div className='grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4 py-12'>
                  {/* slice to display only the first 3 companies */}
                  {companies.slice(0, 3).map(company => (
                    <div key={company.id}>
                      <Link to={`/directory/${company.company}`}>
                        <CompanyProfileCard company={company} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
