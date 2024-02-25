import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { faIndustry, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
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

  return (
    <div className='bg-primary h-screen-full py-12 lg:px-28 md:px-12 sm:px-12'>
      <div className='flex justify-between items-center py-4'>
        <h2 className='text-6xl font-bold text-black sm:text-md md:text-md'>Backed by Vertex</h2>
        <button
          onClick={toggleFilterPanel}
          className='justify-end bg-secondary-200 hover:bg-secondary-300 py-3 px-4 rounded-l'
          data-testid='filter-btn'
          disabled={isSearching}
        >
          <FontAwesomeIcon icon={faFilter} size='xl' className='text-white' />
        </button>
      </div>
      <p className='mt-4 font-light text-black'>
        As of 2023, we have invested in over 300 companies. Here, you can search for Vertex companies by industry,
        region, company size, and more.
      </p>

      {/* Displaying selected filters */}
      <div className='flex items-center flex-wrap mb-2 mt-2'>
        <FontAwesomeIcon icon={faFilter} className='text-secondary-200' style={{ fontSize: '24px' }} />
        {selectedFilters.countries.map(countryId => (
          <span key={countryId} className='flex items-center m-1 text-secondary-200 px-3 py-1 rounded-full'>
            <FontAwesomeIcon icon={faMapMarkerAlt} className='text-sm mr-2' />{' '}
            Country: {countriesData.find(c => c.id === countryId)?.hq_name || countryId}
          </span>
        ))}
        {selectedFilters.sectors.map(sectorId => (
          <span key={sectorId} className='flex items-center m-1 text-secondary-200 px-3 py-1 rounded-full'>
            <FontAwesomeIcon icon={faIndustry} className='text-sm mr-2' />{' '}
            Sector: {sectorsData.find(s => s.id === sectorId)?.sector_name || sectorId}
          </span>
        ))}
      </div>

      <FilterPanel
        isOpen={isFilterOpen}
        setIsOpen={setIsFilterOpen}
        onFiltersChange={handleFiltersChange}
        countriesData={countriesData}
        sectorsData={sectorsData}
      />
      <CompanyPanel filters={selectedFilters} searchQuery={searchQuery} isSearching={isSearching} />
    </div>
  );
};

export default Directory;
