import { motion } from 'framer-motion';
import threadohq_logo from '../assets/threadohq_logo.jpg';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const API_URL = import.meta.env.VITE_API_URL;

const CompanyProfileCardComponent = ({ searchResults, filters }) => {
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(1);
  let tempCompanies = []; // temporary array to store the matches

  const fetchCompanies = async (url = `${API_URL}companies/?page=${page}`) => {
    const response = await fetch(url);
    const data = await response.json();

    const companiesData = data.results.map(company => ({
      ...company,
      logo: threadohq_logo, // use the hardcoded logo for now
    }));

    // If searchResults is provided and is not an empty array, filter the companiesData
    if (searchResults && searchResults.length > 0) {
      const filteredCompanies = companiesData.filter(company => searchResults.includes(company.company));
      tempCompanies = [...tempCompanies, ...filteredCompanies]; // append the matches to the temporary array

      if (data.next) {
        await fetchCompanies(data.next);
      } else {
        setCompanies(tempCompanies); // set the companies state only once after all the pages have been fetched
      }
    } else {
      setCompanies(companiesData);
    }
  };

  const handleNext = () => {
    setPage(page + 1);
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  useEffect(() => {
    let queryParams = new URLSearchParams();

    filters.sectors.forEach(sector => queryParams.append('tech_sectors', sector));
    filters.countries.forEach(country => queryParams.append('hq_main_offices', country));

    fetch(`${API_URL}companies/?${queryParams.toString()}`)
      .then(response => response.json())
      .then(data => {
        setCompanies(
          data.results.map(company => ({
            ...company,
            logo: company.logo || threadohq_logo, // Use provided logo or fallback
          })),
        );
      })
      .catch(error => console.error('Failed to fetch companies:', error));
  }, [filters]);

  useEffect(() => {
    setCompanies([]);
  }, [searchResults, page]);

  useEffect(() => {
    fetchCompanies();
  }, [searchResults, page]); // add page as a dependency

  return (
    <div>
      <div className='bg-primary py-4 grid grid-cols-3 justify-start w-full'>
        {companies.map(company => (
          <div key={company.name}>
            <CompanyProfileCard company={company} />
          </div>
        ))}
      </div>
      <div className='flex justify-center items-center mt-20 space-x-4'>
        <button
          className='bg-secondary-200 p-2 font-sans text-white rounded-sm font-bold'
          onClick={handlePrevious}
          disabled={page === 1}
        >
          Previous
        </button>
        <button className='bg-secondary-200 p-2 font-sans text-white rounded-sm font-bold' onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
};

CompanyProfileCardComponent.defaultProps = {
  searchResults: [],
};

const CompanyProfileCard = ({ company }) => {
  return (
    <div className='mx-auto mt-8 group relative w-full max-w-xl overflow-hidden rounded-lg bg-white p-0.5 transition-all duration-500 hover:scale-[1.01] hover:bg-white'>
      <div className='relative z-10 flex flex-col items-start justify-start overflow-hidden rounded-[7px] bg-white p-10 transition-colors duration-500 group-hover:bg-secondary-100'>
        <div className='flex items-center mb-4'>
          <img src={company.logo} alt={company.company} className='relative z-10 mb-0 mt-0 mr-8 w-24 sm:w-16 md:w-24' />
          <h4 className='relative z-10 w-full text-2xl font-bold text-black'>{company.company}</h4>
        </div>
        <p className='relative z-10 text-black text-left text-xl line-clamp-3'>{company.description}</p>
      </div>
      <motion.div
        initial={{ rotate: '0deg' }}
        animate={{ rotate: '360deg' }}
        style={{ scale: 1.75 }}
        transition={{
          repeat: Infinity,
          duration: 3.5,
          ease: 'linear',
        }}
        className='absolute inset-0 z-0 bg-gradient-to-br from-primary via-primary/0 to-secondary-300 opacity-0 transition-opacity duration-500 group-hover:opacity-100'
      />
    </div>
  );
};

// Updated PropTypes to match the expected company object structure
CompanyProfileCard.propTypes = {
  company: PropTypes.shape({
    id: PropTypes.number.isRequired,
    company: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    logo: PropTypes.string,
  }).isRequired,
};

export default CompanyProfileCardComponent;
