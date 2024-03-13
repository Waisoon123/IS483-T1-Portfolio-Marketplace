import { useState } from 'react';
// import threadohq_logo from '../assets/threadohq_logo.jpg';
// import { useAnimate } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import CompanyPanel from './CompanyPanel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

export const LandingHero = () => {
  // const [scope, animate] = useAnimate();
  // const [size, setSize] = useState({ columns: 0, rows: 0 });
  const navigate = useNavigate();

  // useEffect(() => {
  //   generateGridCount();
  //   window.addEventListener('resize', generateGridCount);

  //   return () => window.removeEventListener('resize', generateGridCount);
  // }, []);

  // const generateGridCount = () => {
  //   const columns = Math.floor(document.body.clientWidth / 75);
  //   const rows = Math.floor(document.body.clientHeight / 75);

  //   setSize({
  //     columns,
  //     rows,
  //   });
  // };

  // const images = [threadohq_logo];

  // const handleMouseLeave = e => {
  //   // @ts-ignore
  //   const id = `#${e.target.id}`;
  //   animate(id, { opacity: 0.3 }, { duration: 1 });
  // };

  // const handleMouseEnter = e => {
  //   // @ts-ignore
  //   const id = `#${e.target.id}`;
  //   animate(id, { opacity: 1 }, { duration: 0.5 });
  // };

  // NLP Integration - Search Logic Implementation Here
  const [searchTerm, setSearchTerm] = useState('');

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
    <div className='bg-primary h-full'>
      {/* <div
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
      </div> */}
      <div className='pointer-events-none flex flex-col items-center justify-center p-8'>
        <h1 className='text-center text-4xl font-black uppercase text-black sm:text-4xl md:text-6xl mt-48'>
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
          <div className='absolute right-0 top-0 bottom-0 flex items-center justify-center bg-secondary-200 rounded-full w-12 h-12'>
            <FontAwesomeIcon icon={faSearch} className='text-white' size='xl' />
          </div>
        </div>
        <p className='text-black text-md mt-4 mb-4 sm:text-xs md:text-lg lg:text-xl'>
          {'*Find what you need using your own words like "Machine learning company in the healthcare sector"'}
        </p>
        <p className='text-black font-light text-xl pointer-events-auto sm:text-md md:text-xl'>
          Or {''}
          <Link className='underline font-bold' to='/directory'>
            View Our Lists of Start-ups
          </Link>
        </p>
      </div>
      <div className='mt-48'>
        <h1 className='text-center text-4xl font-black text-black sm:text-4xl'>Recommended For You</h1>
        <CompanyPanel />
      </div>
    </div>
  );
};
