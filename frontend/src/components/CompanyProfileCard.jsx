import { motion } from 'framer-motion';
import threadohq_logo from '../assets/threadohq_logo.jpg';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const CompanyProfileCardComponent = () => {
  // const companies = [
  //   {
  //     name: 'Threado',
  //     description:
  //       'Threado is the command centre for your online community The single source of truth for your online community. Get insights. Automate tasks. Drive engagement. Join the waitlist now!',
  //     logo: threadohq_logo,
  //   },
  //   {
  //     name: 'Threado',
  //     description:
  //       'Threado is the command centre for your online community The single source of truth for your online community. Get insights. Automate tasks. Drive engagement. Join the waitlist now!',
  //     logo: threadohq_logo,
  //   },
  //   {
  //     name: 'Threado',
  //     description:
  //       'Threado is the command centre for your online community The single source of truth for your online community. Get insights. Automate tasks. Drive engagement. Join the waitlist now!',
  //     logo: threadohq_logo,
  //   },
  //   {
  //     name: 'Threado',
  //     description:
  //       'Threado is the command centre for your online community The single source of truth for your online community. Get insights. Automate tasks. Drive engagement. Join the waitlist now!',
  //     logo: threadohq_logo,
  //   },
  //   {
  //     name: 'Threado',
  //     description:
  //       'Threado is the command centre for your online community The single source of truth for your online community. Get insights. Automate tasks. Drive engagement. Join the waitlist now!',
  //     logo: threadohq_logo,
  //   },
  //   {
  //     name: 'Threado',
  //     description:
  //       'Threado is the command centre for your online community The single source of truth for your online community. Get insights. Automate tasks. Drive engagement. Join the waitlist now!',
  //     logo: threadohq_logo,
  //   },
  // ];

  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}companies/`)
      .then(response => response.json())
      .then(data => {
        const companiesData = data.results.map(company => ({
          ...company,
          logo: threadohq_logo, // use the hardcoded logo for now
        }));
        setCompanies(companiesData);
      });
  }, []);

  return (
    <div className='bg-primary py-4 grid grid-cols-3 justify-start w-full'>
      {companies.map(company => (
        <div key={company.name}>
          <CompanyProfileCard company={company} />
        </div>
      ))}
    </div>
  );
};

const CompanyProfileCard = ({ company }) => {
  return (
    <Link to={`/directory/${company.company}`}>
      <div className='mx-auto mt-8 group relative w-full max-w-xl overflow-hidden rounded-lg bg-white p-0.5 transition-all duration-500 hover:scale-[1.01] hover:bg-white'>
        <div className='relative z-10 flex flex-col items-start justify-start overflow-hidden rounded-[7px] bg-white p-10 transition-colors duration-500 group-hover:bg-secondary-100'>
          <div className='flex items-center mb-4'>
            <img src={company.logo} alt={company.name} className='relative z-10 mb-0 mt-0 mr-8 w-24 sm:w-16 md:w-24' />
            <h4 className='relative z-10 w-full lg:text-2xl md:text-xl sm:text-sm font-bold text-black'>
              {company.company}
            </h4>
          </div>
          <p className='relative z-10 text-black text-left lg:text-xl md:text-md sm:text-sm line-clamp-3'>
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
    </Link>
  );
};

CompanyProfileCard.propTypes = {
  company: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    logo: PropTypes.string.isRequired,
  }).isRequired,
};

export default CompanyProfileCardComponent;
