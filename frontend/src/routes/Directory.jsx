import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import CompanyPanel from '../components/CompanyPanel';
import FilterPanel from './FilterPanel';
import { useLocation } from 'react-router-dom';

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

  const toggleFilterPanel = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleFiltersChange = filters => {
    setSelectedFilters(filters);
  };

  useEffect(() => {
    setIsSearching(!!searchQuery);
  }, [searchQuery]);

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
      <FilterPanel isOpen={isFilterOpen} setIsOpen={setIsFilterOpen} onFiltersChange={handleFiltersChange} />
      {/* <CompanyProfileCardComponent filters={selectedFilters} />
      <CompanyProfileCard /> */}
      <CompanyPanel filters={selectedFilters} searchQuery={searchQuery} isSearching={isSearching} />
    </div>
  );
};

export default Directory;
