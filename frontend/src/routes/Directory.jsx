import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import CompanyProfileCardComponent from '../components/CompanyProfileCard';

const Directory = () => {
  return (
    <div className='bg-primary h-screen'>
      <div className='flex justify-between items-center'>
        <div className='px-28 py-4'>
          <h1 className='text-6xl mt-8 font-bold text-black'>Backed by Vertex</h1>
          <p className='mt-4 font-light text-black'>
            As of 2023, we have invested in over 300 companies. Here, you can search for Vertex companies by industry,
            region, company size and more.
          </p>
        </div>
        <button className='bg-secondary-200 hover:bg-secondary-300 py-3 px-4 rounded-l' data-testid='filter-btn'>
          <FontAwesomeIcon icon={faFilter} size='xl' className='text-white' />
        </button>
      </div>

      <div className=''>
        <CompanyProfileCardComponent />
      </div>
    </div>
  );
};

export default Directory;
