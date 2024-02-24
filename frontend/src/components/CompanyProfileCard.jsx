import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import threadohq_logo from '../assets/threadohq_logo.jpg';

const CompanyProfileCard = ({ company }) => {
  if (!company) {
    return <div>Loading...</div>;
  }
  // Use the company's logo if it exists, otherwise use the default logo
  return (
    <div className='mx-auto mt-8 group relative w-full max-w-xl overflow-hidden rounded-lg bg-white p-0.5 transition-all duration-500 hover:scale-[1.01] hover:bg-white'>
      <div className='relative z-10 flex flex-col items-start justify-start overflow-hidden rounded-[7px] bg-white p-10 transition-colors duration-500 group-hover:bg-secondary-100 sm:h-[200px] sm:w-[auto] md:h-[300px] md:w-auto lg:h-[300px] lg:w-auto'>
        <div className='flex items-center mb-4'>
          <img
            src={threadohq_logo}
            alt={company.company}
            className='relative z-10 mb-0 mt-0 mr-8 w-36 sm:w-12 md:w-24'
          />
          <h4 className='relative z-10 w-full sm:text-md md:text-lg lg:text-xl font-bold text-black line-clamp-3'>
            {company.company}
          </h4>
        </div>
        <p className='relative z-10 text-black text-left lg:text-xl md:text-lg sm:text-md sm:line-clamp-2 lg:line-clamp-3'>
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
CompanyProfileCard.propTypes = {
  company: PropTypes.shape({
    id: PropTypes.number.isRequired,
    company: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    logo: PropTypes.string,
  }).isRequired,
};

export default CompanyProfileCard;
