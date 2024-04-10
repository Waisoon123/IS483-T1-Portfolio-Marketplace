import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import threadohq_logo from '../assets/threadohq_logo.jpg';

const CompanyProfileCard = ({ company }) => {
  if (!company) {
    return <div>Loading...</div>;
  }
  // Use the company's logo if it exists, otherwise use the default logo
  return (
    <div className='mx-8 mt-8 group relative max-w-xl overflow-hidden rounded-md bg-white transition-all duration-500 hover:scale-[1.01] hover:bg-white'>
      <div className='relative z-10 flex flex-col items-center overflow-hidden bg-white p-4 m-1 transition-colors duration-500 group-hover:bg-secondary-100 h-80'>
        <img src={threadohq_logo} alt={company.company} className='mb-4 w-24 h-24' /> {/* Increased margin */}
        <div className='flex flex-col items-center justify-start w-full h-full px-2'>
          {' '}
          {/* Added padding for left and right */}
          <h4 className='w-full text-center sm:text-md md:text-lg lg:text-xl font-bold truncate mb-2'>
            {' '}
            {/* Increased margin */}
            {company.company}
          </h4>
          <h5 className='w-full text-center text-sm font-bold text-gray-500 truncate'>
            {company.tech_sector && Array.isArray(company.tech_sector)
              ? company.tech_sector.join(', ')
              : company.tech_sector}
          </h5>
          <h6 className='w-full text-center text-sm font-bold text-gray-500'>{company.finance_stage}</h6>
          <p className='text-center text-sm line-clamp-3 mt-2'>
            {' '}
            {/* Added top margin */}
            {company.description}
          </p>
        </div>
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
CompanyProfileCard.propTypes = {
  company: PropTypes.shape({
    id: PropTypes.number.isRequired,
    company: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    logo: PropTypes.string,
    tech_sector: PropTypes.arrayOf(PropTypes.string),
    finance_stage: PropTypes.string,
  }).isRequired,
};

export default CompanyProfileCard;
