import { motion } from 'framer-motion';
import threadohq_logo from '../assets/threadohq_logo.jpg';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const CompanyProfileCardComponent = ({ filters }) => {
  const [companies, setCompanies] = useState([]);

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

  return (
    <div className='bg-primary py-4 grid grid-cols-3 gap-4 justify-items-center'>
      {companies.map(company => (
        <div key={company.id}>
          <Link to={`/directory/${company.company}`}>
            <CompanyProfileCard company={company} />
          </Link>
        </div>
      ))}
    </div>
  );
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
