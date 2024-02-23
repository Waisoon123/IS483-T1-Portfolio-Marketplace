import { motion } from 'framer-motion';
import threadohq_logo from '../assets/threadohq_logo.jpg';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const CompanyProfileCardComponent = ({ filters, searchResults }) => {
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchCompanies = async (page = 1, allCompanies = []) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);

      if (filters) {
        filters.sectors.forEach(sector => queryParams.append('tech_sectors', sector));
        filters.countries.forEach(country => queryParams.append('hq_main_offices', country));
      }

      const apiUrl = `${API_URL}companies/?${queryParams.toString()}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }

      const data = await response.json();

      let companiesData = data.results.map(company => ({
        ...company,
        logo: company.logo || threadohq_logo,
      }));

      allCompanies = [...allCompanies, ...companiesData];

      // If there's a next page and searchResults is provided and its length is greater than 0
      // and not all companies in searchResults are found, fetch the next page
      if (
        data.next &&
        searchResults &&
        searchResults.length > 0 &&
        searchResults.some(companyName => !allCompanies.some(company => company.company === companyName))
      ) {
        const nextPage = new URL(data.next).searchParams.get('page');
        return fetchCompanies(nextPage, allCompanies);
      }

      setLoading(false);

      // If searchResults is provided and its length is greater than 0, filter allCompanies
      if (searchResults && searchResults.length > 0) {
        allCompanies = allCompanies.filter(company => searchResults.includes(company.company));
      }

      return allCompanies;
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(page).then(companiesData => {
      setCompanies(companiesData);
    });
  }, [page, filters, searchResults]);

  const handleNext = () => {
    setPage(page + 1);
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // In your render method, display a loading message if loading is true
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className='bg-primary py-4 grid md:grid-cols-2 lg:grid-cols-3 sm:grid-cols-1 gap-6 justify-items-center'>
        {companies.map(company => (
          <div key={company.id}>
            <Link to={`/directory/${company.company}`}>
              <CompanyProfileCard company={company} />
            </Link>
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

const CompanyProfileCard = ({ company }) => {
  return (
    <div className='mx-auto mt-8 group relative w-full max-w-xl overflow-hidden rounded-lg bg-white p-0.5 transition-all duration-500 hover:scale-[1.01] hover:bg-white'>
      <div className='relative z-10 flex flex-col items-start justify-start overflow-hidden rounded-[7px] bg-white p-10 transition-colors duration-500 group-hover:bg-secondary-100'>
        <div className='flex items-center mb-4'>
          <img src={company.logo} alt={company.company} className='relative z-10 mb-0 mt-0 mr-8 w-36 sm:w-12 md:w-24' />
          <h4 className='relative z-10 w-full text-xl sm:text-md md:text-md font-bold text-black line-clamp-3'>
            {company.company}
          </h4>
        </div>
        <p className='relative z-10 text-black text-left text-xl text-md lg:text-base md:text-sm sm:text-sm line-clamp-3'>
          {company.description}
        </p>
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
