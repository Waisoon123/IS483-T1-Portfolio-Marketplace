import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { faIndustry, faEarthAmericas, faTimes } from '@fortawesome/free-solid-svg-icons';
import CompanyPanel from '../components/CompanyPanel';
import FilterPanel from './FilterPanel';
import { useLocation } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL; // Assuming you have an environment variable for API URL

const Directory = () => {
  const [isSearching, setIsSearching] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('query');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    sectors: [],
    countries: [],
  });
  const [countriesData, setCountriesData] = useState([]);
  const [sectorsData, setSectorsData] = useState([]);

  // useEffect for handling search query
  useEffect(() => {
    setIsSearching(!!searchQuery);
  }, [searchQuery]);

  // useEffect for fetching countries and sectors data
  const fetchData = async (url, setData) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok.');
      const data = await response.json();
      setData(data); // Assuming the API now returns an array directly
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData(`${API_URL}main-offices/`, setCountriesData);
    fetchData(`${API_URL}tech-sectors/`, setSectorsData);
  }, []);

  const toggleFilterPanel = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFiltersChange = filters => {
    setSelectedFilters(filters);
  };

  const filtersSelected = selectedFilters.countries.length > 0 || selectedFilters.sectors.length > 0;

  const handleRemoveFilter = (type, id) => {
    const updatedFilters = {
      ...selectedFilters,
      [type]: selectedFilters[type].filter(filterId => filterId !== id),
    };
    setSelectedFilters(updatedFilters);
  };

  return (
    <div className='bg-primary min-h-screen py-12 lg:px-28 md:px-12 sm:px-12'>
      <div className='flex justify-start items-center py-4'>
        <h2 className='text-6xl font-bold text-black sm:text-md md:text-md'>Backed by Vertex</h2>
      </div>
      <p className='mt-4 font-light text-black' data-testid='p-directory'>
        We have invested in over 300 companies. Here, you can search for Vertex companies by industry, region, company
        size, and more.
      </p>
      {!isSearching && (
        <div className='flex items-center flex-wrap mb-1 mt-2'>
          <button
            onClick={toggleFilterPanel}
            data-testid='filter-btn'
            disabled={isSearching}
            className='bg-secondary-200 hover:bg-secondary-300 rounded p-2 text-white mr-4'
          >
            <FontAwesomeIcon icon={faFilter} className='text-white' style={{ fontSize: '25px' }} />
          </button>
          {!filtersSelected && <span className='text-secondary-200 '>No filter selected</span>}

          {filtersSelected && (
            <>
              {selectedFilters.countries.map(countryId => (
                <span
                  key={countryId}
                  data-testid={`filter-country-${countryId}`}
                  className='flex items-center m-1 bg-secondary-200 text-white px-3 py-1 hover:bg-button-hoverred rounded-full'
                >
                  <FontAwesomeIcon icon={faEarthAmericas} className='text-sm mr-2' />
                  {countriesData.find(c => c.id === countryId)?.hq_name || countryId}
                  <button onClick={() => handleRemoveFilter('countries', countryId)} className='ml-2'>
                    <FontAwesomeIcon icon={faTimes} className='text-sm' />
                  </button>
                </span>
              ))}
              {selectedFilters.sectors.map(sectorId => (
                <span
                  key={sectorId}
                  data-testid={`filter-sector-${sectorId}`}
                  className='flex items-center m-1 bg-secondary-200 text-white px-3 py-1 hover:bg-button-hoverred rounded-full'
                >
                  <FontAwesomeIcon icon={faIndustry} className='text-sm mr-2' />
                  {sectorsData.find(s => s.id === sectorId)?.sector_name || sectorId}
                  <button onClick={() => handleRemoveFilter('sectors', sectorId)} className='ml-2'>
                    <FontAwesomeIcon icon={faTimes} className='text-sm' />
                  </button>
                </span>
              ))}
            </>
          )}
        </div>
      )}

      <FilterPanel
        isOpen={isFilterOpen}
        setIsOpen={setIsFilterOpen}
        onFiltersChange={handleFiltersChange}
        countriesData={countriesData}
        sectorsData={sectorsData}
        selectedFilters={selectedFilters}
      />
      <CompanyPanel filters={selectedFilters} searchQuery={searchQuery} isSearching={isSearching} />
    </div>
  );
};

export default Directory;
