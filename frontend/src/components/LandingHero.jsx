import React, { useEffect, useState } from 'react';
import { useAnimate } from 'framer-motion';

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

  const handleMouseLeave = e => {
    // @ts-ignore
    const id = `#${e.target.id}`;
    animate(id, { background: 'rgba(129, 140, 248, 0)' }, { duration: 1 });
  };

  const handleMouseEnter = e => {
    // @ts-ignore
    const id = `#${e.target.id}`;
    animate(id, { background: 'rgba(129, 140, 248, 1)' }, { duration: 0.15 });
  };

  return (
    <div className='bg-primary'>
      <div
        ref={scope}
        className='grid h-screen w-full grid-cols-[repeat(auto-fit,_minmax(75px,_1fr))] grid-rows-[repeat(auto-fit,_minmax(75px,_1fr))]'
      >
        {[...Array(size.rows * size.columns)].map((_, i) => (
          <div
            key={i}
            id={`square-${i}`}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            className='h-full w-full border-[1px] border-secondary-100'
          />
        ))}
      </div>
      <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-8 mt-6'>
        <h1 className='text-center text-4xl font-black uppercase text-black sm:text-5xl md:text-6xl'>
          Find what you need
        </h1>
        <input
          className='pointer-events-auto w-full h-12 text-gray-300 rounded-full mt-6 max-w-3xl text-center text-lg font-light text-black md:text-xl'
          type='search'
          placeholder='Type something...'
        />
        <h2 className='text-black text-4xl font-medium mb-6 mt-6'>OR</h2>
        <p className='text-black font-light text-xl pointer-events-auto'>
          Or go to{' '}
          <a href='/' className='underline font-bold'>
            Directory
          </a>
        </p>
      </div>
    </div>
  );
};
