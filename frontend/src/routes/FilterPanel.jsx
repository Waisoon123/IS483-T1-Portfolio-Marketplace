import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const API_URL = import.meta.env.VITE_API_URL;

const FilterPanel = ({ isOpen, setIsOpen, onFiltersChange, countriesData, sectorsData }) => {
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isSectorOpen, setIsSectorOpen] = useState(false);
  const countries = countriesData;
  const sectors = sectorsData;
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);

  const handleCountryChange = id => {
    const newSelection = selectedCountries.includes(id)
      ? selectedCountries.filter(countryId => countryId !== id)
      : [...selectedCountries, id];
    setSelectedCountries(newSelection);
    onFiltersChange({ countries: newSelection, sectors: selectedSectors });
  };

  const handleSectorChange = id => {
    const newSelection = selectedSectors.includes(id)
      ? selectedSectors.filter(sectorId => sectorId !== id)
      : [...selectedSectors, id];
    setSelectedSectors(newSelection);
    onFiltersChange({ countries: selectedCountries, sectors: newSelection });
  };

  const handleClearFilters = () => {
    setSelectedCountries([]);
    setSelectedSectors([]);
    onFiltersChange({ countries: [], sectors: [] }); // Notify parent component to clear filters
  };

  const filterPanelClasses = `fixed top-20 right-0 h-4/5 w-8/12 bg-secondary-100 rounded-lg  p-8 shadow-lg transition-transform duration-300 ease-in-out z-40 ${
    isOpen ? 'translate-x-0' : 'translate-x-full'
  }`;

  return (
    <div data-testid="filter-panel" className={filterPanelClasses}>
      <h1 className='absoulte top-4 left-4 text-2xl font-semibold mb-3'>Filters</h1>

      {/* Filter Indicators */}
      <div className='mb-4'>
        {selectedCountries.map(id => (
          <span key={id} data-testid={`country-${id}`} className='rounded-sm text-sm bg-secondary-300 p-2 text-white mr-2'>
            {countries.find(c => c.id === id)?.hq_name}
          </span>
        ))}
        {selectedSectors.map(id => (
          <span key={id} data-testid={`sector-${id}`} className='rounded-sm text-sm bg-secondary-300 p-2 text-white mr-2'>
            {sectors.find(s => s.id === id)?.sector_name}
          </span>
        ))}
      </div>

      <button onClick={handleClearFilters} className='mb-4 text-secondary-300 rounded'>
        Clear Filters
      </button>

      <div className='grid grid-cols-3 gap-4 h-[500px]'>
        <div className='flex flex-col justify-start mb-4 col-span1'>
          <button
            onClick={() => {
              setIsCountryOpen(!isCountryOpen);
              if (isSectorOpen) setIsSectorOpen(false);
            }}
            className={`inline-flex text-left mb-2.5 ${
              isCountryOpen ? 'font-semibold border-l-4 border-secondary-300 pl-2' : ''
            }`}
          >
            Country
          </button>
          <button
            onClick={() => {
              setIsSectorOpen(!isSectorOpen);
              if (isCountryOpen) setIsCountryOpen(false);
            }}
            className={`inline-flex text-left mb-2.5 ${
              isSectorOpen ? 'font-semibold border-l-4 border-secondary-300 pl-2' : ''
            }`}
          >
            Sector
          </button>
        </div>
        <>
          {isCountryOpen && (
            <div className='flex flex-col col-span-2 px-4'>
              <h3 className='text-md font-semibold mb-2.5'>Country</h3>
              {countries.map(({ id, hq_name }) => (
                <label
                  key={id}
                  className='flex items-center space-x-2 lg:text-lg md:text-lg sm:text-sm sm:line-clamp-1'
                >
                  <input
                    type='checkbox'
                    className='form-checkbox h-4 w-4'
                    checked={selectedCountries.includes(id)}
                    onChange={() => handleCountryChange(id)}
                  />
                  <span className='ml-2'>{hq_name}</span>
                </label>
              ))}
            </div>
          )}
          {isSectorOpen && (
            <div className='flex flex-col col-span-2 px-4 overflow-auto h-full'>
              <h3 className='text-md font-semibold mb-2.5'>Sector</h3>
              {sectors.map(({ id, sector_name }) => (
                <label key={id} className='flex items-center space-x-2 lg:text-lg md:text-lg sm:text-sm'>
                  <input
                    type='checkbox'
                    className='form-checkbox h-4 w-4'
                    checked={selectedSectors.includes(id)}
                    onChange={() => handleSectorChange(id)}
                  />
                  <span className='ml-2 overflow-hidden sm:line-clamp-1'>{sector_name}</span>
                </label>
              ))}
            </div>
          )}
        </>
      </div>

      <button
        data-testid="close-filter-panel"
        onClick={() => setIsOpen(false)}
        className='absolute top-4 right-4 text-black font-semibold rounded text-2xl'
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
};

export default FilterPanel;
