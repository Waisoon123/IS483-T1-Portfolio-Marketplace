// FilterPanel.jsx

import React, { useState } from 'react';

const FilterPanel = ({ isOpen, setIsOpen }) => {
  // State for managing which filter options are shown
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isSectorOpen, setIsSectorOpen] = useState(false);

  // Tailwind CSS classes for the filter panel
  const filterPanelClasses = `fixed top-20 right-0 h-4/5 w-8/12 bg-secondary-100 p-4 shadow-lg transition-transform duration-300 ease-in-out z-40 ${
    isOpen ? 'translate-x-0' : 'translate-x-full'
  }`;

  // Function to handle opening country options
  const handleCountryClick = () => {
    setIsCountryOpen(true);
    setIsSectorOpen(false); // Close sector options if open
  };

  // Function to handle opening sector options
  const handleSectorClick = () => {
    setIsSectorOpen(true);
    setIsCountryOpen(false); // Close country options if open
  };

  return (
    <div className={filterPanelClasses}>
      <h1 className="text-xl font-semibold mb-3">Filters</h1>
      
      {/* Filter options toggle buttons */}
      <div className="flex flex-col space-y-2 mb-4">
        <button 
          onClick={handleCountryClick}
          className="text-lg bg-blue-500 text-white py-2 px-4 rounded"
        >
          Country
        </button>
        <button 
          onClick={handleSectorClick}
          className="text-lg bg-blue-500 text-white py-2 px-4 rounded"
        >
          Sector
        </button>
      </div>

      {/* Close button */}
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 text-lg bg-blue-500 text-white py-2 px-4 rounded"
      >
        Close
      </button>

      {/* Country checkbox options */}
      {isCountryOpen && (
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox h-5 w-5" />
            <span>Country 1</span>
          </label>
          {/* Repeat for other countries */}
        </div>
      )}

      {/* Sector checkbox options */}
      {isSectorOpen && (
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="form-checkbox h-5 w-5" />
            <span>Sector 1</span>
          </label>
          {/* Repeat for other sectors */}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
