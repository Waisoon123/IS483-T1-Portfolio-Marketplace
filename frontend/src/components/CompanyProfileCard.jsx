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
      <div className='relative z-10 flex flex-col items-center overflow-hidden bg-white p-10 m-1 transition-colors duration-500 group-hover:bg-secondary-100 lg:h-[350px] sm:h-[350px]'>
        <img src={threadohq_logo} alt={company.company} className='relative z-10 mb-4 mt-0 mr-0 w-36 sm:w-14 md:w-24' />
        <h4 className='relative z-10 w-full sm:text-md md:text-lg lg:text-xl font-bold text-black line-clamp-3 mb-4 text-center h-14'>
          {company.company}
        </h4>
        <p className='relative z-10 text-black lg:text-md md:text-md sm:text-md sm:line-clamp-3 lg:line-clamp-3 justify-center'>
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
