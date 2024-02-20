import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import CompanyProfileCardComponent from '../components/CompanyProfileCard';
import FilterPanel from './FilterPanel';

const Directory = () => {
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

  return (
    <div className='bg-primary h-screen'>
      <div className='flex justify-between items-center px-28 py-4'>
        <h1 className='text-6xl font-bold text-black'>Backed by Vertex</h1>
        <button
          onClick={toggleFilterPanel}
          className='bg-secondary-200 hover:bg-secondary-300 py-3 px-4 rounded-l'
          data-testid='filter-btn'
        >
          <FontAwesomeIcon icon={faFilter} size='xl' className='text-white' />
        </button>
      </div>
      <p className='px-28 mt-4 font-light text-black'>
        As of 2023, we have invested in over 300 companies. Here, you can search for Vertex companies by industry,
        region, company size, and more.
      </p>
      <FilterPanel isOpen={isFilterOpen} setIsOpen={setIsFilterOpen} onFiltersChange={handleFiltersChange} />
      <CompanyProfileCardComponent filters={selectedFilters} />
    </div>
  );
};

export default Directory;
