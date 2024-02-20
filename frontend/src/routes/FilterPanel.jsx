import React, { useState, useEffect } from 'react';

const FilterPanel = ({ isOpen, setIsOpen, onFiltersChange }) => {
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isSectorOpen, setIsSectorOpen] = useState(false);
  const [countries, setCountries] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);

  const fetchAllPages = async (url, setData) => {
    let results = [];
    let nextUrl = url;
    while (nextUrl) {
      try {
        const response = await fetch(nextUrl);
        if (!response.ok) throw new Error('Network response was not ok.');
        const data = await response.json();
        results = results.concat(data.results);
        nextUrl = data.next;
      } catch (error) {
        console.error('Failed to fetch data:', error);
        break;
      }
    }
    setData(results);
  };

  useEffect(() => {
    fetchAllPages('http://localhost:8000/api/main-offices/', setCountries);
    fetchAllPages('http://localhost:8000/api/tech-sectors/', setSectors);
  }, []);

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

  const filterPanelClasses = `fixed top-20 right-0 h-4/5 w-8/12 bg-secondary-100 p-4 shadow-lg transition-transform duration-300 ease-in-out z-40 ${
    isOpen ? 'translate-x-0' : 'translate-x-full'
  }`;

  return (
    <div className={filterPanelClasses}>
      <h1 className='text-xl font-semibold mb-3'>Filters</h1>
      <div className='flex flex-col space-y-2 mb-4'>
        <button
          onClick={() => setIsCountryOpen(!isCountryOpen)}
          className='text-lg bg-blue-500 text-white py-2 px-4 rounded'
        >
          Country
        </button>
        <button
          onClick={() => setIsSectorOpen(!isSectorOpen)}
          className='text-lg bg-blue-500 text-white py-2 px-4 rounded'
        >
          Sector
        </button>
      </div>

      {/* Filter Indicators */}
      <div className='mb-4'>
        {selectedCountries.map(id => (
          <span key={id} className='text-sm bg-blue-200 text-blue-800 py-1 px-3 rounded-full mr-2'>
            {countries.find(c => c.id === id)?.hq_name}
          </span>
        ))}
        {selectedSectors.map(id => (
          <span key={id} className='text-sm bg-green-200 text-green-800 py-1 px-3 rounded-full mr-2'>
            {sectors.find(s => s.id === id)?.sector_name}
          </span>
        ))}
      </div>

      <button onClick={handleClearFilters} className='mb-4 bg-red-500 text-white py-2 px-4 rounded'>
        Clear Filters
      </button>

      <button
        onClick={() => setIsOpen(false)}
        className='absolute top-4 right-4 text-lg bg-blue-500 text-white py-2 px-4 rounded'
      >
        Close
      </button>

      <>
        {isCountryOpen && (
          <div className='space-y-2 overflow-auto max-h-60'>
            {countries.map(({ id, hq_name }) => (
              <label key={id} className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  className='form-checkbox h-5 w-5'
                  checked={selectedCountries.includes(id)}
                  onChange={() => handleCountryChange(id)}
                />
                <span>{hq_name}</span>
              </label>
            ))}
          </div>
        )}
        {isSectorOpen && (
          <div className='space-y-2 overflow-auto max-h-60'>
            {sectors.map(({ id, sector_name }) => (
              <label key={id} className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  className='form-checkbox h-5 w-5'
                  checked={selectedSectors.includes(id)}
                  onChange={() => handleSectorChange(id)}
                />
                <span>{sector_name}</span>
              </label>
            ))}
          </div>
        )}
      </>
    </div>
  );
};

export default FilterPanel;
