import { useEffect, useState } from 'react';
import threadohq_logo from '../assets/threadohq_logo.jpg';
import { useAnimate } from 'framer-motion';
import { Link } from 'react-router-dom';
import CompanyProfileCardComponent from './CompanyProfileCard';

const API_URL = import.meta.env.VITE_API_URL;

export const LandingHero = () => {
  const [scope, animate] = useAnimate();
  const [size, setSize] = useState({ columns: 0, rows: 0 });

  useEffect(() => {
    generateGridCount();
    window.addEventListener('resize', generateGridCount);

    return () => window.removeEventListener('resize', generateGridCount);
  }, []);

  const generateGridCount = () => {
    const columns = Math.floor(document.body.clientWidth / 75);
    const rows = Math.floor(document.body.clientHeight / 75);

    setSize({
      columns,
      rows,
    });
  };

  const images = [threadohq_logo];

  const handleMouseLeave = e => {
    // @ts-ignore
    const id = `#${e.target.id}`;
    animate(id, { opacity: 0.3 }, { duration: 1 });
  };

  const handleMouseEnter = e => {
    // @ts-ignore
    const id = `#${e.target.id}`;
    animate(id, { opacity: 1 }, { duration: 0.5 });
  };

  // NLP Integration - Search Logic Implementation Here
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleKeyPress = event => {
    if (event.key === 'Enter') {
      search(searchTerm);
    }
  };

  const search = term => {
    fetch(`${API_URL}semantic-search-portfolio-companies/?query=${encodeURIComponent(term)}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setSearchResults(data.company);
        console.log(data.company);
      })
      .catch(error => console.error('Error:', error));
  };

  return (
    <div className='bg-primary'>
      <div
        ref={scope}
        className='grid h-screen w-full grid-cols-[repeat(auto-fit,_minmax(75px,_1fr))] grid-rows-[repeat(auto-fit,_minmax(75px,_1fr))] box-border'
      >
        {[...Array(size.rows * size.columns)].map((_, i) => {
          // Select a random image
          const randomImage = images[Math.floor(Math.random() * images.length)];

          return (
            <div
              key={i}
              id={`square-${i}`}
              onMouseLeave={handleMouseLeave}
              onMouseEnter={handleMouseEnter}
              className='h-full w-full border-[1px] border-secondary-100 relative opacity-30'
              style={{
                backgroundImage: `url(${randomImage})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            />
          );
        })}
      </div>
      <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-8 mt-6'>
        <h1 className='text-center text-4xl font-black uppercase text-black sm:text-5xl md:text-6xl'>
          Find what you need
        </h1>
        <input
          className='pointer-events-auto w-full h-12 text-gray-700 rounded-full mt-6 max-w-3xl text-left text-lg font-light md:text-xl pl-8 pr-8'
          type='search'
          placeholder='Type something...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <h2 className='text-black text-4xl font-medium mb-6 mt-6'>OR</h2>
        <p className='text-black font-light text-xl pointer-events-auto'>
          Or go to{' '}
          <Link className='underline font-bold' to='/directory'>
            Directory
          </Link>
        </p>
      </div>
      <div className='flex justify-center'>
        <CompanyProfileCardComponent searchResults={searchResults} />
      </div>
    </div>
  );
};
