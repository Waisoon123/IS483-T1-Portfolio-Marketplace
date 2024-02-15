import { motion } from 'framer-motion';
import threadohq_logo from '../assets/threadohq_logo.jpg';
import PropTypes from 'prop-types';

const CompanyProfileCardComponent = () => {
  const companies = [
    {
      name: 'Threado',
      description:
        'Threado is the command centre for your online community The single source of truth for your online community. Get insights. Automate tasks. Drive engagement. Join the waitlist now!',
      logo: threadohq_logo,
    },
    {
      name: 'Threado',
      description:
        'Threado is the command centre for your online community The single source of truth for your online community. Get insights. Automate tasks. Drive engagement. Join the waitlist now!',
      logo: threadohq_logo,
    },
    {
      name: 'Threado',
      description:
        'Threado is the command centre for your online community The single source of truth for your online community. Get insights. Automate tasks. Drive engagement. Join the waitlist now!',
      logo: threadohq_logo,
    },
  ];
  return (
    <div className='bg-primary py-12 grid grid-cols-3 gap-4 justify-start w-full'>
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
    <div className='mt-20 group relative mx-auto w-full max-w-sm overflow-hidden rounded-lg bg-white p-0.5 transition-all duration-500 hover:scale-[1.01] hover:bg-white'>
      <div className='relative z-10 flex flex-col items-start justify-start overflow-hidden rounded-[7px] bg-white p-8 transition-colors duration-500 group-hover:bg-secondary-100'>
        <div className='flex items-center mb-4'>
          <img src={company.logo} alt={company.name} className='relative z-10 mb-0 mt-0 mr-4 w-24' />
          <h4 className='relative z-10 mb-4 w-full text-3xl font-bold text-black'>{company.name}</h4>
        </div>
        <p className='relative z-10 text-black text-left'>{company.description}</p>
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
        className='absolute inset-0 z-0 bg-gradient-to-br from-indigo-400 via-indigo-300/0 to-indigo-400 opacity-0 transition-opacity duration-500 group-hover:opacity-100'
      />
    </div>
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
