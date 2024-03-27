import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEarthAmericas, faIndustry } from '@fortawesome/free-solid-svg-icons';

const FilterPanel = ({ isOpen, setIsOpen, onFiltersChange, countriesData, sectorsData, selectedFilters }) => {
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isSectorOpen, setIsSectorOpen] = useState(false);
  const countries = countriesData;
  const sectors = sectorsData;
  const [selectedCountries, setSelectedCountries] = useState(selectedFilters.countries);
  const [selectedSectors, setSelectedSectors] = useState(selectedFilters.sectors);

  useEffect(() => {
    setSelectedCountries(selectedFilters.countries);
    setSelectedSectors(selectedFilters.sectors);
  }, [selectedFilters]);

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

  // const filterPanelClasses = `fixed top-20 right-0 min-h-[700px] max-h-[800px] w-5/12 bg-secondary-100 rounded-lg  p-8 shadow-lg transition-transform duration-300 ease-in-out z-40 ${
  //   isOpen ? 'translate-x-0' : 'translate-x-full'
  // }`;
  // Update the class string to position the panel on the left
  const filterPanelClasses = `fixed top-20 left-0 min-h-[700px] max-h-[80vh] w-5/12 bg-secondary-100 rounded-lg py-8 px-8 shadow-lg transition-transform duration-300 ease-in-out z-40 ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  }`;

  return (
    <div data-testid='filter-panel' className={filterPanelClasses}>
      <div className='flex justify-between items-center mb-3'>
        <h1 className='text-2xl font-semibold'>Filters</h1>
        <button
          data-testid='close-filter-panel'
          onClick={() => setIsOpen(false)}
          className='text-black font-semibold rounded text-2xl'
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>

      {/* Filter Indicators */}
      <div className='flex flex-wrap gap-2 mb-4 overflow-auto max-h-32'>
        {selectedCountries.map(id => (
          <span
            key={id}
            data-testid={`country-${id}`}
            className='rounded text-xs bg-secondary-300 p-1 text-white mr-1'
          >
            {countries.find(c => c.id === id)?.hq_name}
          </span>
        ))}
        {selectedSectors.map(id => (
          <span
            key={id}
            data-testid={`sector-${id}`}
            className='rounded text-xs bg-secondary-300 p-1 text-white mr-1'
          >
            {sectors.find(s => s.id === id)?.sector_name}
          </span>
        ))}
      </div>

      <button onClick={handleClearFilters} className='mb-4 text-secondary-300 rounded'>
        Clear Filters
      </button>

      {/* <div className='grid grid-cols-6 gap-4 min-h-screen'> */}
      <div className='grid grid-cols-7 gap-4 min-h-screen'>
        {/* <div className='flex flex-col justify-start mb-4 col-span-1'> */}
        <div className='flex flex-col justify-start mb-4'>
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

        {/* vertical divider */}
        <div className='relative col-span-1'>
          <div className='border-r border-white h-[40%]'></div>
        </div>

        <>
          {isCountryOpen && (
            // <div className='flex flex-col col-span-5 px-4 p-1 rem overflow-auto max-h-[500px]'>
            <div className='flex flex-col col-span-5 px-4 overflow-auto max-h-[60vh]'>
              {/* <h3 className='text-md font-semibold mb-2.5'><FontAwesomeIcon icon={faGlobe} /> Country</h3> */}
              <h3 className='text-md font-semibold mb-2.5'>
                <FontAwesomeIcon icon={faEarthAmericas} /> Country
              </h3>
              {countries.map(({ id, hq_name }) => (
                <label
                  key={id}
                  className='flex items-center space-x-2 lg:text-md md:text-md sm:text-sm'
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
            <div className='flex flex-col col-span-5 px-4 overflow-auto max-h-[calc(100vh-16rem)]'>
              <h3 className='text-md font-semibold mb-2.5'>
                <FontAwesomeIcon icon={faIndustry} /> Sector
              </h3>
              {sectors.map(({ id, sector_name }) => (
                <label key={id} className='flex items-center space-x-2 lg:text-md md:text-md sm:text-sm'>
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
    </div>
  );
};

export default FilterPanel;